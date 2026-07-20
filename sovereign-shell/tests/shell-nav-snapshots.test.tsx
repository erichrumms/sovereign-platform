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
 */

import { render } from "@testing-library/react";
import type { SovereignRole, ProgramStatusSnapshot } from "../shell-contract";
import type { RegisteredModuleView } from "../src/module-loader";
import { ModuleNav } from "../src/navigation/ModuleNav";
import { PlatformHome } from "../src/PlatformHome";
import { DevPersonaToggle } from "../src/DevPersonaToggle";
import type { SovereignShellContext, VRSGateStatus } from "../shell-contract";

// ---- Canonical module list (matches register-modules.ts + GD-22 role access matrix) ----
// minimumRole arrays sourced directly from each module's index.ts as of July 19, 2026.
// If these diverge from the actual modules, update both here and the matrix.

const ALL_MODULES: RegisteredModuleView[] = [
  {
    moduleId: "module-counsel",
    displayName: "COUNSEL",
    mountPath: "/counsel",
    product: "COUNSEL",
    tier: "standard",
    minimumRole: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER"],
    mounted: false,
  },
  {
    moduleId: "module-scribe",
    displayName: "SCRIBE",
    mountPath: "/scribe",
    product: "SCRIBE",
    tier: "standard",
    minimumRole: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER"],
    mounted: false,
  },
  {
    moduleId: "module-vigil",
    displayName: "VIGIL",
    mountPath: "/vigil",
    product: "VIGIL",
    tier: "standard",
    minimumRole: ["PLATFORM_ADMIN", "SYSTEM_ADMIN"],
    mounted: false,
  },
  {
    moduleId: "module-lens",
    displayName: "LENS",
    mountPath: "/lens",
    product: "LENS",
    tier: "standard",
    minimumRole: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER"],
    mounted: false,
  },
  {
    moduleId: "module-cpmi",
    displayName: "CPMI",
    mountPath: "/cpmi",
    product: "CPMI",
    tier: "enhanced",
    minimumRole: ["PLATFORM_ADMIN", "SYSTEM_ADMIN"],
    mounted: false,
  },
  {
    moduleId: "module-agentos",
    displayName: "AgentOS",
    mountPath: "/agentos",
    product: "AGENTOS",
    tier: "standard",
    minimumRole: ["PLATFORM_ADMIN", "SYSTEM_ADMIN"],
    mounted: false,
  },
  {
    moduleId: "module-nexus",
    displayName: "NEXUS",
    mountPath: "/nexus",
    product: "NEXUS",
    tier: "standard",
    minimumRole: [
      "PLATFORM_ADMIN",
      "SYSTEM_ADMIN",
      "AGENT_OPERATOR",
      "PROGRAM_MANAGER",
      "COMPLIANCE_OFFICER",
    ],
    mounted: false,
  },
  {
    moduleId: "module-apex",
    displayName: "APEX",
    mountPath: "/apex",
    product: "APEX",
    tier: "standard",
    minimumRole: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"],
    mounted: false,
  },
  {
    moduleId: "module-flowpath",
    displayName: "FLOWPATH",
    mountPath: "/flowpath",
    product: "FLOWPATH",
    tier: "standard",
    minimumRole: [
      "PLATFORM_ADMIN",
      "SYSTEM_ADMIN",
      "AGENT_OPERATOR",
      "ANALYST",
      "PROGRAM_MANAGER",
    ],
    mounted: false,
  },
  {
    moduleId: "module-aria",
    displayName: "ARIA Suite",
    mountPath: "/aria",
    product: "ARIA",
    tier: "standard",
    minimumRole: [
      "PLATFORM_ADMIN",
      "SYSTEM_ADMIN",
      "COMPLIANCE_OFFICER",
      "PROGRAM_MANAGER",
      "ANALYST",
    ],
    mounted: false,
  },
];

// Mirrors defaultRoleAccessPolicy: SYSTEM_ADMIN is universal superuser, or role in minimumRole.
function makeIsAccessible(role: SovereignRole) {
  return (m: RegisteredModuleView): boolean =>
    role === "SYSTEM_ADMIN" || m.minimumRole.includes(role);
}

// ---- ModuleNav snapshots — one per role verified live on July 19, 2026 ----
describe("ModuleNav role-access snapshots", () => {
  const noop = (): void => {};
  const ACTIVE_PATH = "/apex"; // arbitrary stable active path for all snapshots

  it("SYSTEM_ADMIN — all 10 modules accessible (universal superuser)", () => {
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

  it("PROGRAM_MANAGER — 7 modules accessible (COUNSEL, SCRIBE, LENS, NEXUS, APEX, FLOWPATH, ARIA)", () => {
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

  it("COMPLIANCE_OFFICER — 2 modules accessible (NEXUS, ARIA)", () => {
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

  it("ANALYST — 3 modules accessible (APEX, FLOWPATH, ARIA)", () => {
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

  it("INDEPENDENT_REVIEWER — 0 modules accessible (all locked)", () => {
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
// Roles under test mirror those live-verified in the role-access session:
// SYSTEM_ADMIN, PROGRAM_MANAGER, COMPLIANCE_OFFICER, ANALYST, INDEPENDENT_REVIEWER.

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
  } as unknown as SovereignShellContext;
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

  it("SYSTEM_ADMIN — sees Program Health, Flagged Programs, all 10 modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "SYSTEM_ADMIN", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("SYSTEM_ADMIN");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("PROGRAM_MANAGER — sees Program Health, Flagged Programs, 7 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "PROGRAM_MANAGER", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("PROGRAM_MANAGER");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("ANALYST — sees Program Health, Flagged Programs, 3 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "ANALYST", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("ANALYST");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("COMPLIANCE_OFFICER — cannot see Program Health/Flagged, sees 2 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "COMPLIANCE_OFFICER", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("COMPLIANCE_OFFICER");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  it("INDEPENDENT_REVIEWER — cannot see Program Health/Flagged, sees 0 accessible modules in orientation", () => {
    const ctx = makePlatformHomeCtx({ role: "INDEPENDENT_REVIEWER", programSnapshots: SAMPLE_PROGRAMS });
    const isAccessible = makeIsAccessible("INDEPENDENT_REVIEWER");
    const { container } = render(
      <PlatformHome ctx={ctx} modules={ALL_MODULES} isAccessible={isAccessible} />
    );
    expect(container).toMatchSnapshot();
  });

  // ---- To Do / Review placeholder visibility (D4) ----
  it("To Do / Review section renders its honest placeholder for all roles — verified via SYSTEM_ADMIN", () => {
    const ctx = makePlatformHomeCtx({ role: "SYSTEM_ADMIN" });
    const { container } = render(<PlatformHome ctx={ctx} />);
    // The placeholder text must be present in the rendered output.
    expect(container.textContent).toContain("WorkQueueSurface");
    expect(container.textContent).toContain("wired in a future session");
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
