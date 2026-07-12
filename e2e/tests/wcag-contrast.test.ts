/**
 * e2e — wcag-contrast.test.ts (Session 29, D2 — Walkthrough E finding WE-2).
 *
 * THE SYSTEMATIC GAP 3 CONTRAST AUDIT, AS AN EXECUTABLE REGRESSION TEST.
 *
 * Gap 3 (low-contrast text) recurred three times: found in Walkthrough A,
 * partially fixed in Session 17, recurred in APEX (Walkthrough B), recurred in
 * NEXUS + SCRIBE (Walkthrough E). Both prior passes relied on visual judgment.
 * This test computes ACTUAL WCAG 2.x contrast ratios — relative luminance per
 * WCAG's definition — and fails the build on any violation, so a fourth silent
 * recurrence of a checked pair is structurally impossible.
 *
 * Thresholds (WCAG AA): 4.5:1 for normal text; 3:1 for large text (>=24px, or
 * >=18.66px bold). Almost all platform text is 10–14px → 4.5:1 applies.
 *
 * Three enforcement layers:
 *   1. SHELL TOKENS — imported LIVE from sovereign-shell theme.ts, so a token
 *      edit that breaks contrast fails here immediately.
 *   2. MODULE OUTLET — the Session 29 root-cause fix: modules are designed
 *      dark-text-on-light and set no root background; the shell outlet must
 *      stay light enough that the module text palette passes on it.
 *   3. MODULE PAIR TABLE — the full Session 29 audited inventory of inline
 *      text/background pairs across all ten modules + shell host notices.
 *      This table IS the auditable audit record. When adding UI with new
 *      color pairs, add them here.
 */

import { SOVEREIGN_THEME as T, MODULE_OUTLET_BG } from "../../sovereign-shell/src/navigation/theme";

// ── WCAG 2.x math ────────────────────────────────────────────────────────────

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const [hi, lo] = [relativeLuminance(fg), relativeLuminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

function requiredRatio(px: number, bold: boolean): number {
  const large = px >= 24 || (bold && px >= 18.66);
  return large ? 3.0 : 4.5;
}

// ── 1. Shell tokens on every dark background they render on ─────────────────

const DARK_BGS = Object.entries(T.bg); // base / raised / panel / elevated

describe("shell theme tokens — AA on every dark background (WE-2)", () => {
  const textTokens: Array<[string, string]> = [
    ["text.primary", T.text.primary],
    ["text.secondary", T.text.secondary],
    ["text.muted", T.text.muted],
    ["identityText", T.identityText],
    // Semantic colors render as 11–13px status/gate-label text in the chrome
    // and governance dashboard — normal-text threshold applies.
    ["semantic.green", T.semantic.green],
    ["semantic.amber", T.semantic.amber],
    ["semantic.red", T.semantic.red],
    ["semantic.blue", T.semantic.blue],
    ["semantic.teal", T.semantic.teal],
  ];

  it.each(textTokens)("%s meets 4.5:1 on all four dark backgrounds", (_name, fg) => {
    for (const [bgName, bg] of DARK_BGS) {
      const ratio = contrastRatio(fg, bg);
      expect({ bg: bgName, ratio: Math.round(ratio * 100) / 100, pass: ratio >= 4.5 }).toEqual(
        expect.objectContaining({ bg: bgName, pass: true })
      );
    }
  });

  it("identity purple stays framing-only — as text it would fail AA (documented constraint)", () => {
    // Not a violation (it is never used as a text color after Session 29) — this
    // pins the REASON identityText exists. If identity is ever lightened enough
    // to pass, this test may be revisited alongside the design system.
    expect(contrastRatio(T.identity, T.bg.base)).toBeLessThan(4.5);
    expect(contrastRatio(T.identityText, T.bg.base)).toBeGreaterThanOrEqual(4.5);
  });

  it("semantic badge backgrounds pair with dark text at AA (HOLD badge, overall badge)", () => {
    for (const bg of [T.semantic.red, T.semantic.green, T.semantic.amber]) {
      expect(contrastRatio("#0D1018", bg)).toBeGreaterThanOrEqual(4.5);
    }
    // The regression that motivated the dark-on-red switch: white-on-red fails.
    expect(contrastRatio("#ffffff", T.semantic.red)).toBeLessThan(4.5);
  });
});

// ── 2. The module outlet root-cause fix ─────────────────────────────────────

describe("module outlet background — the Gap 3 root cause (Session 29)", () => {
  it("is light enough that the module text palette passes AA on it", () => {
    // The colors modules render directly on the outlet (no own background):
    // body text, subtitles/inactive tabs, table headers, muted meta text.
    for (const fg of ["#0f172a", "#334155", "#475569", "#64748b"]) {
      expect(contrastRatio(fg, MODULE_OUTLET_BG)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("would have failed over the old dark outlet — pins the mechanism, not just the value", () => {
    // Module slate text over bg.base is what Walkthrough E actually saw
    // (NEXUS tabs/table headers, SCRIBE subtitle). Never mount modules dark.
    expect(contrastRatio("#475569", T.bg.base)).toBeLessThan(4.5);
  });
});

// ── 3. The full audited module pair inventory (Session 29 audit record) ─────
// [foreground, background, px, bold, where]

type AuditRow = [string, string, number, boolean, string];

const MODULE_PAIRS: AuditRow[] = [
  // NEXUS
  ["#0f172a", "#ffffff", 14, true, "NEXUS active tab / body"],
  ["#475569", "#ffffff", 14, false, "NEXUS inactive tab, subtitle, routing/queue table headers"],
  ["#1e40af", "#eff6ff", 13, false, "NEXUS AI-disclosure banner (also VIGIL/LENS/CPMI/AgentOS)"],
  ["#854d0e", "#fef9c3", 13, false, "NEXUS GD-10 boundary banner / gate pill PENDING"],
  ["#b91c1c", "#ffffff", 13, true, "error text (NEXUS/SCRIBE/APEX/CPMI/VIGIL)"],
  ["#ffffff", "#0c4a6e", 13, true, "primary buttons (NEXUS/SCRIBE/APEX/CPMI/COUNSEL/ARIA)"],
  ["#065f46", "#d1fae5", 12, true, "COMPLETE/PASSED badges (NEXUS/AgentOS/APEX/FLOWPATH/ARIA)"],
  ["#b91c1c", "#fee2e2", 12, true, "REJECTED badge"],
  ["#1e40af", "#dbeafe", 12, true, "IN_PROGRESS badge"],
  ["#475569", "#e2e8f0", 12, true, "default badge / LOCKED gate pill"],
  ["#047857", "#ffffff", 12, true, "queue approve (outline) button"],
  ["#065f46", "#ffffff", 13, true, "TT routing tier STANDARD label (Session 29 TTQueuePanel)"],
  ["#854d0e", "#ffffff", 13, true, "TT routing tier FLAGGED label (Session 29 TTQueuePanel)"],
  ["#334155", "#ffffff", 12, false, "TT findings list / field labels (Session 29)"],
  ["#ffffff", "#b45309", 12, true, "TT escalate / VIGIL ESCALATE buttons"],
  ["#ffffff", "#b91c1c", 12, true, "TT deny / VIGIL REJECT buttons"],
  ["#ffffff", "#047857", 12, true, "TT approve button (Session 29)"],
  // SCRIBE
  ["#475569", "#ffffff", 14, false, "SCRIBE page subtitle (Walkthrough E finding), mode descriptions"],
  ["#92400e", "#fffbeb", 13, false, "SCRIBE banner / warning notices"],
  ["#0c4a6e", "#ffffff", 11, true, "SCRIBE mode target tag"],
  ["#065f46", "#ffffff", 12, true, "DraftWorkspace live-tier/style indicators"],
  ["#7f1d1d", "#ffffff", 13, false, "DraftWorkspace static-tier indicator"],
  // VIGIL
  ["#0c4a6e", "#f8fafc", 22, true, "VIGIL command-center card value (large text)"],
  ["#334155", "#f8fafc", 13, false, "VIGIL card label"],
  ["#475569", "#f8fafc", 11, false, "VIGIL card note"],
  ["#64748b", "#ffffff", 13, false, "VIGIL hint / LENS inactive tab"],
  ["#64748b", "#f8fafc", 12, false, "VIGIL alert card meta"],
  ["#991b1b", "#f8fafc", 11, false, "VIGIL CPMI enhanced-tier note"],
  ["#991b1b", "#fef2f2", 12, false, "VIGIL error notice / shell mount-error notice"],
  ["#ffffff", "#15803d", 13, true, "VIGIL APPROVE button"],
  ["#0f172a", "#f8fafc", 13, true, "VIGIL alert card type"],
  // APEX / CPMI / FLOWPATH / AgentOS
  ["#854d0e", "#fffbeb", 12, false, "APEX cost-over state"],
  ["#334155", "#e2e8f0", 12, false, "APEX cost-default state"],
  ["#065f46", "#ecfdf5", 13, false, "CPMI certification-ok notice"],
  ["#7f1d1d", "#fee2e2", 12, false, "CPMI benchmark rate badge (not ok)"],
  ["#ffffff", "#2563eb", 14, true, "FLOWPATH/ARIA primary buttons"],
  // COUNSEL / LENS / ARIA
  ["#166534", "#dcfce7", 12, false, "COUNSEL risk LOW"],
  ["#854d0e", "#fef9c3", 12, false, "COUNSEL risk MODERATE"],
  ["#9a3412", "#ffedd5", 12, false, "COUNSEL risk HIGH"],
  ["#991b1b", "#fee2e2", 12, false, "COUNSEL risk CRITICAL"],
  ["#0f172a", "#f1f5f9", 13, false, "COUNSEL secondary buttons"],
  ["#166534", "#ffffff", 13, false, "LENS grounded indicator"],
  ["#ffffff", "#166534", 13, false, "ARIA certify button"],
  ["#991b1b", "#ffffff", 13, false, "ARIA flag button"],
  ["#5b21b6", "#f5f3ff", 12, false, "ARIA regulation tag"],
  ["#334155", "#f1f5f9", 12, false, "ARIA neutral tag"],
  // Shell host (light notices rendered in the outlet)
  ["#475569", "#f1f5f9", 13, false, "shell main.tsx empty-outlet notice"],
];

describe("module text/background pairs — full Session 29 audit inventory", () => {
  it.each(MODULE_PAIRS)("%s on %s (%spx) — %s", (fg, bg, px, bold, _where) => {
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(requiredRatio(px, bold));
  });
});
