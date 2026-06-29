/**
 * module-aria — component-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT always-true)
 * so the ARIA PLATFORM_ADMIN gate is genuinely exercised. The default user is a PLATFORM_ADMIN —
 * ARIA's minimumRole (docs/16 §9). CLEAR (S23) reads and writes ctx.aria (the tenth shell export,
 * GD-20), so this helper provides a real in-memory AriaCertificationSurface. The partial ctx is
 * cast through `unknown` like the other module helpers.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  AriaCertification,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  name?: string;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
}

/** A real in-memory ctx.aria surface (mirrors ShellAriaSurface) so CLEAR can be exercised under test. */
export function makeAriaSurface() {
  const certs = new Map<string, AriaCertification>();
  const listeners = new Set<(c: readonly AriaCertification[]) => void>();
  const snapshot = () => Array.from(certs.values());
  const notify = () => listeners.forEach((l) => l(snapshot()));
  return {
    record: (c: AriaCertification) => { certs.set(c.document_id, c); notify(); },
    isCertified: (id: string) => certs.get(id)?.certified === true,
    get: (id: string) => certs.get(id),
    list: () => snapshot(),
    subscribe: (l: (c: readonly AriaCertification[]) => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "PLATFORM_ADMIN";
  return {
    aria: makeAriaSurface(),
    auth: {
      user: {
        employee_id: "E-900",
        name: over.name ?? "Robin Compliance",
        org_unit: "Compliance Office",
        role,
        clearance_level: "UNCLASSIFIED",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === role,
      hasClearance: () => true,
    },
    logger: {
      log: (event: SovereignLogEvent) => {
        over.logSink?.push(event);
      },
    },
    governance: {
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-29T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/aria", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}
