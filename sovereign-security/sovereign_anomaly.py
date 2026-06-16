"""
SOVEREIGN Platform — Security Observability Framework
sovereign_anomaly.py

The Anomaly Detector watches the Logger event stream for each product and
flags behavior that deviates from that product's baseline. It uses
scikit-learn's IsolationForest — an unsupervised algorithm well-suited to
anomaly detection in security contexts because it does not require labeled
attack data to train.

Design principles:
  - Per-product baselines: NEXUS and CPMI are different systems with
    different normal behavior. A shared model would flag CPMI's legitimate
    high-frequency governance events as anomalous against NEXUS's baseline.
  - CPMI enhanced tier: contamination parameter multiplied by 0.7 — the
    detector is 30% more sensitive for CPMI. This is architectural, not
    configurable per-call.
  - Minimum 100 entries before activation: IsolationForest needs a
    meaningful baseline to avoid false positives in early operation.
  - False positive target: <2% in production (contamination=0.02 default).
  - Scheduled retraining: weekly via external scheduler (launchd/cron).
    Manual trigger available for incident response.
  - On anomaly: fires ANOMALY_DETECTED Logger event + calls Alert Dispatcher.
  - Model persistence: joblib serialization to disk — survives restarts
    without retraining.

Feature vector (per log entry):
  - Hour of day (0–23): captures time-of-day patterns
  - Day of week (0–6): weekday vs. weekend baseline differences
  - Event type encoded (int): frequency distribution of event types
  - Tier encoded (0=standard, 1=enhanced): monitoring level
  - Is human decision (0/1): ratio of human vs. agent events
  - Is agent event (0/1): agent activity patterns
  - Payload size (bytes): unusually large payloads may indicate exfiltration

Version: 1.0
Date: June 2026
Stage: 1 — Built and tested. Activated in Stage 2 when
           sovereign_config.yaml anomaly_detector.enabled = true.
"""

import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import yaml
from sklearn.ensemble import IsolationForest

from sovereign_logger import SovereignLogger


# ─────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────

DEFAULT_CONTAMINATION = 0.02        # <2% false positive target
CPMI_CONTAMINATION_MULTIPLIER = 0.7 # 30% tighter for CPMI — architectural
MIN_ENTRIES_BEFORE_ACTIVATION = 100 # Per product
MODEL_VERSION = "1.0"

# Canonical event type → integer encoding (stable — never reorder)
EVENT_TYPE_ENCODING = {
    "APPROVAL_GATE_OPEN": 0,
    "APPROVAL_GATE_CLOSE": 1,
    "HUMAN_DECISION": 2,
    "AGENT_STEP_START": 3,
    "AGENT_STEP_COMPLETE": 4,
    "ANOMALY_DETECTED": 5,
    "GOVERNANCE_GATE_1": 6,
    "GOVERNANCE_GATE_2": 7,
    "GOVERNANCE_GATE_3": 8,
    "GOVERNANCE_GATE_4": 9,
    "REASONING_STEP_START": 10,
    "REASONING_STEP_COMPLETE": 11,
    "HONEYTOKEN_ACCESS": 12,
    "FALLBACK_ACTIVATED": 13,
    "EXTERNAL_DEPENDENCY_FAILURE": 14,
    "AGENT_ISOLATED": 15,
    "GOVERNANCE_GATE_OVERRIDE": 16,
    "AGUI_EVENT": 17,
    "MCP_TOOL_CALL": 18,
    "A2A_TASK_HANDOFF": 19,
    "A2A_TASK_FAILURE": 20,
}
UNKNOWN_EVENT_ENCODING = 99  # Any future event type not yet in encoding


# ─────────────────────────────────────────────────────────────
# EXCEPTIONS
# ─────────────────────────────────────────────────────────────

class AnomalyDetectorError(Exception):
    """Base exception for Anomaly Detector errors."""

class InsufficientDataError(AnomalyDetectorError):
    """Fewer than MIN_ENTRIES_BEFORE_ACTIVATION entries available for training."""

class ModelNotTrainedError(AnomalyDetectorError):
    """Score called before model has been trained for this product."""


# ─────────────────────────────────────────────────────────────
# ANOMALY DETECTOR
# ─────────────────────────────────────────────────────────────

class AnomalyDetector:
    """
    Per-product anomaly detector for the SOVEREIGN Security Observability Framework.

    One AnomalyDetector instance manages models for all products. Each product
    gets its own IsolationForest — baselines are never shared across products.

    Usage:
        detector = AnomalyDetector(config_path="sovereign_config.yaml", logger=logger)

        # Train on existing log entries for a product
        detector.train(product="CPMI", log_entries=entries)

        # Score a new entry — returns (is_anomalous: bool, score: float)
        is_anomalous, score = detector.score(product="CPMI", entry=new_entry)

        # Retrain all products from their log files
        detector.retrain_all(log_path="./logs/sovereign.jsonl")
    """

    def __init__(
        self,
        config_path: str = "sovereign_config.yaml",
        logger: Optional[SovereignLogger] = None,
        model_dir: str = "./models/anomaly",
    ):
        self._lock = threading.Lock()
        self._config = self._load_config(config_path)
        self._detector_config = (
            self._config.get("sovereign", {}).get("anomaly_detector", {})
        )
        self._logger = logger
        self._model_dir = Path(model_dir)
        self._model_dir.mkdir(parents=True, exist_ok=True)

        # Per-product models: product_id → IsolationForest
        self._models: dict[str, IsolationForest] = {}
        # Per-product entry counts seen during training
        self._entry_counts: dict[str, int] = {}

        self._load_persisted_models()

    # ── Configuration ──────────────────────────────────────────

    def _load_config(self, config_path: str) -> dict:
        path = Path(config_path)
        if not path.exists():
            import sys
            print(
                f"[SOVEREIGN AnomalyDetector] WARNING: config not found at {config_path}.",
                file=sys.stderr,
            )
            return {}
        with open(path, "r") as f:
            return yaml.safe_load(f) or {}

    def _contamination_for(self, product: str) -> float:
        """
        Return the contamination parameter for a product's IsolationForest.
        CPMI always gets 0.7× the base contamination — architectural, not configurable.
        """
        base = DEFAULT_CONTAMINATION
        if product == "CPMI":
            return base * CPMI_CONTAMINATION_MULTIPLIER
        return base

    def _min_entries_for(self, product: str) -> int:
        return self._detector_config.get(
            "min_entries_before_activation", MIN_ENTRIES_BEFORE_ACTIVATION
        )

    # ── Feature Extraction ─────────────────────────────────────

    @staticmethod
    def extract_features(entry: dict) -> np.ndarray:
        """
        Extract a fixed-length numeric feature vector from a log entry.

        Feature vector (7 dimensions):
          [0] hour_of_day       0–23
          [1] day_of_week       0–6
          [2] event_type_enc    integer from EVENT_TYPE_ENCODING
          [3] tier_enc          0=standard, 1=enhanced
          [4] is_human_decision 0 or 1
          [5] is_agent_event    0 or 1
          [6] payload_size      len(json.dumps(payload))

        Returns a (1, 7) numpy array suitable for sklearn.
        """
        try:
            ts = datetime.fromisoformat(entry.get("timestamp", ""))
            hour = ts.hour
            dow = ts.weekday()
        except (ValueError, TypeError):
            hour = 0
            dow = 0

        event_type = entry.get("event_type", "")
        event_enc = EVENT_TYPE_ENCODING.get(event_type, UNKNOWN_EVENT_ENCODING)

        tier = entry.get("sovereign_tier", "standard")
        tier_enc = 1 if tier == "enhanced" else 0

        is_human = 1 if event_type == "HUMAN_DECISION" else 0
        is_agent = 1 if event_type in ("AGENT_STEP_START", "AGENT_STEP_COMPLETE") else 0

        try:
            payload_size = len(json.dumps(entry.get("payload", {})))
        except (TypeError, ValueError):
            payload_size = 0

        return np.array([[hour, dow, event_enc, tier_enc, is_human, is_agent, payload_size]],
                        dtype=float)

    # ── Training ───────────────────────────────────────────────

    def train(self, product: str, log_entries: list[dict]) -> dict:
        """
        Train an IsolationForest model for the given product.

        Requires at least MIN_ENTRIES_BEFORE_ACTIVATION entries.
        Raises InsufficientDataError if below threshold.

        Returns a training result dict with entry_count, contamination, and status.
        """
        min_entries = self._min_entries_for(product)
        if len(log_entries) < min_entries:
            raise InsufficientDataError(
                f"Product '{product}' has {len(log_entries)} log entries. "
                f"Minimum required before activation: {min_entries}. "
                "Continue operating without anomaly detection until threshold is reached."
            )

        # Build feature matrix
        features = np.vstack([self.extract_features(e) for e in log_entries])
        contamination = self._contamination_for(product)

        model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
        )

        with self._lock:
            model.fit(features)
            self._models[product] = model
            self._entry_counts[product] = len(log_entries)
            self._persist_model(product, model)

        result = {
            "product": product,
            "status": "TRAINED",
            "entry_count": len(log_entries),
            "contamination": contamination,
            "model_version": MODEL_VERSION,
            "trained_at": datetime.now(timezone.utc).isoformat(),
        }

        if self._logger:
            self._logger.log(
                event_type="AGENT_STEP_COMPLETE",
                workflow_step_id=f"SOVEREIGN-ANOMALY-TRAIN-v1.0-step-1",
                product=product,
                actor_id="sovereign.anomaly-detector",
                outcome=f"Model trained on {len(log_entries)} entries",
                payload=result,
                agent_id="sovereign.anomaly-detector",
                agent_class="Monitoring",
            )

        return result

    def train_from_log_file(self, product: str, log_path: str) -> dict:
        """
        Train a product's model by reading its entries from a JSONL log file.
        Filters the log to only entries for the specified product.
        """
        path = Path(log_path)
        if not path.exists():
            raise AnomalyDetectorError(f"Log file not found: {log_path}")

        entries = []
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if entry.get("product") == product:
                        entries.append(entry)
                except json.JSONDecodeError:
                    continue

        return self.train(product=product, log_entries=entries)

    def retrain_all(self, log_path: str) -> dict[str, dict]:
        """
        Retrain models for all products that have sufficient log entries.
        Products below the minimum threshold are skipped with a status record.
        Used for scheduled weekly retraining.
        """
        from sovereign_logger import APPROVED_PRODUCTS
        results = {}
        for product in APPROVED_PRODUCTS:
            try:
                result = self.train_from_log_file(product=product, log_path=log_path)
                results[product] = result
            except InsufficientDataError as e:
                results[product] = {
                    "product": product,
                    "status": "SKIPPED_INSUFFICIENT_DATA",
                    "reason": str(e),
                }
            except Exception as e:
                results[product] = {
                    "product": product,
                    "status": "ERROR",
                    "reason": str(e),
                }
        return results

    # ── Scoring ────────────────────────────────────────────────

    def score(self, product: str, entry: dict) -> tuple[bool, float]:
        """
        Score a single log entry against the product's trained model.

        Returns (is_anomalous: bool, anomaly_score: float).
        The anomaly_score is the IsolationForest decision_function output —
        negative values indicate anomalies; the more negative, the more anomalous.
        We normalize to a 0.0–1.0 scale for consistency: 1.0 = most anomalous.

        Raises ModelNotTrainedError if no model exists for this product.
        Does not raise on CPMI — always scores, never silently skips.
        """
        with self._lock:
            model = self._models.get(product)

        if model is None:
            raise ModelNotTrainedError(
                f"No trained model for product '{product}'. "
                "Train the model before scoring."
            )

        features = self.extract_features(entry)
        # IsolationForest.predict: 1 = normal, -1 = anomaly
        prediction = model.predict(features)[0]
        # decision_function: higher = more normal, lower = more anomalous
        raw_score = model.decision_function(features)[0]

        is_anomalous = bool(prediction == -1)  # Cast np.bool_ to Python bool

        # Normalize raw score to 0.0–1.0 where 1.0 = most anomalous
        # Raw scores are typically in [-0.5, 0.5] range for IsolationForest
        # We clip and invert so higher = more anomalous
        normalized = float(np.clip(0.5 - raw_score, 0.0, 1.0))

        return is_anomalous, normalized

    def score_and_alert(
        self,
        product: str,
        entry: dict,
        workflow_step_id: str,
    ) -> tuple[bool, float]:
        """
        Score an entry and fire a ANOMALY_DETECTED Logger event if anomalous.

        This is the primary method called by the Security Framework pipeline.
        score() is the lower-level method for testing and direct use.

        Returns (is_anomalous: bool, normalized_score: float).
        If product has no trained model, returns (False, 0.0) — never raises
        in the hot path. ModelNotTrainedError is only raised by score() directly.
        """
        try:
            is_anomalous, score = self.score(product=product, entry=entry)
        except ModelNotTrainedError:
            return False, 0.0

        if is_anomalous and self._logger:
            self._logger.log(
                event_type="ANOMALY_DETECTED",
                workflow_step_id=workflow_step_id,
                product=product,
                sovereign_tier="enhanced" if product == "CPMI" else "standard",
                actor_id="sovereign.anomaly-detector",
                outcome=f"Anomaly detected — score {score:.4f}",
                payload={
                    "anomaly_score": score,
                    "triggering_event_type": entry.get("event_type"),
                    "triggering_actor_id": entry.get("actor_id"),
                    "triggering_workflow_step_id": entry.get("workflow_step_id"),
                },
                agent_id="sovereign.anomaly-detector",
                agent_class="Monitoring",
            )

        return is_anomalous, score

    # ── Model Persistence ──────────────────────────────────────

    def _model_path(self, product: str) -> Path:
        return self._model_dir / f"anomaly_{product.lower()}_v{MODEL_VERSION}.joblib"

    def _persist_model(self, product: str, model: IsolationForest) -> None:
        """Serialize model to disk with joblib. Called under lock."""
        joblib.dump(model, self._model_path(product))

    def _load_persisted_models(self) -> None:
        """Load any previously trained models from disk on startup."""
        from sovereign_logger import APPROVED_PRODUCTS
        for product in APPROVED_PRODUCTS:
            path = self._model_path(product)
            if path.exists():
                try:
                    model = joblib.load(path)
                    self._models[product] = model
                except Exception:
                    # Corrupt model file — skip, will retrain on next cycle
                    pass

    # ── Introspection ──────────────────────────────────────────

    def is_trained(self, product: str) -> bool:
        """True if a trained model exists for this product."""
        with self._lock:
            return product in self._models

    def trained_products(self) -> list[str]:
        """List of products with trained models."""
        with self._lock:
            return list(self._models.keys())

    def entry_count(self, product: str) -> int:
        """Number of entries the model was trained on."""
        with self._lock:
            return self._entry_counts.get(product, 0)
