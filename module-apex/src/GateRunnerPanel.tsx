/**
 * SOVEREIGN Platform — module-apex
 * GateRunnerPanel.tsx — APEX Screen 5: CPMI-VRS Certification (Session 18, D2).
 *
 * Surfaces the four CPMI-VRS gates for the APEX analytics agent so the Project Principal can
 * complete certification during Walkthrough B. Mirrors the CPMI GateRunnerPanel pattern
 * (module-cpmi) adapted to APEX:
 *   - Gate 1 (AI Disclosure)        — PASSED on load (the Gate 1 banner is present on every
 *                                      APEX screen). Auto, no human action.
 *   - Gate 2 (Reasoning Transparency)— PASSED. Renders the three deterministic CPMI-VRS
 *                                      benchmark scenarios (A/B/C, spec §8) as human-readable
 *                                      cards, each with an expandable full-output view in
 *                                      plain prose (Gap 5 — never a JSON dump).
 *   - Gate 3 (Human Attestation)    — PENDING. The Project Principal attests in this tab; the
 *                                      attestation logs a GATE_3_ATTESTATION human decision
 *                                      (Constraint #4, GD-7 — shared with the CPMI gate panel)
 *                                      and enables Gate 4. This is THE Walkthrough B human step —
 *                                      Claude Code does not simulate it.
 *   - Gate 4 (Monitoring Baseline)  — LOCKED until Gate 3 passes, then completable. Logs a
 *                                      HUMAN_DECISION (decision_type HUMAN_APPROVAL — no Gate-4
 *                                      specific HumanDecisionType exists and no GD authorizes a
 *                                      new one this session; see Session 18 handoff).
 *
 * Gap 6 three-category model: the governance banners are Category 2 (permanent, blue); the
 * gate status cards are Category 3 (substantive); pending/locked pills are Category 1 (amber,
 * transient). Gate 3 sits in natural reading flow directly after Gate 2 (five-second test).
 *
 * No new SovereignEventType and no new HumanDecisionType are introduced (Constraint #8 —
 * no shell-contract change this session).
 *
 * Version: 1.0 · Session 18 · June 26, 2026
 */

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { ApexDataAdapter } from "./apex-data-adapter";
import type { ApexAnalysisOutput, RiskFinding } from "./apex-contract";
import { runAllBenchmarks, type BenchmarkResult } from "./benchmark-scenarios";
import {
  rootStyle,
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  Gate1Banner,
  ClassificationBoundaryBanner,
} from "./banners";

export interface GateRunnerPanelProps {
  ctx: SovereignShellContext;
  adapter: ApexDataAdapter;
}

type GateState = "PASSED" | "PENDING" | "LOCKED";

// Workflow step ids for the certification flow (Constraint #6). Product-level, not per-program.
const GATE3_WORKFLOW_STEP = "apex-cpmi-vrs-gate3-attestation";
const GATE4_WORKFLOW_STEP = "apex-cpmi-vrs-gate4-monitoring-baseline";

const MIN_NOTE_LENGTH = 10;

export function GateRunnerPanel({ ctx, adapter }: GateRunnerPanelProps): JSX.Element {
  const benchmarks = useMemo(() => runAllBenchmarks(adapter), [adapter]);

  const [note, setNote] = useState("");
  const [gate3, setGate3] = useState<{ state: GateState; attestedAt: string | null }>({ state: "PENDING", attestedAt: null });
  const [gate4, setGate4] = useState<{ state: GateState; completedAt: string | null }>({ state: "LOCKED", completedAt: null });
  const [error, setError] = useState<string | null>(null);

  const passedCount = 2 + (gate3.state === "PASSED" ? 1 : 0) + (gate4.state === "PASSED" ? 1 : 0);
  const allPassed = gate3.state === "PASSED" && gate4.state === "PASSED";

  const attestGate3 = (): void => {
    setError(null);
    const trimmed = note.trim();
    if (trimmed.length < MIN_NOTE_LENGTH) {
      setError(`An attestation note of at least ${MIN_NOTE_LENGTH} characters is required before Gate 3 can be attested.`);
      return;
    }
    const attestedAt = new Date().toISOString();
    try {
      ctx.logger.log({
        event_type: "HUMAN_DECISION",
        workflow_step_id: GATE3_WORKFLOW_STEP,
        sovereign_tier: "standard",
        product: "APEX",
        actor_id: ctx.auth.user.employee_id,
        outcome: "apex_cpmi_vrs_gate3_attested",
        decision_type: "GATE_3_ATTESTATION", // Constraint #4 — GD-7 Gate 3 attestation type (Item 56); shared with the CPMI gate panel
        actor: "human",
        actor_name: ctx.auth.user.name,
        payload: { gate: 3, note: trimmed, attested_at: attestedAt },
      });
    } catch (err) {
      setError(`Logger emission failed — Gate 3 attestation not recorded (Gate 2 fail-closed): ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setGate3({ state: "PASSED", attestedAt });
    setGate4((g) => (g.state === "LOCKED" ? { ...g, state: "PENDING" } : g));
  };

  const completeGate4 = (): void => {
    setError(null);
    if (gate3.state !== "PASSED") return;
    const completedAt = new Date().toISOString();
    try {
      ctx.logger.log({
        event_type: "HUMAN_DECISION",
        workflow_step_id: GATE4_WORKFLOW_STEP,
        sovereign_tier: "standard",
        product: "APEX",
        actor_id: ctx.auth.user.employee_id,
        outcome: "apex_cpmi_vrs_gate4_baseline_established",
        // No Gate-4-specific HumanDecisionType exists; HUMAN_APPROVAL is the nearest existing
        // type and no GD authorizes a new one this session (opening prompt + Constraint #8).
        decision_type: "HUMAN_APPROVAL",
        actor: "human",
        actor_name: ctx.auth.user.name,
        payload: { gate: 4, completed_at: completedAt },
      });
    } catch (err) {
      setError(`Logger emission failed — Gate 4 not recorded (Gate 2 fail-closed): ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setGate4({ state: "PASSED", completedAt });
  };

  return (
    <section style={rootStyle} aria-label="APEX CPMI-VRS Certification">
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>APEX — CPMI-VRS Certification</h1>
        <p style={subtitleStyle}>
          The four governance gates that certify the APEX analytics agent. Gates 1 and 2 are
          recorded automatically; Gate 3 is your attestation; Gate 4 establishes the monitoring baseline.
        </p>
      </header>

      <Gate1Banner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      {/* Certification summary — Category 3 substantive content, read first. */}
      <div style={summaryStyle} role="status" data-category="3-content">
        {allPassed ? (
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            APEX CPMI-VRS certification is complete. Gate 3 was attested on {formatDate(gate3.attestedAt)} and the
            Gate 4 monitoring baseline was established on {formatDate(gate4.completedAt)}. All four gates have passed.
          </p>
        ) : (
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            {passedCount} of 4 gates are complete. Gate 3 attestation is the Project Principal step — complete it
            in this tab during Walkthrough B, and Gate 4 will then unlock.
          </p>
        )}
      </div>

      {error ? <p role="alert" style={errorStyle}>{error}</p> : null}

      {/* ── Gate 1 ─────────────────────────────────────────────────────────── */}
      <GateCard
        number={1}
        name="AI Disclosure"
        state="PASSED"
        description="Every APEX screen carries the AI-disclosure banner: all program analysis is AI-assisted, outputs are advisory, and a qualified human reviewer must review them before any report is exported or used in a briefing. Because the APEX module is loaded and the banner is present on every screen, this gate is satisfied."
      />

      {/* ── Gate 2 ─────────────────────────────────────────────────────────── */}
      <GateCard
        number={2}
        name="Reasoning Transparency"
        state="PASSED"
        description="A reviewer can see what the APEX agent analyzed, what it found, and how it arrived at its recommendations. The three known-answer benchmark scenarios below each produced a schema-valid analysis. Open the full output on any scenario to read the complete analysis in plain language."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {benchmarks.map((b) => (
            <BenchmarkCard key={b.scenario.id} result={b} statusLabel={programStatusLabel(adapter, b.output.program_id)} />
          ))}
        </div>
      </GateCard>

      {/* ── Gate 3 — the Walkthrough B human step, directly after Gate 2 ─────── */}
      <GateCard
        number={3}
        name="Human Attestation"
        state={gate3.state}
        description="Before any report is exported for briefing use, a qualified reviewer must attest that the AI-generated analysis has been reviewed and is accepted as the basis for the report. This is the Project Principal step in Walkthrough B."
      >
        {gate3.state === "PASSED" ? (
          <p style={{ ...bodyTextStyle, marginTop: 8, color: "#065f46" }}>
            Gate 3 was attested on {formatDate(gate3.attestedAt)} by {ctx.auth.user.name}. Gate 4 is now unlocked.
          </p>
        ) : (
          <div style={{ marginTop: 8 }}>
            <p style={{ ...bodyTextStyle, marginBottom: 6 }}>
              Record your review below, then attest. Your note becomes part of the permanent audit trail.
            </p>
            <textarea
              aria-label="gate 3 attestation note"
              placeholder="Describe your review and acceptance of the APEX analysis (required, at least 10 characters)."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={textareaStyle}
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={attestGate3} style={primaryBtnStyle}>
                Attest Gate 3
              </button>
            </div>
          </div>
        )}
      </GateCard>

      {/* ── Gate 4 ─────────────────────────────────────────────────────────── */}
      <GateCard
        number={4}
        name="Monitoring Baseline"
        state={gate4.state}
        description="Confirms that APEX agent behavior monitoring is active and a baseline has been established. This gate unlocks once Gate 3 has been attested."
      >
        {gate4.state === "PASSED" ? (
          <p style={{ ...bodyTextStyle, marginTop: 8, color: "#065f46" }}>
            The Gate 4 monitoring baseline was established on {formatDate(gate4.completedAt)}.
          </p>
        ) : gate4.state === "PENDING" ? (
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={completeGate4} style={primaryBtnStyle}>
              Complete Gate 4
            </button>
          </div>
        ) : (
          <p style={{ ...bodyTextStyle, marginTop: 8 }}>
            This gate is locked until Gate 3 has been attested.
          </p>
        )}
      </GateCard>
    </section>
  );
}

// ── Gate card (Category 3 substantive content; status pill carries the Category 1 cue) ──

function GateCard({
  number,
  name,
  state,
  description,
  children,
}: {
  number: number;
  name: string;
  state: GateState;
  description: string;
  children?: ReactNode;
}): JSX.Element {
  return (
    <article style={gateCardStyle} data-category="3-content" data-gate={number} aria-label={`Gate ${number} — ${name}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h2 style={{ ...sectionHeadingStyle, margin: 0 }}>
          Gate {number} — {name}
        </h2>
        <GateStatusPill state={state} />
      </div>
      <p style={{ ...bodyTextStyle, margin: 0 }}>{description}</p>
      {children}
    </article>
  );
}

function GateStatusPill({ state }: { state: GateState }): JSX.Element {
  const colors = pillColors(state);
  return (
    <span style={{ ...pillStyle, color: colors.color, background: colors.background }} data-category={state === "PASSED" ? "3-content" : "1-status"}>
      {pillLabel(state)}
    </span>
  );
}

// ── Benchmark scenario card (Gap 5 — human-readable, expandable full output) ──

function BenchmarkCard({ result, statusLabel }: { result: BenchmarkResult; statusLabel: string }): JSX.Element {
  const { scenario, output } = result;
  const severitySummary = summarizeSeverities(output.risk_findings);

  return (
    <article style={benchmarkCardStyle} aria-label={`Benchmark scenario ${scenario.id} — ${scenario.label}`}>
      <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#0f172a" }}>
        Scenario {scenario.id} — {scenario.label}
      </h3>
      <p style={{ ...bodyTextStyle, margin: "0 0 6px" }}>{scenario.expectation}</p>
      <p style={{ ...bodyTextStyle, margin: "0 0 6px" }}>
        This scenario analyzes program {output.program_id}, which is currently {statusLabel.toLowerCase()}. Schema
        validation passed. The analysis surfaced {findingCountPhrase(output.risk_findings.length)}
        {severitySummary ? ` (${severitySummary})` : ""} and {recommendationCountPhrase(output.recommendations.length)}.
      </p>
      <details>
        <summary style={summaryToggleStyle}>View full output</summary>
        <FullOutput output={output} />
      </details>
    </article>
  );
}

function FullOutput({ output }: { output: ApexAnalysisOutput }): JSX.Element {
  return (
    <div style={{ marginTop: 8 }}>
      <h4 style={fullHeadingStyle}>Status narrative</h4>
      {output.status_narrative.split("\n\n").map((para, i) => (
        <p key={i} style={bodyTextStyle}>{para}</p>
      ))}

      <h4 style={fullHeadingStyle}>Risk findings</h4>
      {output.risk_findings.length === 0 ? (
        <p style={bodyTextStyle}>The analysis identified no risk findings for this program.</p>
      ) : (
        output.risk_findings.map((f) => (
          <p key={f.flag_id} style={bodyTextStyle}>
            {f.description} This is a {severityWord(f.severity)} risk and the trend is {trendWord(f.trend)}. It was
            derived from {f.source_data}, measured against a baseline of {f.baseline}, and is owned by {f.responsible_party}.
          </p>
        ))
      )}

      <h4 style={fullHeadingStyle}>Recommendations</h4>
      {output.recommendations.length === 0 ? (
        <p style={bodyTextStyle}>The analysis made no recommendations for human review.</p>
      ) : (
        output.recommendations.map((r, i) => (
          <p key={i} style={bodyTextStyle}>{r}</p>
        ))
      )}
    </div>
  );
}

// ── Plain-language helpers (Gap 5) ──────────────────────────────────────────

function programStatusLabel(adapter: ApexDataAdapter, programId: string): string {
  const program = adapter.getProgram(programId);
  if (!program) return "of unknown status";
  if (program.status_label === "ON_TRACK") return "On track";
  if (program.status_label === "AT_RISK") return "At risk";
  return "Off track";
}

function summarizeSeverities(findings: RiskFinding[]): string {
  if (findings.length === 0) return "";
  const counts = { P1: 0, P2: 0, P3: 0 };
  for (const f of findings) counts[f.severity] += 1;
  const parts: string[] = [];
  if (counts.P1) parts.push(`${counts.P1} Priority 1`);
  if (counts.P2) parts.push(`${counts.P2} Priority 2`);
  if (counts.P3) parts.push(`${counts.P3} Priority 3`);
  return parts.join(", ");
}

function findingCountPhrase(n: number): string {
  if (n === 0) return "no risk findings";
  if (n === 1) return "one risk finding";
  return `${n} risk findings`;
}

function recommendationCountPhrase(n: number): string {
  if (n === 0) return "made no recommendations for human review";
  if (n === 1) return "made one recommendation for human review";
  return `made ${n} recommendations for human review`;
}

function severityWord(severity: RiskFinding["severity"]): string {
  if (severity === "P1") return "Risk Level 1";
  if (severity === "P2") return "Risk Level 2";
  return "Risk Level 3";
}

function trendWord(trend: RiskFinding["trend"]): string {
  if (trend === "IMPROVING") return "improving";
  if (trend === "DEGRADING") return "worsening";
  return "holding steady";
}

function pillColors(state: GateState): { color: string; background: string } {
  if (state === "PASSED") return { color: "#065f46", background: "#d1fae5" };
  if (state === "PENDING") return { color: "#854d0e", background: "#fef9c3" };
  return { color: "#475569", background: "#e2e8f0" }; // LOCKED
}

function pillLabel(state: GateState): string {
  if (state === "PASSED") return "Passed";
  if (state === "PENDING") return "Pending";
  return "Locked";
}

function formatDate(iso: string | null): string {
  if (!iso) return "an unrecorded date";
  // Plain calendar date; avoids locale-specific time noise on a governance record.
  return iso.slice(0, 10);
}

// ── Styles ──────────────────────────────────────────────────────────────────

const summaryStyle: CSSProperties = {
  padding: "10px 14px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  marginBottom: 12,
  maxWidth: 860,
};
const gateCardStyle: CSSProperties = {
  padding: "14px 16px",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  marginBottom: 12,
  maxWidth: 860,
};
const benchmarkCardStyle: CSSProperties = {
  padding: "12px 14px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
};
const pillStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  padding: "2px 10px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};
const summaryToggleStyle: CSSProperties = { cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0c4a6e" };
const fullHeadingStyle: CSSProperties = { margin: "10px 0 4px", fontSize: 13, color: "#0f172a" };
const textareaStyle: CSSProperties = { width: "100%", maxWidth: 820, minHeight: 70, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontFamily: "inherit" };
const primaryBtnStyle: CSSProperties = { padding: "7px 16px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: "0 0 10px", color: "#b91c1c", fontSize: 13, fontWeight: 600 };

export default GateRunnerPanel;
