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
import type { SovereignRole } from "../shell-contract";
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

function makePlatformHomeCtx(overrides: {
  overall?: "GREEN" | "AMBER" | "RED";
  vrsGates?: VRSGateStatus[];
  pendingGate3?: number;
} = {}): SovereignShellContext {
  const overall = overrides.overall ?? "GREEN";
  const vrsGates = overrides.vrsGates ?? [];
  const pendingGate3 = overrides.pendingGate3 ?? 0;
  return {
    auth: {
      user: {
        employee_id: "E-TEST-001",
        name: "Test Operator",
        org_unit: "Platform",
        role: "SYSTEM_ADMIN",
        clearance_level: "UNCLASSIFIED",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === "SYSTEM_ADMIN",
      hasClearance: () => true,
    },
    governance: {
      cpmiStatus: {
        overall,
        products: [],
        // Pass an invalid date to avoid locale-dependent output in the snapshot.
        last_updated: "invalid-date",
        pending_gate3_reviews: pendingGate3,
      },
      vrsGates,
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

describe("PlatformHome snapshots", () => {
  it("GREEN portfolio, no vrsGates, no pending reviews", () => {
    const ctx = makePlatformHomeCtx();
    const { container } = render(<PlatformHome ctx={ctx} />);
    expect(container).toMatchSnapshot();
  });

  it("AMBER portfolio with mixed gate states and a pending Gate 3 review", () => {
    const vrsGates: VRSGateStatus[] = [
      { product: "NEXUS", gate_state: "GATE_3_PENDING" },
      { product: "APEX", gate_state: "GATE_2_COMPLETE" },
      { product: "CPMI", gate_state: "GATE_4_CERTIFIED" },
      { product: "VIGIL", gate_state: "HOLD", hold_reason: "Pending legal review" },
    ];
    const ctx = makePlatformHomeCtx({ overall: "AMBER", vrsGates, pendingGate3: 1 });
    const { container } = render(<PlatformHome ctx={ctx} />);
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
