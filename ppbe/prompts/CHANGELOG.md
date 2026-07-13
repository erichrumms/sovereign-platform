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
| evidence_synthesis_system | `ppbe-evidence-synthesizer` | v1.0 | **PENDING — Project Principal** | 2026-07-12 (Session 32) |

## Change History

### v1.0 — 2026-07-12 (Session 32 — PPBE Build Session 2, Full Cycle)

- **evidence_synthesis_system.md — initial baseline, PENDING.** Instructs
  `ppbe-evidence-synthesizer` (Analytical) to aggregate `EvaluationFinding`
  records and APEX program data into a single JSON synthesis report carrying
  the mandatory advisory label ("AI-generated recommendation — a human
  decides"), with every key finding citing `source_finding_ids` that exist in
  the supplied records — fabricated citations cause structural rejection by
  `module-apex/src/ppbe-evidence-synthesizer.ts`'s validator. Enforces
  "synthesize, do not decide," no-fabrication, and Gap 5 plain prose.
- Benchmark pass: N/A (not CPMI Track A).
- Approval: **PENDING — Project Principal.** Claude Code cannot self-approve a
  prompt (Constraint #9). Synthetic-data use within Session 32 is permitted per
  the July 12 reassignment; live use is not.
