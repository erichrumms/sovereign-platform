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
 * In Stage 1, in-chrome navigation flowed exclusively through this hook.
 * Since GD-27, ctx.navigateToModule (the host handler in main.tsx) also
 * drives the provider directly — D7 (Session 61, finding D3-7i): the mirror
 * now self-heals whenever a render observes the provider ahead of the local
 * state (the sanctioned render-time-adjustment pattern), so an external
 * navigation no longer leaves the sidebar highlighting the previous module.
 *
 * Version: 1.1 · Session 61 (D7) · July 24, 2026
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

  // D7 (Session 61, D3-7i): an EXTERNAL navigation — the ctx.navigateToModule
  // host handler calling the provider directly — mutates the provider without
  // this hook's navigate(). When a render observes that drift, adjust the
  // mirror immediately (React's render-time state adjustment: the re-render
  // happens before commit, so the stale highlight is never painted).
  if (ctx.navigation.currentPath !== currentPath) {
    setCurrentPath(ctx.navigation.currentPath);
  }

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
