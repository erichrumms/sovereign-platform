# SOVEREIGN Platform — Session 41 Opening Prompt
## GD-22: Role-Based Access Matrix (shell-contract change, pre-approved)

**Prepared by:** Governance Agent, July 18, 2026
**Source documents:** `SOVEREIGN_Role_Access_Matrix_20260718.md` (the approved matrix — the actual
spec for D2/D3) and `SOVEREIGN_Design_Recommendations_20260718.md` (DR-1, background)
**Session number assumed:** 41 — confirm no other session has run since 40 before using this number.
**Status:** Pre-Decisional · Internal Working Document

---

## 1 — SESSION HEADER

**HEAD at time of writing:** verify fresh via `git log -1` (Rule 1) — should be `35becde` or later.

**Shell contract:** v1.16 at session open. **This session changes it, under GD-22 (see §3) — expect
v1.17 at close, with both copies re-verified identical per Constraint #11.** This is different from
Sessions 39 and 40, which deliberately avoided the shell-contract. Verify both copies' SHA-256 match
before beginning and again immediately after the change, not just at the end.

---

## 2 — CRITICAL CODEBASE FACTS (confirmed by direct source read, July 18)

- **`minimumRole: SovereignRole`** is declared at line 1128 of both `shell-contract.ts` and
  `sovereign-shell/shell-contract.ts` — this is the field GD-22 widens to a role list.
- **The access check is exact-match only**, in `defaultRoleAccessPolicy`
  (`sovereign-shell/src/module-loader/index.ts`, line ~133-134):
  `(auth, minimumRole) => auth.hasRole("SYSTEM_ADMIN") || auth.hasRole(minimumRole)`.
- **Every module's own `minimumRole` is declared in its own `index.ts`**, not in
  `register-modules.ts` (which only calls `loader.register(...)`). Current values, confirmed by
  direct grep across all ten: COUNSEL/SCRIBE/LENS = `READ_ONLY`; VIGIL/CPMI/AgentOS/APEX/ARIA =
  `PLATFORM_ADMIN`; NEXUS/FLOWPATH = `AGENT_OPERATOR`.
- **`ModuleNav.tsx`** (sidebar) reads `m.minimumRole` directly in its lock-icon tooltip text
  (`` `${m.displayName} — requires role ${m.minimumRole}` ``, line ~62) — this breaks under a list
  type unless updated.
- **The DEV persona toggle currently supports exactly two roles**, hardcoded in
  `sovereign-shell/src/main.tsx`: `type DevPersonaRole = "SYSTEM_ADMIN" | "PROGRAM_MANAGER"` and
  `const DEV_PERSONA_ROLES: readonly DevPersonaRole[] = ["SYSTEM_ADMIN", "PROGRAM_MANAGER"]`
  (lines 59-60).
- **ARIA's four tabs have zero internal role gating today.** `AriaApp.tsx`'s `TABS` array
  (CLEAR/TRACER/ARC/CPMI-VRS) renders identically to whoever gets past the single module-level
  gate — there is no existing pattern anywhere in this codebase for gating individual tabs within
  an already-mounted module. This is genuinely new logic, not an extension of something that exists.
- **ARIA's module-level gate must admit the union of everyone who needs any tab** — COMPLIANCE_OFFICER,
  PROGRAM_MANAGER, and ANALYST all need to get past the module mount gate before per-tab logic can
  further restrict which tab each of them actually sees. Setting the module-level gate too narrow
  (e.g., leaving it PLATFORM_ADMIN-only) would silently block the whole feature even if the per-tab
  logic inside is built correctly — verify this explicitly once built, don't assume.

---

## 3 — ACTIVE GOVERNANCE DECISIONS

**GD-22 — pre-approved by the Project Principal, July 18, 2026.** Widen `minimumRole: SovereignRole`
to a role list on the `ModuleContract` type, in both shell-contract copies. Shell-contract version
increments v1.16 → v1.17. Standard impact assessment applies (see AGENT_REFERENCE's GD Impact
Assessment Standard) — even though this doesn't touch `HumanDecisionType`, `SovereignEventType`, or
`AgentClass`, still confirm and state explicitly in the handoff that none of those are affected,
per the standard's own rule that "no impact" must be justified, not assumed.

**No other GD is authorized this session.** If implementation reveals a need for any further
shell-contract change beyond the `minimumRole` field itself, that is a Hard Stop (Rule 6) — do not
proceed, surface it in the handoff.

---

## 4 — DONE CONDITION

All four items are required — this is one integrated feature, not independently useful in pieces.
D3 carries the most technical risk (genuinely new pattern, no precedent to follow) — if it proves
substantially harder than scoped, that's a Hard Stop on D3 specifically, not license to skip it
silently or force a rushed version.

### D1 — GD-22: widen `minimumRole` to a role list

- Change the `ModuleContract` type's `minimumRole: SovereignRole` field to a role list in **both**
  `shell-contract.ts` and `sovereign-shell/shell-contract.ts` — identical changes, both copies.
- Update `defaultRoleAccessPolicy` (`module-loader/index.ts`) to check membership in the list
  (`minimumRoles.some(r => auth.hasRole(r))`) rather than a single exact match, preserving the
  `SYSTEM_ADMIN` superuser clause unchanged.
- Update `ModuleNav.tsx`'s tooltip text to read sensibly for a list (e.g., "requires one of:
  X, Y, Z") rather than breaking or showing `[object Object]`.
- Run `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts` — both must match. Record
  the new hash in the handoff as the new hash of record.
- Changelog entry in both shell-contract copies for GD-22, per standard practice.

### D2 — Apply the approved matrix to the nine non-ARIA modules

Per `SOVEREIGN_Role_Access_Matrix_20260718.md`'s "Final Role → Module Access Matrix" table exactly.
Update each module's own `index.ts` declaration. No module outside this list changes.

### D3 — ARIA per-tab gating (new pattern — investigate before committing to an approach)

1. Widen ARIA's own module-level `minimumRole` to the union: `PLATFORM_ADMIN`, `SYSTEM_ADMIN`,
   `COMPLIANCE_OFFICER`, `PROGRAM_MANAGER`, `ANALYST`.
2. Inside `AriaApp.tsx`, gate each tab individually using `ctx.auth.hasRole()`, per the matrix:
   CLEAR → COMPLIANCE_OFFICER (+ admin roles), TRACER → PROGRAM_MANAGER (+ admin roles),
   ARC → ANALYST (+ admin roles), CPMI-VRS → PLATFORM_ADMIN/SYSTEM_ADMIN only.
3. A role without access to a given tab should see the tab either hidden or clearly disabled with
   an honest explanation (matching the platform's existing disclosure pattern) — not a broken or
   blank panel if they somehow reach it directly.
4. **This is new scope with no existing precedent to model it on** — if the cleanest implementation
   turns out to require a shared pattern more complex than direct `hasRole()` calls per tab (e.g.,
   a reusable per-tab gate component), build it as simply as correctness allows rather than
   over-engineering a new abstraction under autonomous operation. If something about this genuinely
   can't be done without another shell-contract change, that's a Hard Stop — GD-22 authorizes only
   the `minimumRole` field change, nothing else.

### D4 — Expand the DEV persona toggle to all eight roles

In `sovereign-shell/src/main.tsx`: widen `DevPersonaRole` and `DEV_PERSONA_ROLES` from two roles to
all eight (`SYSTEM_ADMIN`, `PLATFORM_ADMIN`, `PROGRAM_MANAGER`, `ANALYST`, `COMPLIANCE_OFFICER`,
`AGENT_OPERATOR`, `INDEPENDENT_REVIEWER`, `READ_ONLY`). Follow the existing identity-naming pattern
already established for `PROGRAM_MANAGER` ("Dev — Program Manager") for each new persona.

---

## 5 — AUTONOMOUS OPERATION RULES

- D1 must complete and be SHA-verified before D2 or D3 begin — they depend on the widened type.
- Per Rule 8: before implementing D3, actually read how `ctx.auth.hasRole()` is used elsewhere in
  the codebase (VIGIL's own internal checks are a reasonable reference point) rather than inventing
  an untested pattern from scratch.
- GD-22 is the only shell-contract authorization this session holds. Do not widen scope to any other
  field on `ModuleContract` even if it seems convenient while already in the file.
- If D3's per-tab gating reveals that ARIA's shared UI components (`banners.tsx`, `clear-ui.tsx`)
  need changes to support per-tab visibility, that's still in-scope (module-local) — only a further
  *shell-contract* change would be a Hard Stop.

---

## 6 — STANDING CONSTRAINTS

All 11 apply. **Constraint #11 (synced copies) is directly implicated this session** — both
shell-contract copies must be verified identical after D1, not assumed.

---

## 7 — CLOSE REQUIREMENTS

- Full test suite run with real exit codes (Rule 7).
- `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts` output included verbatim in
  the handoff — this is the new hash of record.
- Handoff states plainly, per D1-D4, what was completed, and for D3 specifically whether the
  scoped approach held or a Hard Stop was hit.
- Handoff explicitly confirms (per §3's impact-assessment requirement) that `HumanDecisionType`,
  `SovereignEventType`, and `AgentClass` were not touched by GD-22.
- Commit and push; produce the standard Session Handoff and SBOM update.

---

*SOVEREIGN Platform · Session 41 Opening Prompt · July 18, 2026*
*Companion to: SOVEREIGN_Role_Access_Matrix_20260718.md*
*GD-22 pre-approved by the Project Principal*
*Pre-Decisional · Internal Working Document*
