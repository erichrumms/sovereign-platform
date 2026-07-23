# Walkthrough G — Findings Report and Path Forward
## July 21, 2026 · Final — both sessions folded in

**Status:** Walkthrough G is closed for real this time. Parts 2 and 3 were fully completed in a
second pass after this report's original close. Only Part 1 (Home Dashboard cold-start behavior)
remains genuinely blocked — on WG-1, by design, exactly as originally planned. Everything else in
the original script has now been run live at least once.

**How to read this report:** **Build findings** are concrete code problems with a clear, correct fix
— ready to hand to a Build Agent session as-is. **Governance decisions** are choices about what the
platform *should* do — they need a real answer before a Build Agent could implement anything
correctly. **Design recommendations** are new scope, not corrections.

Every finding below was confirmed by direct trace against the real repository, not inferred from
screenshots alone — file and line references are included so nothing here has to be re-diagnosed.

---

## Part 1 — Build Findings (Build Agent Session Scope)

| ID | Area | What's wrong | Fix |
|---|---|---|---|
| **WG-1** | Home Dashboard + Reviewer's Workspace | Program Health, Issues, and To Do/Review on Home, and all three Reviewer's Workspace tabs, show empty on a fresh session — APEX, VIGIL, NEXUS, and SCRIBE each only publish to their shared surface when a human opens that specific module first (`ApexApp.tsx:54`, each module's own `*-work-queue-publisher.ts` / `*-workspace-publisher.ts`). Home and the Workspace are natural landing pages — this is a first-impression risk. Confirmed live: the Workspace showed 0/0/0 until VIGIL, ARIA, and SCRIBE were each visited manually. | Publish eagerly at shell start, reusing the exact functions that already exist. |
| **WG-2** | Shell chrome, sidebar tooltip | Info-icon tooltip clipped by the sidebar's own `overflowY: "auto"` (an unset `overflowX` computes to `auto` too, per spec), cutting it off exactly at the sidebar/content boundary. | Render via a React portal to escape the sidebar's scroll container. |
| **WG-3** | APEX, Obligation Rate chart | Axis uses short codenames (ALPHA, BRAVO...) while buttons/text below use full names, no bridge beyond a hover tooltip. | Rotate/label the axis with full names, or add a one-line key. |
| **WG-4** | APEX, Variance chart | Legend order reported as Actual-then-Planned; code declares Planned first, matching the bar-body order. Root cause likely a Recharts default-ordering behavior, not fully confirmed live. | Pass an explicit `payload` to `<Legend>` for deterministic order regardless of cause. |
| **WG-5** | Reviewer's Workspace / VIGIL | `expireOverdue()` (`useApprovalQueue.ts`) only runs once, on `VigilApp.tsx` mount — not a live timer. A P1 item's 15-minute window can elapse unswept while the screen sits open. Sourced from `docs/27` (EG-C). | Drive from a live interval, reaching both VIGIL's own screen and the Workspace's embedded copy. |
| **WG-11** | APEX, Program Detail navigation | **Confirmed broken for every program, every time — not a cold-start issue.** Clicking any Obligation Rate bar returns "No program record was found," for all five PPBE programs, reproducibly. Root cause: APEX has **two entirely separate, never-reconciled program datasets.** The original World Model (`synthetic-world-model.ts`, Session 17) uses IDs like `P-100`, `P-200`, `P-300`, and is what `ProgramDetailView`'s adapter (`apex-data-adapter.ts`) actually queries. The PPBE synthetic set (`sovereign-data/src/synthetic/ppbe-seed.ts`) uses IDs like `SYNTH-PRG-ALPHA`, and is what feeds every Execution Monitoring chart. Session 46 wired the bar-click handler to pass a PPBE ID into a screen that only recognizes World Model IDs — it was never going to work. **This is very likely the same underlying gap as WG-6 and WG-9 below, seen from a third screen — see the note under Governance Decisions.** | Needs a governance decision (see WG-6/WG-9) before it can be fixed correctly — see below. |
| **WG-12** | APEX, Dependency Health table | Confirmed by direct trace: real, individually-identified dependency records already exist (`SYNTH-DEP-01`, `SYNTH-DEP-02`...), each carrying which program/phase depends on which, a description, and a status. All of this is discarded before reaching `DependencyHealthTable`, which receives only `{ healthy, at_risk, failed, narrative }` — bare counts, no way to tell *which* program has the at-risk or failed dependency. | Pass the individual dependency records through instead of pre-reducing them to counts; the data already exists. |
| **WG-13** | Reviewer's Workspace / VIGIL | Confirmed live: approving an item in the Workspace does not update VIGIL's own screen. Root cause: `createDevApprovalPort()` regenerates its entire synthetic request list fresh on every call — there is no shared live store between the Workspace's embedded copy and VIGIL's own mounted instance. **The underlying decision itself is genuinely, permanently logged** (a real `HUMAN_DECISION`-family event, confirmed in `useApprovalDecision.ts:69`) — this is a live-queue display gap, not a data-loss gap. Explicitly documented in the code as a placeholder awaiting a "live" port. | Real fix is likely superseded by WG-14 (a canonical Activity View) rather than patched independently — worth deciding together, not in isolation. |
| **WG-14** | Platform-wide, provenance | Full analysis in `docs/28`. The Logger's public interface (`ctx.logger`) is write-only, but the underlying `ShellLogger` class already implements a working, unused `getEntries()` read method — built for exactly this purpose, per its own comment, with zero current callers. Confirmed via direct trace, not assumed. | Expose `getEntries()` (or an equivalent) through the shell contract (a real, well-scoped GD), and build a genuine cross-module Activity/Decision History view against it. Session-scoped honestly (no persistent sink connected yet — "Stage 2," not urgent). This also resolves WG-13 more properly than patching it alone would. |

---

## Part 2 — Governance Decisions (Resolve Before Related Build Work)

**Read WG-6, WG-9, and WG-11 together before deciding any of them separately.** All three trace back
to the same root situation: PPBE's synthetic program data was added to APEX without being
reconciled with APEX's original World Model. WG-6 is the quarter-scope symptom, WG-9 is the
site-tracking symptom, WG-11 is the broken-navigation symptom — three views of one real architecture
question: **does APEX have one coherent notion of "a program," or two incompatible ones that need
unifying?** Scoping these as one decision, not three sequential ones, avoids fixing each symptom in
a way that has to be undone once the real answer lands.

| ID | Area | The actual question |
|---|---|---|
| **WG-6** | APEX, Variance chart | Synthetic dataset hardcodes exactly two fiscal periods (`FY 2026 Q3/Q4`). Plausibly deliberate (reads as "most recent + current"), but unconfirmed as intentional. Part of the WG-11 cluster. |
| **WG-7** | Home Dashboard, Module Orientation panel | Fully duplicates the sidebar, zero interactivity — full write-up in the companion memo. Retire it, or give it a real job (live status via `WorkQueueSurface`)? |
| **WG-8** | APEX, chart set | Per-program selector — confirmed genuinely new work, confirmed feasible (`program_id` already on every record). Best scoped after the WG-6/9/11 data-architecture question lands. |
| **WG-9** | APEX / PPBE, data architecture | The open site-tracking schema item — part of the WG-11 cluster, above. Full framing in `docs/26`. |
| **WG-10** | ARIA / SCRIBE export gate | Already self-disclosed by the platform's own UI: export destination/recipient recorded to the audit trail but not enforced by SCRIBE's actual gate. Honest disclosure, real decision still needed. |

**Also open, tracked in `docs/27` under its own EG numbering (document review, not live walkthrough
— not blocking any item above):** EG-A (no documented P1/P2/P3 rubric), EG-B (should autonomy ever
expand based on track record), EG-D (is threshold-gating universal or confirmed for one path only),
EG-E (does `docs/22`'s materiality test extend to reporting-only screens).

---

## Part 3 — Design Recommendations (New Scope, Not Findings)

1. **Module Orientation → live per-module status** (WG-7). Full memo already produced.
2. **Per-program selector across APEX's chart set** (WG-8). Filtering, not new data plumbing.
3. **Decision-note friction.** Both VIGIL and ARIA require a free-text note of at least 10 characters
   for every decision (`APPROVAL_NOTE_MIN_CHARS = 10`, confirmed platform-wide convention, not a
   one-off). Real feedback from tonight's live use: consider structured reason codes or checkboxes
   for common cases, with free text available but not mandatory every time.
4. **The larger vision — `docs/26`.** Portfolio/program/project execution monitoring, native
   BI-grade visualization, the "Primavera-shaped gap" (no dependency/critical-path engine exists
   anywhere yet). The framing document for most of the real build arc ahead.

---

## Part 4 — Confirmed Passes

- **Role-based sidebar gating** — checked against the Role Access Matrix across six roles total
  (Program Manager, Platform Admin, Analyst, Read Only, Compliance Officer, and re-confirmed for
  Program Manager in the Workspace) — every lock/unlock matched policy exactly.
- **Read Only's honest disclosure** and **Module Orientation's role-filtered count** — both correct.
- **Both APEX charts render as real charts**, not prose.
- **Dependency Health is a real table**, format matches the script (content depth is WG-12, above).
- **Per-site breakdown disclosure — exact wording confirmed:** *"Placeholder data. Site-level data is
  illustrative — a real site-tracking schema has not yet been added to the program data dictionary. A
  governance decision (data-dictionary approval) is required before live site data can be wired
  here."* Cites its own source (Session 46, item D4). Strong, specific, honest — not boilerplate.
- **Six distinct sites confirmed**, uneven spread confirmed (one program touches all six).
- **The Reviewer's Workspace, once populated, is the strongest-built thing in the platform.** All
  three live decision actions confirmed working end-to-end: a real VIGIL approval, a real ARIA
  certification, and the real SCRIBE "I have sent this communication" attestation — each correctly
  removed the item from the Workspace, and the VIGIL decision was confirmed to produce a real,
  permanently logged, correctly-attributed audit event (WG-13's live-display gap notwithstanding).
- **The "Open in [module]" navigation link** correctly opened the specific item, not a generic page.
- **Read Only correctly fully locked out** of the Workspace.

---

## Part 5 — Not Yet Verified

**Only Part 1 remains** — Home Dashboard steps 2, 3, 4, 6, 7 (Program Health variation, Flagged
Programs, queue tile contents, Program Manager-specific tiles, Read Only's empty states with real
data present). Blocked on WG-1 by design — meaningless to test against an empty state. This is the
one item for a real repeat pass after WG-1 lands.

Parts 2 and 3 are fully closed as of this version.

---

## Recommended Path Forward

See the full sequenced build plan in chat — summarized here:

1. **One governance conversation first**, covering WG-6/WG-9/WG-11 together (the data-architecture
   cluster), WG-7, and WG-14's exact shape. EG-A/B/D/E can ride along or wait — not blocking.
2. **Build Session 1** — WG-1 through WG-5, plus WG-12 and WG-13 (all unblocked, no governance
   dependency). Highest-visibility items land first.
3. **Build Session 2** — WG-11, WG-9, WG-6, WG-7, WG-8, once Step 1's decisions land.
4. **Build Session 3** — WG-14 (the shell-contract change plus the real Activity/Decision View).
5. **Repeat Walkthrough pass** after Session 1 — closes Part 5's remaining Part 1 items.

---

## Companion Documents Produced This Session

- **`docs/26`** — Portfolio/Program/Project Execution Monitoring: Target State and the Analyst/PM
  Workday Principle. Framing document for WG-6, WG-8, WG-9, WG-11, and most of Part 3.
- **`SOVEREIGN_Walkthrough_G_Finding_ModuleOrientation_20260721.md`** — full recommendation for WG-7.
- **`docs/27`** — Execution Governance: An External Critique Against SOVEREIGN's Actual Mechanisms.
  Source of WG-5 and the EG-lettered governance questions.
- **`docs/28`** — The Logger's Read Path: Narrower Gap Than First Assessed. Source of WG-14.

Place all five files under `docs/` (this report can sit alongside `docs/22` through `docs/28`).

---

*Walkthrough G — Findings Report and Path Forward*
*July 21, 2026 · Pre-Decisional · Internal Working Document · Final*
