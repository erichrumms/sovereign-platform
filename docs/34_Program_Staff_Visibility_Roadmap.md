# docs/34 (provisional) — Program & Staff Visibility Roadmap

**Prepared by:** Governance Agent, August 2, 2026
**Status:** Pre-Decisional · Internal Working Document — a sequencing roadmap, not a single
build spec. Each phase below needs its own detailed spec (matching `docs/31`/`docs/32`'s
format) before it goes to a Build Agent session.
**Governance Decisions:** Multiple, provisional (see per-phase notes below — confirm against
the live GD Registry before any real number is assigned, per this project's own Rule 17).
**Origin:** Synthesizes a chat-conversation thread, August 2, 2026, covering: person-vs-program
cost views, a Supervisor role for both human and AI oversight, staff roster expansion, and a
unified reporting layer across the two program systems.
**Key decisions already made, driving this whole roadmap:**
1. **Unification happens at the reporting layer, not the data layer** — the World Model and
   PPBE-native program systems stay physically separate, exactly as `docs/25` documents. Nothing
   here reverses that decision.
2. **The 5x data expansion generates both more entities and more activity** — not one or the
   other.
3. **Both the World Model and PPBE-native datasets get expanded** — revised from this
   document's first version, which recommended leaving the World Model untouched. That
   recommendation conflated "this system has been stable" with "this system must not be
   touched" — `docs/25` only requires the two systems to stay *separate*, not that one stays
   frozen. Leaving it unexpanded while the other grows would work against this roadmap's own
   goal of comprehensive coverage.
4. **A third dataset — Time & Travel (T&T) records — is in scope for expansion too.** Missed
   in this document's first version. T&T (travel requests and time corrections, spanning NEXUS,
   VIGIL, SCRIBE, and FLOWPATH via `tt-synthetic-config.ts`, `tt-synthetic-alerts.ts`,
   `tt-synthetic-review.ts`, `ppbe-synthetic-coordination.ts`, `ppbe-synthetic-handoffs.ts`) is
   a real, separate activity stream — neither World Model nor PPBE-native — with its own named
   deciders/operators already attached (confirmed: `actor_name: decider.name` in NEXUS's real
   travel-queue code). Directly relevant to "broad activity," and was already visible in this
   conversation's own screenshots (`SYNTH-TR-102`, six `SYNTH-TM-20x` records) without being
   named as its own category.

---

## 1 — What's confirmed real, by direct check, driving every phase below

- **Only 8 real named individuals exist anywhere on the platform** — 3 in the World Model
  (Dana Jones, Robin Vasquez, Jordan Kim), 5 as PPBE program points-of-contact (Marcus Cole,
  Sarah Okonkwo, James Rivera, Patricia Webb, David Nkosi). No personnel roster exists.
- **No reporting-hierarchy field exists anywhere** — `SovereignUser` has no `reports_to`,
  `manager_id`, or team concept.
- **No staff-to-project linking table exists** — nothing many-to-many connects a person to
  the projects/programs they work on.
- **Cost-bearing events (the 10 sites from GD-31) carry `actor_id` but never `actor_name`** —
  confirmed separately; a small, already-scoped fix (§3 below).
- **The two program systems remain deliberately separate** (`docs/25`) — World Model has been
  explicitly left untouched since Session 54; PPBE-native is the actively developed series.

---

## 2 — Phase 1: Synthetic Data Foundation (data authoring)

No code logic — just real, clearly-labeled synthetic records, in the same style already used
throughout the platform (e.g. the `SYNTH-` program-ID convention; people are given realistic
names, not `SYNTH-`-prefixed, matching how the 8 existing names already look).

- **Staff roster expansion, target ~40–48, sized backward from the org structure, not
  forward from a flat multiplier.** If Supervisors oversee teams of six, the real driver is
  7–8 teams × 6 = 42–48, plus the Supervisors themselves — this happens to land near "5x" the
  original 8, but for a load-bearing reason (it supports the actual team structure), not because
  5 was the chosen multiplier. Each person needs: name, role, org unit, and — new — real
  assignments to one or more projects (feeds the linking table below).
- **Program expansion, both systems — baseline corrected.** Direct count (Aug 2) found
  **12 World Model programs already exist** (`P-001, P-002, P-100, P-150, P-200, P-202, P-205,
  P-256, P-300, P-384, P-521, P-999`), not the 4 this document originally assumed from `docs/25`'s
  illustrative examples. **One is worth a second look before counting it as real:** `P-999`'s
  shape is consistent with a test fixture, not a catalog entry — the same pattern that turned out
  to be placeholder data elsewhere tonight. Confirmed real total today: **5 PPBE-native + ~11–12
  World Model = ~16–17 programs.** World Model records are also confirmed heavier objects
  (milestones, risk flags, reasoning-chain history, governance decisions, task history) than
  PPBE's lighter `ProgramRecord`. Revised target: **PPBE-native grows more (5 → ~15–18, since
  it's the thinner, actively-developed series), World Model grows less (~12 → ~18–20, since it
  already has real volume and each addition is heavier)** — roughly 35–40 total, not the
  original 20–25 estimate, which was built on the wrong baseline. The two systems stay
  structurally separate per `docs/25`.
- **T&T (Time & Travel) expansion — baseline confirmed.** Direct count: **8 travel records, 6
  time records today (14 total)**, not inferred from screenshots. Target 5x or more still holds
  — this is the one category where higher volume reads as more realistic.
- **Schema fully confirmed, Aug 2** — `Program` (base) + `ProgramRecord` (PPBE-native),
  `ApexProgramRecord` (World Model), `TravelRequest`, `TimeRecord`/`TimeRecordEntry`, and
  `SovereignUser` all read directly. No more assumed shapes.
- **Simplification found:** `TravelRequest` and `TimeRecord` both carry `employee_id` natively
  — T&T records need no new linking table at all, unlike programs. Phase 2's linking work
  (§3) is staff-to-*programs* only.
- **World Model baseline corrected again:** 11 real programs (not 12 — `P-999` confirmed a
  test fixture, not a catalog entry, via direct check).
- **Activity volume, scaled to match each dataset above** — more `AGENT_STEP_COMPLETE` /
  `HUMAN_DECISION` events tied to the new and existing people, programs, and T&T records —
  correctly carrying `actor_name` this time (see §3).

## 3 — Phase 2: Schema Additions (each needs its own real GD)

- **`StaffProjectAssignment`-shaped type** (exact name TBD at build time) — many-to-many,
  minimally `staff_id`, `project_id`, `project_system: "world_model" | "ppbe_native"`. **T&T
  needs no equivalent** — `TravelRequest` and `TimeRecord` both already carry `employee_id`
  natively, confirmed by direct read.
- **A reporting-hierarchy field** on the person record (`reports_to` or equivalent) — required
  before "which people does this Supervisor see" can mean anything.
- **`actor_name` added to the 10 cost-emission sites** — already scoped in this conversation;
  the smallest of the three, and independent of everything else in this roadmap.

## 4 — Phase 3: Small, Independent Items (no dependencies — can happen anytime)

- **`SUPERVISOR` role** added to the RBAC list, plus FLOWPATH access granted explicitly (check
  FLOWPATH's current access list first, don't assume its shape).
- **The Project Principal as AI-fleet supervisor** — this is a governance fact, not an RBAC
  entry. Belongs in the Agent-to-Agent Briefing, not the role system, since the Project
  Principal already sits outside and above the platform's own DEV-persona role-play.

## 5 — Phase 4: The Reporting Layer (depends on Phases 1–2)

Reads World Model, PPBE-native, T&T, and the new linking table; presents a unified staff/
activity view **without merging the underlying storage** — the actual mechanism for "one place
to see everyone's projects, travel, and staff" without reversing `docs/25`.

## 6 — Phase 5: Dashboards (depends on Phase 4)

- **Person-view cost dashboard** — per-person cost, paired with the existing-but-unused
  `human_time_seconds`/`agent_time_seconds` fields. Supervisor-facing.
- **Comprehensive TCO dashboard, charts and tables** — reuse `recharts` (already a
  zero-new-dependency precedent in this codebase, used for variance-history work), not a new
  library. **Real limit, stated plainly:** anything session-scoped is buildable now; anything
  trend-over-time is still blocked on the Stage 2 persistence decision (reserved as `docs/33`,
  raised earlier this conversation, still undecided).
- **Agent-fleet oversight view** for the Project Principal — blocked on one still-open check
  from earlier this conversation: whether VIGIL's broader alert taxonomy (honeytoken triggers,
  threshold breaches) is real, per-agent, and currently surfaced anywhere. Not yet verified.

---

## 7 — Open items before detailed specs get written

1. **VIGIL's alert taxonomy** — needs the same direct-code check everything else in this
   roadmap got, not assumed.
2. **Stage 2 persistence** — the standing, separate decision every trend/history feature in
   Phase 5 depends on.

All schema and baseline-count questions raised earlier in this document are now resolved by
direct read (Aug 2) — see §1 and §2 above.

---

*docs/34 (provisional) — Program & Staff Visibility Roadmap · August 2, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Sequencing document — each phase needs its own detailed build spec before a Build Agent session*
