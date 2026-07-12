/**
 * SOVEREIGN Platform — module-nexus
 * useTTIntake.ts — the Time & Travel intake hook (Session 29, D1).
 *
 * Owns the TT intake state and drives every submission through the EXISTING
 * Session 27/28 engines — this is wiring a new front door to a built backend,
 * not new backend logic:
 *   - Travel: buildTravelRequest → processTravelSubmission (tt-travel-queue.ts,
 *     Session 28 D3) — engine + router with full AGENT_STEP audit bracketing —
 *     then recordTravelDecision for the manager's TRAVEL_APPROVAL act (GD-21).
 *   - Time: buildTimeRecord → the injected time-compliance port. The engine
 *     itself lives in module-apex (tt.time-compliance-engine, docs/17 §2 host
 *     placement); the COMPOSITION ROOT wires it in, following the Item 57
 *     precedent (NexusApp already imports module-agentos's port factory as a
 *     configuration change — Standing Constraint #3). This hook brackets the
 *     port call with AGENT_STEP_START/COMPLETE exactly as tt-travel-queue does
 *     for the travel engine. Agent identity arrives WITH the port so no agent-id
 *     literal is duplicated here.
 *
 * Real-time policy preview (docs/17 §5.1): previewTravel() evaluates the current
 * form state against the active policy with the PURE engine only — no Logger
 * events, because a keystroke-level preview is pre-submission assistance, not an
 * agent step. The audit trail starts at submission (processTravelSubmission).
 *
 * Gate 2 (fail-closed): a failed Logger emit during submission surfaces an error
 * and commits nothing — the same posture as useRequestRegistry.
 *
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import { useCallback, useRef, useState } from "react";

import type { ComplianceFlag, TimeRecord, TravelPolicy, TravelRequest } from "@sovereign/data";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { AgentClass } from "../../sovereign-shell/shell-contract";

import {
  buildTravelRequest,
  buildTimeRecord,
  type TravelIntakeForm,
  type TimeIntakeForm,
} from "./tt-intake";
import {
  evaluateTravelRequest,
  type TravelComplianceFinding,
  type TravelEvaluationContext,
} from "./tt-travel-compliance-engine";
import {
  processTravelSubmission,
  recordTravelDecision,
  type TravelDecisionOutcome,
} from "./tt-travel-queue";

/** The time-compliance engine as an injected port (composition-root wiring — Item 57 pattern). */
export interface TimeCompliancePort {
  /** Registered agent identity for audit bracketing (Agent Identity Standard). */
  agent_id: string;
  agent_class: AgentClass;
  /** The pure evaluation — module-apex evaluateTimeRecord behind a closure. */
  evaluate: (record: TimeRecord, employeeRole: string) => ComplianceFlag[];
}

export interface TTIntakePorts {
  /** Active TravelPolicy (FLOWPATH-elicited; synthetic/dev backing this session). */
  travelPolicy: TravelPolicy;
  travelContext?: TravelEvaluationContext;
  /** Absent = time records are recorded but not evaluated (surfaced honestly in the UI). */
  timeEngine?: TimeCompliancePort;
}

/** One submitted travel request with its engine finding, held in the authority queue. */
export interface SubmittedTravelItem {
  request: TravelRequest;
  finding: TravelComplianceFinding;
  workflow_step_id: string;
}

/** One submitted time record with the flags the engine raised (empty = clean or unevaluated). */
export interface SubmittedTimeItem {
  record: TimeRecord;
  flags: ComplianceFlag[];
  evaluated: boolean;
  workflow_step_id: string;
}

export interface UseTTIntake {
  travelItems: SubmittedTravelItem[];
  timeItems: SubmittedTimeItem[];
  error: string | null;
  /** Build → evaluate → route one travel request through the Session 27/28 pipeline. */
  submitTravel: (form: TravelIntakeForm) => void;
  /** Build → evaluate one time record through the injected compliance port. */
  submitTime: (form: TimeIntakeForm) => void;
  /** Record the manager's decision on a routed request (HUMAN_DECISION · TRAVEL_APPROVAL, GD-21). */
  decideTravel: (requestId: string, outcome: TravelDecisionOutcome, note: string) => void;
  /** Pure real-time policy preview of the current form state (docs/17 §5.1). No Logger events. */
  previewTravel: (form: TravelIntakeForm) => TravelComplianceFinding | null;
  clearError: () => void;
}

export function useTTIntake(ctx: SovereignShellContext, ports: TTIntakePorts): UseTTIntake {
  const travelRef = useRef<SubmittedTravelItem[]>([]);
  const timeRef = useRef<SubmittedTimeItem[]>([]);
  const [travelItems, setTravelItems] = useState<SubmittedTravelItem[]>([]);
  const [timeItems, setTimeItems] = useState<SubmittedTimeItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Ref-backed monotonic id sources (the Gap 1 lesson — never derive ids from lagging state).
  const travelIdRef = useRef(0);
  const timeIdRef = useRef(0);

  const actorId = ctx.auth.user.employee_id;

  const submitTravel = useCallback(
    (form: TravelIntakeForm): void => {
      setError(null);
      const requestId = `TR-${(travelIdRef.current += 1)}`;
      const built = buildTravelRequest(form, requestId, actorId, new Date().toISOString());
      if (!built.ok) {
        travelIdRef.current -= 1; // id not consumed by an invalid form
        setError(built.errors.join(" · "));
        return;
      }
      try {
        const processed = processTravelSubmission(
          built.value,
          ports.travelPolicy,
          ctx.logger,
          actorId,
          ports.travelContext ?? {}
        );
        const item: SubmittedTravelItem = {
          request: processed.routing.request,
          finding: processed.finding,
          workflow_step_id: processed.workflow_step_id,
        };
        travelRef.current = [...travelRef.current, item];
        setTravelItems(travelRef.current);
      } catch (err) {
        // Gate 2 fail-closed: an emit failure mid-pipeline commits nothing.
        setError(
          `Travel submission halted — Logger emission failed (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    },
    [actorId, ctx, ports]
  );

  const previewTravel = useCallback(
    (form: TravelIntakeForm): TravelComplianceFinding | null => {
      const built = buildTravelRequest(form, "PREVIEW", actorId, new Date().toISOString());
      if (!built.ok) return null;
      return evaluateTravelRequest(built.value, ports.travelPolicy, ports.travelContext ?? {});
    },
    [actorId, ports]
  );

  const decideTravel = useCallback(
    (requestId: string, outcome: TravelDecisionOutcome, note: string): void => {
      setError(null);
      const item = travelRef.current.find((t) => t.request.request_id === requestId);
      if (!item) {
        setError(`Travel request not found in the queue: ${requestId}`);
        return;
      }
      try {
        const decided = recordTravelDecision(
          item.request,
          outcome,
          { id: ctx.auth.user.employee_id, name: ctx.auth.user.name },
          note,
          ctx.logger
        );
        travelRef.current = travelRef.current.map((t) =>
          t.request.request_id === requestId ? { ...t, request: decided.request } : t
        );
        setTravelItems(travelRef.current);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [ctx]
  );

  const submitTime = useCallback(
    (form: TimeIntakeForm): void => {
      setError(null);
      const recordId = `TM-${(timeIdRef.current += 1)}`;
      const built = buildTimeRecord(form, recordId, actorId, new Date().toISOString());
      if (!built.ok) {
        timeIdRef.current -= 1;
        setError(built.errors.join(" · "));
        return;
      }
      const record = built.value;
      const wsid = `tt-time-${record.record_id}`;

      const engine = ports.timeEngine;
      if (!engine) {
        // Honest unevaluated state — no engine port wired (configuration, Constraint #3).
        timeRef.current = [
          ...timeRef.current,
          { record, flags: [], evaluated: false, workflow_step_id: wsid },
        ];
        setTimeItems(timeRef.current);
        return;
      }

      // --- Audit bracketing, mirroring tt-travel-queue (Constraints #4/#6). ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "NEXUS",
          actor_id: actorId,
          agent_id: engine.agent_id,
          agent_class: engine.agent_class,
          outcome: "time_compliance_evaluation_started",
          payload: { record_id: record.record_id, period_start: record.period_start, period_end: record.period_end },
        });

        const flags = engine.evaluate(record, ctx.auth.user.role);

        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "NEXUS",
          actor_id: actorId,
          agent_id: engine.agent_id,
          agent_class: engine.agent_class,
          outcome: flags.length === 0 ? "time_compliance_clean" : "time_compliance_flags_raised",
          payload: {
            record_id: record.record_id,
            flag_count: flags.length,
            rule_categories: flags.map((f) => f.rule_category),
          },
        });

        timeRef.current = [
          ...timeRef.current,
          { record, flags, evaluated: true, workflow_step_id: wsid },
        ];
        setTimeItems(timeRef.current);
      } catch (err) {
        setError(
          `Time record submission halted — Logger emission failed (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    },
    [actorId, ctx, ports]
  );

  const clearError = useCallback((): void => setError(null), []);

  return { travelItems, timeItems, error, submitTravel, submitTime, decideTravel, previewTravel, clearError };
}
