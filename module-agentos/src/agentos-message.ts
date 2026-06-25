/**
 * SOVEREIGN Platform — module-agentos
 * agentos-message.ts — the AgentOS A2A message contract (GD-14).
 *
 * Owns the AgentMessage shape and the GD-14 event mapping for the agent-to-agent
 * communication layer. A message carries a correlation_id so a request and its response are
 * linked, and a workflow_step_id so every Logger event for the exchange shares one audit id
 * (Standing Constraint #6). ValidationResult is reused from @sovereign/data (Constraint #2).
 *
 * Version: 1.0 · Session 16 · June 24, 2026
 */

import type { ValidationResult } from "@sovereign/data";

import type { SovereignEventType } from "../../sovereign-shell/shell-contract";

/** Message kinds. REQUEST/RESPONSE are correlated via correlation_id; NOTIFICATION is one-way. */
export type AgentMessageType = "REQUEST" | "RESPONSE" | "NOTIFICATION";

export const AGENT_MESSAGE_TYPES: readonly AgentMessageType[] = ["REQUEST", "RESPONSE", "NOTIFICATION"];

export interface AgentMessage {
  message_id: string;
  sender_agent_id: string;
  recipient_agent_id: string;
  message_type: AgentMessageType;
  payload: Record<string, unknown>;
  workflow_step_id: string;
  /** Links a request to its response (a response echoes the request's correlation_id). */
  correlation_id: string;
}

/** The A2A Logger event for a send (SENT) or a receive (RECEIVED). */
export function eventTypeForDirection(direction: "sent" | "received"): SovereignEventType {
  return direction === "sent" ? "AGENT_MESSAGE_SENT" : "AGENT_MESSAGE_RECEIVED";
}

/** Per-correlation workflow_step_id — shared by every event in a request/response exchange. */
export function messageWorkflowStep(correlationId: string): string {
  return `agentos-msg-${correlationId}`;
}

/** Validate an outbound message (a malformed message is never published). */
export function validateMessage(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["message must be a non-null object"] };
  }
  const errors: string[] = [];
  const m = value as Partial<AgentMessage>;
  const str = (v: unknown): boolean => typeof v === "string" && v.trim() !== "";

  if (!str(m.message_id)) errors.push("message_id: required non-empty string");
  if (!str(m.sender_agent_id)) errors.push("sender_agent_id: required non-empty string");
  if (!str(m.recipient_agent_id)) errors.push("recipient_agent_id: required non-empty string");
  if (!AGENT_MESSAGE_TYPES.includes(m.message_type as AgentMessageType)) {
    errors.push(`message_type: must be one of ${AGENT_MESSAGE_TYPES.join(" | ")}`);
  }
  if (typeof m.payload !== "object" || m.payload === null) errors.push("payload: required object");
  if (!str(m.workflow_step_id)) errors.push("workflow_step_id: required non-empty string");
  if (!str(m.correlation_id)) errors.push("correlation_id: required non-empty string");

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
