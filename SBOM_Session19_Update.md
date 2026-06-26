# SOVEREIGN Platform — SBOM Session 19 Update
## Claude Code session-update file (to be merged into SBOM_Registry by Claude Chat)
## June 26, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes inputs:** SBOM_Registry v1.19 (through Session 18)
**Session:** 19 — APEX completion: Item 56 + contrast audit + DC-3 enhancement + DC-4 charts

---

## 1. Governance Decisions

- **No new GD this session.** GD-17 (Session 18, APPROVED_PRODUCTS companion re-sync) remains the
  latest GD and is confirmed unchanged.
- Item 56 (Gate 3 `decision_type` correction) **CLOSED** — code-only change to
  `GateRunnerPanel.tsx` (`GATE_3_ATTESTATION`); both types already in the contract, so **no
  shell-contract change and no GD** were required.

---

## 2. Shell Contract

| Item | Value |
|---|---|
| Version | **v1.12 (UNCHANGED)** |
| SHA-256 (both copies) | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` |
| Copies identical | Yes (verified at close) |
| Constraint #11 propagation | None required (no contract change) |

---

## 3. Test Totals

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
| module-apex | **97** (+6 vs Session 18) |
| e2e | 5 |
| **JS total** | **899** |
| **Python** | **142** |
| **Total** | **1041** |

---

## 4. Components Changed (module-apex only)

| File | Change |
|---|---|
| `src/GateRunnerPanel.tsx` | (pre-session, `8996780`) Gate 3 logs `GATE_3_ATTESTATION` — Item 56 |
| `src/banners.tsx` | Added `background: #f1f5f9` to `rootStyle`; new exported `contentCardStyle` (white card) |
| `src/PortfolioDashboard.tsx` | Summary + program table wrapped in white content cards |
| `src/ProgramDetailView.tsx` | All seven sections wrapped in white content cards |
| `src/ReportGenerationPanel.tsx` | Form + report output wrapped in white cards; renders `ReportCharts` (DC-4) |
| `src/ProvenancePanel.tsx` | Renders "Current actual" + "Variance from plan" (DC-3) |
| `src/apex-contract.ts` | `ProvenanceRecord` + `current_actual_value`, `variance_from_baseline` |
| `src/synthetic-world-model.ts` | Both new provenance fields populated on all 7 risk flags |
| `src/ReportCharts.tsx` | **NEW** — DC-4 CSS visual indicators (completion / cost variance / milestones) |
| `tests/ProvenancePanel.test.tsx` | +1 test (DC-3 new fields) |
| `tests/ReportCharts.test.tsx` | **NEW** — 5 tests (DC-4) |

Shell contract, `sovereign-data/shared-types.ts`, Python logger: **unchanged** (no propagation).

---

## 5. Dependency Inventory

- **No new production dependency added.** `recharts` was assessed for DC-4 and found **absent**
  from the `module-apex` dependency tree (`package.json` runtime deps: `@sovereign/api-client`,
  `@sovereign/data`, `react`, `react-dom`); DC-4 was implemented with pure CSS instead.
- `module-apex` runtime dependencies unchanged: `@sovereign/api-client ^1.0.0`,
  `@sovereign/data ^1.0.0`, `react ^18.3.1`, `react-dom ^18.3.1`.
- `npm audit --omit=dev`: no new packages introduced this session.

---

## 6. Agents / Prompts

- **18 registered agents — unchanged.** No new agents.
- **10 approved prompts — unchanged.** No new prompts.

---

*SOVEREIGN Platform · SBOM Session 19 Update · June 26, 2026 · Pre-Decisional · Internal Working Document*
