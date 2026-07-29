/**
 * SOVEREIGN Platform — module-lens
 * orientation-data.ts — the static Pipeline Navigator knowledge base (spec §2.2 / §3).
 *
 * A static `ProductOrientation` knowledge object for the six primary products, built
 * from the Integration Brief's pipeline description:
 *   FLOWPATH → [Intelligence Layer] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite.
 *
 * ProductOrientation is module-local — NOT a @sovereign/data canonical entity (spec
 * §3): it does not cross product boundaries or require canonical validation. The
 * Pipeline Navigator makes NO LLM call; it renders from this static data (spec §2.2).
 *
 * `active_agents` lists the registered agent_ids for each product, sourced directly
 * from Agent_Identity_Standard.md (authoritative registry, 44 total as of Session 73).
 * Cross-product workflow-layer agents (PPBE, T&T) are attributed to their primary host
 * product. Companion-module agents (COUNSEL/SCRIBE/VIGIL/LENS) are not primary pipeline
 * products and do not appear in PIPELINE_ORDER — they have no orientation entry.
 *
 * WH-44 (Session 73): populated from real registry data; prior version had all arrays
 * empty because it was written before the primary-product agents were registered.
 *
 * Version: 1.1 · Session 73 · July 29, 2026 (WH-44: wire to real agent registry data)
 */

import type { SovereignProduct } from "../../sovereign-shell/shell-contract";

export interface ProductOrientation {
  product: SovereignProduct;
  role_in_pipeline: string;
  feeds_into: SovereignProduct[];
  receives_from: SovereignProduct[];
  user_action: string;
  active_agents: string[];
}

/** The six primary products in pipeline order (companion modules are not in the pipeline). */
export const PIPELINE_ORDER: readonly SovereignProduct[] = [
  "FLOWPATH",
  "CPMI",
  "AGENTOS",
  "NEXUS",
  "APEX",
  "ARIA",
];

export const PRODUCT_ORIENTATIONS: readonly ProductOrientation[] = [
  {
    product: "FLOWPATH",
    role_in_pipeline:
      "Workflow mapping. FLOWPATH captures how work is actually done as verification & validation records (VVRs) — the structured front of the pipeline.",
    feeds_into: ["CPMI"],
    receives_from: [],
    user_action:
      "Map and validate workflow steps into VVRs. Pre-work captured elsewhere arrives here as session context to be encoded.",
    // flowpath.* — 6 agents (Agent_Identity_Standard.md, FLOWPATH section)
    active_agents: [
      "flowpath.coordinator",
      "flowpath.interviewer",
      "flowpath.mapper",
      "flowpath.validator",
      "flowpath.analyzer",
      "flowpath.domain-translator",
    ],
  },
  {
    product: "CPMI",
    role_in_pipeline:
      "Governance review. CPMI runs the CPMI-VRS governance gates and produces recommendations; its governance outputs flow to every other product.",
    feeds_into: ["AGENTOS", "NEXUS", "APEX", "ARIA"],
    receives_from: ["FLOWPATH"],
    user_action:
      "Review governance recommendations and gate status. Gate 3 decisions are human-owned.",
    // cpmi.* — 3 agents (Agent_Identity_Standard.md, CPMI section)
    active_agents: [
      "cpmi.reasoning-chain",
      "cpmi.world-model-api",
      "cpmi.vrs-certification",
    ],
  },
  {
    product: "AGENTOS",
    role_in_pipeline:
      "Execution environment. AgentOS orchestrates agent execution and lifecycle and routes Agent-to-Agent (A2A) requests across the platform.",
    feeds_into: ["NEXUS", "APEX"],
    receives_from: ["CPMI"],
    user_action:
      "Agent execution is orchestrated here; human-required authorizations surface in VIGIL's Agent Approval Queue.",
    // agentos.* — 9 agents: 6 core + 3 orchestration (Agent_Identity_Standard.md, AgentOS sections)
    active_agents: [
      "agentos.orchestrator",
      "agentos.data-agent",
      "agentos.training-agent",
      "agentos.evaluation-agent",
      "agentos.monitoring-agent",
      "agentos.compliance-agent",
      "agentos.deployer",
      "agentos.exporter",
      "agentos.configurator",
    ],
  },
  {
    product: "NEXUS",
    role_in_pipeline:
      "Task management. NEXUS is the highest-volume product — it manages tasks and correspondence across the organization.",
    feeds_into: ["ARIA"],
    receives_from: ["CPMI", "AGENTOS"],
    user_action:
      "Manage tasks and correspondence. Drafts prepared in SCRIBE export into NEXUS task intake.",
    // 2 native nexus agents + PPBE and T&T layer agents whose primary host is NEXUS
    active_agents: [
      "nexus.classification-agent",
      "nexus.routing-agent",
      "ppbe-dependency-tracker",
      "ppbe-coordination-assistant",
      "tt.travel-compliance-engine",
      "tt.travel-router",
      "tt.time-compliance-engine",
    ],
  },
  {
    product: "APEX",
    role_in_pipeline:
      "Reporting. APEX generates quarterly and analytical reports; human narrative commentary is the key human contribution.",
    feeds_into: ["ARIA"],
    receives_from: ["CPMI", "AGENTOS"],
    user_action:
      "Generate and review reports. Management commentary drafted in SCRIBE exports into APEX report sections.",
    // 2 native apex agents + PPBE and T&T layer agents whose primary host is APEX
    active_agents: [
      "apex.ai-assistant",
      "apex.report-generator",
      "ppbe-ledger-monitor",
      "ppbe-evidence-synthesizer",
      "ppbe-scenario-analyst",
      "tt.pattern-analyst",
      "tt.audit-reporter",
    ],
  },
  {
    product: "ARIA",
    role_in_pipeline:
      "Compliance adjudication. ARIA adjudicates authorizations, travel, and timecard compliance; AI is excluded from execution-layer decisions here.",
    feeds_into: [],
    receives_from: ["NEXUS", "APEX"],
    user_action:
      "Adjudicate compliance and maintain rules. Execution-layer decisions are human-only; only rule maintenance accepts drafted proposals.",
    // 1 agent — deterministic rule evaluation only, no LLM (Agent_Identity_Standard.md, ARIA section)
    active_agents: ["aria.rules-engine"],
  },
];

/** Lookup an orientation by product (primary products only). Null for companion modules. */
export function getOrientation(product: SovereignProduct): ProductOrientation | null {
  return PRODUCT_ORIENTATIONS.find((o) => o.product === product) ?? null;
}

/**
 * Derive the product from the shell-provided route (ctx.navigation.currentPath).
 * The frozen shell contract exposes `currentPath` / `breadcrumb` only — there is no
 * `currentProduct` field — so LENS maps the path to a product itself (a configuration
 * concern, not a shell-contract change; Standing Constraints #3 / #7). Returns null
 * for unrecognized or companion-module routes.
 */
export function productFromPath(currentPath: string): SovereignProduct | null {
  const segment = currentPath.replace(/^\/+/, "").split("/")[0]?.toLowerCase() ?? "";
  const map: Record<string, SovereignProduct> = {
    flowpath: "FLOWPATH",
    cpmi: "CPMI",
    agentos: "AGENTOS",
    nexus: "NEXUS",
    apex: "APEX",
    aria: "ARIA",
  };
  return map[segment] ?? null;
}
