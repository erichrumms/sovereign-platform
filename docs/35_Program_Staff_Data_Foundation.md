# docs/35 (provisional) — Program & Staff Data Foundation, Phase 1 of the Visibility Roadmap

**Prepared by:** Governance Agent, August 2, 2026
**Status:** Pre-Decisional · Internal Working Document — ready to scope as a Build Agent
session once §3's proposed team structure is approved or adjusted.
**Governance Decision:** **GD-33 (provisional — confirm against the live GD Registry before
formal assignment).**
**Design authority:** `docs/34` (Program & Staff Visibility Roadmap) — read that first; this
spec implements its Phase 1 and Phase 2 together, not separately, because they turned out to
be tightly coupled: the data can't be generated with real staff-to-project links until the
link type itself exists. Splitting them into two build sessions would mean the first one
produces nothing usable.
**Origin:** `docs/34`'s schema-confirmation pass, August 2, 2026 — every type referenced below
was read directly from the real code, not assumed.

---

## 1 — What's already confirmed, by direct read (full detail in `docs/34` §1–2)

- Real baseline: 5 PPBE-native programs, 11 real World Model programs (`P-999` excluded,
  confirmed test fixture), 8 travel records, 6 time records, 8 named individuals total.
- Full real schemas for `Program`, `ProgramRecord`, `ApexProgramRecord`, `TravelRequest`,
  `TimeRecord`/`TimeRecordEntry`, and `SovereignUser` — all read directly, not guessed.
- `TravelRequest` and `TimeRecord` both carry `employee_id` natively — no new linking type
  needed for T&T, only for staff-to-*programs*.
- Valid confirmed values: `RiskClassification` is `P1 | P2 | P3`; `ChargeAccountType` is
  `DIRECT | INDIRECT`.
- **One still-partial detail, not blocking:** `TravelRequest`'s full status enum was only
  partially captured (`...| 'ESCALATED'` was visible, the earlier members were not). Confirm
  the complete list directly at build time before generating any travel-status values.

---

## 2 — The two real schema additions this build needs first

**A. `reports_to?: string` (employee_id of the supervisor) added to `SovereignUser`.**
This lives in `shell-contract.ts` (confirmed location, both copies) — a real shell-contract
change, same weight as GD-30's `point_of_contact` addition: version bump (confirm current
version first — do not assume it's still v1.25 without checking), SHA-256 re-verified on both
copies, Done Condition includes a convergence test the same way GD-30/31 did.

**B. A new `StaffProjectAssignment`-shaped type** — many-to-many, minimally `staff_id`,
`project_id`, `project_system: "world_model" | "ppbe_native"`. **Placement is not yet decided
and should be confirmed at build time, not guessed here:** every other entity type read this
session (`Program`, `TravelRequest`, `TimeRecord`) lives in `sovereign-data/src/entities/`, not
in `shell-contract.ts` — this new type most likely belongs there too, by the same pattern, but
confirm how `sovereign-data` entities become available platform-wide (direct check of its
export/index structure) before assuming it "just works" the way shell-contract fields do.

---

## 3 — Proposed team structure (needs your approval or adjustment before generation starts)

Drafted from the real, existing named individuals and the platform's real module/workstream
boundaries — not invented from nothing. **Eight teams, each anchored to a real existing person
where one exists:**

| Team | Anchor (real, existing) | Work scope |
|---|---|---|
| ALPHA | Marcus Cole (PM) | PPBE-native ALPHA + newly generated PPBE programs clustered nearby |
| BRAVO | Sarah Okonkwo (PM) | PPBE-native BRAVO + nearby new PPBE programs |
| CHARLIE | James Rivera (Sr. Analyst) | PPBE-native CHARLIE + nearby new PPBE programs |
| DELTA | Patricia Webb (PM) | PPBE-native DELTA + nearby new PPBE programs |
| ECHO | David Nkosi (PM) | PPBE-native ECHO + nearby new PPBE programs |
| World Model I | Dana Jones | Roughly half of the 11 (→ ~18–20) World Model programs |
| World Model II | Robin Vasquez | The remaining World Model programs |
| T&T Operations | Jordan Kim | Bulk ownership of Travel & Time volume — the team whose work is mostly NEXUS/VIGIL/SCRIBE T&T processing, not program-anchored |

**Each team gets its own new, dedicated Supervisor** — a person whose role is solely
`SUPERVISOR`, not also doing PM/Analyst work, overseeing that team's existing anchor plus its
other members. **This refines the earlier ~40–48 total headcount estimate upward, worth
flagging plainly rather than letting it drift unnoticed:** 8 teams × 6 working staff = 48,
**plus 8 dedicated Supervisors = ~56 total**, since the original estimate didn't separately
account for Supervisors as additional headcount rather than counted within each team's six.

**All 8 Supervisors report to the Project Principal** — per the governance decision already
made in this conversation. This relationship is recorded via the new `reports_to` field (§2A)
and belongs in the Agent-to-Agent Briefing as a stated governance fact, not as a role inside
this platform's own RBAC role-play.

---

## 4 — Data generation approach

**A deterministic, seeded generation script — not hand-authored records.** Given the real
scale (~56 people, ~35 programs, ~70 T&T records, matching activity volume), a script with a
fixed seed is reproducible and reviewable by its rules, the same way this whole roadmap has
insisted on checking real things rather than trusting summaries.

**Rules the script should follow, restated from `docs/34`:**
- New people: realistic names, not `SYNTH-`-prefixed (matching the 8 existing real names'
  style) — only record IDs use the `SYNTH-` convention.
- New PPBE-native programs: full `ProgramRecord` shape, each with a real `point_of_contact`.
- New World Model programs: full `ApexProgramRecord` + `ProgramDossier` — heavier, so fewer of
  them per unit of effort, matching `docs/34`'s "grow this one more slowly" reasoning.
- New T&T records: `employee_id` drawn from the real generated roster; `cost_code` values on
  `TimeRecordEntry` drawn from that same employee's own `cost_code_assignments` — not random,
  to stay internally consistent.
- Activity events: `actor_name` populated this time (the gap identified earlier this
  conversation), scaled proportionally across all three datasets.

---

## 5 — Done Condition

1. `reports_to` added to `SovereignUser` in both shell-contract copies, identical, SHA-256
   re-verified, version bumped from whatever the real current version is confirmed to be.
2. `StaffProjectAssignment` type added, location confirmed against real `sovereign-data`
   conventions, not assumed.
3. Team structure from §3 — approved or adjusted — encoded as the real generation rule the
   script follows for clustering new programs and assigning new staff.
4. Generation script produces: ~56 staff (48 working + 8 Supervisors), PPBE-native 5→~15–18,
   World Model 11→~18–20, T&T 8→40+ travel / 6→30+ time, proportional activity volume.
5. Every generated record validates against its real type's existing `validate*` function
   (e.g. `validateProgram`, `validateProgramRecord`) — not just shaped correctly by eye.
6. A convergence test confirms the generation script's output is deterministic — same seed,
   same result, run twice.

## 6 — Explicitly out of scope for this build session

- The reporting layer itself (`docs/34` Phase 4) — reads this data, doesn't generate it.
- Any dashboard (`docs/34` Phase 5) — Supervisor person-view, comprehensive TCO, agent-fleet
  oversight all come after this foundation exists.
- VIGIL's alert taxonomy and the Stage 2 persistence decision — both remain genuinely open,
  neither blocks this session.

---

*docs/35 (provisional) — Program & Staff Data Foundation · August 2, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Implements docs/34 Phases 1–2 together · Design authority: docs/34*
