# COUNSEL Prompt Registry — Changelog

COUNSEL prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (COUNSEL spec §7) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-COUNSEL-001 | `analysis_system.md` | `analysis-system-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-15 |
| PR-COUNSEL-002 | `counter_system.md` | `counter-system-v1.0.md` | v1.0 | **PENDING Project Principal** | 2026-06-16 |
| PR-COUNSEL-003 | `premortem_system.md` | `premortem-system-v1.0.md` | v1.0 | **PENDING Project Principal** | 2026-06-16 |

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

### v1.0 — 2026-06-16 (Session 5)

- **PR-COUNSEL-002 — COUNSEL Counterargument Mode system prompt.** Initial baseline.
  Drives the multi-turn adversarial dialogue (COUNSEL spec §2.4 / §6
  CounterargumentPanel): counsel-analyst is the user's strongest honest opponent on
  a selected alternative. Produces the per-turn `CounterargumentChallenge` JSON
  contract (`challengeToPosition`, `weaknesses[]`, `strongestOpposingCase`,
  mandatory non-blank `concession`, `openQuestions[]`, `pressureLevel` from the
  shared RiskSeverity set), validated by `module-counsel/src/counter-contract.ts`
  before display. Enforces "steelman, never strawman," "advise, do not decide,"
  and the no-fabrication rule. Three-tier fallback (live → cache → static challenge)
  in `src/counter-engine.ts`; runtime copy `src/prompts/counter-system.prompt.ts`.
- Agent: `counsel-analyst` (Analytical) — the single registered COUNSEL agent
  (spec §7); Counterargument Mode adds no new agent. Model supplied by
  `sovereign-api-client` (`claude-sonnet-4`) — not hardcoded in COUNSEL.
- Approved by: **PENDING Project Principal.** Authored Session 5; deployment in a
  live (non-synthetic) context requires Project Principal approval per the Prompt
  Registry change-management process.

- **PR-COUNSEL-003 — COUNSEL Pre-Mortem Studio system prompt.** Initial baseline.
  Drives the three-step failure-reconstruction exercise (COUNSEL spec §2.5 / §6
  PreMortemStudio): for a chosen course, counsel-analyst imagines the failure,
  reconstructs its causes, and surfaces early warnings + preventive actions.
  Produces the `PreMortemResult` JSON contract (`failureModes[]` ≥ 2, each with
  `failureNarrative`, `rootCauses[]`, `earlyWarnings[]`, `preventiveActions[]`,
  `severity` from RiskSeverity and `likelihood` from LOW/MODERATE/HIGH; plus
  `overallVulnerability` and `topPreventiveAction`), validated by
  `module-counsel/src/premortem-contract.ts` before display. Enforces "surface
  failure, do not decide," calibrated severity/likelihood, and the no-fabrication
  rule. Three-tier fallback (live → cache → static) in `src/premortem-engine.ts`;
  runtime copy `src/prompts/premortem-system.prompt.ts`.
- Agent: `counsel-analyst` (Analytical) — the single registered COUNSEL agent
  (spec §7); Pre-Mortem Studio adds no new agent. Model supplied by
  `sovereign-api-client` (`claude-sonnet-4`) — not hardcoded in COUNSEL.
- Approved by: **PENDING Project Principal.** Authored Session 5; deployment in a
  live (non-synthetic) context requires Project Principal approval per the Prompt
  Registry change-management process.
