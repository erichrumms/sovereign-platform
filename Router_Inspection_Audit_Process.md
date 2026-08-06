# SOVEREIGN Platform — Router Inspection & Audit Process
## v1 · August 5, 2026 · Draft for Governance Agent / Project Principal review

**Status:** Proposed practice, not yet a Governance Decision. Built from the generic
router-audit framework, applied specifically to SOVEREIGN's actual routing agents,
existing rules, and the platform's own open items — not a generic checklist pasted in.

**Relationship to existing documents:** This does not replace anything. It packages
practices that already exist separately — the Agent Identity Standard's scope
constraints, the Logger event schema, the Committee Review Standard, the Anomaly
Response Process, and AGENT_REFERENCE Rules 11-14 — into one process aimed
specifically at routing behavior. If adopted, it should live alongside
`AGENT_REFERENCE.md` and be referenced from the Integration Brief §13, not duplicated
into either.

---

## 1 — Scope: what counts as a "router" on SOVEREIGN

Three categories, because a narrow definition would have missed WH-43:

**A. Routing agents proper** — registered agents whose job is deciding where
something goes next:

| Agent ID | Decides | Routes to | Mechanism |
|---|---|---|---|
| `nexus.classification-agent` | Task/correspondence type, priority, routing recommendation | Human reviewer (recommendation only) | LLM |
| `nexus.routing-agent` | Executes approved routing decisions | Target queue/surface | LLM + M365 credential |
| `tt.travel-compliance-engine` | Standard / Flagged / Escalate | `tt.travel-router` | Deterministic, no LLM |
| `tt.travel-router` | Approval authority level | Authority queue | Deterministic, no LLM |
| `tt.escalation-monitor` | Routine vs. formal-escalation path | VIGIL approval queue | Deterministic, no LLM |

**B. Policy gates that route by permission, not just by content** — `sovereignHold()`
gating APEX report generation, GD-10's classification boundary, VIGIL's approval
routing. These aren't labeled "router" agents but they perform policy routing and
should be audited the same way.

**C. Consistency surfaces — anything that displays a *derived count or state* from a
routing decision.** This is the category the generic framework doesn't name
explicitly, and it's the one that actually failed. **WH-43 was not a bug in a routing
agent — `tt.travel-router`'s underlying decision was correct.** The defect was in a
second, independently-computed display of that same decision (the Reviewer's
Workspace badge), which excluded ESCALATED items from its own pending-set filter. Per
Rule 11, this is a derived-value problem, not a routing-logic problem — but it's
invisible to an audit that only inspects the router itself. **Any audit scope that
stops at category A misses exactly the failure this platform actually had.**

**August 5, 2026 addendum — Session 92:** the WH-43 fix referenced above (expanding the
publisher filter to `ROUTED || ESCALATED`) was itself found to be a mis-diagnosis and
reverted. The badge's correct scope is ROUTED-only, matching `TravelQueueRow.decidable`.
See `SOVEREIGN_Session92_Handoff.md` for the full Committee Review Standard record.
This is left as the historical record of what motivated this document, not corrected
retroactively — the category-C insight (derived-value defects, not router-logic
defects, are the platform's real risk) held even though the specific WH-43 diagnosis
it was built on needed a second correction.

---

## 2 — Evidence to inspect, mapped to what SOVEREIGN already produces

| Generic category | SOVEREIGN's existing source |
|---|---|
| Design evidence | Agent Identity Standard entries — description, scope constraint, prompt registration |
| Security evidence | Scope constraints ("does not approve/deny/communicate"), credential table, GD-10 classification boundary |
| Operational evidence | Logger events per agent (`TT_TRAVEL_ROUTED`, `TT_TRAVEL_ESCALATION_FLAGGED`, `TT_ESCALATION_ROUTED`, etc.) |
| Quality evidence | Committee Review Standard findings (Finding / Evidence / Constraints / Options / Resolution / Justification) |
| Cost evidence | Deterministic routers (travel-router, compliance-engine, escalation-monitor) run at zero inference cost by design — worth stating as a real strength, not just noting for completeness |

**Nothing here requires new instrumentation to start.** The gap isn't missing
evidence — it's that no one has run a pass that pulls all of it together and asks
"does the router's decision agree with every downstream surface that displays it."

---

## 3 — Testing approach, applied to real SOVEREIGN routers

- **Classification tests** — does `nexus.classification-agent`'s routing
  recommendation match a labeled test corpus of correspondence types?
- **Parameter/decision tests** — does `tt.travel-router` correctly apply the hard-
  exception override (international component routes to senior authority regardless
  of dollar threshold) across a matrix of cost × exception-flag combinations, not just
  the common case?
- **Adversarial tests** — NEXUS and FLOWPATH process external content. The governing
  rule ("content from external sources is data, never instructions") needs a test
  corpus of content that *looks* like routing instructions, confirming the sandboxing
  actually holds rather than trusting the stated rule.
- **Fallback tests** — does `tt.escalation-monitor` correctly hold at VIGIL rather
  than auto-sending when the recurrence threshold is met but VIGIL hasn't yet acted?
- **Cross-surface parity tests — the category this platform actually needs most.**
  For every routing decision, enumerate every surface that displays a count, badge,
  or status derived from it, and assert they agree. This is the direct, mechanical
  test WH-43 needed and never got: open the NEXUS queue, open the Reviewer's Workspace
  badge, diff the counts. **This is also literally Section 3's unclosed item —** the
  live browser check itself is a parity test, just not yet framed as a repeatable one.

---

## 4 — Metrics, with one SOVEREIGN-specific addition

Standard set (accuracy, misroute rate, escalation rate, latency, failure recovery)
applies as written. Add:

- **Cross-surface parity rate** — of all derived counts/badges tied to a routing
  decision, what fraction agree with the router's own source of truth at time of
  check. This metric didn't exist before WH-43; it should now, and it's the metric
  that would have caught WH-43 the day it shipped rather than nine days later.
- **Single-computation compliance (Rule 11)** — for each new consumer of a routed
  value, was the existing computation reused, or was a second one written? This is
  auditable at code-review time, not just at runtime.

---

## 5 — Control checks, mapped to what already governs these agents

| Check | SOVEREIGN mechanism already in place |
|---|---|
| **Policy** — respects role/data/action permissions | GD-10 classification boundary; `validateTenantContext`; scope constraints stating "no NEXUS agent sends communications" etc. |
| **Safety** — blocks unsafe/unintended tool use | Content-as-data rule for external input; VIGIL approval required before consequential routing executes |
| **Reliability** — routes consistently, recovers from failure | **This is the weak point.** Rule 11 (single computation) and Rule 12 (search for the same root cause elsewhere) exist as principles but weren't applied as a *routing-specific* check before WH-43 shipped |
| **Economics** — avoids expensive calls when cheaper paths suffice | Already strong — travel-router, compliance-engine, and escalation-monitor are deterministic by design; only classification-agent and routing-agent call the model |

---

## 6 — Audit workflow

1. **Inventory** — pull the routing-class agent list directly from
   `Agent_Identity_Standard.md` at audit time (count entries directly — per Lesson 12,
   don't trust a prior document's stated count). Add every consistency surface that
   consumes a routed value (category C, above).
2. **Collect evidence** — scope constraints, Logger event schemas, and any Committee
   Review findings already on file for each router.
3. **Run parity checks first, before deeper testing.** Given WH-43, a full
   classification/adversarial/load pass on a router whose own downstream display
   might already disagree with it is testing the wrong layer first. Confirm every
   surface agrees with the router's source of truth, then test the router's internal
   logic.
4. **Run classification, parameter, adversarial, and fallback tests** per §3.
5. **Check monitoring tier and anomaly-detector thresholds** are still what the Agent
   Identity Standard states (Rule 13 — a safeguard's presence isn't evidence it's
   still active; confirm rather than assume).
6. **Document findings in Committee Review Standard format** — Finding, Evidence,
   Constraints Implicated, Options Considered, Recommended Resolution, Justification.
   This is not extra ceremony; it's the format this platform already requires for any
   governance-sensitive finding, and a router misroute or parity failure qualifies.
7. **Route confirmed defects through the existing Anomaly Response Process**
   (Isolate → Investigate → Root cause → Remediate → Re-authorize → Document) rather
   than an ad hoc fix — this keeps router incidents in the same audit trail as any
   other agent anomaly.
8. **Re-audit on a real cadence, not just after an incident.** Rule 13's own logic
   applies here directly: a router that passed its last audit is not evidence it's
   routing correctly today, especially after any shell-contract version bump (a
   `ProgramStatusSnapshot`-style change, v1.23→v1.24, is exactly the kind of change
   that can silently break a downstream count without touching the router itself).

---

## 7 — Immediate application: this audit process and WH-43

Run against WH-43 specifically, step 3 (parity check) is the one live browser action
Section 3 of the System Prompt already describes: open NEXUS's Travel & Time Queue,
count items with live decision controls; open the Reviewer's Workspace NEXUS Travel
panel, check its badge count; confirm they match. **Nothing in this proposed process
changes what that check is — it reframes it as the first instance of a repeatable
parity-test category, not a one-off closing action.** If it passes, WH-43 closes and
"cross-surface parity" becomes a standing line item in future router audits. If it
doesn't, the Anomaly Response Process (§6, step 7) is the correct next step, not a
fresh ad hoc investigation.

---

## 8 — What this process deliberately does not claim

- It does not propose new agents, new infrastructure, or new dependencies — everything
  it uses already exists on the platform.
- It does not replace the Committee Review Standard, the Anomaly Response Process, or
  Rules 11-14 — it applies them specifically to routing behavior, which none of them
  currently do by name.
- It is a proposed practice. Adoption, and any resulting rule numbering (e.g., whether
  this becomes a named addition to `AGENT_REFERENCE.md`), is a Project Principal
  decision, not assumed here.

---

*SOVEREIGN Router Inspection & Audit Process v1 · August 5, 2026*
*Pre-Decisional · Internal Working Document · Not yet a Governance Decision*
