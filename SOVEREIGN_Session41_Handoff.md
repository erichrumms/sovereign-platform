# SOVEREIGN Platform — Session 41 Handoff
## GD-22 Role-Based Access Matrix — D1–D4

**Session:** 41
**Date:** July 19, 2026
**HEAD at close:** `2c0fe9e`
**Commit:** `feat(GD-22/Session41): Role-Based Access Matrix — D1–D4 complete`
**Shell contract:** v1.16 → **v1.17** (GD-22: `minimumRole` widened to `SovereignRole[]`)
**Shell contract SHA (both copies):** `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78`
**Pre-session HEAD:** `9916e69`
**Pre-session SHA:** `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7`
**Agent:** Claude Sonnet 4.6 (claude-sonnet-4-6)

---

## Authorization

GD-22 — pre-approved by Project Principal on July 18, 2026.
Scope: widen `SovereignModuleContract.minimumRole` from `SovereignRole` (single) to `SovereignRole[]` (list), apply the approved Role Access Matrix to all modules, implement ARIA per-tab gating, and expand the DEV persona toggle to all 8 roles. No other field on `SovereignModuleContract` was touched.

---

## Done-Condition Traceability

### D1 — Shell-Contract v1.17 + Loader — COMPLETE ✅

**Shell-contract (both copies)**

- Changed `minimumRole: SovereignRole` → `minimumRole: SovereignRole[]` in `SovereignModuleContract` (Section 8).
- Added GD-22 changelog entry (v1.17 block before the existing v1.16 entry).
- Version header updated: `1.16` → `1.17`.
- Constraint #11 (synced copies): both `shell-contract.ts` and `sovereign-shell/shell-contract.ts` identical at SHA `91da8c18...` — verified with `shasum -a 256` before and after. The SHA was set in this session (D1 changes) and is unchanged through D2–D4, confirming no further contract edits crept in.
- Constraint #7 (ten exports): no new shell context exports. The `minimumRole` widening is module-contract-only; it is not a shell-context field.

**`sovereign-shell/src/module-loader/index.ts`**

Five changes, all consuming `SovereignRole[]`:
- `RoleAccessPolicy` parameter renamed `minimumRoles: SovereignRole[]` (was `minimumRole: SovereignRole`).
- `defaultRoleAccessPolicy`: `auth.hasRole(minimumRole)` → `minimumRoles.some((r) => auth.hasRole(r))`. SYSTEM_ADMIN superuser clause preserved.
- `ModuleAccessDeniedError` constructor: `minimumRole: SovereignRole` → `minimumRoles: SovereignRole[]`. Error message now interpolates the array with `.join(", ")`.
- `RegisteredModuleView.minimumRole: SovereignRole` → `SovereignRole[]`.
- `AccessDenialAudit.minimumRole: SovereignRole` → `SovereignRole[]`.
- `validateContract`: replaced single-value `VALID_ROLES.has()` check with an `Array.isArray` guard + per-element `VALID_ROLES.has()` loop.

**`sovereign-shell/src/navigation/ModuleNav.tsx`**

Tooltip for locked modules updated from `` `requires role ${m.minimumRole}` `` to `` `requires one of: ${m.minimumRole.join(", ")}` ``.

---

### D2 — Role Matrix Applied to All 9 Non-ARIA Modules — COMPLETE ✅

Each module's `index.ts` `minimumRole` converted from a single `SovereignRole` constant to a typed `SovereignRole[]`. Modules that had structural mount gates (`mount()` throws `ModuleAccessDeniedError` before rendering) updated to the `.some()` pattern. `SovereignRole` type added to imports wherever a typed const is declared.

| Module | Previous gate | New `minimumRole` (GD-22 matrix) | Structural gate |
|---|---|---|---|
| COUNSEL | `READ_ONLY` (placeholder) | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST, COMPLIANCE_OFFICER, INDEPENDENT_REVIEWER]` | None (no structural gate) |
| SCRIBE | `READ_ONLY` (placeholder) | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST]` | None |
| LENS | `READ_ONLY` (placeholder) | All 8 roles | None |
| NEXUS | `AGENT_OPERATOR` (placeholder) | `[PLATFORM_ADMIN, SYSTEM_ADMIN, AGENT_OPERATOR, PROGRAM_MANAGER, COMPLIANCE_OFFICER]` | `.some()` updated |
| APEX | `PLATFORM_ADMIN` (placeholder) | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST]` | `.some()` updated |
| FLOWPATH | `AGENT_OPERATOR` (placeholder) | `[PLATFORM_ADMIN, SYSTEM_ADMIN, AGENT_OPERATOR, ANALYST, PROGRAM_MANAGER]` | `.some()` updated |
| VIGIL | `PLATFORM_ADMIN` | `[PLATFORM_ADMIN, SYSTEM_ADMIN]` (unchanged — admin-only confirmed) | `.some()` updated |
| CPMI | `PLATFORM_ADMIN` | `[PLATFORM_ADMIN, SYSTEM_ADMIN]` (unchanged) | `.some()` updated |
| AgentOS | `PLATFORM_ADMIN` | `[PLATFORM_ADMIN, SYSTEM_ADMIN]` (unchanged) | `.some()` updated |

---

### D3 — ARIA Per-Tab Gating — COMPLETE ✅

**New pattern** — no prior precedent in the codebase. Implemented per the platform's existing `hasRole()` direct-call pattern (confirmed by reading VIGIL's structural gate before writing).

**`module-aria/src/index.ts`**

`ARIA_MINIMUM_ROLES` declared as `SovereignRole[]` and exported (so `AriaApp.tsx` can reference it). The array is the union of all per-tab roles:
```
["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER", "PROGRAM_MANAGER", "ANALYST"]
```
Module-level structural gate updated from single-role to `.some()`. Module admits anyone who needs any tab; per-tab gating inside `AriaApp.tsx` restricts which tab each role actually sees.

**`module-aria/src/AriaApp.tsx`** (v1.3 → v1.4)

- `TAB_ROLES: Record<Tab, SovereignRole[]>` — per-tab role lists (admin roles explicit in each list, no separate superuser path):
  - `clear`: `[PLATFORM_ADMIN, SYSTEM_ADMIN, COMPLIANCE_OFFICER]`
  - `tracer`: `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER]`
  - `arc`: `[PLATFORM_ADMIN, SYSTEM_ADMIN, ANALYST]`
  - `vrs`: `[PLATFORM_ADMIN, SYSTEM_ADMIN]`
- `TAB_PRIMARY_ROLE` — maps each tab to the human-readable primary role shown in disabled-tab tooltips.
- `canAccessTab(id)` — calls `TAB_ROLES[id].some((r) => ctx.auth.hasRole(r))`.
- Default active tab: `TAB_ORDER.find(canAccessTab) ?? "clear"` — ensures a user lands on a tab they can actually use, not hardcoded `"clear"` which may be inaccessible to PROGRAM_MANAGER or ANALYST.
- Inaccessible tab buttons: `disabled={true}`, `cursor: not-allowed`, muted colour, lock icon (🔒), `title` tooltip stating `"TABNAME — requires role: ROLE"`.
- `LockedTabNotice` component: defensive fallback shown if a tab panel is reached without access (cannot happen through normal tab navigation, but guards against any direct-mount edge case). Matches the platform's honest-disclosure pattern.
- No shell-contract change required (Hard Stop rule not triggered ✓).

**Rule 8 compliance:** `hasRole()` usage was read in VIGIL's `mount()` before implementing. The D3 pattern (`TAB_ROLES[id].some((r) => ctx.auth.hasRole(r))`) directly mirrors VIGIL's structural gate (`VIGIL_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))`).

---

### D4 — DevPersonaToggle All-8-Roles Expansion — COMPLETE ✅

**`sovereign-shell/src/main.tsx`** (v1.1 → v1.2)

- `DevPersonaRole` widened from `"SYSTEM_ADMIN" | "PROGRAM_MANAGER"` to `SovereignRole` (all 8 values).
- `DEV_PERSONA_ROLES` expanded to all 8 roles in taxonomy order:
  `PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST, COMPLIANCE_OFFICER, AGENT_OPERATOR, INDEPENDENT_REVIEWER, READ_ONLY`
- `DEV_PERSONA_LABELS` — 8 display labels for the dropdown.
- `DEV_PERSONA_NAMES` — 8 names used as the synthetic `DEV_USER.name` (so the user identity reads correctly per role in the shell header).
- `readDevPersona()` validation: existing `includes()` guard is generic over the `DEV_PERSONA_ROLES` array — widening the array automatically widens valid stored values.
- SYSTEM_ADMIN remains the default (unset or invalid localStorage key falls back to `"SYSTEM_ADMIN"`).
- No new role, no shell-contract change, no agent registration.

**What this enables post-session:** developers can now switch to any of the 8 SovereignRoles from the DEV toolbar and verify all role-gated module access and per-tab ARIA gating from the matrix, without touching source.

---

## Test Results

All 9 module `index.test.ts` files updated: `minimumRole` assertions changed from `.toBe(string)` to `.toEqual(SovereignRole[])`, and mount-gate role lists updated to match the approved matrix (roles promoted from blocked to admitted had their test expectations corrected). All suites pass. Exit codes verified.

| Workspace | Passed | Skipped | Total | Exit |
|---|---|---|---|---|
| @sovereign/data | 125 | 0 | 125 | 0 |
| @sovereign/api-client | 175 | 0 | 175 | 0 |
| @sovereign/module-counsel | 100 | 0 | 100 | 0 |
| @sovereign/module-scribe | 220 | 0 | 220 | 0 |
| @sovereign/module-vigil | 177 | 0 | 177 | 0 |
| @sovereign/module-lens | 58 | 0 | 58 | 0 |
| @sovereign/module-cpmi | 58 | 0 | 58 | 0 |
| @sovereign/module-agentos | 89 | 0 | 89 | 0 |
| @sovereign/module-nexus | 159 | 0 | 159 | 0 |
| @sovereign/module-apex | 193 | 0 | 193 | 0 |
| @sovereign/module-flowpath | 135 | 0 | 135 | 0 |
| @sovereign/module-aria | 139 | 0 | 139 | 0 |
| @sovereign/e2e | 107 | 4 | 111 | 0 |
| **TOTAL** | **1735 passed, 4 skipped** | — | **1739** | **all 0** |

**Delta from Session 40:** +7 tests (NEXUS +3 admitted-role cases, APEX +2, FLOWPATH +2).

---

## TypeScript / tsc

Each module's own `tsconfig.json` checked independently (the platform has no root tsconfig):

- All 10 modified module directories: **0 errors** on their own tsconfig.
- `sovereign-shell` lint (cross-module includes): 5 pre-existing errors unchanged from baseline — 4× `?raw` markdown import errors in PPBE panels, 1× unused variable in `VigilApp.tsx`. Session 41 introduced **zero new TypeScript errors**.

---

## Shell-Contract Sync Verification

| Copy | SHA-256 |
|---|---|
| `shell-contract.ts` (root) | `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78` |
| `sovereign-shell/shell-contract.ts` | `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78` |

Copies are identical. Constraint #11 satisfied.

---

## Spec Reconciliations

None required. Every change in D1–D4 matched its spec directly. The ARIA per-tab gating pattern (D3) is new — no prior precedent — but required no deviation from the spec: `hasRole()` is the established mechanism and the tab-role map follows the matrix exactly.

---

## Findings for Governance Agent

### F1 — Pre-existing tsc errors (carried forward from Session 40)
The 5 `sovereign-shell` lint errors are not new to Session 41: 4× `?raw` markdown import errors (PPBEAgentsPanel, PPBECoordinationPanel, PPBEExhibitPanel) and 1× unused variable in `VigilApp.tsx` (`requestId` declared but not read at line 163). These should be tracked for a future fix session if not already on the backlog.

### F2 — ARIA per-tab gating is the first sub-module role-gate pattern
Session 41 establishes the first instance where role gating applies below the module-mount level (within a rendered module's own UI). The pattern — `TAB_ROLES` record + `canAccessTab()` helper + disabled-tab disclosure — is now available as a reference for any future module that needs similar intra-module role splits. No governance document update is required; the pattern is module-local and fully within the GD-22 scope. Recommend noting it in `AGENT_REFERENCE.md` or `Agent_Identity_Standard.md` as an established pattern for future sessions.

### F3 — `ModuleAccessDeniedError.minimumRole` renamed to `minimumRoles`
The property on the thrown error object changed from `minimumRole` (singular) to `minimumRoles` (plural) as part of the loader update. One test (`module-vigil/tests/index.test.ts` line 78) had to be updated from `.minimumRole` to `.minimumRoles`. Any external tooling or logging that reads this property by name will need a corresponding update. No platform-internal consumer other than the vigil test was found to reference the property name directly.

---

## Commits

| Hash | Message |
|---|---|
| `2c0fe9e` | feat(GD-22/Session41): Role-Based Access Matrix — D1–D4 complete |

---

## Update Flags for Integration Brief

- [ ] **Build status table:** Session 41 complete. D1 ✅ D2 ✅ D3 ✅ D4 ✅
- [ ] **Test count:** 1735 passed, 4 skipped (was 1728 passed, 4 skipped — +7 new mount-gate tests).
- [ ] **Shell-contract version:** v1.16 → **v1.17** (GD-22). Update version references in integration brief.
- [ ] **New agents registered:** None.
- [ ] **New GD authorizations:** GD-22 (pre-approved July 18, 2026). Mark closed/implemented.
- [ ] **ARIA per-tab role gate:** New pattern — update AGENT_REFERENCE.md or a patterns doc if the Governance Agent maintains one.

---

*SOVEREIGN Platform · Session 41 Handoff · July 19, 2026*
*HEAD: `2c0fe9e` · Shell contract: v1.17 (GD-22)*
