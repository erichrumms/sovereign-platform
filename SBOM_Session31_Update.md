# SBOM Session 31 Update
## PPBE Build Session 1 — Core Integration
**Date:** July 12, 2026 · **Base:** `b4d6ea8` · **Merge into:** SBOM Registry (current v1.27+)

---

## New Components

| Component | Path | Workspace | Tests |
|---|---|---|---|
| StrategicObjective entity | `sovereign-data/src/entities/strategic-objective.ts` | @sovereign/data | in `tests/ppbe-entities.test.ts` (29 total for D1) |
| ProgramRecord entity (extends Program) | `sovereign-data/src/entities/program-record.ts` | @sovereign/data | ″ |
| BudgetExhibit entity | `sovereign-data/src/entities/budget-exhibit.ts` | @sovereign/data | ″ |
| ObligationRecord entity | `sovereign-data/src/entities/obligation-record.ts` | @sovereign/data | ″ |
| EvaluationFinding entity | `sovereign-data/src/entities/evaluation-finding.ts` | @sovereign/data | ″ |
| DependencyMap entity | `sovereign-data/src/entities/dependency-map.ts` | @sovereign/data | ″ |
| PPBE entity tests | `sovereign-data/tests/ppbe-entities.test.ts` | @sovereign/data | 29 |
| PPBE workflow artifacts | `module-flowpath/src/ppbe-artifacts.ts` | @sovereign/module-flowpath | 17 (`tests/ppbe-artifacts.test.ts`) |
| ppbe-dependency-tracker agent | `module-flowpath/src/ppbe-dependency-tracker.ts` | @sovereign/module-flowpath | 14 (`tests/ppbe-dependency-tracker.test.ts`) |
| PPBE task/correspondence schemas | `module-nexus/src/ppbe-tasks.ts` | @sovereign/module-nexus | 13 (`tests/ppbe-tasks.test.ts`) |
| PPBE three-tier authorization | `module-vigil/src/ppbe-authorization.ts` | @sovereign/module-vigil | 17 (`tests/ppbe-authorization.test.ts`) |
| ppbe-ledger-monitor agent | `module-apex/src/ppbe-ledger-monitor.ts` | @sovereign/module-apex | 12 (`tests/ppbe-ledger-monitor.test.ts`) |

## Changed Components

| Component | Change |
|---|---|
| `sovereign-data/src/index.ts` | Six PPBE entity exports added; `SOVEREIGN_DATA_VERSION` 1.4.0 → **1.5.0** |
| `sovereign-security/sovereign_logger.py` | `APPROVED_EVENT_TYPES` 95 → **99** (PPBE_DECISION, PPBE_PHASE_TRANSITION, PPBE_ANOMALY, PPBE_EVALUATION_FINDING — Python-only, TRACER/ARC/TT precedent); `HUMAN_DECISION_EVENTS` now `{HUMAN_DECISION, PPBE_DECISION}`; `APPROVED_DECISION_TYPES` unchanged at 22 |
| `sovereign-security/test_sovereign_logger.py` | +9 Session 31 tests; 2 existing tests updated (sweep skip + count 95→99) |
| `module-apex/agents/ppbe-ledger-monitor/README.md` | Reserved-slot stub → implementation pointer |
| `module-flowpath/agents/ppbe-dependency-tracker/README.md` | Reserved-slot stub → implementation pointer |

## Agents

No registry change — 44 registered agents, verified by file count at session open.
Status change only: `ppbe-ledger-monitor` and `ppbe-dependency-tracker` advance
**Registered (Phase II) → Implemented (S31)**. Both DETERMINISTIC (no LLM, no
prompt, no sovereign-api-client) per the registry determination confirmed at
session open. `ppbe-coordination-assistant` remains Registered — moved to
Session 32 (Full Cycle) by Project Principal decision.

## Prompts

No change — 14 approved prompts. No prompt authored this session (both built
agents are deterministic).

## Shell Contract

**UNCHANGED at v1.16** — `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7`,
both copies verified identical at open and at close. No GD taken this session.

## Event-Type Ledger (Python `APPROVED_EVENT_TYPES`)

99 = 79 (shell-contract v1.16 SovereignEventType) + 5 Python-only ARIA
(3 TRACER + 2 ARC) + 11 Python-only Time & Travel + **4 Python-only PPBE (this
session)**. Decision types: 22 (unchanged, parity with v1.16 HumanDecisionType).

## Test Totals (fresh run, July 12, 2026)

| Suite | Count |
|---|---|
| JS/TS (13 workspaces with suites) | **1516** |
| Python (sovereign-security) | **174** |
| **Platform total** | **1690** |

Per-workspace JS: data 114 · api-client 174 · counsel 91 · scribe 187 · vigil 156 ·
lens 58 · cpmi 58 · agentos 89 · nexus 136 · apex 133 · flowpath 129 · aria 122 ·
e2e 69. Note for the merge: Session 30's "1414" reconciles as the JS-only count
(1414 + 102 new JS this session = 1516) — carry the JS/Python split explicitly
going forward.

`npm audit --omit=dev`: **0 production vulnerabilities**.

---
*SBOM_Session31_Update.md · Session 31 · July 12, 2026*
