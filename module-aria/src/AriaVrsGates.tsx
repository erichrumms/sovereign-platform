/**
 * SOVEREIGN Platform — module-aria
 * AriaVrsGates.tsx — ARIA Suite CPMI-VRS Certification Gates tab (Stage 6, Session 25 · D4).
 *
 * Surfaces ARIA Suite's CPMI-VRS gates so the Project Principal can complete certification on return,
 * before Walkthrough D. ARIA's pathway differs from CPMI / APEX / FLOWPATH because the aria.rules-engine
 * is DETERMINISTIC, not LLM-backed (docs/16 §12):
 *
 *   - Gates 1 + 2 (accuracy benchmarks) are REPLACED by determinism verification — the same regulatory
 *     input produces the same compliance (CLEAR), trace (TRACER), and impact (ARC) output on every run.
 *     Proving determinism IS the certification basis for a deterministic system. Computed and shown on
 *     load; PASSED when every scenario's two runs are identical.
 *   - Gate 3 (Project Principal attestation) — PENDING. The Project Principal attests that the ARIA rule
 *     sets correctly reflect the applicable regulatory framework as of the attestation date. Attesting
 *     logs a HUMAN_DECISION (decision_type GATE_3_ATTESTATION — the existing GD-7 type the CPMI / APEX /
 *     FLOWPATH panels use; no shell-contract change) and unlocks Gate 4. This is a Project Principal
 *     step — the UI is built and ready; it is NOT attested here.
 *   - Gate 4 (monitoring baseline) — LOCKED until Gate 3 passes. Confirms VIGIL alert routing from ARIA
 *     is active. Logs a HUMAN_DECISION (decision_type HUMAN_APPROVAL — no Gate-4-specific type exists and
 *     no GD authorizes one). Also a Project Principal step — built and ready, left pending.
 *
 * Mirrors the FLOWPATH / APEX GateRunnerPanel pattern (Gap 6 three-category model: blue guardrails are
 * Category 2; gate status cards are Category 3; pending/locked pills are Category 1). Reuses the ARIA
 * banners and the clear-ui SeverityBadge — no parallel components (docs/16 §8). NO new SovereignEventType
 * and NO new HumanDecisionType — no shell-contract change this session.
 *
 * Version: 1.0 · Session 25 (D4) · June 29, 2026
 */

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  DeterminismBanner,
  ClassificationBoundaryBanner,
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  bodyTextStyle,
} from "./banners";
import { SeverityBadge } from "./clear-ui";
import { verifyAllDeterminism, allDeterministic, type DeterminismResult } from "./determinism-verification";

export interface AriaVrsGatesProps {
  ctx: SovereignShellContext;
}

type GateState = "PASSED" | "PENDING" | "LOCKED";

// Product-level workflow step ids for the certification flow (Constraint #6).
const GATE3_WORKFLOW_STEP = "aria-cpmi-vrs-gate3-attestation";
const GATE4_WORKFLOW_STEP = "aria-cpmi-vrs-gate4-monitoring-baseline";
const MIN_NOTE_LENGTH = 10;

export function AriaVrsGates({ ctx }: AriaVrsGatesProps): JSX.Element {
  const results = useMemo(() => verifyAllDeterminism(), []);
  const determinismPassed = useMemo(() => allDeterministic(results), [results]);

  const [note, setNote] = useState("");
  const [gate3, setGate3] = useState<{ state: GateState; attestedAt: string | null }>({ state: "PENDING", attestedAt: null });
  const [gate4, setGate4] = useState<{ state: GateState; completedAt: string | null }>({ state: "LOCKED", completedAt: null });
  const [error, setError] = useState<string | null>(null);

  const determinismState: GateState = determinismPassed ? "PASSED" : "PENDING";
  const passedCount =
    (determinismPassed ? 1 : 0) + (gate3.state === "PASSED" ? 1 : 0) + (gate4.state === "PASSED" ? 1 : 0);
  const allPassed = determinismPassed && gate3.state === "PASSED" && gate4.state === "PASSED";

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
        product: "ARIA",
        actor_id: ctx.auth.user.employee_id,
        outcome: "aria_cpmi_vrs_gate3_attested",
        decision_type: "GATE_3_ATTESTATION", // existing GD-7 type — no shell-contract change
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
        product: "ARIA",
        actor_id: ctx.auth.user.employee_id,
        outcome: "aria_cpmi_vrs_gate4_baseline_established",
        // No Gate-4-specific HumanDecisionType exists; HUMAN_APPROVAL is the nearest existing type and
        // no GD authorizes a new one this session (Constraint #8 — no shell-contract change).
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
    <section aria-label="ARIA Suite CPMI-VRS Certification" data-testid="aria-vrs-gates">
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ ...titleStyle, fontSize: 20 }}>ARIA Suite — CPMI-VRS Certification</h1>
        <p style={subtitleStyle}>
          ARIA Suite is deterministic, so Gates 1 and 2 are replaced by determinism verification: the
          same input must produce the same output on every run. Gate 3 is the Project Principal
          attestation; Gate 4 establishes the monitoring baseline.
        </p>
      </header>

      {/* Category 2 — permanent governance guardrails (blue). */}
      <DeterminismBanner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      {/* Certification summary — Category 3, read first. */}
      <div style={summaryStyle} role="status" data-category="3-content">
        {allPassed ? (
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            ARIA Suite CPMI-VRS certification is complete. Determinism is verified, Gate 3 was attested
            on {formatDate(gate3.attestedAt)}, and the Gate 4 monitoring baseline was established on{" "}
            {formatDate(gate4.completedAt)}.
          </p>
        ) : (
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            {passedCount} of 3 gate stages complete. Determinism verification runs automatically; Gate 3
            attestation is the Project Principal step — complete it in this tab before Walkthrough D, and
            Gate 4 will then unlock.
          </p>
        )}
      </div>

      {error ? <p role="alert" style={errorStyle}>{error}</p> : null}

      {/* ── Determinism verification — replaces Gates 1 + 2 (docs/16 §12) ───────────────── */}
      <GateCard
        number="1–2"
        name="Determinism Verification"
        state={determinismState}
        description="ARIA Suite's authority rests on determinism, not accuracy benchmarking. Each scenario below runs one ARIA engine — CLEAR, TRACER, or ARC — twice with identical input and confirms the two outputs are identical. Proving this determinism is ARIA Suite's stand-in for the accuracy gates an LLM-backed product must pass."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {results.map((r) => (
            <DeterminismCard key={r.id} result={r} />
          ))}
        </div>
      </GateCard>

      {/* ── Gate 3 — the Project Principal step, directly after the determinism gate ────── */}
      <GateCard
        number="3"
        name="Human Attestation"
        state={gate3.state}
        description="Before ARIA Suite is certified, the Project Principal must attest that the ARIA rule sets (CLEAR's compliance rules, TRACER's chain definitions, and ARC's dependency model) correctly reflect the applicable regulatory framework as of the attestation date. This is the Project Principal step before Walkthrough D."
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
              data-testid="aria-gate3-note"
              placeholder="Describe your review and acceptance that the ARIA rule sets reflect the applicable regulatory framework (required, at least 10 characters)."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={textareaStyle}
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={attestGate3} style={primaryBtnStyle} data-testid="aria-gate3-attest">
                Attest Gate 3
              </button>
            </div>
          </div>
        )}
      </GateCard>

      {/* ── Gate 4 ─────────────────────────────────────────────────────────────────────── */}
      <GateCard
        number="4"
        name="Monitoring Baseline"
        state={gate4.state}
        description="Confirms that VIGIL alert routing from ARIA Suite is active and a monitoring baseline has been established. This gate unlocks once Gate 3 has been attested."
      >
        {gate4.state === "PASSED" ? (
          <p style={{ ...bodyTextStyle, marginTop: 8, color: "#065f46" }}>
            The Gate 4 monitoring baseline was established on {formatDate(gate4.completedAt)}.
          </p>
        ) : gate4.state === "PENDING" ? (
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={completeGate4} style={primaryBtnStyle} data-testid="aria-gate4-complete">
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
function GateCard({ number, name, state, description, children }: { number: string; name: string; state: GateState; description: string; children?: ReactNode }): JSX.Element {
  return (
    <article style={gateCardStyle} data-category="3-content" data-gate={number} aria-label={`Gate ${number} — ${name}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
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

/** One determinism scenario result — a card stating what was verified, in plain prose (Gap 5). */
function DeterminismCard({ result }: { result: DeterminismResult }): JSX.Element {
  return (
    <article style={scenarioCardStyle} data-testid={`aria-determinism-${result.id}`} data-identical={result.identical} aria-label={`Determinism scenario ${result.label}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: 14, color: "#0f172a" }}>
          <span style={componentTagStyle}>{result.component}</span> {result.label}
        </h3>
        {result.identical ? (
          <SeverityBadge severity="green" label="Identical on both runs" />
        ) : (
          <SeverityBadge severity="red" label="Outputs differ" />
        )}
      </div>
      <p style={{ ...bodyTextStyle, margin: "0 0 4px" }}>{result.description}</p>
      <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
        Ran {result.runs} times. {result.output_summary}
      </p>
    </article>
  );
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
const scenarioCardStyle: CSSProperties = { padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 };
const componentTagStyle: CSSProperties = { display: "inline-block", padding: "1px 7px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", marginRight: 6 };
const pillStyle: CSSProperties = { fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, whiteSpace: "nowrap" };
const textareaStyle: CSSProperties = { width: "100%", maxWidth: 820, minHeight: 70, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontFamily: "inherit" };
const primaryBtnStyle: CSSProperties = { padding: "7px 16px", borderRadius: 6, border: "1px solid #1d4ed8", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: "0 0 10px", color: "#b91c1c", fontSize: 13, fontWeight: 600 };

export default AriaVrsGates;
