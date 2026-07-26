# SBOM — Session 63 Update
## SOVEREIGN Platform · July 25, 2026

**Session:** 63 (WH-19 Workspace extension, WH-20 FLOWPATH lifecycle + preliminary gate, WH-17 P1 audit)
**Shell contract:** v1.23 — UNCHANGED. Both copies SHA-256:
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, verified identical at close.

## 1 — New Components

| Path | Description |
|---|---|
| `module-nexus/src/nexus-workspace-publisher.ts` | WH-19: publishes ROUTED travel requests to ReviewerWorkspaceSurface under module_id "nexus" |
| `module-flowpath/src/flowpath-workspace-publisher.ts` | WH-19: publishes active FLOWPATH artifact bundle to ReviewerWorkspaceSurface under module_id "flowpath" |

## 2 — Changed Components

| Path | Change |
|---|---|
| `module-workspace/src/WorkspaceApp.tsx` | WH-19: extended from 4 to 5 panels; added NEXUS (TravelQueueRow + workspace-scoped TravelQueueDecider) and FLOWPATH (WorkflowArtifactReview) sections with correct role gates; vigil publisher updated to pass highestApprovalSeverity |
| `module-nexus/src/TTQueuePanel.tsx` | WH-19: exported TravelQueueRow and TravelQueueDecider interface for Workspace consumption |
| `module-nexus/src/NexusApp.tsx` | WH-19: added useEffect to publishNexusTravelItems on travelItems changes |
| `module-flowpath/src/flowpath-contract.ts` | WH-20: added PrelimContextQuestionId, PreliminaryContext, EMPTY_PRELIM_CONTEXT, PRELIM_CONTEXT_LABELS, PRELIM_QUESTION_ORDER; extended WorkflowArtifact and ElicitationSession with preliminary_context/preliminary_complete fields |
| `module-flowpath/src/SessionManager.tsx` | WH-20: rewritten as controlled component; sessions/onNewSession required props; onStartSession callback navigates into dialogue; new sessions created with preliminary_complete: false |
| `module-flowpath/src/ElicitationDialogue.tsx` | WH-20: preliminary context stage added before five-question gate; governance-draft banner on question wording; onPreliminaryComplete/onArtifactProduced callbacks; enrichedBundle merges preliminary_context into artifact |
| `module-flowpath/src/FlowpathApp.tsx` | WH-20: owns sessions/activeSessionId/activeBundle state; lifecycle callbacks wire all three screens; publishFlowpathArtifact useEffect |
| `module-flowpath/src/WorkflowArtifactReview.tsx` | WH-20: displays preliminary_context block when present |
| `module-vigil/src/approval-port.ts` | WH-17 follow-on: req-dev-001 (model_deployment) reclassified P1→P2 |
| `module-vigil/src/vigil-work-queue-publisher.ts` | WH-17 follow-on: hasPendingP1: boolean → highestApprovalSeverity: "P1"\|"P2"\|"P3"\|null |
| `module-vigil/src/useApprovalQueue.ts` | WH-17 follow-on: added highestApprovalSeverity computed field |
| `module-vigil/src/VigilApp.tsx` | WH-17 follow-on: passes highestApprovalSeverity to publisher |
| `sovereign-shell/src/startup-publish.ts` | WH-17 follow-on: computes actual highest severity from requests before calling publisher |
| `sovereign-shell/src/PlatformHome.tsx` | WH-17 follow-on: computes actual highest severity from remaining requests |

## 3 — Test Counts (full table; arithmetic verified by summing rows)

Two new tests added (module-flowpath): preliminary context stage rendering and unlock behavior.

| Workspace | Suites | Passed | Skipped |
|---|---|---|---|
| sovereign-data | 9 | 125 | 0 |
| sovereign-api-client | 10 | 175 | 0 |
| sovereign-shell | 2 | 18 | 0 |
| module-counsel | 13 | 100 | 0 |
| module-scribe | 25 | 228 | 0 |
| module-vigil | 31 | 211 | 0 |
| module-lens | 9 | 58 | 0 |
| module-cpmi | 16 | 58 | 0 |
| module-agentos | 17 | 89 | 0 |
| module-nexus | 19 | 165 | 0 |
| module-apex | 25 | 218 | 0 |
| module-flowpath | 13 | 141 | 0 |
| module-aria | 13 | 150 | 0 |
| module-workspace | 2 | 28 | 0 |
| e2e | 12 | 149 | 4 |
| **JS total** | **216** | **1,913** | **4** |

Delta from Session 62 (1,911 passed): **+2** — two new flowpath tests; all 216 suites pass.
`tsc --noEmit`: exit 0. `npm audit --omit=dev`: not re-run (no dependency changes).

## 4 — Registries

- **Agents: 44 — no change.**
- **Prompts: 20 = 19 approved + 1 pending — no change.**
- **Production npm dependencies: no change** (no packages added or removed).

---

*SBOM Session 63 Update · July 25, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document*
