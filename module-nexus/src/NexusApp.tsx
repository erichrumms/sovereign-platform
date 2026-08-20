/**
 * SOVEREIGN Platform — module-nexus
 * NexusApp.tsx — NEXUS composition root (React).
 *
 * The single component the module mounts (via index.ts → createRoot) after the structural
 * role gate admits the operator. It lifts the work-request registry hook and the AgentOS
 * port ONCE here and passes them to the surfaces so they share one request list, then
 * renders the NEXUS chrome — including the Gate-1 AI disclosure and the GD-10 classification
 * boundary notice — with two tabs: Request Intake and the Request Queue (which shows the
 * selected request's detail).
 *
 * Item 57 (Session 22, D2): the AgentOS hand-off uses the LIVE AgentOS-backed port
 * (createAgentOSBackedPort) instead of the Session 15 synthetic dev port. The live port creates
 * a real AgentOS task, emits AGENTOS_TASK_ASSIGNED, and — via GD-19's shared task surface
 * (ctx.taskSurface, the ninth shell export) — publishes the task so it appears in the AgentOS
 * Task Registry panel. This is a configuration change at the composition root, not a NEXUS
 * rewrite (Standing Constraint #3); useRequestRegistry still consumes the injected AgentOSPort.
 *
 * Session 29 (Walkthrough E findings WE-1/WE-5): the Time & Travel intake is wired here.
 * The intake dropdown gains the two TT types; a third tab shows the TT authority queue.
 * The time-compliance port follows the Item 57 pattern exactly — the composition root
 * imports module-apex's PURE tt.time-compliance-engine evaluation and injects it as
 * configuration (Standing Constraint #3); module-nexus's own code never imports
 * module-apex. The active TravelPolicy and charge accounts are the canonical synthetic
 * seeds from @sovereign/data (SYNTH- prefixed; a real deployment swaps in FLOWPATH
 * elicitation output by configuration).
 *
 * Session 30 D1 (WE-10): travelDrafter port wired here using module-scribe's runTTDraft
 * engine — same Item 57 / composition-root pattern as the apex engine above. After a manager
 * records a travel decision, the port calls runTTDraft (3-tier: live → cache → static) and
 * stores the draft on SubmittedTravelItem for inline display in TTQueuePanel. Logger bracketing
 * (AGENT_STEP_START/COMPLETE) emitted here; Gate 2 applies (failed START aborts the draft).
 *
 * Version: 1.3 · Session 30 · July 12, 2026
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { createSovereignClient, computeEstimatedCostUSD, SOVEREIGN_DEFAULT_MODEL } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import {
  SYNTH_TT_TRAVEL_POLICY,
  SYNTH_TT_CHARGE_ACCOUNTS,
  SYNTH_TT_TRAVEL_REQUESTS,
  SYNTH_TT_TIME_RECORDS,
  SYNTH_TT_COMPLIANCE_FLAGS,
} from "@sovereign/data";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useRequestRegistry } from "./useRequestRegistry";
import { createAgentOSBackedPort } from "../../module-agentos/src/nexus-agentos-port";
// Item 57 pattern (Session 29): composition-root wiring of the module-apex-hosted
// tt.time-compliance-engine as an injected port — configuration, not a NEXUS rewrite.
import {
  evaluateTimeRecord,
  TT_TIME_COMPLIANCE_ENGINE_AGENT_ID,
} from "../../module-apex/src/tt-time-compliance-engine";
import { SYNTH_TT_TIME_POLICY_CONFIG } from "../../module-apex/src/tt-synthetic-config";
// Item 57 pattern (Session 30 D1): composition-root wiring of module-scribe's
// tt.travel-drafter engine — Standing Constraint #5 (createSovereignClient, never
// raw Anthropic API) is met by module-scribe's readAnthropicKey + createSovereignClient.
import {
  runTTDraft,
  ttDraftWorkflowStepId,
  type TravelDraftInput,
  type TTDraftDeps,
} from "../../module-scribe/src/tt-draft-engine";
import { TT_TRAVEL_DRAFTER } from "../../module-scribe/src/tt-draft-contract";
import { TT_TRAVEL_DRAFTING_SYSTEM_PROMPT } from "../../module-scribe/src/prompts/tt-travel-drafting-system.prompt";
import { readAnthropicKey } from "../../module-scribe/src/anthropic-key";
import type { TTDraft } from "../../module-scribe/src/tt-draft-contract";
import { RequestIntakePanel } from "./RequestIntakePanel";
import { RequestQueuePanel } from "./RequestQueuePanel";
import { TTQueuePanel } from "./TTQueuePanel";
import { PPBECoordinationPanel } from "./PPBECoordinationPanel";
import { useTTIntake, type TTIntakePorts, type TravelDrafterPort } from "./useTTIntake";
import { publishNexusTravelItems } from "./nexus-workspace-publisher";

export interface NexusAppProps {
  ctx: SovereignShellContext;
  /** Injectable LLM call for the travelDrafter port (tests). Defaults to createSovereignClient(). */
  travelDrafterComplete?: TTDraftDeps["complete"];
}

type Tab = "intake" | "queue" | "tt" | "ppbe-coordination";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "intake", label: "Request Intake" },
  { id: "queue", label: "Request Queue" },
  { id: "tt", label: "Travel & Time Queue" },
  { id: "ppbe-coordination", label: "PPBE Coordination" },
];

export function NexusApp({ ctx, travelDrafterComplete }: NexusAppProps): JSX.Element {
  // Live AgentOS-backed port (Item 57): captures the shell ctx so its submitTask creates a real
  // AgentOS task and publishes it to ctx.taskSurface. Stable across renders (the request lifecycle
  // and AgentOS task store live behind it), mirroring the prior synthetic port's identity.
  const port = useMemo(() => createAgentOSBackedPort(ctx), [ctx]);
  const registry = useRequestRegistry(ctx, port);

  // D1 (WE-10): per-session draft cache — Tier 2 of the 3-tier fallback (live → cache → static).
  const drafterCacheRef = useRef<Map<string, TTDraft>>(new Map());

  // D1 (WE-10): travelDrafter port — wires module-scribe's runTTDraft into the NEXUS queue.
  // Follows the Item 57 / composition-root pattern: module-nexus code never calls runTTDraft
  // directly; the port is configuration injected here. ctx in deps so the Logger closure
  // always holds the live shell context reference.
  const travelDrafter = useMemo(
    (): TravelDrafterPort => ({
      draft: async (request, finding) => {
        const input: TravelDraftInput = {
          tool: "travel",
          request,
          policy: SYNTH_TT_TRAVEL_POLICY,
          flags: finding.findings,
        };
        const wsid = ttDraftWorkflowStepId(input);
        const actorId = ctx.auth.user.employee_id;

        const requestContext: SovereignRequestContext = {
          workflow_step_id: wsid,
          product: "SCRIBE",
          agent_id: TT_TRAVEL_DRAFTER,
          tier: "standard",
        };

        // Gate 2: AGENT_STEP_START. A failed emit aborts (fail-closed, Constraint #6).
        try {
          ctx.logger.log({
            event_type: "AGENT_STEP_START",
            workflow_step_id: wsid,
            sovereign_tier: "standard",
            product: "SCRIBE",
            actor_id: actorId,
            agent_id: TT_TRAVEL_DRAFTER,
            agent_class: "Operational",
            outcome: "tt_travel_draft_started",
            payload: { request_id: request.request_id, routing_tier: finding.routing_tier },
          });
        } catch (err) {
          throw new Error(
            `Logger emission failed — TT travel draft halted (CPMI-VRS Gate 2): ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }

        const deps: TTDraftDeps = {
          complete:
            travelDrafterComplete ??
            (async (messages, reqCtx) => {
              const client = createSovereignClient(
                { tier: "standard" },
                { api_key_anthropic: readAnthropicKey() }
              );
              return client.complete(messages, reqCtx);
            }),
          cacheGet: (key) => drafterCacheRef.current.get(key) ?? null,
          cacheSet: (key, value) => { drafterCacheRef.current.set(key, value); },
        };

        const result = await runTTDraft(input, TT_TRAVEL_DRAFTING_SYSTEM_PROMPT, requestContext, deps);
        const fellBack = result.tier !== "live";

        // Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE. A failed emit aborts.
        try {
          if (fellBack) {
            ctx.logger.log({
              event_type: "FALLBACK_ACTIVATED",
              workflow_step_id: wsid,
              sovereign_tier: "standard",
              product: "SCRIBE",
              actor_id: actorId,
              agent_id: TT_TRAVEL_DRAFTER,
              agent_class: "Operational",
              outcome: `tt_travel_draft_fallback_${result.tier}`,
              payload: { tier: result.tier, detail: result.detail },
            });
          }
          ctx.logger.log({
            event_type: "AGENT_STEP_COMPLETE",
            workflow_step_id: wsid,
            sovereign_tier: "standard",
            product: "SCRIBE",
            actor_id: actorId,
            agent_id: TT_TRAVEL_DRAFTER,
            agent_class: "Operational",
            outcome: "tt_travel_draft_complete",
            payload: { request_id: request.request_id, tier: result.tier, communication_type: result.draft.communication_type },
            ...(result.usage ? { token_usage: { ...result.usage, estimated_cost_usd: computeEstimatedCostUSD(SOVEREIGN_DEFAULT_MODEL, result.usage.input_tokens, result.usage.output_tokens), duration_ms: result.duration_ms, stop_reason: result.stop_reason, responded_at: result.responded_at } } : {}),
          });
        } catch (err) {
          throw new Error(
            `Logger emission failed — TT travel draft halted (CPMI-VRS Gate 2): ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }

        return { draft: result.draft, tier: result.tier };
      },
    }),
    [ctx, travelDrafterComplete]
  );

  // TT intake ports (Session 29): synthetic policy + the module-apex engine as configuration.
  // Session 30: travelDrafter port added (D1/WE-10).
  const ttPorts = useMemo(
    (): TTIntakePorts => ({
      travelPolicy: SYNTH_TT_TRAVEL_POLICY,
      travelDrafter,
      timeEngine: {
        agent_id: TT_TIME_COMPLIANCE_ENGINE_AGENT_ID,
        agent_class: "Governance",
        evaluate: (record, employeeRole) =>
          evaluateTimeRecord(record, SYNTH_TT_CHARGE_ACCOUNTS, employeeRole, SYNTH_TT_TIME_POLICY_CONFIG),
      },
      // WE-5 seed data: queues populated on mount (SYNTH- only; no Logger emission).
      seedTravel: SYNTH_TT_TRAVEL_REQUESTS,
      seedTime: SYNTH_TT_TIME_RECORDS.map((record) => ({
        record,
        flags: SYNTH_TT_COMPLIANCE_FLAGS.filter((f) => f.record_ref === record.record_id),
      })),
      // D4 (Session 61, D3-3): the queues live in the session-persistent store
      // (tt-session.ts) — a decided travel/time item no longer reappears when
      // NEXUS remounts. The seeds above feed the store's ONE per-session assembly.
      sessionStore: true,
    }),
    [travelDrafter]
  );
  const tt = useTTIntake(ctx, ttPorts);

  // Task 3 (WH-19): publish routed travel items to the Reviewer's Workspace surface
  // so they appear in the NEXUS panel. Reconciles on every change (decided items are
  // removed). Bidirectional: a decision in the Workspace updates tt-session, which
  // notifies useTTIntake, which triggers this effect and removes the item here too.
  useEffect(() => {
    publishNexusTravelItems(tt.travelItems, ctx.reviewerWorkspaceSurface, new Date().toISOString());
  }, [tt.travelItems, ctx.reviewerWorkspaceSurface]);

  const [tab, setTab] = useState<Tab>("intake");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>NEXUS</h1>
        <p style={subtitleStyle}>Work-Request Intake · Routing · Execution Hand-off to AgentOS</p>
      </header>

      <div style={disclosureStyle}>
        <strong>AI disclosure (CPMI-VRS Gate 1):</strong> NEXUS routes every work request to an AI agent class
        and hands execution to AgentOS, which runs the platform's governed agents. Requests requiring authorization
        are routed to the VIGIL approval queue. Outputs are advisory until human review.
      </div>

      {/* Session 122 (Session 121 survey Finding 1): corrected F-18 wording — the inline
          banner predated the Session 116 correction and lacked "before any model call",
          "the refusal is logged", and "content is not inspected". Intake framing kept. */}
      <div style={boundaryStyle}>
        <strong>Classification boundary (GD-10):</strong> SOVEREIGN processes <strong>UNCLASSIFIED</strong> synthetic
        data only. Requests marked CUI, SECRET, or TOP_SECRET are refused at intake — before any model
        call — and the refusal is logged. Classification labels are caller-supplied; content is not
        inspected. Operator: <strong>{ctx.auth.user.name}</strong>. Governance Clock OFF.
      </div>

      <nav style={tabBarStyle} aria-label="NEXUS surfaces">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{ ...tabStyle, color: active ? "#0f172a" : "#475569", borderBottom: active ? "2px solid #0f172a" : "2px solid transparent", fontWeight: active ? 700 : 500 }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div>
        {tab === "intake" && <RequestIntakePanel registry={registry} ctx={ctx} tt={tt} />}
        {tab === "queue" && (
          <RequestQueuePanel registry={registry} port={port} selectedId={selectedId} onSelect={setSelectedId} />
        )}
        {tab === "tt" && <TTQueuePanel tt={tt} />}
        {tab === "ppbe-coordination" && <PPBECoordinationPanel ctx={ctx} />}
      </div>
    </section>
  );
}

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif", padding: 32, color: "#0f172a", height: "100%", boxSizing: "border-box", overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 16 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const disclosureStyle: CSSProperties = {
  padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#1e40af", fontSize: 13, marginBottom: 10, maxWidth: 820,
};
// F-16 (Session 116): the GD-10 classification boundary is a permanent governance guardrail
// (Category 2 = blue), not a transient status notice. Aligned to the same blue palette as this
// module's own AI-disclosure banner and the APEX/ARIA/FLOWPATH boundary banners; the amber here
// was the older, inconsistent treatment. Colours match disclosureStyle above (AA-contrast).
const boundaryStyle: CSSProperties = {
  padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#1e40af", fontSize: 13, marginBottom: 16, maxWidth: 820,
};
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const tabStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };

export default NexusApp;
