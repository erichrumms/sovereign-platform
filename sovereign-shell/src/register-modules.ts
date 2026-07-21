/**
 * SOVEREIGN Platform — sovereign-shell
 * register-modules.ts
 *
 * The single place the host registers product and companion modules with the
 * ModuleLoader. Keeping registration here (rather than inline in main.tsx) means
 * each new module is added in one obvious location, and the loader's contract
 * validation runs at registration time.
 *
 * As of Session 4 the monorepo uses npm workspaces, so the host imports each
 * module by its workspace package name (e.g. "@sovereign/module-counsel") rather
 * than a relative source path. module-counsel imports only TYPES from the shared
 * shell-contract, so the contract coupling remains compile-time only.
 *
 * Version: 1.1 · Session 4 · June 15, 2026
 */

import type { ModuleLoader } from "./module-loader";
import { counselModule } from "@sovereign/module-counsel";
import { scribeModule } from "@sovereign/module-scribe";
import { vigilModule } from "@sovereign/module-vigil";
import { lensModule } from "@sovereign/module-lens";
import { cpmiModule } from "@sovereign/module-cpmi";
import { agentosModule } from "@sovereign/module-agentos";
import { nexusModule } from "@sovereign/module-nexus";
import { apexModule } from "@sovereign/module-apex";
import { flowpathModule } from "@sovereign/module-flowpath";
import { ariaModule } from "@sovereign/module-aria";
import { workspaceModule } from "@sovereign/module-workspace";

export function registerPlatformModules(loader: ModuleLoader): void {
  // COUNSEL — first companion module (GD-5). Core complete (Session 5).
  loader.register(counselModule);
  // SCRIBE — second companion module (GD-5). Drafting engine + Style DNA
  // (Session 6, D1/D2). moduleId/product are pre-wired in the loader's
  // MODULE_PRODUCT map.
  loader.register(scribeModule);
  // VIGIL — fourth companion module (GD-5). Core (Session 7, D1): real role gate
  // (minimumRole PLATFORM_ADMIN → the loader's fail-closed policy admits
  // PLATFORM_ADMIN/SYSTEM_ADMIN only); registers vigil-triage-analyst for the Anomaly
  // Triage Assistant (vigil-approval-agent still deferred).
  loader.register(vigilModule);
  // LENS — third companion module (GD-5), the last to be built. Scaffold (Session 7,
  // D2): READ_ONLY placeholder gate (Decision 24, like COUNSEL/SCRIBE); registers
  // lens-explainer / lens-orientation. LENS core (the explainer grounded in the
  // knowledge-base source docs) is deferred until the LENS architecture spec is
  // authored. moduleId/product are pre-wired in the loader's MODULE_PRODUCT map.
  loader.register(lensModule);
  // CPMI — the platform AI governance engine and the FIRST primary product (Stage 3,
  // Session 11). Real role gate (minimumRole PLATFORM_ADMIN → the loader's fail-closed
  // policy admits PLATFORM_ADMIN/SYSTEM_ADMIN only); registers cpmi.reasoning-chain /
  // cpmi.world-model-api / cpmi.vrs-certification. module-cpmi/CPMI is pre-wired in the
  // loader's MODULE_PRODUCT map.
  loader.register(cpmiModule);
  // AgentOS — the agent orchestration backbone (primary product), scaffold + task lifecycle
  // core (Session 14, D2). Real role gate (minimumRole PLATFORM_ADMIN → fail-closed policy
  // admits PLATFORM_ADMIN/SYSTEM_ADMIN only). agentCards are empty this session — AgentOS
  // orchestrator agents are not yet in Agent_Identity_Standard.md (Constraint #10), so none
  // are self-registered. module-agentos/AGENTOS is pre-wired in the loader's MODULE_PRODUCT map.
  loader.register(agentosModule);
  // NEXUS — the work-request intake + routing surface (primary product), scaffold + request
  // lifecycle core (Session 15, D2). Role gate minimumRole AGENT_OPERATOR (nearest existing
  // role; no OPERATOR in the taxonomy) → fail-closed policy admits AGENT_OPERATOR/SYSTEM_ADMIN.
  // agentCards empty — NEXUS routes work to AgentOS-orchestrated agent classes, registers no
  // agents. module-nexus/NEXUS is pre-wired in the loader's MODULE_PRODUCT map.
  loader.register(nexusModule);
  // APEX — the analytics / reporting product (primary product, Stage 5a), scaffold + the three
  // screens + GD-16 schema (Session 17). Role gate minimumRole PLATFORM_ADMIN → the loader's
  // fail-closed policy admits PLATFORM_ADMIN/SYSTEM_ADMIN only. Registers apex.ai-assistant
  // (Analytical) and apex.report-generator (Operational), both in Agent_Identity_Standard.md
  // (Constraint #10). module-apex/APEX is pre-wired in the loader's MODULE_PRODUCT map.
  loader.register(apexModule);
  // FLOWPATH — the workflow-elicitation product (primary product, Stage 5b), the pipeline entry
  // point. Scaffold + GD-18 schema + Screens 1/2/4 (Session 20). Role gate minimumRole
  // AGENT_OPERATOR → the loader's fail-closed policy admits AGENT_OPERATOR/SYSTEM_ADMIN (program
  // managers and analysts participate in elicitation; no PLATFORM_ADMIN required). Registers all
  // six FLOWPATH agents (all Analytical), in Agent_Identity_Standard.md (Constraint #10).
  // module-flowpath/FLOWPATH is pre-wired in the loader's MODULE_PRODUCT map.
  loader.register(flowpathModule);
  // ARIA Suite — compliance / traceability / regulatory-impact layer (primary product, Stage 6),
  // scaffold (Session 22, D4): AriaApp shell + banners + CLEAR/TRACER/ARC placeholder panels.
  // Role gate minimumRole PLATFORM_ADMIN → the loader's fail-closed policy admits
  // PLATFORM_ADMIN/SYSTEM_ADMIN only. Registers the deterministic aria.rules-engine (Governance),
  // in Agent_Identity_Standard.md (Constraint #10). module-aria/ARIA is pre-wired in the loader's
  // MODULE_PRODUCT map. CLEAR/TRACER/ARC logic arrives in Sessions 23–25.
  loader.register(ariaModule);
  // Reviewer's Workspace — cross-module decision surface (GD-25, Session 50, docs/23).
  // Module gate: the union of every role any of its three sections needs (the ARIA
  // GD-22 pattern) — PLATFORM_ADMIN/SYSTEM_ADMIN/COMPLIANCE_OFFICER/PROGRAM_MANAGER/
  // ANALYST; per-section gating inside WorkspaceApp. Registers no agents (it embeds
  // VIGIL/ARIA/SCRIBE's real decision components; those modules own the agents).
  // module-workspace maps to product WORKSPACE in MODULE_PRODUCT (GD-26, Session 52,
  // docs/24 — the dedicated product member authorized this session).
  loader.register(workspaceModule);
}
