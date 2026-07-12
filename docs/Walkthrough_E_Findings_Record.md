# SOVEREIGN Platform — Walkthrough E Findings Record
## Time & Travel — Human-Guided Validation

**Date:** July 12, 2026
**Session basis:** Post-Session 28 (Time & Travel build-complete through Phase II)
**Conducted by:** Project Principal (browser) + Claude Chat (guided), per the Level 1
Walkthrough Protocol
**Classification:** Pre-Decisional · Internal Working Document
**Status:** Walkthrough E PARTIALLY COMPLETE — see §3

---

## 1. Summary

Walkthrough E set out to validate Time & Travel's two demonstrable paths (travel
clean-approval, time/expense escalation) live in the browser. Part 1 investigation
— checking NEXUS, SCRIBE, and VIGIL in sequence — surfaced a root blocker before
either path could actually be exercised: **there is no way to create a Time &
Travel request through the live UI.** Everything found after that point is a
downstream consequence of the same gap, not an independent discovery. Part 2 was
not attempted, deliberately — it would almost certainly hit the identical wall.

---

## 2. Findings

### WE-1 — No traveler-facing intake form exists
**Priority: Critical — blocks all downstream verification**

Confirmed by direct navigation: NEXUS's request-type dropdown (`DOCUMENT_REVIEW`
and others) does not include a travel or time-record option. No other product
checked (SCRIBE, VIGIL) offers an alternative entry point. This is the root cause
behind WE-3 being untestable and behind Part 2 being deferred.

**Recommended fix:** Extend NEXUS's intake — not SCRIBE, which drafts from
structured data rather than originating it (see the exchange that settled this
during the walkthrough). Confirm whether the request-type field is shell-governed
or module-local before assuming this is a quick addition.

**Target:** Session 29

---

### WE-2 — Gap 3 (contrast) recurrence — third confirmed occurrence
**Priority: High**

Low-contrast text against dark backgrounds observed in both NEXUS (breadcrumbs,
tab labels, routing table headers) and SCRIBE (page subtitle). Verified via prior
conversation history, not just recollection: this is the same Gap 3 first found
in Walkthrough A, partially fixed in Session 17 ("addressed the most severe
sub-AA colors" but not all), and already recurred once before in APEX (Walkthrough
B, Session 19 follow-up). Two prior fix passes have not made this durable.

**Recommended approach:** Given the pattern, a third targeted spot-fix is unlikely
to hold. Recommend a systematic contrast audit across all products' text/background
color pairs, verified against actual WCAG contrast ratios rather than visual
spot-checks — paired with WE-4 below, and re-verified by walkthrough afterward,
not just by completion claim.

**Target:** Session 29

---

### WE-3 — TT approval routing destination unconfirmed
**Priority: Open question, not yet a defect**

VIGIL's Agent Approval Queue currently contains only generic AgentOS items
(`model_deployment`, `data_export`, `configuration_change`) — no TT items, which
is the expected consequence of WE-1 and WE-5, not a separate bug. Unresolved:
whether a TT approval, once one exists, opens SCRIBE's `TTManagerReview.tsx` or a
generic VIGIL review interface. The VIGIL queue's own copy ("select a request to
review its brief and record a decision") suggests VIGIL may have its own generic
reviewer, distinct from SCRIBE's split-panel interface — genuinely unknown until
testable.

**Target:** Verify once WE-1 and WE-5 are resolved — likely needs its own short
follow-up walkthrough pass rather than being assumed fixed alongside them.

---

### WE-4 — No verified architecture/navigation reference exists
**Priority: Process finding**

Locating Time & Travel's actual surfaces required sequential guessing across
NEXUS, SCRIBE, and VIGIL. A navigation reference would materially speed future
walkthroughs (this one included).

**Requirement, not just a request:** per Rule 5 (a claim of "in progress" or
"built" is not evidence it exists), any reference Claude Code produces must be
verified against the live platform by a subsequent walkthrough before being
trusted for planning purposes — a written description of the build is data to be
checked, not confirmation in itself.

**Target:** Session 29

---

### WE-5 — No Time & Travel synthetic data exists
**Priority: Blocking, complements WE-1**

Unlike every other product checked this session — APEX's `P-100` program, VIGIL's
seeded `THRESHOLD_BREACH`/`CASCADE_RISK` alerts and `agentos-*` approval items —
Time & Travel has zero seed data. This blocks testing the *approver's* side of the
workflow independently of WE-1 (the *traveler's* side).

**Requirement:** seed a range of `TravelRequest`/`TimeRecord` records spanning
every reachable state — clean approval, information request, escalation, and
denial for travel; error correction, clarification, justification, pattern flag,
and formal escalation for time — so every communication type and both the
approval and escalation paths can be exercised without first solving WE-1.

**Target:** Session 29

---

### WE-6 — PPBE synthetic data requirement (forward-looking, not yet actionable)
**Priority: Standing requirement, tracked now so it isn't discovered late**

PPBE has not been built — Sessions 30 and 31 are still pending, so there is
currently no PPBE feature surface to seed data into. This finding is not a defect
to fix now; it is a **precondition on Walkthrough F**, recorded here so it doesn't
get treated as a surprise gap the way Time & Travel's missing data was.

**Requirement:** when PPBE Build Session 2 (Full Cycle) closes, synthetic data
must exist in **sufficient variety and quantity to test, evaluate, and assess
every aspect of PPBE** — not a narrow happy path. Concretely, that means coverage
across all six PPBE phases (Strategic Direction, Planning & Evidence, Programming,
Budget Formulation, Budget Execution, Performance & Evaluation), spanning the
`StrategicObjective` → `ProgramRecord` → `ObligationRecord` → `EvaluationFinding`
traceability chain end-to-end, and including at least one instance of each
`PPBE_ANOMALY` type and each of COUNSEL's four PPBE decision types, so Walkthrough
F can actually exercise the full cycle rather than a single clean path.

**Target:** Session 31, or a dedicated data-seeding pass immediately following it
— must be satisfied before Walkthrough F opens.

---

## 3. What Walkthrough E Did and Did Not Test

**Tested:** NEXUS's generic intake (confirmed no TT option present), SCRIBE's
drafting-mode grid (confirmed no TT mode present, confirmed architecturally
correct that TT modes are module-level, not `SCRIBEMode` members), VIGIL's Alert
Queue (confirmed ARIA-only, no TT items — expected) and Agent Approval Queue
(confirmed AgentOS-only, no TT items — expected given WE-1/WE-5).

**Not tested:** Part 2 (time/expense escalation path) — deferred deliberately,
not attempted, since WE-1's blocker would produce an identical result rather than
new information. The actual manager review interface (`TTManagerReview.tsx`) was
never reached or visually verified. The VIGIL/SCRIBE routing question (WE-3)
remains genuinely open.

**Status: PARTIALLY COMPLETE.** A second short pass — call it Walkthrough E-2 —
is needed after Session 29 to actually exercise Parts 1 and 2 with real data and
a working intake form, before Time & Travel can be considered walkthrough-clean.

---

## 4. Recommended Session 29 Scope

1. TT intake form in NEXUS (WE-1)
2. Systematic Gap 3 contrast audit, platform-wide (WE-2)
3. Time & Travel synthetic data seeding, full state coverage (WE-5)
4. Claude-Code-authored architecture/navigation reference, walkthrough-verified
   before being trusted (WE-4)
5. WE-3 (routing destination) verified once 1 and 3 above are done — likely as a
   short Walkthrough E-2 pass rather than assumed resolved by code review alone

**Unaffected by this walkthrough, not reopened:** `TT-GD`, `TT-PRODUCT-GD`,
`TT-POLICY-ENTITY` — all already resolved or tracked separately.

---

## 5. Walkthrough F Precondition (New)

PPBE synthetic data (WE-6) — sufficient variety and quantity across all six PPBE
phases — must be seeded and confirmed before Walkthrough F opens. This is now a
formal precondition in the master sequence, not an assumption to discover late.

---

*Walkthrough E Findings Record · July 12, 2026*
*Pre-Decisional · Internal Working Document*
*File to: git `docs/` — durable walkthrough record, alongside Walkthrough A–D reports*
