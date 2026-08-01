# SOVEREIGN Platform — HUMAN_DECISION Audit Trail and Emission Architecture
## July 30, 2026 · Governance Agent
## New architecture reference — companion to docs/28_Logger_Write_Only_Provenance_Gap.md

**Why this document exists:** Session 76 ran the most comprehensive platform-wide
survey of the audit-trail emission mechanism this project has ever done, in response to
a real, unresolved question about whether the Reviewer's Workspace Activity log could
be trusted. The investigation's findings are real, valuable, durable architecture
knowledge — this document exists so they don't stay buried inside a session Handoff.

---

## What was asked, and why

During Walkthrough I, the Project Principal observed more entries in the Activity &
Decisions log than the walkthrough script's own steps accounted for, and could not
confirm making all of them. Session 76 investigated whether any code-level mechanism —
specifically, React StrictMode's deliberate double-invocation of `useEffect` bodies in
development — could produce a duplicate or fabricated log entry from a single real
action.

## Every `HUMAN_DECISION` emission site on the platform, confirmed

| Module | Event type | Emission site | Call chain |
|---|---|---|---|
| VIGIL | `AGENT_APPROVAL_DECISION` | `useApprovalDecision.ts:69` | `decide` `useCallback` → button `onClick` |
| FLOWPATH | `FLOWPATH_ARTIFACT_APPROVED` | `WorkflowArtifactReview.tsx:88,101` | `approve()` → `onClick={approve}` |
| FLOWPATH | Gate 3/4 attestation | `GateRunnerPanel.tsx:85,112` | `attestGate3()`/`completeGate4()` → `onClick=` |
| ARIA | `ARIA_CERTIFICATION_ISSUED` / `ARIA_VIOLATION_FLAGGED` | `ClearCertificationQueue.tsx:176,198` | `decide()` → `onClick=` |
| NEXUS | `TRAVEL_APPROVAL` | `tt-travel-queue.ts:165` (`recordTravelDecision`) | `decideTravel` `useCallback` ← button `onClick` |
| SCRIBE | `TIME_CORRECTION_SENT` | `TTManagerReview.tsx:159` (`recordSend`) | direct function ← `onClick={() => recordSend(selected)}` |

**Zero exceptions.** No `HUMAN_DECISION` event carrying `actor_name` is emitted from
inside a `useEffect` anywhere in the platform. Every entry in the Activity &
Decisions log corresponds to one real button click. StrictMode's double-invocation
cannot produce a duplicate, because StrictMode only re-fires effects, never event
handlers.

## What the `useEffect` bodies that do touch the logger actually do

Surveyed and confirmed none of them write a `HUMAN_DECISION` with `actor_name` set:

| Location | Effect body | Writes to |
|---|---|---|
| `WorkspaceApp.tsx:315` | VIGIL expiry sweep | `ctx.logger`, but `AGENT_ACTION_EXPIRED` — no `actor_name` |
| `WorkspaceApp.tsx:332,412,452` | VIGIL/ARIA/SCRIBE work-queue republish | `workQueueSurface` only |
| `NexusApp.tsx:217` | `publishNexusTravelItems` | `reviewerWorkspaceSurface` only |
| `useTTIntake.ts:235`, `useReviewerWorkspaceItems.ts:28` | Session-store / surface subscriptions | local component state only |
| `ScribeApp.tsx:80,88` | Publish on mount | `workQueueSurface` / `reviewerWorkspaceSurface` only |

## Events that exist but are invisible in the per-user Activity view

`FLOWPATH_GATE_FAILED` (`WorkflowArtifactReview.tsx:134`, `returnForRevision`) and the
`AGENT_STEP_START` / `FALLBACK_ACTIVATED` / `AGENT_STEP_COMPLETE` family
(`useApprovalBrief.ts`) all emit without `actor_name`. The Activity section filters on
`e.actor_name === ctx.auth.user.name` — these events simply don't appear there. **This
is a scope limitation of that specific view, not an accuracy risk.** Nothing gets
misattributed to a person who didn't do it; these events are just outside what that
panel shows. If a future need arises to see this class of event per-user, the filter
itself would need to change, not the emission logic.

## The standing distinction that matters most

The Reviewer's Workspace Activity & Decisions panel is explicitly session-scoped,
in-memory, and not a permanent audit record — it says so on-screen. The platform's real,
permanent audit log is separate. This document is about the *mechanism* that populates
the session-scoped panel; it does not claim anything about the permanent log's own
architecture, which is a distinct system.

---

*HUMAN_DECISION Audit Trail and Emission Architecture · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
