/**
 * SOVEREIGN Platform — module-apex
 * ppbe-site-breakdown.ts — per-site obligation breakdown (Session 46, D3).
 *
 * LOCAL TO APEX ONLY. SyntheticSiteBreakdown is NOT part of the sovereign-data
 * entity dictionary and does NOT extend ProgramRecord or any governed type. The
 * field names here are APEX-internal and carry no data-dictionary standing.
 *
 * This module exists as a placeholder pending a real governance decision: adding
 * real site/location tracking requires an explicit data-dictionary approval (D-P3
 * or equivalent) before any future session wires live data. See Session 46 handoff,
 * item D4.
 *
 * ALL DATA PRODUCED HERE IS SYNTHETIC AND ILLUSTRATIVE. The UI must disclose this
 * visibly — a comment nobody reading the screen sees is not sufficient (D3 spec).
 *
 * SITE STRUCTURE (updated per Session 46 D3 revision):
 * There are exactly six distinct physical sites in the dataset. Program involvement
 * varies deliberately to show genuinely different scenarios:
 *   - SYNTH-PRG-ALPHA  (Logistics Data Interchange Modernization) — all 6 sites
 *   - SYNTH-PRG-ECHO   (Depot Scheduling Pilot) — 4 sites
 *   - SYNTH-PRG-DELTA  (Legacy Sustainment Consolidation) — 3 sites
 *   - SYNTH-PRG-CHARLIE(Cyber Resilience Retrofit) — 2 sites
 *   - SYNTH-PRG-BRAVO  (Supply Chain Telemetry) — 1 site
 * A single-site program, a multi-site program, and an all-site program are distinct
 * scenarios, not the same shape repeated five times.
 *
 * Version: 1.1 · Session 46 · July 20, 2026
 */

/** Per-site obligation snapshot — local APEX placeholder, not a governed entity. */
export interface SyntheticSiteBreakdown {
  /** Unique per program-site pair, not a data-dictionary ID. */
  site_id: string;
  /** Physical installation name — one of the six distinct sites in the dataset. */
  site_name: string;
  program_id: string;
  region: string;
  obligations_to_date: number;
  planned_amount: number;
  /** Derived using the same thresholds as statusFromObligationRate (≥80% on_track,
   *  ≥50% at_risk, <50% off_track). */
  status: "on_track" | "at_risk" | "off_track";
}

function siteStatus(obligated: number, planned: number): SyntheticSiteBreakdown["status"] {
  if (planned === 0) return "off_track";
  const pct = Math.round((obligated / planned) * 100);
  if (pct >= 80) return "on_track";
  if (pct >= 50) return "at_risk";
  return "off_track";
}

function entry(
  site_id: string,
  site_name: string,
  program_id: string,
  region: string,
  obligations_to_date: number,
  planned_amount: number
): SyntheticSiteBreakdown {
  return { site_id, site_name, program_id, region, obligations_to_date, planned_amount, status: siteStatus(obligations_to_date, planned_amount) };
}

// ─── The six distinct physical sites ─────────────────────────────────────────
// Site names reused across programs; each row's site_id is unique per program-site pair.
const SITE_ABERDEEN   = "Aberdeen Proving Ground";
const SITE_BRAGG      = "Fort Bragg";
const SITE_TOBYHANNA  = "Tobyhanna Army Depot";
const SITE_PENTAGON   = "Pentagon";
const SITE_CORPUS     = "Corpus Christi Army Depot";
const SITE_LETTRE     = "Letterkenny Army Depot";

/**
 * Synthetic site breakdowns for the five seeded PPBE programs.
 * All figures illustrative; site participation is deliberately varied.
 */
export const SYNTH_SITE_BREAKDOWNS: readonly SyntheticSiteBreakdown[] = [
  // SYNTH-PRG-ALPHA — Logistics Data Interchange Modernization — ALL 6 SITES
  entry("SYNTH-SITE-A1", SITE_ABERDEEN,  "SYNTH-PRG-ALPHA", "Northeast",       200000, 250000),
  entry("SYNTH-SITE-A2", SITE_BRAGG,     "SYNTH-PRG-ALPHA", "Southeast",       150000, 150000),
  entry("SYNTH-SITE-A3", SITE_TOBYHANNA, "SYNTH-PRG-ALPHA", "Northeast",       135000, 100000),
  entry("SYNTH-SITE-A4", SITE_PENTAGON,  "SYNTH-PRG-ALPHA", "Capitol Region",   90000, 100000),
  entry("SYNTH-SITE-A5", SITE_CORPUS,    "SYNTH-PRG-ALPHA", "South",            60000,  75000),
  entry("SYNTH-SITE-A6", SITE_LETTRE,    "SYNTH-PRG-ALPHA", "Northeast",        50000,  75000),

  // SYNTH-PRG-ECHO — Depot Scheduling Pilot — 4 SITES
  entry("SYNTH-SITE-E1", SITE_ABERDEEN,  "SYNTH-PRG-ECHO", "Northeast",        150000, 150000),
  entry("SYNTH-SITE-E2", SITE_BRAGG,     "SYNTH-PRG-ECHO", "Southeast",        100000, 130000),
  entry("SYNTH-SITE-E3", SITE_TOBYHANNA, "SYNTH-PRG-ECHO", "Northeast",         90000, 100000),
  entry("SYNTH-SITE-E4", SITE_CORPUS,    "SYNTH-PRG-ECHO", "South",             78000, 120000),

  // SYNTH-PRG-DELTA — Legacy Sustainment Consolidation — 3 SITES
  entry("SYNTH-SITE-D1", SITE_BRAGG,     "SYNTH-PRG-DELTA", "Southeast",       200000, 200000),
  entry("SYNTH-SITE-D2", SITE_CORPUS,    "SYNTH-PRG-DELTA", "South",           175000, 200000),
  entry("SYNTH-SITE-D3", SITE_LETTRE,    "SYNTH-PRG-DELTA", "Northeast",       100000, 100000),

  // SYNTH-PRG-CHARLIE — Cyber Resilience Retrofit — 2 SITES
  entry("SYNTH-SITE-C1", SITE_PENTAGON,  "SYNTH-PRG-CHARLIE", "Capitol Region", 100000, 150000),
  entry("SYNTH-SITE-C2", SITE_TOBYHANNA, "SYNTH-PRG-CHARLIE", "Northeast",       90000, 100000),

  // SYNTH-PRG-BRAVO — Supply Chain Telemetry — 1 SITE (single-site program)
  entry("SYNTH-SITE-B1", SITE_ABERDEEN,  "SYNTH-PRG-BRAVO", "Northeast",        80000,  80000),
];

/** Sites for a specific program, or all sites if no program_id is given. */
export function sitesForProgram(programId?: string): readonly SyntheticSiteBreakdown[] {
  if (!programId) return SYNTH_SITE_BREAKDOWNS;
  return SYNTH_SITE_BREAKDOWNS.filter((s) => s.program_id === programId);
}

/** Count of distinct physical site names across the full dataset. */
export const DISTINCT_SITE_COUNT = new Set(SYNTH_SITE_BREAKDOWNS.map((s) => s.site_name)).size;
