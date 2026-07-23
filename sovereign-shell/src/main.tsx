/**
 * SOVEREIGN Platform — sovereign-shell
 * main.tsx — THE SHELL HOST ENTRY POINT (Option C)
 *
 * This is the runnable host application. It is the only place that:
 *   1. Constructs the platform context via createShell() (the composition root).
 *   2. Constructs the ModuleLoader and registers the product / companion modules.
 *   3. Renders the unified nav chrome (ShellNavChrome) with the governance
 *      indicator in the header slot, and wires module selection to
 *      ModuleLoader.mount(moduleId, outletElement).
 *
 * It adds NOTHING to the SovereignShellContext surface — it consumes the eight
 * frozen exports through the contract. Presentation reads the context; it never
 * re-derives it.
 *
 * STAGE 2 NOTE — synthetic auth:
 *   Upstream auth is EAMS SAML 2.0 SSO. Until that is wired, the host seeds a
 *   synthetic dev user. The active role is selectable via the DevPersonaToggle
 *   (see below) — switching roles triggers a page reload so the shell is
 *   re-created with the new role, which is the only way to change role-gated
 *   module access without a real auth layer. SYSTEM_ADMIN is the default and
 *   admits all modules. GD-22 / D4 (Session 41) expanded the toggle to all 8
 *   SovereignRoles so every access-matrix path from the Role Access Matrix
 *   (SOVEREIGN_Role_Access_Matrix_20260718.md) can be exercised in dev.
 *   All data is SYNTHETIC; the Governance Clock has not activated.
 *
 * Session 40 (DR-1 Tier 1): added DEV_PERSONA_KEY + DevPersonaToggle so a
 * developer can switch between SYSTEM_ADMIN and PROGRAM_MANAGER without touching
 * source. Role change requires a page reload (the SovereignShell is built at
 * module scope with a fixed user — no reactive auth layer exists until EAMS SSO
 * is wired). The toggle is clearly labeled DEV and styled to distinguish it from
 * product UI. No shell-contract change; no new role; no agent registration.
 *
 * Session 41 (GD-22 / D4): expanded DevPersonaToggle from 2 roles to all 8
 * SovereignRoles so every role in the approved access matrix can be exercised
 * without touching source. SYSTEM_ADMIN remains the default (admits all modules).
 *
 * Session 53 (GD-27): the mount/unmount sequence formerly inlined in
 * onSelectModule is generalized into openModule(moduleId, initialState?), and
 * registered with the shell as the ctx.navigateToModule handler
 * (SovereignShell.setNavigateToModuleHandler — the composition root holds the
 * context member; only this host owns the ModuleLoader and outlet element, so
 * the real sequence lives here). The sidebar click path and the ctx-level
 * primitive now run the SAME sequence. The generalized sequence also unmounts
 * whatever module currently owns the outlet before mounting the target —
 * previously nothing unmounted the prior module, which left the registry
 * claiming it was still mounted (and a return to it no-op'd); see the Session
 * 53 handoff findings.
 *
 * Version: 1.3 · Session 53 (GD-27 — navigateToModule host wiring) · July 21, 2026
 */

import { StrictMode, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { CSSProperties } from "react";

import type { SovereignUser, SovereignRole } from "../shell-contract";
import { createShell } from "./shell";
import {
  ModuleLoader,
  defaultRoleAccessPolicy,
  type RegisteredModuleView,
} from "./module-loader";
import { registerPlatformModules } from "./register-modules";
import { publishModuleSurfacesAtStartup } from "./startup-publish";
import { ShellNavChrome } from "./navigation";
import { GovernanceHeaderIndicator, CPMIVRSDashboard } from "./governance";
import { PlatformHome } from "./PlatformHome";
import {
  DevPersonaToggle,
  readDevPersona,
  type DevPersonaRole,
} from "./DevPersonaToggle";

const DEV_PERSONA_NAMES: Record<DevPersonaRole, string> = {
  PLATFORM_ADMIN:       "Dev — Platform Admin",
  SYSTEM_ADMIN:         "Platform Developer",
  PROGRAM_MANAGER:      "Dev — Program Manager",
  ANALYST:              "Dev — Analyst",
  COMPLIANCE_OFFICER:   "Dev — Compliance Officer",
  AGENT_OPERATOR:       "Dev — Agent Operator",
  INDEPENDENT_REVIEWER: "Dev — Independent Reviewer",
  READ_ONLY:            "Dev — Read Only",
};

// ============================================================
// SYNTHETIC DEV USER (Stage 2 — replaced by EAMS SAML 2.0 SSO upstream)
// Role is read from localStorage so DevPersonaToggle survives a page reload.
// ============================================================

const _devPersona = readDevPersona();

const DEV_USER: SovereignUser = {
  employee_id: "dev-0001",
  name: DEV_PERSONA_NAMES[_devPersona],
  org_unit: "SOVEREIGN Platform Engineering",
  role: _devPersona as SovereignRole,
  clearance_level: "CUI",
  cost_code_assignments: [],
};

// ============================================================
// HOST CONSTRUCTION (once, at module scope)
// ============================================================

const shell = createShell({
  user: DEV_USER,
  token: "dev-token-synthetic",
  initialPath: "/",
  onSignOut: () => {
    // eslint-disable-next-line no-alert
    window.alert("signOut() invoked — EAMS SSO logout is wired in a later stage.");
  },
});

const loader = new ModuleLoader(shell);
// Register the product / companion modules that exist on disk this session.
registerPlatformModules(loader);

// WG-1 (Session 54): populate the cross-module surfaces at shell start, so Home
// and the Reviewer's Workspace show real data on a fresh session without any
// module being visited first. Reuses each module's existing publish functions —
// see startup-publish.ts. Module scope: runs once per page load (StrictMode
// double-render does not re-run module scope).
publishModuleSurfacesAtStartup(shell.getContext());

// ============================================================
// APP
// ============================================================

function App(): JSX.Element {
  const ctx = shell.getContext();
  const outletRef = useRef<HTMLDivElement>(null);
  const [, forceRender] = useReducer((c: number) => c + 1, 0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  // D4 (WE-7): show landing until the user picks a module.
  const [hasSelectedModule, setHasSelectedModule] = useState(false);

  const modules = loader.list();
  const isAccessible = useCallback(
    (m: RegisteredModuleView) => defaultRoleAccessPolicy(ctx.auth, m.minimumRole),
    [ctx]
  );

  // GD-27 — THE generalized mount/unmount sequence (formerly inlined in
  // onSelectModule). Both entry points run it: the sidebar click path (no
  // initialState) and ctx.navigateToModule (optionally carrying one).
  const openModule = useCallback((moduleId: string, initialState?: unknown) => {
    setShowDashboard(false);
    setMountError(null);
    setHasSelectedModule(true);
    // The outlet div is rendered by ShellNavChrome; mount after this tick so
    // outletRef.current is present.
    requestAnimationFrame(() => {
      const el = outletRef.current;
      if (!el) return;
      // Preserve the original sidebar semantics: re-selecting the mounted
      // module with no navigation intent is a no-op (its live state survives).
      // With an initialState, a fresh mount is required — that is the only
      // point at which the contract delivers it (mount()'s third parameter).
      if (initialState === undefined && loader.isMounted(moduleId)) return;
      // The generalized unmount step: exactly one module owns the outlet at a
      // time, so whatever is mounted — including the target itself, when a new
      // initialState requires a fresh mount — unmounts first.
      for (const m of loader.list()) {
        if (m.mounted) loader.unmount(m.moduleId);
      }
      loader
        .mount(moduleId, el, initialState)
        .then(() => forceRender())
        .catch((err: unknown) =>
          setMountError(err instanceof Error ? err.message : String(err))
        );
    });
  }, []);

  const onSelectModule = useCallback(
    (m: RegisteredModuleView) => openModule(m.moduleId),
    [openModule]
  );

  // GD-27 — register the host handler for ctx.navigateToModule. The ctx-level
  // primitive runs the SAME generalized sequence as the sidebar; unlike the
  // sidebar path (where the chrome navigates), it must also keep
  // ctx.navigation.currentPath honest itself. Last-write-wins registration, so
  // StrictMode's double-invoked effect re-registers harmlessly.
  useEffect(() => {
    shell.setNavigateToModuleHandler((moduleId, initialState) => {
      const target = loader.list().find((m) => m.moduleId === moduleId);
      if (!target) {
        setMountError(`navigateToModule: module "${moduleId}" is not registered`);
        return;
      }
      shell.getNavigationProvider().navigateTo(target.mountPath);
      openModule(moduleId, initialState);
    });
  }, [openModule]);

  return (
    <>
      <ShellNavChrome
        ctx={ctx}
        modules={modules}
        isAccessible={isAccessible}
        onSelectModule={onSelectModule}
        outletRef={outletRef}
        brand="SOVEREIGN"
        showLanding={!hasSelectedModule}
        landing={<PlatformHome ctx={ctx} modules={modules} isAccessible={isAccessible} />}
        headerSlot={
          <>
            <DevPersonaToggle />
            <GovernanceHeaderIndicator
              governance={ctx.governance}
              onOpenDashboard={() => setShowDashboard((v) => !v)}
            />
          </>
        }
      />

      {modules.length === 0 && !showDashboard ? (
        <div style={emptyNoticeStyle}>
          No modules registered yet. Companion and product modules register here
          as they are built (Stage 2).
        </div>
      ) : null}

      {mountError ? (
        <div style={errorNoticeStyle}>Module mount blocked: {mountError}</div>
      ) : null}

      {showDashboard ? (
        <div style={overlayStyle} role="dialog" aria-label="CPMI-VRS dashboard">
          <div style={overlayPanelStyle}>
            <button style={closeButtonStyle} onClick={() => setShowDashboard(false)}>
              Close
            </button>
            <CPMIVRSDashboard governance={ctx.governance} />
          </div>
        </div>
      ) : null}
    </>
  );
}

// ============================================================
// STYLES (host-local; chrome owns its own theme)
// ============================================================

const emptyNoticeStyle: CSSProperties = {
  position: "fixed",
  bottom: 16,
  left: 240,
  right: 16,
  padding: "10px 14px",
  fontFamily: "system-ui, sans-serif",
  fontSize: 13,
  color: "#475569",
  background: "#f1f5f9",
  border: "1px dashed #cbd5e1",
  borderRadius: 8,
};

const errorNoticeStyle: CSSProperties = {
  position: "fixed",
  top: 64,
  right: 16,
  maxWidth: 420,
  padding: "10px 14px",
  fontFamily: "system-ui, sans-serif",
  fontSize: 13,
  color: "#7f1d1d",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: 32,
  zIndex: 1000,
};

const overlayPanelStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 24,
  width: "min(960px, 100%)",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

const closeButtonStyle: CSSProperties = {
  float: "right",
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 6,
  padding: "4px 12px",
  cursor: "pointer",
  fontSize: 13,
};

// ============================================================
// BOOTSTRAP
// ============================================================

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Shell host: #root element not found in index.html");
}
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
