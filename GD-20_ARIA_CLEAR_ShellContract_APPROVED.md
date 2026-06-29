# Governance Decision Record — GD-20 (APPROVED)
## ARIA Suite / CLEAR — Shell-Contract additions for compliance events, certification decision, and the CLEAR certification surface
## June 29, 2026 · Raised Session 23 open · APPROVED June 29, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Status:** ✅ APPROVED — June 29, 2026 · Project Principal
**Decision:** Option 1 — Approve GD-20 (Path B) as written
**Shell contract:** v1.14 → v1.15
**Authorized session:** Session 23 (retry) — execute as first deliverable (D1)

---

## Approval Statement

GD-20 is approved as written. Shell-contract v1.14 advances to v1.15. The Build Agent is authorized
to execute all three changes as the first deliverable of Session 23 (retry), before any CLEAR code
is written.

**Rationale for Path B over Path A:**

`ctx.aria` as the tenth shell export is the correct architectural choice. Every product that needs
to expose a surface to other modules does so through the shell context — that is the purpose of the
shared contract. SCRIBE needing to check ARIA certification status before allowing export is exactly
the kind of cross-module dependency the shell context was designed to handle. A workaround using a
module-local certification registry or taskSurface-based proxy would be rewrite debt the moment
`ctx.aria` is added — violating Constraint #3 (no rewrite debt).

The four ARIA event types belong in `SovereignEventType` in the shell contract, not Python-only.
The Python logger taxonomy mirrors the TypeScript types — that is what Constraint #11 sync exists
for. Placing them in Python only while leaving TypeScript without them creates the exact kind of
divergence Constraint #2 was written to prevent.

`COMPLIANCE_CERTIFICATION` belongs in `HumanDecisionType`. Constraint #4 requires every human
decision event to carry `decision_type`. A human certifying a document for export is a human
decision. It needs a registered type.

The architecture spec (docs/16 §4/§7) stated that ARIA Suite requires no shell-contract change.
That statement was written before the Session 23 deliverable design placed ARIA Logger emission in
the TypeScript layer. GD-20 supersedes docs/16 §4/§7 on this point. The spec will be amended.

---

## Approved Changes — Shell-Contract v1.14 → v1.15

### Change 1 — `SovereignEventType` += four ARIA CLEAR event types

```typescript
  // GD-20 — June 2026 (shell-contract v1.15) — four ARIA Suite / CLEAR event types
  | "ARIA_COMPLIANCE_CHECK"      // every automated compliance evaluation
  | "ARIA_CERTIFICATION_ISSUED"  // every export gate opened by CLEAR certification
  | "ARIA_VIOLATION_FLAGGED"     // every compliance deviation surfaced (engine or human)
  | "ARIA_CALENDAR_ALERT"        // every governance-calendar timing violation
```

### Change 2 — `HumanDecisionType` += `COMPLIANCE_CERTIFICATION`

```typescript
  // GD-20 — June 2026 (shell-contract v1.15) — human reviewer certifying an output as
  // compliant in the CLEAR Certification Queue (opens the SCRIBE/PPBE export gate).
  // Synced to sovereign-data/src/shared-types.ts (18 → 19 members).
  | "COMPLIANCE_CERTIFICATION"
```

### Change 3 — tenth shell context export: `aria` (AriaCertificationSurface)

```typescript
export interface AriaCertification {
  document_id: string;
  certified: boolean;
  certifying_actor_id: string;
  certifying_actor_name: string;
  decision_note: string;           // required, >= 10 chars
  applicable_sources: string[];
  workflow_step_id: string;
  certified_at: string;            // ISO 8601
}

export interface AriaCertificationSurface {
  record: (certification: AriaCertification) => void;
  isCertified: (document_id: string) => boolean;
  get: (document_id: string) => AriaCertification | undefined;
  list: () => readonly AriaCertification[];
  subscribe: (listener: (certs: readonly AriaCertification[]) => void) => () => void;
}

// SECTION 7 — SHELL CONTEXT — tenth export:
  aria: AriaCertificationSurface;
```

**Constraint #7 relaxation:** the tenth export is `aria` only. No further exports are authorized by
this GD. Future additions require a new GD.

---

## Constraint #11 Propagation — Required Before Session 23 Closes

| Copy | Change required |
|---|---|
| `shell-contract.ts` (root) | +4 event types, +1 decision type, +`aria` export, +`AriaCertification(Surface)` types, v1.15 changelog |
| `sovereign-shell/shell-contract.ts` | Byte-identical to root — SHA-256 re-verify after change |
| `sovereign-data/src/shared-types.ts` | +`COMPLIANCE_CERTIFICATION` to `HumanDecisionType` + `HUMAN_DECISION_TYPES` const (18 → 19) + test |
| `sovereign-security/sovereign_logger.py` | +4 to `APPROVED_EVENT_TYPES` (75 → 79); +`COMPLIANCE_CERTIFICATION` to `APPROVED_DECISION_TYPES` (18 → 19) |
| `docs/16_ARIA_Suite_Architecture.md` §4/§7 | Amend: ARIA does require a shell-contract change (GD-20); events emitted from TS layer, not Python-only |

**No change required to:**
- `sovereign-api-client/src/types.ts` — no `SovereignProduct` change
- `sovereign-shell/src/module-loader` `VALID_AGENT_CLASSES` — no `AgentClass` change
- `Agent_Identity_Standard.md` — no new agents

---

## Impact Assessment

| Item | Change |
|---|---|
| `SovereignEventType` | +4 (ARIA CLEAR events) — 75 → 79 members |
| `HumanDecisionType` | +1 (`COMPLIANCE_CERTIFICATION`) — 18 → 19 members |
| Shell context exports | 9 → 10 (`aria`) — Constraint #7 relaxed for this addition only |
| `AgentClass` | No change |
| `SovereignProduct` | No change — `ARIA` present since v1.0 |
| `SovereignRole` | No change |
| Additive only? | Yes — union widenings + new types + one new export. Nothing renamed or removed. |
| Modules affected | `module-aria` (emits events, writes `aria` surface) · `module-scribe` (reads `ctx.aria.isCertified`) |
| VIGIL impact | None beyond `sourceProduct: "ARIA"` — already legal |

---

## Changelog Entry for shell-contract.ts

```
v1.15 (June 2026) — GD-20 (ARIA Suite / CLEAR shell-contract enablement, raised Session 23 open,
  approved June 29, 2026). Added four SovereignEventType members (ARIA_COMPLIANCE_CHECK,
  ARIA_CERTIFICATION_ISSUED, ARIA_VIOLATION_FLAGGED, ARIA_CALENDAR_ALERT) emitted by module-aria.
  Added one HumanDecisionType member (COMPLIANCE_CERTIFICATION) for human export certification in
  the CLEAR Certification Queue. Added tenth shell context export `aria` (AriaCertificationSurface)
  plus the AriaCertification type — Standing Constraint #7 advances from NINE to TEN exports for
  this addition only; future exports require another GD. All additive. Propagation: HumanDecisionType
  synced to sovereign-data/src/shared-types.ts (18 → 19); four event types + decision type synced to
  sovereign-security/sovereign_logger.py (APPROVED_EVENT_TYPES 75 → 79,
  APPROVED_DECISION_TYPES 18 → 19). SovereignEventType NOT mirrored in shared-types.
  AriaCertification NOT mirrored in shared-types. No SovereignProduct / SovereignRole / AgentClass
  change. SHA-256 of both copies to be re-verified identical at v1.15; new hash recorded in Session
  23 (retry) handoff and Integration Brief v1.33. Supersedes docs/16 §4/§7 re: no shell-contract
  change — that held only while ARIA events were Python-side; the TS-layer build requires this GD.
```

---

*Governance Decision Record GD-20 · APPROVED June 29, 2026 · Project Principal*
*Pre-Decisional · Internal Working Document*
*File to: Companion Suite/Governance/GD-20_ARIA_CLEAR_ShellContract.md*
