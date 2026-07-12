# SOVEREIGN Platform — Walkthrough E-2 Findings Record
## Time & Travel — Verification Pass

**Date:** July 12, 2026
**Session basis:** Post-Session 29 (Time & Travel gap fixes)
**Conducted by:** Project Principal (browser) + Claude Chat (guided)
**Classification:** Pre-Decisional · Internal Working Document
**Status:** Walkthrough E-2 COMPLETE for what it set out to check — one critical new
finding (WE-10) means Time & Travel is **not yet walkthrough-clean**

---

## 1. Original Walkthrough E Findings — Status Update

| ID | Finding | Status |
|---|---|---|
| WE-1 | No traveler-facing intake form | **CONFIRMED FIXED.** NEXUS offers `TRAVEL_REQUEST`/`TIME_RECORD`, adaptive forms, real submissions. |
| WE-2 | Gap 3 contrast recurrence (3rd time) | **CONFIRMED FIXED.** Text reads clearly across NEXUS, SCRIBE, VIGIL — first time all session. Root-cause fix is holding. |
| WE-3 | TT approval routing destination unknown | **ANSWERED.** Travel decisions do NOT route through SCRIBE, by design (NEXUS-only). Time/expense DOES route through SCRIBE's "Time & Travel Review" tab — confirmed working end-to-end. |
| WE-4 | No verified architecture/navigation reference | **PARTIALLY EXERCISED, NOT FORMALLY CHECKED.** `docs/19`'s specific claims were never checked line-by-line against what we found. Still marked UNVERIFIED — needs a dedicated pass. |
| WE-5 | No Time & Travel synthetic data | **CONFIRMED FIXED.** 8 travel requests, 6 time records + flags, spanning real states with real compliance findings attached. |
| WE-6 | PPBE synthetic data (forward-looking) | Unaffected — still applies to Walkthrough F, not this pass. |

---

## 2. New Findings

### WE-7 — No landing/status page on platform load
**Priority: Medium — first-impression risk for a demo, not a functional defect**

Loading the platform shows the sidebar and header only — a large blank canvas,
no orientation. Discussed in detail earlier this session; direction agreed: a
status rollup (CPMI-VRS state elevated from the header badge), an active-agent
summary, and a cross-product "things to do" aggregation — pulling the same kind
of numbers VIGIL already shows ("pending approvals," "unacknowledged alerts")
into one place, from every product, not just VIGIL. Frame as "current state,"
not "live activity" — the platform runs on synthetic data with the Governance
Clock off, so there's no continuous process to depict honestly as "live."

**Target:** Next Time & Travel-adjacent session, or its own small session.

---

### WE-8 — Time/expense drafting pipeline confirmed working end-to-end
**Priority: Positive finding, no action needed**

SCRIBE's "Time & Travel Review" tab (not found during Walkthrough E-1) shows
real compliance analysis and a real pre-populated draft for `SYNTH-TM-201`,
citing the specific policy violation by name and account number — matching the
drafting prompt's "never invented" requirement. The **"I have sent this
communication"** button confirms the system-never-sends design is real and
working live, not just proven in Session 28's automated test.

---

### WE-9 — VIGIL escalation routing confirmed working
**Priority: Positive finding, no action needed**

Pending approvals count increased 3 → 4 with a new
`send_formal_escalation_notice · tt.escalation-monitor` item appearing after an
escalate action. The TT → VIGIL handoff fires correctly.

---

### WE-10 — Travel approval drafting pipeline: status unknown, headline finding
**Priority: Critical — blocks calling Time & Travel walkthrough-clean**

`SYNTH-TR-102` was approved successfully — status changed `ROUTED` → `APPROVED`,
confirming the decision itself recorded correctly. **No draft is visible
anywhere reachable from the UI** — not inline in NEXUS (the card doesn't
expand), not in SCRIBE (travel is deliberately not routed there, per WE-3).

**Two genuinely different explanations, not yet distinguished:**
1. A draft was created, but no UI surface shows it — same class of gap as the
   original missing intake form, one step further downstream.
2. The NEXUS travel-approval action updates status but never actually invokes
   the drafting pipeline — meaning the "system drafts" promise isn't being
   exercised for travel specifically, even though the drafting agent itself
   works correctly in isolation (Session 28's test) and for time/expense live
   (WE-8, this session).

**Browser-level troubleshooting (Network/Console tab) was proposed but not
completed** this session due to time. **Recommendation: resolve this by reading
the actual code** (`tt-travel-queue.ts`'s approval handler) rather than further
live-clicking — a definitive answer is faster and more reliable that way.

**Related open question, same root cause either way:** does the decision-note
text a manager types actually feed into the drafted communication, or is it a
separate audit-only field? Worth answering in the same investigation.

---

### WE-11 — Decision note field has no mandatory-field indicator
**Priority: Medium**

The "min 10 chars" requirement has no visual cue (asterisk, border, inline
error) — submitting a decision with an empty note silently fails with no
feedback. A user has no way to know why nothing happened.

---

### WE-12 — Decision note UX: uniform requirement, freeform risk
**Priority: Medium**

The same 10-character minimum applies to Approve, Deny, and Escalate alike,
regardless of whether reasoning is actually needed — a clean no-findings
approval arguably needs none, a denial genuinely needs the policy basis.
Freeform typing also risks meaningless input ("Approve" typed into the box,
then Approve clicked). **Recommended direction, not just a validation fix:**
pre-populate the note from the compliance finding already computed on the item
(visible on-screen for flagged items already), editable rather than blank —
this also gives a real answer to whether that text is supposed to feed the
draft (WE-10's related question).

---

## 3. Time & Travel Walkthrough Status

**Not yet walkthrough-clean.** WE-1, WE-2, WE-5 are confirmed fixed. WE-8 and
WE-9 are unplanned positive confirmations. But WE-10 touches the platform's
core claim — "the system drafts, the human decides" — for the travel path
specifically, and it's currently unverified whether that claim holds live. This
is not a demo-readiness formality; it's the headline capability.

---

## 4. Recommended Next Session Scope

1. **Resolve WE-10** — trace `tt-travel-queue.ts`'s approval handler, determine
   root cause, fix it. This is the priority item.
2. **Fix WE-11** — visible mandatory-field indicator on the decision note.
3. **Fix WE-12** — pre-populate decision notes from the computed compliance
   finding; confirm (or wire) whether that text feeds the draft.
4. **Build WE-7** — landing/status page, per the direction discussed.
5. **Complete WE-4** — verify `docs/19`'s specific claims against the actual
   code, correct or confirm it, remove its UNVERIFIED header once genuinely
   checked.

---

*Walkthrough E-2 Findings Record · July 12, 2026*
*Pre-Decisional · Internal Working Document*
*File to: git `docs/` — durable walkthrough record, alongside Walkthrough A–E reports*
