/**
 * ReasoningChainOutput — Canonical Entity
 * Added: Session 11, June 23, 2026, Project Principal (CPMI module build)
 * Owner: module-cpmi (cpmi.reasoning-chain agent)
 * Data Classification: governance
 *
 * The canonical shape of a completed CPMI six-step reasoning chain (08_CPMI_Architecture.md
 * §3 / §8 STEP 6). CPMI's governance outputs are the foundation for all six primary
 * products, so this output is SCHEMA-VALIDATED before it is surfaced to downstream
 * products — a schema_valid:false output never reaches them (spec §3).
 *
 * FIELD NAMES ARE FROZEN. No module may redefine or rename these fields. Additions
 * require a new governance decision and a sovereign-data version increment.
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RiskSeverity = 'P1' | 'P2' | 'P3';
export type RiskType = 'schedule' | 'cost' | 'performance' | 'compliance' | 'governance';

/** One identified risk (Step 2 — Risk Identification). */
export interface ReasoningRisk {
  risk: string;
  severity: RiskSeverity;
  type: RiskType;
}

/** One mapped constraint (Step 3 — Constraint Mapping). */
export interface ReasoningConstraint {
  constraint: string;
  /** What the constraint permits. */
  permitted: string;
  /** What the constraint prohibits. */
  prohibited: string;
  /** What the constraint requires explicit human approval for. */
  requires_approval: string;
}

/** One governance option (Step 4 — Option Generation). */
export interface ReasoningOption {
  option: string;
  cost: string;
  defers: string;
  closes: string;
}

/** The completed reasoning-chain output (Step 6 — Output Schema Validation). */
export interface ReasoningChainOutput {
  /** Step 1 — assembled program context summary. */
  context_summary: string;
  /** Step 1 — confidence in the assembled context, by data completeness. */
  context_confidence: ConfidenceLevel;
  /** Step 2 — structured risk register. */
  risk_register: ReasoningRisk[];
  /** Step 3 — constraint map (permit / prohibit / approve). */
  constraint_map: ReasoningConstraint[];
  /** Step 4 — governance option set (cost / defer / close). */
  option_set: ReasoningOption[];
  /** Step 5 — ranked recommendation with rationale. */
  recommendation: string;
  /** Step 5 — alternatives considered and not recommended. */
  alternatives_considered: string[];
  /**
   * Step 6 — the agent's own schema-validity assertion. MUST be true before the
   * output is surfaced downstream; a false value identifies a self-detected failure.
   */
  schema_valid: boolean;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== '';
}
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

const RISK_SEVERITIES: readonly RiskSeverity[] = ['P1', 'P2', 'P3'];
const RISK_TYPES: readonly RiskType[] = ['schedule', 'cost', 'performance', 'compliance', 'governance'];
const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = ['high', 'medium', 'low'];

/**
 * Runtime validation for ReasoningChainOutput — the shape downstream products rely on.
 * Validates the structure; it does NOT assert schema_valid must be true (that is the
 * agent's own field — the engine additionally requires schema_valid===true before
 * accepting a live output). Returns { valid: true } or { valid: false, errors }.
 */
export function validateReasoningChainOutput(
  value: unknown
): { valid: true } | { valid: false; errors: string[] } {
  if (typeof value !== 'object' || value === null) {
    return { valid: false, errors: ['ReasoningChainOutput must be a non-null object'] };
  }
  const errors: string[] = [];
  const o = value as Partial<ReasoningChainOutput>;

  if (!isNonEmptyString(o.context_summary)) errors.push('context_summary: required non-empty string');
  if (!CONFIDENCE_LEVELS.includes(o.context_confidence as ConfidenceLevel)) {
    errors.push('context_confidence: must be high | medium | low');
  }

  if (!Array.isArray(o.risk_register)) {
    errors.push('risk_register: required array');
  } else {
    o.risk_register.forEach((r, i) => {
      const rr = r as Partial<ReasoningRisk>;
      if (!isNonEmptyString(rr.risk)) errors.push(`risk_register[${i}].risk: required non-empty string`);
      if (!RISK_SEVERITIES.includes(rr.severity as RiskSeverity)) errors.push(`risk_register[${i}].severity: must be P1 | P2 | P3`);
      if (!RISK_TYPES.includes(rr.type as RiskType)) errors.push(`risk_register[${i}].type: must be ${RISK_TYPES.join(' | ')}`);
    });
  }

  if (!Array.isArray(o.constraint_map)) {
    errors.push('constraint_map: required array');
  } else {
    o.constraint_map.forEach((c, i) => {
      const cc = c as Partial<ReasoningConstraint>;
      if (!isNonEmptyString(cc.constraint)) errors.push(`constraint_map[${i}].constraint: required non-empty string`);
      if (!isNonEmptyString(cc.permitted)) errors.push(`constraint_map[${i}].permitted: required non-empty string`);
      if (!isNonEmptyString(cc.prohibited)) errors.push(`constraint_map[${i}].prohibited: required non-empty string`);
      if (!isNonEmptyString(cc.requires_approval)) errors.push(`constraint_map[${i}].requires_approval: required non-empty string`);
    });
  }

  if (!Array.isArray(o.option_set)) {
    errors.push('option_set: required array');
  } else {
    o.option_set.forEach((op, i) => {
      const oo = op as Partial<ReasoningOption>;
      if (!isNonEmptyString(oo.option)) errors.push(`option_set[${i}].option: required non-empty string`);
      if (!isNonEmptyString(oo.cost)) errors.push(`option_set[${i}].cost: required non-empty string`);
      if (!isNonEmptyString(oo.defers)) errors.push(`option_set[${i}].defers: required non-empty string`);
      if (!isNonEmptyString(oo.closes)) errors.push(`option_set[${i}].closes: required non-empty string`);
    });
  }

  if (!isNonEmptyString(o.recommendation)) errors.push('recommendation: required non-empty string');
  if (!isStringArray(o.alternatives_considered)) errors.push('alternatives_considered: required string[]');
  if (typeof o.schema_valid !== 'boolean') errors.push('schema_valid: required boolean');

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
