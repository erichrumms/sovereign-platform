/**
 * SOVEREIGN Platform — sovereign-shell
 * navigation/ShellNavChrome.tsx
 *
 * THE PLATFORM NAV CHROME — the unified frame every module renders inside
 * (Option C: one shell, six modules, one user experience).
 *
 * Layout:
 *   ┌─ header ─────────────────────────────────────────────┐
 *   │ brand · breadcrumb            headerSlot · user/signOut│
 *   ├─ aside (ModuleNav) ─┬─ main (module outlet) ──────────┤
 *   │ module list         │ <div ref={outletRef}>           │
 *   └─────────────────────┴─────────────────────────────────┘
 *
 * This component owns CHROME only. It does not mount modules — the host wires
 * onSelectModule to ModuleLoader.mount(moduleId, outletRef.current). The
 * `headerSlot` is where the governance dashboard (Component #4) renders the
 * CPMI-VRS status indicator and any isOnHold() banner — the contract export
 * stays the single source; this is presentation.
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

import { useCallback } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";
import type { SovereignShellContext } from "../../shell-contract";
import type { RegisteredModuleView } from "../module-loader";
import { SOVEREIGN_THEME as T, MODULE_OUTLET_BG } from "./theme";
import { Breadcrumb } from "./Breadcrumb";
import { ModuleNav } from "./ModuleNav";
import { useNavigationState } from "./useNavigationState";

export interface ShellNavChromeProps {
  ctx: SovereignShellContext;
  /** Registered modules, from ModuleLoader.list(). */
  modules: RegisteredModuleView[];
  /** Whether the user may access a module — mirror the loader's RoleAccessPolicy. */
  isAccessible?: (m: RegisteredModuleView) => boolean;
  /** Host handler: mount the chosen module into the outlet. */
  onSelectModule: (m: RegisteredModuleView) => void;
  /** The module mount target. Host passes loader.mount(id, el). */
  outletRef: Ref<HTMLDivElement>;
  /** Header injection point — governance indicator / hold banner (Component #4). */
  headerSlot?: ReactNode;
  /** Hide (rather than lock) modules the user cannot access. Default: false. */
  hideInaccessible?: boolean;
  brand?: string;
  /**
   * D4 (WE-7): landing page content rendered in the outlet area when no module
   * is mounted. Shown only when `showLanding` is true. The outletRef div remains
   * in the DOM (hidden) so ModuleLoader.mount() can target it when the user picks
   * a module; the landing disappears once `showLanding` is set to false by the host.
   */
  landing?: ReactNode;
  /** True when the landing should be shown (host tracks hasSelectedModule). */
  showLanding?: boolean;
}

export function ShellNavChrome(props: ShellNavChromeProps): JSX.Element {
  const {
    ctx,
    modules,
    onSelectModule,
    outletRef,
    headerSlot,
    hideInaccessible,
    brand = "SOVEREIGN",
    landing,
    showLanding = false,
  } = props;
  const isAccessible = props.isAccessible ?? (() => true);

  const { breadcrumb, currentPath, navigate } = useNavigationState(ctx);

  // Active module = first path segment (e.g. "/nexus/tasks" -> "/nexus").
  const firstSegment = currentPath.split("/").filter(Boolean)[0];
  const activeMountPath = firstSegment ? `/${firstSegment}` : undefined;

  const handleSelect = useCallback(
    (m: RegisteredModuleView) => {
      navigate(m.mountPath);
      onSelectModule(m);
    },
    [navigate, onSelectModule]
  );

  return (
    <div style={rootStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontFamily: T.font.sans,
              fontWeight: 700,
              letterSpacing: 1,
              color: T.text.primary,
              borderLeft: `3px solid ${T.identity}`,
              paddingLeft: 10,
            }}
          >
            {brand}
          </span>
          <Breadcrumb trail={breadcrumb} onNavigate={navigate} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {headerSlot}
          <div style={{ textAlign: "right", fontFamily: T.font.sans }}>
            <div style={{ color: T.text.primary, fontSize: 13 }}>
              {ctx.auth.user.name}
            </div>
            <div style={{ color: T.text.muted, fontSize: 11 }}>
              {ctx.auth.user.role} · {ctx.auth.user.clearance_level}
            </div>
          </div>
          <button
            type="button"
            onClick={() => ctx.auth.signOut()}
            style={signOutStyle}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside style={asideStyle}>
          <ModuleNav
            modules={modules}
            activeMountPath={activeMountPath}
            isAccessible={isAccessible}
            hideInaccessible={hideInaccessible}
            onSelect={handleSelect}
          />
        </aside>
        <main style={mainStyle}>
          {/* Module outlet — always in the DOM so loader.mount() can target it; hidden during landing. */}
          <div ref={outletRef} style={{ height: "100%", width: "100%", display: showLanding ? "none" : "block" }} />
          {/* D4 (WE-7): landing page shown until the user selects a module. */}
          {showLanding && landing ? (
            <div style={{ height: "100%", overflow: "auto" }}>{landing}</div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

const rootStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  background: T.bg.base,
  color: T.text.primary,
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 16px",
  background: T.bg.raised,
  borderBottom: `1px solid ${T.border}`,
  flexShrink: 0,
};

const asideStyle: CSSProperties = {
  width: 240,
  background: T.bg.panel,
  borderRight: `1px solid ${T.border}`,
  overflowY: "auto",
  flexShrink: 0,
};

const mainStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  // Session 29 (WE-2 root cause): the module outlet is LIGHT. Modules are
  // dark-text-on-light and set no root background of their own; mounting them
  // over bg.base was the source of every Gap 3 recurrence. See theme.ts.
  background: MODULE_OUTLET_BG,
  overflow: "auto",
};

const signOutStyle: CSSProperties = {
  padding: "6px 12px",
  border: `1px solid ${T.border}`,
  borderRadius: 4,
  background: T.bg.elevated,
  color: T.text.secondary,
  cursor: "pointer",
  fontFamily: T.font.sans,
  fontSize: 12,
};
