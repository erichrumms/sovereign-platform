# SBOM Session 41 Update
## SOVEREIGN Platform — Session 41 (July 19, 2026)

**Session:** 41
**HEAD at close:** `2c0fe9e`
**Shell contract:** v1.16 → **v1.17** (GD-22 — `minimumRole` widened to `SovereignRole[]`)
**Shell contract SHA (both copies):** `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78`
**Date:** July 19, 2026

---

## New Components

None. Session 41 contained no new files — only changes to existing source and test files.

---

## Changed Components

### `shell-contract.ts` + `sovereign-shell/shell-contract.ts`
- **Change type:** Governance directive (GD-22 — D1)
- **Version:** v1.16 → v1.17
- **Description:** `SovereignModuleContract.minimumRole` widened from `SovereignRole` (single value) to `SovereignRole[]` (non-empty list). GD-22 changelog entry added. No other field changed. Both copies are SHA-identical per Constraint #11.
- **SHA-256 (both):** `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78`
- **Pre-session SHA:** `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7`
- **New dependencies:** None.

### `sovereign-shell/src/module-loader/index.ts`
- **Change type:** Loader update to consume `SovereignRole[]` (D1)
- **Description:** `RoleAccessPolicy` parameter, `defaultRoleAccessPolicy`, `ModuleAccessDeniedError` (`minimumRole` → `minimumRoles: SovereignRole[]`), `RegisteredModuleView.minimumRole`, `AccessDenialAudit.minimumRole`, and `validateContract` all updated for array type.
- **New dependencies:** None.

### `sovereign-shell/src/navigation/ModuleNav.tsx`
- **Change type:** UI update (D1)
- **Description:** Locked-module tooltip updated from `` `requires role ${m.minimumRole}` `` to `` `requires one of: ${m.minimumRole.join(", ")}` ``.
- **New dependencies:** None.

### `sovereign-shell/src/main.tsx`
- **Change type:** Dev tooling expansion (D4 — GD-22)
- **Version:** 1.1 → 1.2
- **Description:** `DevPersonaToggle` expanded from 2 roles (`SYSTEM_ADMIN`, `PROGRAM_MANAGER`) to all 8 `SovereignRole` values. `DEV_PERSONA_ROLES`, `DEV_PERSONA_LABELS`, and `DEV_PERSONA_NAMES` updated accordingly. Enables exercising all role-gated access paths from the DEV toolbar without touching source.
- **New dependencies:** None.

### `module-counsel/src/index.ts`
- **Change type:** Access policy update (D2 — GD-22)
- **minimumRole change:** `"READ_ONLY"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST", "COMPLIANCE_OFFICER", "INDEPENDENT_REVIEWER"]`
- **SovereignRole import:** Added (for typed const).
- **New dependencies:** None.

### `module-scribe/src/index.ts`
- **Change type:** Access policy update (D2 — GD-22)
- **minimumRole change:** `"READ_ONLY"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"]`
- **SovereignRole import:** Added.
- **New dependencies:** None.

### `module-lens/src/index.ts`
- **Change type:** Access policy update (D2 — GD-22)
- **minimumRole change:** `"READ_ONLY"` → all 8 `SovereignRole` values
- **SovereignRole import:** Added.
- **New dependencies:** None.

### `module-nexus/src/index.ts`
- **Change type:** Access policy update + structural gate refactor (D2 — GD-22)
- **minimumRole change:** `"AGENT_OPERATOR"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "PROGRAM_MANAGER", "COMPLIANCE_OFFICER"]`
- **Structural gate:** `ctx.auth.hasRole("PLATFORM_ADMIN")` replaced with `NEXUS_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))`.
- **New dependencies:** None.

### `module-apex/src/index.ts`
- **Change type:** Access policy update + structural gate refactor (D2 — GD-22)
- **minimumRole change:** `"PLATFORM_ADMIN"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"]`
- **Structural gate:** Updated to `.some()` pattern.
- **New dependencies:** None.

### `module-flowpath/src/index.ts`
- **Change type:** Access policy update + structural gate refactor (D2 — GD-22)
- **minimumRole change:** `"AGENT_OPERATOR"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "ANALYST", "PROGRAM_MANAGER"]`
- **Structural gate:** Updated to `.some()` pattern.
- **New dependencies:** None.

### `module-vigil/src/index.ts`
- **Change type:** Access policy update + structural gate refactor (D2 — GD-22)
- **minimumRole change:** `"PLATFORM_ADMIN"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN"]` (unchanged access; conversion to array only)
- **Structural gate:** Updated to `.some()` pattern.
- **New dependencies:** None.

### `module-cpmi/src/index.ts`
- **Change type:** Access policy update + structural gate refactor (D2 — GD-22)
- **minimumRole change:** `"PLATFORM_ADMIN"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN"]` (unchanged access; array conversion only)
- **Structural gate:** Updated to `.some()` pattern.
- **New dependencies:** None.

### `module-agentos/src/index.ts`
- **Change type:** Access policy update + structural gate refactor (D2 — GD-22)
- **minimumRole change:** `"PLATFORM_ADMIN"` → `["PLATFORM_ADMIN", "SYSTEM_ADMIN"]` (unchanged access; array conversion only)
- **Structural gate:** Updated to `.some()` pattern.
- **New dependencies:** None.

### `module-aria/src/index.ts`
- **Change type:** Access policy update + structural gate refactor (D3 — GD-22)
- **minimumRole change:** `"PLATFORM_ADMIN"` → `ARIA_MINIMUM_ROLES` (`["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER", "PROGRAM_MANAGER", "ANALYST"]`) — widened to the union of all per-tab roles.
- **New export:** `ARIA_MINIMUM_ROLES` (exported so `AriaApp.tsx` can use it for the per-tab check).
- **Structural gate:** Updated to `.some()` pattern admitting the wider set.
- **New dependencies:** None.

### `module-aria/src/AriaApp.tsx`
- **Change type:** Per-tab role gating (D3 — GD-22, new pattern)
- **Version:** 1.3 → 1.4
- **Description:** Added `TAB_ROLES` record, `TAB_PRIMARY_ROLE` record, `canAccessTab()` helper, dynamic default tab (first accessible), disabled-tab rendering with lock icon and tooltip, and `LockedTabNotice` defensive fallback component. The first instance of sub-module intra-UI role gating in the platform.
- **New dependencies:** None. Uses `ctx.auth.hasRole()` already available through `SovereignShellContext`.

---

## Changed Test Files

Nine `tests/index.test.ts` files updated to match the new `SovereignRole[]` type and revised mount-gate role expectations. No test logic changes — only assertion values updated to reflect the approved access matrix.

| File | Change |
|---|---|
| `module-vigil/tests/index.test.ts` | `.toBe("PLATFORM_ADMIN")` → `.toEqual([...])`, `.minimumRole` → `.minimumRoles` (property rename) |
| `module-cpmi/tests/index.test.ts` | `.toBe("PLATFORM_ADMIN")` → `.toEqual([...])` |
| `module-agentos/tests/index.test.ts` | `.toBe("PLATFORM_ADMIN")` → `.toEqual([...])` |
| `module-aria/tests/index.test.ts` | `.toBe("PLATFORM_ADMIN")` → `.toEqual([...])` with 5-role ARIA array |
| `module-scribe/tests/index.test.ts` | `.toBe("READ_ONLY")` → `.toEqual([...])` |
| `module-lens/tests/index.test.ts` | `.toBe("READ_ONLY")` → `.toEqual([...])` with all-8-roles array |
| `module-nexus/tests/index.test.ts` | Role array assertion; PROGRAM_MANAGER moved from throws→admits |
| `module-apex/tests/index.test.ts` | Role array assertion; PROGRAM_MANAGER + ANALYST moved from throws→admits |
| `module-flowpath/tests/index.test.ts` | Role array assertion; ANALYST + PROGRAM_MANAGER moved from throws→admits |

---

## Test Totals (Session 41)

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
| **TOTAL** | **1735** | **4** | **1739** | **all 0** |

**Delta from Session 40:** +7 tests (NEXUS +3, APEX +2, FLOWPATH +2 — new admitted-role mount-gate cases).

---

## Shell Contract Sync Verification

| Copy | SHA-256 |
|---|---|
| `shell-contract.ts` (root) | `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78` |
| `sovereign-shell/shell-contract.ts` | `91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78` |

Copies are SHA-identical. Constraint #11 satisfied.

---

*SOVEREIGN Platform · SBOM Session 41 Update · July 19, 2026*
