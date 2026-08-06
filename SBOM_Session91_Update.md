# SOVEREIGN Platform — SBOM Update
## Version 1.58 · August 5, 2026

**Supersedes:** v1.57 (Session 90b — stale test-name label fix in startup-publish-convergence.test.ts)
**Adds:** Session 91 — docs/34 Phase 3: SUPERVISOR role added to SovereignRole (shell-contract v1.28);
8 synthetic supervisor employees reassigned from INDEPENDENT_REVIEWER placeholder to SUPERVISOR;
FLOWPATH access granted to SUPERVISOR (minimumRole). Zero new production dependencies.

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.27 | Session 87 | GD-34: added `fallback_category?`, `duration_ms?`, `stop_reason?`, `responded_at?` to `SovereignLogEvent`. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Sessions 88–90 | Unchanged. Re-verified at each close. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| **v1.28** | **Session 91** | **docs/34 Phase 3: added `SUPERVISOR` to `SovereignRole` union. No new event type, no new HumanDecisionType, no new AgentClass, no new SovereignProduct, no new shell export. synced: shared-types.ts, VALID_ROLES, DevPersonaToggle.** | **`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`** |

---

## 2 — Production Dependency Delta

**Zero new production dependencies this session.**

All changes are role taxonomy extensions (TypeScript unions, runtime arrays), synthetic data
reassignments, module access-list additions, and test updates. No new npm packages installed.

---

## 3 — Files Changed This Session

| File | Change |
|---|---|
| `shell-contract.ts` (root) | v1.27 → v1.28. Added `SUPERVISOR` to `SovereignRole` union. Changelog entry for docs/34 Phase 3 / Session 91. |
| `sovereign-shell/shell-contract.ts` | Identical change. SHA-256 re-verified both copies identical at v1.28. |
| `sovereign-data/src/shared-types.ts` | Synced: `SovereignRole` union + `SOVEREIGN_ROLES` runtime array widened (8 → 9 members). Comment updated to reference v1.28. |
| `sovereign-shell/src/module-loader/index.ts` | `VALID_ROLES` set widened: `"SUPERVISOR"` added so FLOWPATH's `minimumRole` (now includes SUPERVISOR) passes contract validation. |
| `sovereign-shell/src/DevPersonaToggle.tsx` | `DEV_PERSONA_ROLES` and `DEV_PERSONA_LABELS` updated: `"SUPERVISOR"` added between `INDEPENDENT_REVIEWER` and `READ_ONLY`. |
| `sovereign-shell/src/main.tsx` | `DEV_PERSONA_NAMES` updated: `SUPERVISOR: "Dev — Supervisor"` added. |
| `sovereign-data/src/synthetic/staff-seed.ts` | 8 supervisor employees (SYNTH-E-401–408) reassigned from `role: 'INDEPENDENT_REVIEWER'` (Session 79 placeholder) to `role: 'SUPERVISOR'`. |
| `module-flowpath/src/index.ts` | `FLOWPATH_MINIMUM_ROLES` widened: `"SUPERVISOR"` added (docs/34 Phase 3 — "FLOWPATH access granted explicitly"). |
| `module-flowpath/tests/index.test.ts` | Role-list assertion updated (5 → 6 roles); SUPERVISOR added to admitted-roles test. |
| `sovereign-data/tests/staff-seed.test.ts` | New test: all 8 supervisors carry `role: 'SUPERVISOR'` (was INDEPENDENT_REVIEWER placeholder). |
| `sovereign-data/tests/shared-types.test.ts` | SOVEREIGN_ROLES length assertion updated (8 → 9); SUPERVISOR containment assertion added. |
| `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | New SUPERVISOR nav snapshot test added (1 module: FLOWPATH). 3 pre-existing snapshots updated (COMPLIANCE_OFFICER, INDEPENDENT_REVIEWER, DevPersonaToggle) due to module list or toggle changes. |
| `SBOM_Session91_Update.md` | This file — v1.57. |

---

## 4 — Test Results

All tests pass. 15 workspaces tsc --noEmit clean.

| Workspace | Tests | Result |
|---|---|---|
| sovereign-data | 164 | PASS |
| sovereign-shell | 20 | PASS |
| module-counsel | 100 | PASS |
| module-vigil | 215 | PASS |
| module-nexus | 172 | PASS |
| module-flowpath | 153 | PASS |
| module-apex | 234 | PASS |
| module-scribe | 243 | PASS |
| module-lens | 63 | PASS |
| module-cpmi | 62 | PASS |
| module-agentos | 89 | PASS |
| module-workspace | 33 | PASS |
| module-aria | 150 | PASS |
| sovereign-api-client | 192 | PASS |
| e2e | 155 pass / 4 skip | PASS |

---

## 5 — Access Matrix Note (Known Gap — deferred to next session)

The 8 supervisor employees (SYNTH-E-401–408) previously held `INDEPENDENT_REVIEWER`,
which granted them access to COUNSEL and LENS. After reassignment to `SUPERVISOR`, they
lose COUNSEL and LENS access (those modules do not yet list SUPERVISOR in their minimumRole).
This is intentional per Session 91 scope: role taxonomy + FLOWPATH access only. The
supervisor access matrix for COUNSEL/LENS is deferred to the next supervisor-access-matrix
session (docs/34 Phase 3 follow-on).

The `responsible_role: "INDEPENDENT_REVIEWER"` string in
`module-nexus/src/ppbe-synthetic-coordination.ts:111` is a plain string field (not
SovereignRole-typed), referring to the organizational concept of independent review for
that coordination step — not a reference to the 8 specific supervisor employees.
INDEPENDENT_REVIEWER remains a valid SovereignRole; this record is unaffected.
