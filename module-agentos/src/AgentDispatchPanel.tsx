/**
 * SOVEREIGN Platform — module-agentos
 * AgentDispatchPanel.tsx — dispatch controls + the VIGIL approval queue (spec §3.4 / §3.5).
 *
 * Three sections drive a task through its lifecycle:
 *   1. Dispatch — assign a CREATED task to a synthetic agent (CREATED → ASSIGNED). If the
 *      task requires approval, an AgentApprovalRequest is submitted to VIGIL via the
 *      AgentOS approval port and the task moves ASSIGNED → PENDING_APPROVAL. GD-10:
 *      dispatch of an unauthorized classification is refused (the boundary message shows).
 *   2. Approval Queue (VIGIL) — the requests AgentOS submitted, read back through the same
 *      port VIGIL's queue uses. Approve / Reject records the decision and advances the task
 *      (PENDING_APPROVAL → APPROVED / REJECTED), carrying decision_type TASK_APPROVAL.
 *   3. Execution — APPROVED → IN_PROGRESS → COMPLETE (synthetic; real agent execution is
 *      future work, spec §7).
 *
 * NOTE (reconciliation): a task with requires_approval=false stops at ASSIGNED — the spec's
 * 7-transition table has no ASSIGNED → IN_PROGRESS edge, and Session 14 does not invent one
 * (non-approval execution is future work, §7). Such a task can still be cancelled.
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import { type CSSProperties } from "react";

import type { Task } from "./agentos-contract";
import type { UseTaskRegistry } from "./useTaskRegistry";
import type { UseAgentDispatcher } from "./useAgentDispatcher";

export interface AgentDispatchPanelProps {
  registry: UseTaskRegistry;
  dispatcher: UseAgentDispatcher;
}

function taskIdOfRequest(actionDetail: Record<string, unknown>): string {
  const id = actionDetail["task_id"];
  return typeof id === "string" ? id : "";
}

export function AgentDispatchPanel({ registry, dispatcher }: AgentDispatchPanelProps): JSX.Element {
  const created = registry.tasks.filter((t) => t.status === "CREATED");
  const approved = registry.tasks.filter((t) => t.status === "APPROVED");
  const inProgress = registry.tasks.filter((t) => t.status === "IN_PROGRESS");
  const pending = dispatcher.pendingRequests();

  const onDispatch = (task: Task): void => {
    const result = dispatcher.dispatch(task); // GD-10 enforced inside; null on rejection
    if (!result) return;
    registry.assign(task.task_id, result.agent.agent_id);
    if (result.approvalRequest) {
      registry.requestApproval(task.task_id, result.approvalRequest.request_id);
    }
  };

  const onApprove = (requestId: string, taskId: string): void => {
    dispatcher.recordDecision(requestId, "approved");
    registry.approve(taskId);
  };

  const onReject = (requestId: string, taskId: string): void => {
    dispatcher.recordDecision(requestId, "rejected");
    registry.reject(taskId);
  };

  return (
    <section aria-label="Agent Dispatch" style={wrapStyle}>
      {dispatcher.error ? <p role="alert" style={errorStyle}>{dispatcher.error}</p> : null}
      {registry.error ? <p role="alert" style={errorStyle}>{registry.error}</p> : null}

      <div style={blockStyle}>
        <h2 style={h2Style}>Dispatch</h2>
        {created.length === 0 ? (
          <p style={mutedStyle}>No tasks awaiting dispatch. Create one on the Task Registry tab.</p>
        ) : (
          <ul style={listStyle}>
            {created.map((task) => (
              <li key={task.task_id} style={rowStyle}>
                <span><strong>{task.task_id}</strong> — {task.title} <em style={mutedStyle}>({task.data_classification})</em></span>
                <button type="button" onClick={() => onDispatch(task)} style={primaryBtn}>Dispatch</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={blockStyle}>
        <h2 style={h2Style}>Approval Queue (VIGIL)</h2>
        {pending.length === 0 ? (
          <p style={mutedStyle}>No pending approval requests.</p>
        ) : (
          <ul style={listStyle}>
            {pending.map((req) => {
              const taskId = taskIdOfRequest(req.action_detail);
              return (
                <li key={req.request_id} style={rowStyle}>
                  <span><strong>{req.request_id}</strong> — {req.requesting_agent_id} · {req.risk_classification}</span>
                  <span style={btnGroupStyle}>
                    <button type="button" onClick={() => onApprove(req.request_id, taskId)} style={approveBtn}>Approve</button>
                    <button type="button" onClick={() => onReject(req.request_id, taskId)} style={rejectBtn}>Reject</button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div style={blockStyle}>
        <h2 style={h2Style}>Execution</h2>
        {approved.length === 0 && inProgress.length === 0 ? (
          <p style={mutedStyle}>No approved or in-progress tasks.</p>
        ) : (
          <ul style={listStyle}>
            {approved.map((task) => (
              <li key={task.task_id} style={rowStyle}>
                <span><strong>{task.task_id}</strong> — APPROVED</span>
                <button type="button" onClick={() => registry.start(task.task_id)} style={primaryBtn}>Start</button>
              </li>
            ))}
            {inProgress.map((task) => (
              <li key={task.task_id} style={rowStyle}>
                <span><strong>{task.task_id}</strong> — IN_PROGRESS</span>
                <button type="button" onClick={() => registry.complete(task.task_id)} style={primaryBtn}>Complete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 };
const blockStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };
const h2Style: CSSProperties = { margin: 0, fontSize: 15, color: "#0f172a" };
const listStyle: CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 };
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 };
const btnGroupStyle: CSSProperties = { display: "flex", gap: 6 };
const mutedStyle: CSSProperties = { color: "#64748b", fontSize: 13, margin: 0 };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13, fontWeight: 600 };
const primaryBtn: CSSProperties = { padding: "4px 12px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const approveBtn: CSSProperties = { padding: "4px 12px", borderRadius: 6, border: "1px solid #047857", background: "#fff", color: "#047857", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const rejectBtn: CSSProperties = { padding: "4px 12px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fff", color: "#b91c1c", cursor: "pointer", fontSize: 12, fontWeight: 600 };

export default AgentDispatchPanel;
