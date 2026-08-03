# SOVEREIGN Platform — SBOM Registry
## Version 1.47 · August 3, 2026

**Supersedes:** v1.46 (GD-32 Build Session 2 — SysAdmin Cost Dashboard)
**Adds:** GD-33 Build Session (Program & Staff Data Foundation, docs/35)

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.25 | GD-31 Build Session 1 | Added optional `token_usage?` field to `SovereignLogEvent`. | `d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7` |
| v1.25 | GD-32 Build Session 2 | Unchanged. | `d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7` |
| **v1.26** | **GD-33 Build Session** | **Added `reports_to?: string` to `SovereignUser`. Optional; absent when no supervisor relationship is present. GD-33 changelog entry added in-file. Both copies verified SHA-256 identical at close.** | **`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

Standing Constraint #7 (14 shell context exports) holds unchanged — `reports_to` widens
`SovereignUser` in place; it does not add a new context member.

---

## 2 — Third-Party Dependencies

**Zero new production dependencies** — the staff seed generation uses only TypeScript
types already in `sovereign-data` and a hand-rolled LCG (Math.imul, standard JS). No
charting library, no new runtime import. Zero-new-production-dependency streak continues
unbroken from Session 62 through this session.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| GD-32 Build Session 2 | 1,818 | 149 (4 skip) | 195 | 2,162 | High |
| **GD-33 Build Session** | **1,856** | 149 (4 skip) | 195 | **2,200** | **High — full 14-package run at close; +38 new tests (staff-seed.test.ts)** |

Test breakdown by package at GD-33 close (all 14 packages, full run):

| Package | Tests |
|---------|-------|
| @sovereign/data | 163 |
| @sovereign/module-apex | 228 |
| @sovereign/module-counsel | 100 |
| @sovereign/module-scribe | 240 |
| @sovereign/module-vigil | 215 |
| @sovereign/module-lens | 63 |
| @sovereign/module-cpmi | 62 |
| @sovereign/module-agentos | 89 |
| @sovereign/module-nexus | 168 |
| @sovereign/module-flowpath | 151 |
| @sovereign/module-aria | 150 |
| @sovereign/module-workspace | 33 |
| @sovereign/api-client | 175 |
| @sovereign/shell | 19 |
| **Total** | **1,856** |

---

## 4 — GD-33 Build Session Component Changes

### Schema Addition A — SovereignUser.reports_to

**Shell Contract v1.25 → v1.26** (both copies simultaneously):

- `shell-contract.ts` (root): Version header bumped, GD-33 changelog entry added,
  `reports_to?: string` added to `SovereignUser`.
- `sovereign-shell/shell-contract.ts`: Identical changes. SHA-256 re-verified at close:
  `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` (both copies match).

**`sovereign-data/src/entities/employee.ts`**: Added `reports_to?: string` to `Employee`
interface (mirrors SovereignUser.reports_to, GD-33 comment). `validateEmployee` updated
to reject a present-but-empty string.

**`sovereign-data/src/index.ts`**: `SOVEREIGN_DATA_VERSION` bumped `1.6.0` → `1.7.0`.
New exports for `StaffProjectAssignment`, `validateStaffProjectAssignment`, all
`SYNTH_STAFF_*` constants, and `generateStaffData`.

---

### Schema Addition B — StaffProjectAssignment

**`sovereign-data/src/entities/staff-project-assignment.ts`** (new):

```
interface StaffProjectAssignment {
  staff_id: string;      // FK → Employee.employee_id
  project_id: string;   // FK → ProgramRecord (ppbe_native) or ApexProgramRecord (world_model)
  project_system: 'world_model' | 'ppbe_native';
}
```

`validateStaffProjectAssignment` enforces all three fields. Placed in
`sovereign-data/src/entities/` per the canonical entity pattern confirmed by direct
code inspection.

---

### Team Structure + Generation Script

**`sovereign-data/src/synthetic/staff-seed.ts`** (new, ~752 lines):

- 8 teams: ALPHA, BRAVO, CHARLIE, DELTA, ECHO, World Model I, World Model II, T&T Operations.
- 8 named anchors (SYNTH-E-301 through SYNTH-E-308): Marcus Cole, Sarah Okonkwo,
  James Rivera, Patricia Webb, David Nkosi, Dana Jones, Robin Vasquez, Jordan Kim.
- 40 generated working staff (SYNTH-E-309 through SYNTH-E-348): 5 per team, names/roles/
  clearances from seeded LCG over diverse name pools.
- 8 new Supervisors (SYNTH-E-401 through SYNTH-E-408): one per team, `role:
  'INDEPENDENT_REVIEWER'`, `clearance_level: 'SECRET'`, all `reports_to: 'SYNTH-PP-001'`
  (Project Principal pseudo-id). Working staff `reports_to` their team supervisor.
- 10 new PPBE ProgramRecord instances (SYNTH-PRG-FOXTROT through SYNTH-PRG-OSCAR):
  2 per PPBE team (ALPHA/BRAVO/CHARLIE/DELTA/ECHO), each fully validating.
- 34 new TravelRequest records (SYNTH-TR-201 through SYNTH-TR-234): date-safe construction
  (start day 1-14, end day 15-28 same month).
- 24 new TimeRecord records (SYNTH-TM-301 through SYNTH-TM-324): cost_code always drawn
  from the employee's `cost_code_assignments`.
- `generateStaffData(seed): StaffDataOutput` exported for convergence testing.
- Fixed seed: `STAFF_SEED = 20260803`.

---

### World Model Program Expansion

**`module-apex/src/synthetic-world-model.ts`**: 13 new `ApexProgramRecord` objects added
(P-401 through P-413). `SYNTHETIC_PROGRAMS` export grew from 4 to 17 entries.

P-401–P-407 belong to World Model I team (Dana Jones); P-408–P-413 belong to World
Model II team (Robin Vasquez). Mix of ON_TRACK and AT_RISK statuses.

**World Model count note** (recorded per docs/35 §1 — not smoothed over): docs/35
scoped from 11 existing programs. Direct code inspection found 5 real programs in the
codebase (P-100, P-150, P-200, P-205, P-300). Adding 13 new stubs reaches 18 total,
within the ~18–20 target. The gap between the spec's "11 existing" claim and the
observed 5 is a known discrepancy, documented here and in the session handoff.

**`module-apex/tests/apex-data-adapter.test.ts`**: Updated the portfolio-count assertion
from "4 synthetic programs" to "17 synthetic programs — GD-33 expanded from 4 to 17."
All 228 module-apex tests pass.

---

### Tests

**`sovereign-data/tests/staff-seed.test.ts`** (new, 38 tests):

- Volume assertions: 56 employees, 10 PPBE programs, 34 travel requests, 24 time records,
  13 World Model program IDs.
- Anchor name assertions: all 8 named anchors at their correct IDs.
- Supervisor structure: 8 supervisors all reporting to SYNTH_PROJECT_PRINCIPAL_ID; all 48
  working staff reporting to a SYNTH-E-4xx supervisor.
- Entity validation: all Employee, ProgramRecord, TravelRequest, TimeRecord, and
  StaffProjectAssignment records pass their real `validate*` functions (no mocks).
- Internal consistency: every TimeRecord cost_code ∈ employee's cost_code_assignments;
  every TravelRequest and TimeRecord employee_id references a known seed employee.
- Convergence (docs/35 §5 DC-6): `generateStaffData(STAFF_SEED)` called twice → identical
  JSON.stringify output. Different seed → different roster (negative test). Seed constant
  asserted to be exactly 20260803.

---

## 5 — Done Condition Verification (docs/35 §5)

1. **`reports_to?: string` added to SovereignUser** — shell-contract v1.26, both copies
   SHA-256 identical, Employee.reports_to mirrored. ✓
2. **`StaffProjectAssignment` entity in sovereign-data** — new entity with validator,
   exported from index.ts. ✓
3. **8 teams, 8 named anchors, 8 dedicated Supervisors all reporting to PP** — confirmed
   by test assertions on SYNTH_STAFF_EMPLOYEES. ✓
4. **~56 staff, expanded PPBE and World Model coverage** — exactly 56 employees, 10 new
   PPBE programs (5 PPBE clusters × 2 extra each), 17 World Model programs total. ✓
5. **Every generated record validates against its real `validate*` function** — confirmed
   by staff-seed.test.ts with diagnostic error messages on failure. ✓
6. **Convergence test confirms determinism** — `generateStaffData(STAFF_SEED)` identical
   on two calls; different seed → different roster. ✓

---

## 6 — Lineage and Audit Note

v1.47 extends v1.46's methodology unchanged: test count independently derived from a
full 14-package run at close, not taken from any session self-report.

**GD-33 Build Session is now complete.**

---

*SOVEREIGN Platform — SBOM Registry v1.47 · August 3, 2026*
*Supersedes v1.46 (GD-32 Build Session 2) · Adds GD-33 Build Session*
*Pre-Decisional · Internal Working Document*
