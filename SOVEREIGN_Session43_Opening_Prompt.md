# SOVEREIGN Platform — Session 43 Opening Prompt
## Fix Confirmed E2E/Verification Findings — WF-14, Repo Duplicate, Stale Verify Script

**Prepared by:** Governance Agent, July 19, 2026
**Source:** `SOVEREIGN_EndToEnd_Assessment_20260719.md` — read it first for full evidence
**Session number assumed:** 43 — confirm no other session has run since 42 before using this number.
**Status:** Pre-Decisional · Internal Working Document

**Scope note:** this prompt intentionally covers only the code-level findings from the assessment.
The agent-count drift and ARIA-pattern documentation are governance-document edits handled
separately. The SCRIBE prompt gap needs a Project Principal decision before any code task exists.
Do not expand scope to any of these three even if convenient mid-session.

---

## CLOSE PROTOCOL — same as Session 42, still non-negotiable

The session is not finished until `git push` has actually executed and its real output is shown.
`SOVEREIGN_Session43_Handoff.md` and `SBOM_Session43_Update.md` as real committed files, pushed,
is part of the Done Condition, not a follow-up request.

---

## 1 — SESSION HEADER

**HEAD at time of writing:** verify fresh via `git log -1` — should be `ce8a39e` or later.

**Shell contract:** not expected to change. All three items below are module-local or tooling fixes.

---

## 2 — CRITICAL CODEBASE FACTS (confirmed by direct source read, per the assessment)

- **The seven confirmed `#94a3b8` locations:** `sovereign-shell/src/PlatformHome.tsx:331`
  (`factDetailStyle`, on `#ffffff`); `module-apex/src/PPBEAgentsPanel.tsx:240` (disabled button
  text, on `#e2e8f0`) and `:247` (phase tag, on `#f1f5f9`); `module-counsel/src/PreMortemStudio.tsx:206`,
  `CounterargumentPanel.tsx:279`, `DecisionFramer.tsx:235` and `:305`, `AnalysisPanel.tsx:178`
  (all COUNSEL source-tag/hint text, 11-12px).
- **`#475569` is already a confirmed-passing color against `#ffffff`** in the existing
  `wcag-contrast.test.ts` inventory (Layer 3, Session 29 audit) — a reasonable starting candidate
  for the `#ffffff`-background instances, since it's already validated rather than a fresh guess.
  It has not been verified against `#e2e8f0` or `#f1f5f9` (the APEX instances) — compute or test
  this explicitly, don't assume it transfers.
- **`docs/12_NEXUS_Architecture.md` is the canonical location**; a byte-identical copy sits at the
  repo root and is stale residue per the File Location Reference.
- **`sovereign_session_verify.sh`'s `EXPECTED_HEAD` and expected shell-contract hash are pinned to
  a pre-Session-41 state**, producing false WARNs on every run since. Current values: HEAD `ce8a39e`
  (or later — verify fresh), shell-contract v1.17, hash `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78`.

---

## 3 — ACTIVE GOVERNANCE DECISIONS

None.

---

## 4 — DONE CONDITION

### D1 — Required — WF-14: fix the contrast failure at all seven locations

Replace `#94a3b8` with a color that passes WCAG AA (≥4.5:1 for this text size in all seven cases —
none of these are large text) against each instance's actual background. Verify computationally
against each background listed above, don't assume one replacement color works everywhere if the
backgrounds differ enough to matter.

**Also close the test gap the assessment specifically flagged:** add these seven pairs to
`e2e/tests/wcag-contrast.test.ts`'s inventory so this class of failure is actually caught going
forward, not just fixed once. This is as important as the fix itself — the assessment's core point
was that a green test suite didn't catch this because the inventory was incomplete.

### D2 — Required — remove the duplicate architecture doc

Remove the stale root-level `12_NEXUS_Architecture.md`, keeping `docs/12_NEXUS_Architecture.md` as
canonical. Confirm byte-identical before removing (don't assume the assessment's confirmation is
still current if anything changed since).

### D3 — Required — update the verification script's pinned expectations

Update `sovereign_session_verify.sh`'s `EXPECTED_HEAD` and expected shell-contract hash to current
values (§2 above). This directly addresses the assessment's own observation: a script producing
routine false WARNs trains people to stop trusting its real ones.

---

## 5 — AUTONOMOUS OPERATION RULES

- All three items are small and well-evidenced — no Hard Stop expected on any of them.
- Do not touch `Agent_Identity_Standard.md`, `AGENT_REFERENCE.md`, or any SCRIBE prompt file, even
  if D1's work happens to pass near them. Those are explicitly out of scope this session.
- Re-run `wcag-contrast.test.ts` after D1 and confirm it now genuinely exercises all seven new
  pairs — don't just add them to a data structure without confirming the test actually runs against
  them.

---

## 6 — STANDING CONSTRAINTS

All 11 apply. None anticipated to be directly implicated.

---

## 7 — CLOSE REQUIREMENTS

- Full test suite run with real exit codes (Rule 7) — specifically confirm `wcag-contrast.test.ts`'s
  new test count reflects the seven additions.
- `SOVEREIGN_Session43_Handoff.md` and `SBOM_Session43_Update.md` written as real files, committed,
  pushed, push output shown — per the Close Protocol above.
- Handoff states the exact replacement color(s) chosen and their verified ratios against each
  background, not just "fixed."

---

*SOVEREIGN Platform · Session 43 Opening Prompt · July 19, 2026*
*Source: SOVEREIGN_EndToEnd_Assessment_20260719.md*
*Pre-Decisional · Internal Working Document*
