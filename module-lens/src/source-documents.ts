/**
 * SOVEREIGN Platform — module-lens
 * source-documents.ts — the LENS Governance Explainer knowledge base.
 *
 * lens-explainer is grounded EXCLUSIVELY in these two source documents (spec §2.1 /
 * §6 / prompt PR-LENS-001). It must not answer beyond them. Each entry carries:
 *   - groundingText: a faithful plain-language condensation of the registered source
 *     document (docs/vigil_alert_response.md, docs/vigil_agent_approvals.md) sent to
 *     the model as context on every live call. It is a condensation of the repo
 *     documents, not new platform behaviour — LENS invents nothing.
 *   - staticSummary: a shorter condensation used by the static fallback tier when the
 *     explanation service is unavailable (spec §2.1 static tier).
 *
 * SYNC OBLIGATION: if docs/vigil_alert_response.md or docs/vigil_agent_approvals.md
 * change, update the matching groundingText/staticSummary here. These are the only
 * facts LENS is permitted to surface.
 *
 * Version: 1.1 · Session 42 · July 19, 2026
 */

/** The two LENS knowledge-base source documents (spec §2.1). */
export type LensSourceDocId = "vigil_alert_response" | "vigil_agent_approvals";

export interface LensSourceDocument {
  id: LensSourceDocId;
  /** Human-readable title shown in the UI source list. */
  title: string;
  /** Faithful condensation of the registered source doc — model grounding context. */
  groundingText: string;
  /** Shorter condensation for the static fallback tier. */
  staticSummary: string;
}

const ALERT_RESPONSE: LensSourceDocument = {
  id: "vigil_alert_response",
  title: "VIGIL Alert Response",
  groundingText: [
    "How the SOVEREIGN Platform responds to security alerts (source: vigil_alert_response.md).",
    "",
    "The SOVEREIGN Security Observability Framework runs continuously beneath every product. It watches for anomalies — unusual patterns in Logger events, honeytoken activations, and behavioral drift — and generates an alert when it detects one. The alert carries severity, source product, event type, and timestamp, is routed to VIGIL_ALERT_ENDPOINT, and appears in VIGIL's Alert Queue. VIGIL is the only user-facing surface where Security Framework alerts appear; no product handles its own alerts or builds its own anomaly detection.",
    "",
    "Access: only PLATFORM_ADMIN or SYSTEM_ADMIN roles can mount VIGIL. The system enforces this structurally before the module loads — it is not a UI restriction. Any other role gets an access-denied error. This is because alerts contain sensitive operational information.",
    "",
    "The Alert Queue shows each alert's severity (P1–P4, P1 most critical), source product, event type, timestamp, and status (new / under review / resolved). CPMI alerts get special handling: CPMI's governance outputs flow to every product, so CPMI runs under an enhanced monitoring tier with a tighter anomaly threshold (0.7x standard). A CPMI_DRIFT_DETECTED alert signals a potential platform-wide governance concern, and CPMI alerts are always routed at P1/P2 priority regardless of underlying severity.",
    "",
    "The Anomaly Triage Assistant (agent vigil-triage-analyst) analyzes an opened alert and produces a structured triage recommendation: a plain-language explanation, likely source and scope, suggested response actions ranked by priority, and related alerts. The recommendation is advisory, not a decision. The human operator reviews it and decides the response action. The Assistant cannot close, escalate, or take any action — only the human can. Every alert response is recorded as a HUMAN_DECISION Logger event with the operator's identity, the decision type, and a workflow step ID.",
    "",
    "If VIGIL_ALERT_ENDPOINT is not configured (as in development), the Alert Queue shows a configuration notice rather than erroring. An empty queue (no active alerts) is treated differently from an unconfigured endpoint (queue not yet operational) — an operator seeing an empty queue should first confirm the endpoint is configured.",
    "",
    "Severity and expected response: P1 critical (immediate), P2 high (within the hour), P3 medium (within the day), P4 low (next review cycle). P1/P2 are routed without batching; P3/P4 may be batched. CPMI alerts are always treated at elevated priority.",
  ].join("\n"),
  staticSummary:
    "VIGIL is the only surface where SOVEREIGN Security Framework alerts appear, accessible only to PLATFORM_ADMIN and SYSTEM_ADMIN roles. The Anomaly Triage Assistant (vigil-triage-analyst) recommends; the human operator decides. Every alert response is recorded as a HUMAN_DECISION event. An empty queue is not the same as an unconfigured endpoint, and CPMI alerts are always treated at elevated, potentially platform-wide priority.",
};

const AGENT_APPROVALS: LensSourceDocument = {
  id: "vigil_agent_approvals",
  title: "VIGIL Agent Approvals",
  groundingText: [
    "How the SOVEREIGN Platform governs agent actions (source: vigil_agent_approvals.md).",
    "",
    "SOVEREIGN runs AI agents that take actions on behalf of users. Some actions are consequential enough that a human must explicitly authorize them before they execute — particularly actions that affect records, modify governance state, or cross product boundaries. This is a governance requirement, not an AI limitation: an agent that acts without authorization produces an outcome with no human owner, which is unacceptable in audited environments. VIGIL's Agent Approval Queue is where those authorization requests appear, are reviewed, and are decided.",
    "",
    "Agents communicate using the A2A (Agent-to-Agent) protocol, which moves through stages: DEFINED (interfaces specified, not active), CARDS_REGISTERED (agents have registered capability cards but requests are not routed), and IMPLEMENTED (fully active — requests, responses, and approval routing to VIGIL). The Approval Queue shows the current A2A stage. During development the stage is DEFINED or CARDS_REGISTERED, and the Queue does not receive live requests until A2A reaches IMPLEMENTED.",
    "",
    "When live, each approval request shows the requesting agent (by agent_id), the action requested in plain language, the target product/record/resource, the agent's justification, the agent's own risk assessment, and an expiry. The operator reviews, may ask for more reasoning, and approves or rejects. Both outcomes are recorded as HUMAN_DECISION events with operator identity, decision type, and workflow step ID. Approval authorizes the agent to execute and report back; rejection stops the action. The approval record is a permanent governance artifact answering 'who authorized this agent action and when?'",
    "",
    "Two-person rule: actions that affect governance state, override a platform hold, or modify records with compliance implications require two-person authorization. The first approval places the request in a pending-second-authorization state; it does not execute until a second authorized operator approves independently. This mirrors the APEX two-person rule for governance hold overrides.",
    "",
    "Registered agents and approval class: counsel-analyst (auto-authorized, analysis only), scribe-drafter (human-gated export at Gate 3, not an A2A approval request), scribe-style-analyst (human-gated save, not an A2A request), lens-explainer (auto-authorized, explanation only), lens-orientation (auto-authorized, orientation only), vigil-triage-analyst (auto-authorized, recommendation only — human decides), vigil-approval-agent (routes approval requests, does not self-approve). Agents that only produce analysis, drafts, or recommendations do not route through the Approval Queue — their output is reviewed through the module's own interface. The Queue is specifically for agents whose actions cross product or governance boundaries.",
    "",
    "VIGIL and AgentOS are complementary: AgentOS orchestrates agent execution and lifecycle and routes A2A requests; VIGIL is the human-facing surface that governs that execution, records decisions, and feeds outcomes back to AgentOS. Only PLATFORM_ADMIN and SYSTEM_ADMIN roles can access VIGIL and the Approval Queue.",
    "",
    "Approval Queue decision windows (P1/P2/P3 risk classification — note: this is a separate three-tier scale from the Alert Queue's four-tier P1–P4 severity scale): P1 (highest consequence) — 15-minute decision window; P2 (significant) — 60-minute decision window; P3 (routine) — 4-hour decision window. Each approval request in the Queue shows its risk tier, and the deadline is visible on the card. An expired request is auto-rejected. The Alert Queue uses a different scale: P1 critical (immediate response), P2 high (within the hour), P3 medium (within the day), P4 low (next review cycle) — that scale has four tiers and governs how quickly a security alert must be reviewed, not how long a human has to decide on an agent action.",
  ].join("\n"),
  staticSummary:
    "VIGIL's Agent Approval Queue is where AI agent actions that need human authorization are surfaced, reviewed, and decided — accessible only to PLATFORM_ADMIN and SYSTEM_ADMIN. Agents communicate over the A2A protocol (DEFINED → CARDS_REGISTERED → IMPLEMENTED); the Queue receives live requests only at IMPLEMENTED. Every approval or rejection is a HUMAN_DECISION event, high-consequence actions require two-person authorization, and agents that only produce analysis or drafts do not route through the Queue. Approval Queue decision windows: P1 (highest consequence) = 15 minutes, P2 (significant) = 60 minutes, P3 (routine) = 4 hours — this is a separate three-tier scale from the Alert Queue's four-tier P1–P4 severity scale (critical/high/medium/low). VIGIL governs agent actions; AgentOS executes them.",
};

/** The complete LENS knowledge base — both documents, always supplied together (spec §2.1). */
export const LENS_SOURCE_DOCUMENTS: readonly LensSourceDocument[] = [
  ALERT_RESPONSE,
  AGENT_APPROVALS,
];

/** Lookup a source document by id. */
export function getSourceDocument(id: LensSourceDocId): LensSourceDocument {
  const found = LENS_SOURCE_DOCUMENTS.find((d) => d.id === id);
  // LENS_SOURCE_DOCUMENTS is exhaustive over LensSourceDocId.
  return found as LensSourceDocument;
}
