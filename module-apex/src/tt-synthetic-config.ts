/**
 * SOVEREIGN Platform — module-apex
 * tt-synthetic-config.ts — synthetic Time & Expense policy configuration (Session 29).
 *
 * The FLOWPATH-elicited engine configuration tt.time-compliance-engine loads at
 * startup (docs/17 §4). This is the synthetic/dev backing — a real deployment
 * replaces it with the output of a FLOWPATH elicitation session by configuration
 * (Standing Constraint #3). Lives beside the engine because
 * TimeCompliancePolicyConfig is a module-level type (Session 27 governance note:
 * NOT a canonical data-dictionary entity — D-TT3 approved exactly six entities).
 *
 * All values synthetic, chosen to make every §6.1 rule reachable from the seeded
 * records in @sovereign/data synthetic/tt-seed.ts.
 *
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import type { TimeCompliancePolicyConfig } from "./tt-time-compliance-engine";

export const SYNTH_TT_TIME_POLICY_CONFIG: TimeCompliancePolicyConfig = {
  overtime_daily_hours: 10,
  overtime_weekly_hours: 45,
  period_hour_minimum: 40,
  submission_grace_days: 3,
  justification_required_above_daily_hours: 10,
};
