# COUNSEL Prompt Registry — Changelog

COUNSEL prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (COUNSEL spec §7) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-COUNSEL-001 | `analysis_system.md` | `analysis-system-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-15 |
| PR-COUNSEL-002 | `counter_system.md` | _to be authored_ | — | — | — |
| PR-COUNSEL-003 | `premortem_system.md` | _to be authored_ | — | — | — |

PR-COUNSEL-002 (Counterargument Mode) and PR-COUNSEL-003 (Pre-Mortem Studio) are
authored in their respective later sessions, per the COUNSEL build sequence.

## Change History

### v1.0 — 2026-06-15 (Session 4)

- **PR-COUNSEL-001 — COUNSEL Analysis Engine system prompt.** Initial baseline.
  Produces the `AnalysisResult` JSON contract: at least three distinct alternatives
  (each with pros/cons), exactly one risk scenario per alternative with a severity tag
  (LOW/MODERATE/HIGH/CRITICAL), assumption flags, a calibrated 0–100 confidence score,
  and a recommended next action. The prompt enforces "advise, do not decide,"
  prohibits fabricated facts, and mandates strict JSON output validated by
  `module-counsel/src/analysis-contract.ts` before display.
- Agent: `counsel-analyst` (Analytical). Model supplied by `sovereign-api-client`
  (`claude-sonnet-4`) — not hardcoded in COUNSEL.
- **Naming reconciliation (flagged for the Integration Brief):** the file follows the
  Prompt Registry versioned convention (`analysis-system-v1.0.md`); the COUNSEL spec §7
  logical name is `analysis_system.md`. The registry ID PR-COUNSEL-001 binds them.
- Benchmark pass: N/A (the registry's behavioral benchmark suite is CPMI-only).
- Approved by: **Project Principal — APPROVED 2026-06-15** (approval record
  PR-COUNSEL-001, `7 - SOVEREIGN/Companion Suite/Governance/`). Cleared for
  deployment in live (non-synthetic) contexts per the Prompt Registry
  change-management process.
