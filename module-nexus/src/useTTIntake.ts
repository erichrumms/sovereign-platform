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
 * D4 (Session 61, finding D3-3): when ports.sessionStore is set, the travel and
 * time queues live in the module-level session store (tt-session.ts) — seeded
 * once per browser session, every mutation committed through the store, and
 * consumed via the same live-subscription pattern as the VIGIL/ARIA session
 * stores. A decided travel or time item therefore no longer reappears when
 * NEXUS remounts. Off by default so store-less tests keep isolated state.
 *
 * Version: 1.1 · Session 61 (D4) · July 23, 2026
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  travelWorkflowStep,
  type TravelDecisionOutcome,
} from "./tt-travel-queue";
import {
  ensureTTSession,
  setTTSessionTime,
  setTTSessionTravel,
  subscribeTTSession,
} from "./tt-session";

/** The time-compliance engine as an injected port (composition-root wiring — Item 57 pattern). */
export interface TimeCompliancePort {
  /** Registered agent identity for audit bracketing (Agent Identity Standard). */
  agent_id: string;
  agent_class: AgentClass;
  /** The pure evaluation — module-apex evaluateTimeRecord behind a closure. */
  evaluate: (record: TimeRecord, employeeRole: string) => ComplianceFlag[];
}

/**
 * Display-level shape of a drafted communication (module-nexus-local; avoids a cross-module
 * import of TTDraft from module-scribe). Structurally compatible with TTDraft so the composition
 * root can assign module-scribe's TTDraft directly without casting.
 */
export interface TravelDraftResult {
  communication_type: string;
  subject?: string;
  body: string;
}

/**
 * Injectable drafting port for tt.travel-drafter — wired at the composition root (NexusApp.tsx)
 * using module-scribe's runTTDraft engine. Absent means travel decisions produce no draft (the
 * pre-Session-30 behaviour that WE-10 identified as the gap).
 *
 * D1 (WE-10) root cause: decideTravel never invoked this port — drafting engine was never called
 * on the travel path. Fix: port is called async after recordTravelDecision and the draft is stored
 * on SubmittedTravelItem, displayed inline in TravelQueueRow.
 */
export interface TravelDrafterPort {
  draft: (
    request: TravelRequest,
    finding: TravelComplianceFinding
  ) => Promise<{ draft: TravelDraftResult; tier: string }>;
}

export interface TTIntakePorts {
  /** Active TravelPolicy (FLOWPATH-elicited; synthetic/dev backing this session). */
  travelPolicy: TravelPolicy;
  travelContext?: TravelEvaluationContext;
  /** Absent = time records are recorded but not evaluated (surfaced honestly in the UI). */
  timeEngine?: TimeCompliancePort;
  /**
   * Injectable drafting port for tt.travel-drafter. When provided, a draft communication is
   * generated async after each travel decision and stored on the SubmittedTravelItem.
   * When absent, no draft is produced (draftStatus stays 'idle').
   */
  travelDrafter?: TravelDrafterPort;
  /**
   * Session 29 (WE-5) — pre-seed the queues (dev/demo, SYNTH- data only), the
   * useAlertQueue.initialAlerts precedent: seeds enter WITHOUT Logger emission
   * (no fabricated audit events for records nobody just processed). Findings
   * for seeded travel requests are recomputed PURELY from the active policy.
   */
  seedTravel?: TravelRequest[];
  seedTime?: Array<{ record: TimeRecord; flags: ComplianceFlag[] }>;
  /**
   * D4 (Session 61) — hold the travel/time queues in the session-persistent
   * store (tt-session.ts) instead of per-mount state, so decided items do not
   * reappear on remount (D3-3). The seeds then feed the store's ONE
   * per-session assembly. Read once at mount. Off by default so store-less
   * tests keep isolated state.
   */
  sessionStore?: boolean;
}

/** One submitted travel request with its engine finding, held in the authority queue. */
export interface SubmittedTravelItem {
  request: TravelRequest;
  finding: TravelComplianceFinding;
  workflow_step_id: string;
  /**
   * D1 (WE-10): the communication draft produced by tt.travel-drafter after the manager's
   * decision. Absent until the decision is recorded; null if the drafter port is not wired.
   */
  draft?: TravelDraftResult | null;
  draftTier?: string;
  /** 'idle' = no drafter port wired · 'loading' = async draft in flight · 'done' / 'error' */
  draftStatus?: 'idle' | 'loading' | 'done' | 'error';
  draftError?: string;
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
  // Seeds are computed ONCE (mount) — pure evaluation, zero Logger events.
  const seededTravel = useMemo<SubmittedTravelItem[]>(
    () =>
      (ports.seedTravel ?? []).map((request) => ({
        request,
        finding: evaluateTravelRequest(request, ports.travelPolicy, ports.travelContext ?? {}),
        workflow_step_id: travelWorkflowStep(request.request_id),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const seededTime = useMemo<SubmittedTimeItem[]>(
    () =>
      (ports.seedTime ?? []).map(({ record, flags }) => ({
        record,
        flags,
        evaluated: true,
        workflow_step_id: `tt-time-${record.record_id}`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // D4 — read once at mount (documented on the option). With the store, the
  // seeds feed ONE per-session assembly; a remount receives the live queues.
  const sessionStore = ports.sessionStore ?? false;
  const ensured = useMemo(
    () => (sessionStore ? ensureTTSession({ travel: seededTravel, time: seededTime }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const travelRef = useRef<SubmittedTravelItem[]>(ensured ? [...ensured.travel] : seededTravel);
  const timeRef = useRef<SubmittedTimeItem[]>(ensured ? [...ensured.time] : seededTime);
  const [travelItems, setTravelItems] = useState<SubmittedTravelItem[]>(travelRef.current);
  const [timeItems, setTimeItems] = useState<SubmittedTimeItem[]>(timeRef.current);
  const [error, setError] = useState<string | null>(null);

  // D4 — the single commit choke points: every mutation writes ref + state and,
  // on the store path, mirrors into the session store (which notifies only on
  // actual change — no echo loop).
  const commitTravel = useCallback(
    (next: SubmittedTravelItem[]): void => {
      travelRef.current = next;
      setTravelItems([...next]);
      if (sessionStore) setTTSessionTravel(next);
    },
    [sessionStore]
  );
  const commitTime = useCallback(
    (next: SubmittedTimeItem[]): void => {
      timeRef.current = next;
      setTimeItems([...next]);
      if (sessionStore) setTTSessionTime(next);
    },
    [sessionStore]
  );

  // D4 — the live session-store subscription (same external-store pattern as
  // the VIGIL/ARIA session stores): a store change from any writer refreshes
  // this hook's ref + rendered state.
  useEffect(() => {
    if (!sessionStore) return;
    return subscribeTTSession((snapshot) => {
      travelRef.current = [...snapshot.travel];
      timeRef.current = [...snapshot.time];
      setTravelItems(travelRef.current);
      setTimeItems(timeRef.current);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        commitTravel([...travelRef.current, item]);
      } catch (err) {
        // Gate 2 fail-closed: an emit failure mid-pipeline commits nothing.
        setError(
          `Travel submission halted — Logger emission failed (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    },
    [actorId, ctx, ports, commitTravel]
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
        const hasDrafter = Boolean(ports.travelDrafter);
        commitTravel(
          travelRef.current.map((t) =>
            t.request.request_id === requestId
              ? { ...t, request: decided.request, draftStatus: hasDrafter ? "loading" : "idle" }
              : t
          )
        );

        if (ports.travelDrafter) {
          const drafter = ports.travelDrafter;
          drafter.draft(decided.request, item.finding).then(
            ({ draft, tier }) => {
              commitTravel(
                travelRef.current.map((t) =>
                  t.request.request_id === requestId
                    ? { ...t, draft, draftTier: tier, draftStatus: "done" as const }
                    : t
                )
              );
            },
            (err: unknown) => {
              commitTravel(
                travelRef.current.map((t) =>
                  t.request.request_id === requestId
                    ? {
                        ...t,
                        draftStatus: "error" as const,
                        draftError: err instanceof Error ? err.message : String(err),
                      }
                    : t
                )
              );
            }
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [ctx, ports, commitTravel]
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
        commitTime([
          ...timeRef.current,
          { record, flags: [], evaluated: false, workflow_step_id: wsid },
        ]);
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

        commitTime([
          ...timeRef.current,
          { record, flags, evaluated: true, workflow_step_id: wsid },
        ]);
      } catch (err) {
        setError(
          `Time record submission halted — Logger emission failed (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    },
    [actorId, ctx, ports, commitTime]
  );

  const clearError = useCallback((): void => setError(null), []);

  return { travelItems, timeItems, error, submitTravel, submitTime, decideTravel, previewTravel, clearError };
}
