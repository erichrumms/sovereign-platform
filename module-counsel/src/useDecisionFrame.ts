/**
 * SOVEREIGN Platform — module-counsel
 * useDecisionFrame.ts — the framing hook.
 *
 * Owns the framing form state. Per the COUNSEL spec, hooks own state/logic and
 * components own rendering. Framing itself performs no LLM call or Logger emission
 * (CPMI-VRS Gate 2 emission begins at analysis — sub-step 4); this hook is pure
 * React state over the pure helpers in frame-logic.ts.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import { useMemo, useState } from "react";

import {
  assembleFrame,
  initialFrameState,
  isFrameComplete,
  type FrameState,
} from "./frame-logic";
import type { COUNSELInboundContext, DecisionFrame } from "./types";

export interface UseDecisionFrame {
  state: FrameState;
  update: (patch: Partial<FrameState>) => void;
  addConstraint: (constraint: string) => void;
  removeConstraint: (index: number) => void;
  isComplete: boolean;
  /** The assembled frame when complete, else null. */
  frame: DecisionFrame | null;
}

export function useDecisionFrame(inbound?: COUNSELInboundContext): UseDecisionFrame {
  const [state, setState] = useState<FrameState>(() => initialFrameState(inbound));

  const update = (patch: Partial<FrameState>): void =>
    setState((s) => ({ ...s, ...patch }));

  const addConstraint = (constraint: string): void => {
    const trimmed = constraint.trim();
    if (trimmed === "") return;
    setState((s) => ({ ...s, constraints: [...s.constraints, trimmed] }));
  };

  const removeConstraint = (index: number): void =>
    setState((s) => ({
      ...s,
      constraints: s.constraints.filter((_, i) => i !== index),
    }));

  const isComplete = isFrameComplete(state);
  const frame = useMemo<DecisionFrame | null>(() => assembleFrame(state), [state]);

  return { state, update, addConstraint, removeConstraint, isComplete, frame };
}
