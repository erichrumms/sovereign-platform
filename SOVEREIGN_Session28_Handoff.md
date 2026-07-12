# SOVEREIGN Platform — Session 28 Handoff
## Time & Travel Phase II / Full Cycle — D1/D2/D3/D4 complete

**Date:** July 12, 2026
**Session basis:** Session 28 opening prompt (GD-21 pre-authorized; TT-PRODUCT-GD decided Option 2)
**HEAD at open:** `914c93b` (Session 27 close commit — verified via `git log`, consistent with the opening prompt's "past `1c8f8fa`")
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. What This Session Did

- **D1 — GD-21 shell contract change** (`00cbf6c`): exactly three `HumanDecisionType`
  members added — `TRAVEL_APPROVAL`, `TIME_CORRECTION_SENT`, `ESCALATION_AUTHORIZED`
  (docs/17 §12, pre-authorized opening prompt §3). **Shell contract v1.15 → v1.16**,
  changelog entry written, both copies updated and SHA-256 re-verified identical.
  Constraint #11 propagation: `sovereign-data` shared-types (19 → 22) + test, Python
  `APPROVED_DECISION_TYPES` (19 → 22) + a new `TestGD21TimeTravelDecisionTaxonomy`
  class. Full suite verified passing before D2 opened.
- **D2 — Drafting agents live** (`bff1c8a`): `tt.travel-drafter` and `tt.time-drafter`
  wired into SCRIBE's drafting engine following the existing six-mode pattern —
  runtime prompt copies synced from the two APPROVED registered prompts (v1.0, July 11),
  a TT drafting contract (deterministic communication-type selection: 4 travel / 5 time,
  the time five reusing canonical `CorrectionCommunicationType` — Constraint #2), a pure
  three-tier engine (live → cache → static), the `useTTDraft` hook (one
  `createSovereignClient` call per draft — Constraint #5), and AgentCards for both
  drafters in module-scribe (host product SCRIBE, docs/17 §2). The **system-invisibility
  rule (docs/17 §6.4) is enforced structurally**: the validator rejects any draft that
  mentions the platform, an agent id, or an AI system, at parse time and at the export
  re-check.
- **D3 — VIGIL/NEXUS queue wiring + manager review interface** (`d137367`):
  - **TT-PRODUCT-GD Option 2 executed and confirmed:** TT alerts carry
    `sourceProduct: "VIGIL"` — the alert-raising code path is `tt.escalation-monitor`,
    hosted in module-vigil. Adapter mirrors the ARIA precedent exactly (existing
    `AlertType` members only — escalation/budget-exhaustion → THRESHOLD_BREACH (P2/P1),
    audit deadline → CASCADE_RISK; TT detail incl. the Python-taxonomy event name rides
    in `rawEvent`). Closes Session 27 Hard Stop §6.1.
  - Formal escalations enter the **VIGIL Agent Approval Queue** (Tier B, docs/17 §7) as
    standard `AgentApprovalRequest`s — no schema change. `tt-escalation-gate.ts` makes
    the gate structural: `isSendable()` is false until a human authorization is recorded;
    approval emits `ESCALATION_AUTHORIZED` (GD-21), rejection emits `HUMAN_DENIAL` and
    closes the case unsendable; a failed Logger emit blocks the decision (Gate 2).
  - `tt-travel-queue.ts` wires the Session 27 engines with `AGENT_STEP_START/COMPLETE`
    audit bracketing (correct agent_id/agent_class per the AIS) and makes
    `recordTravelDecision` (HUMAN_DECISION, `TRAVEL_APPROVAL`) **the only code path** by
    which a request becomes APPROVED/DENIED/ESCALATED — deciding an unrouted request throws.
  - `TTManagerReview.tsx` — the docs/17 §14 split-panel manager review interface: queue
    left, compliance analysis + pre-populated draft right; the send action is
    structurally disabled for formal escalations until the VIGIL gate reports
    AUTHORIZED; a manager-recorded send emits `TIME_CORRECTION_SENT` (GD-21).
- **D4 — End-to-end integration test** (`26501ab`): `e2e/tests/tt-full-cycle.test.tsx`,
  runnable Jest (real module functions, one shared log sink, jsdom for the review
  component). Output summary in §6.

## 2. Session-Open Gate Verification (all passed)

| Gate | Result |
|---|---|
| Context documents | All 30 confirmed PRESENT on disk by name; none missing |
| HEAD | `914c93b` — verified via `git log --oneline` |
| Shell contract at open | v1.15, both copies `939c2441…bfa5876` |
| Agent count | **44** via the authoritative table (36 master rows + 8 `tt.*`) — open and close |
| Approved prompts | 16 (both TT prompts STATUS: APPROVED confirmed on disk) |

## 3. Test Count — Delta Against Baseline (exact numbers)

| Workspace | Before | After | Δ |
|---|---|---|---|
| sovereign-data | 74 | **74** | 0 (assertions updated 19→22 in place) |
| module-scribe | 125 | **183** | +58 (TT drafting contract/engine +52, manager review +6) |
| module-vigil | 123 | **135** | +12 (alert routing +5, escalation gate +7) |
| module-nexus | 69 | **78** | +9 (travel queue wiring) |
| e2e | 6 | **9** | +3 (full-cycle scenarios) |
| All other JS/TS workspaces | — | unchanged | 0 |
| **JS/TS total** | 1208 | **1290** | +82 |
| Python (sovereign-security) | 162 | **165** | +3 (GD-21 taxonomy class) |
| **Platform total** | **1370** | **1455** | **+85** |

`tsc --noEmit` clean across all 14 workspaces. All suites green — counts collected
per-workspace from live runs at close.

## 4. Shell Contract & Registries

- **Shell contract v1.16** (GD-21) — SHA-256
  **`521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7`**, both copies
  verified identical after the change and again at close. Constraint #7 holds at ten
  exports; no other contract modification made.
- Agent registry unchanged at **44**. Approved prompts unchanged at **16** (activation
  only, no new prompt).
- Python `APPROVED_DECISION_TYPES` 19 → 22 (GD-21 parity); `APPROVED_EVENT_TYPES`
  unchanged at 95 (the 16-member delta over TS's 79 remains by design).

## 5. Spec-vs-Reality Reconciliations (docs/17 authoritative throughout)

1. **docs/17 §8 "two new drafting modes" vs. the SCRIBEMode shell-contract union.**
   `SCRIBEMode` is a shell-contract type (v1.1, GD-2) and GD-21 authorizes ONLY the
   three HumanDecisionType members — so the TT communication modes were implemented as
   **module-level taxonomies** in `tt-draft-contract.ts` (the Session 27
   `TimeCompliancePolicyConfig` pattern), not `SCRIBEMode` members. The five time types
   reuse canonical `CorrectionCommunicationType`; the four travel types (docs/17 §5.4,
   prose only, no canonical entity) are defined at module level. If a future governance
   pass wants TT modes in `SCRIBEMode`, that is a new GD.
2. **TRAVEL_APPROVAL vs. v1.0 TRAVEL_APPROVED/DENIED/ESCALATED.** GD-21's
   `TRAVEL_APPROVAL` sits alongside three v1.0 members that already encode travel
   decision *outcomes*. Implemented exactly as authorized (one act-member, outcome in
   payload/status) and the v1.0 members left untouched, but this is a **Constraint #2
   tension worth a governance look**: two overlapping taxonomies for travel decisions
   now coexist. Documented in the v1.16 changelog naming note. Candidate for a future
   consolidation GD — do NOT resolve unilaterally.
3. **AIS `SCRIBE_DRAFT_CREATED`/`SCRIBE_EXPORT_APPROVED` event names.** The Agent
   Identity Standard's TT drafter entries (and older SCRIBE entries) list these event
   types, but they exist in NO approved taxonomy (neither `SovereignEventType` nor
   Python's `APPROVED_EVENT_TYPES`) — and the existing `useDraft.ts` already deliberately
   uses `AGENT_STEP_START/COMPLETE` + `FALLBACK_ACTIVATED` instead ("no invented
   SCRIBE_* types"). The TT drafters follow the same posture. The AIS's event lists are
   aspirational, not taxonomy — candidate housekeeping item.
4. **TT_* Logger events are not emitted from TypeScript.** Verified per the opening
   prompt §2: docs/17 §12 makes the eleven `TT_*` types Python-Logger-only. The TS-side
   wiring uses approved TS taxonomy exclusively (AGENT_STEP_*, HUMAN_DECISION,
   APPROVAL_REQUEST_RECEIVED, AGENT_ACTION_*); the TT_* names appear TS-side only inside
   opaque `rawEvent` payloads (the ARIA adapter precedent). **No TS event-type addition
   was needed for Phase II** — the D1 HumanDecisionType members were the only
   shell-contract requirement, exactly as docs/17 §13 predicted.
5. **Manager review interface placement.** docs/17 assigns the queue to NEXUS (§5.1)
   and drafting to SCRIBE (§8); modules cannot import each other. The split-panel
   review interface (§14) lives in module-scribe (where the drafts and the send-record
   action are), travel decisions delegate via callback to NEXUS's
   `recordTravelDecision` (where TRAVEL_APPROVAL is emitted, product NEXUS). Composition
   happens at the host/e2e level — no cross-module import introduced.
6. **selectTravelCommunicationType is deliberately partial.** A STANDARD-routed,
   undecided request has no documented communication template (docs/17 §5.4's four
   templates all presuppose a decision or a flag), so the selector throws rather than
   guessing. The e2e clean path drafts the APPROVAL_NOTICE after the human decision,
   matching the template's own description ("the request has been routed as approved").

## 6. D4 End-to-End Test — Output Summary

`e2e/tests/tt-full-cycle.test.tsx` — 3 scenarios, all passing (runtime ~0.4s), all
data synthetic (SYNTH- prefixed ids; every simulated decision logged with a
"SIMULATED TEST DECISION" note and a "(SIMULATED TEST ACTOR)" actor_name):

```
PASS tests/tt-full-cycle.test.tsx
  Scenario 1 — travel request, clean approval path
    ✓ engine → router → simulated TRAVEL_APPROVAL → drafter produces APPROVAL_NOTICE
  Scenario 2 — recurring time violation, escalation authorized at the VIGIL gate
    ✓ engine → escalation-monitor → FORMAL_ESCALATION draft → VIGIL queue → gate HALTS
      → simulated authorization → send recordable
  Scenario 3 — escalation rejected at the VIGIL gate: the draft is never sendable
    ✓ a rejected authorization keeps the flow halted — no send is ever recordable
```

The two required explicit assertions, both proven:
- **The draft is NEVER auto-sent.** Scenario 2 asserts, before the simulated decision:
  `isSendable(case) === false`, the review interface's send button `disabled`, and zero
  `TIME_CORRECTION_SENT` events in the sink. Scenario 3 proves the halt is permanent on
  rejection (gate closed, re-decision refused, still zero send events). The pipeline
  has no send transport at all — "send" only ever *records* a human's send.
- **Every Logger event governed.** A sweep over every scenario's full sink asserts
  `workflow_step_id` non-empty on every event, `agent_id` (tt.*) + valid `agent_class`
  on every AGENT_STEP_* event, and `decision_type` + human actor on every HUMAN_DECISION
  (Constraints #4/#6).

Scenario 1 additionally proves the whole travel lifecycle shares one workflow_step_id
(`tt-travel-SYNTH-TR-1`) across engine → router → human decision.

## 7. Hard Stops / Governance Items Surfaced (not acted on)

1. **Travel-decision taxonomy overlap** (§5.2) — candidate consolidation GD.
2. **AIS event-name drift** (§5.3) — the AIS lists Logger event types that were never
   added to any taxonomy; housekeeping pass recommended.
3. **Carried from Session 27, still open:** no `Governance_Decision_Record_*.md` files
   exist in-repo (D-TT7, D-P7, and now GD-21/TT-PRODUCT-GD live only in opening prompts
   and artifacts); docs/16 Supervision Efficiency confirmed absent (Project Principal:
   add retroactively or waive); F-2 (native NEXUS/FLOWPATH agents implemented-but-not-
   carded) unaffected and open; PROMPT-REGISTRY-DRIFT (FLOWPATH prompt spec/reality
   mismatch) untouched this session.

## 8. Things the Incoming Agent Should NOT Do

- Do not add TT modes to `SCRIBEMode`, consolidate the travel decision types, or make
  ANY shell-contract change without a new GD — v1.16 is current and complete.
- Do not emit `TT_*` event types from TypeScript — Python-only by design (docs/17 §12).
- Do not treat the AIS's `SCRIBE_DRAFT_CREATED`-style names as emittable taxonomy (§5.3).
- Do not add a send transport to the TT pipeline — the manager sends from their own
  identity; the system only records it (docs/17 §1, proven in D4).
- Do not re-register agents or prompts — 44 / 16, both verified at close.
- Do not take the naive AIS grep count (46) — count the authoritative table (44).

## 9. Recommended Next Session (29)

Per Integration Brief §20/§21, the Time & Travel critical path is now **build-complete
through Phase II** — the first end-to-end demonstrable workflow layer (the CTO-demo
milestone, Brief §21 item 3). Recommended next: **Walkthrough E** (human-guided, Claude
Chat) over the TT full cycle, and/or **PPBE Phase I** (Session 29) — still gated on
`docs/18_PPBE_Workflow_Architecture.md` (not started) and D-P7 (open). Gate 3/4
attestation remains a parallel Project Principal action.

---

*Session 28 Handoff · July 12, 2026 · Commits: `00cbf6c` (D1), `bff1c8a` (D2), `d137367` (D3), `26501ab` (D4), close commit (this file + SBOM)*
*Pre-Decisional · Internal Working Document*
