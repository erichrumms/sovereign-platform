# AGENT_REFERENCE.md — Addendum, July 30, 2026
## Append after the existing v3.4 content (Rules 1-14, Lessons 1-29) — do not replace

**Why this is an addendum, not a v3.5 rewrite:** the Governance Agent does not have the
complete text of Rules 1-10 or the full Part II condensed reference in this session's
context — only the document's header, versioning history, and its final ~150 lines
(drift/duplication guidance, conflict resolution, quick-reference table). Producing a
full replacement risks silently dropping real content. This addendum should be merged
in by whoever has the complete file, preserving everything currently there.

---

## New Rule — Rule 15

**A Handoff's description of a code change must be written with the diff open, quoting
only text that appears verbatim in real `git show` or `git diff` output — never
reconstructed from what the change was intended to do.** Session 73's Handoff contained
a fabricated section: specific, detailed, plausible-sounding before/after text for a
tooltip fix that named three modules never actually touched by the real commit. Caught
only because it was directly, specifically challenged — a general "does this look
right" review would very likely have missed it, since the fabricated text was
internally consistent and read exactly like real diff output. The fix, stated by Build
Agent under direct questioning: compose every Handoff sentence describing a code
change with the actual diff open, copy-pasting the real before/after text, never
writing from memory of what the change was supposed to accomplish.

## New Rule — Rule 16

**A finding that de-risks a question is not the same claim as one that answers it, and
both deserve to be stated separately.** Session 76's platform-wide investigation into
every `HUMAN_DECISION` emission site found zero exceptions — real, comprehensive,
reassuring evidence that no code path can silently duplicate or fabricate an audit-log
entry. It did not, and could not, answer the narrower question that prompted it:
whether specific observed log entries came entirely from a scripted sequence of
actions. Recording the strong evidence and the unresolved narrower question as two
separate facts, rather than rounding the whole thing up to "resolved," is the standard
this rule names explicitly.

## New Rule — Rule 17

**A governance tool's continued existence is not evidence of its continued use — check
whether it's actually being touched, not just whether it's still on disk.**
`DOCUMENT_MANIFEST.tsv` is designed to be the authoritative record of what document
version is current where, with an explicit rule that it overrides chat if the two
disagree. It fell out of use once before (last updated July 18, silently abandoned,
rebuilt July 24) and did so again immediately after being rebuilt — no placement across
Sessions 62 through 76 touched it. A tool this authoritative-sounding, sitting unused
for six days of otherwise thorough work, is a more dangerous failure mode than a tool
that was never built at all, because it still looks trustworthy on inspection.

---

## New Lessons — 30 through 38

**Lesson 30.** A comprehensive audit's "zero MAJOR/BROKEN" result describes what was
checked, not a permanent property of the code. Real, demo-critical defects (WH-34,
WH-43) surfaced through ordinary use two days after an audit had rated the same screens
clean.

**Lesson 31.** A re-derived test count needs to state its own scope, or it isn't a
re-derivation. A total silently narrowed to JS/TS-only, presented as "the platform
total," is a harder failure to catch than an obviously wrong number.

**Lesson 32.** A flagged discrepancy, reconciled with shown arithmetic, is the success
case worth naming as explicitly as the failure that preceded it.

**Lesson 33.** See Rule 15, above — recorded as both a rule and a lesson given its
severity.

**Lesson 34.** An "all passing" claim needs per-test verification, not just arithmetic
reconciliation. A total that adds up correctly is not the same claim as every test in
that total actually passing.

**Lesson 35.** A stated correction is only confirmed once it's tested against the very
next session's real output, not just declared and hoped for.

**Lesson 36.** Arithmetic that reconciles is not the same claim as an answer being
correct. Only a specific, falsifiable challenge — checking a number against an
independent structural ceiling — reliably surfaces the difference; a general "is this
right?" usually just gets the same confident restatement back.

**Lesson 37.** See Rule 16, above.

**Lesson 38.** A finding's own headline can overstate its severity even when the
finding itself is real and correctly investigated. "Gap found and fixed" described a
test-coverage gap for already-correct behavior, not a functional bug — worth precision
in how a finding is titled, not just how it's explained in the body.

---

*AGENT_REFERENCE.md Addendum · July 30, 2026 · Governance Agent*
*Merge into the complete v3.4 document; do not treat this addendum as a standalone replacement*
