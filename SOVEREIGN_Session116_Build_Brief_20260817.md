# SOVEREIGN Platform — Session 116 Build Brief
## Rehearsal Findings, Sorted for Build Agent Scope · August 17, 2026 · Governance Agent

**Source:** a live rehearsal of the CTO Demonstration Script, Screens 1–6 walked in
full, Screen 7 partial, Screen 8 not attempted. 39 findings recorded, numbered F-1
through F-39 in discovery order.

**Scope discipline for this session, stated up front:** this is a demonstration-
surface repair session, days before a CTO evaluation. **No shell-contract changes.
No new agents. No architecture changes.** Every fix below is either a text change
or a narrowly scoped bug investigation. If any investigation (D1) surfaces a fix
that would require touching the shell contract, a new event type, or more than the
file(s) named, **stop and report in the handoff rather than proceeding** — that
scope decision belongs to the Project Principal, not to this session.

---

## Tier 0 — Investigate First (D1). Do not fix blind.

These are confirmed symptoms with unconfirmed causes. Report findings in the
handoff for every item below before making any code change tied to it.

### F-25 — SCRIBE product-aligned drafting-mode exports do not reach their
destination modules · **HIGHEST PRIORITY**

Two independent live tests, two failures: Rule Change Proposal exported to ARIA
(not found in CLEAR queue as either Analyst or Compliance Officer); Correspondence
Draft exported to NEXUS (nothing appeared in the Travel & Time Queue). A third,
different mechanism on the same SCRIBE screen — the Time & Travel Review tab's
compliance-notice flow — worked and was confirmed on both sides. This strongly
suggests the six product-aligned export modes share a broken path that the Time &
Travel Review flow doesn't use.

```bash
cd ~/Developer/sovereign-platform
grep -rn "SCRIBE_EXPORT_APPROVED\|ExportPanel" --include=*.ts --include=*.tsx module-scribe/src 2>/dev/null
grep -rn "SCRIBE_EXPORT_APPROVED" --include=*.ts --include=*.tsx module-nexus/src module-aria/src 2>/dev/null
```

**Report:** does SCRIBE emit `SCRIBE_EXPORT_APPROVED` on click? Does anything in
NEXUS or ARIA listen for it? If the fix is a small, contained defect (wrong
constant, unregistered listener, a routing target string mismatch) — fix it and add
a regression test proving it now works, matching the project's own standard of
proving a fix by reverting and re-running. **If the fix is structural or touches
more than one or two files, stop, describe exactly what's wrong, and do not attempt
a repair under time pressure.** This blocks Screen 3 and the original Screen 5 as
scripted; Screen 5 already has a working alternate beat (Time & Travel Review) that
does not depend on this fix.

### F-1 — Header displays `CUI` on every screen, contradicting the GD-10 banner

The header shows `PROGRAM_MANAGER · CUI` (and the equivalent for other roles) on
every screen, while Screen 2's banner states CUI requests are refused. Almost
certainly the seeded user's `ClearanceLevel`, a different contract field from data
classification — but nothing confirms this yet, and it must be confirmed before
deciding the fix.

```bash
cd ~/Developer/sovereign-platform
grep -rn "ClearanceLevel" --include=*.ts sovereign-shell/shell-contract.ts
grep -rn "CUI" --include=*.tsx --include=*.ts module-* sovereign-shell/src 2>/dev/null | grep -i "header\|badge\|user"
```

**If confirmed as `ClearanceLevel`:** reseed the development user's clearance to
`UNCLASSIFIED` in whatever fixture/config sets it. This is a data change, not a
contract change — do not touch the `ClearanceLevel` type itself. **Do not suppress
or hide the field** — that would remove information rather than correct it.

### F-16 — NEXUS's classification banner renders yellow; APEX/ARIA/FLOWPATH render
blue, with different wording

```bash
cd ~/Developer/sovereign-platform
grep -rn "GD-10" --include=*.tsx --include=*.ts module-* sovereign-shell/src 2>/dev/null | grep -v node_modules
grep -rln "Classification boundary" --include=*.tsx --include=*.ts . 2>/dev/null | grep -v node_modules
```

**Report:** one shared component with a colour prop, or four separate copies? If
one component, align NEXUS's colour to blue (or confirm yellow is intentional for
the intake-refusal framing and leave it — report either way, don't guess). If four
copies, report the count and do not attempt to consolidate them in this session —
that's real refactoring work, out of scope this close to the demonstration.

### F-8 — Learning Velocity and Dependency Health have no established drill-through

```bash
cd ~/Developer/sovereign-platform
grep -rn "EvaluationFinding\|learningVelocity\|Learning Velocity" --include=*.ts --include=*.tsx . 2>/dev/null | grep -v node_modules
grep -rn "dependencyHealth\|DependencyMap" --include=*.ts --include=*.tsx . 2>/dev/null | grep -v node_modules
```

**Report only — no fix.** If a drill-through exists, note the path. If it doesn't,
this becomes a talking-point decision for the Project Principal, not a build item.

### F-20 — SCRIBE shows no AI disclosure banner on the Drafting Modes tab

APEX, FLOWPATH and NEXUS all show an "AI disclosure (CPMI-VRS Gate 1)" banner.
SCRIBE's Drafting Modes tab did not show one during rehearsal.

```bash
cd ~/Developer/sovereign-platform
grep -rn "AI disclosure\|CPMI-VRS Gate 1" --include=*.tsx module-scribe/src 2>/dev/null
```

**Report:** present on other SCRIBE tabs (Time & Travel Review, PPBE Exhibits) and
absent only on Drafting Modes? Or absent everywhere in the module? If absent on
Drafting Modes specifically — the module whose entire function is AI-assisted
drafting — that's worth a one-line fix matching the existing banner pattern from
another module. Include as D4 only if D1–D2 are clean.

### F-22 — Confirm what "VRS" expands to

```bash
cd ~/Developer/sovereign-platform
grep -rni "verification and readiness\|verification & readiness\|VRS stands\|VRS —\|VRS -" --include=*.md docs/ *.md 2>/dev/null
```

**Report only.** Not a build item — informs the study notes and Q&A prep.

### F-31 — Decision records visible in TRACER are not findable in COUNSEL

```bash
cd ~/Developer/sovereign-platform
grep -rn "COUNSEL-DR-0007\|COUNSEL-DR-0008" --include=*.ts --include=*.tsx --include=*.json --include=*.jsonl . 2>/dev/null | grep -v node_modules
```

**Report only.** If these ids exist only in a TRACER fixture, the decisions are
seeded provenance rather than real COUNSEL records — fine for a demonstration, but
changes what can be claimed about them. If they exist in COUNSEL's own data, it's a
navigation/visibility gap, not a data gap — report and do not attempt a fix this
session.

### F-39 — Cost Dashboard coverage claim may contradict the Integration Brief

The Cost Dashboard banner states all 14 in-scope `AGENT_STEP_COMPLETE` sites are
instrumented. The Integration Brief §4 states 14 of 19 real live-call sites are
instrumented, 5 disclosed as a gap (COUNSEL ×3, FLOWPATH, APEX).

```bash
cd ~/Developer/sovereign-platform
grep -rn "AGENT_STEP_COMPLETE" --include=*.ts module-* 2>/dev/null | grep -v node_modules | grep -v test | wc -l
grep -rn "14 of 19\|in-scope\|live-call sites" --include=*.md docs/ *.md 2>/dev/null
```

**Report:** are "14 in-scope" and "14 of 19" the same 14, with "in-scope" simply
excluding the 5 gap sites by definition — in which case both documents are correct
and just using different denominators — or is there a real discrepancy? Do not edit
either document until this is resolved; whichever framing is confirmed correct
becomes the one used in the demonstration script.

---

## Tier 1 — Fix (D2). Text only, no logic changes, exact wording below.

Apply these once F-1 and F-16's investigations (above) report back, since both
findings feed directly into these fixes.

### F-18 — Classification banner implies content inspection

**Applies to:** APEX, ARIA, FLOWPATH banners (the blue "Classification boundary
(GD-10)" banner). Current wording states data is "blocked and logged" — implies
content inspection, which does not exist.

**Change:**
> Attempts to process CUI, SECRET, or TOP SECRET data are blocked and logged.

**To:**
> Requests marked CUI, SECRET, or TOP SECRET are refused before any model call, and
> the refusal is logged. Classification labels are caller-supplied; content is not
> inspected.

Leave the rest of the banner (GD-10 citation, actor name, "Governance Clock OFF —
all data is synthetic") unchanged. Apply consistently across all instances found in
F-16's investigation.

### F-32 — Reviewer's Workspace banner uses unexplained internal terms

**Current:**
> Each panel embeds the source module's real decision component; a decision
> recorded here is the same governed decision, with the same audit trail, confirmed
> by deciding in either surface. Items appear as their source module publishes them
> this session, and leave the Workspace when decided. Full reference material stays
> in the source module, one click away (docs/22 §2).

**Change to:**
> These are the actual approval controls from each module, not copies. A decision
> made here is the same decision, with the same audit record, as one made in the
> module itself. Items appear when a module publishes them and disappear once
> decided. For full background on any item, open it in its source module.

Drop the `(docs/22 §2)` citation entirely — it resolves to nothing outside the
repository.

### F-35 — Cost Dashboard coverage disclosure uses internal engineering shorthand

**Current** (green box) mixes hook names, test filenames, decision numbers, and doc
citations into one dense paragraph. **Do not delete the technical detail — the
platform already has a pattern for this: TRACER's collapsible "▶ Technical
references" disclosure.** Apply the same pattern here rather than inventing new UI.

**Plain-English summary to show by default:**
> All 14 in-scope agent actions in this session are tracked for cost. Four
> deterministic checks that never call a model aren't included, because they have
> no cost to report. Three COUNSEL tools make live model calls but aren't captured
> here yet — a known gap, not a hidden one. This session's total is complete for
> everything it does track.

**Move the current full paragraph behind a "▶ Technical references" toggle**,
verbatim, unedited — it's accurate, just not meant for a first read.

### F-37 — Time & Travel Review draft is not editable despite "review" framing

**Current header:**
> Pre-populated draft — review before any action.

**Change to:**
> Pre-populated draft — read before sending.

This is a text-only fix for this session. **Adding real edit capability is a
larger change and is explicitly out of scope here** — record it as a roadmap item
in the handoff, do not attempt it.

### F-1 — Apply once confirmed (see Tier 0)

If F-1's investigation confirms a `ClearanceLevel` reseed is the correct fix, apply
it as described above. If the investigation finds something else, report and hold
for a Project Principal decision rather than guessing at a fix.

---

## Tier 2 — Optional (D3). Only if D1 and D2 complete cleanly.

### F-9 — Financial figures carry no currency label or thousands separators

Program tile and Issues card text like "obligated 267000 of 580000" should render
as "obligated $267,000 of $580,000." Apply to Home Dashboard program tiles and
Issues cards. Confirm the same formatting helper is used elsewhere before touching
it — if currency formatting is shared across modules, a single fix may resolve
this everywhere at once; if not, scope to Screen 1 only.

### F-10 — No fiscal-period / as-of date on the Home Dashboard

Add a visible "As of FY 2026 Q4" (or the live equivalent) near the top of Program
Health. This is the highest-value item in this tier — it's what makes every
obligation percentage on the page interpretable at all.

### F-11 — Obligation percentage stated twice per program card, two formats

"46% obligated" appears in the progress line and "— 46 percent." repeats in the
descriptive sentence. Remove the redundant restatement from the sentence; keep the
figure in the progress line only.

---

## Tier 3 — Recorded. No action before the demonstration.

These are genuine findings, several of them strong material for Q&A, but none
should be touched this close to the demonstration. Listed here so they aren't
rediscovered as new work.

| # | Finding |
|---|---|
| F-2 | CPMI-VRS Portfolio Status: green badge over an empty "Not started" table. Real, undecided governance item (Option A recommended in the Backlog). Answer ready if clicked; don't fix. |
| F-3 | `PPBE_EVALUATION_FINDING` orphan event sits under Learning Velocity. Already a known Tier 1 baseline item. |
| F-5 | `sovereign_session_verify.sh` Section 4 (agent count) cannot fail — greps for claims, asserts nothing. Do not touch the parser before the demonstration. |
| F-6 | Tier 2 manifest check cannot detect a duplicated row (demonstrated live this week). Record in `docs/40`; do not touch. |
| F-12 | VIGIL is role-gated from Program Manager (GD-5 mount gate). Correct behaviour. |
| F-14 | No alert visibility for the role that owns the program (VIGIL gate meets Program Manager). Real design question, not a defect. |
| F-19 | Eight SCRIBE drafting-mode cards under one heading; six export, two are `intermediate`. Correct, just visually flat. |
| F-21 | Synthesis and Framing run on the static fallback tier, not a registered prompt — deliberate, documented deferral (July 19, 2026). Do not exercise either mode live in the demonstration. |
| F-23 | Governance Memo → CPMI is unreachable by any demonstration-persona role. Real architectural gap; not fixable by text or a small patch. |
| F-24 | Smart Capture control is present and clickable on the SCRIBE drafting screen. Out of the demonstration by decision — avoid the region; do not attempt to hide the control under time pressure unless a feature flag already exists (check, don't build one). |
| F-26 | ARIA findings have no remediation or reporting path. Architecture gap, name it if asked. |
| F-27 | The organisational operating model (compliance officer working inside the production path) is undefined and unpiloted. Q&A only, held in reserve per Project Principal decision. |
| F-29 | COUNSEL Decision Records carry no regulation basis. **Disclosed by the platform itself** in the TRACER orphan chain — an asset, not a defect. Do not fix; show it. |
| F-30 | COUNSEL decision records lack agent attribution comparable to SCRIBE's document chain. Related to F-29; architecture gap. |
| F-33 | SCRIBE's "Send via Outlook" path is disabled/unbuilt. Say plainly if asked; not a blocker. |
| F-34 | ARC's routing buttons are explicitly disclosed as manual/non-functional in this build. Honest twin of F-25 — contrast the two if asked. |
| F-38 | Timekeeping compliance findings cite a generic "Timekeeping policy," not a specific source (contrast with ARIA/ARC, which cite named regulations). Real gap, pairs with F-29/F-30; not fixable without a data-model change — out of scope. |

---

## Tier 4 — Repo hygiene, low priority, safe to batch

### F-4 — `verify_engineering_profile.sh` is untracked

A real, read-only, pre-access credential audit written August 15, never committed.
Manifest tracks zero `.sh` files, so no manifest row is needed.

```bash
cd ~/Developer/sovereign-platform
git add verify_engineering_profile.sh
git commit -m "chore: track engineering profile pre-access audit script"
```

### F-7 — Unexamined 9,905-byte script in `~/Downloads`

`SOVEREIGN_CTO_Demonstration_Script_20260810.md` in Downloads (9,905 bytes) is a
different file from the tracked repo copy of the same name (8,861 bytes). **Not a
Build Agent task** — this is a Project Principal action: open and read the file
before disposing of it, to confirm it's a superseded draft rather than content that
was lost.

---

## Not build items — script and document revisions (Governance Agent, next pass)

These require the Tier 0 investigations above to resolve first, then a rewrite of
`SOVEREIGN_CTO_Demonstration_Script_20260816.md`:

- **F-17** — drop "one shared rule with no divergent copy" from the script and from
  `SOVEREIGN_CTO_Framework_Applied_v2.md`; replace with the verified `routing.ts`
  enforcement claim.
- **F-28** — restructure Screen 3's persona sequence now that TRACER gates to
  Program Manager, not Compliance Officer or Analyst.
- **F-36** — add the Anomaly Triage Assistant to Screen 4 or 7, once its tab
  location is confirmed.
- Rebuild **Screen 5** around SCRIBE's Time & Travel Review tab rather than the
  original Correspondence Draft beat.
- Complete **Screen 7's** live beat and **Screen 8** in full — neither was verified
  this session.

---

## Done Condition Summary (for the opening prompt)

- **D1 (required):** all nine Tier 0 investigations run; findings reported in the
  handoff, verbatim, including any that recommend no action.
- **D2 (required):** F-18, F-32, F-35, F-37 applied exactly as specified above; F-1
  applied per its D1 finding.
- **D3 (optional, only if D1–D2 clean):** F-9, F-10, F-11.
- **D4 (optional, only if D3 complete):** F-16's fix (if a fix was indicated), F-20's
  fix (if indicated), F-4's commit.

---

*Session 116 Build Brief · August 17, 2026 · Governance Agent*
*Source: live rehearsal, Screens 1–6 verified, Screen 7 partial, Screen 8 not attempted*
*Pre-Decisional · Internal Working Document*
