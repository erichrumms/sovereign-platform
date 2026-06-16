"""
SOVEREIGN Platform — Security Observability Framework
sovereign_alerts.py

The Alert Dispatcher routes security events to human operators. It is the
last mile of the Security Framework pipeline: Logger captures, Anomaly
Detector classifies, Alert Dispatcher delivers.

Design principles:
  - P1 immediate, P2 batched: not every event warrants the same urgency.
    HONEYTOKEN_ACCESS and CPMI anomalies wake someone up at 3am. Routine
    anomaly events batch into a 5-minute digest.
  - Multi-destination: Slack, Notion, HTTP webhook, and local file. The
    local file is always active — it is the fallback of last resort.
  - Retry with exponential backoff: 3 attempts at 1s, 2s, 4s intervals.
    Delivery failure is logged to the Security Framework Logger, never
    silently dropped.
  - Never raises in the hot path: a failed alert delivery must not crash
    the product that triggered it. Errors are logged and operations continue.
  - Flush on shutdown: a context manager interface ensures the P2 batch
    queue is drained before process exit.

Priority rules:
  P1 (immediate, no batching):
    - HONEYTOKEN_ACCESS — any product
    - APPROVAL_GATE_BYPASS — any product
    - Any ANOMALY_DETECTED event from CPMI (enhanced tier)
    - AGENT_ISOLATED — any product

  P2 (5-minute batch window):
    - All other ANOMALY_DETECTED events
    - EXTERNAL_DEPENDENCY_FAILURE (repeated failures)
    - GOVERNANCE_GATE_OVERRIDE

Version: 1.0
Date: June 2026
Stage: 1 — Built and tested. Destinations activated in Stage 2 when
           environment variables are configured.
"""

import json
import threading
import time
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

import requests
import structlog
import yaml

from sovereign_logger import SovereignLogger


# ─────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────

P1_EVENT_TYPES = frozenset({
    "HONEYTOKEN_ACCESS",
    "APPROVAL_GATE_BYPASS",
    "AGENT_ISOLATED",
})

P2_EVENT_TYPES = frozenset({
    "ANOMALY_DETECTED",
    "EXTERNAL_DEPENDENCY_FAILURE",
    "GOVERNANCE_GATE_OVERRIDE",
})

# CPMI anomaly events are always P1 regardless of event type
CPMI_ALWAYS_P1_PRODUCT = "CPMI"

P2_BATCH_WINDOW_SECONDS = 300   # 5 minutes
RETRY_ATTEMPTS = 3
RETRY_BACKOFF_BASE = 1          # seconds — doubles each attempt: 1, 2, 4

Priority = Literal["P1", "P2"]


# ─────────────────────────────────────────────────────────────
# STRUCTLOG CONFIGURATION
# Used for the dispatcher's own operational log — separate from
# the SOVEREIGN Logger which is the security audit trail.
# ─────────────────────────────────────────────────────────────

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)

_ops_log = structlog.get_logger("sovereign.alert-dispatcher")


# ─────────────────────────────────────────────────────────────
# ALERT PAYLOAD
# ─────────────────────────────────────────────────────────────

class AlertPayload:
    """
    A single alert ready for dispatch.
    Immutable once constructed.
    """
    __slots__ = (
        "alert_id", "priority", "event_type", "product",
        "workflow_step_id", "actor_id", "outcome", "payload",
        "sovereign_tier", "created_at",
    )

    def __init__(self, log_entry: dict, priority: Priority):
        import uuid
        self.alert_id = str(uuid.uuid4())
        self.priority = priority
        self.event_type = log_entry.get("event_type", "UNKNOWN")
        self.product = log_entry.get("product", "UNKNOWN")
        self.workflow_step_id = log_entry.get("workflow_step_id", "")
        self.actor_id = log_entry.get("actor_id", "")
        self.outcome = log_entry.get("outcome", "")
        self.payload = log_entry.get("payload", {})
        self.sovereign_tier = log_entry.get("sovereign_tier", "standard")
        self.created_at = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> dict:
        return {
            "alert_id": self.alert_id,
            "priority": self.priority,
            "event_type": self.event_type,
            "product": self.product,
            "workflow_step_id": self.workflow_step_id,
            "actor_id": self.actor_id,
            "outcome": self.outcome,
            "payload": self.payload,
            "sovereign_tier": self.sovereign_tier,
            "created_at": self.created_at,
        }


# ─────────────────────────────────────────────────────────────
# ALERT DISPATCHER
# ─────────────────────────────────────────────────────────────

class AlertDispatcher:
    """
    Routes SOVEREIGN security events to configured destinations.

    Thread-safe. The P2 batch queue is flushed by a background thread
    every P2_BATCH_WINDOW_SECONDS. Use as a context manager to ensure
    the queue is drained on shutdown:

        with AlertDispatcher(config_path=..., logger=...) as dispatcher:
            dispatcher.dispatch(log_entry)
    """

    def __init__(
        self,
        config_path: str = "sovereign_config.yaml",
        logger: Optional[SovereignLogger] = None,
    ):
        self._lock = threading.Lock()
        self._config = self._load_config(config_path)
        self._dispatcher_config = (
            self._config.get("sovereign", {})
            .get("alert_dispatcher", {})
        )
        self._destinations = self._dispatcher_config.get("destinations", {})
        self._logger = logger

        # P2 batch queue — thread-safe deque
        self._p2_queue: deque[AlertPayload] = deque()

        # Background flush thread for P2 batches
        self._flush_thread = threading.Thread(
            target=self._p2_flush_loop,
            daemon=True,
            name="sovereign-alert-p2-flush",
        )
        self._shutdown_event = threading.Event()
        self._flush_thread.start()

    # ── Context Manager ────────────────────────────────────────

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.shutdown()

    def shutdown(self):
        """Signal the flush thread to stop and drain the P2 queue."""
        self._shutdown_event.set()
        self._flush_thread.join(timeout=10)
        self._flush_p2_queue()  # Final drain

    # ── Configuration ──────────────────────────────────────────

    def _load_config(self, config_path: str) -> dict:
        path = Path(config_path)
        if not path.exists():
            import sys
            print(
                f"[SOVEREIGN AlertDispatcher] WARNING: config not found at {config_path}.",
                file=sys.stderr,
            )
            return {}
        with open(path, "r") as f:
            return yaml.safe_load(f) or {}

    # ── Priority Classification ────────────────────────────────

    @staticmethod
    def classify_priority(log_entry: dict) -> Priority:
        """
        Determine whether a log entry is P1 (immediate) or P2 (batched).

        Rules (in order — first match wins):
          1. CPMI product + ANOMALY_DETECTED → P1 (enhanced tier, no batching)
          2. Event type in P1_EVENT_TYPES → P1
          3. Event type in P2_EVENT_TYPES → P2
          4. All other events → not dispatched (return P2 as safe default,
             caller decides whether to dispatch)
        """
        event_type = log_entry.get("event_type", "")
        product = log_entry.get("product", "")

        # CPMI anomalies are always P1
        if product == CPMI_ALWAYS_P1_PRODUCT and event_type == "ANOMALY_DETECTED":
            return "P1"

        if event_type in P1_EVENT_TYPES:
            return "P1"

        return "P2"

    @staticmethod
    def should_dispatch(log_entry: dict) -> bool:
        """
        True if this log entry should trigger an alert dispatch.
        Not every Logger event warrants an alert.
        """
        event_type = log_entry.get("event_type", "")
        product = log_entry.get("product", "")
        return (
            event_type in P1_EVENT_TYPES
            or event_type in P2_EVENT_TYPES
            or (product == CPMI_ALWAYS_P1_PRODUCT and event_type == "ANOMALY_DETECTED")
        )

    # ── Public Dispatch API ────────────────────────────────────

    def dispatch(self, log_entry: dict) -> Optional[str]:
        """
        Dispatch a log entry as an alert if it warrants one.

        P1 entries are dispatched immediately in the calling thread.
        P2 entries are added to the batch queue.

        Returns the alert_id if dispatched, None if the entry does not
        warrant an alert.

        Never raises — delivery failures are logged to the Security
        Framework Logger and operations continue.
        """
        if not self.should_dispatch(log_entry):
            return None

        priority = self.classify_priority(log_entry)
        alert = AlertPayload(log_entry, priority)

        if priority == "P1":
            self._dispatch_p1(alert)
        else:
            with self._lock:
                self._p2_queue.append(alert)

        return alert.alert_id

    # ── P1 Immediate Dispatch ──────────────────────────────────

    def _dispatch_p1(self, alert: AlertPayload) -> None:
        """Deliver a P1 alert immediately to all configured destinations."""
        _ops_log.warning(
            "P1 alert dispatching",
            alert_id=alert.alert_id,
            event_type=alert.event_type,
            product=alert.product,
        )
        self._deliver_to_all(alert, batch=False)

    # ── P2 Batch Dispatch ──────────────────────────────────────

    def _p2_flush_loop(self) -> None:
        """Background thread: flush the P2 queue every batch window."""
        while not self._shutdown_event.is_set():
            self._shutdown_event.wait(timeout=P2_BATCH_WINDOW_SECONDS)
            self._flush_p2_queue()

    def _flush_p2_queue(self) -> None:
        """Drain the P2 queue and deliver all queued alerts."""
        with self._lock:
            if not self._p2_queue:
                return
            batch = list(self._p2_queue)
            self._p2_queue.clear()

        if batch:
            _ops_log.info("Flushing P2 batch", count=len(batch))
            for alert in batch:
                self._deliver_to_all(alert, batch=True)

    def flush_now(self) -> int:
        """
        Immediately flush the P2 queue.
        Returns the number of alerts flushed.
        Used for testing and incident response.
        """
        with self._lock:
            batch = list(self._p2_queue)
            self._p2_queue.clear()

        for alert in batch:
            self._deliver_to_all(alert, batch=True)

        return len(batch)

    @property
    def p2_queue_depth(self) -> int:
        """Number of P2 alerts waiting in the batch queue."""
        with self._lock:
            return len(self._p2_queue)

    # ── Delivery ───────────────────────────────────────────────

    def _deliver_to_all(self, alert: AlertPayload, batch: bool) -> None:
        """
        Attempt delivery to every configured destination.
        Local file is always written first — it is the fallback of last resort.
        """
        # Local file — always first, always active
        self._deliver_local(alert)

        # Slack
        slack_cfg = self._destinations.get("slack", {})
        if slack_cfg.get("enabled") and slack_cfg.get("webhook_url"):
            channel = (
                slack_cfg.get("p1_channel", "#sovereign-p1-alerts")
                if alert.priority == "P1"
                else slack_cfg.get("p2_channel", "#sovereign-p2-alerts")
            )
            self._deliver_with_retry(
                destination="slack",
                url=slack_cfg["webhook_url"],
                payload=self._format_slack(alert, channel),
                alert=alert,
            )

        # HTTP endpoint
        http_cfg = self._destinations.get("http_endpoint", {})
        if http_cfg.get("enabled") and http_cfg.get("url"):
            headers = {"Content-Type": "application/json"}
            if http_cfg.get("auth_header"):
                headers["Authorization"] = http_cfg["auth_header"]
            self._deliver_with_retry(
                destination="http",
                url=http_cfg["url"],
                payload=alert.to_dict(),
                alert=alert,
                headers=headers,
            )

        # Notion — POST to database endpoint
        notion_cfg = self._destinations.get("notion", {})
        if notion_cfg.get("enabled") and notion_cfg.get("database_id"):
            self._deliver_with_retry(
                destination="notion",
                url=f"https://api.notion.com/v1/pages",
                payload=self._format_notion(alert, notion_cfg["database_id"]),
                alert=alert,
                headers={
                    "Authorization": f"Bearer {notion_cfg.get('api_key', '')}",
                    "Notion-Version": notion_cfg.get("api_version", "2022-06-28"),
                    "Content-Type": "application/json",
                },
            )

    def _deliver_with_retry(
        self,
        destination: str,
        url: str,
        payload: dict,
        alert: AlertPayload,
        headers: Optional[dict] = None,
    ) -> bool:
        """
        POST payload to url with up to RETRY_ATTEMPTS attempts.
        Exponential backoff: 1s, 2s, 4s.
        Returns True on success, False after all retries exhausted.
        Logs failure to Security Framework Logger — never raises.
        """
        headers = headers or {"Content-Type": "application/json"}
        last_error = None

        for attempt in range(RETRY_ATTEMPTS):
            try:
                response = requests.post(
                    url,
                    json=payload,
                    headers=headers,
                    timeout=5,
                )
                response.raise_for_status()
                return True
            except requests.exceptions.Timeout:
                last_error = f"Timeout on attempt {attempt + 1}"
            except requests.exceptions.ConnectionError as e:
                last_error = f"Connection error on attempt {attempt + 1}: {e}"
            except requests.exceptions.HTTPError as e:
                last_error = f"HTTP {e.response.status_code} on attempt {attempt + 1}"
            except Exception as e:
                last_error = f"Unexpected error on attempt {attempt + 1}: {e}"

            if attempt < RETRY_ATTEMPTS - 1:
                time.sleep(RETRY_BACKOFF_BASE * (2 ** attempt))

        # All retries exhausted — log failure
        _ops_log.error(
            "Alert delivery failed after retries",
            destination=destination,
            alert_id=alert.alert_id,
            error=last_error,
        )
        if self._logger:
            self._logger.log(
                event_type="EXTERNAL_DEPENDENCY_FAILURE",
                workflow_step_id=alert.workflow_step_id or "ALERT-DISPATCH-v1.0-step-1",
                product=alert.product,
                actor_id="sovereign.alert-dispatcher",
                outcome=f"Alert delivery failed: {destination}",
                payload={
                    "alert_id": alert.alert_id,
                    "destination": destination,
                    "error": last_error,
                    "attempts": RETRY_ATTEMPTS,
                },
            )
        return False

    def _deliver_local(self, alert: AlertPayload) -> None:
        """
        Write alert to local JSONL file. Always called — never skipped.
        This is the fallback of last resort and the permanent local record.
        """
        local_cfg = self._destinations.get("local_file", {})
        local_path = Path(local_cfg.get("path", "./logs/sovereign_alerts.jsonl"))
        local_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(local_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(alert.to_dict(), separators=(",", ":")) + "\n")
        except Exception as e:
            # Absolute last resort — nothing left to do but note it
            _ops_log.error("Local alert file write failed", error=str(e))

    # ── Destination Formatters ─────────────────────────────────

    @staticmethod
    def _format_slack(alert: AlertPayload, channel: str) -> dict:
        """Format alert as a Slack webhook payload."""
        emoji = "🚨" if alert.priority == "P1" else "⚠️"
        return {
            "channel": channel,
            "text": (
                f"{emoji} *{alert.priority} SOVEREIGN Alert* — "
                f"`{alert.event_type}` on `{alert.product}`"
            ),
            "attachments": [
                {
                    "color": "#FF0000" if alert.priority == "P1" else "#FFA500",
                    "fields": [
                        {"title": "Alert ID", "value": alert.alert_id, "short": True},
                        {"title": "Product", "value": alert.product, "short": True},
                        {"title": "Event", "value": alert.event_type, "short": True},
                        {"title": "Actor", "value": alert.actor_id, "short": True},
                        {"title": "Workflow Step", "value": alert.workflow_step_id, "short": False},
                        {"title": "Outcome", "value": alert.outcome, "short": False},
                    ],
                    "ts": alert.created_at,
                }
            ],
        }

    @staticmethod
    def _format_notion(alert: AlertPayload, database_id: str) -> dict:
        """Format alert as a Notion page creation payload."""
        return {
            "parent": {"database_id": database_id},
            "properties": {
                "Alert ID": {"title": [{"text": {"content": alert.alert_id}}]},
                "Priority": {"select": {"name": alert.priority}},
                "Event Type": {"rich_text": [{"text": {"content": alert.event_type}}]},
                "Product": {"select": {"name": alert.product}},
                "Outcome": {"rich_text": [{"text": {"content": alert.outcome}}]},
                "Created At": {"date": {"start": alert.created_at}},
            },
        }
