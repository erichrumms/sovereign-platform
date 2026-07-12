/**
 * Travel Request — Canonical Entity (Time & Travel workflow layer)
 * Canonical identifier: request_id  ·  Data classification: program
 *
 * Approved D-TT3 (June 29, 2026); reaffirmed unchanged D-TT7 Option A (July 11, 2026).
 * Field-level schema derived from docs/17_TimeAndTravel_Architecture.md §5.1
 * (Submission Interface) and §5.3 (Routing Recommendations). Submitted through
 * NEXUS; evaluated by tt.travel-compliance-engine; routed by tt.travel-router.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** Itemized cost breakdown captured at submission (docs/17 §5.1), whole currency units. */
export interface TravelCostBreakdown {
  airfare: number;
  hotel: number;
  per_diem: number;
  ground_transport: number;
  registration_fees: number;
}

/** The three routing tiers produced by tt.travel-compliance-engine (docs/17 §5.3). */
export type TravelRoutingTier = 'STANDARD' | 'FLAGGED' | 'ESCALATE';

/** Approval authority levels for cost-based routing (docs/17 §4 routing rules). */
export type TravelApprovalAuthority = 'MANAGER' | 'DIRECTOR' | 'EXECUTIVE';

/** NEXUS lifecycle status for a travel request. Every consequential transition is a human decision. */
export type TravelRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ROUTED'
  | 'APPROVED'
  | 'DENIED'
  | 'ESCALATED';

export interface TravelRequest {
  request_id: string;
  employee_id: string;
  destination: string;
  /** International destination — a hard exception rule input (docs/17 §4). */
  international: boolean;
  /** ISO 8601 date — first day of travel. */
  travel_start_date: string;
  /** ISO 8601 date — last day of travel. */
  travel_end_date: string;
  mission_purpose: string;
  costs: TravelCostBreakdown;
  /** Sum of the itemized cost breakdown, whole currency units. */
  total_cost: number;
  /** Personal day inclusion — a hard exception rule input (docs/17 §4). */
  personal_day_included: boolean;
  /** Special authority travel category, when one applies (docs/17 §4). */
  special_authority_category?: string;
  justification: string;
  status: TravelRequestStatus;
  /** ISO 8601 timestamp of submission (absent while DRAFT). */
  submitted_at?: string;
  /** Set by tt.travel-compliance-engine after evaluation. */
  routing_tier?: TravelRoutingTier;
  /** Set by tt.travel-router when the request is assigned to an authority queue. */
  assigned_authority?: TravelApprovalAuthority;
}

const TRAVEL_REQUEST_STATUSES: readonly TravelRequestStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'ROUTED',
  'APPROVED',
  'DENIED',
  'ESCALATED',
];

const TRAVEL_ROUTING_TIERS: readonly TravelRoutingTier[] = ['STANDARD', 'FLAGGED', 'ESCALATE'];

const TRAVEL_APPROVAL_AUTHORITIES: readonly TravelApprovalAuthority[] = [
  'MANAGER',
  'DIRECTOR',
  'EXECUTIVE',
];

const COST_FIELDS = ['airfare', 'hotel', 'per_diem', 'ground_transport', 'registration_fees'] as const;

export function validateTravelRequest(request: unknown): ValidationResult {
  const errors: string[] = [];
  const t = request as Partial<TravelRequest>;

  for (const key of ['request_id', 'employee_id', 'destination', 'mission_purpose', 'justification'] as const) {
    if (typeof t[key] !== 'string' || (t[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (typeof t.international !== 'boolean') {
    errors.push('international: must be a boolean');
  }
  if (typeof t.personal_day_included !== 'boolean') {
    errors.push('personal_day_included: must be a boolean');
  }
  for (const key of ['travel_start_date', 'travel_end_date'] as const) {
    if (typeof t[key] !== 'string' || (t[key] as string).trim() === '') {
      errors.push(`${key}: required ISO 8601 date string`);
    }
  }
  if (
    typeof t.travel_start_date === 'string' &&
    typeof t.travel_end_date === 'string' &&
    t.travel_end_date < t.travel_start_date
  ) {
    errors.push('travel_end_date: must not precede travel_start_date');
  }

  const c = t.costs as Partial<TravelCostBreakdown> | undefined;
  if (!c || typeof c !== 'object') {
    errors.push('costs: required object');
  } else {
    for (const key of COST_FIELDS) {
      if (typeof c[key] !== 'number' || (c[key] as number) < 0) {
        errors.push(`costs.${key}: must be a non-negative number`);
      }
    }
  }
  if (typeof t.total_cost !== 'number' || t.total_cost < 0) {
    errors.push('total_cost: must be a non-negative number');
  } else if (c && COST_FIELDS.every((k) => typeof c[k] === 'number')) {
    const sum = COST_FIELDS.reduce((acc, k) => acc + (c[k] as number), 0);
    if (t.total_cost !== sum) {
      errors.push('total_cost: must equal the sum of the itemized cost breakdown');
    }
  }

  if (t.special_authority_category !== undefined && (typeof t.special_authority_category !== 'string' || t.special_authority_category.trim() === '')) {
    errors.push('special_authority_category: must be a non-empty string when present');
  }
  if (!TRAVEL_REQUEST_STATUSES.includes(t.status as TravelRequestStatus)) {
    errors.push(`status: must be one of ${TRAVEL_REQUEST_STATUSES.join(', ')}`);
  }
  if (t.status !== 'DRAFT' && (typeof t.submitted_at !== 'string' || t.submitted_at.trim() === '')) {
    errors.push('submitted_at: required ISO 8601 timestamp once submitted');
  }
  if (t.routing_tier !== undefined && !TRAVEL_ROUTING_TIERS.includes(t.routing_tier)) {
    errors.push(`routing_tier: must be one of ${TRAVEL_ROUTING_TIERS.join(', ')}`);
  }
  if (t.assigned_authority !== undefined && !TRAVEL_APPROVAL_AUTHORITIES.includes(t.assigned_authority)) {
    errors.push(`assigned_authority: must be one of ${TRAVEL_APPROVAL_AUTHORITIES.join(', ')}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
