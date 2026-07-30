# Governance Decision Record — GD-30 (APPROVED)
## Program Point-of-Contact — Shell-Contract addition for POC name and role on ProgramStatusSnapshot
## July 29, 2026 · Raised Session 75 open · APPROVED July 29, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Status:** ✅ APPROVED — July 29, 2026 · Project Principal
**Decision:** Approved as written — add `point_of_contact` to `ProgramStatusSnapshot`
**Shell contract:** v1.23 → v1.24
**Authorized session:** Session 75 — execute as part of D1 (WH-5 + Program Health redesign)

---

## Approval Statement

GD-30 is approved as written. Shell-contract v1.23 advances to v1.24. The Build Agent is
authorized to execute the one change below as part of D1 in Session 75, before D1c Program
Health wiring is built.

**Scope boundary (hard):** The ONLY authorized contract change is adding `point_of_contact`
(name and role strings) to `ProgramStatusSnapshot`. No other field, surface, or type
may be added or changed under this GD. Any further contract change requires a new GD.

**Rationale:**

The SYNTH-PRG portfolio now carries a named point of contact per program. That POC must flow
from APEX (which reads ProgramRecord from the seed) to the Home Dashboard (which reads
ProgramStatusSnapshot from the shared surface). `ProgramStatusSnapshot` is the correct place
for this field: it is the shell-owned narrow snapshot that bridges APEX (writer) to any module
that needs program-level context (reader). Adding it here keeps the dependency direction
correct (APEX writes to the surface; Home reads from the surface) — no module reaches into
another. The field is optional so the existing surface is backward-compatible with any caller
that does not supply it.

The SYNTH-PRG series is the program dataset governed here. The P-100/P-200/P-150/P-300
World Model is separately governed and is NOT affected by this GD.

---

## Approved Change — Shell-Contract v1.23 → v1.24

### Change 1 — `ProgramStatusSnapshot` += optional `point_of_contact` field

```typescript
export interface ProgramStatusSnapshot {
  readonly program_id: string;
  readonly percent_obligated: number;
  readonly status: "on_track" | "at_risk" | "off_track";
  readonly narrative: string;
  readonly updated_at: string; // ISO 8601
  // GD-30 (v1.24) — point of contact for this program's portfolio entry. Optional:
  // absent when APEX does not populate it (backward-compatible widening).
  readonly point_of_contact?: { readonly name: string; readonly role: string };
}
```

This is a non-breaking type widening. Every existing `ProgramStatusSnapshot` publication
and every existing consumer continues to compile and function without change.

---

## Constraint #11 Propagation

| Artifact | Action required |
|---|---|
| `shell-contract.ts` (repo root) | Updated — v1.23 → v1.24, `point_of_contact` added to `ProgramStatusSnapshot`. |
| `sovereign-shell/shell-contract.ts` | Updated — identical byte-for-byte with root copy. |
| `sovereign-data/src/shared-types.ts` | NOT affected — `ProgramStatusSnapshot` is not mirrored here (only `SovereignRole`, `ClearanceLevel`, `HumanDecisionType` are). |
| `sovereign-security/sovereign_logger.py` | NOT affected — no `SovereignEventType` or `HumanDecisionType` change. |
| `sovereign-api-client/src/types.ts` | NOT affected — copies only `SovereignProduct`, `SovereignTier`, `ClearanceLevel`; none changed. |

SHA-256 (v1.24, both copies): `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f`

---

## Impact Assessment

- **NO** `HumanDecisionType` change → no `shared-types.ts` propagation, no Python logger change
- **NO** `SovereignEventType` change
- **NO** `AgentClass` change
- **NO** `SovereignRole` / `SovereignProduct` change
- **NO** new shell context member → Standing Constraint #7 export count unchanged (still fourteen at v1.22 / GD-27)
- This is an additive optional field on an existing surface type — a backward-compatible non-breaking widening

**Consumers of `ProgramStatusSnapshot` affected:**

| Consumer | Change |
|---|---|
| `module-apex/src/ppbe-dashboard.ts` `publishProgramStatuses()` | Now includes `point_of_contact` when publishing snapshots (drawn from `ProgramRecord.point_of_contact`). |
| `sovereign-shell/src/PlatformHome.tsx` `ProgramTile` | Renders `point_of_contact.name` / `point_of_contact.role` beneath the narrative when present. |
| `module-vigil/src/vigil-approval-session.ts` | NOT affected — reads `get()` for obligation context; no POC consumption. |

**No module that currently reads `ProgramStatusSurface` needs a code change to continue compiling.**

---

## Changelog Entry (shell-contract.ts)

```
 *   v1.24 (July 29, 2026) — GD-30 (Program Point-of-Contact addition, approved by the
 *                       Project Principal July 29, 2026, this session, scope limited to:
 *                       add optional `point_of_contact` field (name + role strings) to
 *                       `ProgramStatusSnapshot` (PROGRAM STATUS SURFACE TYPES block,
 *                       Section 7). Optional — absent when APEX does not populate it;
 *                       present for all five SYNTH-PRG programs. This is a type-level
 *                       addition only — non-breaking widening of an existing surface type.
 *                       Impact assessment: NO HumanDecisionType change (not synced to
 *                       shared-types.ts or Python logger — Constraint #11 has nothing to
 *                       propagate for this GD). NO SovereignEventType change. NO AgentClass
 *                       change. NO SovereignRole / SovereignProduct change.
 *                       sovereign-api-client/src/types.ts NOT affected (copies only
 *                       SovereignProduct / SovereignTier / ClearanceLevel — none changed).
 *                       MODULE-LOADER and VALID_AGENT_CLASSES: not touched. sovereign_logger.py
 *                       APPROVED_* lists: not touched. Standing Constraint #7 (export count):
 *                       NOT incremented — widens an existing export's type, not adds a new
 *                       context member. CONSUMERS: APEX (publishProgramStatuses now includes
 *                       point_of_contact drawn from ProgramRecord when present); PlatformHome
 *                       (ProgramTile renders POC beneath the narrative when the snapshot
 *                       carries it). Both shell-contract copies SHA-256 re-verified identical
 *                       at v1.24.
```
