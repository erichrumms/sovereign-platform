/**
 * SOVEREIGN Platform — module-agentos
 * TaskRegistryPanel.tsx — the task registry surface (spec §3.2 / §3.3).
 *
 * Create tasks and view the lifecycle state of every task. Creation collects a title, a
 * data classification (ClearanceLevel — Constraint #2), and whether the task requires human
 * approval; the registry assigns the task_id and workflow_step_id. Cancellation (any
 * non-terminal task → CANCELLED) is a Project Principal action carrying TASK_CANCELLATION.
 * Dispatch / approval / execution happen on the Agent Dispatch tab.
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import { useState, type CSSProperties } from "react";

import { CLEARANCE_LEVELS } from "@sovereign/data";
import type { ClearanceLevel } from "@sovereign/api-client";

import type { TaskStatus } from "./agentos-contract";
import { isTerminal } from "./agentos-contract";
import type { UseTaskRegistry } from "./useTaskRegistry";

export interface TaskRegistryPanelProps {
  registry: UseTaskRegistry;
}

export function TaskRegistryPanel({ registry }: TaskRegistryPanelProps): JSX.Element {
  const [title, setTitle] = useState("");
  const [classification, setClassification] = useState<ClearanceLevel>("UNCLASSIFIED");
  const [requiresApproval, setRequiresApproval] = useState(true);

  const onCreate = (): void => {
    const trimmed = title.trim();
    if (trimmed === "") return;
    const nextId = `task-${registry.tasks.length + 1}`;
    registry.create({
      task_id: nextId,
      title: trimmed,
      description: `Synthetic AgentOS task: ${trimmed}`,
      requires_approval: requiresApproval,
      data_classification: classification,
    });
    setTitle("");
  };

  return (
    <section aria-label="Task Registry" style={wrapStyle}>
      <div style={formStyle}>
        <input
          aria-label="task title"
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <select
          aria-label="data classification"
          value={classification}
          onChange={(e) => setClassification(e.target.value as ClearanceLevel)}
          style={selectStyle}
        >
          {CLEARANCE_LEVELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={requiresApproval}
            onChange={(e) => setRequiresApproval(e.target.checked)}
          />
          requires approval
        </label>
        <button type="button" onClick={onCreate} style={createBtnStyle}>Create Task</button>
      </div>

      {registry.error ? <p role="alert" style={errorStyle}>{registry.error}</p> : null}

      {registry.tasks.length === 0 ? (
        <p style={emptyStyle}>No tasks yet. Create one above to start a lifecycle.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Task</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Classification</th>
              <th style={thStyle}>Agent</th>
              <th style={thStyle}>Approval</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {registry.tasks.map((task) => (
              <tr key={task.task_id}>
                <td style={tdStyle}><strong>{task.task_id}</strong> — {task.title}</td>
                <td style={tdStyle}><span style={badgeStyle(task.status)}>{task.status}</span></td>
                <td style={tdStyle}>{task.data_classification}</td>
                <td style={tdStyle}>{task.assigned_agent_id ?? "—"}</td>
                <td style={tdStyle}>{task.requires_approval ? "required" : "not required"}</td>
                <td style={tdStyle}>
                  {!isTerminal(task.status) ? (
                    <button type="button" onClick={() => registry.cancel(task.task_id)} style={cancelBtnStyle}>
                      Cancel
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

const COMPLETE_GREEN = "#065f46";
const CANCEL_RED = "#b91c1c";

function badgeColors(status: TaskStatus): { color: string; background: string } {
  if (status === "COMPLETE") return { color: COMPLETE_GREEN, background: "#d1fae5" };
  if (status === "CANCELLED" || status === "REJECTED") return { color: CANCEL_RED, background: "#fee2e2" };
  if (status === "IN_PROGRESS" || status === "APPROVED") return { color: "#1e40af", background: "#dbeafe" };
  return { color: "#475569", background: "#e2e8f0" };
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 };
const formStyle: CSSProperties = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const inputStyle: CSSProperties = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, minWidth: 220 };
const selectStyle: CSSProperties = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 };
const checkboxLabelStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#475569" };
const createBtnStyle: CSSProperties = { padding: "6px 14px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13 };
const emptyStyle: CSSProperties = { margin: 0, color: "#64748b", fontSize: 13 };
const tableStyle: CSSProperties = { borderCollapse: "collapse", width: "100%", fontSize: 13 };
const thStyle: CSSProperties = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 };
const tdStyle: CSSProperties = { padding: "6px 8px", borderBottom: "1px solid #f1f5f9" };
const badgeStyle = (status: TaskStatus): CSSProperties => {
  const { color, background } = badgeColors(status);
  return { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color, background };
};
const cancelBtnStyle: CSSProperties = { padding: "3px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fff", color: "#b91c1c", cursor: "pointer", fontSize: 12 };

export default TaskRegistryPanel;
