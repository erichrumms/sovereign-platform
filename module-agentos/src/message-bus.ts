/**
 * SOVEREIGN Platform — module-agentos
 * message-bus.ts — the injectable A2A message bus (GD-14) + synthetic/dev backing.
 *
 * AgentOS agents exchange messages through this injectable PORT, not a direct call (Standing
 * Constraints #1 / #3 — same injectable-port pattern as the VIGIL approval port and the
 * evaluate port). This session the backing is SYNTHETIC/DEV (Governance Clock OFF): an
 * in-memory bus with no live agent execution. The live transport is injected by configuration
 * in a later session — no AgentOS rewrite (Constraint #3).
 *
 * Delivery model: publish() appends the message to the recipient's inbox and synchronously
 * notifies that recipient's subscribers. getMessages() reads an agent's inbox. The Logger
 * emission (AGENT_MESSAGE_SENT / RECEIVED) is the hook's responsibility (useMessageBus), not
 * the bus's — the bus is pure plumbing.
 *
 * Version: 1.0 · Session 16 · June 24, 2026
 */

import type { AgentMessage } from "./agentos-message";

export type MessageHandler = (message: AgentMessage) => void;

/** The injectable A2A message bus. */
export interface MessageBus {
  /** Deliver a message to its recipient's inbox and notify that recipient's subscribers. */
  publish: (message: AgentMessage) => void;
  /** Subscribe an agent to its inbound messages. Returns an unsubscribe function. */
  subscribe: (agentId: string, handler: MessageHandler) => () => void;
  /** The messages delivered to an agent (its inbox), in arrival order. */
  getMessages: (agentId: string) => AgentMessage[];
}

/**
 * The default SYNTHETIC/DEV message bus — in-memory (Governance Clock OFF, no live agent
 * execution). Replace by injecting a live MessageBus (configuration change, Constraint #3)
 * when the A2A transport is wired.
 */
export function createSyntheticMessageBus(): MessageBus {
  const inboxes = new Map<string, AgentMessage[]>();
  const subscribers = new Map<string, Set<MessageHandler>>();

  return {
    publish: (message: AgentMessage): void => {
      const inbox = inboxes.get(message.recipient_agent_id) ?? [];
      inbox.push(message);
      inboxes.set(message.recipient_agent_id, inbox);
      const handlers = subscribers.get(message.recipient_agent_id);
      if (handlers) for (const handler of handlers) handler(message);
    },
    subscribe: (agentId: string, handler: MessageHandler): (() => void) => {
      const set = subscribers.get(agentId) ?? new Set<MessageHandler>();
      set.add(handler);
      subscribers.set(agentId, set);
      return () => {
        set.delete(handler);
      };
    },
    getMessages: (agentId: string): AgentMessage[] => [...(inboxes.get(agentId) ?? [])],
  };
}
