/**
 * SOVEREIGN Platform — sovereign-shell
 * shell.ts
 *
 * THE COMPOSITION ROOT.
 *
 * This file constructs and wires the complete SovereignShellContext —
 * the single object the shell exports to every product module. It is the
 * headless data/context layer of the host application. The presentation
 * layers built later in Session 2B (navigation chrome, governance
 * dashboard) READ from this context; they do not re-implement it.
 *
 *   shell.ts            ← THIS FILE — context data: auth, logger, governance,
 *                          navigation state, protocol stubs (mcp/a2a/agui)
 *   module-loader/      ← mount/unmount machinery, agentCards registration,
 *                          minimumRole enforcement, healthCheck polling
 *   navigation/         ← React nav chrome reading ctx.navigation
 *   governance/         ← React CPMI-VRS dashboard placeholder reading ctx.governance
 *
 * CONTRACT FIDELITY (governance):
 *   The shape of SovereignShellContext is frozen by shell-contract.ts (Decision 18 —
 *   originally "the shell provides eight exports ... this is the complete list").
 *   GD-19 (shell-contract v1.14, Session 22) formally relaxed Standing Constraint #7
 *   from eight to nine exports, adding `taskSurface` — the shared cross-product task
 *   surface. GD-20 (shell-contract v1.15, Session 23) further relaxed it from nine to
 *   ten, adding `aria` — the ARIA Suite CLEAR certification surface. This file implements
 *   exactly those TEN and adds nothing further to the context surface. In particular it
 *   exposes NO LLM client on the context:
 *   per the Section 6 standing constraint, modules obtain LLM access by
 *   calling createSovereignClient() from @sovereign/api-client themselves —
 *   the shell does not proxy it. The api-client is therefore not imported
 *   here; that is a deliberate, contract-faithful choice, not an omission.
 *
 * STAGE 1 SCOPE:
 *   - auth, logger, governance, navigation are fully wired against synthetic
 *     data (Governance Clock has not activated; all data is SYNTHETIC).
 *   - The three protocol boundaries (mcp, a2a, agui) are reserved at
 *     _stage "DEFINED". Their action methods throw ProtocolNotImplementedError
 *     (stub-with-stable-signature pattern). The one exception is
 *     a2a.registerAgent / listAgents: agentCards registration is a LOCAL
 *     bookkeeping operation (no external call) that the module loader needs at
 *     mount, so it is implemented now and advances a2a._stage to
 *     "CARDS_REGISTERED". The A2A task lifecycle itself remains Stage 2.
 *
 * Version: 1.0
 * Session: 2B — June 2, 2026
 * Authority: Project Principal · SOVEREIGN Platform Governance Authority
 */

import type {
  SovereignShellContext,
  SovereignUser,
  SovereignRole,
  ClearanceLevel,
  SovereignProduct,
  SovereignLogEvent,
  VRSGateStatus,
  CPMIPortfolioStatus,
  SovereignMCPInterface,
  MCPToolEndpoint,
  MCPCallResult,
  SovereignA2AInterface,
  AgentCard,
  A2ATask,
  SovereignAGUIInterface,
  AGUIEvent,
  AGUISubscription,
  TaskSurface,
  SharedTask,
  AriaCertificationSurface,
  AriaCertification,
  ProgramStatusSurface,
  ProgramStatusSnapshot,
} from "../shell-contract";

// Canonical shared data package (Session 4 — npm workspace linkage). Value
// import: at runtime this namespace carries the entity validators, the canonical
// enum constants, and SOVEREIGN_DATA_VERSION. Entity TYPES are compile-time only
// (erased); modules import those from "@sovereign/data" directly.
import * as SovereignData from "@sovereign/data";

// ============================================================
// CLEARANCE ORDERING
// UNCLASSIFIED < CUI < SECRET < TOP_SECRET.
// hasClearance(level) is satisfied when the user's clearance rank is at
// least the requested level's rank. This is the only role/clearance check
// in the platform with a defined hierarchy — see ShellAuth.hasRole below
// for why role checks are exact-match.
// ============================================================

const CLEARANCE_RANK: Record<ClearanceLevel, number> = {
  UNCLASSIFIED: 0,
  CUI: 1,
  SECRET: 2,
  TOP_SECRET: 3,
};

const ALL_PRODUCTS: SovereignProduct[] = [
  "NEXUS",
  "CPMI",
  "APEX",
  "FLOWPATH",
  "AGENTOS",
  "ARIA",
];

// ============================================================
// ERRORS
// ============================================================

/**
 * Thrown when a module invokes a protocol boundary that is reserved but not
 * yet implemented. MCP, A2A (task lifecycle), and AG-UI are Stage 2
 * deliverables (Decision 20). Their signatures are stable now; their bodies
 * activate in Stage 2 with no call-site rewrites.
 */
export class ProtocolNotImplementedError extends Error {
  constructor(
    public readonly protocol: "MCP" | "A2A" | "AG-UI",
    public readonly operation: string
  ) {
    super(
      `${protocol}.${operation}() is a reserved protocol boundary (shell-contract v1.0, ` +
        `_stage "DEFINED"). Implementation is a Stage 2 deliverable. No module may ` +
        `implement protocol connections at the product level (Decision 20).`
    );
    this.name = "ProtocolNotImplementedError";
  }
}

/**
 * Thrown by the shell Logger when an event violates a platform invariant
 * that is "no exceptions" per the system prompt (e.g. a missing
 * workflow_step_id). Validation happens at the shell boundary so no malformed
 * event ever reaches the Security Framework sink.
 */
export class ShellLoggerValidationError extends Error {
  constructor(message: string) {
    super(`SovereignLogger rejected event: ${message}`);
    this.name = "ShellLoggerValidationError";
  }
}

// ============================================================
// LOGGER SINK (Stage 2 boundary — stub-with-stable-signature)
// The local append-only buffer is the source of truth in Stage 1, mirroring
// sovereign_logger.py's append-only JSONL. A remote sink is injected in
// Stage 2 by setting SOVEREIGN_LOGGER_ENDPOINT in sovereign_config.yaml
// (null until then — Decision 21). Wiring it requires no call-site changes.
// ============================================================

export interface ShellLoggerSink {
  /** Persist one validated, append-only log entry to the remote sink. */
  write: (entry: SovereignLogEvent) => Promise<void>;
}

// ============================================================
// AUTH
// Implements SovereignShellContext["auth"].
// ============================================================

class ShellAuth {
  constructor(
    public readonly user: SovereignUser,
    public readonly token: string,
    private readonly onSignOut: () => void
  ) {}

  signOut = (): void => {
    this.onSignOut();
  };

  /**
   * Exact-match role check. A SovereignUser holds exactly one role, and the
   * seven roles have no natural total order (PROGRAM_MANAGER, ANALYST,
   * COMPLIANCE_OFFICER, AGENT_OPERATOR, INDEPENDENT_REVIEWER, SYSTEM_ADMIN,
   * READ_ONLY). Inventing a hierarchy here would be policy the contract does
   * not authorize. How module `minimumRole` maps onto this is a module-loader
   * concern and is resolved in that component (Component #2), not here.
   */
  hasRole = (role: SovereignRole): boolean => {
    return this.user.role === role;
  };

  /** Hierarchical clearance check — see CLEARANCE_RANK. */
  hasClearance = (level: ClearanceLevel): boolean => {
    return CLEARANCE_RANK[this.user.clearance_level] >= CLEARANCE_RANK[level];
  };
}

// ============================================================
// LOGGER
// Implements SovereignShellContext["logger"].
// Routes every module's events to the Security Framework. Validates the
// platform invariants, appends to the local source-of-truth buffer, then
// fire-and-forgets to the remote sink (if configured) with three-tier
// fallback. logger.log is synchronous void per the contract, so the remote
// write cannot be awaited by the caller — the local append is the durable
// tier and the remote dispatch self-heals.
// ============================================================

class ShellLogger {
  private readonly buffer: SovereignLogEvent[] = [];

  constructor(private readonly remoteSink?: ShellLoggerSink) {}

  log = (event: SovereignLogEvent): void => {
    this.validate(event);
    // Tier 2/3 source of truth: append-only, synchronous, never fails.
    this.buffer.push(event);
    // Tier 1: best-effort remote dispatch. Failures fall back to the local
    // buffer (already written) and self-report via FALLBACK_ACTIVATED.
    if (this.remoteSink) {
      this.dispatchRemote(event);
    }
  };

  /** Read-only view of the append-only buffer (governance dashboard / tests). */
  getEntries = (): readonly SovereignLogEvent[] => {
    return this.buffer;
  };

  private validate(event: SovereignLogEvent): void {
    // INVARIANT — no exceptions (system_prompt.md): workflow_step_id required.
    if (!event.workflow_step_id || event.workflow_step_id.trim() === "") {
      throw new ShellLoggerValidationError(
        `workflow_step_id is required on every event (event_type=${event.event_type})`
      );
    }

    // HUMAN_DECISION events carry the Intelligence Layer's Judgment Detection
    // ground truth — decision_type / actor / actor_name are mandatory.
    if (event.event_type === "HUMAN_DECISION") {
      if (!event.decision_type) {
        throw new ShellLoggerValidationError(
          "HUMAN_DECISION events require decision_type from the approved taxonomy"
        );
      }
      if (event.actor !== "human") {
        throw new ShellLoggerValidationError(
          `HUMAN_DECISION events require actor="human" (got ${String(event.actor)})`
        );
      }
      if (!event.actor_name || event.actor_name.trim() === "") {
        throw new ShellLoggerValidationError(
          "HUMAN_DECISION events require actor_name (Full Name)"
        );
      }
    }

    // Agent Identity Standard: agent_id required on agent step boundaries.
    if (
      event.event_type === "AGENT_STEP_START" ||
      event.event_type === "AGENT_STEP_COMPLETE"
    ) {
      if (!event.agent_id || event.agent_id.trim() === "") {
        throw new ShellLoggerValidationError(
          `${event.event_type} events require agent_id (Agent Identity Standard)`
        );
      }
    }

    // Intelligence Layer Automatability Scorer consumes deployment_feedback on
    // every AGENT_STEP_COMPLETE. The contract types it optional, but the
    // frozen IL exposure table requires it. We warn rather than reject so a
    // non-AgentOS emitter is not hard-blocked, while the gap stays visible.
    if (
      event.event_type === "AGENT_STEP_COMPLETE" &&
      event.deployment_feedback === undefined
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `[SovereignLogger] AGENT_STEP_COMPLETE missing deployment_feedback ` +
          `(workflow_step_id=${event.workflow_step_id}) — Intelligence Layer ` +
          `Automatability Scorer exposure incomplete.`
      );
    }
  }

  private dispatchRemote(entry: SovereignLogEvent): void {
    // remoteSink is guaranteed defined by the caller's guard.
    this.remoteSink!.write(entry).catch((err: unknown) => {
      // Three-tier fallback: the entry is already durable in the local buffer
      // (the cache tier). Record the degradation as a first-class event.
      const fallback: SovereignLogEvent = {
        event_type: "FALLBACK_ACTIVATED",
        workflow_step_id: entry.workflow_step_id,
        sovereign_tier: entry.sovereign_tier,
        product: entry.product,
        actor_id: "sovereign-shell",
        outcome: "logger_remote_sink_unavailable",
        payload: {
          tier: "cache",
          reason: "logger_remote_sink_failure",
          original_event_type: entry.event_type,
          error: err instanceof Error ? err.message : String(err),
        },
      };
      // Local-only: do NOT re-dispatch the fallback record remotely (the sink
      // is down) — that would loop. The buffer remains the durable record.
      this.buffer.push(fallback);
    });
  }
}

// ============================================================
// GOVERNANCE
// Implements SovereignShellContext["governance"].
// Holds the CPMI-VRS portfolio snapshot. In Stage 1 the snapshot is synthetic
// and static (the Governance Clock has not activated). When CPMI's world model
// REST API connects (Stage 3), the snapshot source swaps to live queries with
// no change to this interface — the APEX sovereignHold() pattern generalized.
// ============================================================

class ShellGovernance {
  constructor(
    public cpmiStatus: CPMIPortfolioStatus,
    public vrsGates: VRSGateStatus[]
  ) {}

  /** True when the named product's VRS gate is in the HOLD state. */
  isOnHold = (product: SovereignProduct): boolean => {
    const gate = this.vrsGates.find((g) => g.product === product);
    return gate?.gate_state === "HOLD";
  };
}

/**
 * Default synthetic governance snapshot: all six products NOT_STARTED, nothing
 * certified, portfolio GREEN, no pending reviews. Honest about pre-activation
 * state — last_updated reads "PENDING_GOVERNANCE_CLOCK" rather than a
 * fabricated timestamp.
 */
function defaultGovernanceSnapshot(): {
  cpmiStatus: CPMIPortfolioStatus;
  vrsGates: VRSGateStatus[];
} {
  const vrsGates: VRSGateStatus[] = ALL_PRODUCTS.map((product) => ({
    product,
    gate_state: "NOT_STARTED",
    last_certified: null,
  }));
  const cpmiStatus: CPMIPortfolioStatus = {
    overall: "GREEN",
    products: vrsGates,
    last_updated: "PENDING_GOVERNANCE_CLOCK",
    pending_gate3_reviews: 0,
  };
  return { cpmiStatus, vrsGates };
}

// ============================================================
// NAVIGATION
// Implements SovereignShellContext["navigation"].
// Holds the current route and derived breadcrumb. The nav chrome (Component
// #3) renders from this state; navigateTo notifies an optional host callback
// so the React shell can re-render. The label resolver lets the module loader
// supply human-readable breadcrumb labels (e.g. displayName) without this
// component knowing module specifics.
// ============================================================

class ShellNavigation {
  currentPath: string;
  breadcrumb: Array<{ label: string; path: string }>;

  constructor(
    initialPath: string,
    private readonly onChange?: (path: string) => void,
    private labelResolver: (segment: string, path: string) => string = (s) =>
      titleCase(s)
  ) {
    this.currentPath = normalizePath(initialPath);
    this.breadcrumb = this.computeBreadcrumb(this.currentPath);
  }

  navigateTo = (path: string): void => {
    this.currentPath = normalizePath(path);
    this.breadcrumb = this.computeBreadcrumb(this.currentPath);
    this.onChange?.(this.currentPath);
  };

  /** Allow the module loader to register richer labels (e.g. module displayName). */
  setLabelResolver = (
    resolver: (segment: string, path: string) => string
  ): void => {
    this.labelResolver = resolver;
    this.breadcrumb = this.computeBreadcrumb(this.currentPath);
  };

  private computeBreadcrumb(
    path: string
  ): Array<{ label: string; path: string }> {
    const crumbs: Array<{ label: string; path: string }> = [
      { label: "Home", path: "/" },
    ];
    const segments = path.split("/").filter((s) => s.length > 0);
    let cumulative = "";
    for (const segment of segments) {
      cumulative += `/${segment}`;
      crumbs.push({
        label: this.labelResolver(segment, cumulative),
        path: cumulative,
      });
    }
    return crumbs;
  }
}

function normalizePath(path: string): string {
  if (!path || path.trim() === "") return "/";
  const trimmed = path.trim();
  const withLead = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  // Collapse trailing slash except for root.
  return withLead.length > 1 && withLead.endsWith("/")
    ? withLead.slice(0, -1)
    : withLead;
}

function titleCase(segment: string): string {
  return segment
    .split("-")
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

// ============================================================
// PROTOCOL BOUNDARY — MCP (Stage 2)
// Reserved. call() throws; listEndpoints returns the empty set until the
// manifest is built in Stage 2.
// ============================================================

class ShellMCP implements SovereignMCPInterface {
  readonly manifestVersion = "0.0.0-DEFINED";
  _stage: "DEFINED" | "IMPLEMENTED" = "DEFINED";

  call = async <T>(): Promise<MCPCallResult<T>> => {
    throw new ProtocolNotImplementedError("MCP", "call");
  };

  listEndpoints = (_product: SovereignProduct): MCPToolEndpoint[] => {
    return [];
  };
}

// ============================================================
// PROTOCOL BOUNDARY — A2A (Stage 2 task lifecycle; Stage 1 card registration)
// registerAgent / listAgents are LOCAL bookkeeping and are live now (the
// module loader registers each module's agentCards at mount). The task
// lifecycle (invokeAgent / getTaskState) is Stage 2 and throws.
// Registration advances _stage DEFINED -> CARDS_REGISTERED.
// ============================================================

class ShellA2A implements SovereignA2AInterface {
  private readonly registry: Map<string, AgentCard> = new Map();
  _stage: "DEFINED" | "CARDS_REGISTERED" | "IMPLEMENTED" = "DEFINED";

  registerAgent = async (
    card: AgentCard
  ): Promise<{ registered: boolean; registry_version: string }> => {
    // Last-write-wins by agent_id, mirroring the Security Framework honeytoken
    // registry semantics.
    this.registry.set(card.agent_id, card);
    if (this._stage === "DEFINED") {
      this._stage = "CARDS_REGISTERED";
    }
    return {
      registered: true,
      registry_version: `a2a-registry-v${this.registry.size}`,
    };
  };

  invokeAgent = async (): Promise<A2ATask> => {
    throw new ProtocolNotImplementedError("A2A", "invokeAgent");
  };

  getTaskState = async (): Promise<A2ATask> => {
    throw new ProtocolNotImplementedError("A2A", "getTaskState");
  };

  listAgents = (): AgentCard[] => {
    return Array.from(this.registry.values());
  };
}

// ============================================================
// PROTOCOL BOUNDARY — AG-UI (Stage 2)
// emit / subscribe are inert no-ops in Stage 1 so a module emitting reasoning
// events during render does not crash, but nothing is dispatched. humanAction
// throws — a human action must be a real, recorded event, never silently
// dropped, so it is hard-gated until Stage 2.
// ============================================================

class ShellAGUI implements SovereignAGUIInterface {
  readonly taxonomyVersion = "1.0-DEFINED";
  _stage: "DEFINED" | "TAXONOMY_COMPLETE" | "IMPLEMENTED" = "DEFINED";
  private emittedCount = 0;
  private warnedEmit = false;

  emit = (_event: Omit<AGUIEvent, "event_id" | "timestamp" | "sequence">): void => {
    this.emittedCount += 1;
    if (!this.warnedEmit) {
      this.warnedEmit = true;
      // eslint-disable-next-line no-console
      console.warn(
        "[SovereignAGUI] emit() is inert until Stage 2 (event bus not built). " +
          "Events are counted but not dispatched."
      );
    }
  };

  subscribe = (
    _subscription: AGUISubscription,
    _handler: (event: AGUIEvent) => void
  ): (() => void) => {
    // No event source yet; return a no-op unsubscribe.
    return () => {};
  };

  humanAction = (): void => {
    throw new ProtocolNotImplementedError("AG-UI", "humanAction");
  };
}

// ============================================================
// TASK SURFACE — the ninth export (GD-19, shell-contract v1.14)
// A shell-owned, in-memory registry of cross-product SharedTasks. It carries no
// governance authority of its own (Constraint #1): publishing a task does not log,
// approve, or route it — the publishing product still emits its own governed Logger
// events. The surface only makes a published task visible to other products. State
// lives for the lifetime of the shell context (one platform session), mirroring the
// other in-memory Stage-1 providers. subscribe() lets a module re-render when the set
// changes (e.g. AgentOS's Task Registry refreshing as NEXUS routes work in).
// ============================================================

class ShellTaskSurface implements TaskSurface {
  private readonly tasks: Map<string, SharedTask> = new Map();
  private readonly listeners: Set<(tasks: readonly SharedTask[]) => void> = new Set();

  publish = (task: SharedTask): void => {
    // Last-write-wins by task_id (mirrors the A2A registry semantics).
    this.tasks.set(task.task_id, task);
    this.notify();
  };

  update = (task_id: string, patch: Partial<Omit<SharedTask, "task_id">>): void => {
    const existing = this.tasks.get(task_id);
    if (!existing) return; // no-op for an unknown id (never invents a task)
    this.tasks.set(task_id, { ...existing, ...patch, task_id });
    this.notify();
  };

  list = (): readonly SharedTask[] => Array.from(this.tasks.values());

  get = (task_id: string): SharedTask | undefined => this.tasks.get(task_id);

  subscribe = (listener: (tasks: readonly SharedTask[]) => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    const snapshot = this.list();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

// ============================================================
// ARIA CLEAR CERTIFICATION SURFACE — the tenth export (GD-20, shell-contract v1.15)
// A shell-owned, in-memory record of CLEAR certification decisions. module-aria's
// Certification Queue records a decision here (record()); module-scribe's export gate
// reads isCertified() before opening export. It carries no governance authority of its
// own (Constraint #1): recording a certification does not log, approve, or route —
// the Certification Queue still emits its own governed ARIA_CERTIFICATION_ISSUED /
// ARIA_VIOLATION_FLAGGED Logger event. The surface only makes a certification visible
// across products. Last-write-wins by document_id (mirrors the task-surface semantics):
// a re-certification or a flag replaces the prior decision for that document. State lives
// for the lifetime of the shell context (one platform session). subscribe() lets the
// Compliance Dashboard re-render as decisions are recorded.
// ============================================================

class ShellAriaSurface implements AriaCertificationSurface {
  private readonly certs: Map<string, AriaCertification> = new Map();
  private readonly listeners: Set<(certs: readonly AriaCertification[]) => void> = new Set();

  record = (certification: AriaCertification): void => {
    // Last-write-wins by document_id: a later flag/cert supersedes the prior decision.
    this.certs.set(certification.document_id, certification);
    this.notify();
  };

  isCertified = (document_id: string): boolean => {
    return this.certs.get(document_id)?.certified === true;
  };

  get = (document_id: string): AriaCertification | undefined => this.certs.get(document_id);

  list = (): readonly AriaCertification[] => Array.from(this.certs.values());

  subscribe = (listener: (certs: readonly AriaCertification[]) => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    const snapshot = this.list();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

// ============================================================
// PROGRAM STATUS SURFACE — the eleventh export (GD-23, shell-contract v1.18)
// A shell-owned, in-memory record of per-program obligation status snapshots.
// APEX publishes via publish() on data load; VIGIL reads via get() in the
// ppbe_obligation approval brief case. Carries no governance authority of its
// own (Constraint #1): publishing a snapshot does not log, approve, or route
// anything — APEX still emits its own governed Logger events. The surface only
// makes obligation status visible to other products. Mirrors ShellAriaSurface
// exactly: last-write-wins by program_id, same notify-on-change subscribe
// pattern, state lives for the lifetime of one platform session.
// ============================================================

class ShellProgramStatusSurface implements ProgramStatusSurface {
  private readonly statuses: Map<string, ProgramStatusSnapshot> = new Map();
  private readonly listeners: Set<(statuses: readonly ProgramStatusSnapshot[]) => void> = new Set();

  publish = (status: ProgramStatusSnapshot): void => {
    // Last-write-wins by program_id: a later publish supersedes the prior snapshot.
    this.statuses.set(status.program_id, status);
    this.notify();
  };

  get = (program_id: string): ProgramStatusSnapshot | undefined => this.statuses.get(program_id);

  list = (): readonly ProgramStatusSnapshot[] => Array.from(this.statuses.values());

  subscribe = (listener: (statuses: readonly ProgramStatusSnapshot[]) => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    const snapshot = this.list();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

// ============================================================
// SHELL CONFIG
// ============================================================

export interface ShellConfig {
  /** Authenticated platform user (from EAMS SAML 2.0 SSO upstream). */
  user: SovereignUser;
  /** Bearer token for module backend API calls. */
  token: string;
  /** Initial route. Defaults to "/". */
  initialPath?: string;
  /** Invoked on auth.signOut(). Defaults to a no-op. */
  onSignOut?: () => void;
  /**
   * Remote Security Framework sink. Omit in Stage 1 (SOVEREIGN_LOGGER_ENDPOINT
   * is null until Stage 2). When present, events dispatch with three-tier
   * fallback to the local buffer.
   */
  loggerSink?: ShellLoggerSink;
  /**
   * Synthetic governance seed. Omit to use the default all-NOT_STARTED
   * snapshot (Governance Clock not activated).
   */
  governanceSnapshot?: {
    cpmiStatus: CPMIPortfolioStatus;
    vrsGates: VRSGateStatus[];
  };
  /** Notified on navigation changes so the host React app can re-render. */
  onNavigate?: (path: string) => void;
}

// ============================================================
// THE SHELL — implements SovereignShellContext
// ============================================================

export class SovereignShell implements SovereignShellContext {
  readonly auth: SovereignShellContext["auth"];
  readonly logger: SovereignShellContext["logger"];
  readonly governance: SovereignShellContext["governance"];
  readonly data: SovereignShellContext["data"];
  readonly navigation: SovereignShellContext["navigation"];
  readonly mcp: SovereignMCPInterface;
  readonly a2a: SovereignA2AInterface;
  readonly agui: SovereignAGUIInterface;
  readonly taskSurface: TaskSurface;
  readonly aria: AriaCertificationSurface;
  readonly programStatusSurface: ProgramStatusSurface;

  /** Concrete sub-providers, retained for the shell host and module loader. */
  private readonly authProvider: ShellAuth;
  private readonly loggerProvider: ShellLogger;
  private readonly governanceProvider: ShellGovernance;
  private readonly navigationProvider: ShellNavigation;

  constructor(config: ShellConfig) {
    const snapshot = config.governanceSnapshot ?? defaultGovernanceSnapshot();

    this.authProvider = new ShellAuth(
      config.user,
      config.token,
      config.onSignOut ?? (() => {})
    );
    this.loggerProvider = new ShellLogger(config.loggerSink);
    this.governanceProvider = new ShellGovernance(
      snapshot.cpmiStatus,
      snapshot.vrsGates
    );
    this.navigationProvider = new ShellNavigation(
      config.initialPath ?? "/",
      config.onNavigate
    );

    // The class IS the context. Each property is the corresponding provider,
    // structurally satisfying the frozen shell-contract shape.
    this.auth = this.authProvider;
    this.logger = this.loggerProvider;
    this.governance = this.governanceProvider;
    this.navigation = this.navigationProvider;
    this.data = {
      // WIRED (Session 4): ctx.data.types is the canonical @sovereign/data
      // package surface — the npm workspace linkage established this session
      // closes Session 3 open items #1/#2. Runtime surface: the entity
      // validators (validateEmployee/Program/CostCode/Document/Vendor/
      // validateStyleProfile), the canonical enum constants (SOVEREIGN_ROLES,
      // CLEARANCE_LEVELS), and SOVEREIGN_DATA_VERSION. Entity TS types are
      // compile-time only and erased at runtime; modules import those from
      // "@sovereign/data" directly. Frozen field names remain law (shell-contract
      // §10 / Brief §10). The contract surface stays `unknown` (Decision 18); the
      // concrete value is frozen so no module can mutate the shared data surface.
      types: Object.freeze({ ...SovereignData }),
    };
    this.mcp = new ShellMCP();
    this.a2a = new ShellA2A();
    this.agui = new ShellAGUI();
    // Ninth export (GD-19, v1.14) — the shared cross-product task surface.
    this.taskSurface = new ShellTaskSurface();
    // Tenth export (GD-20, v1.15) — the ARIA Suite CLEAR certification surface.
    this.aria = new ShellAriaSurface();
    // Eleventh export (GD-23, v1.18) — the per-program obligation status surface.
    this.programStatusSurface = new ShellProgramStatusSurface();
  }

  /**
   * The SovereignShellContext handed to each module at mount. Returns `this`
   * (the class implements the contract) typed down to exactly the contract
   * surface so modules cannot reach the concrete providers.
   */
  getContext(): SovereignShellContext {
    return this;
  }

  /** Internal accessors for the module loader and shell host (not on the contract). */
  getLoggerProvider(): ShellLogger {
    return this.loggerProvider;
  }
  getNavigationProvider(): ShellNavigation {
    return this.navigationProvider;
  }
  getGovernanceProvider(): ShellGovernance {
    return this.governanceProvider;
  }
}

/**
 * Factory — the single entry point the shell host (index.tsx, built later)
 * uses to construct the platform context.
 */
export function createShell(config: ShellConfig): SovereignShell {
  return new SovereignShell(config);
}

/** Package version — increment on any breaking change to the shell host API. */
export const SOVEREIGN_SHELL_VERSION = "1.0.0";
