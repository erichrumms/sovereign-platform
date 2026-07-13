# SBOM Session 32 Update
## PPBE Build Session 2 — Full Cycle · July 12–13, 2026

**Base:** SBOM_Registry_v1.27_MERGED.md plus the unmerged Session 27–31 update files (cumulative merge backlog now spans Sessions 27–32 — Governance Agent action, needs the current cumulative registry content).

---

## New Components (exact paths — gather scripts must use these, Lesson 11)

### Prompts (all PENDING — synthetic-data use only until approved)
| Path | Agent | Status |
|---|---|---|
| `ppbe/prompts/evidence_synthesis_system.md` | ppbe-evidence-synthesizer | PENDING v1.0 |
| `ppbe/prompts/scenario_analysis_system.md` | ppbe-scenario-analyst | PENDING v1.0 |
| `ppbe/prompts/exhibit_drafting_system.md` | ppbe-exhibit-drafter | PENDING v1.0 |
| `ppbe/prompts/coordination_system.md` | ppbe-coordination-assistant | PENDING v1.0 |
| `ppbe/prompts/CHANGELOG.md` | — (registry of record for ppbe/prompts/) | — |

### TypeScript source
| Path | Content |
|---|---|
| `module-apex/src/ppbe-evidence-synthesizer.ts` | D1 engine + validators + acceptance record |
| `module-apex/src/ppbe-scenario-analyst.ts` | D2 engine + validators + COUNSEL framing |
| `module-apex/src/ppbe-dashboard.ts` | D5 metric computations |
| `module-apex/src/PPBEDashboard.tsx` | D5 dashboard component (replaces the stub) |
| `module-scribe/src/ppbe-exhibit-contract.ts` | D3 modes, validators, DOUBLE export gate |
| `module-scribe/src/ppbe-exhibit-engine.ts` | D3 live→cache→static engine |
| `module-nexus/src/ppbe-coordination-assistant.ts` | D4 monitoring + human close + digest engine |
| `module-aria/src/ppbe-aria.ts` | D6 CLEAR PPBE rules + TRACER PPBE chain |
| `module-counsel/src/ppbe-decisions.ts` | D7 four PPBE decision types |

### Python
| Path | Content |
|---|---|
| `sovereign-security/ppbe_emitter.py` | D8 — the four Python-only PPBE event emitters |

### Tests
`module-apex/tests/ppbe-evidence-synthesizer.test.ts` · `module-apex/tests/ppbe-scenario-analyst.test.ts` · `module-apex/tests/ppbe-dashboard.test.ts` · `module-apex/tests/PPBEDashboard.test.tsx` · `module-scribe/tests/ppbe-exhibit-drafter.test.ts` · `module-nexus/tests/ppbe-coordination-assistant.test.ts` · `module-aria/tests/ppbe-aria.test.ts` · `module-counsel/tests/ppbe-decisions.test.ts` · `sovereign-security/test_ppbe_emitter.py` · `e2e/tests/ppbe-full-cycle.test.tsx` (PRELIMINARY V&V)

## Changed Components
| Path | Change |
|---|---|
| `module-apex/src/index.ts` | +2 AgentCards (evidence-synthesizer, scenario-analyst); stub reference removed |
| `module-apex/src/ApexApp.tsx` | Execution tab renders PPBEDashboard (spec §17.2 Commitment 1 executed) |
| `module-scribe/src/index.ts` | +1 AgentCard (exhibit-drafter) |
| `module-nexus/src/index.ts` | +1 AgentCard (coordination-assistant) |
| `module-aria/src/arc-engine.ts` | DEPENDENCY_MODEL +8 PPBE dependent items |
| `module-aria/src/tracer-engine.ts` | `finalizeChain` exported (reuse, no duplicate) |
| Tests: apex index/ApexApp, nexus index | Card-list assertions extended |

## Removed Components
| Path | Reason |
|---|---|
| `module-apex/src/ExecutionMonitoringStub.tsx` | Replaced by PPBEDashboard exactly as its own header scheduled (Session 17, spec §17.2 Commitment 1) |

---

## Registry Facts (fresh counts, July 13, 2026)

- **Shell contract:** v1.16, UNCHANGED —
  `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` (both copies verified identical at open and close).
- **Registered agents: 44** (counted from Agent_Identity_Standard.md). PPBE workflow layer now **6 of 6 Implemented** (ledger-monitor + dependency-tracker in S31; evidence-synthesizer, scenario-analyst, exhibit-drafter, coordination-assistant in S32). AgentCards: APEX 7 · SCRIBE 5 · NEXUS 3 (each PPBE card under its HOST product — the workflow layer is not a SovereignProduct).
- **Prompts: 20 registered = 15 APPROVED + 5 PENDING** (PR-SCRIBE-004 + the four PPBE prompts). This three-number form supersedes both the stale "14" and the ambiguous "16" — see handoff §A.4 for the reconciliation and the header-drift housekeeping item.
- **Python logger taxonomy: UNCHANGED this session** — APPROVED_EVENT_TYPES 99, APPROVED_DECISION_TYPES 22, HUMAN_DECISION_EVENTS {HUMAN_DECISION, PPBE_DECISION}. `ppbe_emitter.py` emits within the existing taxonomy; no governance change.
- **Test counts: JS/TS 1636 + Python 190 = 1826** (split stated per standing rule; per-workspace figures in handoff §C).
- **`npm audit --omit=dev`: 0 vulnerabilities.** `tsc --noEmit` clean in all 14 workspaces.

---
*SBOM_Session32_Update.md · Session 32 · July 13, 2026*
