"""
SOVEREIGN Platform — Security Observability Framework
test_sovereign_logger.py

Unit tests for sovereign_logger.py.

Run with:
    pip install pytest pyyaml --break-system-packages
    pytest test_sovereign_logger.py -v

All tests use temporary directories — no permanent files are created.
"""

import json
import os
import tempfile
import threading
from pathlib import Path
from typing import Generator

import pytest
import yaml

from sovereign_logger import (
    APPROVED_AGENT_CLASSES,
    APPROVED_DECISION_TYPES,
    APPROVED_EVENT_TYPES,
    APPROVED_PRODUCTS,
    InvalidFieldValueError,
    MissingRequiredFieldError,
    SovereignLogger,
)


# ─────────────────────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def tmp_config(tmp_path: Path) -> str:
    """Write a minimal sovereign_config.yaml and return its path."""
    config = {
        "sovereign": {
            "version": "1.0",
            "logger": {
                "output_path": str(tmp_path / "sovereign.jsonl"),
                "remote_sink": None,
            }
        }
    }
    config_path = tmp_path / "sovereign_config.yaml"
    config_path.write_text(yaml.dump(config))
    return str(config_path)


@pytest.fixture
def logger(tmp_config: str) -> SovereignLogger:
    """A fresh logger instance backed by a temp file."""
    return SovereignLogger(config_path=tmp_config)


def minimal_event(override: dict = None) -> dict:
    """Returns the minimal valid event kwargs."""
    base = {
        "event_type": "APPROVAL_GATE_OPEN",
        "workflow_step_id": "NEXUS-ROUTE-v1.0-step-1",
        "product": "NEXUS",
        "actor_id": "emp_001",
        "outcome": "Gate opened",
        "payload": {"test": True},
    }
    if override:
        base.update(override)
    return base


# ─────────────────────────────────────────────────────────────
# SECTION 1 — REQUIRED FIELD ENFORCEMENT
# ─────────────────────────────────────────────────────────────

class TestRequiredFields:

    def test_missing_event_type_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="event_type"):
            logger.log(**minimal_event({"event_type": ""}))

    def test_none_event_type_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="event_type"):
            logger.log(**minimal_event({"event_type": None}))

    def test_missing_workflow_step_id_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="workflow_step_id"):
            logger.log(**minimal_event({"workflow_step_id": ""}))

    def test_missing_product_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="product"):
            logger.log(**minimal_event({"product": ""}))

    def test_missing_actor_id_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="actor_id"):
            logger.log(**minimal_event({"actor_id": ""}))

    def test_missing_outcome_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="outcome"):
            logger.log(**minimal_event({"outcome": ""}))


# ─────────────────────────────────────────────────────────────
# SECTION 2 — TAXONOMY ENFORCEMENT
# ─────────────────────────────────────────────────────────────

class TestTaxonomyEnforcement:

    def test_unapproved_event_type_raises(self, logger):
        with pytest.raises(InvalidFieldValueError, match="event_type"):
            logger.log(**minimal_event({"event_type": "MADE_UP_EVENT"}))

    def test_unapproved_product_raises(self, logger):
        with pytest.raises(InvalidFieldValueError, match="product"):
            logger.log(**minimal_event({"product": "FAKE_PRODUCT"}))

    def test_all_approved_event_types_accepted(self, logger):
        for event_type in APPROVED_EVENT_TYPES:
            # Agent events need extra fields — test separately
            if event_type in ("AGENT_STEP_START", "AGENT_STEP_COMPLETE"):
                continue
            if event_type == "HUMAN_DECISION":
                continue
            entry = logger.log(**minimal_event({"event_type": event_type}))
            assert entry["event_type"] == event_type

    def test_all_approved_products_accepted(self, logger):
        for product in APPROVED_PRODUCTS:
            entry = logger.log(**minimal_event({"product": product}))
            assert entry["product"] == product


# ─────────────────────────────────────────────────────────────
# SECTION 3 — HUMAN DECISION VALIDATION
# ─────────────────────────────────────────────────────────────

class TestHumanDecisionEvents:

    def human_decision_event(self, override: dict = None) -> dict:
        base = minimal_event({
            "event_type": "HUMAN_DECISION",
            "decision_type": "HUMAN_APPROVAL",
            "actor": "human",
            "actor_name": "Jane Smith",
        })
        if override:
            base.update(override)
        return base

    def test_valid_human_decision_accepted(self, logger):
        entry = logger.log(**self.human_decision_event())
        assert entry["event_type"] == "HUMAN_DECISION"
        assert entry["decision_type"] == "HUMAN_APPROVAL"
        assert entry["actor"] == "human"
        assert entry["actor_name"] == "Jane Smith"

    def test_human_decision_missing_decision_type_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="decision_type"):
            logger.log(**self.human_decision_event({"decision_type": None}))

    def test_human_decision_missing_actor_name_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="actor_name"):
            logger.log(**self.human_decision_event({"actor_name": None}))

    def test_human_decision_wrong_actor_value_raises(self, logger):
        with pytest.raises(InvalidFieldValueError, match="actor must be 'human'"):
            logger.log(**self.human_decision_event({"actor": "agent"}))

    def test_unapproved_decision_type_raises(self, logger):
        with pytest.raises(InvalidFieldValueError, match="decision_type"):
            logger.log(**self.human_decision_event({"decision_type": "MADE_UP_DECISION"}))

    def test_all_approved_decision_types_accepted(self, logger):
        for dt in APPROVED_DECISION_TYPES:
            entry = logger.log(**self.human_decision_event({"decision_type": dt}))
            assert entry["decision_type"] == dt


# ─────────────────────────────────────────────────────────────
# SECTION 4 — AGENT EVENT VALIDATION
# ─────────────────────────────────────────────────────────────

class TestAgentEvents:

    def agent_event(self, event_type="AGENT_STEP_START", override: dict = None) -> dict:
        base = minimal_event({
            "event_type": event_type,
            "agent_id": "flowpath.coordinator",
            "agent_class": "Analytical",
        })
        if override:
            base.update(override)
        return base

    def test_valid_agent_step_start_accepted(self, logger):
        entry = logger.log(**self.agent_event("AGENT_STEP_START"))
        assert entry["agent_id"] == "flowpath.coordinator"
        assert entry["agent_class"] == "Analytical"

    def test_agent_step_missing_agent_id_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="agent_id"):
            logger.log(**self.agent_event(override={"agent_id": None}))

    def test_agent_step_missing_agent_class_raises(self, logger):
        with pytest.raises(MissingRequiredFieldError, match="agent_class"):
            logger.log(**self.agent_event(override={"agent_class": None}))

    def test_unapproved_agent_class_raises(self, logger):
        with pytest.raises(InvalidFieldValueError, match="agent_class"):
            logger.log(**self.agent_event(override={"agent_class": "Rogue"}))

    def test_all_approved_agent_classes_accepted(self, logger):
        for ac in APPROVED_AGENT_CLASSES:
            entry = logger.log(**self.agent_event(override={"agent_class": ac}))
            assert entry["agent_class"] == ac

    def test_agent_step_complete_with_deployment_feedback(self, logger):
        feedback = {
            "automatability_score": 0.82,
            "human_time_seconds": 120,
            "agent_time_seconds": 4,
            "override_occurred": False,
        }
        entry = logger.log(**self.agent_event(
            "AGENT_STEP_COMPLETE",
            override={"deployment_feedback": feedback}
        ))
        assert entry["deployment_feedback"]["automatability_score"] == 0.82

    def test_deployment_feedback_missing_required_key_raises(self, logger):
        bad_feedback = {
            "automatability_score": 0.5,
            # missing: human_time_seconds, agent_time_seconds, override_occurred
        }
        with pytest.raises(MissingRequiredFieldError, match="deployment_feedback"):
            logger.log(**self.agent_event(
                "AGENT_STEP_COMPLETE",
                override={"deployment_feedback": bad_feedback}
            ))


# ─────────────────────────────────────────────────────────────
# SECTION 5 — CPMI ENHANCED TIER
# ─────────────────────────────────────────────────────────────

class TestCPMIEnhancedTier:

    def test_cpmi_always_gets_enhanced_tier(self, logger):
        entry = logger.log(**minimal_event({
            "product": "CPMI",
            "sovereign_tier": "standard",  # Caller requests standard — must be overridden
        }))
        assert entry["sovereign_tier"] == "enhanced"

    def test_cpmi_enhanced_even_when_tier_not_specified(self, logger):
        entry = logger.log(**minimal_event({"product": "CPMI"}))
        assert entry["sovereign_tier"] == "enhanced"

    def test_non_cpmi_standard_tier_by_default(self, logger):
        entry = logger.log(**minimal_event({"product": "NEXUS"}))
        assert entry["sovereign_tier"] == "standard"

    def test_non_cpmi_can_request_enhanced(self, logger):
        entry = logger.log(**minimal_event({
            "product": "NEXUS",
            "sovereign_tier": "enhanced",
        }))
        assert entry["sovereign_tier"] == "enhanced"


# ─────────────────────────────────────────────────────────────
# SECTION 6 — CHAIN INTEGRITY
# ─────────────────────────────────────────────────────────────

class TestChainIntegrity:

    def test_first_entry_has_checksum(self, logger):
        entry = logger.log(**minimal_event())
        assert "checksum" in entry
        assert len(entry["checksum"]) == 64  # SHA-256 hex digest

    def test_consecutive_entries_have_different_checksums(self, logger):
        e1 = logger.log(**minimal_event({"workflow_step_id": "NEXUS-v1.0-step-1"}))
        e2 = logger.log(**minimal_event({"workflow_step_id": "NEXUS-v1.0-step-2"}))
        assert e1["checksum"] != e2["checksum"]

    def test_verify_chain_empty_log(self, logger):
        result = logger.verify_chain()
        assert result["valid"] is True
        assert result["entries_checked"] == 0

    def test_verify_chain_single_entry(self, logger):
        logger.log(**minimal_event())
        result = logger.verify_chain()
        assert result["valid"] is True
        assert result["entries_checked"] == 1

    def test_verify_chain_multiple_entries(self, logger):
        for i in range(5):
            logger.log(**minimal_event({
                "workflow_step_id": f"NEXUS-v1.0-step-{i}"
            }))
        result = logger.verify_chain()
        assert result["valid"] is True
        assert result["entries_checked"] == 5

    def test_verify_chain_detects_tampering(self, logger):
        logger.log(**minimal_event({"workflow_step_id": "NEXUS-v1.0-step-1"}))
        logger.log(**minimal_event({"workflow_step_id": "NEXUS-v1.0-step-2"}))

        # Tamper with the first entry
        lines = logger.output_path.read_text().splitlines()
        first = json.loads(lines[0])
        first["outcome"] = "TAMPERED"  # Mutate without recomputing checksum
        lines[0] = json.dumps(first)
        logger.output_path.write_text("\n".join(lines) + "\n")

        result = logger.verify_chain()
        assert result["valid"] is False
        assert result["first_violation"] == 1

    def test_new_logger_resumes_chain_from_existing_file(self, tmp_config):
        """A new logger instance picks up the chain from an existing file."""
        logger1 = SovereignLogger(config_path=tmp_config)
        e1 = logger1.log(**minimal_event({"workflow_step_id": "step-1"}))

        logger2 = SovereignLogger(config_path=tmp_config)
        e2 = logger2.log(**minimal_event({"workflow_step_id": "step-2"}))

        # Chain from logger2's perspective should be valid
        result = logger2.verify_chain()
        assert result["valid"] is True
        assert result["entries_checked"] == 2
        assert e1["checksum"] != e2["checksum"]


# ─────────────────────────────────────────────────────────────
# SECTION 7 — OUTPUT FORMAT
# ─────────────────────────────────────────────────────────────

class TestOutputFormat:

    def test_output_is_valid_jsonl(self, logger):
        for i in range(3):
            logger.log(**minimal_event({"workflow_step_id": f"NEXUS-v1.0-step-{i}"}))
        lines = logger.output_path.read_text().strip().splitlines()
        assert len(lines) == 3
        for line in lines:
            parsed = json.loads(line)  # Raises if invalid JSON
            assert "timestamp" in parsed
            assert "checksum" in parsed

    def test_timestamp_is_utc_iso8601(self, logger):
        entry = logger.log(**minimal_event())
        # Should be parseable as ISO-8601 with timezone
        from datetime import datetime
        dt = datetime.fromisoformat(entry["timestamp"])
        assert dt.tzinfo is not None

    def test_payload_preserved_exactly(self, logger):
        payload = {"program_id": "PRG-001", "flags": [1, 2, 3], "nested": {"a": "b"}}
        entry = logger.log(**minimal_event({"payload": payload}))
        assert entry["payload"] == payload

    def test_conditional_fields_absent_when_not_provided(self, logger):
        entry = logger.log(**minimal_event())
        assert "decision_type" not in entry
        assert "actor" not in entry
        assert "actor_name" not in entry
        assert "agent_id" not in entry
        assert "agent_class" not in entry
        assert "deployment_feedback" not in entry


# ─────────────────────────────────────────────────────────────
# SECTION 8 — THREAD SAFETY
# ─────────────────────────────────────────────────────────────

class TestThreadSafety:

    def test_concurrent_writes_produce_valid_chain(self, logger):
        """
        Ten threads each write ten entries. The resulting chain must be valid.
        This tests that the lock prevents checksum corruption under concurrency.
        """
        errors = []

        def write_entries(thread_id: int):
            try:
                for i in range(10):
                    logger.log(**minimal_event({
                        "workflow_step_id": f"NEXUS-v1.0-t{thread_id}-step-{i}",
                        "actor_id": f"emp_{thread_id:03d}",
                    }))
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=write_entries, args=(t,)) for t in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert not errors, f"Thread errors: {errors}"

        result = logger.verify_chain()
        assert result["valid"] is True
        assert result["entries_checked"] == 100


# ─────────────────────────────────────────────────────────────
# SECTION 9 — CONFIGURATION FALLBACK
# ─────────────────────────────────────────────────────────────

class TestConfigurationFallback:

    def test_missing_config_file_uses_defaults(self, tmp_path):
        """Logger must not crash if sovereign_config.yaml does not exist."""
        logger = SovereignLogger(config_path=str(tmp_path / "nonexistent.yaml"))
        # Should be able to log after graceful fallback
        entry = logger.log(**minimal_event())
        assert entry["event_type"] == "APPROVAL_GATE_OPEN"

    def test_remote_sink_not_configured_by_default(self, logger):
        assert logger.remote_sink_configured is False


# ─────────────────────────────────────────────────────────────
# GD-20 — ARIA Suite / CLEAR taxonomy (shell-contract v1.15, June 29, 2026)
# Four ARIA CLEAR event types + COMPLIANCE_CERTIFICATION, synced per Constraint #11.
# ─────────────────────────────────────────────────────────────

ARIA_CLEAR_EVENT_TYPES = [
    "ARIA_COMPLIANCE_CHECK",
    "ARIA_CERTIFICATION_ISSUED",
    "ARIA_VIOLATION_FLAGGED",
    "ARIA_CALENDAR_ALERT",
]


class TestGD20AriaClearTaxonomy:

    def test_four_aria_event_types_in_taxonomy(self):
        for event_type in ARIA_CLEAR_EVENT_TYPES:
            assert event_type in APPROVED_EVENT_TYPES

    def test_compliance_certification_in_decision_taxonomy(self):
        assert "COMPLIANCE_CERTIFICATION" in APPROVED_DECISION_TYPES

    def test_taxonomy_counts_advanced_to_v1_15(self):
        # v1.14 held 75 event types and 18 decision types; GD-20 advances them to 79 / 19.
        assert len(APPROVED_EVENT_TYPES) == 79
        assert len(APPROVED_DECISION_TYPES) == 19

    def test_aria_event_types_accepted_under_product_aria(self, logger):
        for event_type in ARIA_CLEAR_EVENT_TYPES:
            entry = logger.log(**minimal_event({
                "event_type": event_type,
                "product": "ARIA",
                "workflow_step_id": "aria-clear-DOC-1",
                "actor_id": "aria.rules-engine",
                "outcome": "compliant",
            }))
            assert entry["event_type"] == event_type
            assert entry["product"] == "ARIA"

    def test_compliance_certification_accepted_on_human_decision(self, logger):
        entry = logger.log(**minimal_event({
            "event_type": "HUMAN_DECISION",
            "product": "ARIA",
            "workflow_step_id": "aria-clear-DOC-1",
            "decision_type": "COMPLIANCE_CERTIFICATION",
            "actor": "human",
            "actor_name": "Robin Compliance",
            "outcome": "certified",
        }))
        assert entry["decision_type"] == "COMPLIANCE_CERTIFICATION"
        assert entry["actor"] == "human"

    def test_no_regression_existing_types_still_present(self):
        # A spot check that the GD-20 additions did not displace prior taxonomy members.
        for prior in ["HUMAN_DECISION", "VOICE_CAPTURE_COMPLETED", "FLOWPATH_SESSION_STARTED",
                      "APEX_REPORT_GENERATED"]:
            assert prior in APPROVED_EVENT_TYPES
        for prior in ["HUMAN_APPROVAL", "REPORT_ATTESTATION", "VALIDATION_SIGN_OFF"]:
            assert prior in APPROVED_DECISION_TYPES
