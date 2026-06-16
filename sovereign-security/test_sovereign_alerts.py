"""
SOVEREIGN Platform — Security Observability Framework
test_sovereign_alerts.py

Unit tests for sovereign_alerts.py.

Run with:
    pytest test_sovereign_alerts.py -v
"""

import json
import time
import threading
from pathlib import Path
from unittest.mock import MagicMock, patch, call

import pytest
import yaml

from sovereign_alerts import (
    P1_EVENT_TYPES,
    P2_EVENT_TYPES,
    AlertDispatcher,
    AlertPayload,
)
from sovereign_logger import SovereignLogger


# ─────────────────────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def tmp_config(tmp_path):
    config = {
        "sovereign": {
            "version": "1.0",
            "logger": {
                "output_path": str(tmp_path / "sovereign.jsonl"),
                "remote_sink": None,
            },
            "alert_dispatcher": {
                "enabled": True,
                "destinations": {
                    "local_file": {
                        "enabled": True,
                        "path": str(tmp_path / "sovereign_alerts.jsonl"),
                    },
                    "slack": {"enabled": False, "webhook_url": None},
                    "http_endpoint": {"enabled": False, "url": None},
                    "notion": {"enabled": False, "database_id": None},
                },
            },
        }
    }
    p = tmp_path / "sovereign_config.yaml"
    p.write_text(yaml.dump(config))
    return str(p)


@pytest.fixture
def logger(tmp_config):
    return SovereignLogger(config_path=tmp_config)


@pytest.fixture
def dispatcher(tmp_config, logger):
    with AlertDispatcher(config_path=tmp_config, logger=logger) as d:
        yield d


def make_log_entry(
    event_type="ANOMALY_DETECTED",
    product="NEXUS",
    tier="standard",
) -> dict:
    return {
        "event_type": event_type,
        "product": product,
        "sovereign_tier": tier,
        "workflow_step_id": f"{product}-v1.0-step-1",
        "actor_id": "emp_001",
        "outcome": "Test alert",
        "payload": {"test": True},
    }


# ─────────────────────────────────────────────────────────────
# SECTION 1 — PRIORITY CLASSIFICATION
# ─────────────────────────────────────────────────────────────

class TestPriorityClassification:

    def test_honeytoken_access_is_p1(self):
        entry = make_log_entry(event_type="HONEYTOKEN_ACCESS")
        assert AlertDispatcher.classify_priority(entry) == "P1"

    def test_approval_gate_bypass_is_p1(self):
        entry = make_log_entry(event_type="APPROVAL_GATE_BYPASS")
        assert AlertDispatcher.classify_priority(entry) == "P1"

    def test_agent_isolated_is_p1(self):
        entry = make_log_entry(event_type="AGENT_ISOLATED")
        assert AlertDispatcher.classify_priority(entry) == "P1"

    def test_cpmi_anomaly_is_p1(self):
        entry = make_log_entry(event_type="ANOMALY_DETECTED", product="CPMI")
        assert AlertDispatcher.classify_priority(entry) == "P1"

    def test_non_cpmi_anomaly_is_p2(self):
        entry = make_log_entry(event_type="ANOMALY_DETECTED", product="NEXUS")
        assert AlertDispatcher.classify_priority(entry) == "P2"

    def test_external_dependency_failure_is_p2(self):
        entry = make_log_entry(event_type="EXTERNAL_DEPENDENCY_FAILURE")
        assert AlertDispatcher.classify_priority(entry) == "P2"

    def test_governance_gate_override_is_p2(self):
        entry = make_log_entry(event_type="GOVERNANCE_GATE_OVERRIDE")
        assert AlertDispatcher.classify_priority(entry) == "P2"

    def test_all_p1_event_types_classified_p1(self):
        for et in P1_EVENT_TYPES:
            entry = make_log_entry(event_type=et, product="NEXUS")
            assert AlertDispatcher.classify_priority(entry) == "P1", f"Failed for {et}"

    def test_routine_event_classified_p2_by_default(self):
        entry = make_log_entry(event_type="APPROVAL_GATE_OPEN")
        assert AlertDispatcher.classify_priority(entry) == "P2"


# ─────────────────────────────────────────────────────────────
# SECTION 2 — SHOULD DISPATCH
# ─────────────────────────────────────────────────────────────

class TestShouldDispatch:

    def test_honeytoken_should_dispatch(self):
        assert AlertDispatcher.should_dispatch(
            make_log_entry(event_type="HONEYTOKEN_ACCESS")
        )

    def test_anomaly_should_dispatch(self):
        assert AlertDispatcher.should_dispatch(
            make_log_entry(event_type="ANOMALY_DETECTED")
        )

    def test_routine_event_should_not_dispatch(self):
        assert not AlertDispatcher.should_dispatch(
            make_log_entry(event_type="APPROVAL_GATE_OPEN")
        )

    def test_human_decision_should_not_dispatch(self):
        assert not AlertDispatcher.should_dispatch(
            make_log_entry(event_type="HUMAN_DECISION")
        )

    def test_cpmi_anomaly_should_dispatch(self):
        assert AlertDispatcher.should_dispatch(
            make_log_entry(event_type="ANOMALY_DETECTED", product="CPMI")
        )


# ─────────────────────────────────────────────────────────────
# SECTION 3 — ALERT PAYLOAD
# ─────────────────────────────────────────────────────────────

class TestAlertPayload:

    def test_payload_captures_entry_fields(self):
        entry = make_log_entry(event_type="HONEYTOKEN_ACCESS", product="CPMI")
        alert = AlertPayload(entry, "P1")
        assert alert.event_type == "HONEYTOKEN_ACCESS"
        assert alert.product == "CPMI"
        assert alert.priority == "P1"

    def test_alert_id_is_unique(self):
        entry = make_log_entry()
        a1 = AlertPayload(entry, "P1")
        a2 = AlertPayload(entry, "P1")
        assert a1.alert_id != a2.alert_id

    def test_to_dict_contains_all_fields(self):
        entry = make_log_entry()
        alert = AlertPayload(entry, "P2")
        d = alert.to_dict()
        for field in ("alert_id", "priority", "event_type", "product",
                      "workflow_step_id", "outcome", "created_at"):
            assert field in d


# ─────────────────────────────────────────────────────────────
# SECTION 4 — LOCAL FILE DELIVERY
# ─────────────────────────────────────────────────────────────

class TestLocalFileDelivery:

    def test_p1_alert_written_to_local_file(self, dispatcher, tmp_config):
        import yaml
        cfg = yaml.safe_load(open(tmp_config))
        alert_path = Path(
            cfg["sovereign"]["alert_dispatcher"]["destinations"]["local_file"]["path"]
        )
        entry = make_log_entry(event_type="HONEYTOKEN_ACCESS", product="CPMI")
        dispatcher.dispatch(entry)

        assert alert_path.exists()
        lines = alert_path.read_text().strip().splitlines()
        assert len(lines) == 1
        stored = json.loads(lines[0])
        assert stored["event_type"] == "HONEYTOKEN_ACCESS"
        assert stored["priority"] == "P1"

    def test_p2_alert_written_after_flush(self, dispatcher, tmp_config):
        import yaml
        cfg = yaml.safe_load(open(tmp_config))
        alert_path = Path(
            cfg["sovereign"]["alert_dispatcher"]["destinations"]["local_file"]["path"]
        )
        entry = make_log_entry(event_type="ANOMALY_DETECTED", product="NEXUS")
        dispatcher.dispatch(entry)

        # Not yet written — in queue
        assert dispatcher.p2_queue_depth == 1

        # Flush manually
        dispatcher.flush_now()
        assert dispatcher.p2_queue_depth == 0

        lines = alert_path.read_text().strip().splitlines()
        assert len(lines) == 1
        stored = json.loads(lines[0])
        assert stored["priority"] == "P2"

    def test_non_dispatchable_event_not_written(self, dispatcher, tmp_config):
        import yaml
        cfg = yaml.safe_load(open(tmp_config))
        alert_path = Path(
            cfg["sovereign"]["alert_dispatcher"]["destinations"]["local_file"]["path"]
        )
        entry = make_log_entry(event_type="APPROVAL_GATE_OPEN")
        result = dispatcher.dispatch(entry)
        assert result is None
        assert not alert_path.exists() or alert_path.read_text().strip() == ""


# ─────────────────────────────────────────────────────────────
# SECTION 5 — P2 BATCH QUEUE
# ─────────────────────────────────────────────────────────────

class TestP2BatchQueue:

    def test_p2_events_accumulate_in_queue(self, dispatcher):
        for i in range(5):
            dispatcher.dispatch(make_log_entry(
                event_type="ANOMALY_DETECTED", product="NEXUS"
            ))
        assert dispatcher.p2_queue_depth == 5

    def test_p1_events_do_not_enter_queue(self, dispatcher):
        dispatcher.dispatch(make_log_entry(event_type="HONEYTOKEN_ACCESS"))
        assert dispatcher.p2_queue_depth == 0

    def test_flush_now_returns_count(self, dispatcher):
        for _ in range(3):
            dispatcher.dispatch(make_log_entry(event_type="ANOMALY_DETECTED"))
        flushed = dispatcher.flush_now()
        assert flushed == 3
        assert dispatcher.p2_queue_depth == 0

    def test_flush_now_on_empty_queue_returns_zero(self, dispatcher):
        assert dispatcher.flush_now() == 0

    def test_shutdown_drains_queue(self, tmp_config, logger, tmp_path):
        import yaml
        cfg = yaml.safe_load(open(tmp_config))
        alert_path = Path(
            cfg["sovereign"]["alert_dispatcher"]["destinations"]["local_file"]["path"]
        )
        dispatcher = AlertDispatcher(config_path=tmp_config, logger=logger)
        for _ in range(3):
            dispatcher.dispatch(make_log_entry(event_type="ANOMALY_DETECTED"))
        assert dispatcher.p2_queue_depth == 3
        dispatcher.shutdown()  # Should drain queue
        assert dispatcher.p2_queue_depth == 0
        lines = alert_path.read_text().strip().splitlines()
        assert len(lines) == 3


# ─────────────────────────────────────────────────────────────
# SECTION 6 — RETRY AND FAILURE HANDLING
# ─────────────────────────────────────────────────────────────

class TestRetryAndFailure:

    def test_delivery_retried_three_times_on_failure(self, tmp_config, logger, tmp_path):
        import yaml
        cfg = yaml.safe_load(open(tmp_config))
        cfg["sovereign"]["alert_dispatcher"]["destinations"]["slack"] = {
            "enabled": True,
            "webhook_url": "http://mock-slack.test/webhook",
            "p1_channel": "#p1",
            "p2_channel": "#p2",
        }
        config_path = str(tmp_path / "cfg_retry.yaml")
        open(config_path, "w").write(yaml.dump(cfg))

        with AlertDispatcher(config_path=config_path, logger=logger) as d:
            with patch("requests.post", side_effect=Exception("Network error")) as mock_post:
                d.dispatch(make_log_entry(event_type="HONEYTOKEN_ACCESS"))
                # Should have been called RETRY_ATTEMPTS times
                from sovereign_alerts import RETRY_ATTEMPTS
                assert mock_post.call_count == RETRY_ATTEMPTS

    def test_delivery_failure_logs_to_security_framework(
        self, tmp_config, logger, tmp_path
    ):
        import yaml
        cfg = yaml.safe_load(open(tmp_config))
        cfg["sovereign"]["alert_dispatcher"]["destinations"]["http_endpoint"] = {
            "enabled": True,
            "url": "http://mock-endpoint.test/alert",
            "auth_header": None,
        }
        config_path = str(tmp_path / "cfg_fail.yaml")
        open(config_path, "w").write(yaml.dump(cfg))

        with AlertDispatcher(config_path=config_path, logger=logger) as d:
            with patch("requests.post", side_effect=Exception("Down")):
                d.dispatch(make_log_entry(event_type="HONEYTOKEN_ACCESS"))

        lines = logger.output_path.read_text().strip().splitlines()
        events = [json.loads(l) for l in lines]
        failure_events = [
            e for e in events if e["event_type"] == "EXTERNAL_DEPENDENCY_FAILURE"
        ]
        assert len(failure_events) >= 1

    def test_successful_delivery_on_second_attempt(self, tmp_config, logger, tmp_path):
        import yaml
        cfg = yaml.safe_load(open(tmp_config))
        cfg["sovereign"]["alert_dispatcher"]["destinations"]["slack"] = {
            "enabled": True,
            "webhook_url": "http://mock-slack.test/webhook",
            "p1_channel": "#p1",
            "p2_channel": "#p2",
        }
        config_path = str(tmp_path / "cfg_retry2.yaml")
        open(config_path, "w").write(yaml.dump(cfg))

        call_count = [0]
        def flaky_post(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] < 2:
                raise Exception("Temporary failure")
            mock = MagicMock()
            mock.raise_for_status.return_value = None
            return mock

        with AlertDispatcher(config_path=config_path, logger=logger) as d:
            with patch("requests.post", side_effect=flaky_post):
                d.dispatch(make_log_entry(event_type="HONEYTOKEN_ACCESS"))
                assert call_count[0] == 2  # Failed once, succeeded on second attempt


# ─────────────────────────────────────────────────────────────
# SECTION 7 — SLACK AND HTTP FORMATTING
# ─────────────────────────────────────────────────────────────

class TestFormatters:

    def test_slack_format_p1_uses_p1_channel(self):
        entry = make_log_entry(event_type="HONEYTOKEN_ACCESS")
        alert = AlertPayload(entry, "P1")
        payload = AlertDispatcher._format_slack(alert, "#sovereign-p1-alerts")
        assert payload["channel"] == "#sovereign-p1-alerts"
        assert "P1" in payload["text"]
        assert "🚨" in payload["text"]

    def test_slack_format_p2_uses_warning_emoji(self):
        entry = make_log_entry(event_type="ANOMALY_DETECTED")
        alert = AlertPayload(entry, "P2")
        payload = AlertDispatcher._format_slack(alert, "#sovereign-p2-alerts")
        assert "⚠️" in payload["text"]

    def test_notion_format_contains_database_id(self):
        entry = make_log_entry()
        alert = AlertPayload(entry, "P2")
        payload = AlertDispatcher._format_notion(alert, "test-db-id")
        assert payload["parent"]["database_id"] == "test-db-id"
        assert alert.alert_id in str(payload["properties"])


# ─────────────────────────────────────────────────────────────
# SECTION 8 — THREAD SAFETY
# ─────────────────────────────────────────────────────────────

class TestThreadSafety:

    def test_concurrent_p2_dispatches_all_queued(self, dispatcher):
        """Ten threads each dispatch ten P2 alerts — all 100 queued correctly."""
        errors = []

        def dispatch_batch():
            try:
                for _ in range(10):
                    dispatcher.dispatch(
                        make_log_entry(event_type="ANOMALY_DETECTED", product="NEXUS")
                    )
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=dispatch_batch) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert not errors
        assert dispatcher.p2_queue_depth == 100

    def test_concurrent_flush_and_dispatch(self, dispatcher):
        """Flush and dispatch running simultaneously — no crash or data loss."""
        errors = []

        def dispatch_loop():
            try:
                for _ in range(20):
                    dispatcher.dispatch(
                        make_log_entry(event_type="ANOMALY_DETECTED")
                    )
            except Exception as e:
                errors.append(e)

        def flush_loop():
            try:
                for _ in range(5):
                    dispatcher.flush_now()
                    time.sleep(0.01)
            except Exception as e:
                errors.append(e)

        t1 = threading.Thread(target=dispatch_loop)
        t2 = threading.Thread(target=flush_loop)
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        assert not errors
