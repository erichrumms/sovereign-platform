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
 * `active_agents` is honestly empty for the primary products: the registered agents
 * to date are all companion-module agents (COUNSEL/SCRIBE/VIGIL/LENS), none mounted
 * inside a primary product. LENS does not fabricate agent activity that does not exist.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
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
    active_agents: [],
  },
  {
    product: "CPMI",
    role_in_pipeline:
      "Governance review. CPMI runs the CPMI-VRS governance gates and produces recommendations; its governance outputs flow to every other product.",
    feeds_into: ["AGENTOS", "NEXUS", "APEX", "ARIA"],
    receives_from: ["FLOWPATH"],
    user_action:
      "Review governance recommendations and gate status. Gate 3 decisions are human-owned.",
    active_agents: [],
  },
  {
    product: "AGENTOS",
    role_in_pipeline:
      "Execution environment. AgentOS orchestrates agent execution and lifecycle and routes Agent-to-Agent (A2A) requests across the platform.",
    feeds_into: ["NEXUS", "APEX"],
    receives_from: ["CPMI"],
    user_action:
      "Agent execution is orchestrated here; human-required authorizations surface in VIGIL's Agent Approval Queue.",
    active_agents: [],
  },
  {
    product: "NEXUS",
    role_in_pipeline:
      "Task management. NEXUS is the highest-volume product — it manages tasks and correspondence across the organization.",
    feeds_into: ["ARIA"],
    receives_from: ["CPMI", "AGENTOS"],
    user_action:
      "Manage tasks and correspondence. Drafts prepared in SCRIBE export into NEXUS task intake.",
    active_agents: [],
  },
  {
    product: "APEX",
    role_in_pipeline:
      "Reporting. APEX generates quarterly and analytical reports; human narrative commentary is the key human contribution.",
    feeds_into: ["ARIA"],
    receives_from: ["CPMI", "AGENTOS"],
    user_action:
      "Generate and review reports. Management commentary drafted in SCRIBE exports into APEX report sections.",
    active_agents: [],
  },
  {
    product: "ARIA",
    role_in_pipeline:
      "Compliance adjudication. ARIA adjudicates authorizations, travel, and timecard compliance; AI is excluded from execution-layer decisions here.",
    feeds_into: [],
    receives_from: ["NEXUS", "APEX"],
    user_action:
      "Adjudicate compliance and maintain rules. Execution-layer decisions are human-only; only rule maintenance accepts drafted proposals.",
    active_agents: [],
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
