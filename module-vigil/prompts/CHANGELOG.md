# VIGIL Prompt Registry — Changelog

VIGIL prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (VIGIL spec §7) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-VIGIL-001 | `triage_system.md` | `triage-system-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-17 |
| PR-VIGIL-002 | `approval_system.md` | `approval-system-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-23 |

## Change History

### v1.0 — 2026-06-23 (Session 10, D2 — Agent Approval Flow)

- **PR-VIGIL-002 — VIGIL Agent Approval system prompt.** Authored per
  `05_VIGIL_Agent_Approval.md` §8. Instructs `vigil-approval-agent` (Monitoring) to
  turn a structured AgentOS approval request into a labeled-section brief (REQUESTED
  ACTION / WHAT CHANGES / REVERSIBILITY / RISK CLASSIFICATION / AGENT CONTEXT) that
  helps the operator decide. Strictly advisory: it makes NO recommendation, does not
  self-approve, speculates on nothing, and is grounded only in the request. If a
  request field is missing/malformed it states what is missing and produces no brief.
  Model supplied by `sovereign-api-client` (`claude-sonnet-4`) — not hardcoded.
- **Approval: APPROVED — Project Principal, 2026-06-23** (recorded in
  `05_VIGIL_Agent_Approval.md` §8 / §12). Claude cannot self-approve a prompt.
- **Runtime copy created.** `src/prompts/approval-system.prompt.ts` mirrors the body of
  `approval-system-v1.0.md` verbatim. SYNC OBLIGATION applies (a prompt change is a new
  registry version + CHANGELOG entry + Project Principal approval, mirrored in both).
- **Agent:** `vigil-approval-agent` (Monitoring, `ACKNOWLEDGE_AND_CONTINUE`) is
  registered on the VIGIL module contract this session and recorded in
  `Agent_Identity_Standard.md v1.1`.

### v1.0 — 2026-06-17 (Session 6)

- **PR-VIGIL-001 — VIGIL Anomaly Triage system prompt.** Authored alongside the
  VIGIL scaffold (D3). Instructs `vigil-triage-analyst` (Monitoring) to assemble and
  interpret an anomaly's context into an advisory triage brief (ranked likely causes,
  recommended investigation steps, `false_positive_likelihood` 0–100). Encodes the
  spec boundaries: advisory-only (the operator decides — Gate 3), no CPMI
  reasoning-quality judgement on `CPMI_DRIFT_DETECTED`, honeytoken triggers out of
  scope. Model supplied by `sovereign-api-client` (`claude-sonnet-4`) — not hardcoded.
- **Approval: APPROVED — Project Principal, 2026-06-17.** Cleared for live use.
  Claude cannot self-approve a prompt; this approval was recorded by the Project
  Principal (same boundary as PR-COUNSEL-001 / PR-SCRIBE-001 / PR-SCRIBE-004).

### v1.0 runtime wiring — 2026-06-18 (Session 7, D1 — VIGIL Core)

- **Now consumed by code.** The Anomaly Triage Assistant is built (Session 7, D1):
  `vigil-triage-analyst` (Monitoring) is registered on the VIGIL module contract and
  in `Agent_Identity_Standard.md`, the triage engine makes one
  `createSovereignClient().complete` per session with three-tier fallback, and
  `TRIAGE_ANALYSIS_PRODUCED` (plus `AGENT_STEP_*` / `FALLBACK_ACTIVATED`) is emitted.
- **Runtime copy created.** `src/prompts/triage-system.prompt.ts` mirrors the body of
  `triage-system-v1.0.md` verbatim. SYNC OBLIGATION: any edit to either MUST be
  mirrored in the other; a prompt change requires a new registry version + a CHANGELOG
  entry + Project Principal approval. No prompt text changed in this session — only the
  runtime copy was added and the approval/registration recorded.
