## 1. SESSION HEADER

Session 118. Prior close: Session 117, terminal HEAD `7f5407d`. Confirm current
HEAD with `git log -1` before proceeding — expect that hash or later, matching
whatever was pushed since. Shell contract: v1.28, both copies
`c99355ce…681b`, confirmed unchanged at Session 117's close. **This session
makes no shell-contract changes; confirm the hash is still unchanged at this
session's close too.**

**Purpose:** repair a second batch of demonstration-surface defects found in
extended rehearsal — F-40 through F-50, plus a priority-one data-loss bug
(F-50) in a form's error handling. Days before the CTO demonstration. This is
a repair session, not a build session — no new capability is being added.

## 2. CRITICAL CODEBASE FACTS

- Every finding referenced below has a number matching
  `SOVEREIGN_Session118_Build_Brief_20260819.md`, the authoritative spec for
  this session. Read it in full, including the priority ordering section,
  before making any change.
- F-50 is the priority. It is a form losing user-entered data on a validation
  error — genuine state-management behaviour, not a label or display issue.
  Understand the mechanism (re-mount vs. explicit state clear) before
  attempting a fix.
- "percent" vs "%" (F-40/F-45) is confirmed in three separate places across
  two APEX surfaces. Treat this as one sweep, not three point patches — find
  every instance before fixing any of them.
- F-25 remains the standing structural item from Session 116 — SCRIBE's
  export path navigates without publishing. **Not in scope this session. Do
  not touch it, do not attempt a fix, do not investigate it further — it
  requires a governance decision already on record as pending.**
- Every D1 investigation in the Build Brief has an explicit stop condition.
  If a fix would require touching more than the one component named, or
  touching shared infrastructure used by other features, stop and report
  rather than expand scope.

## 3. ACTIVE GOVERNANCE DECISIONS

None required for this session's scope. If any investigation surfaces a fix
needing a new event type, a contract change, or new agent registration, stop
and report — that is a Project Principal decision outside this session's
authority.

## 4. DONE CONDITION

Full detail in `SOVEREIGN_Session118_Build_Brief_20260819.md`, including the
priority ordering to follow if time runs out before every item is reached.

- **D1 — required.** Run all six Tier 0 investigations (F-50, F-42, F-47,
  F-48, F-40/F-45, F-46) plus the F-31 follow-up grep for "Walkthrough B".
  Report every finding verbatim in the handoff, including any that conclude
  no action is needed.
- **D2 — required.** Apply F-49 exactly as specified (no investigation
  needed). Apply fixes for F-50, F-42, F-47, F-48, F-40/F-45, and F-46 per
  their D1 findings, **in the priority order given in the Build Brief**,
  stopping at whichever point time allows. Do not skip ahead in the ordering
  to an easier item further down the list.
- No D3/D4 — the Build Brief's scope is already trimmed to what should be
  attempted this session.

Stop at the last completed deliverable in priority order. A partial pass
through the list, completed in the stated priority, is a better outcome than
an out-of-order scramble to close more items.

## 5. AUTONOMOUS OPERATION RULES

- May decide independently: exact visual treatment for F-47's over-100%
  indicator; whether F-42's fix is context-passing or button relabelling,
  per its own stop condition; test coverage for any change made.
- Must surface, not act on: anything touching shared form infrastructure
  beyond the Travel Request component (F-50); anything requiring more than
  one component change per finding; any indication that "Walkthrough B"
  (F-31 follow-up) is a live, tracked dependency — report and stop rather
  than proceeding as if it doesn't matter.
- Never touch F-25. Never touch `.sovereign_check_baseline`.

## 6. STANDING CONSTRAINTS

All 11, every session, per `AGENT_REFERENCE.md`. No shell-contract change.
Build Agent places, never authors or restructures a governance document — the
Build Brief and this prompt are already written; place, don't author.

## 7. CLOSE REQUIREMENTS

- `sovereign_session_verify.sh`, full real output quoted in the handoff.
- Full test suite re-run, all workspaces, real exit codes.
- `tsc` clean.
- Shell contract SHA confirmed unchanged, both copies, still `c99355ce…681b`.
- Handoff (`SOVEREIGN_Session118_Handoff.md`) records every D1 finding
  verbatim and states plainly which priority-ordered items were reached and
  which were not, if the list wasn't completed in full.
- SBOM update if any files were added or changed.
- `git push`, real output shown.
- Terminal HEAD recorded in `DOCUMENT_MANIFEST.tsv`, not the handoff.

---

Begin now. Investigate D1 → apply D2 in priority order → stop and report.
