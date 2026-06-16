/**
 * SOVEREIGN Platform — sovereign-shell
 * navigation/useNavigationState.ts
 *
 * React reactivity bridge over the headless ShellNavigation provider.
 *
 * ctx.navigation.currentPath / .breadcrumb are plain mutable fields on the
 * shell context — React does not re-render when navigateTo mutates them. This
 * hook mirrors the current path into React state and exposes a `navigate`
 * wrapper that drives ctx.navigation.navigateTo (which synchronously recomputes
 * currentPath + breadcrumb) and then bumps local state to re-render.
 *
 * In Stage 1, in-chrome navigation flows through this hook. Module-initiated
 * navigation is a Stage 2 concern (modules do not drive shell nav yet).
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

import { useCallback, useState } from "react";
import type { SovereignShellContext } from "../../shell-contract";

export interface NavigationState {
  currentPath: string;
  breadcrumb: Array<{ label: string; path: string }>;
  navigate: (path: string) => void;
}

export function useNavigationState(
  ctx: SovereignShellContext
): NavigationState {
  const [currentPath, setCurrentPath] = useState<string>(
    ctx.navigation.currentPath
  );

  const navigate = useCallback(
    (path: string) => {
      ctx.navigation.navigateTo(path);
      // navigateTo updated currentPath + breadcrumb synchronously; re-render.
      setCurrentPath(ctx.navigation.currentPath);
    },
    [ctx]
  );

  // breadcrumb is read live each render; navigate() triggers the re-render.
  return { currentPath, breadcrumb: ctx.navigation.breadcrumb, navigate };
}
