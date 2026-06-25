/**
 * SOVEREIGN Platform — module-nexus
 * request-router.ts — work-request type → agent class + approval requirement (pure).
 *
 * The routing table (opening prompt / 12_NEXUS_Architecture.md):
 *   DOCUMENT_REVIEW    → Analytical  · no approval
 *   DATA_ANALYSIS      → Analytical  · no approval
 *   COMPLIANCE_CHECK   → Governance  · requires approval
 *   REPORT_GENERATION  → Operational · no approval
 *   GOVERNANCE_QUERY   → Governance  · requires approval
 *
 * agent_class reuses the shell contract's AgentClass taxonomy (Standing Constraint #2).
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import type { AgentClass } from "../../sovereign-shell/shell-contract";
import type { WorkRequestType } from "./nexus-contract";

export interface RoutingDecision {
  agent_class: AgentClass;
  requires_approval: boolean;
}

const ROUTING_TABLE: Readonly<Record<WorkRequestType, RoutingDecision>> = {
  DOCUMENT_REVIEW: { agent_class: "Analytical", requires_approval: false },
  DATA_ANALYSIS: { agent_class: "Analytical", requires_approval: false },
  COMPLIANCE_CHECK: { agent_class: "Governance", requires_approval: true },
  REPORT_GENERATION: { agent_class: "Operational", requires_approval: false },
  GOVERNANCE_QUERY: { agent_class: "Governance", requires_approval: true },
};

/** Route a work-request type to its agent class and approval requirement. */
export function routeRequest(type: WorkRequestType): RoutingDecision {
  return ROUTING_TABLE[type];
}

/** The full routing table (read-only) — for the UI and tests. */
export function routingTable(): Readonly<Record<WorkRequestType, RoutingDecision>> {
  return ROUTING_TABLE;
}
