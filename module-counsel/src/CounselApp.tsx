/**
 * SOVEREIGN Platform — module-counsel
 * CounselApp.tsx — COUNSEL composition root (React).
 *
 * The single React component the module mounts (via index.ts -> createRoot) into
 * the shell-provided outlet. Presentation reads the context; it never re-derives
 * it. Shared services come from SovereignShellContext / @sovereign/api-client.
 *
 * Session 4 flow as assembled so far:
 *   DecisionFramer (Gate 1 + framing)  ──► captured DecisionFrame
 * The Analysis Engine (AnalysisPanel) and Prior Position Alert are composed here
 * in the subsequent sub-steps. Styling is inline (consistent with the shell
 * chrome); Tailwind is a flagged follow-up.
 *
 * Version: 1.0 (core, in progress) · Session 4
 */

import { useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { DecisionFramer } from "./DecisionFramer";
import { PriorPositionAlert } from "./PriorPositionAlert";
import { AnalysisPanel } from "./AnalysisPanel";
import type { COUNSELInboundContext, DecisionFrame } from "./types";

export interface CounselAppProps {
  ctx: SovereignShellContext;
  /** Optional deep-link context when COUNSEL is entered from a product / VIGIL. */
  inbound?: COUNSELInboundContext;
}

export function CounselApp({ ctx, inbound }: CounselAppProps): JSX.Element {
  const [frame, setFrame] = useState<DecisionFrame | null>(null);
  const [priorResolved, setPriorResolved] = useState(false);

  const reframe = (): void => {
    setFrame(null);
    setPriorResolved(false);
  };

  // Flow: frame → prior position check → analysis.
  let body: JSX.Element;
  if (frame === null) {
    body = <DecisionFramer ctx={ctx} inbound={inbound} onSubmit={setFrame} />;
  } else if (!priorResolved) {
    body = (
      <PriorPositionAlert ctx={ctx} frame={frame} onResolved={() => setPriorResolved(true)} />
    );
  } else {
    body = <AnalysisPanel ctx={ctx} frame={frame} onReframe={reframe} />;
  }

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>COUNSEL</h1>
        <p style={subtitleStyle}>Human Decision Support · Companion Suite</p>
      </header>
      {body}
    </section>
  );
}

// ============================================================
// STYLES (inline)
// ============================================================

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  padding: 32,
  color: "#0f172a",
  height: "100%",
  boxSizing: "border-box",
  overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 20 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };

export default CounselApp;
