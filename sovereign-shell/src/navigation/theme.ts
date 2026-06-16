/**
 * SOVEREIGN Platform — sovereign-shell
 * navigation/theme.ts
 *
 * Shared shell design tokens. Sourced from the SOVEREIGN visual design system
 * (architecture.md §7.1; VISUAL_DESIGN_SUMMARY.md): identity purple #6B4FA0 for
 * structural framing only, the dark background stack, DM Sans / DM Mono, and the
 * semantic color set. Used by the navigation chrome and the governance dashboard
 * (Component #4) so the shell host renders one coherent surface.
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

export const SOVEREIGN_THEME = {
  bg: {
    base: "#0D1018",
    raised: "#13161F",
    panel: "#191D2A",
    elevated: "#252A3A",
  },
  /** Identity purple — structural framing only, never semantic state. */
  identity: "#6B4FA0",
  text: {
    primary: "#E6E8EF",
    secondary: "#9AA0B4",
    muted: "#6B7186",
  },
  semantic: {
    green: "#3FB97A", // complete / healthy
    amber: "#E0A93F", // warning / degraded
    red: "#E0533F", // escalate / unavailable / hold
    blue: "#3F7AE0", // info
    teal: "#3FB9B0", // lane owner
  },
  border: "#252A3A",
  font: {
    sans: "'DM Sans', system-ui, -apple-system, sans-serif",
    mono: "'DM Mono', ui-monospace, monospace",
  },
} as const;

export type SovereignTheme = typeof SOVEREIGN_THEME;
