## 1. SESSION HEADER

Session 117. Prior close: Session 116, terminal HEAD `f8e646e` — confirm with
`git log -1` before proceeding. Shell contract: v1.28, both copies
`c99355ce…681b`, confirmed unchanged at Session 116's close. **This session makes
no shell-contract changes; confirm the hash is still unchanged at this session's
close too.**

**Purpose:** single item. Add an AI-disclosure banner to SCRIBE, app-wide. This was
investigated and fully diagnosed in Session 116 (F-20) — no further investigation
needed. Decided by the Project Principal: app-wide, matching APEX and FLOWPATH's
existing pattern, not scoped to one tab.

## 2. CRITICAL CODEBASE FACTS

- SCRIBE has **no local banner primitive** — no `banners.tsx`, no
  `GovernanceBanner` component anywhere in `module-scribe/src`. This is net-new UI,
  not a reuse of an existing SCRIBE component.
- The pattern to match already exists in `module-apex/src/banners.tsx` and
  `module-flowpath/src/banners.tsx` — both use a blue `governanceBannerStyle`
  (`#eff6ff` background, `#1e40af` text), and both render an "AI disclosure
  (CPMI-VRS Gate 1)" banner. Match that visual style exactly; do not invent a new
  one.
- SCRIBE has three tabs: Drafting Modes (`DraftWorkspace.tsx`), Time & Travel
  Review (`TTManagerReview.tsx`), PPBE Exhibits (`PPBEExhibitPanel.tsx`). The
  banner must appear on all three — render it at the `ScribeApp` top level, above
  the tab content, so it isn't duplicated per-tab and can't be missed on any one of
  them.
- `SmartCapturePanel.tsx:61` carries an unrelated small disclosure line — leave it
  untouched, it is out of scope and belongs to a different feature (Smart Capture
  is out of the demonstration by decision).

## 3. ACTIVE GOVERNANCE DECISIONS

None required. No shell-contract change, no new event type, no new agent, no
contract-level type change. This is a presentational addition only.

## 4. DONE CONDITION

- **D1 — required, and the only deliverable this session.** Add a permanent
  banner at the `ScribeApp` top level, visible above all three tabs, using the
  existing blue `governanceBannerStyle` pattern from `module-apex/src/banners.tsx`
  or `module-flowpath/src/banners.tsx` (reuse the style constant if it can be
  imported cleanly; duplicate it locally if not — your judgement on which is
  cleaner for this codebase, document the choice in the handoff).

  **Exact text, no authorship latitude:**

  > AI disclosure (CPMI-VRS Gate 1): All drafting in SCRIBE is AI-assisted.
  > Outputs are advisory and must be reviewed and approved by a qualified human
  > before export.

- No D2, D3, or D4 this session. If, while implementing D1, you find something
  that would require touching more than `ScribeApp.tsx` and one style/constants
  file, stop and report rather than expanding scope four days before a
  demonstration.

## 5. AUTONOMOUS OPERATION RULES

- May decide independently: whether to import the existing style constant or
  duplicate it locally; exact component structure (a new small
  `ScribeGovernanceBanner` component vs. inline JSX) — whichever matches the
  codebase's existing convention most closely.
- Must surface, not act on: anything requiring a change outside
  `module-scribe/src`; any test failure not directly caused by this addition;
  any indication that `ScribeApp`'s top level is structured in a way that makes a
  single shared banner awkward to place (e.g., if tabs render through separate
  root components rather than one shell) — report the actual structure found
  rather than forcing the plan to fit.

## 6. STANDING CONSTRAINTS

All 11, every session, per `AGENT_REFERENCE.md`. No shell-contract change. Never
raise `.sovereign_check_baseline`. Build Agent places, never authors or
restructures a governance document — this prompt is the spec; do not modify it or
any file outside `module-scribe/src` and its own tests.

## 7. CLOSE REQUIREMENTS

- `sovereign_session_verify.sh`, full real output quoted in the handoff.
- Full test suite re-run, all workspaces, real exit codes.
- `tsc` clean.
- Shell contract SHA confirmed unchanged, both copies, still `c99355ce…681b`.
- At least one test confirming the banner renders on all three SCRIBE tabs — a
  visible, testable claim, not just "added."
- Handoff (`SOVEREIGN_Session117_Handoff.md`) and SBOM update
  (`SBOM_Session117_Update.md`) produced, committed, pushed — same close protocol
  as every session. Terminal HEAD recorded in `DOCUMENT_MANIFEST.tsv`, not the
  handoff.

---

Begin now.
