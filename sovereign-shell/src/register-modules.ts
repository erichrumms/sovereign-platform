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
}
