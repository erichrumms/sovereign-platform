/**
 * SOVEREIGN Platform — module-apex
 * PPBEAgentsPanel.tsx — clickable triggers for the two APEX-hosted PPBE
 * workflow agents (ppbe-evidence-synthesizer, ppbe-scenario-analyst).
 *
 * Part 2 (Session 38 Walkthrough F fix): both agents existed but had zero
 * call sites outside their own definition files. This panel wires them to
 * real, clickable UI triggers in the Execution Monitoring tab. Static
 * fallback is expected (no API key in dev) and is honestly labeled.
 *
 * Both agents are Tier A (advisory only — docs/18 §6); every output carries
 * the mandatory advisory label. No PPBE decision proceeds from this panel
 * without human review.
 *
 * All LLM access via createSovereignClient() (Constraint #5). Prompts are
 * loaded at build time via Vite ?raw imports from ppbe/prompts/ (APPROVED v1.0).
 * Static fallback kicks in when no API key is present and is clearly disclosed.
 *
 * Version: 1.0 · Session 38 · July 16, 2026
 */

import { useState, type CSSProperties } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignLLMResponse, SovereignMessage, SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  runEvidenceSynthesis,
  PPBE_ADVISORY_LABEL,
  PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
  synthesisWorkflowStep,
  type EvidenceSynthesisInput,
  type SynthesisOutcome,
} from "./ppbe-evidence-synthesizer";
import {
  runScenarioAnalysis,
  PPBE_SCENARIO_LABEL,
  PPBE_SCENARIO_ANALYST_AGENT_ID,
  scenarioWorkflowStep,
  type ScenarioAnalysisInput,
  type ScenarioOutcome,
} from "./ppbe-scenario-analyst";
import { createSyntheticApexDataAdapter } from "./apex-data-adapter";
import { readAnthropicKey } from "./anthropic-key";
import type { PPBEDashboardInputs } from "./ppbe-dashboard";

import evidencePromptRaw from "../../ppbe/prompts/evidence_synthesis_system.md?raw";
import scenarioPromptRaw from "../../ppbe/prompts/scenario_analysis_system.md?raw";

const EVIDENCE_SYSTEM_PROMPT = evidencePromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");
const SCENARIO_SYSTEM_PROMPT = scenarioPromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");
const FISCAL_CONTEXT = "FY 2026 Q3 — Execution Monitoring";

type AgentStatus = "idle" | "running" | "done";

export interface PPBEAgentsPanelProps {
  ctx: SovereignShellContext;
  inputs: PPBEDashboardInputs;
}

function makeComplete(): (messages: SovereignMessage[], reqCtx: SovereignRequestContext) => Promise<SovereignLLMResponse> {
  return async (messages, reqCtx) => {
    const client = createSovereignClient({ tier: "standard" }, { api_key_anthropic: readAnthropicKey() });
    return client.complete(messages, reqCtx);
  };
}

export function PPBEAgentsPanel({ ctx: _ctx, inputs }: PPBEAgentsPanelProps): JSX.Element {
  const apexPrograms = createSyntheticApexDataAdapter().listPrograms();

  const [synthStatus, setSynthStatus] = useState<AgentStatus>("idle");
  const [synthOutcome, setSynthOutcome] = useState<SynthesisOutcome | null>(null);

  const [scenStatus, setScenStatus] = useState<AgentStatus>("idle");
  const [scenOutcome, setScenOutcome] = useState<ScenarioOutcome | null>(null);

  async function runSynthesis(): Promise<void> {
    setSynthStatus("running");
    const evidenceInput: EvidenceSynthesisInput = {
      findings: inputs.findings,
      programs: apexPrograms,
      fiscal_context: FISCAL_CONTEXT,
    };
    const wsid = synthesisWorkflowStep(evidenceInput);
    const reqCtx: SovereignRequestContext = {
      workflow_step_id: wsid,
      product: "APEX",
      agent_id: PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
      tier: "standard",
    };
    const outcome = await runEvidenceSynthesis(evidenceInput, EVIDENCE_SYSTEM_PROMPT, reqCtx, { complete: makeComplete() });
    setSynthOutcome(outcome);
    setSynthStatus("done");
  }

  async function runScenario(): Promise<void> {
    setScenStatus("running");
    const scenInput: ScenarioAnalysisInput = {
      programs: inputs.programs,
      fiscal_context: FISCAL_CONTEXT,
    };
    const wsid = scenarioWorkflowStep(scenInput);
    const reqCtx: SovereignRequestContext = {
      workflow_step_id: wsid,
      product: "APEX",
      agent_id: PPBE_SCENARIO_ANALYST_AGENT_ID,
      tier: "standard",
    };
    const outcome = await runScenarioAnalysis(scenInput, SCENARIO_SYSTEM_PROMPT, reqCtx, { complete: makeComplete() });
    setScenOutcome(outcome);
    setScenStatus("done");
  }

  return (
    <section style={sectionStyle} aria-label="PPBE Workflow Agents">
      <h2 style={headingStyle}>PPBE Workflow Agents</h2>
      <p style={noteStyle}>
        Tier A agents — advisory only (docs/18 §6). All outputs carry the mandatory advisory
        label. No PPBE decision proceeds from this panel without human review.
      </p>

      {/* ── Evidence Synthesizer ── */}
      <div style={agentCardStyle}>
        <div style={agentHeaderStyle}>
          <strong style={agentTitleStyle}>ppbe-evidence-synthesizer</strong>
          <span style={tierBadgeStyle(synthOutcome?.tier)}>
            {synthOutcome ? synthOutcome.tier.toUpperCase() : "NOT RUN"}
          </span>
        </div>
        <p style={agentDescStyle}>
          Aggregates evaluation findings across programs into synthesis reports for planning and
          programming reviews (docs/18 §7.2). Advisory output.
        </p>
        <button
          type="button"
          style={synthStatus === "running" ? btnDisabledStyle : btnStyle}
          disabled={synthStatus === "running"}
          onClick={() => void runSynthesis()}
          data-testid="ppbe-run-evidence-synthesis"
        >
          {synthStatus === "running" ? "Running…" : "Run Evidence Synthesis"}
        </button>

        {synthOutcome && (
          <div style={outputStyle} data-testid="ppbe-evidence-synthesis-output">
            <span style={advisoryStyle}>{PPBE_ADVISORY_LABEL}</span>
            <h4 style={outputTitleStyle}>{synthOutcome.report.report_title}</h4>
            <p style={outputBodyStyle}>{synthOutcome.report.summary}</p>
            {synthOutcome.report.key_findings.map((kf, i) => (
              <p key={i} style={outputBodyStyle}>{kf.statement}</p>
            ))}
            {synthOutcome.tier === "static" && <StaticTierNote />}
          </div>
        )}
      </div>

      {/* ── Scenario Analyst ── */}
      <div style={agentCardStyle}>
        <div style={agentHeaderStyle}>
          <strong style={agentTitleStyle}>ppbe-scenario-analyst</strong>
          <span style={tierBadgeStyle(scenOutcome?.tier)}>
            {scenOutcome ? scenOutcome.tier.toUpperCase() : "NOT RUN"}
          </span>
        </div>
        <p style={agentDescStyle}>
          Models alternative resource allocations and their projected performance implications
          across program portfolios (docs/18 §7.2). Scenario modeling only — never recommends
          execution.
        </p>
        <button
          type="button"
          style={scenStatus === "running" ? btnDisabledStyle : btnStyle}
          disabled={scenStatus === "running"}
          onClick={() => void runScenario()}
          data-testid="ppbe-run-scenario-analysis"
        >
          {scenStatus === "running" ? "Running…" : "Run Scenario Analysis"}
        </button>

        {scenOutcome && (
          <div style={outputStyle} data-testid="ppbe-scenario-analysis-output">
            <span style={advisoryStyle}>{PPBE_SCENARIO_LABEL}</span>
            <h4 style={outputTitleStyle}>{scenOutcome.report.report_title}</h4>
            <p style={outputBodyStyle}>{scenOutcome.report.baseline_description}</p>
            {scenOutcome.report.scenarios.map((s, i) => (
              <div key={i} style={{ marginTop: 6 }}>
                <strong style={{ fontSize: 12 }}>{s.scenario_name}</strong>
                <p style={outputBodyStyle}>{s.projected_performance_impact}</p>
              </div>
            ))}
            {scenOutcome.tier === "static" && <StaticTierNote />}
          </div>
        )}
      </div>
    </section>
  );
}

function StaticTierNote(): JSX.Element {
  return (
    <p style={staticNoteStyle}>
      Static tier — LLM service unavailable in dev (no API key). Output was assembled
      deterministically from seeded records, not generated by the model. A reviewer should
      read the underlying findings before acting on this output.
    </p>
  );
}

const sectionStyle: CSSProperties = {
  margin: "16px 0 0", padding: "14px 16px", border: "1px solid #e2e8f0",
  borderRadius: 10, background: "#ffffff",
};
const headingStyle: CSSProperties = { margin: "0 0 4px", fontSize: 15, fontWeight: 700 };
const noteStyle: CSSProperties = { margin: "0 0 12px", fontSize: 12, color: "#475569" };
const agentCardStyle: CSSProperties = {
  padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", marginBottom: 12,
};
const agentHeaderStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 };
const agentTitleStyle: CSSProperties = { fontSize: 13, color: "#0f172a" };
const agentDescStyle: CSSProperties = { margin: "0 0 8px", fontSize: 12, color: "#64748b" };
const outputStyle: CSSProperties = {
  marginTop: 10, padding: 10, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6,
};
const outputTitleStyle: CSSProperties = { margin: "8px 0 4px", fontSize: 13, color: "#0f172a" };
const outputBodyStyle: CSSProperties = { margin: "0 0 4px", fontSize: 12, color: "#334155" };
const advisoryStyle: CSSProperties = {
  padding: "2px 8px", background: "#eff6ff", border: "1px solid #bfdbfe",
  borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#1e40af", display: "inline-block",
};
const staticNoteStyle: CSSProperties = {
  margin: "6px 0 0", padding: "6px 8px", background: "#fef2f2", borderRadius: 4,
  fontSize: 11, color: "#7f1d1d", border: "1px solid #fecaca",
};
const btnStyle: CSSProperties = {
  padding: "6px 14px", borderRadius: 6, border: "1px solid #0c4a6e",
  background: "#0c4a6e", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600,
};
const btnDisabledStyle: CSSProperties = {
  ...btnStyle, background: "#e2e8f0", borderColor: "#cbd5e1", color: "#475569", cursor: "not-allowed",
};

function tierBadgeStyle(tier?: string): CSSProperties {
  if (tier === "live") return { fontSize: 10, fontWeight: 700, color: "#065f46", padding: "2px 6px", borderRadius: 999, background: "#d1fae5" };
  if (tier === "cache") return { fontSize: 10, fontWeight: 700, color: "#92400e", padding: "2px 6px", borderRadius: 999, background: "#fef3c7" };
  if (tier === "static") return { fontSize: 10, fontWeight: 700, color: "#7f1d1d", padding: "2px 6px", borderRadius: 999, background: "#fee2e2" };
  return { fontSize: 10, fontWeight: 700, color: "#475569", padding: "2px 6px", borderRadius: 999, background: "#f1f5f9" };
}

export default PPBEAgentsPanel;
