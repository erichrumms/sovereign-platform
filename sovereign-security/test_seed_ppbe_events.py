"""
test_seed_ppbe_events.py — Session 33 (D2).
The synthetic PPBE trail seeder: correct event counts per type, a valid chain,
re-runnability (truncate-and-reseed, chain still valid), the narrative
invariants (ECHO's held 4→5 transition is ABSENT; the ceiling-exceeded P1 is
present; 13 of 20 findings feed planning), and full SYNTH- prefixing.
"""

import json
from pathlib import Path

import pytest
import yaml

from seed_ppbe_events import seed


@pytest.fixture
def seed_config(tmp_path: Path) -> str:
    config = {
        "sovereign": {
            "version": "1.0",
            "logger": {
                "output_path": str(tmp_path / "ppbe_synthetic_seed.jsonl"),
                "remote_sink": None,
            },
        }
    }
    config_path = tmp_path / "ppbe_seed_config.yaml"
    config_path.write_text(yaml.dump(config))
    return str(config_path)


def read_events(output_path: str) -> list[dict]:
    lines = Path(output_path).read_text().strip().splitlines()
    return [json.loads(line) for line in lines]


class TestSeeding:
    def test_seeds_the_designed_counts_with_a_valid_chain(self, seed_config):
        summary = seed(seed_config)
        assert summary["chain_valid"] is True
        assert summary["phase_transitions"] == 5
        assert summary["decisions"] == 5
        assert summary["anomalies"] == 10
        assert summary["evaluation_findings"] == 20
        assert summary["total"] == 40
        assert summary["entries_checked"] == 40

        events = read_events(summary["output_path"])
        by_type = {}
        for e in events:
            by_type[e["event_type"]] = by_type.get(e["event_type"], 0) + 1
        assert by_type == {
            "PPBE_PHASE_TRANSITION": 5,
            "PPBE_DECISION": 5,
            "PPBE_ANOMALY": 10,
            "PPBE_EVALUATION_FINDING": 20,
        }

    def test_is_re_runnable_without_growing_or_breaking_the_chain(self, seed_config):
        first = seed(seed_config)
        second = seed(seed_config)
        assert second["chain_valid"] is True
        assert second["entries_checked"] == first["entries_checked"] == 40

    def test_echo_held_transition_is_absent_and_the_ada_example_is_present(self, seed_config):
        events = read_events(seed(seed_config)["output_path"])
        transitions = [e for e in events if e["event_type"] == "PPBE_PHASE_TRANSITION"]
        # ECHO's 4→5 is held (failed handoff / overdue coordination item) — no event exists for it.
        assert not any("SYNTH-PRG-ECHO" in e["workflow_step_id"] for e in transitions)
        # ALPHA walked 1→2 through 4→5; DELTA completed 4→5.
        assert sum("SYNTH-PRG-ALPHA" in e["workflow_step_id"] for e in transitions) == 4
        assert sum("SYNTH-PRG-DELTA" in e["workflow_step_id"] for e in transitions) == 1

        anomalies = [e for e in events if e["event_type"] == "PPBE_ANOMALY"]
        exceeded = [a for a in anomalies if a["payload"]["anomaly_type"] == "CEILING_EXCEEDED"]
        assert len(exceeded) == 1
        assert exceeded[0]["payload"]["program_id"] == "SYNTH-PRG-ECHO"
        assert exceeded[0]["payload"]["severity"] == "P1"
        # Every previously-unfired rule family appears in the trail.
        types_present = {a["payload"]["anomaly_type"] for a in anomalies}
        assert {"CEILING_PROXIMITY", "CEILING_EXCEEDED", "FEEDBACK_LOOP_STALL",
                "TIMING_VIOLATION", "QUALITY_THRESHOLD_FAILURE"} <= types_present

    def test_findings_measure_the_learning_loop_and_every_id_is_synthetic(self, seed_config):
        events = read_events(seed(seed_config)["output_path"])
        findings = [e for e in events if e["event_type"] == "PPBE_EVALUATION_FINDING"]
        assert len(findings) == 20
        assert sum(1 for f in findings if f["payload"]["feeds_planning_cycle"]) == 13
        for e in events:
            payload_ids = [v for k, v in e["payload"].items()
                           if isinstance(v, str) and ("program" in k or "finding" in k or "objective" in k or "document" in k)]
            for value in payload_ids:
                assert value.startswith("SYNTH-"), f"non-synthetic id {value!r} in seeded trail"

    def test_human_decisions_carry_the_enforced_triad(self, seed_config):
        events = read_events(seed(seed_config)["output_path"])
        for e in events:
            if e["event_type"] == "PPBE_DECISION":
                assert e["decision_type"] == "HUMAN_APPROVAL"
                assert e["actor"] == "human"
                assert e["actor_name"].startswith("SYNTH")
            assert e["workflow_step_id"].strip() != ""
