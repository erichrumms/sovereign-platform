/**
 * module-scribe — component-test helpers.
 * A minimal fake SovereignShellContext (the fields the SCRIBE UI reads: auth.user,
 * logger.log, navigation.navigateTo) cast to the contract type. Tests may inject a
 * logger and a navigateTo spy to assert Gate 2 emission and export routing.
 */
import { validateStyleProfile } from "@sovereign/data";
import type {
  SovereignShellContext,
  SovereignLogEvent,
  SovereignRole,
  AriaCertification,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  log?: (event: SovereignLogEvent) => void;
  navigateTo?: (path: string) => void;
  /** Document ids to pre-seed as CLEAR-certified on the ctx.aria surface (GD-20 export gate). */
  certifiedDocumentIds?: string[];
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  // Minimal in-memory CLEAR certification surface (ctx.aria — tenth shell export, GD-20),
  // pre-seeded with any certified document ids the test supplies.
  const certs = new Map<string, AriaCertification>();
  for (const id of over.certifiedDocumentIds ?? []) {
    certs.set(id, {
      document_id: id,
      certified: true,
      certifying_actor_id: "E-900",
      certifying_actor_name: "Robin Compliance",
      decision_note: "Certified for test fixture.",
      applicable_sources: [],
      workflow_step_id: `aria-clear-${id}`,
      certified_at: "2026-06-29T00:00:00.000Z",
    });
  }
  const aria = {
    record: (c: AriaCertification) => { certs.set(c.document_id, c); },
    isCertified: (id: string) => certs.get(id)?.certified === true,
    get: (id: string) => certs.get(id),
    list: () => Array.from(certs.values()),
    subscribe: () => () => {},
  };

  return {
    aria,
    auth: {
      user: {
        employee_id: "E-700",
        name: "Sam Author",
        org_unit: "Program Office",
        role: over.role ?? "PROGRAM_MANAGER",
        clearance_level: "CUI",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: () => true,
      hasClearance: () => true,
    },
    logger: { log: over.log ?? (() => {}) },
    navigation: {
      navigateTo: over.navigateTo ?? (() => {}),
      currentPath: "/scribe",
      breadcrumb: [],
    },
    // Mirrors the shell's frozen ctx.data.types validator catalog (shell.ts) — so
    // Style DNA can validate the StyleProfile "via ctx.data" under test.
    data: { types: { validateStyleProfile } },
  } as unknown as SovereignShellContext;
}
