# SBOM Session 38 Update
**Date:** July 17, 2026 · **Session:** 38 (Walkthrough F Findings Fix)
**For merge into:** SBOM Registry (backlog now spans Sessions 35–38)

---

## New Components

| Component | Path | Kind | Notes |
|---|---|---|---|
| PPBEAgentsPanel | `module-apex/src/PPBEAgentsPanel.tsx` | Internal source (module-apex) | Clickable UI triggers for ppbe-evidence-synthesizer and ppbe-scenario-analyst in APEX Execution Monitoring tab. No new package; uses existing @sovereign/api-client + createSovereignClient(). Static tier in dev (no API key). |
| PPBEExhibitPanel | `module-scribe/src/PPBEExhibitPanel.tsx` | Internal source (module-scribe) | Clickable UI trigger for ppbe-exhibit-drafter in SCRIBE "PPBE Exhibits" surface. No new package. Static tier in dev. |
| PPBECoordinationPanel | `module-nexus/src/PPBECoordinationPanel.tsx` | Internal source (module-nexus) | Clickable UI trigger for ppbe-coordination-assistant in NEXUS "PPBE Coordination" tab. Imports readAnthropicKey from module-scribe (Item 57 pattern). No new package. Static tier in dev. |
| ObligationDecisionPanel | `module-vigil/src/ObligationDecisionPanel.tsx` | Internal source (module-vigil) | Tier C obligation authorization decision controls: note (≥10 chars) + COUNSEL Decision Record ID both required before Approve enables. Structural gate enforced by canSubmitObligationDecision(). No new package. |
| useObligationDecision | `module-vigil/src/useObligationDecision.ts` | Internal source (module-vigil) | React hook wrapping recordObligationAuthorization(). Holds PPBEObligationCase state; CPMI-VRS Gate 2 blocking on Logger failure preserved. |
| PPBEAgentsPanel tests | `module-apex/tests/PPBEAgentsPanel.test.tsx` | Tests (3) | Render buttons; evidence output with advisory label; scenario output with scenario label. |
| PPBEExhibitPanel tests | `module-scribe/tests/PPBEExhibitPanel.test.tsx` | Tests (2) | Render controls; output after click includes STATIC tier badge. |
| PPBECoordinationPanel tests | `module-nexus/tests/PPBECoordinationPanel.test.tsx` | Tests (2) | Render controls; output with advisory label and "Static digest" prefix. |
| ObligationDecisionPanel tests | `module-vigil/tests/ObligationDecisionPanel.test.tsx` | Tests (8) | Full gate predicate coverage: disabled without counselId, disabled without note, enabled with both, correct onDecide args, Reject note-only, error display. |
| VigilAppObligation tests | `module-vigil/tests/VigilAppObligation.test.tsx` | Tests (2) | Obligation card in queue; ObligationDecisionPanel rendered on selection. |
| T&T queue selection test | `module-scribe/tests/tt-manager-review.test.tsx` (one test added) | Test (+1) | Confirms all six DEMO_TT_REVIEW_ITEMS are individually selectable (Part 1 diagnosis). |

---

## Changed Components

| Component | Path | Change |
|---|---|---|
| ApexApp | `module-apex/src/ApexApp.tsx` | Execution Monitoring tab: adds PPBEAgentsPanel below PPBEDashboard. Detail tab fallback: shows hint text instead of PortfolioDashboard when no program selected (WF-4). |
| PPBEDashboard | `module-apex/src/PPBEDashboard.tsx` | h1 updated from "APEX — PPBE Performance" to "APEX — Execution Monitoring" to match tab label (WF-7). |
| ppbe-dashboard | `module-apex/src/ppbe-dashboard.ts` | budgetToActualVariance() narratives now include program.name and execution-status classification: on-plan / under-executing / over-executing (WF-5). |
| ScribeApp | `module-scribe/src/ScribeApp.tsx` | New "ppbe-exhibits" surface branch and tab button added. |
| NexusApp | `module-nexus/src/NexusApp.tsx` | New "ppbe-coordination" tab entry. |
| TTManagerReview | `module-scribe/src/TTManagerReview.tsx` | itemLabel() for time flags adds flag.employee_id (§2.1 Supervision Efficiency Standard). |
| ApprovalQueue | `module-vigil/src/ApprovalQueue.tsx` | RequestCard adds inline actionContext() for ppbe_obligation (program_id + amount) and ppbe_phase_transition (phase arrow) card types (§2.1). |
| ApprovalDetail | `module-vigil/src/ApprovalDetail.tsx` | Detects ppbe_obligation action_type; renders ObligationDecisionPanel + useObligationDecision instead of standard panel. Stable EMPTY_OBLIGATION_CASE avoids conditional hook ordering. obligationCase prop added. |
| VigilApp | `module-vigil/src/VigilApp.tsx` | Seeds one PPBEObligationCase (PPBE-OB-DEMO-001, program SYNTH-PRG-ALPHA, $75,000) on mount via openObligationGate(). Passes obligationCase to ApprovalDetail. Pending-approvals seeded count: 4 → 5. |
| PlatformHome | `sovereign-shell/src/PlatformHome.tsx` | Guards new Date(last_updated) with Number.isNaN(Date.parse(...)); shows "Status date unavailable" when date is unparseable (WF-1). |

---

## Unchanged Governance Artifacts

- **Shell contract:** v1.16, both copies SHA-256
  `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` — verified at
  open and close, never touched. No GD this session.
- **Agent registry:** 44 — unchanged. All four PPBE agents (ppbe-evidence-synthesizer,
  ppbe-scenario-analyst, ppbe-exhibit-drafter, ppbe-coordination-assistant) were
  already registered. No new agent registered this session.
- **Prompt registry:** 20 registered (19 approved + 1 pending) — unchanged. Four PPBE
  agent panels use `[PENDING]` placeholder system prompts; static tier is the honest
  fallback per Constraint #9. No prompt file added or edited this session.
- **Production packages:** no additions, no removals, no version changes. All new source
  files use packages already in the workspace dependency graph.
- **sovereign-data:** 1.6.0 — unchanged (no entity or seed change this session; the
  synthetic obligation seeded in VigilApp is assembled inline from ObligationDraft
  literal, not added to SYNTH_PPBE_OBLIGATIONS).

---

## Test Count Totals

| Suite | Count |
|---|---|
| sovereign-data | 125 |
| sovereign-api-client | 175 |
| module-counsel | 100 |
| module-scribe | 219 |
| module-vigil | 177 |
| module-lens | 58 |
| module-cpmi | 58 |
| module-agentos | 89 |
| module-nexus | 155 |
| module-apex | 189 |
| module-flowpath | 133 |
| module-aria | 139 |
| e2e | 107 passing (+ 4 key-gated skipped) |
| **JS/TS passing** | **1724** |
| Python (sovereign-security) | **195** |
| **Platform total passing** | **1919** (+ 4 key-gated) |

Delta vs. Session 37 (1681 JS/TS): +43 passing.
Per-module deltas: apex +3, vigil +10, scribe +3, nexus +2.

---

## Commits

`6642546` (Part 1) · `6e93ea7` (Part 2) · `beeb9e2` (Part 3) · `d593e7b` (Part 4) · `8b37d5a` (Part 5). Base: `0d1be41`. All on `main`.

---

*SBOM_Session38_Update.md · July 17, 2026*
