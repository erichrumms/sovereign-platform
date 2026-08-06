# SOVEREIGN Platform — Session 94 Handoff
**Date:** August 5, 2026
**Session type:** Documentation accuracy correction — no code changes
**Branch:** main
**Shell-contract version:** v1.28 (unchanged)

---

## Session Scope

Session 94 was scoped to one task: verify whether "AGENT_REFERENCE Rules 11-14" cited
in `docs/36_Router_Inspection_Audit_Process.md` and in Session 92's Handoff actually
exist as formally defined numbered rules, and correct docs/36 only where confirmed
real rule numbers can be substituted. No code changes were authorized.

---

## Done Condition Status

**D1 — Full-repository search for the three named principles:** ✅ Complete  
**D2 — Correct docs/36 where confirmed real references exist:** ✅ Complete (correction note added; no inline substitutions — confirmed real rule numbers do not exist for any of the three principles)  
**D3 — Committee Review Standard findings for unformalized principles:** ✅ Complete (below)  
**D4 — Session 94 Handoff committed and pushed:** ✅ Complete (this file)

---

## Search Method and Evidence

Searched all `.md` files in `/Users/developmentsystem/Developer/sovereign-platform/`
using `grep -rn` for the following terms:

- `Rule 12`, `Rule 13`, `Rule 14` (any form)
- `### Rule 12`, `### Rule 13`, `### Rule 14`, `Rule 12 —`, `Rule 13 —`, `Rule 14 —`
- `single computation`, `one fact`, `one computation`
- `root cause.*elsewhere`, `search.*pattern`, `search.*elsewhere`
- `safeguard.*presence`, `continued.*evidence`, `still active`
- `Rule 11/12`, `Rules 11-14`

Also read: `AGENT_REFERENCE_Addendum_20260730.md` (complete), `AGENT_REFERENCE.md`
rules section (lines 1423–1607), `SESSION_71_HANDOFF.md`, relevant sections of
`SOVEREIGN_Findings_Report_20260728.md`, `SOVEREIGN_Agent_to_Agent_Briefing.md`,
`docs/SOVEREIGN_PPBE_MultiYear_DataModel_Architecture_20260730.md`, and all files in
`docs/` that produced grep hits.

**The search found no formal definitions** for Rules 12, 13, or 14 in any governance
document. Every occurrence of "Rule 12" and "Rule 13" in the repository is a
citation, never a definition. "Rule 14" appears only as part of the "Rules 11-14"
group reference in docs/36 — it is never individually named, cited, or described.

---

## What Session 92's "Rule 11" Citations Mean

Session 92's Handoff (`SOVEREIGN_Session92_Handoff.md`) cites "Rule 11 (one
computation for one fact)" repeatedly as an existing numbered rule. This was accurate
to the informal practice at the time — "Rule 11" was a widely-understood shorthand
for the single-computation principle throughout Sessions 71–92. Session 93 then added a
formal Rule 11 to AGENT_REFERENCE.md covering a different topic (shell-contract-bump
parity reporting). This created a retroactive numbering collision: Session 92's "Rule
11" now reads as pointing at the shell-contract-bump rule, which is not what it meant.

**This document records that gap per the task instructions. Session 92's Handoff is
not modified.** The appropriate resolution — whether to renumber or to formally add the
single-computation principle under a new number — belongs to the Governance Agent /
Project Principal.

---

## What Was Changed in docs/36

**File:** `docs/36_Router_Inspection_Audit_Process.md`

**Change:** Added a correction note (labeled "August 5, 2026 citation-accuracy note —
Session 94") after the existing "August 5, 2026 addendum — Session 92" paragraph in
§1 (Scope). The note:

1. States that Rules 12, 13, and 14 do not exist as formally defined numbered rules —
   confirmed by direct grep.
2. Explains that the "Rule 11 (single computation)" citations predate Session 93's
   formal Rule 11 and now conflict with it.
3. Identifies Rule 17 (Addendum) as the closest formal analog to "Rule 13" but notes
   it is specifically about governance documents on disk, not monitoring agent
   safeguards — not an exact match.
4. States explicitly that no inline body text was rewritten (no confirmed replacement
   rule numbers exist to substitute).
5. References this Handoff for the Committee Review Standard findings.

No other edits were made to docs/36. The §1 body "Per Rule 11..." (line 50),
§4 "Single-computation compliance (Rule 11)," §5 table "Rule 11 (single computation)
and Rule 12...," §6 step 5 "Rule 13," §6 step 8 "Rule 13's own logic," §8 "Rules
11-14" — all left as written, since substituting non-existent rule numbers would
compound the inaccuracy.

---

## Committee Review Standard Findings

---

### FINDING A — "Single computation for one fact" principle is unformalized

**FINDING:**
The principle "a derived value must be computed once and reused, not independently
recomputed by a second consumer" — widely cited as "Rule 11" in session handoffs
from Sessions 71 through 92 — has never been formally written into AGENT_REFERENCE.md
as a numbered rule. Session 93 then formalized a different Rule 11 (shell-contract-
bump parity reporting), making further informal use of "Rule 11" for this principle
ambiguous or incorrect.

**EVIDENCE:**
- `AGENT_REFERENCE.md` lines 1423–1607: Rules section contains Rules 1–11 only.
  Rule 11 (added Session 93, line 1573) reads: "Any session that bumps the shell-
  contract version must explicitly run and report the Workspace parity-test suite."
  No text in any section of AGENT_REFERENCE.md defines "single computation for one
  fact" as a numbered rule.
- `grep -rn "### Rule 12\|Rule 12 —"` across all `.md` files: zero hits.
- `grep -rn "single computation\|one fact.*computation"` across all `.md` files:
  all hits are citations of the informal convention, not definitions.
- Session 71 Handoff (`SESSION_71_HANDOFF.md` line 12): "Two separate computations
  for the same set — Rule 11 violation." — informal citation, pre-Session-93.
- Session 92 Handoff: "Rule 11 (one computation for one fact)" cited eight times.
  All pre-date the formal Rule 11 added in Session 93.
- `SBOM_Session92_Update.md` Section 5: "Rule 11: one fact, one computation, reused"
  — the only sustained prose articulation of this principle in the repository, in a
  session update document, not in AGENT_REFERENCE.md.

**CONSTRAINTS IMPLICATED:**
- CLAUDE.md Rule 4 (Build Agent does not author governance documents): prevents
  this session from adding the rule.
- AGENT_REFERENCE.md Part II: "Rules That Prevent Most Problems" — this principle
  belongs in that section.
- Session 93 precedent: the principle was informally Rule 11; that number is now
  formally taken.

**OPTIONS CONSIDERED:**

Option A — Add the single-computation principle as Rule 12 in AGENT_REFERENCE.md.  
*Achieves:* formalizes the most widely-used informal principle in the repository.  
*Risks:* Build Agent authors a governance document, violating CLAUDE.md Rule 4.  
*Status:* Not authorized for this session.

Option B — Leave as informal convention; note the gap in the Handoff.  
*Achieves:* no unauthorized governance edit; preserves the finding for the correct
decision-maker.  
*Risks:* continued citation confusion between the old informal "Rule 11" and the
current formal Rule 11.  
*Status:* **Selected for this session.**

Option C — Renumber Session 93's formal Rule 11 to Rule 12 and assign Rule 11 to
the single-computation principle retroactively.  
*Achieves:* resolves the numbering collision.  
*Risks:* rewrites a recently-formalized rule; affects the SBOM v1.60 entry and
Session 93 Handoff citations. Governance Agent / Project Principal decision.  
*Status:* Not authorized for this session; noted as an option for the decision-maker.

**RECOMMENDED RESOLUTION:**
Governance Agent formalizes the single-computation principle as a numbered rule in
AGENT_REFERENCE.md, choosing a number that avoids collision with the existing Rule 11.
If Option C (renumber) is rejected, the natural candidate is Rule 12 — consistent with
how the principle has been informally cited alongside root-cause search ("Rule 12")
throughout the repository. The full rule text should closely match the articulation in
SBOM_Session92_Update.md Section 5, which is the most complete existing prose version:
"One fact, one computation. When a derived value (a count, a badge, a status) must be
displayed on more than one surface, the single computation that produces it must be
shared — not independently reimplemented."

**JUSTIFICATION:**
This principle has been the operative rule for WH-43 (Session 71), WH-43 re-diagnosis
(Session 92), Walkthrough H findings, and the PPBE DataModel Architecture doc. It has
reached the same pattern threshold — six+ uses, consistently applied, evidently
governing real decisions — that other principles followed before becoming formal rules.
Leaving it informal now that Rule 11 has been claimed creates active confusion in
future sessions that must cross-reference these conventions.

**PROPAGATION REQUIRED:**
- AGENT_REFERENCE.md: add formal rule (Governance Agent)
- docs/36: inline "Rule 11 (single computation)" and "Rules 11-14" group citations
  updated to the real number (can be deferred to the same Governance Agent session)
- Session 92 Handoff: not modified (historical document); gap noted in this Handoff

---

### FINDING B — "Root-cause search for same pattern elsewhere" is unformalized

**FINDING:**
The discipline "when a root cause is confirmed, search the entire codebase for the
same pattern before declaring the issue closed" — cited as "Rule 12" in multiple
session documents — has never been formally defined in AGENT_REFERENCE.md or any
other governance document.

**EVIDENCE:**
- `grep -rn "### Rule 12\|Rule 12 —"` across all `.md` files: zero definition hits.
  Every occurrence is a citation.
- `SESSION_71_HANDOFF.md` line 16: "Rule 12: FLOWPATH Review and Activity panels
  examined — FLOWPATH uses a session store with APPROVED-state check; no ESCALATED
  equivalent. Same root cause isolated to NEXUS Travel." — first documented informal
  use; the notation is cited as if already known, suggesting earlier informal
  convention.
- `SOVEREIGN_Agent_to_Agent_Briefing.md` line 88: "confirmed no other instance of
  WH-49's root cause exists elsewhere (Rule 12)." — cited as standing practice.
- `docs/SOVEREIGN_PPBE_MultiYear_DataModel_Architecture_20260730.md` line 57:
  "platform-wide search for this pattern (Session 76, Rule 12 discipline) found no
  other instance." — cited as discipline, not as a document-defined rule.
- `SOVEREIGN_Findings_Report_20260728.md` lines 139-140: "consistent with Rule 12's
  own warning: a root-cause fix isn't closed until the codebase is searched for the
  same root cause elsewhere."
- `SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_Addendum_7_20260730.md`:
  "Rule 12 search — negative result, recorded."
- AGENT_REFERENCE.md: no text anywhere contains this principle as a formal rule.

**CONSTRAINTS IMPLICATED:**
- CLAUDE.md Rule 4: prevents Build Agent from adding the rule.
- The principle is operationally identical to Part II's general debugging rigor
  (Rule 8), but targeted specifically at the "same root cause pattern" step — the
  Part I Lessons section's Lesson 12 is about agent count verification, unrelated.

**OPTIONS CONSIDERED:**

Option A — Formalize as a numbered rule in AGENT_REFERENCE.md.  
*Achieves:* closes the gap; makes existing informal citations accurate.  
*Risks:* CLAUDE.md Rule 4 applies; this is Governance Agent work.  
*Status:* Not authorized for this session.

Option B — Leave informal; record gap in Handoff.  
*Status:* **Selected for this session.**

**RECOMMENDED RESOLUTION:**
Governance Agent adds a formal numbered rule. Given that the single-computation
principle (Finding A) is being recommended as Rule 12 (if the informal numbering is
honored), this principle would naturally become Rule 13. If Rule 11 is renumbered
(Option C in Finding A), the numbering shifts accordingly — both choices are
Governance Agent / Project Principal decisions.

Suggested rule text: "When a root cause is confirmed, search the codebase for every
other instance of the same pattern before considering it closed. A fix that addresses
only the presenting instance may leave the same defect latent in features added after
the original fix — as NEXUS Travel demonstrated in Session 71 and as Rule 12
discipline has been applied since."

**JUSTIFICATION:**
This principle has been applied by name ("Rule 12 discipline," "Rule 12 search") in
at least five distinct session documents across Sessions 71–93. It is already
functioning as a formal rule in practice. Its absence from AGENT_REFERENCE.md means
sessions must rely on informal recall or cross-referenced handoffs, rather than a
single authoritative source.

**PROPAGATION REQUIRED:**
- AGENT_REFERENCE.md: add formal rule (Governance Agent)
- docs/36: §5 table "Rule 12 (search for the same root cause elsewhere)" updated to
  the real number (Governance Agent, same session)

---

### FINDING C — "Safeguard existence ≠ evidence of continued activity" is partially covered by Rule 17

**FINDING:**
The principle cited as "Rule 13" in docs/36 — "a safeguard's presence isn't evidence
it's still active; confirm rather than assume" — is not formally defined under that
number or any other in AGENT_REFERENCE.md. Rule 17 in AGENT_REFERENCE_Addendum_
20260730.md covers the same underlying insight applied to governance documents
specifically, but its scope does not extend to monitoring agents and anomaly-detector
thresholds, which is the docs/36 application.

**EVIDENCE:**
- `grep -rn "### Rule 13\|Rule 13 —"` across all `.md` files: hits only in docs/36
  and the root-level `Router_Inspection_Audit_Process.md` (the earlier draft of docs/36).
  No definition found in AGENT_REFERENCE.md.
- AGENT_REFERENCE_Addendum_20260730.md Rule 17 (lines 39-48): "A governance tool's
  continued existence is not evidence of its continued use — check whether it's
  actually being touched, not just whether it's still on disk. `DOCUMENT_MANIFEST.tsv`
  is designed to be the authoritative record..." — specifically about governance
  documents. The illustrating example is DOCUMENT_MANIFEST.tsv going unused for six
  days.
- docs/36 §6 step 5: "Rule 13 — a safeguard's presence isn't evidence it's still
  active; confirm rather than assume" — context is "monitoring tier and anomaly-
  detector thresholds" registered in the Agent Identity Standard.
- These are the same principle applied to different objects: Rule 17 = governance
  documents; docs/36 "Rule 13" = monitoring agent safeguards. They are not
  interchangeable citations.
- `grep -rn "### Rule 14\|Rule 14 —"` across all `.md` files: zero hits. "Rule 14"
  is never individually cited or defined anywhere.

**CONSTRAINTS IMPLICATED:**
- CLAUDE.md Rule 4: prevents Build Agent from adding the rule.
- The "don't guess at partial matches" instruction (Session 94 opening prompt): Rule 17
  is not confirmed to cover the docs/36 application — not substituted.

**OPTIONS CONSIDERED:**

Option A — Cite Rule 17 in docs/36 as the applicable rule for "Rule 13."  
*Problem:* Rule 17 governs governance documents on disk, not monitoring agent
safeguards. Substituting it would create a different kind of inaccuracy.  
*Status:* Rejected per "do not guess at partial matches" instruction.

Option B — Extend Rule 17's scope explicitly to cover monitoring agent safeguards.  
*Problem:* CLAUDE.md Rule 4. Also, these may deserve separate rules since the
failure modes are different (a governance document becoming stale vs. a monitoring
agent silently deregistered or threshold-shifted).  
*Status:* Governance Agent decision.

Option C — Add a new formal rule for the monitoring-agent application.  
*Problem:* CLAUDE.md Rule 4.  
*Status:* Governance Agent decision.

Option D — Leave as informal; record gap in Handoff.  
*Status:* **Selected for this session.**

**RECOMMENDED RESOLUTION:**
Governance Agent chooses between Options B and C — either extending Rule 17's scope
or adding a sibling rule. The underlying principle ("presence on a list ≠ active
behavior; verify directly") is the same, but the audit actions differ: for a governance
document you check whether the file was recently written; for a monitoring agent you
query the Agent Identity Standard and confirm the registered threshold is still what
the live configuration uses. A single rule can cover both with distinct verification
guidance, or two rules can separate the concerns. Either is defensible; both are
Governance Agent decisions.

**On Rule 14:** This session found no individual citation or description of "Rule 14"
anywhere in the repository. Its only appearance is as the silent fourth member of
the "Rules 11-14" group reference. It may be a rounding artifact (the author may have
intended a four-rule group when only three principles were identified), or it may name
a fourth principle that was never articulated. No action can be taken without evidence
of what Rule 14 was intended to be.

**PROPAGATION REQUIRED:**
- AGENT_REFERENCE.md: Governance Agent resolves the Rule 17 / "Rule 13" gap.
- docs/36 §6 step 5 and step 8 "Rule 13" citations: updated to real number once one is
  assigned.
- docs/36 §1 and §8 "Rules 11-14" group references: updated to accurate rule set once
  finalized.

---

## Additional Finding: AGENT_REFERENCE.md Line 1603 Phantom Cross-Reference

**FINDING:**
AGENT_REFERENCE.md Rule 11 (line 1603) contains a cross-reference: "Known Codebase
Fact about derived-value defects (Rule 11/12 from Part I)." Direct search of Part I
of AGENT_REFERENCE.md finds no Known Codebase Fact about derived-value defects. The
"Rule 11/12 from Part I" reference is a phantom — it points to content that does not
appear to exist in the document.

**EVIDENCE:**
- `grep -n "derived.value"` in AGENT_REFERENCE.md: two hits, both at lines 1576 and
  1603 within Rule 11 itself (Part II). Zero hits in Part I.
- AGENT_REFERENCE.md Part I Known Codebase Facts section (lines 507–618): no entry
  about derived-value defects or badge parity.
- "Rule 11/12 from Part I" most likely refers to Constraints #11 and #12 (the Five
  Synced Copies constraint and a possible sibling), but Constraint #12 does not exist
  in Part I either — only Constraint #11 appears.

**This finding is noted, not corrected.** Editing AGENT_REFERENCE.md to add or fix
a cross-reference is a Governance Agent task. The phantom cross-reference is recorded
here so the Governance Agent can verify and correct the line during the next
AGENT_REFERENCE.md revision.

---

## Files Changed This Session

| File | Change | Reason |
|---|---|---|
| `docs/36_Router_Inspection_Audit_Process.md` | Added citation-accuracy correction note after the Session 92 addendum in §1 | Primary task — correct the false "Rules 11-14" attribution with evidence-backed explanation |
| `SOVEREIGN_Session94_Handoff.md` | Created (this file) | Session close artifact |
| `SBOM_Session94_Update.md` | Created | docs/36 was modified; SBOM update required per precedent |

**No code files were changed. Shell-contract unchanged. No test runs needed.**

---

## Shell-Contract Parity Test Report (Rule 11 — no bump this session)

Shell-contract version is unchanged at v1.28. Rule 11 requires explicit parity
reporting only on a version bump. Reporting proactively per Session 93 template:

No shell-contract bump occurred. No parity test obligation triggered this session.

---

## Open Items for Governance Agent / Project Principal

1. **Formalize the three principles** as numbered rules (AGENT_REFERENCE.md):
   - "Single computation for one fact" — informally Rule 11 pre-Session 93; now needs
     a new number. Rule 12 is the natural next in the Part II sequence.
   - "Root-cause search for same pattern elsewhere" — informally Rule 12; would
     become Rule 13 if single-computation takes Rule 12.
   - "Safeguard/tool existence ≠ evidence of continued activity" — informally Rule 13;
     relationship to formal Rule 17 needs explicit resolution.

2. **Decide on Rule 11 numbering collision**: the current formal Rule 11 (parity
   reporting) took the number that the informal convention "single computation" had
   been using. Options: leave Rule 11 as-is and assign new numbers (12/13/14); or
   renumber Session 93's Rule 11 to Rule 12 and assign Rule 11 to single-computation
   (matches prior informal convention). Either works; neither is a Build Agent decision.

3. **Clarify the AGENT_REFERENCE.md line 1603 phantom cross-reference** ("Known
   Codebase Fact about derived-value defects (Rule 11/12 from Part I)") — no such
   Known Codebase Fact exists in Part I.

4. **Decide whether to update Session 92's Handoff note** about "Rule 11 (one
   computation for one fact)" — those citations were accurate at the time of writing
   but now conflict with the formal Rule 11. Historical document, not modified here.

5. **Rule 14**: was there a fourth intended principle in "Rules 11-14"? No individual
   citation or description found. Governance Agent to determine if it names something
   real or was a rounding artifact.

---

## Commit Log

| Commit | Message |
|---|---|
| (to be recorded after push) | docs(36): add Session 94 citation-accuracy correction note for Rules 11-14 |
| (to be recorded after push) | build: Session 94 close — handoff + SBOM v1.61 (docs/36 correction, no code changes) |

---

*SOVEREIGN_Session94_Handoff.md · August 5, 2026 · Build Agent*
*Session type: documentation accuracy correction — no production code changed*
