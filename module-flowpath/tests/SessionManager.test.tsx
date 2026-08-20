/** @jest-environment jsdom */
/**
 * module-flowpath — SessionManager.test.tsx (Screen 1)
 * Session list renders; the AI-disclosure banner is present and blue (Category 2); status is in
 * plain prose (Gap 5); the new-session button is present and logs FLOWPATH_SESSION_STARTED and adds
 * a row; substantive content renders in a white card (contrast / Gap 6 Category 3).
 *
 * Session 63 (WH-20): SessionManager is now a controlled component — sessions and onNewSession are
 * required props. Tests updated to pass controlled sessions and use a stateful wrapper for the
 * new-session-row test.
 */
import React, { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";

import type { SovereignLogEvent, ElicitationSession } from "../../sovereign-shell/shell-contract";
import { SessionManager, gateStatusProse, isActionableSession } from "../src/SessionManager";
import { sessionWorkflowStep, FLOWPATH_COORDINATOR } from "../src/flowpath-contract";
import { SYNTHETIC_SESSIONS, SYNTHETIC_SESSION_ID } from "../src/synthetic-elicitation";
import { makeCtx } from "./test-helpers";

/**
 * Thin stateful wrapper used for tests that need state-driven session creation
 * (the parent owns sessions in production; here we wire a local useState).
 */
function StatefulSessionManager(props: Omit<React.ComponentProps<typeof SessionManager>, "sessions" | "onNewSession">) {
  const [sessions, setSessions] = useState<ElicitationSession[]>(SYNTHETIC_SESSIONS);
  return (
    <SessionManager
      {...props}
      sessions={sessions}
      onNewSession={(s) => setSessions((prev) => [s, ...prev])}
    />
  );
}

describe("SessionManager (Screen 1)", () => {
  it("renders the session list (one row per session)", () => {
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    const list = screen.getByRole("list", { name: /elicitation sessions/i });
    expect(list).toBeInTheDocument();
    expect(list.querySelectorAll("li")).toHaveLength(SYNTHETIC_SESSIONS.length);
  });

  it("shows workflow type and expert role in plain language (Gap 5)", () => {
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    expect(screen.getByText(/Operational workflow — with the Program Analyst/i)).toBeInTheDocument();
    expect(screen.getByText(/Validation cadence — with the Senior Program Analyst/i)).toBeInTheDocument();
  });

  // Session 122 (survey Finding 5): Gate 1 moved to the FlowpathApp composition root —
  // the panel keeps only the GD-10 boundary banner.
  it("keeps the GD-10 governance banner; the AI disclosure lives at the app root", () => {
    const { container } = render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    const banners = container.querySelectorAll('[data-category="2-governance"]');
    expect(banners.length).toBeGreaterThanOrEqual(1); // classification boundary
    const disclosure = Array.from(banners).find((b) => /AI disclosure/i.test(b.textContent ?? ""));
    expect(disclosure).toBeUndefined();
  });

  it("renders the GD-10 classification boundary banner (Category 2)", () => {
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    expect(screen.getByText(/Classification boundary/i)).toBeInTheDocument();
    expect(screen.getByText(/UNCLASSIFIED data only/i)).toBeInTheDocument();
  });

  it("shows gate status as a complete plain-prose sentence (Gap 5)", () => {
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    expect(screen.getByText(/Five-Question Gate passed — ready for artifact review\./i)).toBeInTheDocument();
    expect(screen.getByText(/Awaiting completeness review/i)).toBeInTheDocument();
  });

  it("gateStatusProse maps each status to plain prose (no enum leak)", () => {
    expect(gateStatusProse({ ...SYNTHETIC_SESSIONS[0], status: "COMPLETE", gate_passed: true })).toMatch(/passed/i);
    expect(gateStatusProse({ ...SYNTHETIC_SESSIONS[0], status: "GATE_PENDING", gate_passed: false })).toMatch(/Awaiting/i);
    expect(gateStatusProse({ ...SYNTHETIC_SESSIONS[0], status: "IN_PROGRESS", gate_passed: false })).toMatch(/in progress/i);
    // New: a session with explicit preliminary_complete: false shows the preliminary status.
    expect(gateStatusProse({ ...SYNTHETIC_SESSIONS[0], status: "IN_PROGRESS", gate_passed: false, preliminary_complete: false })).toMatch(/Preliminary context not yet provided/i);
  });

  it("renders the new-session button", () => {
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    expect(screen.getByRole("button", { name: /start a new session/i })).toBeInTheDocument();
  });

  it("logs FLOWPATH_SESSION_STARTED with the required fields when a new session begins", () => {
    const sink: SovereignLogEvent[] = [];
    render(<StatefulSessionManager ctx={makeCtx({ logSink: sink })} />);
    fireEvent.click(screen.getByRole("button", { name: /start a new session/i }));
    const ev = sink.find((e) => e.event_type === "FLOWPATH_SESSION_STARTED");
    expect(ev).toBeDefined();
    expect(ev!.product).toBe("FLOWPATH");
    expect(ev!.agent_id).toBe(FLOWPATH_COORDINATOR);
    expect(ev!.workflow_step_id).toBe(sessionWorkflowStep("S-NEW-001"));
    expect((ev!.payload as { workflow_type: string }).workflow_type).toBe("operational");
  });

  it("adds a new session row to the list when a new session begins", () => {
    render(<StatefulSessionManager ctx={makeCtx()} />);
    const before = screen.getAllByRole("listitem").length;
    fireEvent.click(screen.getByRole("button", { name: /start a new session/i }));
    expect(screen.getAllByRole("listitem")).toHaveLength(before + 1);
    // New sessions with preliminary_complete: false show the preliminary status.
    expect(screen.getAllByText(/Preliminary context not yet provided/i).length).toBeGreaterThanOrEqual(1);
  });

  it("WC-1: clicking a gate-passed session opens it for artifact review", () => {
    const onOpenSession = jest.fn();
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} onOpenSession={onOpenSession} />);
    // The operational synthetic session is gate-passed (actionable).
    const row = screen.getByText(/Operational workflow — with the Program Analyst/i).closest("li")!;
    expect(row.getAttribute("data-actionable")).toBe("true");
    expect(within(row).getByText(/Open for artifact review/i)).toBeInTheDocument();
    fireEvent.click(row);
    expect(onOpenSession).toHaveBeenCalledWith(SYNTHETIC_SESSION_ID);
  });

  it("WC-1: a gate-pending session is not actionable and does not open a review", () => {
    const onOpenSession = jest.fn();
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} onOpenSession={onOpenSession} />);
    const row = screen.getByText(/Validation cadence — with the Senior Program Analyst/i).closest("li")!;
    expect(row.getAttribute("data-actionable")).toBe("false");
    fireEvent.click(row);
    expect(onOpenSession).not.toHaveBeenCalled();
  });

  it("WC-2: gate-passed sessions are visually prominent; in-progress sessions are muted", () => {
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    const actionable = screen.getByText(/Operational workflow — with the Program Analyst/i).closest("li") as HTMLElement;
    const muted = screen.getByText(/Validation cadence — with the Senior Program Analyst/i).closest("li") as HTMLElement;
    // Prominent: white card with a blue accent rail.
    expect(actionable).toHaveStyle({ background: "#ffffff", borderLeft: "4px solid #2563eb" });
    // Muted: flat recessed card, no blue accent.
    expect(muted).toHaveStyle({ background: "#f8fafc", borderLeft: "4px solid #e2e8f0" });
  });

  it("isActionableSession is true only for a gate-passed COMPLETE session", () => {
    expect(isActionableSession({ ...SYNTHETIC_SESSIONS[0], status: "COMPLETE", gate_passed: true })).toBe(true);
    expect(isActionableSession({ ...SYNTHETIC_SESSIONS[0], status: "GATE_PENDING", gate_passed: false })).toBe(false);
    expect(isActionableSession({ ...SYNTHETIC_SESSIONS[0], status: "IN_PROGRESS", gate_passed: false })).toBe(false);
  });

  it("renders substantive content in a white card on the light canvas (Gap 6 Category 3)", () => {
    render(<SessionManager ctx={makeCtx()} sessions={SYNTHETIC_SESSIONS} onNewSession={() => {}} />);
    const list = screen.getByRole("list", { name: /elicitation sessions/i });
    const card = list.closest('div[style*="background"]') as HTMLElement;
    expect(card).toHaveStyle({ background: "#ffffff" });
  });
});
