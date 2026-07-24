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
 * Category 2; gate status cards are Category 3; pending/locked pills are Category 1). The Category 2
 * banners (determinism + GD-10 boundary) are rendered once by the ARIA app shell (AriaApp), not here, so
 * they are not duplicated on this tab (D-7). Reuses the clear-ui SeverityBadge — no parallel components
 * (docs/16 §8). NO new SovereignEventType and NO new HumanDecisionType — no shell-contract change.
 *
 * D3 (Session 61, finding D3-2): Gate 3/4 state moved from per-mount useState
 * to the session-persistent store (aria-vrs-session.ts) — the UI's "recorded
 * permanently … cannot be undone" claim is now true across remounts within a
 * session, and a duplicate GATE_3_ATTESTATION emission is structurally
 * prevented (store-level guard checked before the emit).
 *
 * Version: 1.1 · Session 61 (D3) · July 23, 2026
 */

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  getAriaVrsGateSession,
  recordAriaGate3Attestation,
  recordAriaGate4Completion,
  subscribeAriaVrsGateSession,
  type AriaGateState,
} from "./aria-vrs-session";
import {
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

// D3 (Session 61): the gate-state type is canonical in aria-vrs-session.ts —
// this alias keeps the component's existing prop/helper signatures unchanged.
type GateState = AriaGateState;

// Product-level workflow step ids for the certification flow (Constraint #6).
const GATE3_WORKFLOW_STEP = "aria-cpmi-vrs-gate3-attestation";
const GATE4_WORKFLOW_STEP = "aria-cpmi-vrs-gate4-monitoring-baseline";

// D-11 — Gate 3 is attested by reviewing and confirming a pre-formed statement, not by composing free
// text. The statement is explicit about WHAT is certified, in WHAT capacity, on WHAT evidence, and WHAT
// changes on submit. The exact text shown is what is written to the audit trail (buildAttestationStatement).
const ATTESTATION_CAPACITY = "the human authority accountable for ARIA Suite certification (Project Principal)";

function attestationClauses(asOfDate: string): string[] {
  return [
    `the ARIA Suite rule sets — CLEAR's compliance rules, TRACER's chain definitions, and ARC's dependency model — correctly reflect the applicable regulatory framework as of ${asOfDate};`,
    "I have reviewed the determinism verification results above, which confirm that ARIA Suite produces identical output for identical input across all six scenarios (two each for CLEAR, TRACER, and ARC); and",
    "I make this attestation knowing it is recorded permanently in the SOVEREIGN audit trail and unlocks Gate 4, the monitoring baseline.",
  ];
}

function buildAttestationStatement(attesterName: string, asOfDate: string): string {
  return `I, ${attesterName}, as ${ATTESTATION_CAPACITY}, attest that: ${attestationClauses(asOfDate).join(" ")}`;
}

export function AriaVrsGates({ ctx }: AriaVrsGatesProps): JSX.Element {
  const results = useMemo(() => verifyAllDeterminism(), []);
  const determinismPassed = useMemo(() => allDeterministic(results), [results]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [remarks, setRemarks] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  // D3 (Session 61, finding D3-2): gate state lives in the session-persistent
  // store, not per-mount React state — so a Gate 3 attestation the UI calls
  // "recorded permanently" genuinely survives a remount, and a second
  // attestation is structurally impossible (the attested screen renders no
  // attest control, and the store's record function refuses a duplicate).
  const [gate3, setGate3] = useState<{ state: GateState; attestedAt: string | null }>(
    () => getAriaVrsGateSession().gate3
  );
  const [gate4, setGate4] = useState<{ state: GateState; completedAt: string | null }>(
    () => getAriaVrsGateSession().gate4
  );
  const [error, setError] = useState<string | null>(null);

  // D3 — the live session-store subscription (same external-store pattern as
  // the VIGIL stores' D1/D2 changes).
  useEffect(() => {
    return subscribeAriaVrsGateSession((session) => {
      setGate3(session.gate3);
      setGate4(session.gate4);
    });
  }, []);

  const determinismState: GateState = determinismPassed ? "PASSED" : "PENDING";
  const passedCount =
    (determinismPassed ? 1 : 0) + (gate3.state === "PASSED" ? 1 : 0) + (gate4.state === "PASSED" ? 1 : 0);
  const allPassed = determinismPassed && gate3.state === "PASSED" && gate4.state === "PASSED";

  const attestGate3 = (): void => {
    setError(null);
    // Evidence-basis guard: the statement certifies "based on the determinism results above", so it can
    // only be attested truthfully once those results have passed. Never auto-attest (Gates 3/4 are human).
    if (!determinismPassed) {
      setError("Gate 3 cannot be attested until determinism verification has passed — the determinism result is the evidence this attestation relies on.");
      return;
    }
    if (!confirmed) {
      setError("Please read and confirm the attestation statement before attesting Gate 3.");
      return;
    }
    // D3 — duplicate-attestation guard against the STORE (not this component's
    // copy of the state): if Gate 3 was already attested this session, refuse
    // BEFORE emitting, so a duplicate GATE_3_ATTESTATION event cannot exist.
    // The check→emit→record sequence below is synchronous — nothing interleaves.
    if (getAriaVrsGateSession().gate3.state === "PASSED") {
      setError("Gate 3 has already been attested this session — the attestation is permanent and cannot be recorded twice.");
      return;
    }
    const attestedAt = new Date().toISOString();
    const statement = buildAttestationStatement(ctx.auth.user.name, today);
    const trimmedRemarks = remarks.trim();
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
        // Record the verbatim statement the human confirmed, so the audit trail captures exactly what was
        // certified — not a free-text note whose meaning has to be reconstructed later.
        payload: { gate: 3, statement, remarks: trimmedRemarks || null, attested_at: attestedAt },
      });
    } catch (err) {
      setError(`Logger emission failed — Gate 3 attestation not recorded (fail-closed): ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    // D3 — record in the session store (it also unlocks Gate 4); the
    // subscription above updates this component's rendered state.
    recordAriaGate3Attestation(attestedAt);
  };

  const completeGate4 = (): void => {
    setError(null);
    if (gate3.state !== "PASSED") return;
    // D3 — same store-level duplicate guard as Gate 3: refuse before emitting.
    if (getAriaVrsGateSession().gate4.state !== "PENDING") {
      setError("Gate 4 has already been completed this session — the monitoring baseline cannot be recorded twice.");
      return;
    }
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
    // D3 — record in the session store; the subscription updates local state.
    recordAriaGate4Completion(completedAt);
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

      {/* D-7 — the determinism + GD-10 classification-boundary banners are rendered once by the ARIA
          app shell (AriaApp), so this tab must not render its own copies (they double-rendered before). */}

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

      {/* D-12 — plain-prose rationale for a non-technical reviewer, BEFORE the scenario results. */}
      <section style={gateCardStyle} data-category="3-content" data-testid="aria-determinism-rationale" aria-label="Why ARIA Suite is certified on determinism">
        <h2 style={{ ...sectionHeadingStyle, margin: "0 0 8px" }}>Why ARIA Suite is certified on determinism, not accuracy</h2>
        <p style={bodyTextStyle}>
          The other SOVEREIGN products certified through CPMI-VRS — CPMI, APEX, and FLOWPATH — pass Gates 1
          and 2 by meeting accuracy benchmarks. Those products are built on a large language model, so the
          same question can produce a different answer from one run to the next; Gates 1 and 2 measure how
          often that answer is correct.
        </p>
        <p style={bodyTextStyle}>
          ARIA Suite works differently. Its engine applies fixed, written rules with no language model and no
          prompt — it is fully deterministic. It does not estimate or predict, so there is no accuracy rate to
          measure and an accuracy benchmark does not apply to it.
        </p>
        <p style={{ ...bodyTextStyle, marginBottom: 0 }}>
          For a system like this, the meaningful question is whether the same input always produces the same
          output. That is exactly what the six scenarios below test — two for each ARIA component (CLEAR,
          TRACER, and ARC). Passing them shows ARIA Suite's output is reproducible and stable, and that
          demonstration is what replaces Gates 1 and 2 as ARIA Suite's certification basis.
        </p>
      </section>

      {/* ── Determinism verification — replaces Gates 1 + 2 (docs/16 §12) ───────────────── */}
      <GateCard
        number="1–2"
        name="Determinism Verification"
        state={determinismState}
        description="Each scenario below runs one ARIA engine — CLEAR, TRACER, or ARC — twice with identical input and confirms the two outputs are identical. There are two scenarios per component; passing all six is ARIA Suite's certification basis in place of the accuracy Gates 1 and 2 (see the explanation above)."
      >
        {/* D-9 — why these six scenarios: the coverage the reviewer is otherwise left to infer. */}
        <p style={{ ...bodyTextStyle, margin: "12px 0 0" }} data-testid="aria-determinism-coverage">
          The six scenarios are two for each ARIA component — CLEAR, TRACER, and ARC. For every component,
          one scenario exercises the normal path and one exercises an exception path (a violation, an
          orphaned chain, a clarifying change), so determinism is shown to hold across both — not just the
          straightforward case. Each scenario runs that component's engine twice on identical input and
          checks that the two outputs match.
        </p>
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
              Review the attestation statement below. When you attest, this exact statement is recorded — with
              your name and today's date — in the permanent SOVEREIGN audit trail.
            </p>
            <blockquote style={statementBlockStyle} data-testid="aria-gate3-statement">
              <p style={{ ...bodyTextStyle, margin: "0 0 6px", fontWeight: 600 }}>
                I, {ctx.auth.user.name}, as {ATTESTATION_CAPACITY}, attest that:
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {attestationClauses(today).map((clause, i) => (
                  <li key={i} style={{ ...bodyTextStyle, margin: "0 0 4px" }}>{clause}</li>
                ))}
              </ul>
            </blockquote>
            <p style={{ ...bodyTextStyle, marginTop: 8 }}>
              Submitting records a permanent Gate 3 attestation in the SOVEREIGN audit trail and unlocks
              Gate 4, the monitoring baseline. It cannot be undone from this screen.
            </p>
            {determinismPassed ? (
              <>
                <label htmlFor="aria-gate3-remarks" style={{ ...bodyTextStyle, display: "block", margin: "0 0 4px" }}>
                  Optional remarks for the audit record:
                </label>
                <textarea
                  id="aria-gate3-remarks"
                  aria-label="gate 3 optional remarks"
                  data-testid="aria-gate3-remarks"
                  placeholder="Optional — add any context you want preserved alongside the attestation."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={textareaStyle}
                />
                <label style={{ ...bodyTextStyle, display: "flex", gap: 8, alignItems: "flex-start", margin: "8px 0 0" }}>
                  <input
                    type="checkbox"
                    data-testid="aria-gate3-confirm"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span>I have read the statement above and make this attestation.</span>
                </label>
                <div style={{ marginTop: 8 }}>
                  <button type="button" onClick={attestGate3} style={primaryBtnStyle} data-testid="aria-gate3-attest">
                    Attest Gate 3
                  </button>
                </div>
              </>
            ) : (
              <p style={{ ...bodyTextStyle, marginTop: 8, color: "#854d0e" }} data-testid="aria-gate3-blocked">
                Attestation unlocks once determinism verification has passed — its result is the evidence this
                attestation relies on.
              </p>
            )}
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
    <article style={scenarioCardStyle} data-testid={`aria-determinism-${result.id}`} data-identical={result.identical} aria-label={`Determinism scenario — ${result.component}: ${result.label}`}>
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
      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#334155" }} data-testid={`aria-determinism-compared-${result.id}`}>
        <strong>Compared:</strong> {result.compared}
      </p>
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
const statementBlockStyle: CSSProperties = { margin: 0, padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #2563eb", borderRadius: 8, maxWidth: 900 };
const textareaStyle: CSSProperties = { width: "100%", maxWidth: 820, minHeight: 70, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontFamily: "inherit" };
const primaryBtnStyle: CSSProperties = { padding: "7px 16px", borderRadius: 6, border: "1px solid #1d4ed8", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: "0 0 10px", color: "#b91c1c", fontSize: 13, fontWeight: 600 };

export default AriaVrsGates;
