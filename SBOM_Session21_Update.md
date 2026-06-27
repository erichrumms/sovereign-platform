# SBOM — Session 21 Update
## SOVEREIGN Platform · June 26, 2026 · Stage 5b Completion (FLOWPATH)
## Merge into SBOM_Registry (next version) — Build Agent update file

**Classification:** Pre-Decisional · Internal Working Document
**Prepared by:** Claude Code at Session 21 close.
**Prior registry:** SBOM_Registry v1.21 (through Session 20).

---

## 1 — Shell Contract

| Field | Value |
|---|---|
| Version | **v1.13 — UNCHANGED this session** |
| SHA-256 (both copies, identical) | `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569` |
| Retired (v1.12) | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` |
| GD this session | **None** — no shell-contract change (Constraint #8) |
| Constraint #11 propagation | Not required (no contract change) |

---

## 2 — Test Totals

| Suite | Count |
|---|---|
| sovereign-data | 43 |
| sovereign-api-client | 174 |
| module-counsel | 91 |
| module-scribe | 122 |
| module-vigil | 113 |
| module-lens | 58 |
| module-cpmi | 58 |
| module-agentos | 86 |
| module-nexus | 52 |
| module-apex | 97 |
| **module-flowpath** | **93** (was 52, +41) |
| e2e | 6 |
| **JS total** | **993** |
| Python (sovereign-security) | 142 |
| **Platform total** | **1135** (was 1094) |

Production vulnerabilities (`npm audit --omit=dev`): **0**.

---

## 3 — New Components This Session

| Component | Path | Purpose |
|---|---|---|
| Workflow Artifact Review (Screen 3) | `module-flowpath/src/WorkflowArtifactReview.tsx` | Human approval surface; WORKFLOW_APPROVAL + FLOWPATH_ARTIFACT_APPROVED; plain-prose review (Gap 5), white-card (D1) |
| CPMI-VRS benchmark scenarios | `module-flowpath/src/benchmark-scenarios.ts` | Three deterministic schema-valid, gate-passing WorkflowArtifact bundles (A/B/C) for Gate 2 (D2) |
| FLOWPATH CPMI-VRS Gates tab | `module-flowpath/src/GateRunnerPanel.tsx` | Four-gate certification runner; Gate 3 = GATE_3_ATTESTATION, Gate 4 = HUMAN_APPROVAL; mirrors APEX (D3) |
| FlowpathApp tabs | `module-flowpath/src/FlowpathApp.tsx` | Added "Artifact Review" + "CPMI-VRS Certification" tabs; cross-tab navigation |
| SessionManager approved status | `module-flowpath/src/SessionManager.tsx` | Reflects approved sessions ("committed to the workflow registry") |
| Tests | `module-flowpath/tests/{WorkflowArtifactReview,benchmark-scenarios,GateRunnerPanel}.test.*` | +41 tests |

**Item 57 (D4): no component added — DEFERRED to GD-19.** Resolution requires a shell-contract change
(ninth `taskSurface` export, Constraint #7), unauthorized this session. See Session 21 Handoff §F.

---

## 4 — Agent Registry

**21 agents — unchanged.** No agent registered or modified this session. Verified directly in
`Agent_Identity_Standard.md` at session open (six FLOWPATH agents present; total 21).

---

## 5 — Approved Prompts

**14 approved — unchanged.** PR-FLOWPATH-001..004 remain APPROVED. No new prompt this session
(benchmark scenarios are deterministic, no LLM call; the Gates tab makes no LLM call).

---

## 6 — Logger Event / Decision-Type Usage (no taxonomy change)

No new `SovereignEventType` or `HumanDecisionType`. Event/decision types exercised by new code (all
pre-existing in v1.13 / Python `APPROVED_EVENT_TYPES` 75 / `APPROVED_DECISION_TYPES` 18):
`FLOWPATH_ARTIFACT_APPROVED`, `FLOWPATH_GATE_FAILED`, `FLOWPATH_SESSION_STARTED`,
`FLOWPATH_ARTIFACT_PRODUCED`, `FLOWPATH_SESSION_COMPLETE`; decision types `WORKFLOW_APPROVAL`,
`GATE_3_ATTESTATION`, `HUMAN_APPROVAL`.

---

## 7 — Commits

| Item | Commit |
|---|---|
| D1 — Screen 3 Workflow Artifact Review | `f065f93` |
| D2 — CPMI-VRS benchmark scenarios A/B/C | `e69d27f` |
| D3 — CPMI-VRS Gates tab | `49a7d04` |
| Close — handoff + SBOM | (this commit) |

---

## 8 — Stage Status

FLOWPATH (Stage 5b): Screens 1/2/3/4 + CPMI-VRS Gates tab + benchmark scenarios A/B/C **COMPLETE**.
Walkthrough C ready. Item 57 (NEXUS→AgentOS UI convergence) deferred to GD-19 / Session 22+ — not a
Walkthrough C blocker (audit trail already correct).

---

*SBOM Session 21 Update · June 26, 2026 · Pre-Decisional · Internal Working Document*
