# SOVEREIGN Platform — SBOM Session 29 Update
## Time & Travel gap fixes — TT intake in NEXUS, Gap 3 contrast audit, synthetic seed data, navigation reference

**Date:** July 12, 2026
**Session:** 29
**Merge basis for:** SBOM Registry v1.30 (supersedes v1.29)
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Shell Contract — UNCHANGED

| Version | GD | SHA-256 | Status |
|---|---|---|---|
| **v1.16** | GD-21 | `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` | **CURRENT — both synced copies re-verified identical at open AND close** |

The D1 governance check (opening prompt §5) confirmed the NEXUS request-type
field is **module-local** (`WorkRequestType`, `module-nexus/src/nexus-contract.ts`;
shell-contract.ts contains no RequestType definition — verified by direct grep
before any code was written). **No Hard Stop; no shell-contract change was
needed or made.** Constraint #7 holds at ten exports.

## 2. Governance Decisions Applied

- None new; none pre-authorized beyond standing (GD-21, TT-PRODUCT-GD, D-TT7).
- The two TT intake types (`TRAVEL_REQUEST`/`TIME_RECORD`) are a MODULE-LOCAL
  taxonomy (`module-nexus/src/tt-intake.ts`), deliberately not added to
  `WorkRequestType` — TT submissions never enter the GD-11 `NEXUS_REQUEST_*`
  state machine (same posture as Session 28's module-level TT communication
  modes).

## 3. New Components

| Component | Path | Notes |
|---|---|---|
| TT intake builders | `module-nexus/src/tt-intake.ts` | pure form→entity builders; total_cost/total_hours computed, entity-validator enforced |
| TT intake hook | `module-nexus/src/useTTIntake.ts` | routes through the EXISTING Session 27/28 engines; time engine injected at composition root (Item 57 pattern); Gate 2 fail-closed; seed ports (silent, no fabricated events) |
| TT intake forms | `module-nexus/src/TTIntakeForms.tsx` | adaptive travel/time form bodies (WE-1); real-time policy preview (docs/17 §5.1, pure — no Logger events) |
| TT authority queue | `module-nexus/src/TTQueuePanel.tsx` | rule-cited findings; Approve/Deny/Escalate → `recordTravelDecision` (GD-21 TRAVEL_APPROVAL); ≥10-char note discipline |
| Canonical TT seed data | `sovereign-data/src/synthetic/tt-seed.ts` | SYNTH- instances of the six D-TT3 entities: policy, 5 charge accounts, 8 travel requests, 6 time records, 6 flags, 3 corrections. Single source — TT spans four host modules that cannot import each other. NO entity type added/changed |
| Synthetic time policy config | `module-apex/src/tt-synthetic-config.ts` | FLOWPATH-elicitation stand-in for `TimeCompliancePolicyConfig` (module-level type) |
| SCRIBE review seed adapter | `module-scribe/src/tt-synthetic-review.ts` | 6 review items — all five communication types + BOTH VIGIL gate states; every draft passes validateTTDraft incl. system-invisibility |
| VIGIL TT queue seeds | `module-vigil/src/tt-synthetic-alerts.ts` | all three TT alert kinds via the real Session 28 adapter (sourceProduct VIGIL; budget exhaustion P1); mount-anchored TT approval request (live P2 window) |
| WCAG contrast regression test | `e2e/tests/wcag-contrast.test.ts` | WCAG 2.x math + live theme-token assertions + module-outlet root-cause pin + the full audited pair inventory (60 tests) |
| TT navigation reference | `docs/19_TT_Navigation_Reference.md` | D4 — explicitly UNVERIFIED pending Walkthrough E-2 |
| Tests (new files) | `module-nexus/tests/tt-intake.test.ts`, `module-nexus/tests/useTTIntake.test.tsx`, `module-nexus/tests/tt-seed-consistency.test.tsx`, `sovereign-data/tests/tt-seed.test.ts`, `module-scribe/tests/tt-synthetic-review.test.ts`, `module-vigil/tests/tt-synthetic-alerts.test.ts` | +104 JS/TS tests total this session (incl. the 60 contrast tests) |

## 4. Changed Components

| File | Change |
|---|---|
| `sovereign-shell/src/navigation/theme.ts` | v1.0 → v1.1 (WE-2): text.muted `#6B7186`→`#8E94AA`; semantic.blue `#3F7AE0`→`#6D9CEC`; semantic.red `#E0533F`→`#E8705C`; + `identityText` (`#B3A3D9`) and `MODULE_OUTLET_BG` (`#ffffff`) tokens |
| `sovereign-shell/src/navigation/ShellNavChrome.tsx` | module outlet background bg.base → MODULE_OUTLET_BG (**the Gap 3 root cause**) |
| `sovereign-shell/src/navigation/ModuleNav.tsx` | enhanced-tier badge text identity → identityText |
| `sovereign-shell/src/governance/GovernanceHeaderIndicator.tsx` | HOLD badge text `#fff` → `#0D1018` (dark-on-red 6.25:1; white-on-red fails at 3.04:1) |
| `module-nexus/src/RequestIntakePanel.tsx` | v1.0 → v1.1: request-type dropdown gains the two TT types; form body adapts (WE-1) |
| `module-nexus/src/NexusApp.tsx` | v1.1 → v1.2: third tab (Travel & Time Queue); TT ports wired (synthetic policy/accounts/config + module-apex engine via Item 57 pattern); seeds |
| `module-scribe/src/ScribeApp.tsx` | v1.1 → v1.2: surface toggle mounts TTManagerReview (previously unreachable — WE-3/WE-5), seeded |
| `module-vigil/src/VigilApp.tsx` | TT alerts + TT approval item join the seeded queues (mount-anchored) |
| `module-vigil/tests/VigilApp.test.tsx` | pending-approvals count assertion 3 → 4 (the added TT approval item) |
| `sovereign-data/src/index.ts` | v1.3.0 → v1.4.0: exports the six SYNTH_TT_* seed collections |

## 5. D2 Contrast Audit — Full Auditable Result List

Method: WCAG 2.x relative-luminance ratios computed for every text/background
pair inventoried across all ten modules + shell chrome (~55 distinct pairs).
Thresholds: 4.5:1 normal text, 3:1 large (≥24px, or ≥18.66px bold).

**Violations found and fixed (element · before → after):**

| Element | Before | After |
|---|---|---|
| Module content on shell outlet (ALL modules — NEXUS tabs/table headers, SCRIBE subtitle, etc.) | `#475569` on `#0D1018` = **2.16** (body `#0f172a` = 1.16) | outlet now `#ffffff` → 7.58 (body 17.85) |
| Shell text.muted (breadcrumb separator, chrome sub-line, ModuleNav locked items, dashboard em-dashes) | 2.94–3.92 on dark stack | `#8E94AA` → 4.74–6.31 |
| semantic.blue (Gate 1/2 labels, info accents) | 3.45–4.59 on dark stack | `#6D9CEC` → 5.18–6.90 |
| semantic.red (HOLD/escalate text on dark) | 3.72–4.96 on dark stack | `#E8705C` → 4.69–6.25 |
| HOLD badge text | `#fff` on red = 3.04 | `#0D1018` on red = 6.25 |
| ModuleNav enhanced-tier badge (identity as text) | `#6B4FA0` on `#0D1018` = **2.94** | `identityText #B3A3D9` = 8.29 |

**Measured and already compliant (no change):** shell text.primary
(11.66–15.53), text.secondary (5.48–7.30), semantic green/amber/teal
(5.73–8.98); ALL ~40 module light-background pairs (range 4.55–17.85), incl.
every element the walkthrough named — their failures were entirely the dark
outlet, not their own colors. Full per-pair list lives permanently in
`e2e/tests/wcag-contrast.test.ts`. WCAG-exempt (not fixed by design): disabled
control text (`#94a3b8` on `#f1f5f9`), decorative identity borders.

## 6. D3 Seed Inventory (per state, per type)

- **TravelRequests (8):** 3 ROUTED-pending (STANDARD ×2 incl. flagged, ESCALATE ×2 — international/DIRECTOR, cost/EXECUTIVE), 2 APPROVED (clean; with disclosed flags), 1 DENIED, 1 ESCALATED (personal day). Tiers S/F/E all present; authorities M/D/E all present. Engine-consistency test-enforced.
- **TimeRecords (6) / ComplianceFlags (6):** UNAUTHORIZED_CHARGE_ACCOUNT (ERROR → error correction), OVERTIME_THRESHOLD (WARNING → clarification), JUSTIFICATION_ABSENCE (WARNING → justification request), PATTERN_DRIFT (INFORMATIONAL → pattern flag), MISSING_HOURS ×3 recurrence (formal escalation, VIGIL gate PENDING), OVERTIME ×3 recurrence (formal escalation, AUTHORIZED).
- **CorrectionRecords (3):** CORRECTED / PENDING / ESCALATED (supervisor notified + COUNSEL Decision Record attached).
- **VIGIL:** 3 TT alerts (P2 escalation, P1 budget exhaustion, P2 audit deadline) + 1 TT approval-queue item.
- All ids SYNTH- prefixed; zero Logger events emitted by seeding.

## 7. Test & Verification State

- **Platform tests: 1559** (1394 JS/TS + 165 Python) — up from 1455 (+104), all
  passing, counted per-workspace from live runs at close:
  e2e 9→**69**, module-nexus 78→**103**, sovereign-data 74→**85**,
  module-scribe 183→**187**, module-vigil 135→**139**; all others unchanged
  (agentos 89, apex 121, aria 122, counsel 91, cpmi 58, flowpath 98, lens 58,
  api-client 174; Python 165).
- `tsc --noEmit` clean across all 14 workspaces.
- 0 new dependencies — no supply-chain delta. npm-dev-vulns posture unchanged.
- Agent registry: **44** (authoritative table: 36 master + 8 tt.*) — verified
  open and close. Approved prompts: **16** (unchanged; SCRIBE review seeds are
  static drafts, no prompt authored).
- Python taxonomies unchanged (`APPROVED_EVENT_TYPES` 95, `APPROVED_DECISION_TYPES` 22).

---

*SBOM Session 29 Update · July 12, 2026*
*Pre-Decisional · Internal Working Document*
