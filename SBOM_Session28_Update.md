# SOVEREIGN Platform — SBOM Session 28 Update
## Time & Travel Phase II — GD-21, drafters live, VIGIL/NEXUS wiring, end-to-end test

**Date:** July 12, 2026
**Session:** 28
**Merge basis for:** SBOM Registry v1.29 (supersedes v1.28)
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Shell Contract — CHANGED (GD-21, pre-authorized)

| Version | GD | SHA-256 | Status |
|---|---|---|---|
| v1.15 | GD-20 | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` | Superseded — verified at session open |
| **v1.16** | **GD-21** | `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` | **CURRENT — both synced copies verified identical at close** |

GD-21 (TT-GD, decided and pre-authorized in the Session 28 opening prompt §3, per
docs/17 §12/§13): exactly three `HumanDecisionType` members added — `TRAVEL_APPROVAL`,
`TIME_CORRECTION_SENT`, `ESCALATION_AUTHORIZED`. Constraint #11 propagation completed:
both shell-contract copies, `sovereign-data/src/shared-types.ts` (type +
`HUMAN_DECISION_TYPES` const, 19 → 22) + its test, Python `APPROVED_DECISION_TYPES`
(19 → 22) + tests. No other shell-contract change; Constraint #7 holds at ten exports.

**Naming note (carried into the v1.16 changelog):** `TRAVEL_APPROVAL` (GD-21, the
decision *act* on a routed request) is distinct from the v1.0
`TRAVEL_APPROVED`/`TRAVEL_DENIED`/`TRAVEL_ESCALATED` *outcome* members, which are
untouched. The Constraint #2 tension between the two taxonomies is documented in the
Session 28 Handoff §5.1 — resolution deferred to governance.

## 2. Governance Decisions Applied

- **GD-21 (TT-GD)** — executed this session as pre-authorized (§1 above).
- **TT-PRODUCT-GD — Option 2** — TT alerts attribute `sourceProduct` to the HOST
  product. **Confirmed value: `"VIGIL"`** (the alert-raising path is
  `tt.escalation-monitor`, hosted in module-vigil). No `TIME_TRAVEL` value added.
  Closes the Session 27 Hard Stop §6.1.

## 3. New Components

| Component | Path | Notes |
|---|---|---|
| TT travel drafting prompt (runtime copy) | `module-scribe/src/prompts/tt-travel-drafting-system.prompt.ts` | synced from `tt/prompts/travel_drafting_system.md` v1.0 APPROVED |
| TT time drafting prompt (runtime copy) | `module-scribe/src/prompts/tt-time-drafting-system.prompt.ts` | synced from `tt/prompts/time_drafting_system.md` v1.0 APPROVED |
| TT drafting contract | `module-scribe/src/tt-draft-contract.ts` | 4 travel + 5 time communication types (time reuses canonical `CorrectionCommunicationType`); structural system-invisibility validator |
| TT drafting engine | `module-scribe/src/tt-draft-engine.ts` | pure three-tier fallback, mirrors draft-engine.ts; no send path |
| useTTDraft hook | `module-scribe/src/useTTDraft.ts` | createSovereignClient only; AGENT_STEP_START/COMPLETE + FALLBACK_ACTIVATED |
| Manager review interface | `module-scribe/src/TTManagerReview.tsx` | docs/17 §14 split-panel; send structurally disabled pending VIGIL authorization; GD-21 TIME_CORRECTION_SENT |
| TT→VIGIL alert routing adapter | `module-vigil/src/tt-alert-routing.ts` | TT-PRODUCT-GD Option 2; ARIA adapter precedent; approval-queue entry for Tier B |
| VIGIL escalation gate | `module-vigil/src/tt-escalation-gate.ts` | structural docs/17 §7 Tier B gate; GD-21 ESCALATION_AUTHORIZED |
| NEXUS travel queue wiring | `module-nexus/src/tt-travel-queue.ts` | audit bracketing around the Session 27 engines; GD-21 TRAVEL_APPROVAL is the only path to a decided status |
| End-to-end full-cycle test | `e2e/tests/tt-full-cycle.test.tsx` | 3 scenarios, synthetic data, gate-halt proof |
| Tests (new files) | `module-scribe/tests/tt-draft-contract.test.ts`, `module-scribe/tests/tt-draft-engine.test.ts`, `module-scribe/tests/tt-manager-review.test.tsx`, `module-vigil/tests/tt-alert-routing.test.ts`, `module-vigil/tests/tt-escalation-gate.test.ts`, `module-nexus/tests/tt-travel-queue.test.ts` | +82 JS/TS tests total this session |

## 4. Changed Components

| File | Change |
|---|---|
| `sovereign-shell/shell-contract.ts` + root copy | v1.15 → v1.16 (GD-21); SHA-256 re-verified identical |
| `sovereign-data/src/shared-types.ts` | HumanDecisionType 19 → 22 (synced copy, v1.4) |
| `sovereign-data/tests/shared-types.test.ts` | count assertion 19 → 22; +3 contains |
| `sovereign-security/sovereign_logger.py` | `APPROVED_DECISION_TYPES` 19 → 22 (GD-21 sync) |
| `sovereign-security/test_sovereign_logger.py` | count assertion 19 → 22; +3 GD-21 tests (`TestGD21TimeTravelDecisionTaxonomy`) |
| `module-scribe/src/index.ts` | agentCards 2 → 4 (tt.travel-drafter + tt.time-drafter, host product SCRIBE) |

## 5. Test & Verification State

- **Platform tests: 1455** (1290 JS/TS + 165 Python) — up from 1370 (+85), all passing,
  counted per-workspace from live runs at close.
- `tsc --noEmit` clean across all 14 workspaces.
- 0 new dependencies added — no supply-chain delta. npm-dev-vulns posture unchanged
  (deferred to Stage 5+ Vite review, per standing decision).
- Agent registry: 44 (unchanged — carding the two drafters registers no new agents).
- Approved prompts: **16** (unchanged — this session activated the two already-approved
  TT prompts; no new prompt authored).
- Python `APPROVED_EVENT_TYPES` unchanged at 95; `APPROVED_DECISION_TYPES` 19 → 22
  (now in parity with shell-contract v1.16 HumanDecisionType — the deliberate delta
  is event types only: 95 vs 79, 16 Python-only by design).

---

*SBOM Session 28 Update · July 12, 2026*
*Pre-Decisional · Internal Working Document*
