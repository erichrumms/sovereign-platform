/**
 * SOVEREIGN Platform — module-flowpath
 * FLOWPATH — Workflow Elicitation and Process Intelligence (primary product, Stage 5b).
 *
 * Pipeline role (spec 15_FLOWPATH_Architecture.md §2): the FIRST position in the pipeline — the
 * entry point. FLOWPATH elicits the real organizational workflow (not the documented ideal) and
 * the individual analyst workstyle, producing machine-readable artifacts (WorkflowArtifact,
 * OrganizationalVocabulary, DataSourceRegistry, ValidationCadenceRecord, AnalystWorkstyleProfile)
 * that the rest of the platform governs and executes. FLOWPATH never executes workflows (AgentOS),
 * never analyzes outputs (APEX), never governs AI reasoning (CPMI), and calls no LLM directly
 * (createSovereignClient only — Constraint #5).
 *
 * ROLE GATE (operator surface — conservative, fail-closed): minimumRole "AGENT_OPERATOR".
 *   Program managers and analysts participate in elicitation; FLOWPATH does not require
 *   PLATFORM_ADMIN (spec §13). The role taxonomy has no "OPERATOR"; AGENT_OPERATOR is the nearest
 *   existing role (no new role invented). The loader's fail-closed default policy then admits
 *   AGENT_OPERATOR or SYSTEM_ADMIN, with a structural mount-gate as defense in depth (same pattern
 *   as NEXUS). The authoritative role→module matrix (Decision 24) remains open; this is the
 *   least-privilege default, relaxable by configuration.
 *
 * GOVERNANCE: module-flowpath → FLOWPATH is pre-wired in the ModuleLoader MODULE_PRODUCT map. All
 * six agents are registered in Agent_Identity_Standard.md (Constraint #10, registered Session 20)
 * and PR-FLOWPATH-001..004 are APPROVED (Constraint #9). GD-10: all FLOWPATH data is UNCLASSIFIED.
 * No Logger event on mount.
 *
 * Version: 1.0 (FLOWPATH scaffold) · Session 20 · June 26, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { FlowpathApp } from "./FlowpathApp";
import {
  FLOWPATH_COORDINATOR,
  FLOWPATH_INTERVIEWER,
  FLOWPATH_MAPPER,
  FLOWPATH_VALIDATOR,
  FLOWPATH_ANALYZER,
  FLOWPATH_DOMAIN_TRANSLATOR,
} from "./flowpath-contract";

const FLOWPATH_MINIMUM_ROLE = "AGENT_OPERATOR" as const;

/**
 * All six FLOWPATH agents are Analytical (Agent_Identity_Standard.md, Session 20). They read,
 * reason, and produce structured assessments; they take no consequential action and make no
 * governance decisions. UNCLASSIFIED ceiling (GD-10). The coordinator, mapper, validator, and
 * domain-translator do not call the LLM for reasoning; the interviewer and analyzer do, always
 * through createSovereignClient().
 */
function flowpathCard(agent_id: string, capabilities: string[]): AgentCard {
  return {
    agent_id,
    agent_class: "Analytical",
    product: "FLOWPATH",
    capabilities,
    input_schema: {},
    output_schema: {},
    task_lifecycle_contract: {
      supports_long_running: false,
      approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
      partial_failure_behavior: "ESCALATE",
    },
    data_classification_ceiling: "UNCLASSIFIED", // GD-10 — FLOWPATH processes UNCLASSIFIED only
    security_observable: true,
  };
}

const agentCards: AgentCard[] = [
  flowpathCard(FLOWPATH_COORDINATOR, ["elicitation_orchestration", "session_state", "session_summaries"]),
  flowpathCard(FLOWPATH_INTERVIEWER, ["organizational_elicitation", "individual_workstyle_elicitation", "vocabulary_capture", "validation_cadence_capture"]),
  flowpathCard(FLOWPATH_MAPPER, ["workflow_artifact_mapping", "data_source_registry", "vocabulary_structuring", "validation_cadence_structuring"]),
  flowpathCard(FLOWPATH_VALIDATOR, ["five_question_gate", "workstyle_boundary_validation"]),
  flowpathCard(FLOWPATH_ANALYZER, ["bottleneck_analysis", "exception_path_analysis", "dependency_risk_analysis"]),
  flowpathCard(FLOWPATH_DOMAIN_TRANSLATOR, ["vocabulary_divergence_review", "terminology_flag_log"]),
];

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const flowpathModule: SovereignModuleContract = {
  moduleId: "module-flowpath",
  mountPath: "/flowpath",
  displayName: "FLOWPATH",
  minimumRole: FLOWPATH_MINIMUM_ROLE,
  agentCards,

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!ctx.auth.hasRole("AGENT_OPERATOR") && !ctx.auth.hasRole("SYSTEM_ADMIN")) {
      throw new ModuleAccessDeniedError("module-flowpath", ctx.auth.user.role, FLOWPATH_MINIMUM_ROLE);
    }
    root = createRoot(el);
    root.render(createElement(FlowpathApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // FLOWPATH has no live execution yet (Governance Clock OFF). Honest NOT_STARTED.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default flowpathModule;
