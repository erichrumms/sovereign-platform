# Governance Decision Record — GD-20 (APPROVED)
## ARIA Suite / CLEAR — Shell-Contract additions for compliance events, certification decision, and the CLEAR certification surface
## June 29, 2026 · Raised during Session 23 open · APPROVED by Project Principal June 29, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Status:** ✅ APPROVED — Option 1 (Path B as written), Project Principal, June 29, 2026. Executed as
            Session 23 D1: shell-contract v1.14 → v1.15, both copies SHA-256 re-verified identical at
            `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876`. Five Constraint #11
            copies propagated.
**Shell contract:** v1.14 → v1.15 (APPROVED, executed)
**Authorized session:** Session 23 (retry) — authorizes deliverables D1–D6.

---

## Why this GD exists

The Session 23 opening prompt directs the Build Agent to build CLEAR (D1–D5) and states three hard
rules: (a) no shell-contract changes are pre-approved this session; (b) Constraint #7 freezes the
shell context at nine exports; (c) the four ARIA Logger event types are "Logger-only — add to
`sovereign_logger.py` only. Do NOT add them to `shell-contract.ts`." It also lists as explicit
STOP-and-document conditions: "Any discovery that CLEAR requires a shell-contract change" and "Any
SCRIBE export gate integration that requires a shell-contract change."

During the session-open analysis (gates all passed: 15 docs loaded, shell-contract SHA-256
`2b3d8674…f17e9910` confirmed unchanged on both copies, agent count verified at 36 directly from the
registry table), the Build Agent found that **three of the literal D2/D4 instructions cannot be
realized in the TypeScript layer without changing `shell-contract.ts`.** Per the STOP rule the agent
did not act, and raised this GD.

The root cause is a divergence between **docs/16 §4/§7** (which designed ARIA to need *no*
shell-contract change, with its events emitted *Python-side only*) and the **Session 23 deliverables**
(which place ARIA Logger emission and the certification gate in the *TypeScript* layer — a React
Certification Queue, a `clear-engine.ts`, and a `ctx.aria.isCertified()` call inside SCRIBE).
TypeScript modules emit only through `ctx.logger.log()`, whose `event_type` is typed to
`SovereignEventType` and whose `decision_type` is typed to `HumanDecisionType`. The Python
`sovereign_logger.py` is a *separate* logger that TypeScript cannot reach. So any TS emission of an
ARIA event, or any TS read of ARIA certification state, requires the shell contract to define it.

---

## The three conflicts (verified against the codebase at HEAD b4f7a75)

| # | Literal Session 23 instruction | Codebase fact | Consequence |
|---|---|---|---|
| 1 | **D2:** "The SCRIBE export gate checks `ctx.aria.isCertified(documentId)`" | `SovereignShellContext` (shell-contract.ts §7) has exactly **nine** exports: `auth, logger, governance, data, navigation, mcp, a2a, agui, taskSurface`. There is no `aria`. | Adding `ctx.aria` is a **tenth shell export** → Constraint #7 freeze → GD required. |
| 2 | **D2/D4:** the React Certification Queue and `clear-engine.ts` "emit `ARIA_CERTIFICATION_ISSUED` / `ARIA_VIOLATION_FLAGGED` … Logger event(s)" | `ctx.logger.log()` takes `event_type: SovereignEventType`. The four ARIA event types are **not** in that union (D4 forbids adding them to shell-contract). | TS code **cannot** emit ARIA events → either add them to `SovereignEventType` (GD), or emit Python-side only (no TS emission — design change). |
| 3 | **D2:** emit "with `decision_type: COMPLIANCE_CERTIFICATION`" | `HumanDecisionType` has 18 members; `COMPLIANCE_CERTIFICATION` is not one. Python `APPROVED_DECISION_TYPES` also lacks it. | Typing a TS event's `decision_type` as `COMPLIANCE_CERTIFICATION` → add to `HumanDecisionType` (GD) + propagate. |

None of these can be worked around inside v1.14 *while keeping the deliverables in TypeScript as
written*. (A no-shell-contract path exists — see "Considered alternative (Path A)" — but it changes
the deliverables, and the Project Principal directed a GD instead.)

---

## Considered alternative — Path A (NO shell-contract change)

For the record, the conflicts *can* be avoided entirely, honoring docs/16 §4/§7 as originally written:

- **ARIA events Python-side only.** The deterministic rules engine emits `ARIA_COMPLIANCE_CHECK` /
  `ARIA_CERTIFICATION_ISSUED` / `ARIA_VIOLATION_FLAGGED` / `ARIA_CALENDAR_ALERT` through
  `sovereign_logger.py` (those four added to `APPROVED_EVENT_TYPES` only — Python, not shell). The
  React layer does not emit them. `COMPLIANCE_CERTIFICATION` rides as a payload string on the
  (non-`HUMAN_DECISION`) `ARIA_CERTIFICATION_ISSUED` event, so it is never checked against
  `APPROVED_DECISION_TYPES` and needs no taxonomy addition.
- **SCRIBE gate via an existing interface.** SCRIBE reads CLEAR certification state from a
  module-`aria`-owned certification registry, or from the existing ninth export `taskSurface`
  (model a certification as a `SharedTask` with `origin_product: "ARIA"`, `status: APPROVED|REJECTED`,
  `origin_request_id: documentId`) — no `ctx.aria`, no new export.

Path A was presented to the Project Principal at Session 23 open and **declined in favour of a GD**,
because it deviates from the literal D2/D4 deliverables (TS emission via `ctx.logger`; `ctx.aria`).
GD-20 below specifies **Path B** — make the shell-contract additions so the deliverables can be built
exactly as written.

---

## Proposed Decision (Path B) — for Project Principal approval

Advance `shell-contract.ts` **v1.14 → v1.15** with the following **additive** changes, and relax
Standing Constraint #7 from nine to **ten** shell context exports for the single `aria` export.

### Change 1 — `SovereignEventType` += four ARIA CLEAR event types

```typescript
  // GD-20 — June 2026 (shell-contract v1.15) — four ARIA Suite / CLEAR event types
  // (continuous compliance monitoring + export certification). Emitted by module-aria
  // (clear-engine + Certification Queue) and by the deterministic aria.rules-engine.
  | "ARIA_COMPLIANCE_CHECK"      // every automated compliance evaluation
  | "ARIA_CERTIFICATION_ISSUED"  // every export gate opened by CLEAR certification
  | "ARIA_VIOLATION_FLAGGED"     // every compliance deviation surfaced (engine or human)
  | "ARIA_CALENDAR_ALERT"        // every governance-calendar timing violation
```

### Change 2 — `HumanDecisionType` += `COMPLIANCE_CERTIFICATION`

```typescript
  // GD-20 — June 2026 (shell-contract v1.15) — a human reviewer certifying an output as
  // compliant in the CLEAR Certification Queue (opens the SCRIBE/PPBE export gate).
  // Synced to sovereign-data/src/shared-types.ts (18 -> 19 members).
  | "COMPLIANCE_CERTIFICATION"
```

### Change 3 — tenth shell context export: `aria` (the CLEAR certification surface)

```typescript
// ------------------------------------------------------------
// ARIA CLEAR CERTIFICATION SURFACE (shell-contract v1.15 — GD-20)
// A shell-owned, in-memory record of CLEAR certification decisions. module-aria's
// Certification Queue records a decision here; module-scribe's export gate reads
// isCertified() before opening export. Carries no governance authority of its own
// (Constraint #1) — recording a certification does not itself log; the Certification
// Queue still emits its own governed ARIA_CERTIFICATION_ISSUED / ARIA_VIOLATION_FLAGGED
// Logger event. The surface only makes a certification visible across products.
// Determinism (docs/16 §1/§3): a certification is a human decision recorded against a
// deterministic CLEAR evaluation — no AI inference is involved at any point.
// Governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

export interface AriaCertification {
  document_id: string;
  /** true = certified (export gate opens); false = flagged (export blocked). */
  certified: boolean;
  certifying_actor_id: string;
  certifying_actor_name: string;
  /** Required, >= 10 chars — consistent with the VIGIL decision-note minimum. */
  decision_note: string;
  /** Regulatory sources the CLEAR engine evaluated against for this document. */
  applicable_sources: string[];
  workflow_step_id: string;
  /** ISO 8601 — when the human recorded the certification decision. */
  certified_at: string;
}

export interface AriaCertificationSurface {
  /** Record a CLEAR certification or flag for a document (Certification Queue). */
  record: (certification: AriaCertification) => void;
  /** Whether a document currently holds a positive CLEAR certification (SCRIBE export gate). */
  isCertified: (document_id: string) => boolean;
  /** The full certification record for a document, if any. */
  get: (document_id: string) => AriaCertification | undefined;
  /** Read-only snapshot of every recorded certification (Compliance Dashboard). */
  list: () => readonly AriaCertification[];
  /** Subscribe to certification-set changes; returns an unsubscribe function. */
  subscribe: (listener: (certs: readonly AriaCertification[]) => void) => () => void;
}
```

```typescript
// SECTION 7 — SHELL CONTEXT — add the tenth export:
  // Tenth export — GD-20 (shell-contract v1.15). The CLEAR certification surface.
  aria: AriaCertificationSurface;
```

**Constraint #7 relaxation scope:** the tenth export is `aria` only. No further exports are
authorized by this GD. Future exports require a new GD.

---

## Proposed changelog entry for `shell-contract.ts`

```
v1.15 (June 2026) — GD-20 (ARIA Suite / CLEAR shell-contract enablement, raised Session 23 open).
  Added four SovereignEventType members (ARIA_COMPLIANCE_CHECK, ARIA_CERTIFICATION_ISSUED,
  ARIA_VIOLATION_FLAGGED, ARIA_CALENDAR_ALERT) — emitted by module-aria. Added one
  HumanDecisionType member (COMPLIANCE_CERTIFICATION) — a human certifying an output as compliant
  in the CLEAR Certification Queue. Added the tenth shell context export `aria`
  (AriaCertificationSurface) plus the AriaCertification type — STANDING CONSTRAINT #7 advances from
  NINE to TEN exports for this addition only; future exports require another GD. All additive (union
  widenings + new exported types + one new export). This GD supersedes docs/16 §4/§7's statement that
  ARIA Suite requires no shell-contract change — that held only while ARIA events were emitted
  Python-side; the Session 23 build emits them from the TypeScript layer. Impact assessment: the four
  event types are emitted only by module-aria; COMPLIANCE_CERTIFICATION propagates to the synced
  HumanDecisionType copy in sovereign-data/src/shared-types.ts (type + HUMAN_DECISION_TYPES const,
  18 -> 19) and its test (Constraint #11); the aria export is read by module-scribe (export gate) and
  written by module-aria (Certification Queue) only. Per Constraint #11 the four event types and the
  decision type are synced to the Python logger (APPROVED_EVENT_TYPES 75 -> 79, APPROVED_DECISION_TYPES
  18 -> 19). SovereignEventType is NOT mirrored in shared-types (only SovereignRole / ClearanceLevel /
  HumanDecisionType are); AriaCertification is NOT mirrored in shared-types (entity/context types are
  not). NO SovereignProduct / SovereignRole / AgentClass change. Both shell-contract copies to be
  SHA-256 re-verified identical at v1.15; new hash recorded in the Session 23 handoff and Integration
  Brief v1.33.
```

---

## Impact Assessment

**Which modules are affected?** `module-aria` (emits the four events, writes the `aria` surface),
`module-scribe` (reads `ctx.aria.isCertified` in the export gate). `module-vigil` is affected only by
ARIA appearing as an alert `sourceProduct` — which is already legal (`"ARIA"` is in
`SovereignProduct`) and needs no VIGIL schema change.

**Does `SovereignEventType` change?** Yes — +4 (ARIA CLEAR events).
**Does `HumanDecisionType` change?** Yes — +1 (`COMPLIANCE_CERTIFICATION`), 18 → 19.
**Does the shell context export count change?** Yes — 9 → 10 (`aria`). Constraint #7 relaxed for this one export.
**Does `AgentClass` change?** No — `aria.rules-engine` is `Governance`, already present.
**Does `SovereignProduct` change?** No — `ARIA` present since v1.0.
**Does `SovereignRole` change?** No.
**Is the change additive?** Yes — union widenings + new types + one new export. Nothing renamed, narrowed, or removed.

**Constraint #11 propagation checklist:**

| Copy | Change required |
|---|---|
| `shell-contract.ts` (root) | +4 event types, +1 decision type, +`aria` export, +`AriaCertification(Surface)` types, v1.15, changelog |
| `sovereign-shell/shell-contract.ts` | Byte-identical to root — SHA-256 re-verify after change |
| `sovereign-data/src/shared-types.ts` | +`COMPLIANCE_CERTIFICATION` to `HumanDecisionType` + `HUMAN_DECISION_TYPES` const (18 → 19) + test |
| `sovereign-security/sovereign_logger.py` | +4 to `APPROVED_EVENT_TYPES` (75 → 79); +`COMPLIANCE_CERTIFICATION` to `APPROVED_DECISION_TYPES` (18 → 19) |
| `sovereign-api-client/src/types.ts` | No change — no `SovereignProduct` change |
| `sovereign-shell/src/module-loader` `VALID_AGENT_CLASSES` | No change — no `AgentClass` change |
| `docs/16_ARIA_Suite_Architecture.md` §4 / §7 | Amend: ARIA *does* take a shell-contract change (GD-20); events emitted from the TS layer, not Python-only |

---

## Decision requested from the Project Principal

Approve **one** of:

1. **Approve GD-20 (Path B) as written** → shell-contract v1.15; the Build Agent applies the change
   as the first Session 23 deliverable (SHA-256 re-verify both copies, record new hash), then builds
   D1–D5 exactly as specified.
2. **Approve a reduced GD-20** — e.g. only the four event types + `COMPLIANCE_CERTIFICATION` (if the
   SCRIBE gate may instead read certification via the existing `taskSurface`, dropping the tenth
   `aria` export). Specify which subset.
3. **Direct Path A instead** (no shell-contract change) → the Build Agent builds D1–D5 with
   Python-side ARIA emission and a `taskSurface`-based SCRIBE gate, deviating from the literal
   `ctx.aria` / TS-emit wording; deviations recorded in the handoff.
4. **Defer** → Session 23 remains paused; no CLEAR build until a later session.

No shell-contract change will be made until this record is marked APPROVED with the chosen option.

---

*Governance Decision Record GD-20 (PROPOSED) · June 29, 2026 · raised at Session 23 open*
*Pre-Decisional · Internal Working Document*
*Place in iCloud: Companion Suite/Governance/ once a disposition is recorded*
