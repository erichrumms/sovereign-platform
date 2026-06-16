/**
 * SOVEREIGN Platform — module-counsel
 * types.ts — COUNSEL session types.
 *
 * These are COUNSEL-internal, transient session shapes (spec §3): they live in
 * React component state and are discarded when the session ends. COUNSEL has no
 * store of its own. The canonical, persisted entity is the final DecisionRecord,
 * which conforms to the @sovereign/data Document entity (assembled later).
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import type { HumanDecisionType } from "@sovereign/data";

/**
 * Products / modules that can deep-link into COUNSEL at a decision point
 * (COUNSEL spec §4.1). COUNSEL-local provenance enum — NOT the canonical
 * SovereignProduct.
 *
 * NOTE (flagged for the Integration Brief): the COUNSEL spec writes "AgentOS"
 * (mixed case); the canonical SovereignProduct value is "AGENTOS". This union is
 * kept verbatim to the documented deep-link contract that source products
 * populate (spec §4.2); the casing reconciliation against canonical
 * SovereignProduct is a flagged follow-up, not silently changed here.
 */
export type CounselSourceProduct =
  | "NEXUS"
  | "CPMI"
  | "APEX"
  | "FLOWPATH"
  | "ARIA"
  | "AgentOS"
  | "VIGIL";

export const COUNSEL_SOURCE_PRODUCTS: readonly CounselSourceProduct[] = [
  "NEXUS",
  "CPMI",
  "APEX",
  "FLOWPATH",
  "ARIA",
  "AgentOS",
  "VIGIL",
];

/** The platform context the decision arises in (frozen IL fields preserved). */
export interface SovereignDecisionContext {
  sourceProduct: CounselSourceProduct;
  /** Frozen Intelligence Layer field — never rename. */
  workflowStepId: string;
  /** Canonical Decision Matrix taxonomy (HumanDecisionType from @sovereign/data). */
  decisionType: HumanDecisionType;
}

/**
 * The structured input the user provides before analysis begins (spec §3).
 * Transient — exists in component state only.
 */
export interface DecisionFrame {
  decisionStatement: string;
  stakes: string;
  constraints: string[];
  sovereignContext: SovereignDecisionContext;
}

/**
 * Deep-link payload a SOVEREIGN product / VIGIL passes when routing a user into
 * COUNSEL (spec §4.1). Pre-fills the framing form; the user still confirms before
 * analysis. The VIGIL-specific fields are populated only when sourceProduct ===
 * "VIGIL".
 */
export interface COUNSELInboundContext {
  sourceProduct: CounselSourceProduct;
  workflowStepId: string;
  decisionType: HumanDecisionType;
  suggestedStakes?: string;
  referenceDocumentId?: string;
  alertId?: string; // VIGIL — active alert
  approvalRequestId?: string; // VIGIL — AgentOS approval request
}
