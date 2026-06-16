# SOVEREIGN Platform — ARIA Rule Maintenance Process
**Regulatory Change Management, Rule Validation, and Update Workflow**

Document Type: Governance Operations Record  
Version: 1.0 — May 2026  
Authority: Project Principal · SOVEREIGN Platform Governance Authority  
Status: APPROVED — incorporated into Integration Brief v1.3  
Classification: Pre-Decisional · Internal Working Document

---

## 1. The Problem This Document Resolves

ARIA Suite enforces compliance rules deterministically. The panel correctly identified the operational risk: rules in federal compliance contexts change — regulations are updated, policy guidance is revised, agency-specific requirements evolve. Deterministic enforcement of outdated rules is worse than no enforcement, because it creates a false assurance of compliance.

This document specifies: how regulatory changes are detected and tracked, the workflow for updating ARIA's rule base, the validation requirements before updated rules enter production, the timeline commitments, and the accountability assignments.

---

## 2. The Three ARIA Rule Sets and Their Update Drivers

### ARC — Authorization Routing Rules (10 rules)

**Governing sources:** Federal acquisition regulations, agency-specific authorization policies, security policies, organizational authority matrices.

**Typical update triggers:**
- Agency policy revision affecting authorization thresholds or routing chains
- Organizational restructuring that changes approval authority
- New authorization type not covered by existing rules

**Update frequency:** Low — typically once or twice per year for policy changes; immediately for organizational restructuring that invalidates an approval chain.

### TRACER — Travel Policy Rules (6 rules)

**Governing sources:** Federal Travel Regulation (FTR), Joint Travel Regulations (JTR) for DoD, agency-specific travel policies, GSA per diem rates.

**Typical update triggers:**
- Annual GSA per diem rate updates (every October 1)
- FTR or JTR revision
- Agency travel policy update
- New travel category or expense type not covered by existing rules

**Update frequency:** Medium — annual GSA per diem updates are predictable; FTR/JTR revisions are less frequent but significant. Per diem rate changes affect numeric threshold values in rules, not rule logic.

**Critical note on per diem rates:** TRACER's RULE-001 threshold values (dollar amounts) are data fields in the rule objects, not hardcoded in evaluation logic. Annual per diem updates are a data change, not a code change. The update process for threshold values is simpler than for rule logic changes and should be documented as a sub-process.

### CLEAR — Timecard and Labor Charging Detection Rules (10 rules)

**Governing sources:** DCAA Contract Audit Manual, FAR Part 31 (allowable costs), agency-specific labor charging policies, contract-specific requirements.

**Typical update triggers:**
- DCAA policy update or audit guidance change
- FAR/DFARS revision affecting cost allowability
- Contract modification changing labor charging requirements
- New labor charging error pattern identified from CLEAR case history

**Update frequency:** Low for FAR/DFARS changes; potentially higher for contract-specific rules that vary by customer.

---

## 3. Regulatory Change Detection

ARIA rules do not automatically detect regulatory changes — a human monitoring function is required. The following monitoring assignments apply:

| Rule Set | Monitoring Responsibility | Monitoring Frequency | Source to Monitor |
|---|---|---|---|
| ARC | Agent Operator / designated compliance officer | Quarterly | Agency policy repository; organizational chart changes |
| TRACER | Agent Operator / designated compliance officer | Annually (October) + as-needed | GSA.gov per diem tables; FTR updates at ecfr.gov |
| CLEAR | Agent Operator / designated compliance officer | Semi-annually | DCAA policy updates; FAR/DFARS amendments |

**The quarterly / semi-annual / annual monitoring cadence is a minimum.** When a significant regulatory revision is announced in any of these source domains, an out-of-cycle review is initiated immediately.

**New in this version:** A regulatory monitoring checklist is added to the AgentOS daily briefing template as a standing agenda item. Once per monitoring period, the Agent Operator confirms: "Regulatory sources checked — no updates requiring ARIA rule changes" or "Update detected — ARIA rule change process initiated." This creates an auditable monitoring record.

---

## 4. Rule Update Workflow

All ARIA rule updates follow this workflow regardless of the magnitude of the change. There are no expedited processes — speed comes from process clarity, not from skipping steps.

```
Step 1 — Change Identification
  Trigger: Regulatory source change detected, or new error pattern
  identified from CLEAR case history, or organizational change noted.
  
  Output: Change Identification Record containing:
    - Rule set affected (ARC / TRACER / CLEAR)
    - Specific rule(s) affected (by rule ID)
    - Regulatory source and citation
    - Nature of change (threshold value / rule logic / new rule / rule removal)
    - Urgency classification: Immediate (enforcement gap exists now),
      Scheduled (change takes effect on known future date),
      Routine (improvement, not compliance-driven)

Step 2 — Impact Assessment
  Who: Agent Operator + designated domain expert (compliance officer or
  legal counsel with expertise in the specific regulation)

  What they assess:
    - What cases in ARIA's history would have been decided differently
      under the updated rule? (Retrospective impact)
    - What current open cases are affected? (Immediate action required)
    - Does the change require updating rule logic, threshold values,
      reasoning chain templates, or all three?

  Output: Impact Assessment Record (appended to Change Identification Record)

Step 3 — Draft Rule Update
  Who: Agent Operator (may use AI assistance with disclosure — see ARIA
  AI Boundary Scope Statement)

  What is produced:
    - New rule object(s) in typed format:
      {id, label, field, condition, value, escalateTo/authority/severity,
       ref, reasoning(actual, triggered)}
    - Updated reasoning chain template text
    - Diff showing exactly what changed from the current rule

  AI assistance note: If Claude or any AI tool was used to draft the
  updated rule or reasoning chain, this is disclosed in the change record.
  AI assistance does not reduce the validation requirement — it may add
  to it, since AI-drafted rules require human expert validation of both
  the rule logic and the reasoning chain template accuracy.

Step 4 — Legal/Compliance Expert Validation
  Who: A person with domain expertise in the specific regulation being
  updated. This is not the same person who drafted the update.
  For FTR updates: someone with federal travel compliance expertise.
  For DCAA updates: someone with DCAA audit or FAR Part 31 expertise.
  For agency policy updates: the agency's designated policy official.

  What they validate:
    - The updated rule correctly captures the regulatory requirement
    - The threshold values (if changed) match the new regulatory values
    - The reasoning chain template accurately explains the rule
    - The rule's `ref` field correctly cites the updated regulatory source
    - Edge cases are handled correctly (particularly: boundary conditions,
      the exact mathematical operator used — > vs. ≥ matters)

  Output: Validation Sign-off Record with:
    - Validator name, role, date
    - Specific items confirmed
    - Any conditions or caveats
    - If any item cannot be confirmed, the update does not proceed

Step 5 — Project Principal Approval
  The Project Principal reviews the Change Identification Record,
  Impact Assessment, draft rule update, and Validation Sign-off.
  Approval is logged with date and signature.

Step 6 — Production Deployment
  Updated rule objects are committed to the monorepo under version
  control. Commit message format:
    "aria: [RULE-SET] [RULE-ID] v[old] → v[new] — [regulatory citation]"

  CHANGELOG.md is updated in the affected module's rule directory.
  The new rule version is the current version. The old version remains
  in the change history.

Step 7 — Retrospective Review (for Urgent changes)
  For changes classified as Immediate urgency: within 5 business days
  of deployment, the Agent Operator reviews open and recently closed
  cases to identify any that should be re-evaluated under the new rule.
  Cases requiring re-evaluation are routed to the appropriate human
  decision-maker with the updated rule applied.

  This step is not required for Scheduled or Routine changes, where
  the rule takes effect prospectively.
```

---

## 5. Timeline Commitments

| Urgency Classification | Step 1-3 (Draft) | Step 4 (Validation) | Step 5-6 (Approval + Deploy) | Total |
|---|---|---|---|---|
| Immediate | Same day | 1 business day | 1 business day | 3 business days |
| Scheduled | Before effective date minus 10 days | Minus 5 days | Minus 2 days | 10 days before effective date |
| Routine | Within 30 days of identification | Within 45 days | Within 60 days | 60 days |

**Annual GSA per diem update (TRACER threshold values only):** A simplified process applies. No impact assessment or expert validation is required for pure threshold value updates that match published GSA tables. The Agent Operator updates the numeric values in the rule objects, cites the GSA table, and the Project Principal approves. Timeline: complete by October 1 of each year.

---

## 6. Boundary Condition Discipline

The panel's review highlighted a critical precision requirement: rules with boundary conditions (exact thresholds, > vs. ≥ operators) must be specified precisely. TRACER's TR-2025-047 (cost exactly at the threshold — passes because the rule is `>` not `≥`) demonstrates the correct approach.

**Every rule update that involves a numeric threshold must specify:**
- The exact operator used (`>`, `≥`, `<`, `≤`, `=`)
- The exact value
- A test case at the boundary (value exactly equals threshold) confirming the correct outcome
- A test case one unit above and one unit below the boundary

These three test cases are documented in the Change Identification Record and verified during validation. They become part of the synthetic test dataset for ARIA.

---

## 7. Accountability Summary

| Role | Responsibility |
|---|---|
| Agent Operator | Regulatory monitoring, change identification, rule drafting, deployment |
| Domain Expert / Compliance Officer | Step 4 validation — confirms regulatory accuracy |
| Project Principal | Step 5 approval — final authority before production deployment |
| ARIA AI Boundary Scope Statement | Governs what AI assistance is permissible in rule drafting |

---

*ARIA Rule Maintenance Process v1.0 · May 2026*  
*Pre-Decisional · Internal Working Document*
