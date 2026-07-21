# SOVEREIGN Platform — Session 44 Opening Prompt
## GD-23: ProgramStatusSurface (docs/20)

**Prepared by:** Governance Agent, July 19, 2026
**Source:** `docs/20_Cross_Module_Data_Surface_Architecture.md` — read it first, this
prompt summarizes it but the spec is the actual design authority
**Session number assumed:** 44 — confirm no other session has run since 43 before
using this number, and confirm current HEAD before starting (see below).
**Status:** Pre-Decisional · Internal Working Document

---

## CLOSE PROTOCOL — same as every session since 42, still non-negotiable

The session is not finished until `git push` has actually executed and its real
output is shown. `SOVEREIGN_Session44_Handoff.md` and `SBOM_Session44_Update.md`
as real committed files, pushed, is part of the Done Condition, not a follow-up.

---

## 1 — SESSION HEADER

**HEAD at time of writing:** `6ad539b` — **verify fresh via `git log -1` regardless.**
Two governance-document-only commits (the `Agent_Identity_Standard.md` SCRIBE-deferral
edit) may or may not have landed since — neither touches any file this session cares
about, but confirm HEAD before assuming anything.

**Shell contract: this session changes it, under GD-23 (approved by the Project
Principal, July 19).** Currently v1.17, hash
`91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78`. Expect v1.18 at
close, both copies re-verified identical per Constraint #11 — same discipline as
Session 41's GD-22.

---

## 2 — CRITICAL CODEBASE FACTS (confirmed by direct source read; full detail in docs/20)

- **The exact template to copy:** `ShellAriaSurface` in `sovereign-shell/src/shell.ts`
  (immediately after `ShellTaskSurface`'s own definition — search for *"the tenth
  export"* in a comment to find it fast). `ProgramStatusSurface` should mirror this
  class's shape field-for-field: `publish`, `get`, `list`, `subscribe`, last-write-wins
  by id, shell-owned, in-memory, lifetime of one platform session.
- **The `TaskSurface` interface** (a second, related precedent, more general-purpose):
  `shell-contract.ts:1037`.
- **APEX's existing structured data:** `module-apex/src/PPBEDashboard.tsx`,
  `data.obligation_rates` — each entry already has `program_id` and a pre-composed
  `narrative` string (confirmed by direct read). **The raw numeric fields behind that
  narrative (obligated amount, planned amount) were not traced this cycle — investigate
  at build time, don't assume they exist in the exact shape needed for
  `percent_obligated`.**
- **VIGIL's integration point:** `module-vigil/src/approval-engine.ts`,
  `describeWhatChanges()`, the `ppbe_obligation` case — the same function Session 39
  already touched for WF-22's plain-language rewrite. This directly and fully resolves
  WF-20, which Session 39 only partially addressed (it added `cost_code`/`obligation_id`
  — data already local to the request — not actual cross-module program context).

---

## 3 — ACTIVE GOVERNANCE DECISIONS

**GD-23 — approved by the Project Principal, July 19, 2026.** Add
`ProgramStatusSurface` and `ProgramStatusSnapshot` to both shell-contract copies per
docs/20 §2's exact interface. Shell-contract v1.17 → v1.18. Standard impact
assessment applies — confirm and state explicitly in the handoff that
`HumanDecisionType`, `SovereignEventType`, and `AgentClass` are unaffected, per the
GD Impact Assessment Standard's own rule that "no impact" must be justified, not
assumed.

**No other GD is authorized this session.** Any further shell-contract change beyond
exactly what docs/20 specifies is a Hard Stop (Rule 6).

---

## 4 — DONE CONDITION

All four required — this is one integrated feature per docs/20, same as GD-22's
session.

### D1 — Required — Shell-contract addition

Add `ProgramStatusSnapshot` and `ProgramStatusSurface` to both shell-contract
copies, exact interface per docs/20 §2. Implement `ShellProgramStatusSurface` in
`sovereign-shell/src/shell.ts`, mirroring `ShellAriaSurface`. SHA-256 verify both
copies identical; record the new hash in the handoff.

### D2 — Required — APEX publishes

APEX publishes a `ProgramStatusSnapshot` per program whenever program data is
loaded or changes. Trace the actual numeric fields behind `PPBEDashboard.tsx`'s
existing `narrative` string to compute `percent_obligated`; derive `status`
("on_track" | "at_risk" | "off_track") via a threshold rule — Build Agent's
judgment on where this rule lives (likely alongside the existing narrative-generation
logic), document the choice.

### D3 — Required — VIGIL reads

`describeWhatChanges()`'s `ppbe_obligation` case calls
`ctx.programStatusSurface.get(program_id)` and includes the resulting summary in the
brief — this is the actual fix for WF-20.

### D4 — Required — Convergence test

A regression test confirming the full loop — publish from APEX's side, read from
VIGIL's side, in one shared context — matching Session 35's own convergence-test
style for the VIGIL→SCRIBE case (real components, one shared context, not mocked
past the point that matters).

---

## 5 — AUTONOMOUS OPERATION RULES

- D1 must complete and be SHA-verified before D2/D3 begin — they depend on the
  widened shell-contract.
- Per Rule 8: trace the actual numeric fields behind APEX's `narrative` string before
  assuming their shape — don't guess at `percent_obligated`'s source.
- GD-23 authorizes exactly the two new types in docs/20 §2 — nothing else on
  `ModuleContract` or any other shell-contract type. Do not widen scope even if
  something adjacent looks convenient to touch while already in the file.
- **Do not touch `AGENT_REFERENCE.md`.** Documenting this pattern for reuse is
  Governance Agent's task, handled separately after this session closes — same
  split as GD-22's ARIA pattern documentation.
- If a genuinely different kind of cross-module data need surfaces mid-session
  (not program-status-shaped), that's out of scope — flag it in the handoff for a
  future, separately-scoped surface, per docs/20 §5. Do not retrofit
  `ProgramStatusSurface` to cover it.

---

## 6 — STANDING CONSTRAINTS

All 11 apply. **Constraint #11 (synced copies) is directly implicated** — both
shell-contract copies must be SHA-verified identical after D1, not assumed.

---

## 7 — CLOSE REQUIREMENTS

- Full test suite run with real exit codes (Rule 7), including the new D4
  convergence test.
- `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts` output
  included verbatim in the handoff — the new v1.18 hash of record.
- Handoff confirms the GD-23 impact assessment (no effect on `HumanDecisionType`,
  `SovereignEventType`, `AgentClass`) explicitly, not by omission.
- Handoff states which numeric fields were actually found behind APEX's
  `narrative` string (D2) and the threshold rule chosen for `status`.
- Commit and push; produce the standard Session Handoff and SBOM update.

---

*SOVEREIGN Platform · Session 44 Opening Prompt · July 19, 2026*
*Companion to: docs/20_Cross_Module_Data_Surface_Architecture.md*
*GD-23 approved by the Project Principal, July 19, 2026*
*Pre-Decisional · Internal Working Document*
