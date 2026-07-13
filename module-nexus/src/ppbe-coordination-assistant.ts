/**
 * SOVEREIGN Platform — module-nexus
 * ppbe-coordination-assistant.ts — PPBE workflow layer, Session 32 (Full Cycle).
 *
 * ppbe-coordination-assistant (Operational, LLM-BACKED — Agent Identity
 * Standard, D-P5; prompt ppbe/prompts/coordination_system.md, PENDING,
 * authored this session per the July 12 AGENT_REFERENCE.md reassignment; the
 * registry's prompt requirement overrides docs/18 §5's "inferred no" — Session
 * 32 standing rule). Runs on NEXUS / VIGIL infrastructure. Moved from Session
 * 31 to this session per the Session 31 Project Principal decision #1.
 *
 * TWO HALVES, ONE SCOPE:
 *  1. DETERMINISTIC monitoring — missed deadlines, overdue phase transitions,
 *     lapsed commitment records — producing PPBE_ANOMALY findings (docs/18 §4
 *     payload fields) for VIGIL routing. No clock: the host supplies asOfIso
 *     (tt-escalation-monitor / ppbe-dependency-tracker pattern). PPBE_ANOMALY
 *     is Python-only (Session 31 decision #3) — this module produces findings;
 *     the host routes and the Python-side emitter logs.
 *  2. LLM-BACKED coordination tracking — reading unstructured notes against
 *     the tracked items and producing an ADVISORY digest whose every update
 *     proposal requires explicit human authorization. Fabricated item
 *     references are rejected structurally.
 *
 * NEVER ACTS: does not send communications; does not reassign or close items
 * without human authorization — the ONLY close path in this module takes a
 * human operator and a Logger, and a failed emit blocks the close.
 *
 * Version: 1.0 · Session 32 · July 13, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";
import type { ValidationResult } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

export const PPBE_COORDINATION_ASSISTANT_AGENT_ID = "ppbe-coordination-assistant";

/** Registry binding stamped onto Logger events as prompt provenance (AIS D-P5). */
export const PPBE_COORDINATION_PROMPT_REGISTRATION = {
  file: "ppbe/prompts/coordination_system.md",
  promptVersion: "v1.0",
  /** PENDING — synthetic-data use only until the Project Principal approves. */
  status: "PENDING",
} as const;

/** Same literal as module-vigil's PPBE_TIER_A_LABEL / module-apex's PPBE_ADVISORY_LABEL —
 *  restated because modules cannot import each other (Constraint #11); e2e asserts equality. */
export const PPBE_COORDINATION_ADVISORY_LABEL = "AI-generated recommendation — a human decides";

// ============================================================
// TRACKED COORDINATION ITEMS (module-local, host-supplied)
// ============================================================

export type CoordinationItemKind =
  | "ACTION_ITEM"
  | "DECISION_COMMITMENT"
  | "CALENDAR_OBLIGATION"
  | "PHASE_TRANSITION";

export type CoordinationItemStatus = "OPEN" | "RESOLVED";

/**
 * One tracked coordination item. The host maps governed sources into this
 * shape (e.g. a FLOWPATH governance-calendar artifact entry becomes a
 * CALENDAR_OBLIGATION with a concrete ISO deadline) — this module defines the
 * monitoring shape only and never writes back to any source.
 */
export interface CoordinationItem {
  item_id: string;
  kind: CoordinationItemKind;
  /** Plain prose (Gap 5). */
  description: string;
  responsible_role: string;
  /** ISO 8601 — when this item is due. */
  due_by: string;
  status: CoordinationItemStatus;
  program_id?: string;
  /** The PPBE phase (1-6) the item belongs to, when phase-bound. */
  phase?: number;
  /** Constraint #6 — joins the item to the audit trail. */
  workflow_step_id: string;
}

// ============================================================
// DETERMINISTIC HALF — deadline monitoring (docs/18 §4 PPBE_ANOMALY)
// ============================================================

export type CoordinationAnomalyType =
  | "MISSED_DEADLINE"
  | "OVERDUE_PHASE_TRANSITION"
  | "LAPSED_COMMITMENT";

export type CoordinationSeverity = "P1" | "P2" | "P3";

/** One coordination failure, structured for the VIGIL Alert Queue (docs/18 §4). */
export interface CoordinationAnomalyFinding {
  anomaly_type: CoordinationAnomalyType;
  item_id: string;
  program_id?: string;
  /** Plain prose (Gap 5): what is overdue, who owns it, and since when. */
  threshold_breached: string;
  severity: CoordinationSeverity;
  workflow_step_id: string;
  /** Tracks and routes only — never acts, never communicates (registry scope). */
  observation_only: true;
}

function anomalyFor(item: CoordinationItem): {
  type: CoordinationAnomalyType;
  severity: CoordinationSeverity;
} {
  switch (item.kind) {
    case "PHASE_TRANSITION":
      // A phase handoff sitting past due blocks everything downstream of it.
      return { type: "OVERDUE_PHASE_TRANSITION", severity: "P1" };
    case "DECISION_COMMITMENT":
      return { type: "LAPSED_COMMITMENT", severity: "P2" };
    case "CALENDAR_OBLIGATION":
      return { type: "MISSED_DEADLINE", severity: "P2" };
    case "ACTION_ITEM":
      return { type: "MISSED_DEADLINE", severity: "P3" };
  }
}

/**
 * The deterministic monitoring pass: every OPEN item past its due time at
 * asOfIso is a coordination failure. The host supplies the clock; same input,
 * same output.
 */
export function detectCoordinationFailures(
  items: readonly CoordinationItem[],
  asOfIso: string
): CoordinationAnomalyFinding[] {
  const findings: CoordinationAnomalyFinding[] = [];
  for (const item of items) {
    if (item.status !== "OPEN" || asOfIso <= item.due_by) continue;
    const { type, severity } = anomalyFor(item);
    findings.push({
      anomaly_type: type,
      item_id: item.item_id,
      program_id: item.program_id,
      threshold_breached:
        `${item.description} — due ${item.due_by}, still open, responsible role ${item.responsible_role}.`,
      severity,
      workflow_step_id: item.workflow_step_id,
      observation_only: true,
    });
  }
  return findings;
}

// ============================================================
// HUMAN-AUTHORIZED CLOSE — the only close path in this module
// ============================================================

/** Minimal logger surface (ctx.logger-compatible; injectable for Node tests). */
export interface CoordinationLogger {
  log: (event: SovereignLogEvent) => void;
}

export interface CoordinationOperator {
  id: string;
  name: string;
}

/** Aligned with the VIGIL decision-note minimum (restated — Constraint #11). */
export const COORDINATION_NOTE_MIN_CHARS = 10;

export interface CoordinationCloseResult {
  ok: boolean;
  item: CoordinationItem;
  error?: string;
}

/**
 * Close a coordination item — a HUMAN act, recorded as one. Emits
 * HUMAN_DECISION with decision_type HUMAN_APPROVAL (Session 31 decision #5);
 * a failed Logger emit BLOCKS the close (CPMI-VRS Gate 2). Pure over its
 * input — returns a new item; never mutates. There is no other code path to
 * RESOLVED in this module (registry: no closing without human authorization).
 */
export function closeCoordinationItem(
  item: CoordinationItem,
  operator: CoordinationOperator,
  note: string,
  logger: CoordinationLogger
): CoordinationCloseResult {
  if (item.status !== "OPEN") {
    return { ok: false, item, error: `item ${item.item_id} is already ${item.status}` };
  }
  if (note.trim().length < COORDINATION_NOTE_MIN_CHARS) {
    return {
      ok: false,
      item,
      error: `A note of at least ${COORDINATION_NOTE_MIN_CHARS} characters is required to close this item.`,
    };
  }
  try {
    logger.log({
      event_type: "HUMAN_DECISION",
      workflow_step_id: item.workflow_step_id,
      sovereign_tier: "standard",
      product: "NEXUS",
      actor_id: operator.id,
      outcome: "ppbe_coordination_item_closed",
      decision_type: "HUMAN_APPROVAL",
      actor: "human",
      actor_name: operator.name,
      payload: {
        agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
        item_id: item.item_id,
        kind: item.kind,
        program_id: item.program_id ?? null,
        notes: note.trim(),
      },
    });
  } catch (err) {
    return {
      ok: false,
      item,
      error: `Logger emission failed — close not recorded (CPMI-VRS Gate 2): ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  return { ok: true, item: { ...item, status: "RESOLVED" } };
}

// ============================================================
// LLM HALF — coordination digest from unstructured notes (advisory)
// ============================================================

export interface CoordinationUpdateProposal {
  /** Must exist in the supplied tracked items. */
  item_id: string;
  proposed_status: CoordinationItemStatus;
  /** Plain prose, citing what in the notes supports the proposal. */
  rationale: string;
}

/** The advisory digest — every proposal requires human authorization. */
export interface CoordinationDigest {
  summary: string;
  update_proposals: CoordinationUpdateProposal[];
  risks_flagged: string[];
  /** Must equal PPBE_COORDINATION_ADVISORY_LABEL exactly. */
  advisory_label: string;
  workflow_step_id: string;
  schema_valid: boolean;
}

/** One tracking pass — tracked items plus the unstructured notes to read. */
export interface CoordinationTrackingInput {
  items: CoordinationItem[];
  /** Meeting notes, status emails, review minutes — unstructured. */
  notes: string;
  workflowStepId?: string;
}

export type CoordinationTier = "live" | "static";

export interface CoordinationOutcome {
  digest: CoordinationDigest;
  tier: CoordinationTier;
  detail?: string;
}

export interface CoordinationDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
}

export function coordinationWorkflowStep(input: CoordinationTrackingInput): string {
  if (input.workflowStepId) return input.workflowStepId;
  return `ppbe-coordination-digest-${input.items.length}-items`;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

/** Validate a digest against the contract AND the tracked items actually supplied. */
export function validateCoordinationDigest(
  value: unknown,
  items: readonly CoordinationItem[]
): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["digest must be a non-null object"] };
  }
  const d = value as Partial<CoordinationDigest>;
  const errors: string[] = [];
  const knownItems = new Set(items.map((i) => i.item_id));

  if (!isNonEmptyString(d.summary)) errors.push("summary: required non-empty string");
  if (!isNonEmptyString(d.workflow_step_id)) errors.push("workflow_step_id: required non-empty string");
  if (d.advisory_label !== PPBE_COORDINATION_ADVISORY_LABEL) {
    errors.push(`advisory_label: must be exactly "${PPBE_COORDINATION_ADVISORY_LABEL}"`);
  }
  if (typeof d.schema_valid !== "boolean") errors.push("schema_valid: required boolean");
  if (!Array.isArray(d.risks_flagged) || !d.risks_flagged.every(isNonEmptyString)) {
    errors.push("risks_flagged: required array of non-empty strings");
  }
  if (!Array.isArray(d.update_proposals)) {
    errors.push("update_proposals: required array (may be empty)");
  } else {
    d.update_proposals.forEach((p, i) => {
      const prop = p as Partial<CoordinationUpdateProposal>;
      if (!isNonEmptyString(prop.item_id) || !knownItems.has(prop.item_id)) {
        errors.push(
          `update_proposals[${i}].item_id: "${String(prop.item_id)}" is not a tracked item — fabricated reference`
        );
      }
      if (prop.proposed_status !== "OPEN" && prop.proposed_status !== "RESOLVED") {
        errors.push(`update_proposals[${i}].proposed_status: must be OPEN or RESOLVED`);
      }
      if (!isNonEmptyString(prop.rationale)) {
        errors.push(`update_proposals[${i}].rationale: required (cite the notes)`);
      }
    });
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export function buildCoordinationMessages(
  input: CoordinationTrackingInput,
  systemPrompt: string
): SovereignMessage[] {
  const payload = {
    tracked_items: input.items,
    coordination_notes: input.notes,
    workflow_step_id: coordinationWorkflowStep(input),
  };
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(payload, null, 2) },
  ];
}

export function parseCoordinationDigest(
  content: string,
  items: readonly CoordinationItem[]
): CoordinationDigest | null {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return null;
  }
  if (!validateCoordinationDigest(parsed, items).valid) return null;
  const digest = parsed as CoordinationDigest;
  return digest.schema_valid === true ? digest : null;
}

/**
 * The deterministic static digest: reports the overdue scan and proposes
 * NOTHING — reading unstructured notes is exactly the live tier's job, and a
 * static tier that guessed at proposals would be fabricating judgment.
 */
export function staticCoordinationDigest(
  input: CoordinationTrackingInput,
  asOfIso: string
): CoordinationDigest {
  const overdue = detectCoordinationFailures(input.items, asOfIso);
  const open = input.items.filter((i) => i.status === "OPEN").length;
  return {
    summary:
      `Static digest assembled without live reasoning: ${input.items.length} tracked ` +
      `${input.items.length === 1 ? "item" : "items"}, ${open} open, ${overdue.length} past due. ` +
      "The supplied notes were NOT read — a human should read them directly.",
    update_proposals: [],
    risks_flagged: overdue.map((f) => f.threshold_breached),
    advisory_label: PPBE_COORDINATION_ADVISORY_LABEL,
    workflow_step_id: coordinationWorkflowStep(input),
    schema_valid: true,
  };
}

/** live → static, one live attempt, never throws. asOfIso feeds the static digest only. */
export async function runCoordinationTracking(
  input: CoordinationTrackingInput,
  asOfIso: string,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: CoordinationDeps
): Promise<CoordinationOutcome> {
  let detail: string | undefined;
  try {
    const response = await deps.complete(buildCoordinationMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const digest = parseCoordinationDigest(response.content, input.items);
      if (digest) return { digest, tier: "live" };
      detail = "live_response_not_surfaceable";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }
  return { digest: staticCoordinationDigest(input, asOfIso), tier: "static", detail };
}
