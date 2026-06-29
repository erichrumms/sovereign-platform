# SOVEREIGN Platform — SBOM Session 23 Update
## Session 23 (retry) | June 29, 2026 | Stage 6 · ARIA Suite · CLEAR core
## Supersedes SBOM v1.23 (merged through Session 22). Roll into SBOM v1.24.

**HEAD at close:** `41d855e`
**Shell contract:** v1.14 → **v1.15** (GD-20)

---

## 1. Shell Contract Version History (update)

| Version | GD | Date | SHA-256 | Status |
|---|---|---|---|---|
| v1.14 | GD-19 | June 29, 2026 | `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910` | Retired (Session 23) |
| **v1.15** | **GD-20** | **June 29, 2026** | **`939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876`** | **CURRENT — hash of record. Both copies identical.** |

---

## 2. Governance Decision Registry (add)

| GD | Session | Date | Description | Contract |
|---|---|---|---|---|
| **GD-20** | **23** | **June 29, 2026 (APPROVED — Path B)** | **ARIA Suite / CLEAR shell-contract enablement. +4 `SovereignEventType` (`ARIA_COMPLIANCE_CHECK`, `ARIA_CERTIFICATION_ISSUED`, `ARIA_VIOLATION_FLAGGED`, `ARIA_CALENDAR_ALERT`); +1 `HumanDecisionType` (`COMPLIANCE_CERTIFICATION`); +tenth shell export `aria` (`AriaCertificationSurface`) + `AriaCertification` type. Standing Constraint #7 relaxed 9 → 10 for the `aria` export only. All additive. Supersedes docs/16 §4/§7 (ARIA now takes a shell-contract change; events emitted from the TS layer). Propagated to shared-types (HumanDecisionType 18→19) + Python logger (events 75→79, decisions 18→19).** | **v1.15** |

---

## 3. Test Suite Registry (Session 23 deltas)

| Suite | v1.23 baseline | Session 23 Δ | new total | Notes |
|---|---|---|---|---|
| sovereign-security (Python) | 142 | **+6** | **148** | GD-20 ARIA/CLEAR taxonomy tests (`test_sovereign_logger.py`). Full Python suite 148 across all test_*.py. |
| sovereign-api-client | 174 | — | **174** | Unchanged |
| sovereign-data | 43 | — | **43** | shared-types test updated to 19 HumanDecisionType members (count assertion). |
| module-aria | 17 | **+20** | **37** | clear-engine 8, ClearDashboard 6, ClearCertificationQueue 6. |
| module-scribe | 122 | **+3** | **125** | CLEAR export gate (`useExport.test.tsx`). |
| module-vigil | 113 | **+4** | **117** | ARIA→VIGIL routing (`aria-alert-routing.test.ts`). |
| module-agentos | 89 | — | **89** | Unchanged |
| module-apex | 97 | — | **97** | Unchanged |
| module-counsel | 91 | — | **91** | Unchanged |
| module-cpmi | 58 | — | **58** | Unchanged |
| module-flowpath | 98 | — | **98** | Unchanged |
| module-lens | 58 | — | **58** | Unchanged |
| module-nexus | 52 | — | **52** | Unchanged |

**JS/TS total: 1039 · Python total: 148 · Grand total: 1187.** ~33 new tests this session.

**Close gates:** `npm test` 0 regressions · `tsc --noEmit` 0 errors (14 packages) ·
`npm audit --omit=dev` 0 production vulnerabilities · both shell-contract copies SHA-256 identical at v1.15.

---

## 4. New Components (Session 23)

| Component | Path | Role |
|---|---|---|
| CLEAR domain types | `module-aria/src/clear-types.ts` | Shared CLEAR shapes + severity/threshold helpers |
| CLEAR rule engine | `module-aria/src/clear-engine.ts` | Deterministic four-source evaluation; ARIA_COMPLIANCE_CHECK emit (D4) |
| CLEAR UI primitives | `module-aria/src/clear-ui.tsx` | SeverityBadge, StatusPill, determinism notice |
| ctx.aria hook | `module-aria/src/useAriaCertifications.ts` | Subscribes to the tenth shell export |
| Compliance Dashboard | `module-aria/src/ClearDashboard.tsx` | Three monitoring surfaces (D2) |
| Certification Queue | `module-aria/src/ClearCertificationQueue.tsx` | Certify/Flag → ctx.aria + Logger (D3) |
| CLEAR panel shell | `module-aria/src/ClearPanel.tsx` | Dashboard + Queue sub-navigation |
| Regulatory source — OMB A-11 | `module-aria/data/regulatory-sources/omba11.md` | Synthetic governance summary |
| Regulatory source — Evidence Act | `module-aria/data/regulatory-sources/evidence-act.md` | Synthetic governance summary |
| Regulatory source — Anti-Deficiency Act | `module-aria/data/regulatory-sources/anti-deficiency-act.md` | Synthetic governance summary |
| Regulatory source — DoD PPBE Reform | `module-aria/data/regulatory-sources/dod-ppbe-reform.md` | Synthetic governance summary |
| ARIA→VIGIL routing | `module-vigil/src/aria-alert-routing.ts` | CLEAR alerts → existing AlertType + sourceProduct ARIA (D5) |
| Test — engine | `module-aria/tests/clear-engine.test.ts` | Determinism, threshold, source loading, emit |
| Test — dashboard | `module-aria/tests/ClearDashboard.test.tsx` | Surfaces, severity, ctx.aria status |
| Test — queue | `module-aria/tests/ClearCertificationQueue.test.tsx` | Certify/flag emission, note enforcement |
| Test — SCRIBE gate | `module-scribe/tests/useExport.test.tsx` | Export blocked/opened by certification |
| Test — VIGIL routing | `module-vigil/tests/aria-alert-routing.test.ts` | Mapping + sourceProduct ARIA |

---

## 5. Changed Components (Session 23)

| Component | Path | Change |
|---|---|---|
| Shell contract (×2 copies) | `shell-contract.ts`, `sovereign-shell/shell-contract.ts` | v1.15 — +4 event types, +COMPLIANCE_CERTIFICATION, +tenth export `aria` + AriaCertification(Surface) |
| Shell composition root | `sovereign-shell/src/shell.ts` | `ShellAriaSurface` — runtime impl of the tenth export |
| Shared data types | `sovereign-data/src/shared-types.ts` (+ test) | +COMPLIANCE_CERTIFICATION (HumanDecisionType + const, 18→19); version 1.3 |
| Python logger | `sovereign-security/sovereign_logger.py` (+ test) | +4 events (75→79), +COMPLIANCE_CERTIFICATION (18→19) |
| ARIA architecture spec | `docs/16_ARIA_Suite_Architecture.md` | §4/§7 amended — ARIA does take a shell-contract change (GD-20) |
| ARIA app shell | `module-aria/src/AriaApp.tsx` | CLEAR tab renders live ClearPanel (placeholder removed) |
| SCRIBE export hook | `module-scribe/src/useExport.ts` | CLEAR export gate via `ctx.aria.isCertified` (documentId-conditional) |
| VIGIL app + alert card | `module-vigil/src/VigilApp.tsx`, `module-vigil/src/AlertQueue.tsx` | Seed ARIA alerts; ARIA visual identifiability (no new component) |
| GD-20 record | `GD-20_ARIA_CLEAR_ShellContract.md` | Status PROPOSED → APPROVED (executed) |

---

## 6. Agent Registry — 36 verified (unchanged)

Re-verified directly from `Agent_Identity_Standard.md` at Session 23 open: **36**. No agents
added this session. `aria.rules-engine` (Governance, deterministic) is the CLEAR engine identity
on every ARIA_COMPLIANCE_CHECK event.

---

## 7. Prompt Registry — 14 (unchanged)

CLEAR is deterministic (no LLM, no prompt). No new prompt registrations.

---

## 8. Shell Context Exports — now TEN

`auth, logger, governance, data, navigation, mcp, a2a, agui, taskSurface (v1.14), aria (v1.15)`.
Standing Constraint #7: ten exports. No further export without a new GD.

---

*SOVEREIGN Platform — SBOM Session 23 Update · June 29, 2026 · Pre-Decisional · Internal Working Document*
