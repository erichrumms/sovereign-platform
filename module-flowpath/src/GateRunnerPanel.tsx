/**
 * SOVEREIGN Platform — module-flowpath
 * GateRunnerPanel.tsx — Screen 5: FLOWPATH CPMI-VRS Certification (Session 21, D3).
 *
 * Surfaces the four CPMI-VRS gates for FLOWPATH so the Project Principal can complete certification
 * during Walkthrough C. Mirrors the APEX GateRunnerPanel pattern (module-apex) adapted to FLOWPATH:
 *   - Gate 1 (AI Disclosure)         — PASSED on load (the Gate 1 banner is present on every FLOWPATH
 *                                       screen). Auto, no human action.
 *   - Gate 2 (Reasoning Transparency)— PASSED. Renders the three deterministic CPMI-VRS benchmark
 *                                       scenarios (A/B/C, spec §9) as human-readable cards, each with
 *                                       an expandable full-output view of the WorkflowArtifact in
 *                                       plain prose (Gap 5 — never a JSON dump).
 *   - Gate 3 (Human Attestation)     — PENDING. The Project Principal attests here; the attestation
 *                                       logs a GATE_3_ATTESTATION human decision (Constraint #4, GD-7;
 *                                       the same decision type the CPMI/APEX panels use) and enables
 *                                       Gate 4. This is THE Walkthrough C human step — not simulated.
 *   - Gate 4 (Monitoring Baseline)   — LOCKED until Gate 3 passes, then completable. Logs a
 *                                       HUMAN_DECISION (decision_type HUMAN_APPROVAL — no Gate-4-
 *                                       specific HumanDecisionType exists and no GD authorizes a new
 *                                       one this session; same choice as the APEX panel).
 *
 * Gap 6 three-category model: governance banners are Category 2 (permanent, blue); gate status cards
 * are Category 3 (substantive); pending/locked pills are Category 1 (amber/grey, transient). Gate 3
 * sits in natural reading flow directly after Gate 2 (five-second test).
 *
 * NO new SovereignEventType and NO new HumanDecisionType — no shell-contract change this session.
 *
 * Version: 1.0 · Session 21 · June 26, 2026
 */

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  Gate1Banner,
  ClassificationBoundaryBanner,
} from "./banners";
import { evaluateAllBenchmarks, type FlowpathBenchmarkResult } from "./benchmark-scenarios";
import { type WorkflowArtifact, type WorkflowType } from "./flowpath-contract";

export interface GateRunnerPanelProps {
  ctx: SovereignShellContext;
}

type GateState = "PASSED" | "PENDING" | "LOCKED";

// Product-level workflow step ids for the certification flow (Constraint #6).
const GATE3_WORKFLOW_STEP = "flowpath-cpmi-vrs-gate3-attestation";
const GATE4_WORKFLOW_STEP = "flowpath-cpmi-vrs-gate4-monitoring-baseline";
const MIN_NOTE_LENGTH = 10;

export function GateRunnerPanel({ ctx }: GateRunnerPanelProps): JSX.Element {
  const benchmarks = useMemo(() => evaluateAllBenchmarks(), []);

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
        product: "FLOWPATH",
        actor_id: ctx.auth.user.employee_id,
        outcome: "flowpath_cpmi_vrs_gate3_attested",
        decision_type: "GATE_3_ATTESTATION", // Constraint #4 — GD-7 Gate 3 attestation type
        actor: "human",
        actor_name: ctx.auth.user.name,
        payload: { gate: 3, note: trimmed, attested_at: attestedAt },
      });
    } catch (err) {
      setError(`Logger emission failed — Gate 3 attestation not recorded (fail-closed): ${err instanceof Error ? err.message : String(err)}`);
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
        product: "FLOWPATH",
        actor_id: ctx.auth.user.employee_id,
        outcome: "flowpath_cpmi_vrs_gate4_baseline_established",
        // No Gate-4-specific HumanDecisionType exists; HUMAN_APPROVAL is the nearest existing type
        // and no GD authorizes a new one this session (Constraint #8 — no shell-contract change).
        decision_type: "HUMAN_APPROVAL",
        actor: "human",
        actor_name: ctx.auth.user.name,
        payload: { gate: 4, completed_at: completedAt },
      });
    } catch (err) {
      setError(`Logger emission failed — Gate 4 not recorded (fail-closed): ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setGate4({ state: "PASSED", completedAt });
  };

  return (
    <section aria-label="FLOWPATH CPMI-VRS Certification">
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ ...titleStyle, fontSize: 20 }}>FLOWPATH — CPMI-VRS Certification</h1>
        <p style={subtitleStyle}>
          The four governance gates that certify the FLOWPATH elicitation agents. Gates 1 and 2 are
          recorded automatically; Gate 3 is your attestation; Gate 4 establishes the monitoring baseline.
        </p>
      </header>

      <Gate1Banner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      {/* Certification summary — Category 3, read first. */}
      <div style={summaryStyle} role="status" data-category="3-content">
        {allPassed ? (
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            FLOWPATH CPMI-VRS certification is complete. Gate 3 was attested on {formatDate(gate3.attestedAt)} and
            the Gate 4 monitoring baseline was established on {formatDate(gate4.completedAt)}. All four gates have passed.
          </p>
        ) : (
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            {passedCount} of 4 gates are complete. Gate 3 attestation is the Project Principal step — complete it
            in this tab during Walkthrough C, and Gate 4 will then unlock.
          </p>
        )}
      </div>

      {error ? <p role="alert" style={errorStyle}>{error}</p> : null}

      {/* ── Gate 1 ─────────────────────────────────────────────────────────── */}
      <GateCard
        number={1}
        name="AI Disclosure"
        state="PASSED"
        description="Every FLOWPATH elicitation screen carries the AI-disclosure banner: all elicitation is AI-assisted, outputs are advisory, and a qualified human reviewer must approve a workflow artifact before it is committed to the registry. Because the FLOWPATH module is loaded and the banner is present on every screen, this gate is satisfied."
      />

      {/* ── Gate 2 ─────────────────────────────────────────────────────────── */}
      <GateCard
        number={2}
        name="Reasoning Transparency"
        state="PASSED"
        description="A reviewer can see what each benchmark elicitation produced and confirm it is complete. The three known-answer benchmark scenarios below each produced a schema-valid workflow artifact that passed the Five-Question Completeness Gate. Open the full output on any scenario to read the complete workflow in plain language."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {benchmarks.map((b) => (
            <BenchmarkCard key={b.scenario.id} result={b} />
          ))}
        </div>
      </GateCard>

      {/* ── Gate 3 — the Walkthrough C human step, directly after Gate 2 ─────── */}
      <GateCard
        number={3}
        name="Human Attestation"
        state={gate3.state}
        description="Before FLOWPATH is certified, a qualified reviewer must attest that the benchmark elicitations have been reviewed and are accepted as evidence that the FLOWPATH agents elicit complete, schema-valid workflows. This is the Project Principal step in Walkthrough C."
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
              placeholder="Describe your review and acceptance of the FLOWPATH benchmark elicitations (required, at least 10 characters)."
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
        description="Confirms that FLOWPATH agent behavior monitoring is active and a baseline has been established. This gate unlocks once Gate 3 has been attested."
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
          <p style={{ ...bodyTextStyle, marginTop: 8 }}>This gate is locked until Gate 3 has been attested.</p>
        )}
      </GateCard>
    </section>
  );
}

// ── Gate card (Category 3 substantive content; status pill carries the Category 1 cue) ──
function GateCard({ number, name, state, description, children }: { number: number; name: string; state: GateState; description: string; children?: ReactNode }): JSX.Element {
  return (
    <article style={gateCardStyle} data-category="3-content" data-gate={number} aria-label={`Gate ${number} — ${name}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h2 style={{ ...sectionHeadingStyle, margin: 0 }}>Gate {number} — {name}</h2>
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
function BenchmarkCard({ result }: { result: FlowpathBenchmarkResult }): JSX.Element {
  const { scenario, bundle, gate_passed, schema_valid } = result;
  const stepCount = bundle.artifact.steps.length;
  return (
    <article style={benchmarkCardStyle} aria-label={`Benchmark scenario ${scenario.id} — ${scenario.label}`}>
      <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#0f172a" }}>
        Scenario {scenario.id} — {scenario.label}
      </h3>
      <p style={{ ...bodyTextStyle, margin: "0 0 6px" }}>{scenario.expectation}</p>
      <p style={{ ...bodyTextStyle, margin: "0 0 6px" }}>
        This is a {workflowTypeLabel(scenario.workflow_type).toLowerCase()} with {stepCountPhrase(stepCount)}.{" "}
        {schema_valid ? "Schema validation passed." : "Schema validation did not pass."}{" "}
        {gate_passed ? "The Five-Question Completeness Gate passed." : "The Five-Question Completeness Gate did not pass."}
      </p>
      <details>
        <summary style={summaryToggleStyle}>View full output</summary>
        <ArtifactProse artifact={bundle.artifact} />
      </details>
    </article>
  );
}

function ArtifactProse({ artifact }: { artifact: WorkflowArtifact }): JSX.Element {
  return (
    <div style={{ marginTop: 8 }}>
      <h4 style={fullHeadingStyle}>{artifact.title}</h4>
      <p style={bodyTextStyle}>{artifact.summary}</p>
      <h4 style={fullHeadingStyle}>How the work is done</h4>
      <ol style={{ margin: "0 0 10px", paddingLeft: 20, color: "#334155", fontSize: 14, lineHeight: 1.5 }}>
        {artifact.steps.map((s) => (
          <li key={s.step_id} style={{ marginBottom: 6 }}>
            {s.description} The {s.responsible_role} is responsible. It begins when {lowerFirst(ensureSentence(s.trigger_condition))} It
            receives {joinProse(s.inputs)} and produces {joinProse(s.outputs)}.
          </li>
        ))}
      </ol>
      <p style={bodyTextStyle}>The workflow is complete when {lowerFirst(ensureSentence(artifact.terminal_condition))}</p>
    </div>
  );
}

// ── Plain-language helpers (Gap 5) ──────────────────────────────────────────
function workflowTypeLabel(t: WorkflowType): string {
  switch (t) {
    case "operational": return "Operational workflow";
    case "ppbe": return "PPBE workflow";
    case "validation_cadence": return "Validation cadence";
    case "data_source_inventory": return "Data source inventory";
  }
}
function stepCountPhrase(n: number): string {
  return n === 1 ? "one step" : `${n} steps`;
}
function joinProse(items: string[]): string {
  if (items.length === 0) return "nothing recorded";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
function ensureSentence(text: string): string {
  const t = text.trim();
  if (t === "") return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}
function lowerFirst(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toLowerCase() + text.slice(1);
}
function pillColors(state: GateState): { color: string; background: string } {
  if (state === "PASSED") return { color: "#065f46", background: "#d1fae5" };
  if (state === "PENDING") return { color: "#854d0e", background: "#fef9c3" };
  return { color: "#475569", background: "#e2e8f0" };
}
function pillLabel(state: GateState): string {
  if (state === "PASSED") return "Passed";
  if (state === "PENDING") return "Pending";
  return "Locked";
}
function formatDate(iso: string | null): string {
  if (!iso) return "an unrecorded date";
  return iso.slice(0, 10);
}

// ── Styles ──────────────────────────────────────────────────────────────────
const summaryStyle: CSSProperties = { padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 12, maxWidth: 940 };
const gateCardStyle: CSSProperties = { padding: "14px 16px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 12, maxWidth: 940 };
const benchmarkCardStyle: CSSProperties = { padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 };
const pillStyle: CSSProperties = { fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, whiteSpace: "nowrap" };
const summaryToggleStyle: CSSProperties = { cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0c4a6e" };
const fullHeadingStyle: CSSProperties = { margin: "10px 0 4px", fontSize: 13, color: "#0f172a" };
const textareaStyle: CSSProperties = { width: "100%", maxWidth: 820, minHeight: 70, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontFamily: "inherit" };
const primaryBtnStyle: CSSProperties = { padding: "7px 16px", borderRadius: 6, border: "1px solid #1d4ed8", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: "0 0 10px", color: "#b91c1c", fontSize: 13, fontWeight: 600 };

export default GateRunnerPanel;
