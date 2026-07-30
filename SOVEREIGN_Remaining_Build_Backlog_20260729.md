# SOVEREIGN Platform — Remaining Build Backlog
## Features, Formatting, and Content — Not Bug Fixes
## Compiled July 29, 2026 · Governance Agent

**Scope of this document:** everything raised across every walkthrough and audit this
arc that is not a defect — no open Build Agent-actionable bug remains as of Session 73's
close (Findings & Resolution Log Addendum 3). Everything below is either decided and
ready to build, or raised and needing a decision first. Organized by CTO demo
visibility, since that's the lens that matters most right now.

---

## Tier 1 — High visibility, worth prioritizing before the demonstration

### 1. Execution Monitoring variance history: table → line chart (WH-38)
**What:** Replace the "Budget-to-actual variance history" table (APEX Execution
Monitoring) with a line chart — X-axis time, Y-axis $K, two series (planned, actual).
**Why it matters for a CTO:** this is the screen most likely to get a close look from a
finance-literate evaluator, and a chart reads as a mature analytics product where a
table reads as a spreadsheet export.
**Status:** Real, scoped design recommendation. Not yet built.
**Effort:** Moderate — needs a charting component, not just a layout change.

### 2. PPBE exhibit: flat bullets → table + chart (WH-15)
**What:** SCRIBE's PPBE exhibit currently renders as flat bullet text. Decided in
principle: a real table (the underlying figures already exist) and a chart (needs new
aggregation — nothing currently sums by cost code).
**Why it matters:** PPBE exhibits are core demo content — this is likely to be shown
directly, and flat text undersells data that's already real and correct.
**Status:** Decided, not built. The table half was scoped as "near-free" — the data
already exists in the right shape. The chart half needs real aggregation work.
**Effort:** Table: low. Chart: moderate.

### 3. Module health dots — finish or remove (D3-6)
**What:** A UI element on Home Dashboard (or the module directory) that has been wired
to nothing for eleven consecutive sessions.
**Why it matters:** dead UI is a real, avoidable risk — better to decide now than have
it surface as an unexplained non-functional element during a live demo.
**Status:** Never decided, simply never reached. Needs a decision: finish the wiring, or
remove the dead code.
**Effort:** Depends on the decision — removal is trivial; finishing it depends on what it
was originally meant to show.

### 4. Execution Monitoring's BY/BY+1 tabs — verify before deciding (WH-37)
**What:** Whether the Budget Year and Programming Year tabs correctly avoid rendering
execution-shaped metrics (an "Actual" column, an on-track badge) against years that
structurally can't have them.
**Why it matters:** if these tabs render something nonsensical, it's exactly the kind of
detail a technically sharp evaluator would notice by clicking through every tab.
**Status:** Genuinely unconfirmed — never actually opened during any walkthrough. This
isn't a build item yet; it needs five minutes of looking before it's even a real
finding.
**Effort:** Verification: trivial. Fix, if needed: unknown until verified.

---

## Tier 2 — Real value, bigger lift or narrower visibility

### 5. Home Dashboard Program Health redesign (WH-5 bundle)
**What:** Replace the current single-obligation-number cards with three additional real
visuals: budget-to-actual variance, a dependency health index, and learning velocity.
Bundled with WH-5 (adding point-of-contact name/role to program data).
**Why it matters:** this is the single biggest visual upgrade available anywhere in the
platform — it's the first screen, and three of the four metrics are already computed by
APEX and simply unused on Home. This is plumbing, not new logic, for three of the four.
**Status:** Decided in principle, not built. **Real shell-contract change required** for
the point-of-contact addition specifically — this is the one item on this list that
needs a governance decision beyond scheduling, since shell-contract changes go through
the GD process. Synthetic POC data (names/roles) needs to be invented and doesn't exist
anywhere yet.
**Effort:** High relative to the rest of this list — shell-contract change, new synthetic
data, real component work for four visuals.

### 6. Fold SCRIBE correspondence status into NEXUS's time-record card (WH-16)
**What:** A read-only status flag, one direction, showing SCRIBE's T&T correspondence
state inside NEXUS's own time-record view.
**Why it matters:** a good, concrete "look how connected this platform actually is"
beat for the demo — cross-module integration is one of the stated differentiators.
**Status:** Decided in principle. Scoped as "smaller than it sounds" — read-only, one
direction, no cross-module navigation logic needed.
**Effort:** Low-moderate.

### 7. ARC reframe — real regulatory intersection, not hypothetical (WH-23)
**What:** Replace ARC's current framing (a hypothetical regulatory change) with a real
program/document-to-regulation intersection, using CLEAR's existing per-document
evaluation.
**Why it matters:** turns a demo screen that currently shows invented scenario content
into something grounded in the platform's own real data — a genuine authenticity
upgrade, directly relevant to the "realistic data is a credibility signal" research this
arc's Strategic Plan leaned on.
**Status:** Decided in principle. Needs a real design pass first — this changes ARC's
screen shape, not just its logic, so it's not a quick build.
**Effort:** Moderate-high — needs scoping before it's buildable.

### 8. Home Dashboard To Do/Review visual consistency (WH-36)
**What:** The section (merged in Session 70) mixes two visual treatments — a flat row
for modules with zero items, a header-plus-card for modules with pending items —
making it harder to scan than it should be.
**Why it matters:** first-screen polish; moderate visibility, real but not dramatic.
**Status:** Open, needs a design pass.
**Effort:** Low-moderate.

---

## Tier 3 — Real, but lower visibility or narrower payoff

### 9. NEXUS Time Record redesign (WH-46)
**What:** Weekly grid layout — charge-code dropdown with auto-populated title column,
day-of-week columns for hours, PTO/Holiday/Admin as available charge codes,
justification only required when the code is overhead.
**Why it matters:** genuinely better UX, but only visible if NEXUS's Time Record entry
screen specifically is part of the walked demo path.
**Status:** Raised, not decided. Detailed enough to scope directly once approved.
**Effort:** Moderate — a real form redesign, not a tweak.

### 10. NEXUS's Home tile gap (WH-21)
**What:** NEXUS's Home Dashboard tile ("Coordination Items") only reflects the PPBE
Coordination tab. The Travel & Time Queue — where Program Managers actually make
decisions — has zero representation on Home.
**Why it matters:** a real functional gap, not just cosmetic — if someone asks "does
Home show everything I need to act on," this is a genuine no.
**Status:** Raised, not decided.
**Effort:** Moderate.

### 11. Site breakdown: full funds-lifecycle columns
**What:** Beyond the already-closed Planned/Obligated reorder (WH-39), the fuller
Planned → Available → Committed → Obligated → Costed lifecycle isn't in the data model
at all today.
**Why it matters:** would demonstrate real PPBE domain depth to a knowledgeable
evaluator, but it's a data-model addition, not a display change.
**Status:** Flagged as future backlog, not scoped.
**Effort:** High — new fields, new synthetic data, not just UI.

### 12. LENS Pipeline Navigator descriptions — more thorough content
**What:** The current per-product descriptions are "a very good start" but could be
developed further to more thoroughly explain what each product does.
**Why it matters:** low priority — LENS already reads as functional and honest; this is
incremental content polish, not a gap.
**Status:** Noted, not scoped.
**Effort:** Low, whenever there's time.

---

## Tier 4 — Deliberately deferred, not really "backlog" in the actionable sense

- **F2** — shared-helper extraction for the module-local session-store pattern.
  Deliberately deferred until continued investment past the demonstrations is confirmed.
- **D4-6** — API key architecture (server-side proxy vs. runtime injection).
  Deliberately deferred; no production hosting plan exists yet.
- **Intelligence Layer** — named as the target every product feeds, not built.
  Deliberately left as a clearly-labeled future item in the demo narrative itself —
  naming a real, acknowledged gap plainly is evidence of this project's own honest-
  disclosure discipline, not something to rush into existence before the demo.
- **SBOM Registry merge** — mechanical, real, growing (now Sessions 54-73 unmerged), but
  background hygiene with no demo visibility.

---

## Suggested next step

If there's appetite for one more build session before the demonstration, **items 1-4
together are a real, coherent, single-session scope** — a chart, a table-plus-chart, a
decide-and-fix-or-remove, and a five-minute verification. All four are visible in the
screens most likely to actually get walked in front of a CTO, and none require a
governance decision beyond what's already been scoped here.

Item 5 (the Program Health redesign) is the highest-value single upgrade on this list,
but it's also the only one that needs a real GD (the shell-contract change) before it
can be built — worth deciding on its own, not bundled with a routine session.

---

*Remaining Build Backlog · July 29, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
