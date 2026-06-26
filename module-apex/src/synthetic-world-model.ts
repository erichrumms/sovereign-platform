/**
 * SOVEREIGN Platform — module-apex
 * synthetic-world-model.ts — synthetic, UNCLASSIFIED program data (Governance Clock OFF).
 *
 * Represents what cpmi.world-model-api would return for each program, projected into the
 * ApexProgramRecord shape APEX reads. All data is synthetic (Constraint: synthetic only)
 * and UNCLASSIFIED (GD-10). Every risk flag carries its DC-3 provenance so the Program
 * Detail view and the dossier are traceable. P-100 is the Walkthrough A demo program;
 * P-200 / P-150 / P-300 are the CPMI-VRS benchmark scenarios A / B / C (spec §8).
 *
 * Prose is written for a non-technical reviewer (Gap 5) — complete sentences, no field pairs.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import type {
  ApexProgramRecord,
  ReasoningChainSummary,
  GovernanceDecisionRecord,
  AgentTaskRecord,
} from "./apex-contract";

// ── P-100 — Joint Logistics Modernization (Walkthrough A demo · AT_RISK) ──────────────
const P100: ApexProgramRecord = {
  program_id: "P-100",
  program_name: "Joint Logistics Modernization",
  classification: "UNCLASSIFIED",
  status_label: "AT_RISK",
  status_narrative:
    "The Joint Logistics Modernization program is 62 percent through its execution phase. " +
    "Most objectives are progressing as planned, but Milestone 3 is at risk and three issues " +
    "are currently flagged for review. The program remains recoverable, but a program manager " +
    "should review the flagged items below before the next quarterly review.",
  completion_pct: 62,
  responsible_party: "Program Manager Dana Jones",
  objectives: [
    "Replace the legacy logistics tracking system with a governed, auditable platform.",
    "Reduce average requisition cycle time across the supported commands.",
    "Establish a single authoritative source for inventory status.",
  ],
  milestones: [
    { name: "Milestone 1 — Requirements baseline", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — System design review", status_narrative: "Completed on schedule.", on_track: true },
    {
      name: "Milestone 3 — Integration test readiness",
      status_narrative: "Milestone 3 is two weeks behind schedule because an interface dependency was delivered late.",
      on_track: false,
    },
  ],
  risk_flags: [
    {
      flag_id: "P-100-R1",
      summary: "Cost variance is trending unfavorably — actual costs are running about 8 percent over the plan to date.",
      severity: "P2",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Cost variance",
        source_data: "CPMI World Model cost ledger for P-100, monthly obligation roll-up through May 2026.",
        baseline: "Planned spend of 58 percent of budget at this point in the schedule.",
        current_actual_value: "Spending is at about 66 percent of budget — roughly 8 points above the planned rate for this point in the schedule.",
        variance_from_baseline: "8 percentage points above the planned 58 percent spend rate — unfavorable.",
        last_updated: "2026-05-31",
        trend: "DEGRADING",
        responsible_party: "Business Financial Manager Alex Reed",
      },
    },
    {
      flag_id: "P-100-R2",
      summary: "Milestone 3 schedule slip of two weeks driven by a late interface dependency.",
      severity: "P2",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Schedule — Milestone 3",
        source_data: "CPMI World Model milestone tracker for P-100, integration readiness checklist.",
        baseline: "Milestone 3 planned completion of June 15, 2026.",
        current_actual_value: "Milestone 3 is now forecast to complete on June 29, 2026.",
        variance_from_baseline: "About two weeks later than the planned June 15 completion — unfavorable.",
        last_updated: "2026-06-10",
        trend: "STABLE",
        responsible_party: "Integration Lead Sam Carter",
      },
    },
    {
      flag_id: "P-100-R3",
      summary: "One supplier has not yet returned a required compliance attestation.",
      severity: "P3",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Supplier compliance attestation",
        source_data: "CPMI World Model vendor register for P-100, outstanding attestations list.",
        baseline: "All suppliers attested before integration test entry.",
        current_actual_value: "One of the program's suppliers has not yet returned its required compliance attestation.",
        variance_from_baseline: "One attestation outstanding against a baseline of full supplier attestation — unfavorable but low impact.",
        last_updated: "2026-06-05",
        trend: "STABLE",
        responsible_party: "Contracting Officer Representative Pat Lee",
      },
    },
  ],
  regulatory_context: [
    "Federal Acquisition Regulation section 15.2, which governs source selection procedures.",
    "Department of Defense Instruction 5000.02, which governs the defense acquisition lifecycle.",
  ],
  prior_governance_records: [
    "Milestone 2 design review approved by the program decision authority on April 12, 2026.",
    "A cost re-baseline request was reviewed and deferred pending the integration test result.",
  ],
  last_updated: "2026-06-10",
};

// ── P-200 — Maintenance Data Consolidation (Scenario A · ON_TRACK) ────────────────────
const P200: ApexProgramRecord = {
  program_id: "P-200",
  program_name: "Maintenance Data Consolidation",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative:
    "The Maintenance Data Consolidation program is 80 percent complete and all milestones are " +
    "on schedule. There are no open risk flags. The program is performing as planned and does " +
    "not currently require escalation.",
  completion_pct: 80,
  responsible_party: "Program Manager Robin Vasquez",
  objectives: [
    "Consolidate maintenance records from four legacy systems into one governed repository.",
    "Provide maintenance leadership with a single accurate readiness view.",
  ],
  milestones: [
    { name: "Milestone 1 — Data mapping", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Migration", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 3 — User acceptance", status_narrative: "On schedule and expected to complete on plan.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: [
    "Office of Management and Budget Circular A-11, which governs budget preparation and execution.",
  ],
  prior_governance_records: [
    "Migration readiness approved by the program decision authority on March 1, 2026.",
  ],
  last_updated: "2026-06-08",
};

// ── P-150 — Training Range Scheduling (Scenario B · AT_RISK, single flag) ─────────────
const P150: ApexProgramRecord = {
  program_id: "P-150",
  program_name: "Training Range Scheduling",
  classification: "UNCLASSIFIED",
  status_label: "AT_RISK",
  status_narrative:
    "The Training Range Scheduling program is 55 percent complete. One milestone is two weeks " +
    "behind schedule and cost variance is trending unfavorably. A program manager should review " +
    "the cost variance flag and decide whether a corrective action is needed.",
  completion_pct: 55,
  responsible_party: "Program Manager Jordan Kim",
  objectives: [
    "Automate scheduling of shared training ranges across units.",
    "Reduce scheduling conflicts and unused range time.",
  ],
  milestones: [
    { name: "Milestone 1 — Requirements", status_narrative: "Completed on schedule.", on_track: true },
    {
      name: "Milestone 2 — Pilot deployment",
      status_narrative: "Milestone 2 is two weeks behind schedule because pilot site readiness slipped.",
      on_track: false,
    },
  ],
  risk_flags: [
    {
      flag_id: "P-150-R1",
      summary: "Cost variance is trending unfavorably — actual costs are running about 6 percent over the plan to date.",
      severity: "P2",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Cost variance",
        source_data: "CPMI World Model cost ledger for P-150, monthly obligation roll-up through May 2026.",
        baseline: "Planned spend of 52 percent of budget at this point in the schedule.",
        current_actual_value: "Spending is at about 58 percent of budget — roughly 6 points above the planned rate for this point in the schedule.",
        variance_from_baseline: "6 percentage points above the planned 52 percent spend rate — unfavorable.",
        last_updated: "2026-05-31",
        trend: "DEGRADING",
        responsible_party: "Business Financial Manager Lee Okafor",
      },
    },
  ],
  regulatory_context: [
    "Office of Management and Budget Circular A-11, which governs budget preparation and execution.",
  ],
  prior_governance_records: [
    "Pilot scope approved by the program decision authority on April 20, 2026.",
  ],
  last_updated: "2026-06-09",
};

// ── P-300 — Depot Modernization (Scenario C · OFF_TRACK) ──────────────────────────────
const P300: ApexProgramRecord = {
  program_id: "P-300",
  program_name: "Depot Modernization",
  classification: "UNCLASSIFIED",
  status_label: "OFF_TRACK",
  status_narrative:
    "The Depot Modernization program is 30 percent complete and is off track. Two milestones have " +
    "been missed, three issues are flagged, and one regulatory compliance question is open. This " +
    "program should be escalated for a program review and the open legal question referred for " +
    "human legal review.",
  completion_pct: 30,
  responsible_party: "Program Manager Casey Morgan",
  objectives: [
    "Modernize depot maintenance facilities and tooling.",
    "Bring depot throughput in line with fleet sustainment demand.",
  ],
  milestones: [
    {
      name: "Milestone 1 — Site preparation",
      status_narrative: "Milestone 1 was missed; site preparation finished six weeks late.",
      on_track: false,
    },
    {
      name: "Milestone 2 — Tooling installation",
      status_narrative: "Milestone 2 was missed; tooling delivery has not yet started.",
      on_track: false,
    },
  ],
  risk_flags: [
    {
      flag_id: "P-300-R1",
      summary: "Schedule has slipped badly — the program is roughly three months behind the approved baseline.",
      severity: "P1",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Schedule",
        source_data: "CPMI World Model milestone tracker for P-300, baseline comparison through June 2026.",
        baseline: "Approved schedule baseline placing the program at 50 percent complete by June 2026.",
        current_actual_value: "The program is about 30 percent complete as of June 2026.",
        variance_from_baseline: "About 20 percentage points behind the planned 50 percent — roughly three months late, unfavorable.",
        last_updated: "2026-06-07",
        trend: "DEGRADING",
        responsible_party: "Integration Lead Morgan Diaz",
      },
    },
    {
      flag_id: "P-300-R2",
      summary: "Cost variance is severe — actual costs are running about 22 percent over the plan to date.",
      severity: "P1",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Cost variance",
        source_data: "CPMI World Model cost ledger for P-300, monthly obligation roll-up through May 2026.",
        baseline: "Planned spend of 28 percent of budget at this point in the schedule.",
        current_actual_value: "Spending is at about 50 percent of budget — roughly 22 points above the planned rate for this point in the schedule.",
        variance_from_baseline: "22 percentage points above the planned 28 percent spend rate — severely unfavorable.",
        last_updated: "2026-05-31",
        trend: "DEGRADING",
        responsible_party: "Business Financial Manager Taylor Brooks",
      },
    },
    {
      flag_id: "P-300-R3",
      summary:
        "There is an open question about whether a planned sole-source action complies with competition requirements.",
      severity: "P1",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Regulatory compliance — competition",
        source_data: "CPMI World Model regulatory register for P-300, open compliance questions list.",
        baseline: "All acquisition actions compliant with Federal Acquisition Regulation Part 6.",
        current_actual_value: "One planned sole-source action has an open question about whether it meets competition requirements.",
        variance_from_baseline: "One open compliance question against a baseline of full compliance — unfavorable, pending legal review.",
        last_updated: "2026-06-04",
        trend: "STABLE",
        responsible_party: "Contracting Officer Riley Nguyen",
      },
    },
  ],
  regulatory_context: [
    "Federal Acquisition Regulation Part 6, which governs competition requirements.",
    "Department of Defense Instruction 5000.02, which governs the defense acquisition lifecycle.",
    "The Anti-Deficiency Act, which prohibits obligations in excess of available funds.",
  ],
  prior_governance_records: [
    "A schedule re-baseline was requested and is pending a program review decision.",
  ],
  last_updated: "2026-06-07",
};

export const SYNTHETIC_PROGRAMS: readonly ApexProgramRecord[] = [P100, P200, P150, P300];

// ── Supporting dossier records (DC-2), keyed by program ───────────────────────────────

export const SYNTHETIC_REASONING_HISTORY: Record<string, ReasoningChainSummary[]> = {
  "P-100": [
    { recorded_at: "2026-04-12T14:00:00.000Z", recommendation: "Proceed to integration test planning while monitoring cost variance.", tier: "live", schema_valid: true },
    { recorded_at: "2026-06-10T09:30:00.000Z", recommendation: "Convene a focused review of the Milestone 3 dependency before committing to the test entry date.", tier: "live", schema_valid: true },
  ],
  "P-200": [
    { recorded_at: "2026-03-01T10:00:00.000Z", recommendation: "Continue as planned; no governance action required.", tier: "live", schema_valid: true },
  ],
  "P-150": [
    { recorded_at: "2026-04-20T10:00:00.000Z", recommendation: "Approve the pilot scope and track cost variance monthly.", tier: "live", schema_valid: true },
  ],
  "P-300": [
    { recorded_at: "2026-06-07T08:00:00.000Z", recommendation: "Escalate for a program review and refer the competition question for legal review.", tier: "live", schema_valid: true },
  ],
};

export const SYNTHETIC_GOVERNANCE_DECISIONS: Record<string, GovernanceDecisionRecord[]> = {
  "P-100": [
    { decided_at: "2026-04-12T15:00:00.000Z", decision_type: "HUMAN_APPROVAL", actor_name: "Dana Jones", note: "Design review accepted; proceed to integration planning.", outcome: "approved" },
  ],
  "P-200": [
    { decided_at: "2026-03-01T11:00:00.000Z", decision_type: "HUMAN_APPROVAL", actor_name: "Robin Vasquez", note: "Migration readiness accepted.", outcome: "approved" },
  ],
  "P-150": [
    { decided_at: "2026-04-20T11:00:00.000Z", decision_type: "HUMAN_APPROVAL", actor_name: "Jordan Kim", note: "Pilot scope accepted.", outcome: "approved" },
  ],
  "P-300": [],
};

export const SYNTHETIC_TASK_HISTORY: Record<string, AgentTaskRecord[]> = {
  "P-100": [
    { task_id: "T-100-1", title: "Compile Milestone 3 dependency status", approval_status: "Approved", approved_by: "Dana Jones", completed: true },
    { task_id: "T-100-2", title: "Refresh cost variance roll-up", approval_status: "Approved", approved_by: "Alex Reed", completed: true },
  ],
  "P-200": [
    { task_id: "T-200-1", title: "Prepare user acceptance test plan", approval_status: "Approved", approved_by: "Robin Vasquez", completed: false },
  ],
  "P-150": [
    { task_id: "T-150-1", title: "Investigate pilot site readiness slip", approval_status: "Approved", approved_by: "Jordan Kim", completed: false },
  ],
  "P-300": [
    { task_id: "T-300-1", title: "Assemble program review package", approval_status: "Awaiting approval", approved_by: null, completed: false },
  ],
};
