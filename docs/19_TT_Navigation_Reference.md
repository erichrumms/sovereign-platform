# SOVEREIGN Platform — Time & Travel Navigation Reference
## docs/19_TT_Navigation_Reference.md

**Version:** 1.1
**Date:** July 12, 2026 (Session 30, D5 — Walkthrough E-2 code verification)
**Classification:** Pre-Decisional · Internal Working Document

> **STATUS: VERIFIED against current code (Session 30 D5)**
> All click paths traced against the actual source tree as built through Session
> 30. Corrections applied where code diverged from Session 29's draft.
> Changes in this version: §2 Step 5 travel queue ROUTED count corrected (4,
> not 3); §2 Step 6 updated for Session 30 D1/D2/D3 (decision note pre-populated,
> required indicator visible, communication draft produced after decision);
> §5 seed inventory ROUTED count corrected.

---

## 1. Where Time & Travel Lives (No Module of Its Own)

Time & Travel is a workflow layer with **no module directory, no shell route,
and no nav entry of its own** (docs/17 §2). Its surfaces are hosted inside
three product modules, reached through the shell's left-hand module nav:

| Surface | Host module | Shell nav entry → path | Role gate |
|---|---|---|---|
| Traveler/employee intake | NEXUS | `NEXUS` → `/nexus` | AGENT_OPERATOR or SYSTEM_ADMIN |
| Travel authority queue + decisions | NEXUS | `NEXUS` → `/nexus` | AGENT_OPERATOR or SYSTEM_ADMIN |
| Time & expense manager review (drafted communications) | SCRIBE | `SCRIBE` → `/scribe` | any (READ_ONLY minimum) |
| TT alerts (escalation / budget / audit deadline) | VIGIL | `VIGIL` → `/vigil` | PLATFORM_ADMIN or SYSTEM_ADMIN |
| Formal-escalation authorization (Tier B gate) | VIGIL | `VIGIL` → `/vigil` | PLATFORM_ADMIN or SYSTEM_ADMIN |

Source of truth traced: `module-nexus/src/index.ts` (mount gate), `NexusApp.tsx`
(tabs), `module-scribe/src/ScribeApp.tsx` (surface toggle),
`module-vigil/src/VigilApp.tsx` (queues + seeds).

---

## 2. Travel Flow — Click Path (traveler → decision)

1. **Shell nav → NEXUS.** NexusApp opens on the **Request Intake** tab.
2. **Request type dropdown → `TRAVEL_REQUEST`** (Session 29, WE-1). The form
   body swaps to the travel fields (destination, international checkbox,
   dates, mission purpose, itemized costs, personal day, special authority
   category, justification) — `TTIntakeForms.tsx`.
3. **Real-time policy preview** appears under the form as soon as the form is
   valid: routing tier, required authority, hard exceptions, soft flags
   (docs/17 §5.1). Pure evaluation — nothing is logged until submission.
4. **Submit Travel Request.** The request runs the real Session 27/28
   pipeline: `tt.travel-compliance-engine` → `tt.travel-router`, with
   AGENT_STEP audit bracketing under one `tt-travel-<id>` workflow step
   (`useTTIntake.ts` → `tt-travel-queue.ts`).
5. **Tab → Travel & Time Queue.** The routed request appears in the authority
   queue with its full compliance finding (rule cited, actual value,
   threshold). Eight seeded SYNTH-TR-1xx requests are already there spanning
   every state (`TTQueuePanel.tsx`).
6. **Decision.** On a ROUTED request:
   - The **decision note** is **pre-populated** from the compliance finding
     already on-screen — editable, always ≥10 chars for any seeded state
     (Session 30, WE-12). A visible `(required, ≥10 chars)` label and inline
     error on blur replace the prior silent gate (Session 30, WE-11).
   - Click **Approve / Deny / Escalate** — `recordTravelDecision` emits
     `HUMAN_DECISION · TRAVEL_APPROVAL` (GD-21).
   - After the decision, **tt.travel-drafter** is invoked async and a
     communication draft (APPROVAL_NOTICE, DENIAL_NOTICE, ESCALATION_NOTICE, or
     INFORMATION_REQUEST) appears inline beneath the decided request. Draft
     lifecycle shown: "Generating draft…" → draft body + subject + tier tag, or
     error message (Session 30, WE-10). The note is **audit-only** — it does NOT
     feed into the draft; the draft is sourced from governed TravelRequest +
     ComplianceFlag data only.
   - This NEXUS queue is **the** travel decision surface: `TRAVEL_APPROVAL` is
     emitted with product NEXUS and there is no other code path to
     APPROVED/DENIED/ESCALATED.

## 3. Time & Expense Flow — Click Path (employee → manager → gate)

1. **Shell nav → NEXUS → Request Intake → `TIME_RECORD`.** Period dates plus
   dynamic entry rows (date, cost code, hours, DIRECT/INDIRECT, holiday,
   justification). Submit runs `tt.time-compliance-engine` (hosted in
   module-apex, injected at the NEXUS composition root — the Item 57
   pattern) and raised flags appear on the **Travel & Time Queue** tab.
2. **Shell nav → SCRIBE → “Time & Travel Review” toggle** (Session 29 —
   previously unreachable, WE-3/WE-5). `TTManagerReview.tsx`: queue left,
   compliance analysis + pre-populated draft right. Six seeded items cover
   all five communication types.
3. **Sendable items** (error correction, clarification, justification,
   pattern flag): the manager reviews/copies the draft, sends it **from their
   own identity outside the tool**, then records the send — emits
   `HUMAN_DECISION · TIME_CORRECTION_SENT` (GD-21). The tool has no send
   transport (docs/17 §1).
4. **Formal escalations** are structurally gated: the seeded SYNTH-TM-205
   item shows “Awaiting VIGIL authorization” with the send button disabled;
   the seeded SYNTH-TM-206 item shows the already-authorized state where the
   send is recordable.
5. **Shell nav → VIGIL → Agent Approval Queue tab.** The TT escalation
   (`tt-escalation-SYNTH-TM-205-F1`, from `tt.escalation-monitor`, P2)
   awaits the operator's Approve/Reject with a ≥10-char note; approval emits
   `ESCALATION_AUTHORIZED` (GD-21), rejection `HUMAN_DENIAL`
   (`tt-escalation-gate.ts` semantics).
6. **VIGIL → Alert Queue tab.** Three seeded TT alerts, identifiable by
   `tt.escalation-monitor` as the raising agent and `TT_*` event names inside
   the raw event detail: escalation routed (P2), budget exhaustion (P1),
   audit deadline (P2). `sourceProduct` reads **VIGIL** by governance
   decision (TT-PRODUCT-GD Option 2) — do not expect a "TIME_TRAVEL" source.

---

## 4. Answers-So-Far to WE-3 (routing destination) — CODE-LEVEL, NOT YET WALKED

- A TT **approval** (formal escalation authorization) lives in **VIGIL's
  generic Agent Approval Queue / ApprovalDetail interface** — the same
  reviewer the AgentOS items use. It does **not** open SCRIBE's
  `TTManagerReview`.
- `TTManagerReview` (SCRIBE) is the **communication review** surface — where
  drafts are reviewed and sends recorded — not the approval reviewer.
- Travel **decisions** are recorded in **NEXUS's Travel & Time Queue**, not in
  VIGIL and not in SCRIBE.
- The VIGIL gate state shown in SCRIBE's seeded items is **static seed
  state**: a live authorization recorded in VIGIL does not yet flip the
  SCRIBE item to sendable in the same running session (no cross-module state
  channel exists for it). Walkthrough E-2 should confirm this limitation and
  decide whether it warrants a follow-up item.

## 5. Seeded Data Inventory (what E-2 should expect to see)

- **NEXUS Travel & Time Queue:** 8 travel requests (SYNTH-TR-101…108 — 4
  ROUTED pending [TR-102/103/104/107], 2 APPROVED [TR-101/108], 1 DENIED
  [TR-106], 1 ESCALATED [TR-105]; tiers/authorities all covered) · 6 time
  records (SYNTH-TM-201…206) with their compliance flags.
- **SCRIBE Time & Travel Review:** 6 items — one per communication type plus
  both escalation gate states.
- **VIGIL:** 3 TT alerts + 1 TT approval item (alongside the pre-existing
  ARIA alerts and 3 AgentOS approval items).
- All ids SYNTH- prefixed; none of the seeds emitted Logger events at mount.

---

*docs/19_TT_Navigation_Reference.md · v1.1 · Session 30 · July 12, 2026*
*VERIFIED against current code (Session 30 D5) · Pre-Decisional · Internal Working Document*
