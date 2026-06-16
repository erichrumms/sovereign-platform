/**
 * SCRIBE Mode Output Schemas
 * Imported by module-scribe; validated before user approval at ExportPanel.
 * Each schema matches the target product's canonical intake format.
 * Do not hardcode field names in module-scribe — import from here.
 *
 * Types only at this stage (no validation functions) — per the companion suite
 * specification, Part 3.
 *
 * NOTE: the companion suite spec wrote `decision_type: DecisionType`. The
 * canonical type name in the platform is HumanDecisionType (shell-contract
 * Section 2 / sovereign-data shared-types). We use the canonical name here.
 */

import type { HumanDecisionType } from '../shared-types';

/** Correspondence Draft → NEXUS task intake */
export interface CorrespondenceDraftSchema {
  subject: string;
  body: string;
  action_items: ActionItem[];
  program_id?: string;
  document_id?: string;
  decision_type?: HumanDecisionType;
}

export interface ActionItem {
  description: string;
  owner_role?: string;
  due_date?: string; // ISO 8601
}

/** Program Narrative → NEXUS or APEX */
export interface ProgramNarrativeSchema {
  program_id: string;
  period: string;
  narrative: string;
  key_themes: string[];
  risks_noted: string[];
}

/** Report Commentary → APEX QPR/ABS narrative section */
export interface ReportCommentarySchema {
  report_section:
    | 'executive_summary'
    | 'program_status'
    | 'financial_summary'
    | 'risks_issues'
    | 'outlook';
  program_id: string;
  commentary: string;
  anomalies_addressed: string[];
}

/** VVR Description → FLOWPATH — frozen fields per Integration Brief §9 */
export interface VVRDescriptionSchema {
  step_id: string;
  description: string;
  inputs: string[];
  outputs: string[];
  decision_required: boolean;
  human_role: string;
  decision_type?: HumanDecisionType; // provisional label from framing mode
}

/** Governance Memo → CPMI */
export interface GovernanceMemoSchema {
  subject: string;
  cpmi_reference: string; // CPMI recommendation or gate reference
  decision: string;
  reasoning: string;
  decision_type: HumanDecisionType;
}

/** Rule Change Proposal → ARIA policy-as-data format */
export interface RuleChangeProposalSchema {
  rule_id: string;
  current_rule: string;
  proposed_rule: string;
  justification: string;
  regulatory_source: string;
  effective_date?: string; // ISO 8601
}
