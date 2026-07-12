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
 * Session 29 (Walkthrough E finding WE-2 — third Gap 3 recurrence): every text
 * token is now WCAG-AA-verified against every dark background it renders on,
 * enforced by e2e/tests/wcag-contrast.test.ts (computed ratios, not visual
 * judgment). Changed: text.muted #6B7186→#8E94AA (was 2.94–3.92:1, now
 * 4.74–6.31:1), semantic.blue #3F7AE0→#6D9CEC (was 3.45–4.59:1, now
 * 5.18–6.90:1), semantic.red #E0533F→#E8705C (was 3.72–4.96:1, now 4.69–6.25:1;
 * red-as-background now pairs with DARK text — see identityText note). Added:
 * identityText (a text-safe tint of the identity purple, which at 2.21–2.94:1
 * must never be used as a text color — identity stays framing-only) and
 * MODULE_OUTLET_BG (the module outlet is LIGHT: every product module is
 * designed dark-text-on-light, and mounting them over the dark shell stack was
 * the root cause of Gap 3's three recurrences). Any future token change must
 * keep the contrast test green.
 *
 * Version: 1.1 · Session 29 · July 12, 2026
 */

export const SOVEREIGN_THEME = {
  bg: {
    base: "#0D1018",
    raised: "#13161F",
    panel: "#191D2A",
    elevated: "#252A3A",
  },
  /** Identity purple — structural framing only (borders/accents), NEVER text (2.2–2.9:1). */
  identity: "#6B4FA0",
  /** Text-safe identity tint — use this when identity-colored TEXT is needed (6.2–8.3:1). */
  identityText: "#B3A3D9",
  text: {
    primary: "#E6E8EF",
    secondary: "#9AA0B4",
    // Session 29 WE-2: was #6B7186 (2.94:1 on bg.elevated — AA fail). ≥4.74:1 everywhere now.
    muted: "#8E94AA",
  },
  semantic: {
    green: "#3FB97A", // complete / healthy
    amber: "#E0A93F", // warning / degraded
    // Session 29 WE-2: was #E0533F (3.72:1 on bg.elevated). As a BACKGROUND, pair with
    // dark #0D1018 text (6.25:1) — white-on-red fails at 3.04:1.
    red: "#E8705C", // escalate / unavailable / hold
    // Session 29 WE-2: was #3F7AE0 (3.45:1 on bg.elevated — AA fail).
    blue: "#6D9CEC", // info
    teal: "#3FB9B0", // lane owner
  },
  border: "#252A3A",
  font: {
    sans: "'DM Sans', system-ui, -apple-system, sans-serif",
    mono: "'DM Mono', ui-monospace, monospace",
  },
} as const;

/**
 * The module outlet background (Session 29, WE-2 root cause). Every product
 * module is designed dark-text-on-light (#0f172a body text, slate secondary
 * text); none sets its own root background. The shell previously mounted them
 * over bg.base (#0D1018), silently turning every module's slate text into a
 * 1.2–2.2:1 violation — the actual mechanism behind Gap 3 recurring three
 * times despite two per-element fix passes. The outlet is therefore LIGHT, as
 * a named token so the WCAG regression test can assert against it.
 */
export const MODULE_OUTLET_BG = "#ffffff" as const;

export type SovereignTheme = typeof SOVEREIGN_THEME;
