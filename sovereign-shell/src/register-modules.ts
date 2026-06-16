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

export function registerPlatformModules(loader: ModuleLoader): void {
  // COUNSEL — first companion module (GD-5). Core complete (Session 5).
  loader.register(counselModule);
  // SCRIBE — second companion module (GD-5). Scaffold (Session 5); core is a later
  // session. moduleId/product are pre-wired in the loader's MODULE_PRODUCT map.
  loader.register(scribeModule);
}
