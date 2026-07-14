# PPBE Workflow Layer Prompt Registry — Changelog

Registered per `Prompt_Registry_Specification.md`. The PPBE workflow layer is
not a product module (D-P6 — no new module directory), so its prompts live in
`ppbe/prompts/` rather than a `module-*/prompts/` directory; this CHANGELOG is
the registry record for that directory. This mirrors the `tt/prompts/`
precedent exactly (Session 27).

**Filename note (same reconciliation as tt/prompts):** the Prompt Registry
Specification's naming convention is `[name]-v[major].[minor].md`, but these
prompts are registered in `Agent_Identity_Standard.md` (D-P5) under exact
paths (`ppbe/prompts/evidence_synthesis_system.md`, etc.). The AIS-registered
paths are kept; versions are tracked in this table instead.

**Authorship note (July 12, 2026 reassignment, AGENT_REFERENCE.md):** these
prompts are authored by Claude Code (the Build Agent) during the build session
they belong to, marked PENDING on creation. A PENDING prompt is usable within
its session against synthetic data only. Claude Chat produces the approval
record; the Project Principal approves before any of them is treated as
cleared beyond that. **No prompt in this registry is approved for live
(non-synthetic) use until its status below reads APPROVED.**

## Current Versions

| Prompt | Agent | Current Version | Status | Authored |
|---|---|---|---|---|
| evidence_synthesis_system | `ppbe-evidence-synthesizer` | v1.0 | APPROVED — July 13, 2026 | 
| scenario_analysis_system | `ppbe-scenario-analyst` | v1.0 | APPROVED — July 13, 2026 | 
| exhibit_drafting_system | `ppbe-exhibit-drafter` | v1.0 | APPROVED — July 13, 2026 | 
| coordination_system | `ppbe-coordination-assistant` | v1.0 | APPROVED — July 13, 2026 | 

## Change History

### v1.0 — 2026-07-12 (Session 32 — PPBE Build Session 2, Full Cycle)

- **evidence_synthesis_system.md — initial baseline, APPROVED — July 13, 2026 Instructs
  `ppbe-evidence-synthesizer` (Analytical) to aggregate `EvaluationFinding`
  records and APEX program data into a single JSON synthesis report carrying
  the mandatory advisory label ("AI-generated recommendation — a human
  decides"), with every key finding citing `source_finding_ids` that exist in
  the supplied records — fabricated citations cause structural rejection by
  `module-apex/src/ppbe-evidence-synthesizer.ts`'s validator. Enforces
  "synthesize, do not decide," no-fabrication, and Gap 5 plain prose.
- Benchmark pass: N/A (not CPMI Track A).
- Approval: APPROVED — July 13, 2026 Claude Code cannot self-approve a
  prompt (Constraint #9). Synthetic-data use within Session 32 is permitted per
  the July 12 reassignment; live use is not.

- **scenario_analysis_system.md — initial baseline, APPROVED — July 13, 2026 Instructs
  `ppbe-scenario-analyst` (Analytical) to model at least two alternative
  resource allocations per request as a JSON scenario report carrying the
  mandatory scenario-modeling label ("AI-generated scenario modeling — not a
  decision or a recommendation to execute"). Allocation changes may name only
  programs present in the supplied portfolio — fabricated programs cause
  structural rejection by `module-apex/src/ppbe-scenario-analyst.ts`'s
  validator. Enforces no-ranking, honest confidence calibration, and Gap 5
  plain prose. Output feeds COUNSEL's decision framing at host level.
- Benchmark pass: N/A (not CPMI Track A).
- Approval: APPROVED — July 13, 2026 Same terms as above.

- **exhibit_drafting_system.md — initial baseline, APPROVED — July 13, 2026 (authored July 12,
  registered July 13 after the session resumed from a usage-limit
  interruption). Instructs `ppbe-exhibit-drafter` (Operational) to draft in
  three PPBE document modes (Budget Exhibit, Congressional Justification,
  Evaluation Report) as a JSON draft whose every figure cites the
  workflow_step_id of a supplied governed record — fabricated figure sources
  cause structural rejection by `module-scribe/src/ppbe-exhibit-contract.ts`.
  Enforces the system-invisibility rule (same validator as the TT drafters)
  and the double export gate framing (CLEAR certification AND human sign-off —
  neither is the agent's to grant). GOVERNANCE NOTE: the registry's prompt
  requirement for this agent overrides docs/18 §5's "inferred no" (Session 32
  standing rule, Lesson 16).
- Benchmark pass: N/A (not CPMI Track A).
- Approval: APPROVED — July 13, 2026 Same terms as above.

- **coordination_system.md — initial baseline, APPROVED — July 13, 2026 Instructs
  `ppbe-coordination-assistant` (Operational) to read unstructured
  coordination material against the tracked item list and produce an advisory
  digest — update proposals citing only tracked items (fabricated references
  rejected structurally by `module-nexus/src/ppbe-coordination-assistant.ts`),
  every proposal requiring explicit human authorization, mandatory advisory
  label. Deadline monitoring is deterministic and runs outside the prompt.
  GOVERNANCE NOTE: the registry's prompt requirement overrides docs/18 §5's
  "inferred no" (Session 32 standing rule); the agent was moved from Session 31
  per that session's decision #1.
- Benchmark pass: N/A (not CPMI Track A).
- Approval: APPROVED — July 13, 2026 Same terms as above.

**All four PPBE prompts (D-P5) are now authored and registered APPROVED — July 13, 2026.**
