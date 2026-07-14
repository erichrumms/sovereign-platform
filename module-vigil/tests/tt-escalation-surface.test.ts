/** @jest-environment jsdom */
/**
 * TT escalation → shared task surface publication tests (Session 35 — the
 * cross-module state gap fix, VIGIL half). The decided authorization becomes
 * visible on ctx.taskSurface (GD-19) so SCRIBE's review queue can flip without
 * a manual refresh. Publication follows the Logger emit (Gate 2) and never
 * happens for ESCALATE, non-TT requests, or a failed emit.
 */

import { renderHook, act } from "@testing-library/react";

import { makeCtx, createInMemoryTaskSurface } from "./test-helpers";
import { useApprovalDecision } from "../src/useApprovalDecision";
import { makeDemoTTApprovalRequest } from "../src/tt-synthetic-alerts";
import {
  isTTEscalationRequest,
  escalationReferenceId,
  publishEscalationAuthorization,
  TT_ESCALATION_REQUEST_PREFIX,
} from "../src/tt-escalation-surface";
import type { AgentApprovalRequest } from "../src/approval-contract";

const NOW = "2026-07-13T12:00:00.000Z";
const NOTE = "Recurrence history reviewed; escalation is warranted and documented.";

const ttRequest = (): AgentApprovalRequest => makeDemoTTApprovalRequest(NOW);

const genericRequest = (): AgentApprovalRequest => ({
  request_id: "REQ-GENERIC-1",
  requesting_agent_id: "agentos.deployer",
  requesting_agent_class: "Monitoring",
  action_type: "deploy_model",
  action_detail: {},
  risk_classification: "P2",
  submitted_at: NOW,
  expires_at: "2026-07-13T13:00:00.000Z",
  workflow_step_id: "vigil-approval-REQ-GENERIC-1",
  context: "Generic AgentOS request — not a TT escalation.",
});

describe("tt-escalation-surface — request classification", () => {
  it("recognizes the TT escalation request and extracts the flag reference id", () => {
    const request = ttRequest();
    expect(isTTEscalationRequest(request)).toBe(true);
    expect(request.request_id.startsWith(TT_ESCALATION_REQUEST_PREFIX)).toBe(true);
    expect(escalationReferenceId(request)).toBe("SYNTH-TM-205-F1");
  });

  it("a generic approval request is not classified as a TT escalation", () => {
    expect(isTTEscalationRequest(genericRequest())).toBe(false);
  });
});

describe("tt-escalation-surface — publication mechanics", () => {
  it("APPROVE publishes an APPROVED SharedTask carrying the join keys", () => {
    const surface = createInMemoryTaskSurface();
    publishEscalationAuthorization(surface, ttRequest(), "APPROVE", NOW);
    const task = surface.get("tt-escalation-SYNTH-TM-205-F1");
    expect(task).toMatchObject({
      status: "APPROVED",
      origin_product: "VIGIL",
      origin_request_id: "SYNTH-TM-205-F1",
      workflow_step_id: "vigil-approval-tt-escalation-SYNTH-TM-205-F1",
      data_classification: "UNCLASSIFIED",
    });
  });

  it("REJECT publishes REJECTED — visible but never sendable on the SCRIBE side", () => {
    const surface = createInMemoryTaskSurface();
    publishEscalationAuthorization(surface, ttRequest(), "REJECT", NOW);
    expect(surface.get("tt-escalation-SYNTH-TM-205-F1")?.status).toBe("REJECTED");
  });

  it("a non-TT request publishes nothing; an absent surface degrades to a no-op", () => {
    const surface = createInMemoryTaskSurface();
    publishEscalationAuthorization(surface, genericRequest(), "APPROVE", NOW);
    expect(surface.list()).toHaveLength(0);
    expect(() =>
      publishEscalationAuthorization(undefined, ttRequest(), "APPROVE", NOW)
    ).not.toThrow();
  });
});

describe("useApprovalDecision — surface publication rides the decision (Session 35)", () => {
  it("an approved TT escalation appears APPROVED on the shared surface", () => {
    const surface = createInMemoryTaskSurface();
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ taskSurface: surface })));
    act(() => {
      expect(result.current.decide(ttRequest(), "APPROVE", NOTE).ok).toBe(true);
    });
    expect(surface.get("tt-escalation-SYNTH-TM-205-F1")?.status).toBe("APPROVED");
  });

  it("a rejected TT escalation appears REJECTED on the shared surface", () => {
    const surface = createInMemoryTaskSurface();
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ taskSurface: surface })));
    act(() => {
      expect(result.current.decide(ttRequest(), "REJECT", NOTE).ok).toBe(true);
    });
    expect(surface.get("tt-escalation-SYNTH-TM-205-F1")?.status).toBe("REJECTED");
  });

  it("ESCALATE leaves the surface untouched — the case is still undecided", () => {
    const surface = createInMemoryTaskSurface();
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ taskSurface: surface })));
    act(() => {
      expect(result.current.decide(ttRequest(), "ESCALATE", NOTE).ok).toBe(true);
    });
    expect(surface.list()).toHaveLength(0);
  });

  it("a generic (non-TT) approval publishes nothing", () => {
    const surface = createInMemoryTaskSurface();
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ taskSurface: surface })));
    act(() => {
      expect(result.current.decide(genericRequest(), "APPROVE", NOTE).ok).toBe(true);
    });
    expect(surface.list()).toHaveLength(0);
  });

  it("a failed Logger emit blocks publication too (Gate 2 — unrecorded is invisible)", () => {
    const surface = createInMemoryTaskSurface();
    const { result } = renderHook(() =>
      useApprovalDecision(makeCtx({ taskSurface: surface, throwOnLog: true }))
    );
    act(() => {
      expect(result.current.decide(ttRequest(), "APPROVE", NOTE).ok).toBe(false);
    });
    expect(surface.list()).toHaveLength(0);
  });

  it("an invalid note blocks the decision and the publication together", () => {
    const surface = createInMemoryTaskSurface();
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ taskSurface: surface })));
    act(() => {
      expect(result.current.decide(ttRequest(), "APPROVE", "short").ok).toBe(false);
    });
    expect(surface.list()).toHaveLength(0);
  });
});
