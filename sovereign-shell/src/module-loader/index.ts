/**
 * SOVEREIGN Platform — sovereign-shell
 * module-loader/index.ts
 *
 * THE MODULE MOUNT/UNMOUNT MACHINERY.
 *
 * Enforces SovereignModuleContract on behalf of the shell. Every product
 * module is registered here and mounted through here — a module never mounts
 * itself. Responsibilities:
 *
 *   1. Contract validation — moduleId / mountPath / minimumRole / agentCards
 *      shape are checked at registration; a malformed module is rejected
 *      before it can mount.
 *   2. minimumRole enforcement — fail-closed access control via an injectable
 *      RoleAccessPolicy (see note below). Denial throws; nothing mounts.
 *   3. agentCards registration — every module's agents are registered with the
 *      shell A2A registry at mount (local bookkeeping; advances a2a._stage to
 *      "CARDS_REGISTERED").
 *   4. healthCheck() polling — the shell governance dashboard (Component #4)
 *      reads these snapshots. Polling wraps each healthCheck in the platform
 *      three-tier fallback (live -> last-cached -> static UNAVAILABLE).
 *
 * ROLE HIERARCHY — GOVERNANCE DECISION REQUIRED:
 *   shell-contract v1.17 / GD-22 declares `minimumRole: SovereignRole[]` on every module.
 *   The default policy here is deliberately fail-closed: access is granted only to
 *   a user whose role appears in the module's minimumRole list, plus SYSTEM_ADMIN as a
 *   universal superuser. This UNDER-grants rather than over-grants. The
 *   authoritative role → module access matrix (SOVEREIGN_Role_Access_Matrix_20260718.md)
 *   is now encoded directly in each module's minimumRole array. Custom RoleAccessPolicy
 *   injection remains supported — no change to this loader required for matrix updates.
 *
 * ACCESS-DENIAL LOGGING — TAXONOMY GAP (flagged, not invented):
 *   No member of the frozen SovereignEventType taxonomy denotes "module access
 *   denied". Logger event types are approved-taxonomy-only, so this loader does
 *   NOT emit a typed Logger event for a denial — it throws
 *   ModuleAccessDeniedError and records an internal audit entry. Adding an
 *   access-control event type (e.g. ARIA's DECISION_BLOCKED_INSUFFICIENT_ROLE)
 *   to the taxonomy is a shell-contract change = governance decision.
 *
 * Version: 1.0
 * Session: 2B — June 2, 2026
 * Authority: Project Principal · SOVEREIGN Platform Governance Authority
 */

import type {
  SovereignModuleContract,
  SovereignShellContext,
  SovereignRole,
  SovereignProduct,
  SovereignTier,
  VRSGateState,
} from "../../shell-contract";
import type { SovereignShell } from "../shell";

// ============================================================
// CANONICAL MODULE -> PRODUCT / TIER MAP
// moduleId is "module-[productname]". Eleven canonical modules exist: the six
// primary products, the four companion suite modules (GD-5, June 13, 2026,
// shell-contract v1.3), and the cross-module Reviewer's Workspace (GD-25,
// July 20, 2026 — see the reconciliation note on its entry). CPMI runs the
// enhanced monitoring tier (0.7x threshold) — architectural, not configurable
// (system_prompt Decision 4); every other module is standard tier.
// ============================================================

const MODULE_PRODUCT: Record<string, SovereignProduct> = {
  // Six primary products
  "module-nexus": "NEXUS",
  "module-cpmi": "CPMI",
  "module-apex": "APEX",
  "module-flowpath": "FLOWPATH",
  "module-agentos": "AGENTOS",
  "module-aria": "ARIA",
  // Four companion suite modules — GD-5
  "module-counsel": "COUNSEL",
  "module-scribe": "SCRIBE",
  "module-lens": "LENS",
  "module-vigil": "VIGIL",
  // Reviewer's Workspace — GD-25 (Session 50, docs/23); product member added GD-26
  // (Session 52, docs/24). Loader bookkeeping only (tier + product on shell
  // health-fallback events; embedded components emit under their own real products).
  "module-workspace": "WORKSPACE",
};

function tierForProduct(product: SovereignProduct): SovereignTier {
  return product === "CPMI" ? "enhanced" : "standard";
}

const VALID_ROLES: ReadonlySet<SovereignRole> = new Set<SovereignRole>([
  "PROGRAM_MANAGER",
  "ANALYST",
  "COMPLIANCE_OFFICER",
  "AGENT_OPERATOR",
  "INDEPENDENT_REVIEWER",
  "SYSTEM_ADMIN",
  "READ_ONLY",
  // GD-5 / shell-contract v1.3 (June 13, 2026) — platform administrator role.
  // Required so a module declaring minimumRole "PLATFORM_ADMIN" (VIGIL) passes
  // contract validation. Without this entry validateContract throws
  // ModuleContractError before mount, defeating VIGIL's mount gate. This aligns
  // the loader's runtime role guard to the approved contract union; it is not a
  // contract change. The fail-closed default policy then admits PLATFORM_ADMIN
  // or SYSTEM_ADMIN only — the intended VIGIL gate.
  "PLATFORM_ADMIN",
]);

const VALID_AGENT_CLASSES: ReadonlySet<string> = new Set([
  "Analytical",
  "Operational",
  "Governance",
  "Monitoring",
  // GD-12 / shell-contract v1.9 (June 24, 2026) — AgentOS orchestrator class. Required so an
  // AgentCard declaring agent_class "Orchestration" (agentos.deployer / .exporter /
  // .configurator) passes contract validation. Synced to shell-contract AgentClass.
  "Orchestration",
]);

const MOUNT_PATH_PATTERN = /^\/[a-z][a-z-]*$/;

// ============================================================
// ACCESS POLICY
// ============================================================

/**
 * Decides whether a user (via the shell auth provider) may mount a module that
 * declares the given minimumRoles list. Injectable so the authoritative governance
 * access matrix can replace the default without touching the loader.
 * GD-22 (v1.17): parameter widened from SovereignRole to SovereignRole[].
 */
export type RoleAccessPolicy = (
  auth: SovereignShellContext["auth"],
  minimumRoles: SovereignRole[]
) => boolean;

/**
 * Fail-closed default: membership in the role list, plus SYSTEM_ADMIN as universal
 * superuser. Grants the minimum; never the benefit of the doubt.
 * GD-22 (v1.17): updated from single-role exact-match to list membership check.
 */
export const defaultRoleAccessPolicy: RoleAccessPolicy = (auth, minimumRoles) =>
  auth.hasRole("SYSTEM_ADMIN") || minimumRoles.some((r) => auth.hasRole(r));

// ============================================================
// ERRORS
// ============================================================

export class ModuleContractError extends Error {
  constructor(message: string) {
    super(`SovereignModuleContract violation: ${message}`);
    this.name = "ModuleContractError";
  }
}

export class ModuleLifecycleError extends Error {
  constructor(message: string) {
    super(`Module lifecycle error: ${message}`);
    this.name = "ModuleLifecycleError";
  }
}

export class ModuleAccessDeniedError extends Error {
  constructor(
    public readonly moduleId: string,
    public readonly userRole: SovereignRole,
    // GD-22 (v1.17): widened from SovereignRole to SovereignRole[].
    public readonly minimumRoles: SovereignRole[]
  ) {
    super(
      `Access to ${moduleId} denied: user role ${userRole} does not satisfy ` +
        `any of [${minimumRoles.join(", ")}] under the active RoleAccessPolicy.`
    );
    this.name = "ModuleAccessDeniedError";
  }
}

// ============================================================
// HEALTH + REGISTRY TYPES
// ============================================================

type RawHealth = Awaited<ReturnType<SovereignModuleContract["healthCheck"]>>;

export interface HealthSnapshot {
  status: RawHealth["status"];
  vrs_gate: VRSGateState;
  degraded_reason?: string;
  /** Provenance of this snapshot in the three-tier fallback chain. */
  source: "live" | "cache" | "static";
  /** Monotonic sequence number for ordering snapshots without a clock. */
  sequence: number;
}

interface RegistryEntry {
  module: SovereignModuleContract;
  product: SovereignProduct;
  tier: SovereignTier;
  mounted: boolean;
  element?: HTMLElement;
  lastHealth?: HealthSnapshot;
}

export interface RegisteredModuleView {
  moduleId: string;
  displayName: string;
  mountPath: string;
  product: SovereignProduct;
  tier: SovereignTier;
  minimumRole: SovereignRole[]; // GD-22 (v1.17): widened to array
  mounted: boolean;
  lastHealth?: HealthSnapshot;
}

export interface MountResult {
  moduleId: string;
  mounted: true;
  agentsRegistered: number;
  registryVersion: string;
}

export interface AccessDenialAudit {
  moduleId: string;
  userRole: SovereignRole;
  minimumRole: SovereignRole[]; // GD-22 (v1.17): widened to array
  sequence: number;
}

export interface ModuleLoaderOptions {
  /** Override the access policy. Defaults to defaultRoleAccessPolicy. */
  policy?: RoleAccessPolicy;
  /** Per-call healthCheck timeout in ms. Default 5000. */
  healthTimeoutMs?: number;
  /** healthCheck polling interval in ms. Default 30000. */
  healthPollIntervalMs?: number;
}

class HealthCheckTimeout extends Error {
  constructor() {
    super("healthCheck timed out");
    this.name = "HealthCheckTimeout";
  }
}

// ============================================================
// MODULE LOADER
// ============================================================

export class ModuleLoader {
  private readonly modules = new Map<string, RegistryEntry>();
  private readonly labels = new Map<string, string>();
  private readonly denials: AccessDenialAudit[] = [];
  private readonly policy: RoleAccessPolicy;
  private readonly healthTimeoutMs: number;
  private readonly healthPollIntervalMs: number;
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private seq = 0;

  constructor(
    private readonly shell: SovereignShell,
    options: ModuleLoaderOptions = {}
  ) {
    this.policy = options.policy ?? defaultRoleAccessPolicy;
    this.healthTimeoutMs = options.healthTimeoutMs ?? 5000;
    this.healthPollIntervalMs = options.healthPollIntervalMs ?? 30000;
  }

  // ---- Registration -------------------------------------------------------

  register(module: SovereignModuleContract): void {
    this.validateContract(module);

    if (this.modules.has(module.moduleId)) {
      throw new ModuleContractError(`duplicate moduleId "${module.moduleId}"`);
    }
    for (const entry of this.modules.values()) {
      if (entry.module.mountPath === module.mountPath) {
        throw new ModuleContractError(
          `mountPath "${module.mountPath}" already registered to ${entry.module.moduleId}`
        );
      }
    }

    const product = MODULE_PRODUCT[module.moduleId];
    this.modules.set(module.moduleId, {
      module,
      product,
      tier: tierForProduct(product),
      mounted: false,
    });

    // Register the breadcrumb label for this module's path segment, then
    // (re)install the resolver so navigation renders displayName.
    this.labels.set(stripLeadingSlash(module.mountPath), module.displayName);
    this.installLabelResolver();
  }

  private validateContract(module: SovereignModuleContract): void {
    if (!(module.moduleId in MODULE_PRODUCT)) {
      throw new ModuleContractError(
        `moduleId "${module.moduleId}" is not one of the eleven canonical modules ` +
          `(primary: module-nexus|cpmi|apex|flowpath|agentos|aria; ` +
          `companion: module-counsel|scribe|lens|vigil; ` +
          `cross-module: module-workspace [GD-25])`
      );
    }
    if (!MOUNT_PATH_PATTERN.test(module.mountPath)) {
      throw new ModuleContractError(
        `mountPath "${module.mountPath}" must match ${MOUNT_PATH_PATTERN}`
      );
    }
    if (!module.displayName || module.displayName.trim() === "") {
      throw new ModuleContractError(`${module.moduleId} has empty displayName`);
    }
    // GD-22 (v1.17): minimumRole is now SovereignRole[]. Validate non-empty array, all members known.
    if (!Array.isArray(module.minimumRole) || module.minimumRole.length === 0) {
      throw new ModuleContractError(
        `${module.moduleId} minimumRole must be a non-empty SovereignRole array`
      );
    }
    for (const role of module.minimumRole) {
      if (!VALID_ROLES.has(role)) {
        throw new ModuleContractError(
          `${module.moduleId} declares unknown role "${role}" in minimumRole`
        );
      }
    }
    if (!Array.isArray(module.agentCards)) {
      throw new ModuleContractError(`${module.moduleId} agentCards must be an array`);
    }
    const product = MODULE_PRODUCT[module.moduleId];
    for (const card of module.agentCards) {
      if (!card.agent_id || card.agent_id.trim() === "") {
        throw new ModuleContractError(
          `${module.moduleId} has an agentCard with empty agent_id`
        );
      }
      if (!VALID_AGENT_CLASSES.has(card.agent_class)) {
        throw new ModuleContractError(
          `${module.moduleId} agentCard ${card.agent_id} has invalid agent_class "${card.agent_class}"`
        );
      }
      if (card.product !== product) {
        // Not fatal — AgentOS legitimately hosts platform-level agents — but
        // visible, since a stray product is usually a copy-paste error.
        // eslint-disable-next-line no-console
        console.warn(
          `[ModuleLoader] ${module.moduleId} agentCard ${card.agent_id} declares ` +
            `product ${card.product} but module is ${product}.`
        );
      }
    }
    for (const fn of ["mount", "unmount", "healthCheck"] as const) {
      if (typeof module[fn] !== "function") {
        throw new ModuleContractError(`${module.moduleId} is missing ${fn}()`);
      }
    }
  }

  // ---- Mount / Unmount ----------------------------------------------------

  async mount(moduleId: string, el: HTMLElement): Promise<MountResult> {
    const entry = this.requireEntry(moduleId);
    if (entry.mounted) {
      throw new ModuleLifecycleError(
        `${moduleId} is already mounted — unmount before remounting`
      );
    }

    const ctx = this.shell.getContext();

    // Fail-closed access control.
    if (!this.policy(ctx.auth, entry.module.minimumRole)) {
      this.denials.push({
        moduleId,
        userRole: ctx.auth.user.role,
        minimumRole: entry.module.minimumRole,
        sequence: ++this.seq,
      });
      throw new ModuleAccessDeniedError(
        moduleId,
        ctx.auth.user.role,
        entry.module.minimumRole
      );
    }

    // Register the module's agents (local A2A bookkeeping).
    let agentsRegistered = 0;
    let registryVersion = "a2a-registry-v0";
    for (const card of entry.module.agentCards) {
      const res = await ctx.a2a.registerAgent(card);
      if (res.registered) agentsRegistered += 1;
      registryVersion = res.registry_version;
    }

    // Hand the module its context and DOM host.
    entry.module.mount(ctx, el);
    entry.mounted = true;
    entry.element = el;

    return { moduleId, mounted: true, agentsRegistered, registryVersion };
  }

  unmount(moduleId: string): void {
    const entry = this.requireEntry(moduleId);
    if (!entry.mounted) return; // idempotent
    entry.module.unmount();
    entry.mounted = false;
    entry.element = undefined;
    // agentCards remain registered: shell-contract v1.0 A2A has no deregister;
    // the registry is last-write-wins and the task lifecycle is Stage 2.
  }

  // ---- Health polling -----------------------------------------------------

  startHealthPolling(intervalMs?: number): void {
    if (this.pollHandle !== null) return; // already polling
    const interval = intervalMs ?? this.healthPollIntervalMs;
    this.pollHandle = setInterval(() => {
      // Fire-and-forget; pollAll never rejects.
      void this.pollAll();
    }, interval);
  }

  stopHealthPolling(): void {
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  /** Poll every mounted module once. Resolves after all snapshots update. */
  async pollAll(): Promise<HealthSnapshot[]> {
    const mounted = [...this.modules.values()].filter((e) => e.mounted);
    return Promise.all(mounted.map((entry) => this.pollModule(entry)));
  }

  /** Poll one module by id (must be registered). */
  async pollOne(moduleId: string): Promise<HealthSnapshot> {
    return this.pollModule(this.requireEntry(moduleId));
  }

  getHealth(moduleId: string): HealthSnapshot | undefined {
    return this.requireEntry(moduleId).lastHealth;
  }

  private async pollModule(entry: RegistryEntry): Promise<HealthSnapshot> {
    try {
      const raw = await this.raceTimeout(entry.module.healthCheck());
      const snap: HealthSnapshot = {
        status: raw.status,
        vrs_gate: raw.vrs_gate,
        degraded_reason: raw.degraded_reason,
        source: "live",
        sequence: ++this.seq,
      };
      entry.lastHealth = snap;
      return snap;
    } catch (err) {
      const reason =
        err instanceof HealthCheckTimeout
          ? "healthCheck timed out"
          : `healthCheck threw: ${err instanceof Error ? err.message : String(err)}`;

      // Three-tier fallback is a platform standard — record the degradation.
      this.shell.getContext().logger.log({
        event_type: "FALLBACK_ACTIVATED",
        workflow_step_id: `shell-healthcheck-${entry.module.moduleId}-step-1`,
        sovereign_tier: entry.tier,
        product: entry.product,
        actor_id: "sovereign-shell",
        outcome: "module_health_unavailable",
        payload: {
          tier: entry.lastHealth ? "cache" : "static",
          reason,
          module_id: entry.module.moduleId,
        },
      });

      // Tier 2: last good snapshot, if any.
      if (entry.lastHealth && entry.lastHealth.status !== "UNAVAILABLE") {
        const cached: HealthSnapshot = {
          ...entry.lastHealth,
          source: "cache",
          degraded_reason: reason,
          sequence: ++this.seq,
        };
        entry.lastHealth = cached;
        return cached;
      }

      // Tier 3: static UNAVAILABLE.
      const stat: HealthSnapshot = {
        status: "UNAVAILABLE",
        vrs_gate: "NOT_STARTED",
        degraded_reason: reason,
        source: "static",
        sequence: ++this.seq,
      };
      entry.lastHealth = stat;
      return stat;
    }
  }

  private raceTimeout(p: Promise<RawHealth>): Promise<RawHealth> {
    return Promise.race([
      p,
      new Promise<RawHealth>((_resolve, reject) =>
        setTimeout(() => reject(new HealthCheckTimeout()), this.healthTimeoutMs)
      ),
    ]);
  }

  // ---- Views --------------------------------------------------------------

  list(): RegisteredModuleView[] {
    return [...this.modules.values()].map((entry) => ({
      moduleId: entry.module.moduleId,
      displayName: entry.module.displayName,
      mountPath: entry.module.mountPath,
      product: entry.product,
      tier: entry.tier,
      minimumRole: entry.module.minimumRole,
      mounted: entry.mounted,
      lastHealth: entry.lastHealth,
    }));
  }

  isMounted(moduleId: string): boolean {
    return this.modules.get(moduleId)?.mounted ?? false;
  }

  getDenialAudit(): readonly AccessDenialAudit[] {
    return this.denials;
  }

  // ---- Internals ----------------------------------------------------------

  private requireEntry(moduleId: string): RegistryEntry {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new ModuleLifecycleError(`module "${moduleId}" is not registered`);
    }
    return entry;
  }

  private installLabelResolver(): void {
    const labels = this.labels;
    this.shell.getNavigationProvider().setLabelResolver((segment) => {
      return labels.get(segment) ?? titleCase(segment);
    });
  }
}

// ============================================================
// HELPERS
// ============================================================

function stripLeadingSlash(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

function titleCase(segment: string): string {
  return segment
    .split("-")
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}
