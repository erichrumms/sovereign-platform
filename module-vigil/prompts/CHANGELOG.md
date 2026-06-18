# VIGIL Prompt Registry — Changelog

VIGIL prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (VIGIL spec §7) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-VIGIL-001 | `triage_system.md` | `triage-system-v1.0.md` | v1.0 | **PENDING — Project Principal** | 2026-06-17 |

## Change History

### v1.0 — 2026-06-17 (Session 6)

- **PR-VIGIL-001 — VIGIL Anomaly Triage system prompt.** Authored alongside the
  VIGIL scaffold (D3). Instructs `vigil-triage-analyst` (Monitoring) to assemble and
  interpret an anomaly's context into an advisory triage brief (ranked likely causes,
  recommended investigation steps, `false_positive_likelihood` 0–100). Encodes the
  spec boundaries: advisory-only (the operator decides — Gate 3), no CPMI
  reasoning-quality judgement on `CPMI_DRIFT_DETECTED`, honeytoken triggers out of
  scope. Model supplied by `sovereign-api-client` (`claude-sonnet-4`) — not hardcoded.
- **Not wired this session.** The VIGIL scaffold ships with `agentCards: []` and makes
  no LLM call — the Anomaly Triage Assistant, the `vigil-triage-analyst` agent
  registration, and the `TRIAGE_ANALYSIS_PRODUCED` emission are a later session (spec
  §8). No runtime copy (`src/prompts/triage-system.prompt.ts`) is created until the
  triage engine consumes the prompt, to avoid an unused copy that could silently
  drift from this registry entry.
- **Approval: PENDING — Project Principal.** Claude cannot self-approve a prompt
  (same boundary as PR-COUNSEL-001 / PR-SCRIBE-001 / PR-SCRIBE-004). Until approved,
  the prompt is not cleared for live (non-synthetic) use.
