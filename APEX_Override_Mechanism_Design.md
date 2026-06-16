# SOVEREIGN Platform — APEX Override Mechanism Design
**Authority, Process, and Audit Trail for Governance Hold Override**

Document Type: Architectural Decision Record  
Version: 1.0 — May 2026  
Authority: Project Principal · SOVEREIGN Platform Governance Authority  
Status: APPROVED — incorporated into Integration Brief v1.3  
Classification: Pre-Decisional · Internal Working Document

---

## 1. The Problem This Document Resolves

APEX automatically blocks report generation when upstream governance conditions are not satisfied. The panel correctly identified that a blocking mechanism without a designed override path is a single point of failure: a misconfigured upstream condition can block legitimate work, and a blocked monthly status report in a federal program context can cascade into contract compliance issues, payment holds, and congressional reporting failures.

Equally, an override path that is too easy becomes a formality that operators learn to bypass routinely, defeating the purpose of the block.

This document specifies the override mechanism: who has authority, what process must be followed, what is recorded, and how the mechanism is protected from routine misuse.

---

## 2. The Two Types of Blocks

APEX has two distinct block mechanisms that require different override treatments.

### Type A — DOE-NORM Governance Hold (sovereignHold)

**What triggers it:** `sovereignHold(programId, reportType)` returns true when CPMI portfolio status for the program is `red` AND the report type is QPR or ABS. The block is a structural gate — the report HTML is never generated, not a warning that can be dismissed.

**What it means:** CPMI has assessed the program as non-compliant or at risk in a way that makes a Quarterly Progress Report or Annual Budget Summary inappropriate to generate without governance resolution. The hold is not APEX's determination — it is CPMI's determination surfaced by APEX.

**What it does not mean:** The block does not mean the program has failed. It means a governance condition exists that must be resolved before formal reporting proceeds. The MSR (Monthly Status Report) and CSC (Cost Summary Card) are not blocked — only QPR and ABS.

### Type B — System or Configuration Error Block

**What triggers it:** `sovereignHold()` returns true due to a misconfigured CPMI status, a stale world model query, a connectivity failure between APEX and the CPMI world model API, or a data error in the program's status records.

**What it means:** The block is technically triggered but not substantively warranted — the program is not actually in a governance hold condition.

The override mechanism must treat these two types differently. Overriding a Type A block to proceed with a report despite a real governance finding is a consequential decision that requires high-level authorization and full documentation. Overriding a Type B block due to a system error is an operational necessity that should be resolvable quickly with appropriate logging.

---

## 3. Override Authority

### Type A Override — Real Governance Hold

**Who can override:** The designated program Program Manager and a named Independent Reviewer (the same class of reviewer as CPMI-VRS Gate 3). Both must approve.

**Who cannot override unilaterally:** No single person can override a Type A block alone. Self-override (the program manager overriding their own program's hold) is architecturally blocked — the same no-self-approval constraint that applies throughout ARIA and CPMI applies here.

**What "override" means in this context:** Approving an override does not change the CPMI governance status. The hold remains in CPMI's records. The override creates an exception record that says: the program team and an independent reviewer have acknowledged the governance finding, accept responsibility for reporting during the hold period, and have documented the justification for proceeding. The report is generated with a GOVERNANCE_HOLD_ACTIVE watermark notation.

### Type B Override — System/Configuration Error

**Who can override:** The Agent Operator (as defined in the Agent Identity Standard).

**What is required:** The Agent Operator documents: (a) the specific error condition that triggered the false hold, (b) the technical basis for concluding it is a system error rather than a real governance finding, and (c) the remediation action being taken.

**What is generated:** A `GOVERNANCE_GATE_OVERRIDE` Logger event with the Agent Operator's identity, the override type (Type B), and the error documentation. The report is generated normally — no GOVERNANCE_HOLD_ACTIVE notation because the hold was not substantively warranted.

---

## 4. Override Process

### Type A Override Process

```
Step 1 — Override Request
  Program Manager submits an override request through APEX.
  Required fields: program_id, report_type, justification (free text),
  acknowledgment that the CPMI governance finding is known and documented.

Step 2 — Independent Reviewer Notification
  APEX routes the override request to the designated Independent Reviewer.
  The request includes: the CPMI governance finding that triggered the hold,
  the Program Manager's justification, and the report type being requested.

Step 3 — Independent Reviewer Decision
  The Independent Reviewer approves or denies the override.
  Approval requires a written concurrence statement.
  Denial is final — the block stands.

Step 4 — Report Generation (if approved)
  The report is generated with GOVERNANCE_HOLD_ACTIVE notation on every page.
  The notation states: "This report was generated during an active governance hold.
  The governance finding has been acknowledged. See override record [ID]."

Step 5 — Override Record
  A complete override record is created and stored:
    - override_id (unique)
    - program_id
    - report_type
    - governance_finding (the CPMI status that triggered the hold)
    - program_manager_justification
    - independent_reviewer_concurrence
    - program_manager_id, reviewer_id
    - override_timestamp
    - report_generated_with_hold_active: true
  This record is appended to the audit trail and cannot be altered.
  Logger event: GOVERNANCE_GATE_OVERRIDE, decision_type: HUMAN_APPROVAL (both approvers logged)
```

### Type B Override Process

```
Step 1 — Error Documentation
  Agent Operator documents the error condition in the APEX admin panel.

Step 2 — Technical Validation
  Agent Operator confirms: CPMI portfolio status query returns an error or
  stale result, not an actual red status; OR the sovereignHold() function
  is returning true due to a documented code or configuration issue.

Step 3 — Override Execution
  Agent Operator clears the technical block for this report generation only.
  Logger event: GOVERNANCE_GATE_OVERRIDE, override_type: TYPE_B_SYSTEM_ERROR

Step 4 — Remediation
  Agent Operator documents the remediation action (API reconnection,
  cache clear, configuration fix) that prevents recurrence.
```

---

## 5. Protections Against Routine Misuse

The override mechanism is designed to be usable in genuine circumstances and resistant to becoming a habit.

**Protection 1 — Two-person rule for Type A.** No single actor can clear a real governance hold. This is not a policy — it is enforced by requiring two separate authentication events (PM approval + reviewer approval) before report generation proceeds.

**Protection 2 — GOVERNANCE_HOLD_ACTIVE notation.** Reports generated during a hold are permanently marked. Downstream recipients — ARIA compliance reviewers, portfolio managers, external stakeholders — can see that the report was generated under a hold. This creates accountability that discourages casual overrides.

**Protection 3 — Override pattern monitoring.** The Agent Operator reviews the frequency of override requests as part of the daily briefing. A program with multiple Type A overrides in a short period is a governance signal — either the CPMI governance finding is being ignored or the hold condition is incorrectly configured. Both require investigation.

**Protection 4 — Type B overrides trigger investigation.** A Type B override is not a routine operational event — it means a system component that should be working is not. Every Type B override requires a documented root cause and remediation. Recurring Type B overrides on the same program indicate a systemic infrastructure issue.

---

## 6. Records Management Implication

Override records are federal records when APEX is deployed in a federal agency context. They document a decision to proceed with official reporting during a known governance exception. Retention and FOIA treatment should be determined by the agency records officer as part of the Federal Records Management Position implementation.

---

*APEX Override Mechanism Design v1.0 · May 2026*  
*Pre-Decisional · Internal Working Document*
