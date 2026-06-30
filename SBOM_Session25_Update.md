# SOVEREIGN Platform — SBOM Session 25 Update
## ARIA Suite · ARC core + CPMI-VRS certification (Stage 6)

**Date:** June 29, 2026
**Session:** 25
**Merge basis for:** SBOM Registry v1.26 (supersedes v1.25)
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Shell Contract — UNCHANGED

| Version | GD | SHA-256 | Status |
|---|---|---|---|
| **v1.15** | GD-20 | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` | **CURRENT — unchanged in Session 25** |

No Governance Decision in Session 25. ARC required no shell-contract change (docs/16 §6/§7; the ARC
event types are Python-only, following the TRACER precedent). Both synced copies (`shell-contract.ts`,
`sovereign-shell/shell-contract.ts`) verified at this hash at session open and close.

---

## 2. Governance Decisions

None this session. (Last: GD-20, Session 23 — ARIA Suite / CLEAR shell-contract enablement.)

---

## 3. New Components (Session 25)

| Component | Path | Deliverable | Commit |
|---|---|---|---|
| ARC domain types | `module-aria/src/arc-types.ts` | D1 | `1fcd7c1` |
| ARC dependency-model + impact engine | `module-aria/src/arc-engine.ts` | D1 | `1fcd7c1` |
| ARC Regulatory Impact Modeler | `module-aria/src/ArcImpactModeler.tsx` | D2 | `68db645` |
| CPMI-VRS determinism benchmark | `module-aria/src/determinism-verification.ts` | D4 | `e89f1fa` |
| ARIA Suite CPMI-VRS Gates tab | `module-aria/src/AriaVrsGates.tsx` | D4 | `e89f1fa` |
| ARC engine + dependency-model tests | `module-aria/tests/arc-engine.test.ts` | D5 | `834385c` |
| ARC modeler tests | `module-aria/tests/ArcImpactModeler.test.tsx` | D5 | `834385c` |
| Determinism benchmark tests | `module-aria/tests/determinism-verification.test.ts` | D5 | `834385c` |
| CPMI-VRS Gates-tab tests | `module-aria/tests/AriaVrsGates.test.tsx` | D5 | `834385c` |

**Modified:** `module-aria/src/AriaApp.tsx` (ARC tab live + new CPMI-VRS tab; removed dead scaffold
`PlaceholderPanel`) (D2/D4, `68db645`/`e89f1fa`); `module-aria/tests/AriaApp.test.tsx` (D5, `834385c`);
`sovereign-security/sovereign_logger.py` (D3, `1a31277`);
`sovereign-security/test_sovereign_logger.py` (D5, `1a31277`/`834385c`).

---

## 4. Logger Event Taxonomy

| Set | Before | After | Note |
|---|---|---|---|
| `APPROVED_EVENT_TYPES` (Python, `sovereign_logger.py`) | 82 | **84** | +`ARIA_IMPACT_MODELED`, `ARIA_ADAPTATION_DECISION` |
| `SovereignEventType` (`shell-contract.ts`) | 79 | **79** | UNCHANGED — ARC events are Python-only |
| `HumanDecisionType` | 19 | **19** | UNCHANGED — ARC adds no human-decision type |
| Shell context exports | 10 | **10** | UNCHANGED |

> **Parity note:** As of Session 25 the Python `APPROVED_EVENT_TYPES` set intentionally holds **5 more**
> members than `shell-contract.ts` `SovereignEventType` (3 TRACER + 2 ARC, all Python-only). ARC's
> Regulatory Impact Modeler and dependency-model engine are deterministic and emit nothing from the
> TypeScript layer; the two event types exist for Python-side / CLI emission of impact-modeling runs and
> adaptation-decision records. `ARIA_ADAPTATION_DECISION` is an event type (it records that a human
> decision occurred in response to an ARC report), **not** a `HumanDecisionType`; it is reserved until a
> future session wires adaptation-decision recording. TS-side emission of any of the five Python-only
> ARIA events would require a new GD.

---

## 5. Test Suite Registry (delta)

| Suite | Before | New | After |
|---|---|---|---|
| module-aria (Jest) | 60 | +41 | **101** |
| sovereign_logger (pytest) | 52 | +5 | **57** |

**Whole-repo totals at close:** 1109 JS/TS (13 workspaces incl. e2e) + 158 Python = **1267 tests**, 0
regressions. Close gates: `tsc --noEmit` 0 errors (shell + all modules + e2e) · `npm audit --omit=dev`
0 production vulnerabilities · shell-contract hash unchanged at v1.15.

---

## 6. Agent Registry

44 registered agents (unchanged from Session 24 close — 36 master registry + 8 Time & Travel `tt.*`).
No agents added this session. `aria.rules-engine` remains the sole ARIA agent and powers ARC
(deterministic; no prompt, no `sovereign-api-client` call) — the same agent that powers CLEAR and TRACER.

---

## 7. Stage 6 Progress — FEATURE-COMPLETE

| Component | Status |
|---|---|
| CLEAR (compliance) | Live (Session 23) |
| TRACER (traceability) | Live (Session 24) |
| **ARC (regulatory impact)** | **Live (Session 25)** |
| CPMI-VRS Gates tab (determinism verification) | **Built — Gate 3/4 pending Project Principal** |

**Stage 6 (ARIA Suite) is feature-complete:** all three components render live plus a CPMI-VRS Gates
tab, pending only the Project Principal's Gate 3 attestation and Gate 4 monitoring baseline.
**Walkthrough D is ready to schedule.**

ObligationChain (TRACER) remains implemented-but-pending data until PPBE Phase I builds ProgramRecord /
ObligationRecord / StrategicObjective (D-P3 approved, not yet built). ARC→COUNSEL/NEXUS routing is
UI-recommendation-only this session (deferred; would benefit from a COUNSEL `regulation_basis` GD).

---

*SBOM Session 25 Update · June 29, 2026 · Pre-Decisional · Internal Working Document*
