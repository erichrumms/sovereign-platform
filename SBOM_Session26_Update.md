# SOVEREIGN Platform — SBOM Session 26 Update
## ARIA Suite · Walkthrough D gap fixes (D-1 … D-12) — no new components

**Date:** July 1, 2026
**Session:** 26
**Merge basis for:** SBOM Registry v1.27 (supersedes v1.26)
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Shell Contract — UNCHANGED

| Version | GD | SHA-256 | Status |
|---|---|---|---|
| **v1.15** | GD-20 | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` | **CURRENT — unchanged in Session 26** |

No Governance Decision in Session 26. Every Walkthrough D fix was scoped to `module-aria/src`
presentation/behavior and required NO shell-contract change. Both synced copies (`shell-contract.ts`,
`sovereign-shell/shell-contract.ts`) verified at this hash at session open **and** close.

The **Hard Stop discipline held once**: D-3's export destination/recipient enforcement would have
required adding fields to the governance-frozen `AriaCertification` interface. It was surfaced to the
Project Principal, who directed an audit-layer capture (Logger payload only) with no shell change. The
enforcement path is recorded as candidate GD **ARIA-EXPORT-GD** (§6 of the handoff).

No new `SovereignEventType`, no new `HumanDecisionType`. Agent registry unchanged at **44**
(36 master + 8 `tt.*`). Approved prompts unchanged at **14**.

---

## 2. Governance Decisions

None this session. (Last: GD-20, Session 23 — ARIA Suite / CLEAR shell-contract enablement.)

---

## 3. Changed Components (Session 26 — Walkthrough D fixes, no new files)

| Component | Path | Findings addressed |
|---|---|---|
| ARIA Suite CPMI-VRS Gates tab | `module-aria/src/AriaVrsGates.tsx` | D-11, D-12, D-9, D-10, D-7, D-8 |
| CPMI-VRS determinism benchmark | `module-aria/src/determinism-verification.ts` | D-9, D-10, D-8, D-2 |
| CLEAR Certification Queue | `module-aria/src/ClearCertificationQueue.tsx` | D-3, D-1, D-2 |
| CLEAR Compliance Dashboard | `module-aria/src/ClearDashboard.tsx` | D-2 |
| TRACER types (node model) | `module-aria/src/tracer-types.ts` | D-4, D-5 |
| TRACER chain-assembly engine | `module-aria/src/tracer-engine.ts` | D-4, D-5 |
| TRACER integration / demo data | `module-aria/src/tracer-integration.ts` | D-4, D-5, D-2 |
| TRACER Traceability Explorer | `module-aria/src/TracerExplorer.tsx` | D-4, D-5 |
| ARC Regulatory Impact Modeler | `module-aria/src/ArcImpactModeler.tsx` | D-6 |

Test files updated in lockstep: `AriaVrsGates.test.tsx`, `AriaApp.test.tsx` (D-7 double-render
regression), `determinism-verification.test.ts`, `ClearCertificationQueue.test.tsx`,
`tracer-engine.test.ts`, `TracerExplorer.test.tsx`, `ArcImpactModeler.test.tsx`.

### Model additions (module-local types only — not shell, not shared-types)
- `ChainNode.technical_references?: TechnicalReference[]` and `ChainNode.timestamp?: string` (D-4/D-5).
- `ScribeSourceRecord.recorded_at: string` (D-5).
- `ARIA_CERTIFICATION_ISSUED` payload gains `export_destination`, `intended_recipient`,
  `export_capture: "audit-record-only"` (D-3) — Logger payload is an open object; not a contract change.

---

## 4. Test Count — Delta Against Baseline

| Suite | Baseline (Session 25 close) | Session 26 close | Δ |
|---|---|---|---|
| module-aria (JS/TS) | 101 | **122** | **+21** |
| All JS/TS workspaces | 1109 | **1130** | +21 |
| Python (`sovereign-security`) | 158 | **158** | 0 |
| **Platform total** | **1267** | **1288** | **+21** |

Per-file breakdown of the +21 (all module-aria): `AriaVrsGates.test.tsx` +5 · `ClearCertificationQueue.test.tsx` +5 ·
`determinism-verification.test.ts` +3 · `tracer-engine.test.ts` +3 · `TracerExplorer.test.tsx` +2 ·
`ArcImpactModeler.test.tsx` +2 · `AriaApp.test.tsx` +1. D-2 added no tests (display-string only).

**0 regressions. 0 production-dependency vulnerabilities** (`npm audit --omit=dev` → found 0).
`tsc --noEmit` clean across module-aria. Determinism verification still passes (six scenarios identical).

---

## 5. Walkthrough D — All 12 Findings Closed

| # | Finding | Resolution |
|---|---|---|
| D-1 | Data-quality P1-vs-At-Risk severity not visible at row level | Queue finding row labels red congressional data-quality as "Violation (P1)" + inline document-type keying note |
| D-2 | "FY26" → "FY 2026" | 9 display strings + 1 test fixture; 8 identifiers + 11 id-test refs left intact; module-scribe `Q3 FY26` + 3 doc meta-refs out of scope |
| D-3 | CLEAR queue: no preview; no export destination/recipient captured | Synthetic document preview + destination/recipient captured to the ARIA_CERTIFICATION_ISSUED audit payload (record only, framed "not enforced by SCRIBE gate") |
| D-4 | TRACER nodes surface internal ids as primary content | Prose title/cites; raw ids moved to expandable "Technical references" |
| D-5 | SCRIBE source nodes lack timestamps | `recorded_at` added; "Recorded: …UTC" line on source/draft/decision nodes |
| D-6 | ARC scope not echoed as result-panel badge | Neutral slate `ScopeBadge` on the "Projected impact" header; redundant parenthetical removed |
| D-7 | GD-10 boundary banner rendered twice on CPMI-VRS tab | Banners removed from `AriaVrsGates` (app shell renders them once); regression test added |
| D-8 | Engine name redundant in badge + title on scenario cards | Component prefix dropped from scenario labels; badge carries it; component retained in aria-label |
| D-9 | Determinism scenario selection/coverage unexplained | Coverage note: two-per-component (normal + exception path) before the scenarios |
| D-10 | "Identically" doesn't say what was compared | Titles renamed + explicit `compared:` line naming the diffed output |
| D-11 | Gate 3 attestation surface gave no context | Pre-formed attestation statement (what/capacity/evidence/consequence) + confirm checkbox; blocked until determinism passes; verbatim statement logged |
| D-12 | Gates 1–2 / determinism substitution unexplained | Plain-prose rationale before the scenarios (LLM accuracy vs deterministic reproducibility) |

**Consequence:** CPMI-VRS **Gate 3 is now unblocked** for ARIA Suite. The Project Principal can attest
truthfully on the redesigned surface. Gate 4 unlocks on Gate 3.

---

## 6. Carry-Forward

New candidate GD this session — see the handoff §Open Governance Items:
**ARIA-EXPORT-GD** — add `authorized_destination` / `authorized_recipient` to the frozen
`AriaCertification` interface + SCRIBE export-gate enforcement (mirrors COUNSEL `regulation_basis`).

*SBOM Session 26 Update · July 1, 2026 · Pre-Decisional · Internal Working Document*
*Merge into SBOM Registry v1.27 after Session 26 build commit.*
