# SOVEREIGN Platform — Session 42 Opening Prompt
## Module Labels + Hover Info, and VIGIL Card Polish (WF-25 – WF-28)

**Prepared by:** Governance Agent, July 19, 2026
**Session number assumed:** 42 — confirm no other session has run since 41 before using this number.
**Status:** Pre-Decisional · Internal Working Document

---

## CLOSE PROTOCOL — READ THIS FIRST, NON-NEGOTIABLE

Session 41 was not considered complete until a second round-trip forced it. **This session does not
repeat that.** The session is not finished until `git push` has actually executed and its real output
is shown — not summarized, not implied. Producing `SOVEREIGN_Session42_Handoff.md` and
`SBOM_Session42_Update.md` as real committed files, then pushing them, is part of the Done Condition
itself, not a follow-up request. Do not present a final recap until this has genuinely happened. Do
not draft or scope any future session — that is the Governance Agent's task, not Build Agent's.

---

## 1 — SESSION HEADER

**HEAD at time of writing:** verify fresh via `git log -1` (Rule 1) — should be `97a8d2e` or later.

**Shell contract:** not expected to change. Everything in this session is module-local UI and content
work. No GD anticipated.

---

## 2 — CRITICAL CODEBASE FACTS (confirmed by direct source read, July 19)

- **`ModuleNav.tsx`** (`sovereign-shell/src/navigation/ModuleNav.tsx`) renders each module's name at
  `<span>{m.displayName}</span>` (~line 66). The existing `title` attribute is a native browser
  tooltip — **not suitable for the multi-bullet hover content** (D1 below); a small custom
  popover/hover component is needed, not an extension of the existing `title` string.
- **VIGIL's card timestamp and countdown** are both in `ApprovalQueue.tsx`: line 75
  (`{request.requesting_agent_id} · {formatIso(request.submitted_at)}` — the unlabeled submitted
  time, WF-26) and line 81 (`` `Expires in ${remaining} min` `` — the live countdown, WF-25).
- **The duplicate "Agent context"** (WF-28) appears in two places: `ApprovalDetail.tsx` line 107
  (`<Row label="Agent context" value={request.context} />`) and again inside the assembled Brief
  text in `approval-engine.ts`'s `describeWhatChanges()` / `staticBrief()` (the `AGENT CONTEXT:` line).
- **LENS's relevant source document** is `vigil_agent_approvals` in `module-lens/src/source-documents.ts`
  — already thorough on process, but does not currently state the P1/P2/P3 *decision-window*
  definitions (15/60/240 minutes) that live in `module-vigil/src/approval-engine.ts`'s
  `RISK_RATIONALE` constant. This is a different P-scale from the Alert Queue's P1–P4 severity scale
  — do not conflate them when writing the addition.

---

## 3 — ACTIVE GOVERNANCE DECISIONS

None.

---

## 4 — DONE CONDITION

### D1 — Required — Module labels + hover info

Add the finalized three-word label next to each module's display name in `ModuleNav.tsx`, and a
small hover/click info affordance showing the bullet content below. Labels and content:

| Module | Label | Hover bullets |
|---|---|---|
| COUNSEL | Argues Both Sides | Weighs a decision from every angle · Argues the other side, on purpose · Spots how a plan could fail |
| SCRIBE | **Ghostwrites Your Memos** *(provisional — confirm with Project Principal; was "Your Ghostwriter," two words, before this session)* | Writes your emails and memos · Drafts fixes for travel and timesheet issues · Drafts budget paperwork · Learns and matches your writing style |
| VIGIL | Approves Agent Actions | Flags alerts that need a look · Lets you approve, reject, or escalate AI requests |
| LENS | Explains The Rules | Explains the rules in plain English · Walks new users through each module |
| CPMI | Signs The Certificate | Double-checks big decisions, step by step · Signs off once every rule is met · Answers "big picture" questions for other modules |
| AgentOS | Manages AI Models | Starts and watches AI training · Rolls out new models, once approved · Watches for models drifting off track |
| NEXUS | Sorts The Mail | Sorts incoming requests to the right team · Handles travel and timesheet reviews · Tracks budget coordination tasks |
| APEX | Reads The Gauges | Shows how every program is doing · Drills into one program's risks · Builds reports for leadership · Flags budgets running over or under |
| FLOWPATH | Maps Your Workflow | Interviews people about how work gets done · Draws a map of the process · Flags where things slow down |
| ARIA Suite | Runs The Checklist | Applies rules automatically, no AI · Proves the rules were followed |

**Note on confidence:** CPMI's and ARIA Suite's bullets are drawn from governance documentation, not
independently confirmed against their live screens this session — implement as written, but flag in
the handoff that these two specifically are worth a visual double-check, not a blocking concern.

Implementation is Build Agent's judgment (a simple hover-triggered popover is reasonable — keep it
lightweight, match the existing shell chrome styling, no new dependency).

### D2 — Required — WF-25 + WF-26: VIGIL card timestamp and countdown

In `ApprovalQueue.tsx`:
- **WF-26:** prefix the submitted timestamp so it reads unambiguously, e.g. "Submitted Jul 18, 2026
  at 9:48 PM" instead of the bare timestamp.
- **WF-25:** replace the live "Expires in X min" countdown with a static, formatted deadline (e.g.
  "Decide by 9:48 PM"), consistent with the human-readable format already established by WF-16.
  Reserve any escalating visual treatment (bold, color change) for a genuine near-deadline state —
  Build Agent's judgment on the threshold, document the choice in the handoff.

### D3 — Required — WF-28: remove the duplicate Agent Context

Pick one location for this information — the `ApprovalDetail.tsx` table row or the Brief's
`AGENT CONTEXT:` line — and remove it from the other. Build Agent's judgment on which to keep;
document the choice and reasoning in the handoff.

### D4 — Optional, only if D1–D3 complete cleanly — WF-27: risk-tier reference content

Extend LENS's `vigil_agent_approvals` source document to state the Approval Queue's actual P1/P2/P3
decision-window definitions (15-minute / 60-minute / 4-hour, per `RISK_RATIONALE` in
`approval-engine.ts`), clearly distinguished from the Alert Queue's separate P1–P4 severity scale.
**Scope this session to the content addition only** — wiring a live contextual "?" affordance next
to the badges themselves (surfacing this through LENS's `useExplanation` hook in context) is a
larger UI integration not scoped here; note it as a follow-on item in the handoff if not attempted.

---

## 5 — AUTONOMOUS OPERATION RULES

- D1's hover component should be simple — resist the urge to build a general-purpose tooltip
  system if a lightweight one-off suffices for ten modules.
- D2 and D3 are both small, well-understood changes in files already read this session — no
  Hard Stop expected on either.
- Do not touch the shell-contract, agent registry, or prompt registry.
- Per the Close Protocol above: finish the actual close (files written, committed, pushed) before
  presenting a final summary.

---

## 6 — STANDING CONSTRAINTS

All 11 apply. None anticipated to be directly implicated.

---

## 7 — CLOSE REQUIREMENTS

- Full test suite run with real exit codes (Rule 7).
- `SOVEREIGN_Session42_Handoff.md` and `SBOM_Session42_Update.md` written as real files, committed,
  and pushed — verify the push output before considering the session done, per the Close Protocol.
- Handoff states which of D1–D4 completed, the resolution chosen for D3, and confirms the SCRIBE
  label question (D1) is flagged for Project Principal confirmation, not silently finalized.

---

*SOVEREIGN Platform · Session 42 Opening Prompt · July 19, 2026*
*Pre-Decisional · Internal Working Document*
