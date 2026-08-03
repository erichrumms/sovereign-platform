# SOVEREIGN Platform — GD-33 Build Session Handoff

**Date:** 2026-08-03
**GD:** 33 — Program & Staff Data Foundation (docs/35)
**HEAD at open:** `5218b28` (build: gather script for docs/35)
**Shell contract at open:** v1.25 · `d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7`

---

## Open Technical Questions — Resolved by Direct Code Check

docs/35 §2 listed three open questions. Each was resolved by reading the actual code,
not by assumption.

| Question | Answer (verified) |
|----------|------------------|
| Real shell-contract version at session open | v1.25 — confirmed from version header in both copies |
| StaffProjectAssignment placement | `sovereign-data/src/entities/` — every canonical entity type in the codebase follows this pattern; confirmed by direct ls |
| TravelRequest status enum | `'SUBMITTED' \| 'ROUTED' \| 'APPROVED' \| 'DENIED' \| 'CANCELLED'` — confirmed from `sovereign-data/src/entities/travel-request.ts` |

---

## Deliverables

### D1 — Schema Addition A: SovereignUser.reports_to

**Shell contract:** v1.25 → v1.26
**SHA-256 (both copies at close):** `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`

**Files modified:**

| File | Change |
|------|--------|
| `shell-contract.ts` | Version header bumped; GD-33 changelog entry added; `reports_to?: string` added to `SovereignUser` |
| `sovereign-shell/shell-contract.ts` | Identical changes; SHA-256 verified identical at close |
| `sovereign-data/src/entities/employee.ts` | `reports_to?: string` added to `Employee` (mirrors SovereignUser.reports_to, GD-33 comment); `validateEmployee` rejects present-but-empty string |
| `sovereign-data/src/index.ts` | `SOVEREIGN_DATA_VERSION` bumped `1.6.0` → `1.7.0`; new exports added (see D3) |

**Standing Constraint #7 (14 shell context exports):** unchanged — `reports_to` widens
`SovereignUser` in place; does not add a new context member.

---

### D2 — Schema Addition B: StaffProjectAssignment

**Files created:**

| File | Change |
|------|--------|
| `sovereign-data/src/entities/staff-project-assignment.ts` | New entity: `StaffProjectAssignment` interface + `validateStaffProjectAssignment` |

Interface:
```
staff_id: string          // FK → Employee.employee_id
project_id: string        // FK → ProgramRecord or ApexProgramRecord
project_system: 'world_model' | 'ppbe_native'
```

Placement confirmed by direct inspection: all canonical entity types live in
`sovereign-data/src/entities/` and export from `sovereign-data/src/index.ts`.

---

### D3 — Generation Script + Team Structure + Exports

**Files created:**

| File | Change |
|------|--------|
| `sovereign-data/src/synthetic/staff-seed.ts` | New ~752-line generation script |

**56 employees generated deterministically from `STAFF_SEED = 20260803`:**

| Range | Count | Role |
|-------|-------|------|
| SYNTH-E-301–308 | 8 | Named anchors (fixed, from docs/35 §3 table) |
| SYNTH-E-309–348 | 40 | Generated working staff (5 per team, LCG-seeded) |
| SYNTH-E-401–408 | 8 | New Supervisors (`INDEPENDENT_REVIEWER`, `SECRET`, `reports_to: SYNTH-PP-001`) |

**Team structure (docs/35 §3):**

| Team | Anchor | Anchor ID | Supervisor |
|------|--------|-----------|-----------|
| ALPHA | Marcus Cole (PM) | SYNTH-E-301 | SYNTH-E-401 (Lorraine Osei) |
| BRAVO | Sarah Okonkwo (PM) | SYNTH-E-302 | SYNTH-E-402 (Marcus Tanaka) |
| CHARLIE | James Rivera (Analyst) | SYNTH-E-303 | SYNTH-E-403 (Bria Guerrero) |
| DELTA | Patricia Webb (PM) | SYNTH-E-304 | SYNTH-E-404 (Devin Fontaine) |
| ECHO | David Nkosi (PM) | SYNTH-E-305 | SYNTH-E-405 (Amara Santos) |
| World Model I | Dana Jones (PM) | SYNTH-E-306 | SYNTH-E-406 (Kofi Petrov) |
| World Model II | Robin Vasquez (PM) | SYNTH-E-307 | SYNTH-E-407 (Elena Mensah) |
| T&T Operations | Jordan Kim (PM) | SYNTH-E-308 | SYNTH-E-408 (Rafael Andersen) |

**Supervisor role note:** `SUPERVISOR` is not in the `SovereignRole` enum. Supervisors
assigned `role: 'INDEPENDENT_REVIEWER'` — the closest existing role covering review and
oversight responsibilities.

**10 new PPBE ProgramRecord instances (static, validated):**

| Program ID | Name | Team |
|-----------|------|------|
| SYNTH-PRG-FOXTROT | Autonomous Logistics Routing | ALPHA |
| SYNTH-PRG-GOLF | Distributed Inventory Visibility | ALPHA |
| SYNTH-PRG-HOTEL | Cyber Threat Intelligence Feed | BRAVO |
| SYNTH-PRG-INDIA | Zero-Trust Network Segmentation | BRAVO |
| SYNTH-PRG-JULIET | Endpoint Security Uplift | CHARLIE |
| SYNTH-PRG-KILO | Vulnerability Management Automation | CHARLIE |
| SYNTH-PRG-LIMA | Depot Sustainment Platform Migration | DELTA |
| SYNTH-PRG-MIKE | Maintenance Record Digitization | DELTA |
| SYNTH-PRG-NOVEMBER | Fleet Readiness Analytics | ECHO |
| SYNTH-PRG-OSCAR | Supply Chain Risk Monitoring | ECHO |

**34 TravelRequest records (SYNTH-TR-201 through SYNTH-TR-234):** date-safe construction
(start day 1-14, end day 15-28 of same month) ensures `travel_end_date > travel_start_date`
for all records.

**24 TimeRecord records (SYNTH-TM-301 through SYNTH-TM-324):** `cost_code` always drawn
from the generating employee's own `cost_code_assignments` array, guaranteed by construction.

**`generateStaffData(seed): StaffDataOutput` exported** for convergence testing.

**`sovereign-data/src/index.ts`:** Exports added for `StaffProjectAssignment`,
`validateStaffProjectAssignment`, `STAFF_SEED`, `SYNTH_PROJECT_PRINCIPAL_ID`,
`SYNTH_STAFF_EMPLOYEES`, `SYNTH_STAFF_PPBE_PROGRAMS`, `SYNTH_STAFF_TRAVEL_REQUESTS`,
`SYNTH_STAFF_TIME_RECORDS`, `SYNTH_STAFF_ASSIGNMENTS`, `SYNTH_STAFF_WORLD_MODEL_PROGRAM_IDS`,
and `generateStaffData`.

---

### D4 — World Model Program Expansion

**Files modified:**

| File | Change |
|------|--------|
| `module-apex/src/synthetic-world-model.ts` | 13 new `ApexProgramRecord` objects (P-401–P-413); `SYNTHETIC_PROGRAMS` export expanded from 4 to 17 entries |
| `module-apex/tests/apex-data-adapter.test.ts` | Portfolio count assertion updated from "4 synthetic programs" to "17 synthetic programs — GD-33 expanded" |

**World Model count — discrepancy recorded plainly:**

docs/35 §1 claimed 11 existing World Model programs. Direct code inspection found 5
real programs (P-100, P-150, P-200, P-205, P-300) — P-205 lives only in
`module-cpmi/src/world-model-port.ts`. Adding 13 new stubs (P-401–P-413) reaches 18
total World Model programs, within the ~18–20 target. The gap between "11" and the
observed 5 is a spec inconsistency, recorded here — not smoothed over.

---

### D5 — Tests

**Files created:**

| File | Change |
|------|--------|
| `sovereign-data/tests/staff-seed.test.ts` | 38 new tests (docs/35 §5 DC-5 and DC-6) |

Test coverage:
- Volume: 56 employees, 10 PPBE programs, 34 travel requests, 24 time records, 13 WM IDs
- Anchor names: all 8 at correct employee IDs
- Supervisor structure: 8 supervisors reporting to PP; 48 working staff reporting to supervisors
- Entity validation: all records pass real `validate*` functions (no mocks)
- Internal consistency: TimeRecord cost_code ∈ employee cost_code_assignments; foreign key integrity
- Convergence (DC-6): `generateStaffData(STAFF_SEED)` identical on two calls; different seed → different roster

---

## Test Totals at Close

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
| **JS/TS total** | **1,856** |
| **e2e** | **149 (4 skip)** |
| **Python** | **195** |
| **Platform total** | **2,200** |

Up from 2,162 at GD-32 close. Delta: +38 (all new tests in staff-seed.test.ts).

---

## SHA-256 Verification

```
42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b  shell-contract.ts
42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b  sovereign-shell/shell-contract.ts
```

Both copies identical. Verified at session close via `shasum -a 256`.

---

## TypeScript Type Check

```
sovereign-data: zero errors (tsc --noEmit -p tsconfig.json)
module-apex:    zero errors (tsc --noEmit -p tsconfig.json)
sovereign-shell: zero errors (tsc --noEmit -p tsconfig.json)
```

---

## Done Condition Verification (docs/35 §5)

1. `reports_to?: string` in SovereignUser (shell-contract v1.26) + Employee (sovereign-data) — verified ✓
2. `StaffProjectAssignment` entity with `validateStaffProjectAssignment` in sovereign-data — verified ✓
3. 8 teams, 8 named anchors, 8 Supervisors all reporting to SYNTH-PP-001 — asserted by tests ✓
4. 56 staff, 10 new PPBE programs, 17+ World Model programs, 34 travel, 24 time, assignments — verified ✓
5. All records validate against real `validate*` functions — 38 tests confirm ✓
6. Convergence: `generateStaffData(STAFF_SEED)` deterministic — test DC-6 confirms ✓

---

## Session Gate for Next Opener

- Shell contract: **v1.26** · `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`
- SBOM: **v1.47** (SBOM_GD33_Update.md)
- Test total: **2,200** (1,856 JS/TS + 149 e2e + 195 Python)
- Standing Constraint #7 (14 shell context exports): **unchanged**
- Zero new production dependencies

---

*GD-33 Build Session — closed August 3, 2026*
