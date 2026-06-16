"""
SOVEREIGN Platform — Security Observability Framework
test_sovereign_honeytoken.py

Unit tests for sovereign_honeytoken.py.

Run with:
    pytest test_sovereign_honeytoken.py -v
"""

import json
import threading
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
import yaml

from sovereign_honeytoken import (
    DuplicatePlacementError,
    HoneytokenManager,
    HoneytokenRecord,
    TokenNotFoundError,
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
            "honeytoken": {
                "enabled": True,
                "placement_registry_path": str(tmp_path / "honeytoken_registry.jsonl"),
                "webhook_url": None,
            },
            "alert_dispatcher": {
                "destinations": {
                    "local_file": {
                        "enabled": True,
                        "path": str(tmp_path / "sovereign_alerts.jsonl"),
                    }
                }
            }
        }
    }
    config_path = tmp_path / "sovereign_config.yaml"
    config_path.write_text(yaml.dump(config))
    return str(config_path)


@pytest.fixture
def logger(tmp_config):
    return SovereignLogger(config_path=tmp_config)


@pytest.fixture
def manager(tmp_config, logger):
    return HoneytokenManager(config_path=tmp_config, logger=logger)


# ─────────────────────────────────────────────────────────────
# SECTION 1 — TOKEN PLACEMENT
# ─────────────────────────────────────────────────────────────

class TestTokenPlacement:

    def test_place_token_returns_record(self, manager):
        record = manager.place_token(
            product="CPMI",
            data_store="WORLD_MODEL_DB",
            field_name="_sovereign_integrity_token",
            placed_by="emp_001",
        )
        assert isinstance(record, HoneytokenRecord)
        assert record.product == "CPMI"
        assert record.data_store == "WORLD_MODEL_DB"
        assert record.field_name == "_sovereign_integrity_token"
        assert record.placed_by == "emp_001"
        assert record.active is True
        assert record.access_count == 0

    def test_token_value_is_uuid4(self, manager):
        import uuid
        record = manager.place_token("NEXUS", "TASK_DB", "_sentinel", "emp_001")
        # Should parse as a valid UUID without raising
        parsed = uuid.UUID(record.token_value, version=4)
        assert str(parsed) == record.token_value

    def test_token_id_and_token_value_are_different(self, manager):
        record = manager.place_token("APEX", "PROGRAM_DB", "_sentinel", "emp_001")
        assert record.token_id != record.token_value

    def test_placed_token_appears_in_active_list(self, manager):
        record = manager.place_token("FLOWPATH", "VVR_RECORDS", "_sentinel", "emp_001")
        active = manager.list_active_tokens()
        assert any(t.token_id == record.token_id for t in active)

    def test_duplicate_placement_raises(self, manager):
        manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        with pytest.raises(DuplicatePlacementError):
            manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_002")

    def test_different_field_same_store_is_allowed(self, manager):
        manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel_a", "emp_001")
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel_b", "emp_001")
        assert record.active is True

    def test_placement_written_to_registry(self, manager, tmp_config):
        import yaml
        config = yaml.safe_load(open(tmp_config))
        registry_path = Path(config["sovereign"]["honeytoken"]["placement_registry_path"])
        record = manager.place_token("ARIA", "AUDIT_DB", "_sentinel", "emp_001")
        lines = registry_path.read_text().strip().splitlines()
        assert len(lines) == 1
        stored = json.loads(lines[0])
        assert stored["token_id"] == record.token_id
        assert stored["token_value"] == record.token_value


# ─────────────────────────────────────────────────────────────
# SECTION 2 — ACCESS DETECTION
# ─────────────────────────────────────────────────────────────

class TestAccessDetection:

    def test_check_access_returns_false_for_unknown_value(self, manager):
        result = manager.check_access(
            token_value="not-a-token",
            accessor_id="emp_001",
            workflow_step_id="NEXUS-ROUTE-v1.0-step-1",
        )
        assert result is False

    def test_check_access_returns_true_for_known_token(self, manager):
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        result = manager.check_access(
            token_value=record.token_value,
            accessor_id="emp_attacker",
            workflow_step_id="CPMI-GOVERN-v1.0-step-1",
        )
        assert result is True

    def test_access_increments_access_count(self, manager):
        record = manager.place_token("NEXUS", "TASK_DB", "_sentinel", "emp_001")
        manager.check_access(record.token_value, "emp_002", "NEXUS-v1.0-step-1")
        manager.check_access(record.token_value, "emp_002", "NEXUS-v1.0-step-2")
        # Retrieve from active list to check updated count
        active = manager.list_active_tokens()
        token = next(t for t in active if t.token_id == record.token_id)
        assert token.access_count == 2

    def test_access_records_accessor_id(self, manager):
        record = manager.place_token("APEX", "PROGRAM_DB", "_sentinel", "emp_001")
        manager.check_access(record.token_value, "emp_intruder", "APEX-v1.0-step-1")
        active = manager.list_active_tokens()
        token = next(t for t in active if t.token_id == record.token_id)
        assert token.last_accessor_id == "emp_intruder"

    def test_access_produces_logger_event(self, manager, logger):
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        manager.check_access(record.token_value, "emp_002", "CPMI-v1.0-step-1")
        # Read log and find HONEYTOKEN_ACCESS event
        lines = logger.output_path.read_text().strip().splitlines()
        events = [json.loads(l) for l in lines]
        honeytoken_events = [e for e in events if e["event_type"] == "HONEYTOKEN_ACCESS"]
        assert len(honeytoken_events) == 1
        evt = honeytoken_events[0]
        assert evt["product"] == "CPMI"
        assert evt["sovereign_tier"] == "enhanced"
        assert evt["payload"]["token_id"] == record.token_id

    def test_access_on_inactive_token_returns_false(self, manager):
        record = manager.place_token("NEXUS", "TASK_DB", "_sentinel", "emp_001")
        manager.decommission_token(record.token_value, "emp_001", "Test decommission")
        result = manager.check_access(record.token_value, "emp_002", "NEXUS-v1.0-step-1")
        assert result is False

    def test_access_writes_to_local_alert_file(self, manager, tmp_config):
        import yaml
        config = yaml.safe_load(open(tmp_config))
        alert_path = Path(
            config["sovereign"]["alert_dispatcher"]["destinations"]["local_file"]["path"]
        )
        record = manager.place_token("ARIA", "AUDIT_DB", "_sentinel", "emp_001")
        manager.check_access(record.token_value, "emp_002", "ARIA-v1.0-step-1")
        assert alert_path.exists()
        lines = alert_path.read_text().strip().splitlines()
        alert = json.loads(lines[0])
        assert alert["alert_type"] == "HONEYTOKEN_ACCESS"
        assert alert["priority"] == "P1"
        assert alert["token_id"] == record.token_id


# ─────────────────────────────────────────────────────────────
# SECTION 3 — DECOMMISSION
# ─────────────────────────────────────────────────────────────

class TestDecommission:

    def test_decommission_removes_from_active_index(self, manager):
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        manager.decommission_token(record.token_value, "emp_001", "Rotation")
        active = manager.list_active_tokens()
        assert not any(t.token_id == record.token_id for t in active)

    def test_decommission_nonexistent_token_raises(self, manager):
        with pytest.raises(TokenNotFoundError):
            manager.decommission_token("not-a-real-value", "emp_001", "Test")

    def test_after_decommission_new_token_can_be_placed(self, manager):
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        manager.decommission_token(record.token_value, "emp_001", "Rotation")
        new_record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        assert new_record.active is True
        assert new_record.token_value != record.token_value


# ─────────────────────────────────────────────────────────────
# SECTION 4 — REGISTRY PERSISTENCE
# ─────────────────────────────────────────────────────────────

class TestRegistryPersistence:

    def test_new_manager_loads_existing_tokens(self, tmp_config, logger):
        manager1 = HoneytokenManager(config_path=tmp_config, logger=logger)
        record = manager1.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")

        # New manager instance — should load from registry
        manager2 = HoneytokenManager(config_path=tmp_config, logger=logger)
        assert manager2.active_token_count == 1
        result = manager2.check_access(
            record.token_value, "emp_attacker", "CPMI-v1.0-step-1"
        )
        assert result is True

    def test_decommissioned_tokens_not_loaded_on_restart(self, tmp_config, logger):
        manager1 = HoneytokenManager(config_path=tmp_config, logger=logger)
        record = manager1.place_token("NEXUS", "TASK_DB", "_sentinel", "emp_001")
        manager1.decommission_token(record.token_value, "emp_001", "Rotation")

        manager2 = HoneytokenManager(config_path=tmp_config, logger=logger)
        assert manager2.active_token_count == 0


# ─────────────────────────────────────────────────────────────
# SECTION 5 — WEBHOOK DISPATCH
# ─────────────────────────────────────────────────────────────

class TestWebhookDispatch:

    def test_no_webhook_url_returns_false_not_raises(self, manager):
        # Default fixture has no webhook URL — should not raise
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        result = manager.check_access(record.token_value, "emp_002", "CPMI-v1.0-step-1")
        assert result is True  # Token was triggered despite no webhook

    def test_webhook_delivered_on_success(self, tmp_config, logger):
        import yaml
        config = yaml.safe_load(open(tmp_config))
        config["sovereign"]["honeytoken"]["webhook_url"] = "http://mock-webhook.test/alert"
        config_path = tmp_config.replace(".yaml", "_webhook.yaml")
        open(config_path, "w").write(yaml.dump(config))

        manager = HoneytokenManager(config_path=config_path, logger=logger)
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")

        with patch("requests.post") as mock_post:
            mock_response = MagicMock()
            mock_response.raise_for_status.return_value = None
            mock_post.return_value = mock_response
            result = manager.check_access(
                record.token_value, "emp_002", "CPMI-v1.0-step-1"
            )
            assert result is True
            assert mock_post.called
            call_payload = mock_post.call_args[1]["json"]
            assert call_payload["alert_type"] == "HONEYTOKEN_ACCESS"
            assert call_payload["priority"] == "P1"

    def test_webhook_failure_does_not_suppress_logger_event(self, tmp_config, logger):
        import yaml
        config = yaml.safe_load(open(tmp_config))
        config["sovereign"]["honeytoken"]["webhook_url"] = "http://mock-webhook.test/alert"
        config_path = tmp_config.replace(".yaml", "_webhook_fail.yaml")
        open(config_path, "w").write(yaml.dump(config))

        manager = HoneytokenManager(config_path=config_path, logger=logger)
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")

        with patch("requests.post", side_effect=Exception("Network error")):
            result = manager.check_access(
                record.token_value, "emp_002", "CPMI-v1.0-step-1"
            )
            assert result is True  # Token was still triggered

        # Logger event must exist despite webhook failure
        lines = logger.output_path.read_text().strip().splitlines()
        events = [json.loads(l) for l in lines]
        assert any(e["event_type"] == "HONEYTOKEN_ACCESS" for e in events)
        # And a dependency failure event should also be present
        assert any(e["event_type"] == "EXTERNAL_DEPENDENCY_FAILURE" for e in events)


# ─────────────────────────────────────────────────────────────
# SECTION 6 — THREAD SAFETY
# ─────────────────────────────────────────────────────────────

class TestThreadSafety:

    def test_concurrent_access_checks_all_detected(self, manager):
        """
        Ten threads simultaneously access the same token.
        All ten should be detected; access_count should be exactly 10.
        """
        record = manager.place_token("CPMI", "WORLD_MODEL_DB", "_sentinel", "emp_001")
        results = []

        def access():
            r = manager.check_access(
                record.token_value,
                "emp_attacker",
                "CPMI-v1.0-step-1",
            )
            results.append(r)

        threads = [threading.Thread(target=access) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert all(results), "All accesses should be detected"
        active = manager.list_active_tokens()
        token = next(t for t in active if t.token_id == record.token_id)
        assert token.access_count == 10

    def test_concurrent_placements_no_duplicates(self, manager):
        """
        Ten threads try to place tokens at different locations simultaneously.
        All should succeed without data corruption.
        """
        errors = []

        def place(i):
            try:
                manager.place_token(
                    "NEXUS", f"STORE_{i}", "_sentinel", "emp_001"
                )
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=place, args=(i,)) for i in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert not errors
        assert manager.active_token_count == 10
