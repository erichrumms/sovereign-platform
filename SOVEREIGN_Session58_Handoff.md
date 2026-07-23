# SOVEREIGN Platform — Session 58 Handoff
**Date:** 2026-07-23  
**HEAD at close:** `6c6b340`  
**Shell-contract version at close:** v1.23  
**Shell-contract SHA-256:** `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`

---

## Deliverables

### D1 — e2e tsc failure resolved

**File:** `e2e/tests/home-dashboard-startup.test.tsx`  
**Change:** Removed unused `EXPIRY_SWEEP_INTERVAL_MS` from the import block.  
The symbol was imported in Session 56 (`b98926d`) but never referenced in the file body. It was the sole cause of the only failing tsc workspace entering this session.

### D2 — GD-28 executed: `getEntries()` exposed on shell-contract logger (v1.22 → v1.23)

**Governance:** GD-28 (pre-approved, docs/28). No Hard Stop required.  
**Files changed:**
- `shell-contract.ts` (root copy)
- `sovereign-shell/shell-contract.ts` (shell copy)
- `module-lens/src/session-events.ts` (collateral fix — see below)

**Type change (SovereignShellContext.logger):**
```typescript
logger: {
  log: (event: SovereignLogEvent) => void;
  // GD-28 (v1.23) — read access to the session-scoped audit buffer.
  // SESSION-SCOPED ONLY: in-memory for this browser session (Stage 1 / Decision 21).
  getEntries: () => readonly SovereignLogEvent[];
};
```

**Version header:** v1.22 → v1.23. Full changelog entry added before the v1.22 entry.

**SHA verification:**
```
6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9  shell-contract.ts
6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9  sovereign-shell/shell-contract.ts
```
Both copies SHA-identical. ✓

**Impact assessment (per Standing Constraint #11):**
- `sovereign-data/shared-types.ts` — no propagation needed (no union members changed)
- `module-loader VALID_AGENT_CLASSES` — no change (no AgentClass union change)
- Python logger `APPROVED_*` — no change (no union members changed)
- Export count: 14 (unchanged — GD-28 widens an existing export's type, does not add a new member)

**Collateral fix — `module-lens/src/session-events.ts`:**  
`withSessionCapture()` builds a partial logger override intercepting `log` for local capture. After GD-28 added `getEntries` as a required field on the logger type, the override object no longer satisfied the interface. Fix: added `getEntries: () => ctx.logger.getEntries()` passthrough. Write-intercept only; reads delegate to the underlying buffer. No logic change.

### D3 — Activity & Decisions tab in Reviewer's Workspace

**File changed:** `module-workspace/src/WorkspaceApp.tsx`  
**Test file:** `module-workspace/tests/WorkspaceApp.test.tsx` (+6 tests)  
**Harness updates:** `module-workspace/tests/test-helpers.tsx`, `e2e/tests/harness.tsx` — both received `getEntries` on their fake logger (required at runtime when WorkspaceApp now calls `ctx.logger.getEntries()`).

**Design decisions:**
- `Section` type widened: `type Section = WorkspaceModuleId | "activity"`. The three existing module IDs remain `WorkspaceModuleId`; "activity" is a Workspace-local tab, not a module. Exhaustiveness check preserved — added `case "activity":` to `renderSection()` switch before the `assertHandled` default.
- Role gating: all five roles included in `SECTION_ROLES["activity"]`. No gate — every reviewer sees their own decisions. Defense-in-depth `LockedSectionNotice` retained in the switch case (standard pattern, Constraint #2).
- Ordering: `SECTION_ORDER = ["vigil", "aria", "scribe", "activity"]` — activity last, so module-review sections remain the default for all live roles.
- Count badge: `ctx.logger.getEntries().filter(e => e.actor_name === ctx.auth.user.name).length` — shows the current user's decision count.

**UX:**
- Default view: `allEntries.filter(e => e.actor_name === ctx.auth.user.name)` — human decisions where the signed-in user is the actor.
- Admin toggle (PLATFORM_ADMIN / SYSTEM_ADMIN): checkbox "Show all platform entries (admin view — N total this session)" — shows unfiltered `allEntries`.
- Session-scope disclosure (prominent, amber banner, `data-testid="activity-scope-disclosure"`): *"Session-scoped only: this buffer is in-memory and does not persist across page reloads (Stage 1 / Decision 21). It is not a permanent audit record — consult the platform audit log for historical decisions."*
- Each entry displays: event_type, decision_type (if present), product badge, actor_name (if present), outcome.

**Tests added (`WorkspaceApp Activity & Decisions tab (GD-28 / Session 58)`):**
1. Activity tab accessible to all 5 roles (no gate)
2. Per-user filtering (actor_name === ctx.auth.user.name by default)
3. Session-scope disclosure present and contains "session" + "in-memory"
4. Admin toggle visible to PLATFORM_ADMIN; switches to all-entries view
5. Admin toggle absent for non-admin roles
6. Count badge reflects current user's decision count (actor_name filter, excludes events without actor_name)

---

## Test Table — All 15 Workspaces

| Workspace | Tests | Status |
|---|---|---|
| sovereign-shell | 14 | ✓ |
| sovereign-data | 125 | ✓ |
| sovereign-api-client | 175 | ✓ |
| module-counsel | 100 | ✓ |
| module-scribe | 228 | ✓ |
| module-vigil | 183 | ✓ |
| module-aria | 139 | ✓ |
| module-agentos | 89 | ✓ |
| module-lens | 58 | ✓ |
| module-nexus | 159 | ✓ |
| module-cpmi | 58 | ✓ |
| module-apex | 218 | ✓ |
| module-flowpath | 135 | ✓ |
| module-workspace | 28 | ✓ (+6 new) |
| e2e | 153 (4 skipped) | ✓ |
| **TOTAL** | **1,862** | **✓** |

Arithmetic: 14+125+175+100+228+183+139+89+58+159+58+218+135+28+153 = **1,862**  
Session 57 baseline: 1,856. Delta: +6 (Activity tab tests). ✓

---

## npm audit

```
found 0 vulnerabilities
```

---

## Constraint Verification

- **Constraint #11 (five synced copies):** Both shell-contract copies SHA-identical. No propagation needed (no union members changed). ✓
- **Constraint #2 (no divergent duplicates):** D3 reads from `ctx.logger.getEntries()` — no parallel logging mechanism. ✓
- **Constraint #3 (no rewrite debt):** D3 is additive; existing VIGIL/ARIA/SCRIBE sections unmodified. ✓
- **GD constraint #7 (each new export requires its own GD):** GD-28 widens an existing export — logger object type. Export count stays at 14. ✓
- **No docs/NN edits, no AGENT_REFERENCE.md edits, no new agents/prompts.** ✓

---

## What's Next (Session 59 candidates)

- **WG-6** — APEX has two hardcoded fiscal periods that need their own governance decision. `docs/29` did not resolve this.
- **WG-9** — Site-tracking schema deferred correctly; stays deferred until a real external data source exists.
- **Walkthrough G Home Dashboard repeat pass** — unblocked since Session 54 (WG-1). The oldest genuinely unclosed Walkthrough G item; needs a human in the browser, not another build session.
- **`docs/27` open governance questions** — EG-A, EG-B, EG-D, EG-E remain open. Not blocking current build work.
