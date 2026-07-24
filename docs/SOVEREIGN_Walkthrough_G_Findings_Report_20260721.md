# Walkthrough G — Findings Report and Path Forward
## Updated July 24, 2026 — the entire build arc closed (Sessions 54-61)

**Status:** Every build finding from the original Walkthrough G exercise, and every build finding
from the follow-on Session 60 comprehensive assessment, is now closed. What remains is
genuinely governance-only (no code blocked on any of it) plus the one item that was never a
build task to begin with: the live human Walkthrough pass on Home Dashboard.

**How to read this report:** **Build findings** are concrete code problems with a clear,
correct fix — all closed as of this version. **Governance decisions** need a real answer before
related work can be scoped. **Design recommendations** are new scope, not corrections.

---

## Part 1 — Build Findings (ALL CLOSED)

| ID | Area | Status | Session |
|---|---|---|---|
| **WG-1** | Home Dashboard + Reviewer's Workspace, eager data population | ✅ Done | 54 |
| **WG-2** | Sidebar tooltip, React portal fix | ✅ Done | 54 |
| **WG-3 / WG-4** | APEX chart naming + legend fixes | ✅ Done | 54 |
| **WG-5** | VIGIL expiry sweep, live interval | ✅ Done | 54 |
| **WG-12** | APEX Dependency Health, per-item detail | ✅ Done | 54 |
| **WG-13** | VIGIL approval session store (first instance of the pattern) | ✅ Done | 54 |
| **WG-15** | SCRIBE sent-session store | ✅ Done | 55 |
| **WG-16** | Workspace post-decision `WorkQueueSurface` republish | ✅ Done | 55 |
| **WG-17** | Home expiry sweep | ✅ Done | 55 |
| **WG-11 + WG-8** | Native PPBE Program Detail view (decided `docs/29`) | ✅ Done | 57 |
| **WG-7** | Module Orientation live status + clickable rows (decided `docs/29`) | ✅ Done | 57 |
| **WG-14** | Activity & Decisions tab, GD-28 (decided `docs/29`) | ✅ Done | 58 |
| **D3-9** | The latent single-mount ordering dependency (found, `docs/30`) | ✅ Closed by root fix | 61 |
| **D3-1** | VIGIL Alert Queue session store (HIGH) | ✅ Done | 61 |
| **D3-2** | ARIA CPMI-VRS Gates 3/4 session store, duplicate-attestation guard | ✅ Done | 61 |
| **D3-3** | NEXUS Travel & Time queue session store | ✅ Done | 61 |
| **D3-4** | FLOWPATH approval session store | ✅ Done | 61 |
| **D3-5** | Home-return navigation (built only after D1-D5, per the ordering constraint) | ✅ Done | 61 |
| **D3-7** | `navigateToModule` sidebar-highlight self-heal + inaccessible-target guard | ✅ Done | 61 |

**Every item above independently re-verified against the real repository — file, line, and
behavior — not accepted from any session's own Handoff claim alone.**

---

## Part 2 — Governance Decisions (Genuinely Still Open)

| ID | Area | The actual question |
|---|---|---|
| **WG-6** | APEX, variance chart | Session 59 padded the synthetic fiscal periods to a full FY2026 — **explicitly cosmetic, at direct Project Principal instruction.** The real question (what the period scope should be once real data exists) remains genuinely undecided. |
| **WG-9** | APEX / PPBE, data architecture | Site-tracking schema. Correctly deferred — no real external data source exists yet. |
| **WG-10** | ARIA / SCRIBE export gate | Self-disclosed by the platform's own UI. Real decision still needed. |
| **D4-6** | Platform-wide, security | Seven modules share an identical `VITE_ANTHROPIC_API_KEY` pattern, compiled into the client bundle by Vite's design. No real key exists anywhere today. A genuine pre-production gate — server-side proxy vs. runtime injection — needed before one ever does. The single finding from the whole Session 60 assessment most directly relevant to handling real, sensitive data. |
| **D3-6** | Shell, module health dots | Wired to nothing — `pollAll()`/`startHealthPolling()` exist, never called. Decide: finish wiring, or remove the dead code. |
| **D4-5** | ARIA / VIGIL banner | Claims CUI+ enforcement that actually happens elsewhere in the platform. Decide: soften the banner, or extend real enforcement to match it. |
| **D4-2** | Workspace, Role Access Matrix | **RESOLVED this version** — the Activity tab's role list formally ratified in `SOVEREIGN_Role_Access_Matrix_20260721.md`, July 24. |
| **D4-9** | LENS | Governance-explanation source-document set — six required, two exist. A content-authoring task. |

**Also open, tracked in `docs/27`:** EG-A, EG-B, EG-D — not blocking anything above. (EG-E was
resolved this version — see `docs/22` §10, updated July 24.)

**Optional, never reached, genuinely low priority:** D3-8 (VIGIL's alert-count disclosure
inconsistency between Home and its own screen), D3-10 (the Workspace expiry sweep's narrow
coverage window). Small enough to ride along with any session touching adjacent code.

---

## Part 3 — Design Recommendations

1. Decision-note friction — **BUILT this arc** (Session 59): reason-code quick-insert chips on
   VIGIL and ARIA, additive to the existing free-text field.
2. `docs/26`'s larger vision — portfolio/program/project execution monitoring, the still-
   unaddressed "Primavera-shaped gap" (no dependency/critical-path engine anywhere in the
   platform). The real framing document for whatever the next build arc is, once the governance
   items above settle.

---

## Part 4 — Confirmed Passes (Live Walkthrough, Original Two Sessions)

Role-based gating across six roles, both APEX charts rendering as real charts, the site-breakdown
disclosure's exact honest wording, six confirmed distinct sites, all three original Reviewer's
Workspace live decision actions (VIGIL approval, ARIA certification, SCRIBE attestation)
confirmed working end-to-end with a real, correctly-attributed Logger event, the navigation link,
and Read Only's full lockout.

**Not yet live-confirmed, but independently code-verified (Session 60/61):** all eleven modules'
role gates matching the Role Access Matrix exactly; the resurrection-family fixes; Home-return
navigation; the Activity & Decisions tab's actor-filtering and admin toggle. Code-level
confirmation is real and thorough — it is not the same claim as a human having seen it render.

---

## Part 5 — Not Yet Verified

**One item remains, and it now carries more weight than when this list was longer.** Home
Dashboard's original cold-start walkthrough steps (Program Health variation, Flagged Programs,
queue tile contents, Program Manager-specific tiles, Read Only's empty states) are unblocked and
straightforward to run whenever convenient.

**The one genuinely load-bearing item: Session 61's own close names a specific sequence that has
never been run in a real browser** — "enter a module, decide an item, return Home via the
breadcrumb, re-enter the module." This exercises D1 (VIGIL's live subscription) and D6
(Home-return navigation) together, the two largest architectural changes of the entire arc, and
no browser automation exists on this development machine to confirm it any other way. This is
now the single oldest and most load-bearing unverified claim in the platform.

---

## Recommended Path Forward

1. **The live Walkthrough pass — the one thing left that only a human can close.** Specifically
   Session 61's own named sequence, plus the original Part 5 cold-start steps while already in
   the browser.
2. **A real decision on D4-6** — before any real API key is ever configured. Not urgent for a
   synthetic-data demo; genuinely urgent before this platform touches real data.
3. **A real decision on WG-6** — separate from Session 59's cosmetic fix.
4. **Smaller governance items (D3-6, D4-5, D4-9)** — none blocking, worth a real conversation
   when there's appetite.
5. **`docs/26`'s larger vision** — the next real build arc, once the above settle.

---

## Companion Documents (All Updated July 24, 2026)

- **`docs/26`** — framing for WG-9 and the larger vision.
- **`docs/27`** — source of the EG-lettered governance questions (EG-E resolved in `docs/22`).
- **`docs/28`** — RESOLVED; GD-28 executed Session 58.
- **`docs/29`** — all three decisions DECIDED and BUILT (Sessions 57-58).
- **`docs/30`** — §2 build scope CLOSED (Session 61); §3 governance items remain open.
- **`SOVEREIGN_Role_Access_Matrix_20260721.md`** — updated to ratify the Activity tab (D4-2).
- **`SOVEREIGN_Walkthrough_G_Finding_ModuleOrientation_20260721.md`** — the original WG-7
  recommendation, built as recommended.
- **Session 54 through 61 Handoffs/SBOM Updates** — Build Agent's real close artifacts, every
  one independently verified against the repository at close, not taken on faith.

---

*Walkthrough G — Findings Report and Path Forward*
*Updated July 24, 2026 · Pre-Decisional · Internal Working Document · Build scope fully closed*
