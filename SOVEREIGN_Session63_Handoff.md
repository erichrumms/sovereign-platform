# SOVEREIGN Platform — Session 63 Handoff
## WH-19, WH-20, WH-17 Follow-on (P1 Audit)

**Session:** 63 · July 25, 2026
**HEAD at open:** `d8ed273` (docs: Session 62 Handoff and SBOM)
**Commits this session:** per-deliverable — see Section 4
**Shell contract:** v1.23, UNCHANGED — both copies
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`
**Scope result: ALL FOUR DELIVERABLES COMPLETE.** WH-20 (build lifecycle + preliminary gate),
WH-19 (Workspace 5-panel extension), WH-17 follow-on (P1 audit). TypeScript exit 0.
All 216 JS suites pass; 1,913 JS tests, 149 passed + 4 deliberately-skipped opt-in live tests.

---

## 1 — Done-Condition Traceability

### WH-20 (Build) — FLOWPATH Session Lifecycle Wired. DONE.

**Root cause confirmed:** `startNewSession` in `SessionManager.tsx` created an `IN_PROGRESS`
session and logged `FLOWPATH_SESSION_STARTED` but never navigated. No navigation happened
because navigation (and state) lived entirely inside `FlowpathApp`, which had no callback
wire into `SessionManager`. New sessions were permanently inert: `isActionableSession` requires
`status === "COMPLETE" && gate_passed === true`, which can never be true if the elicitation
cycle never runs.

**Fix:** Lifted the sessions list, `activeSessionId`, and `activeBundle` state to `FlowpathApp`
(v1.2). `SessionManager` is now a controlled component — `sessions` and `onNewSession` are
required props; `onStartSession` is the new navigation callback. When a new session row is
created, `onNewSession` appends it and `onStartSession` immediately routes `FlowpathApp` to the
"dialogue" tab for that session. `ElicitationDialogue` receives `sessionId={activeSessionId}`
so it operates on the newly-created session, not the synthetic default. Completing the
five-question gate triggers `onArtifactProduced`, which marks the session `COMPLETE +
gate_passed: true` in the parent list, stores the bundle, and routes to the "review" tab.
`WorkflowArtifactReview.approve` calls `onApproved`, which clears `activeBundle` (unpublishing
from the Reviewer's Workspace) and routes back to the "sessions" tab. The session card now
shows "Five-Question Gate passed — ready for artifact review" because the parent's state is
authoritative and updated by all three screens.

### WH-20 (Governance) — Preliminary Context Stage. DONE (PENDING SIGN-OFF).

**New capability:** Four context-capturing questions appear BEFORE the five-question elicitation
gate, locked behind their own confirmation step. The five-question section does not render until
"Confirm preliminary context" is clicked with all four fields answered. The session card on
Screen 1 shows "Preliminary context not yet provided — complete the context questions to unlock
elicitation." once the session is created, and transitions to the standard status once confirmed.
The produced artifact carries a `preliminary_context` block (all four fields) merged by
`onProduce` before calling `onArtifactProduced`. `WorkflowArtifactReview` displays the four
fields under a "Preliminary context" sub-heading before the main artifact narrative.

**Governance banner in UI:** The preliminary section carries a `GovernanceBanner` stating:
"Proposed wording: The question wording below is a draft and has NOT been approved by the
Project Principal. Do not treat these labels as final." This is visible to every user who
reaches the Elicitation Dialogue until the Governance Agent confirms the wording.

**Draft question wording — PROPOSED, NOT FINAL; requires Project Principal sign-off:**

| Field | Label (aria/visible) | Full question as displayed in the textarea |
|---|---|---|
| GOALS | Goals and objectives | What are the primary goals or objectives this workflow is intended to accomplish? |
| DATA_SOURCE | Primary data source | What data sources, systems, or information does this workflow rely on? |
| GOVERNING_POLICY | Governing policy | Which policy, regulation, directive, or internal standard governs this workflow? |
| POPULATION | Affected population | Who are the people, roles, or organizations involved in or affected by this workflow? |

**Governance Agent action required:** Review, revise, or approve the four question texts
above. Once approved, remove the governance-draft banner from `ElicitationDialogue.tsx`
(the `GovernanceBanner` in the preliminary section). No gate change required — the
confirmation button and schema fields remain regardless of wording.

**Schema additions (flowpath-contract.ts):**
- `PrelimContextQuestionId`: `"GOALS" | "DATA_SOURCE" | "GOVERNING_POLICY" | "POPULATION"`
- `PreliminaryContext`: `{ GOALS: string; DATA_SOURCE: string; GOVERNING_POLICY: string; POPULATION: string }`
- `EMPTY_PRELIM_CONTEXT`, `PRELIM_CONTEXT_LABELS`, `PRELIM_QUESTION_ORDER`
- `WorkflowArtifact.preliminary_context?: PreliminaryContext`
- `ElicitationSession.preliminary_context?: PreliminaryContext`
- `ElicitationSession.preliminary_complete?: boolean`

### WH-19 — Reviewer's Workspace Extended to Five Panels. DONE.

**Before:** Workspace had 4 panels: VIGIL, ARIA, SCRIBE, and a placeholder.
**After:** Five panels — VIGIL, ARIA, SCRIBE, NEXUS, FLOWPATH.

**NEXUS panel:** Embeds `TravelQueueRow` (exported from `TTQueuePanel.tsx`) for each
ROUTED travel request. Uses a workspace-scoped `TravelQueueDecider` per row that calls
`recordTravelDecision`, updates `tt-session`, and removes the decided item from the surface.
Bidirectional: a decision in the Workspace removes the item from the surface and updates the
NEXUS session store; NEXUS's own `useEffect` (via `publishNexusTravelItems`) republishes the
reduced set. Role gate: `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "PROGRAM_MANAGER",
"COMPLIANCE_OFFICER"]` — matches `NEXUS_MINIMUM_ROLES` exactly.

**FLOWPATH panel:** Embeds `WorkflowArtifactReview` per published bundle. Approve callback
calls `markFlowpathSessionApproved` (session store) and removes from surface. Return-for-
revision callback logs the action and removes from surface (the source module is not notified —
out-of-scope handshake path). Role gate: `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER",
"AGENT_OPERATOR"]` — matching FLOWPATH's own minimum role set.

**New files:**
- `module-nexus/src/nexus-workspace-publisher.ts` — publishes ROUTED travel items to
  `ReviewerWorkspaceSurface` under `module_id = "nexus"`.
- `module-flowpath/src/flowpath-workspace-publisher.ts` — publishes the current active
  artifact bundle to `ReviewerWorkspaceSurface` under `module_id = "flowpath"`.

**Naming note — `TravelQueueDecider`:** `TTQueuePanel.tsx` already has a `TravelDecider`
export from `tt-travel-queue.ts` (the human manager shape: `{ id: string; name: string }`).
The new interface for the workspace callback is named `TravelQueueDecider` to avoid the
collision.

### WH-17 Follow-on — P1 Audit. DONE.

**Audit scope:** All `risk: "P1"` / `risk_classification: "P1"` assignments in
`module-vigil/src/` were reviewed.

**Finding 1 — `req-dev-001` (model_deployment, approval-port.ts): RECLASSIFIED P1→P2.**
A routine model refresh is a planned deliberative action. It is not a 15-minute emergency.
The same expiry-timing artifact as WH-17's obligation case: any demo session longer than
15 minutes would sweep the request out of the queue before it could be decided. P2's 60-minute
window matches the governance weight of a model-deployment approval.

**Finding 2 — `EMPTY_OBLIGATION_CASE` (ApprovalDetail.tsx:47): OUT OF SCOPE.**
This is a structural sentinel required for React's unconditional hook rule. Its `risk: "P1"`
field is never read by the expiry sweep — `EMPTY_OBLIGATION_CASE` is a placeholder value, not
a real approval request in the session store. No change.

**Finding 3 — Alert-level P1s (aria-alert-routing.ts, tt-alert-routing.ts, tt-synthetic-alerts.ts):
DIFFERENT MECHANISM.** `alertLevel: "P1"` controls alert priority display — it is not an
approval request `risk_classification` and is not subject to the expiry sweep. Alerts have no
`expires_at` field and no timer removes them based on this level. Out of scope.

**Cascade:** Reclassifying `req-dev-001` to P2 meant no synthetic request carries P1 anymore.
The publisher (`vigil-work-queue-publisher.ts`) was generalized: `hasPendingP1: boolean` →
`highestApprovalSeverity: "P1" | "P2" | "P3" | null`. `useApprovalQueue` gained a
`highestApprovalSeverity` computed field. All callers updated: `VigilApp.tsx`,
`startup-publish.ts`, `PlatformHome.tsx`, `WorkspaceApp.tsx`. Five test files updated to
reflect the P2-as-highest new baseline.

---

## 2 — Test Counts (full table; arithmetic verified by summing rows)

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

**Delta from Session 62 (1,911 passed): +2.** Two new tests added in `module-flowpath`:
- `ElicitationDialogue.test.tsx`: "renders the preliminary context stage with four questions
  before the five-question section"
- `ElicitationDialogue.test.tsx`: "unlocks the five-question section after the preliminary
  stage is confirmed"

**Python (sovereign-security, pytest):** 195 passed — unchanged from Session 62, not re-run
(no Python-touching changes this session).
**Platform total: 2,108 passed** (1,913 JS + 195 Python) **+ 4 deliberately-skipped opt-in
live tests.**

---

## 3 — Close Verification

- `tsc --noEmit`: exit 0 (run at close across all 15 workspaces via `npm run typecheck`).
- Shell-contract SHA-256, both copies, at close:
  `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9` — identical, unchanged.
- No Co-Authored-By trailers: `.githooks/commit-msg` backstop verified.
- Agents: 44 — no change. Prompts: 20 — no change.
- No new npm dependencies.

---

## 4 — Commits This Session

Three per-deliverable commits plus this document commit:

1. `fix(WH-19)`: Reviewer's Workspace 5th panel (NEXUS + FLOWPATH) with two new workspace
   publishers and `TravelQueueDecider` export.
2. `fix(WH-20)`: FLOWPATH elicitation lifecycle wired — controlled SessionManager, state
   lifted to FlowpathApp, preliminary context gate, five-question → artifact → review → approve
   full lifecycle.
3. `fix(WH-17-follow-on)`: P1 audit — req-dev-001 reclassified P1→P2; publisher signature
   generalized to `highestApprovalSeverity`; five test files updated to reflect new baseline.
4. `docs`: Session 63 Handoff and SBOM (this commit).

---

## 5 — Open Items and Flags for the Integration Brief

- **WH-19 CLOSED:** Reviewer's Workspace extends to five panels. NEXUS and FLOWPATH panels
  are live with bidirectional sync.
- **WH-20 CLOSED (build):** FLOWPATH elicitation lifecycle is fully wired end-to-end.
- **WH-20 PENDING GOVERNANCE SIGN-OFF:** Preliminary context question wording (Table in §1
  above) is a DRAFT. The governance-draft banner in `ElicitationDialogue.tsx` must remain
  until the Governance Agent confirms or revises the wording and issues a code-change directive.
- **WH-17 follow-on CLOSED:** All P1-classified approval actions in module-vigil reviewed.
  One reclassification made (model_deployment). Alert-level P1s confirmed out-of-scope.
  Publisher generalized so future P2/P3 highest severities are representable without code change.
- **`TravelQueueDecider` interface:** Exported from `TTQueuePanel.tsx`. Flag if NEXUS
  plans to expose its travel-decision surface to other callers in a future session — the
  interface may want to move to a more canonical location.
- **Workspace FLOWPATH return-for-revision path:** The Workspace's "Return for revision"
  button removes the artifact from the surface but does not signal `FlowpathApp` to re-open
  the dialogue. This cross-module notification path is out of scope for WH-19; flag for Group B
  if end-to-end return-to-dialogue from the Workspace is required.

---

*SOVEREIGN Session 63 Handoff · July 25, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document*
