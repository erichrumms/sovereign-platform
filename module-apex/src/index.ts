/**
 * SOVEREIGN Platform — module-apex
 * APEX — Analytics and Program Executive Suite (primary product, Stage 5a).
 *
 * Pipeline role (spec 13_APEX_Architecture.md §2): immediately after AgentOS, before ARIA.
 * APEX consumes CPMI World Model records, reasoning-chain history, AgentOS task records, and
 * governance decisions — all READ-ONLY — and produces defensible, exportable analytics:
 * MSR/QPR reports, program dossiers (DC-2), portfolio views, and data-provenance drill-down
 * (DC-3). APEX never writes upstream, makes no governance decisions, and calls no LLM directly
 * (createSovereignClient only — Constraint #5).
 *
 * Session 17 SCOPE: scaffold + GD-16 schema + the three screens (Portfolio / Program Detail /
 * Report Generation), the Execution Monitoring stub (PPBE Phase 5), and the two AgentCards.
 *
 * ROLE GATE (platform analytics — conservative, fail-closed): minimumRole "PLATFORM_ADMIN".
 *   APEX surfaces platform-level audit/analysis data "accessible to authorized platform
 *   administrators" (Agent Identity Standard, APEX entries), so access is restricted to
 *   PLATFORM_ADMIN / SYSTEM_ADMIN via the loader's fail-closed default policy, with a
 *   structural mount-gate as defense in depth (same pattern as CPMI / VIGIL). The
 *   authoritative role→module matrix (Decision 24) remains open; this is the least-privilege
 *   default, relaxable by configuration if a broader policy is written.
 *
 * GOVERNANCE: module-apex → APEX is pre-wired in the ModuleLoader MODULE_PRODUCT map. Both
 * agents are registered in Agent_Identity_Standard.md (Constraint #10) and PR-APEX-001 is
 * APPROVED (Constraint #9). GD-10: all APEX program data is UNCLASSIFIED. No Logger event on mount.
 *
 * Version: 1.0 (APEX scaffold) · Session 17 · June 25, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { ApexApp } from "./ApexApp";
import { APEX_AI_ASSISTANT, APEX_REPORT_GENERATOR } from "./apex-contract";

const APEX_MINIMUM_ROLE = "PLATFORM_ADMIN" as const;

// apex.ai-assistant — Analytical, LLM-backed (PR-APEX-001). Advisory only: produces an
// ApexAnalysisOutput; never decides, never writes upstream, never invokes other agents.
const aiAssistantCard: AgentCard = {
  agent_id: APEX_AI_ASSISTANT,
  agent_class: "Analytical",
  product: "APEX",
  capabilities: ["program_analysis", "risk_identification", "report_drafting", "known_answer_benchmark"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "UNCLASSIFIED", // GD-10 — APEX processes UNCLASSIFIED only
  security_observable: true,
};

// apex.report-generator — Operational, NO LLM. Deterministic document assembly; enforces the
// sovereignHold() gate (ctx.governance.isOnHold) and exports only after attestation.
const reportGeneratorCard: AgentCard = {
  agent_id: APEX_REPORT_GENERATOR,
  agent_class: "Operational",
  product: "APEX",
  capabilities: ["document_assembly", "dossier_export"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "UNCLASSIFIED",
  security_observable: true,
};

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const apexModule: SovereignModuleContract = {
  moduleId: "module-apex",
  mountPath: "/apex",
  displayName: "APEX",
  minimumRole: APEX_MINIMUM_ROLE,
  agentCards: [aiAssistantCard, reportGeneratorCard],

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!ctx.auth.hasRole("PLATFORM_ADMIN") && !ctx.auth.hasRole("SYSTEM_ADMIN")) {
      throw new ModuleAccessDeniedError("module-apex", ctx.auth.user.role, APEX_MINIMUM_ROLE);
    }
    root = createRoot(el);
    root.render(createElement(ApexApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // APEX has no live execution yet (Governance Clock OFF). Honest NOT_STARTED.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default apexModule;
