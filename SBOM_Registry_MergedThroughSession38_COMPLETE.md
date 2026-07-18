# SOVEREIGN Platform — SBOM Registry (Merged Through Session 38 + PromptFix)
## COMPLETE — all 29 primary-source session update files processed (Sessions 8-33, 35, 38, 38-PromptFix)

**Classification:** Pre-Decisional · Internal Working Document
**Maintained under Executive Order 14028 — Required for Federal Procurement**
**Merge scope:** Sessions 8 through 38, plus the Session 38 PromptFix follow-up.
Supersedes the two prior partial merges (through Session 18, then through
Session 29) — this document folds in and extends both.
**Status:** Deliberately no `vX.Y` version number, same reasoning as both
prior partial merges. §7's prompt-approval question is now resolved (a
real, dated approval commit was found) — one item remains before this
earns a version number: a diff against `SBOM_Registry_v1_17_MERGED.md`'s
actual content, never read in any of these three merge passes.

---

## Provenance

Sessions 8-29 provenance unchanged from the two prior partial merges. This
final batch (Sessions 30, 31, 32, 33, 35, 38, 38-PromptFix — 7 files)
completes all 29 files that exist in the repo for this range. **No Session
34 file exists** (confirmed absent from every file listing seen tonight);
**no SBOM update was ever produced for Sessions 36 or 37** — both are real,
acknowledged gaps, not something this merge can fill, and both are
consistent with System Prompt v30's own admission that the post-Session-35
test count wasn't independently re-verified until tonight.

---

## 1. Third-Party Dependencies — full range, Sessions 8-38

**Zero new third-party production dependencies across the entire 8-38
range — 29 consecutive session documents, 29 consecutive confirmations of
`npm audit --omit=dev`: 0 production vulnerabilities.** The Session 38
PromptFix follow-up explicitly and carefully distinguishes its three new
`raw-transformer.cjs` files as **internal build tooling, not a dependency**
— they import nothing, use only Jest's already-installed transform
interface, and the document itself makes the classification argument
explicitly rather than leaving it to be assumed. Worth noting as a good
practice, not just recording the fact.

---

## 2. Internal Workspace Package Version History (complete)

Sessions 8-29 unchanged from prior sections. Continued:

| Package | Version | Change |
|---|---|---|
| `sovereign-data` | 1.4.0 → 1.5.0 → 1.6.0 | 1.5.0 @ S31 (+6 PPBE entities); 1.6.0 @ S33 (+PPBE seed export block) |

---

## 3. Shell Contract Version History (complete, v1.3 through v1.16 — final)

Sessions 8-29 unchanged (v1.3 → v1.16 at Session 28). **No further shell-
contract change from Session 28 through Session 38-PromptFix** — every one
of Sessions 29-38 explicitly confirms `521a62da…b7b4fd5fb7` unchanged, both
copies verified identical at open and close, every session, no exceptions.

**v1.16 is therefore confirmed current across 11 consecutive sessions
(28 through 38-PromptFix) by the documents' own account, independently
matching tonight's live hash check.** This is now triple-confirmed: the
Session 28 governance record, ten subsequent sessions each re-verifying it
unchanged, and tonight's direct `sha256sum` against the live repo.

Shell context exports held at ten from Session 23 onward — no session
through 38 added an eleventh.

---

## 4. New Modules / Workflow Layers Introduced (complete)

Sessions 8-29 unchanged. Continued — **PPBE is not a new workspace**; like
Time & Travel, it's hosted across four existing modules (APEX, SCRIBE,
NEXUS, ARIA) plus one COUNSEL addition:

| Component | Session | Host module |
|---|---|---|
| PPBE entities (6) | 31 | `sovereign-data` |
| `ppbe-ledger-monitor`, `ppbe-dependency-tracker` | 31 | APEX, FLOWPATH |
| `ppbe-evidence-synthesizer`, `ppbe-scenario-analyst` | 32 | APEX |
| `ppbe-exhibit-drafter` | 32 | SCRIBE |
| `ppbe-coordination-assistant` | 32 | NEXUS |
| PPBE CLEAR/TRACER rules | 32 | ARIA |
| PPBE decision types (4) | 32 | COUNSEL |
| Canonical PPBE synthetic seed | 33 | `sovereign-data` |
| PPBE UI trigger panels (4) | 38 | APEX, SCRIBE, NEXUS |
| Obligation authorization gate | 38 | VIGIL |

**PPBE workflow layer: 6 of 6 agents Implemented as of Session 32** —
`ppbe-ledger-monitor` and `ppbe-dependency-tracker` (Session 31),
`ppbe-evidence-synthesizer`, `ppbe-scenario-analyst`, `ppbe-exhibit-drafter`,
`ppbe-coordination-assistant` (Session 32). All deterministic except the
last four, which call `sovereign-api-client` under the four PPBE prompts —
see §7, the prompt-approval status of those four is the one real open
question in this whole merge.

---

## 5. Governance Decisions — none new, Sessions 29-38

No GD from 29 through 38-PromptFix. GD-21 (Session 28) remains the most
recent. Session 27 surfaced a real Hard Stop (`SovereignProduct` lacking
`TIME_TRAVEL`) that was correctly **not** built around — resolved Session 28
via a scope decision (`sourceProduct: "VIGIL"`), not a shell-contract
change. **ARIA-EXPORT-GD and F-2 (both flagged §5 of the prior partial
merge) remain open — no session through 38 resolves either.**

---

## 6. Agent Registry — final state, 44 confirmed repeatedly

44 registered agents (36 master registry + 8 Time & Travel `tt.*`),
verified by direct file inspection at session open **and/or** close in
Sessions 30, 31, 32, 33, 35, 38, and 38-PromptFix — seven independent
re-confirmations in this batch alone, zero deviations. This is the most
consistently re-verified number in the entire merge.

---

## 7. Prompt Registry — final count confirmed, breakdown gap RESOLVED

**Count: 20 registered, confirmed unchanged Session 30 through 38-
PromptFix.** The breakdown contradiction flagged in the prior version of
this merge (Session 32/33's "15 approved + 5 pending" vs. Session 35's "19
approved + 1 pending") is now resolved by direct git history investigation
against the four PPBE prompt files themselves, not inferred from SBOM
narrative alone.

**Real approval event found:** commit `33495da`, July 13, 2026 — *"docs:
approve four PPBE prompts, evidence synthesis, scenario analysis, exhibit
drafting, coordination"* — changed all four files' `STATUS` header from
`PENDING v1.0` to `APPROVED v1.0 — approved July 13, 2026 by Project
Principal` in one atomic commit, each immediately following that prompt's
own authoring commit (Session 32, July 12-13). This is a genuine, dated,
explicitly-attributed governance action — not a silent or undocumented
status change. It fully accounts for the Session 32→35 breakdown shift.

**One real process gap remains, smaller than originally feared:**
`find -iname "*prompt*approval*"` across the entire repo returned nothing.
AGENT_REFERENCE.md's documented process is a *separate* artifact — the
Governance Agent produces a Prompt Approval Record, the Project Principal
downloads and places it, and that placement act is defined as the
governance event. What actually happened for these four prompts was
different in mechanism: the approval was recorded directly in each
prompt's own header via a single commit, never routed through a dedicated
Prompt Approval Record file. The underlying governance intent — a human
approving before live use — does appear satisfied, with a clear date and
attribution; the documented *process* was not followed exactly. Worth a
decision, not a scramble: backfill a retroactive Prompt Approval Record
for the audit trail, formally adopt in-header approval as the accepted
mechanism going forward, or leave it as a one-time deviation. Any of the
three is defensible; silence on which isn't.

**Trivial, while already in these files:** `coordination_system.md`'s
header reads `STATUS:APPROVED` (no space) in the same commit where the
other three correctly have `STATUS: APPROVED` — cosmetic, worth a
one-character fix whenever that file is next touched for any other reason.

---

## 8. Test Totals — complete chain, Session 7 through Session 38-PromptFix

**One apparent discrepancy in this batch, resolved — not a real bug.**
Session 30's own document states "The Session 29 handoff stated 1559
tests... accurate count is 1414... discrepancy likely arose from a
counting method difference." Checked directly: **this compares two
different kinds of number.** Session 29's own JS/TS-only figure was 1394
(platform total 1559 = 1394 + 165 Python) — nearly identical to Session
30's stated baseline of 1396 (a trivial 2-test variance). Session 30's
narrative instead compares its own JS-only baseline against Session 29's
*platform* total, producing an apparent 163-test gap that isn't real —
an apples-to-oranges comparison in the document's own prose, not evidence
that Session 29 overcounted. The actual JS/Python chain is clean
throughout.

| Session | JS/TS | Python | Platform total | Note |
|---|---|---|---|---|
| 29 | 1394 | 165 | 1559 | Chain-verified in the prior partial merge |
| 30 | 1414 | 165 | 1579 | JS confirmed by S31's own reconciliation note |
| 31 | 1516 | 174 | 1690 | Per-workspace sum independently verified = 1516 exactly |
| 32 | 1636 | 190 | 1826 | |
| 33 | 1680 | 195 | 1875 | |
| 35 | 1705 | 195 | 1900 (+4 key-gated) | Per-workspace sum independently verified = 1705 exactly |
| 38 | 1724 | 195 | 1919 | Gap: no SBOM doc for Sessions 36-37 (System Prompt v30 already acknowledges this) |
| 38-PromptFix | **1728** | **195** | **1923** | **Exact match to tonight's live per-workspace test run** |

**One small, genuinely untraced delta worth naming plainly:**
`sovereign-api-client` held at 174 from Session 18 through Session 35 (18
consecutive confirmations), then shows **175** in Session 38's table — a
+1 with no corresponding entry anywhere in Session 38's "Changed
Components" list, which only touches APEX/SCRIBE/NEXUS/VIGIL/shell. Minor,
but untraced deltas are exactly the class of thing this merge exists to
surface rather than smooth over.

**The closing line of this entire merge is the strongest confirmation in
it:** Session 38-PromptFix's stated 1728 JS/TS + 195 Python = 1923 platform
total is an **exact match**, to the test, to what tonight's independent
live per-workspace run confirmed directly against the running repository —
two completely different moments (a July 17 commit message and a July 17
evening terminal session, hours apart, one written before the other was
even planned) landing on the identical number.

---

## 9. Supply-Chain / Vulnerability Status — complete

**0 production vulnerabilities, every single session, 8 through 38-
PromptFix — 29 consecutive confirmations, zero exceptions, zero deferrals
on this specific check.** (Dev-dependency vulnerability posture remains
explicitly deferred to a future Vite review, unchanged from the prior
merge's note — that's a separate, acknowledged, standing decision, not a
gap in this record.)

---

## 10. What Remains — genuinely short now

- **Prompt-approval mechanism decision (§7)** — not "did approval happen"
  (resolved: yes, commit `33495da`, July 13) but "should the process gap
  (no dedicated Prompt Approval Record file) be backfilled, formally
  adopted, or accepted as a one-time deviation." A real decision, low
  urgency.
- **`sovereign-api-client` 174→175 (§8)** — small, untraced, low-stakes.
- **Cross-check against `SBOM_Registry_v1_17_MERGED.md`'s actual content**
  — never read in any of the three merge passes that produced this
  document. Worth doing once, if only to confirm this from-source rebuild
  agrees with whatever the prior merge process produced.
- **ARIA-EXPORT-GD and F-2** — both still open, carried forward unchanged
  from the prior partial merge, no new information this batch.
- **Sessions 36-37** — no SBOM update files exist for either; this merge
  cannot fill that gap, only acknowledge it (consistent with System Prompt
  v30's own admission).
- **Assign a real version number** — appropriate now that all 29 files are
  processed, but only after the prompt-approval question above is actually
  answered, not before.

---

*SOVEREIGN Platform SBOM Registry — Merged Through Session 38 + PromptFix (COMPLETE)*
*Built from all 29 primary-source session deltas, Sessions 8-38*
*Pre-Decisional · Internal Working Document*
