# VIGIL Prompt Registry — Changelog

VIGIL prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (VIGIL spec §7) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-VIGIL-001 | `triage_system.md` | `triage-system-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-17 |

## Change History

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
