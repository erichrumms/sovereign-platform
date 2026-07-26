# SOVEREIGN Platform — Walkthrough H Findings & Resolution Log
## Prepared by Governance Agent, July 26, 2026 · Compiled from five verified build-session closes

**Purpose:** the single reference for what's fixed, what's decided-but-not-built, and what's
genuinely still open, from the July 24–26 walkthrough and Sessions 62–65. Every "FIXED" status
below was independently verified against the real repository at the session's close, not taken
from a Handoff's self-report alone. Built specifically so Sessions 66–68's comprehensive audit
can check "is this really still fixed" and "is this genuinely new" against real ground truth,
instead of rediscovering the whole night from scratch.

---

## Fixed and verified

| ID | Finding | Fixed in | Verified how |
|---|---|---|---|
| WH-2 | Issues card duplicated Program Health with no added info | Session 64 | `issueGridStyle` (260px min) replaces shared `programGridStyle`; read directly |
| WH-3 | Flagged program name truncated in Issues card | Session 64 | Same commit as WH-2 |
| WH-4 | `narrative` field existed, never rendered | Session 64 | `ProgramTile` renders it; confirmed in diff |
| WH-6 | Locked modules hidden in Module Orientation, shown in sidebar | Session 64 | `modules.map()` over all modules; `!accessible` branch renders lock + role text; read the actual JSX |
| WH-7 | SCRIBE's own queue never reflected a sent item | Session 62 | `sentVersion` state + `pendingItems` memo; confirmed queue shrinks after send |
| WH-9 | `[REQUEST_ID]`/`[PERIOD]` placeholders never substituted | Session 64 | `staticTTDraftFallback` takes `referenceId`; substitution confirmed |
| WH-10 | CPMI enhanced-tier marker inaccessible (hover-only) | Session 64 | `aria-label` + visible "Enh." text added; 13 snapshots updated |
| WH-11 | VIGIL alert buttons had no visual hierarchy | Session 64 | Color-coded to match `ApprovalDecisionPanel` |
| WH-12 | Reason-code chips missing from `AlertResponsePanel` | Session 64 | Same commit as WH-11 |
| WH-14 | SCRIBE draft didn't visually read as an email | Session 64 | Bordered From/To/Subject header block added |
| WH-17 | VIGIL screen vs. Workspace disagreement (`ppbe_obligation`) | Session 62 | Root cause: expiry-timing artifact, P1→P2 reclassification. Confirmed via direct code trace, not guessed |
| WH-17 follow-on | Full P1 audit — `model_deployment` reclassified, `EMPTY_OBLIGATION_CASE` confirmed inert (React hook sentinel, never in session store), alert-level P1s confirmed a different mechanism | Session 63 | Every claim independently verified — `EMPTY_OBLIGATION_CASE` checked directly in `ApprovalDetail.tsx` |
| WH-18 | Activity & Decisions badge frozen regardless of admin toggle | Session 62 | `showAll` lifted to `WorkspaceApp` parent |
| WH-19 | Reviewer's Workspace extended to 5 panels (NEXUS, FLOWPATH) | Session 63 | `TravelQueueRow`-only (not `TimeQueueRow`), `WorkflowArtifactReview`-only (not `GateRunnerPanel`) — both confirmed via import statements, not the summary |
| WH-20 (build) | FLOWPATH session creation was inert — no live path from button to artifact | Session 63 | State lifted to `FlowpathApp`, controlled `SessionManager`, full lifecycle wired |
| WH-20 (governance) | Preliminary context question wording | Session 64 | Approved as drafted; `GovernanceBanner` removed |
| WH-22 | ARIA Dashboard and Certification Queue were two independently hardcoded, drifted lists | Session 62 | `DEMO_OUTPUTS` now derived from `CLEAR_DEMO_ITEMS` |
| WH-24 | FLOWPATH return-for-revision didn't reset session state | Session 64 | Folded into WH-25's fix — `returnFlowpathSessionForRevision` resets status before navigating |
| WH-25 | FLOWPATH elicitation session state didn't survive remount | Session 64 | `flowpath-elicitation-session.ts`, the 7th module-local store, mirrors the proven shape exactly — read directly |
| D3-8 | VIGIL's own alert tile contradicted itself (`—` while alerts listed below) | Session 64 | Unconditional `unacknowledgedCount` display confirmed |
| F1 | FLOWPATH `activeBundle` didn't survive remount | Session 65 | Reconstructed from the Workspace surface on mount — no 8th store. Read the actual four-branch logic directly; matches spec exactly |

---

## Decided, not yet built — real future work, already scoped by decision

| ID | Decision | What building it requires |
|---|---|---|
| WH-5 | Add point-of-contact (name/role) to program data | Real shell-contract change; bundled with WH-2-adjacent Program Health redesign below. No synthetic POC data exists anywhere yet — confirmed by direct search |
| — | Program Health redesign: 3 visuals (obligation, budget-to-actual variance, dependency health index, learning velocity) | Bundled with WH-5. Three of four metrics already computed by APEX, unused on Home — plumbing, not new logic. POC data must be invented |
| WH-15 | PPBE exhibit: table + chart, not flat bullets | Table is near-free (structured data already exists, `staticExhibitDraft`'s figures just need `<table>` instead of `<ul>`). Chart needs new aggregation (nothing currently sums by cost code) |
| WH-16 | Fold SCRIBE correspondence status into NEXUS's read-only time-record card | Read-only status flag, one direction, no cross-module navigation — smaller than it sounds |
| WH-23 | Replace ARC's current framing (hypothetical regulatory change) with real program/document → regulation intersection, using CLEAR's existing per-document evaluation | Real reframe. Not yet scoped in build detail — needs a design pass before a build session, since it changes ARC's screen shape, not just its logic |
| F2 | Shared-helper extraction for the 7 module-local session stores | **Deliberately deferred until after the CTO demonstrations**, same reasoning as D4-6. Do not build without a fresh decision to un-defer |
| D4-6 | API key architecture (server-side proxy vs. runtime injection) | **Deliberately deferred.** No production hosting plan exists; static tier stays through the demonstrations. Do not configure a real key or build proxy infrastructure without a fresh decision |

---

## Raised, genuinely still open — no decision made yet

| ID | Finding | Status |
|---|---|---|
| WH-1 | Module Orientation and To Do/Review show the same numbers | **Not a defect** — deliberate design (`docs/22`'s aggregate/detail rationale). Verified arithmetically consistent after WH-7 and WH-22 landed. Closed as "working as designed," not open |
| WH-8 | Static drafting tier is platform-wide (SCRIBE + NEXUS), not just PPBE exhibits | Folded into the D4-6 decision above — no separate action needed |
| WH-13 | SCRIBE's T&T queue shows a synthetic employee ID (`SYNTH-E-201`), never a name — confirmed no name field exists anywhere in the codebase | **Open — a data gap, not a code gap.** No decision made on whether/how to add real synthetic names |
| WH-21 | NEXUS's Home tile ("Coordination Items") only reflects the PPBE Coordination tab — the Travel & Time Queue, where PMs actually decide things, has zero Home representation | **Open — raised, not decided.** Real gap, no governance call made yet |
| WH-26 | Sidebar module info tooltips: metaphor-based labels ("Sorts The Mail"), vocabulary mismatch against each module's own on-screen terms, no disambiguation between overlapping modules, no Reviewer's Workspace entry at all, three labels still carrying unresolved Session 42 provisional flags | **Open — substantial, discussed at length, never formally decided.** Two options were laid out (fix labels in place, or also give LENS a real task-finder); no decision made |
| — | SCRIBE's three-word module label ("Ghostwrites Your Memos") still marked PROVISIONAL since Session 42 | **Open**, carried forward unchanged across every session since, including this one |
| — | LENS tooltip hover-position (WG-2) — asked to be checked after the CPMI marker discussion; later screenshots showed correct positioning, but no explicit confirmation was ever given | **Presumed fine, not explicitly confirmed.** Low priority; worth a real look during the LENS portion of Session 68's audit rather than continuing to assume |
| — | Session 65's self-flagged minor debt: `tab` and `activeBundle` initializers in `FlowpathApp.tsx` independently compute the same session lookup — a live, low-stakes instance of Rule 11 | **Open, low priority.** Not worth its own session; fold in opportunistically next time FLOWPATH is touched |

---

## Notes for Sessions 66–68

- Do not re-verify every "Fixed and verified" row exhaustively — that work is done and independently confirmed. Spot-check anything that seems inconsistent with what you find; don't rediscover the whole list from scratch.
- Anything found during this audit that overlaps a "Decided, not yet built" row should be described as reinforcing that decision, not treated as a brand-new finding requiring its own governance question.
- Anything found that overlaps a "Raised, genuinely still open" row should be added to that row's evidence, not logged as a duplicate finding under a new number.
- New findings outside all three tables above get the next available number, continuing from WH-27.

---

*Findings & Resolution Log · July 26, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
