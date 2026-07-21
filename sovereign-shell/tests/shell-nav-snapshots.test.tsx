/** @jest-environment jsdom */
/**
 * Convention for sovereign-shell snapshot tests (Session 45, D3):
 *
 * LOCATION: sovereign-shell/tests/ — tests live next to source, mirroring
 *   every other workspace in this monorepo.
 *
 * ENVIRONMENT: @jest-environment jsdom — this docblock must appear at the
 *   very top of every file that renders components. The workspace Jest config
 *   defaults to "node"; the per-file override is required.
 *
 * PURPOSE: these snapshots capture the currently-verified-correct rendered
 *   output of shell chrome components. A snapshot failure means the rendered
 *   output changed — which may be intentional (run `jest --updateSnapshot`
 *   to accept the change) or a silent regression. Never run --updateSnapshot
 *   reflexively when a snapshot fails — investigate first.
 *
 * SCOPE: sovereign-shell components only. APEX, SCRIBE, and other module
 *   snapshot tests belong with those modules' redesign sessions.
 *
 * WHY THESE COMPONENTS: ModuleNav, PlatformHome, and DevPersonaToggle were
 *   live-verified correct on July 19, 2026 against all five roles exercised
 *   in the role-access verification session. This file protects that
 *   verified state from silent future regression.
 *
 * SESSION 47 FIX: ALL_MODULES is now derived from the live ModuleLoader
 *   (createShell + ModuleLoader + registerPlatformModules) instead of being
 *   hand-copied. This eliminates the source of drift found in the Session 47
 *   review: the hand-copied fixture had stale minimumRole arrays for
 *   module-counsel (missing ANALYST, COMPLIANCE_OFFICER, INDEPENDENT_REVIEWER),
 *   module-scribe (missing ANALYST), and module-lens (missing ANALYST,
 *   COMPLIANCE_OFFICER, AGENT_OPERATOR, INDEPENDENT_REVIEWER, READ_ONLY).
 *   Corrected counts: ANALYST=6, COMPLIANCE_OFFICER=4, INDEPENDENT_REVIEWER=2
 *   (was 3, 2, 0 respectively in the stale fixture).
 */

import { render } from "@testing-library/react";
import type {
  SovereignRole,
  SovereignUser,
  ProgramStatusSnapshot,
  SovereignShellContext,
  VRSGateStatus,
  WorkQueueSurface,
  WorkQueueSummary,
} from "../shell-contract";
import { ModuleLoader } from "../src/module-loader";
import type { RegisteredModuleView } from "../src/module-loader";
import { createShell } from "../src/shell";
import { registerPlatformModules } from "../src/register-modules";
import { ModuleNav } from "../src/navigation/ModuleNav";
import { PlatformHome } from "../src/PlatformHome";
import { DevPersonaToggle } from "../src/DevPersonaToggle";

// ---- Live module fixture — derived from the real loader, never hand-copied ----
// Using the same path as main.tsx (createShell → ModuleLoader → registerPlatformModules)
// means a minimumRole change in any module's index.ts is automatically reflected here.

const _testUser: SovereignUser = {
  employee_id: "test-0001",
  name: "Test User",
  org_unit: "Platform Test",
  role: "SYSTEM_ADMIN",
  clearance_level: "UNCLASSIFIED",
  cost_code_assignments: [],
};
const _testShell = createShell({ user: _testUser, token: "test-token" });
const _testLoader = new ModuleLoader(_testShell);
registerPlatformModules(_testLoader);
const ALL_MODULES: RegisteredModuleView[] = _testLoader.list();

// Mirrors defaultRoleAccessPolicy: SYSTEM_ADMIN is universal superuser, or role in minimumRole.
function makeIsAccessible(role: SovereignRole) {
  return (m: RegisteredModuleView): boolean =>
    role === "SYSTEM_ADMIN" || m.minimumRole.includes(role);
}

// ---- ModuleNav snapshots — one per role verified live on July 19, 2026 ----
// Counts are derived from the real minimumRole arrays via makeIsAccessible above.
// Corrected from the stale hand-copied fixture (Session 47 fix):
//   ANALYST:              3 → 6 (COUNSEL, SCRIBE, LENS, APEX, FLOWPATH, ARIA)
//   COMPLIANCE_OFFICER:   2 → 4 (COUNSEL, LENS, NEXUS, ARIA)
//   INDEPENDENT_REVIEWER: 0 → 2 (COUNSEL, LENS)
describe("ModuleNav role-access snapshots", () => {
  const noop = (): void => {};
  const ACTIVE_PATH = "/apex"; // arbitrary stable active path for all snapshots

  it("SYSTEM_ADMIN — all 11 modules accessible (universal superuser)", () => {
    const isAccessible = makeIsAccessible("SYSTEM_ADMIN");
    const { container } = render(
      <ModuleNav
        modules={ALL_MODULES}
        activeMountPath={ACTIVE_PATH}
        isAccessible={isAccessible}
        onSelect={noop}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("PROGRAM_MANAGER — 8 modules accessible (COUNSEL, SCRIBE, LENS, NEXUS, APEX, FLOWPATH, ARIA, WORKSPACE)", () => {
    const isAccessible = makeIsAccessible("PROGRAM_MANAGER");
    const { container } = render(
      <ModuleNav
        modules={ALL_MODULES}
        activeMountPath={ACTIVE_PATH}
        isAccessible={isAccessible}
        onSelect={noop}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("COMPLIANCE_OFFICER — 5 modules accessible (COUNSEL, LENS, NEXUS, ARIA, WORKSPACE)", () => {
    const isAccessible = makeIsAccessible("COMPLIANCE_OFFICER");
    const { container } = render(
      <ModuleNav
        modules={ALL_MODULES}
        activeMountPath={ACTIVE_PATH}
        isAccessible={isAccessible}
        onSelect={noop}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("ANALYST — 7 modules accessible (COUNSEL, SCRIBE, LENS, APEX, FLOWPATH, ARIA, WORKSPACE)", () => {
    const isAccessible = makeIsAccessible("ANALYST");
    const { container } = render(
      <ModuleNav
        modules={ALL_MODULES}
        activeMountPath={ACTIVE_PATH}
        isAccessible={isAccessible}
        onSelect={noop}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("INDEPENDENT_REVIEWER — 2 modules accessible (COUNSEL, LENS)", () => {
    const isAccessible = makeIsAccessible("INDEPENDENT_REVIEWER");
    const { container } = render(
      <ModuleNav
        modules={ALL_MODULES}
        activeMountPath={ACTIVE_PATH}
        isAccessible={isAccessible}
        onSelect={noop}
      />
    );
    expect(container).toMatchSnapshot();
  });
});

// ---- PlatformHome snapshot ----
// Session 47: updated to include programStatusSurface (required by the new
// Phase 1 layout) and five role-specific tests verifying D1/D2/D3 visibility.
// Session 47 fix: module orientation counts corrected via live ALL_MODULES derivation.

function makePlatformHomeCtx(overrides: {
  role?: SovereignRole;
  programSnapshots?: ProgramStatusSnapshot[];
  overall?: "GREEN" | "AMBER" | "RED";
  vrsGates?: VRSGateStatus[];
  pendingGate3?: number;
} = {}): SovereignShellContext {
  const role: SovereignRole = overrides.role ?? "SYSTEM_ADMIN";
  const programSnapshots = overrides.programSnapshots ?? [];
  const overall = overrides.overall ?? "GREEN";
  const vrsGates = overrides.vrsGates ?? [];
  const pendingGate3 = overrides.pendingGate3 ?? 0;
  return {
    auth: {
      user: {
        employee_id: "E-TEST-001",
        name: "Test Operator",
        org_unit: "Platform",
        role,
        clearance_level: "UNCLASSIFIED",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === role,
      hasClearance: () => true,
    },
    governance: {
      cpmiStatus: {
        overall,
        products: [],
        last_updated: "invalid-date",
        pending_gate3_reviews: pendingGate3,
      },
      vrsGates,
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/", breadcrumb: [] },
    programStatusSurface: {
      publish: () => {},
      get: () => undefined,
      list: () => programSnapshots as readonly ProgramStatusSnapshot[],
      subscribe: () => () => {},
    },
    workQueueSurface: makeNoopWorkQueueSurface(),
  } as unknown as SovereignShellContext;
}

function makeNoopWorkQueueSurface(): WorkQueueSurface {
  const queues = new Map<string, WorkQueueSummary>();
  const listeners = new Set<(s: readonly WorkQueueSummary[]) => void>();
  const snapshot = (): readonly WorkQueueSummary[] => Array.from(queues.values());
  const notify = (): void => { for (const l of listeners) l(snapshot()); };
  return {
    publish: (s) => { queues.set(`${s.module_id}::${s.queue_label}`, s); notify(); },
    listForModule: (id) => snapshot().filter(s => s.module_id === id),
    list: () => snapshot(),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

/** Sample program snapshots for data-populated tests. */
const SAMPLE_PROGRAMS: ProgramStatusSnapshot[] = [
  { program_id: "P-2025-001", percent_obligated: 82, status: "on_track",  narrative: "On track.", updated_at: "2026-07-20" },
  { program_id: "P-2025-002", percent_obligated: 67, status: "at_risk",   narrative: "At risk.",  updated_at: "2026-07-20" },
  { program_id: "P-2025-003", percent_obligated: 41, status: "off_track", narrative: "Off track.", updated_at: "2026-07-20" },
];

describe("PlatformHome snapshots", () => {
  // ---- Basic layout tests ----
  it("empty state — no programs, no modules (SYSTEM_ADMIN)", () => {
    const ctx = makePlatformHomeCtx({ role: "SYSTEM_ADMIN" });
    const { container } = render(<PlatformHome ctx={ctx} />);
    expect(container).toMatchSnapshot();
  });

  it("with program data — 3 programs including at_risk and off_track (SYSTEM_ADMIN)", () => {
    const ctx = makePlatformHomeCtx({ role: "SYSTEM_ADMIN", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("SYSTEM_ADMIN");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  // ---- Role-visibility tests (D1/D2/D3) — five roles live-tested this session ----
  // Module orientation counts use corrected values from the live loader (Session 47 fix).

  it("SYSTEM_ADMIN — sees Program Health, Flagged Programs, all 11 modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "SYSTEM_ADMIN", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("SYSTEM_ADMIN");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("PROGRAM_MANAGER — sees Program Health, Flagged Programs, 8 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "PROGRAM_MANAGER", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("PROGRAM_MANAGER");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("ANALYST — sees Program Health, Flagged Programs, 7 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "ANALYST", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("ANALYST");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("COMPLIANCE_OFFICER — cannot see Program Health/Flagged, sees 5 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "COMPLIANCE_OFFICER", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("COMPLIANCE_OFFICER");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("INDEPENDENT_REVIEWER — cannot see Program Health/Flagged, sees 2 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "INDEPENDENT_REVIEWER", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("INDEPENDENT_REVIEWER");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  // ---- To Do / Review — WorkQueueSurface (GD-24, Session 49) ----
  // The placeholder was replaced by real WorkQueueSurface tiles. With no modules
  // having published yet (empty surface), the section shows the empty-state message.
  it("To Do / Review section shows empty state when no modules have published (GD-24)", () => {
    const ctx = makePlatformHomeCtx({ role: "SYSTEM_ADMIN" });
    const { container } = render(<PlatformHome ctx={ctx} />);
    expect(container.textContent).toContain("No pending reviews");
    expect(container.textContent).not.toContain("wired in a future session");
    expect(container).toMatchSnapshot();
  });
});

// ---- DevPersonaToggle snapshot ----
describe("DevPersonaToggle snapshots", () => {
  it("renders with SYSTEM_ADMIN as the default (empty localStorage)", () => {
    // localStorage starts empty in jsdom — readDevPersona() returns "SYSTEM_ADMIN".
    const { container } = render(<DevPersonaToggle />);
    expect(container).toMatchSnapshot();
  });
});
