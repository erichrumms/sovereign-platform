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

// ── P-401 through P-413 — GD-33 World Model expansion (Session GD-33) ────────────────
// 13 new programs across World Model I (Dana Jones) and World Model II (Robin Vasquez)
// teams. Lightweight entries sufficient for staff-visibility reporting (docs/35 §4).
// Full dossier data will be added when the reporting layer (docs/34 Phase 4) is built.

const P401: ApexProgramRecord = {
  program_id: "P-401",
  program_name: "Integrated Financial Reporting Platform",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Integrated Financial Reporting Platform is 45 percent complete and all milestones are on schedule. No open risk flags.",
  completion_pct: 45,
  responsible_party: "Program Manager Dana Jones",
  objectives: ["Consolidate disparate financial reporting feeds into a single governed platform."],
  milestones: [
    { name: "Milestone 1 — Requirements baseline", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — System design review", status_narrative: "On schedule.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["OMB Circular A-11"],
  prior_governance_records: [],
  last_updated: "2026-07-31",
};

const P402: ApexProgramRecord = {
  program_id: "P-402",
  program_name: "Contract Performance Monitoring Suite",
  classification: "UNCLASSIFIED",
  status_label: "AT_RISK",
  status_narrative: "The Contract Performance Monitoring Suite is 38 percent complete. One milestone is at risk due to a vendor staffing gap.",
  completion_pct: 38,
  responsible_party: "Program Manager Dana Jones",
  objectives: ["Automate contract performance data collection and alerting."],
  milestones: [
    { name: "Milestone 1 — Data schema approval", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Pilot deployment", status_narrative: "Two weeks behind schedule due to vendor staffing gap.", on_track: false },
  ],
  risk_flags: [
    {
      flag_id: "P-402-R1",
      summary: "Vendor staffing below planned level; integration timeline at risk.",
      severity: "P2",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Vendor staffing",
        source_data: "CPMI World Model vendor register for P-402.",
        baseline: "Full vendor team on-site by June 2026.",
        current_actual_value: "Vendor team is at sixty percent of planned headcount.",
        variance_from_baseline: "Forty percent below planned headcount — unfavorable.",
        last_updated: "2026-07-28",
        trend: "STABLE",
        responsible_party: "Contracting Officer Representative",
      },
    },
  ],
  regulatory_context: ["FAR 42.15 — contractor performance information"],
  prior_governance_records: [],
  last_updated: "2026-07-28",
};

const P403: ApexProgramRecord = {
  program_id: "P-403",
  program_name: "Workforce Analytics Dashboard",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Workforce Analytics Dashboard is 60 percent complete and performing as planned.",
  completion_pct: 60,
  responsible_party: "Program Manager Dana Jones",
  objectives: ["Provide leadership with near-real-time workforce readiness metrics."],
  milestones: [
    { name: "Milestone 1 — Data ingestion pipeline", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Dashboard MVP", status_narrative: "On track for completion in Q4.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["Privacy Act of 1974"],
  prior_governance_records: ["Dashboard scope approved April 2026."],
  last_updated: "2026-07-25",
};

const P404: ApexProgramRecord = {
  program_id: "P-404",
  program_name: "Regulatory Compliance Tracking System",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Regulatory Compliance Tracking System is 55 percent complete and on schedule.",
  completion_pct: 55,
  responsible_party: "Program Manager Dana Jones",
  objectives: ["Consolidate regulatory compliance obligations into a single governed tracker."],
  milestones: [
    { name: "Milestone 1 — Obligation inventory", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Workflow integration", status_narrative: "On track.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["OMB Circular A-123"],
  prior_governance_records: [],
  last_updated: "2026-07-20",
};

const P405: ApexProgramRecord = {
  program_id: "P-405",
  program_name: "Mission Systems Health Monitor",
  classification: "UNCLASSIFIED",
  status_label: "AT_RISK",
  status_narrative: "The Mission Systems Health Monitor is 42 percent complete. Cost variance is trending slightly unfavorable.",
  completion_pct: 42,
  responsible_party: "Program Manager Dana Jones",
  objectives: ["Provide continuous health monitoring for mission-critical systems."],
  milestones: [
    { name: "Milestone 1 — Sensor integration", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Alert routing", status_narrative: "On track.", on_track: true },
  ],
  risk_flags: [
    {
      flag_id: "P-405-R1",
      summary: "Cost variance trending 5 percent above plan.",
      severity: "P3",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Cost variance",
        source_data: "CPMI World Model cost ledger for P-405.",
        baseline: "Planned spend of 40 percent of budget at this schedule point.",
        current_actual_value: "Spending is at 45 percent of budget.",
        variance_from_baseline: "5 percentage points above plan — slightly unfavorable.",
        last_updated: "2026-07-30",
        trend: "STABLE",
        responsible_party: "Business Financial Manager",
      },
    },
  ],
  regulatory_context: ["DoD 5000.02"],
  prior_governance_records: [],
  last_updated: "2026-07-30",
};

const P406: ApexProgramRecord = {
  program_id: "P-406",
  program_name: "Data Quality Governance Framework",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Data Quality Governance Framework is 70 percent complete and performing as planned.",
  completion_pct: 70,
  responsible_party: "Program Manager Dana Jones",
  objectives: ["Establish a governed framework for enterprise data quality monitoring."],
  milestones: [
    { name: "Milestone 1 — Standards publication", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Tool deployment", status_narrative: "On track for Q4 completion.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["Federal Data Strategy 2020 Action Plan"],
  prior_governance_records: ["Standards approved by data governance board June 2026."],
  last_updated: "2026-07-22",
};

const P407: ApexProgramRecord = {
  program_id: "P-407",
  program_name: "Acquisition Lifecycle Transparency Tool",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Acquisition Lifecycle Transparency Tool is 50 percent complete and on schedule.",
  completion_pct: 50,
  responsible_party: "Program Manager Dana Jones",
  objectives: ["Provide end-to-end acquisition lifecycle visibility to program stakeholders."],
  milestones: [
    { name: "Milestone 1 — Data model finalization", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Stakeholder pilot", status_narrative: "Scheduled for Q4.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["FAR Part 4 — administrative matters"],
  prior_governance_records: [],
  last_updated: "2026-07-18",
};

const P408: ApexProgramRecord = {
  program_id: "P-408",
  program_name: "Interoperability Standards Registry",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Interoperability Standards Registry is 35 percent complete and progressing as planned.",
  completion_pct: 35,
  responsible_party: "Program Manager Robin Vasquez",
  objectives: ["Maintain a governed registry of approved interoperability standards."],
  milestones: [
    { name: "Milestone 1 — Registry schema approval", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Population sprint", status_narrative: "On track.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["DoD Instruction 8330.01"],
  prior_governance_records: [],
  last_updated: "2026-07-26",
};

const P409: ApexProgramRecord = {
  program_id: "P-409",
  program_name: "Strategic Communication Workflow",
  classification: "UNCLASSIFIED",
  status_label: "AT_RISK",
  status_narrative: "The Strategic Communication Workflow is 28 percent complete. A dependency on a shared platform integration is delayed.",
  completion_pct: 28,
  responsible_party: "Program Manager Robin Vasquez",
  objectives: ["Streamline the production and approval workflow for strategic communications."],
  milestones: [
    { name: "Milestone 1 — Workflow design", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Platform integration", status_narrative: "Three weeks behind schedule due to upstream dependency.", on_track: false },
  ],
  risk_flags: [
    {
      flag_id: "P-409-R1",
      summary: "Upstream platform integration delayed by three weeks.",
      severity: "P2",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Platform integration dependency",
        source_data: "CPMI World Model dependency tracker for P-409.",
        baseline: "Integration complete by end of July 2026.",
        current_actual_value: "Integration now forecast for mid-August 2026.",
        variance_from_baseline: "Three weeks behind plan — unfavorable.",
        last_updated: "2026-07-29",
        trend: "STABLE",
        responsible_party: "Integration Program Office",
      },
    },
  ],
  regulatory_context: ["DoD Directive 5122.05"],
  prior_governance_records: [],
  last_updated: "2026-07-29",
};

const P410: ApexProgramRecord = {
  program_id: "P-410",
  program_name: "Knowledge Management Portal",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Knowledge Management Portal is 65 percent complete and performing as planned.",
  completion_pct: 65,
  responsible_party: "Program Manager Robin Vasquez",
  objectives: ["Provide a governed portal for institutional knowledge capture and retrieval."],
  milestones: [
    { name: "Milestone 1 — Portal launch", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Content migration", status_narrative: "On track.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["Federal Records Act"],
  prior_governance_records: ["Portal launch approved May 2026."],
  last_updated: "2026-07-21",
};

const P411: ApexProgramRecord = {
  program_id: "P-411",
  program_name: "Audit Readiness Accelerator",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Audit Readiness Accelerator is 48 percent complete and on schedule.",
  completion_pct: 48,
  responsible_party: "Program Manager Robin Vasquez",
  objectives: ["Accelerate audit readiness by automating evidence collection and packaging."],
  milestones: [
    { name: "Milestone 1 — Evidence taxonomy", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Automated collection pilot", status_narrative: "On track.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["OMB Circular A-123", "DoD Financial Improvement and Audit Readiness"],
  prior_governance_records: [],
  last_updated: "2026-07-17",
};

const P412: ApexProgramRecord = {
  program_id: "P-412",
  program_name: "Resource Allocation Decision Support",
  classification: "UNCLASSIFIED",
  status_label: "AT_RISK",
  status_narrative: "The Resource Allocation Decision Support program is 32 percent complete. A requirements gap was identified in July.",
  completion_pct: 32,
  responsible_party: "Program Manager Robin Vasquez",
  objectives: ["Provide decision-support tooling for enterprise resource allocation."],
  milestones: [
    { name: "Milestone 1 — Use case definition", status_narrative: "Completed with a minor scope change.", on_track: true },
    { name: "Milestone 2 — Prototype", status_narrative: "At risk; requirements gap under resolution.", on_track: false },
  ],
  risk_flags: [
    {
      flag_id: "P-412-R1",
      summary: "Requirements gap identified; prototype timeline at risk.",
      severity: "P2",
      provenance: {
        entity_type: "World Model risk flag",
        field_label: "Requirements completeness",
        source_data: "CPMI World Model requirements tracker for P-412.",
        baseline: "Requirements complete by end of June 2026.",
        current_actual_value: "Two use cases remain undefined as of July 2026.",
        variance_from_baseline: "Two requirements gaps outstanding — unfavorable.",
        last_updated: "2026-07-27",
        trend: "IMPROVING",
        responsible_party: "Requirements Lead",
      },
    },
  ],
  regulatory_context: ["OMB Circular A-11"],
  prior_governance_records: [],
  last_updated: "2026-07-27",
};

const P413: ApexProgramRecord = {
  program_id: "P-413",
  program_name: "Executive Decision Briefing Automation",
  classification: "UNCLASSIFIED",
  status_label: "ON_TRACK",
  status_narrative: "The Executive Decision Briefing Automation program is 55 percent complete and performing as planned.",
  completion_pct: 55,
  responsible_party: "Program Manager Robin Vasquez",
  objectives: ["Automate the preparation and formatting of executive decision briefings."],
  milestones: [
    { name: "Milestone 1 — Template library", status_narrative: "Completed on schedule.", on_track: true },
    { name: "Milestone 2 — Workflow integration", status_narrative: "On track for Q4.", on_track: true },
  ],
  risk_flags: [],
  regulatory_context: ["DoD Directive 5105.53"],
  prior_governance_records: [],
  last_updated: "2026-07-15",
};

export const SYNTHETIC_PROGRAMS: readonly ApexProgramRecord[] = [
  P100, P200, P150, P300,
  // GD-33 World Model I additions (Dana Jones team)
  P401, P402, P403, P404, P405, P406, P407,
  // GD-33 World Model II additions (Robin Vasquez team)
  P408, P409, P410, P411, P412, P413,
];

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
