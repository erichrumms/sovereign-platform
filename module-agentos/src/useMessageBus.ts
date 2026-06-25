/**
 * SOVEREIGN Platform — module-agentos
 * useMessageBus.ts — the A2A message-bus hook (Logger emission for GD-14 events).
 *
 * Wraps the injectable MessageBus and emits the GD-14 events: AGENT_MESSAGE_SENT on send
 * (actor = sender), AGENT_MESSAGE_RECEIVED on receive (actor = recipient). Every event carries
 * the message's workflow_step_id (Standing Constraint #6) and the correlation_id in payload so
 * a request/response exchange is traceable. Neither is a human decision, so no decision_type.
 *
 * GATE 2 (fail-closed): the Logger event is emitted BEFORE the side effect — a failed emit on
 * send BLOCKS the publish (an unlogged message is an ungoverned message); a failed emit on
 * receive is surfaced as an error.
 *
 * Version: 1.0 · Session 16 · June 24, 2026
 */

import { useCallback, useState } from "react";

import type { SovereignShellContext, SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import {
  type AgentMessage,
  eventTypeForDirection,
  validateMessage,
} from "./agentos-message";
import type { MessageBus } from "./message-bus";

export interface UseMessageBus {
  error: string | null;
  /** Emit AGENT_MESSAGE_SENT then publish to the bus. Returns false (and sets error) if blocked. */
  send: (message: AgentMessage) => boolean;
  /** Emit AGENT_MESSAGE_RECEIVED for a delivered message (the recipient acknowledges receipt). */
  receive: (message: AgentMessage) => boolean;
  /** An agent's inbox (read through the bus). */
  inboxFor: (agentId: string) => AgentMessage[];
  clearError: () => void;
}

export function useMessageBus(ctx: SovereignShellContext, bus: MessageBus): UseMessageBus {
  const [error, setError] = useState<string | null>(null);

  const emit = useCallback(
    (message: AgentMessage, direction: "sent" | "received"): boolean => {
      const actorId = direction === "sent" ? message.sender_agent_id : message.recipient_agent_id;
      const event: SovereignLogEvent = {
        event_type: eventTypeForDirection(direction),
        workflow_step_id: message.workflow_step_id, // Constraint #6
        sovereign_tier: "standard",
        product: "AGENTOS",
        actor_id: actorId,
        actor: "agent",
        agent_id: actorId,
        outcome: `agent_message_${direction}`,
        payload: {
          message_id: message.message_id,
          message_type: message.message_type,
          correlation_id: message.correlation_id,
          sender_agent_id: message.sender_agent_id,
          recipient_agent_id: message.recipient_agent_id,
        },
      };
      try {
        ctx.logger.log(event);
        return true;
      } catch (err) {
        setError(`AGENT_MESSAGE_${direction.toUpperCase()} Logger emit failed (AgentOS Gate 2): ${err instanceof Error ? err.message : String(err)}`);
        return false;
      }
    },
    [ctx]
  );

  const send = useCallback(
    (message: AgentMessage): boolean => {
      setError(null);
      const validation = validateMessage(message);
      if (!validation.valid) {
        setError(`Invalid message: ${validation.errors.join("; ")}`);
        return false;
      }
      // Gate 2 fail-closed: emit SENT first; a failed emit blocks the publish.
      if (!emit(message, "sent")) return false;
      bus.publish(message);
      return true;
    },
    [bus, emit]
  );

  const receive = useCallback(
    (message: AgentMessage): boolean => {
      setError(null);
      return emit(message, "received");
    },
    [emit]
  );

  const inboxFor = useCallback((agentId: string): AgentMessage[] => bus.getMessages(agentId), [bus]);
  const clearError = useCallback((): void => setError(null), []);

  return { error, send, receive, inboxFor, clearError };
}
