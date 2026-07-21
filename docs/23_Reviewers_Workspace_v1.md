# docs/23 — Reviewer's Workspace, v1

**Prepared by:** Governance Agent, July 20, 2026
**Design authority:** `docs/22_Informed_Decision_Making.md` — read it first; this spec implements
one concrete instance of it, not a new philosophy.
**Status:** Pre-Decisional · Internal Working Document — design authority, not yet a build session
**Governance Decision:** **GD-25 — proposed, not yet approved.**

---

## 1 — What's already decided, stated once so this spec doesn't re-litigate it

Resolved in conversation with the Project Principal, July 20:

1. **The Workspace embeds real, working decision components — it does not curate a summary and
   link elsewhere.** A user acts on the real thing, inline.
2. **v1 scope: three decision screens** — VIGIL's Agent Approval Queue, ARIA's CLEAR
   Certification, SCRIBE's T&T Review. Chosen because these are the three screens where the
   embed-real-component pattern was actually verified in code, not assumed.
3. **The Workspace is a genuine new top-level module**, not a Home Dashboard extension — the
   Home Dashboard is explicitly a survey (`docs/22` §2); this is a place work actually happens.
4. **State-preserving "go back to the source module" navigation is explicitly deferred to v1.1.**
   Real, separate engineering (the shell *and* three target modules would each need new entry
   points) — not bundled into v1 to avoid the kind of overreach Session 40's Hard Stop exists to
   prevent.

---

## 2 — The technical design, and why it isn't a fourth/fifth/sixth narrow surface repeating tonight's pattern

**The three target components need genuinely different data, not one common shape:**

| Module | Real component | Real data required |
|---|---|---|
| VIGIL | `ApprovalDetail` (the full request-plus-decision experience — `ApprovalDecisionPanel` alone is only the action buttons) | `ctx`, full `AgentApprovalRequest` |
| ARIA | `ClearCertificationQueue` | `ctx`, `ClearEvaluationInput[]` |
| SCRIBE | `TTManagerReview` | `ctx`, `TTReviewItem[]` |

Forcing these into one shared shell-contract type would mean either flattening three real,
different domains into an artificial common shape, or the shell-contract importing each module's
own types — which inverts the dependency direction every module already depends on (modules import
from the shell-contract, never the reverse).

**The resolving design:** the shell-contract carries an intentionally opaque payload
(`unknown`), keyed by `module_id` and `item_id`. **The Workspace module itself — not the
shell-contract — does the real type narrowing**, using type-only imports of each module's real
item type. **This is not a new pattern being invented for this spec — it's already proven,
multiple times, in this exact codebase:** `module-agentos/src/approval-port.ts` already does
`import type { AgentApprovalRequest } from "../../module-vigil/src/approval-contract"`, and the
same pattern appears independently in `useAgentDispatcher.ts`, `nexus-agentos-port.ts`, and
`NexusApp.tsx`. The Workspace module does the same thing, for the same reason AgentOS already
does it — to safely reference another module's real type without runtime coupling.

### Proposed shell-contract addition (GD-25)

```typescript
export interface WorkspaceReviewItem {
  readonly module_id: string; // "vigil" | "aria" | "scribe"
  readonly item_id: string;
  readonly payload: unknown; // narrowed by the consuming Workspace module, not the shell
  readonly published_at: string;
}

export interface ReviewerWorkspaceSurface {
  /** Publish (or replace, by module_id + item_id) one reviewable item. */
  publish: (item: WorkspaceReviewItem) => void;
  /** Remove an item once it's been decided (approved, certified, sent) — it should not
      linger in the Workspace after the source module has resolved it. */
  remove: (module_id: string, item_id: string) => void;
  /** Every item published by one module. */
  listForModule: (module_id: string) => readonly WorkspaceReviewItem[];
  /** Every item, across all three modules. */
  list: () => readonly WorkspaceReviewItem[];
  /** Subscribe to surface changes; returns an unsubscribe function. */
  subscribe: (listener: (items: readonly WorkspaceReviewItem[]) => void) => () => void;
}
```

Same `publish`/`list`/`subscribe` shape as every surface built tonight — the one real addition is
`remove()`, since (unlike a status snapshot or a queue count) an individual reviewable item needs
to actually leave the Workspace once it's been decided, not just get overwritten on next publish.

### Who publishes, who reads, and who narrows the type

- **VIGIL, ARIA, and SCRIBE each publish their own real items** — the actual `AgentApprovalRequest`,
  `ClearEvaluationInput`, and `TTReviewItem` objects already assembled internally to feed their own
  existing queues, published as-is via `publish()`. No reshaping, no summarizing.
- **The new Workspace module reads via `ctx.reviewerWorkspaceSurface.list()`**, type-narrows each
  item by `module_id` (a simple discriminated switch, using the type-only imports above), and
  renders the real component — `ApprovalDetail`, `ClearCertificationQueue`, or `TTManagerReview` —
  passing the narrowed payload straight through as props.
- **Each source module calls `remove()`** once its own decision commits (VIGIL's `onDecided`, the
  ARIA certify handler, SCRIBE's `onSent`) — same callback hooks that already exist, extended by
  one more call.

---

## 3 — Module structure and role gating

**New top-level module.** Module-level gate: the union of every role any of its three sections
needs — `PLATFORM_ADMIN`, `SYSTEM_ADMIN`, `COMPLIANCE_OFFICER`, `PROGRAM_MANAGER`, `ANALYST` —
mirroring exactly the pattern GD-22 established for ARIA. Inside the module, per-section gating
(reusing the same local `TAB_ROLES`/`canAccessTab` shape `AriaApp.tsx` already implements, not a
new mechanism):

| Section | Roles |
|---|---|
| VIGIL Approvals | `PLATFORM_ADMIN`, `SYSTEM_ADMIN` |
| ARIA Certifications | `COMPLIANCE_OFFICER` + admin |
| SCRIBE T&T Reviews | `PROGRAM_MANAGER`, `ANALYST` + admin |

A role without access to a given section sees it hidden or clearly disabled with an honest
tooltip — same standard as ARIA's `LockedTabNotice`, not a new convention.

---

## 4 — Done Condition (for the future build session, not this document)

1. `WorkspaceReviewItem` and `ReviewerWorkspaceSurface` added to both shell-contract copies,
   identical, SHA-256 re-verified.
2. `ShellReviewerWorkspaceSurface` implemented in `sovereign-shell/src/shell.ts`.
3. VIGIL, ARIA, and SCRIBE each publish their real items on load/change, and call `remove()` on
   their existing decision-commit paths.
4. The new Workspace module built: module-level gate, three per-section-gated panels, each
   rendering the real imported component with its type-narrowed payload.
5. A convergence test per module (three total) — publish from the source module, render and
   confirm removal from the Workspace side, in one shared context.

---

## 5 — Codebase facts (confirmed by direct read, July 20)

- `ApprovalDetail` (not `ApprovalDecisionPanel` alone) is the real integration point for VIGIL —
  needs the full `AgentApprovalRequest`, plus `obligationCase` when `action_type === "ppbe_obligation"`.
- Cross-module type-only import precedent: `module-agentos/src/approval-port.ts`,
  `useAgentDispatcher.ts`, `nexus-agentos-port.ts`, `NexusApp.tsx` — all real, all already in
  production.
- `loader.mount()` still takes no initial-state parameter (confirmed, `docs/22` §5) — irrelevant to
  this spec specifically, since v1 doesn't need it, but stays the real blocker for v1.1.

---

## 6 — What's explicitly out of scope for this build

- Any state-preserving "return to the source module with this item selected" capability — v1.1,
  per §1.
- Any change to `AgentApprovalRequest`, `ClearEvaluationInput`, or `TTReviewItem` themselves —
  this spec consumes them as-is.
- The `HUMAN_DECISION` "context depth" field (`docs/22` §6) — a real, separate, smaller proposal;
  not bundled here.

---

*docs/23 — Reviewer's Workspace, v1 · July 20, 2026*
*GD-25 proposed, pending Project Principal approval*
*Design authority: docs/22_Informed_Decision_Making.md*
*Pre-Decisional · Internal Working Document*
