# module-apex — Prompt Registry CHANGELOG

All APEX agent prompts. No prompt runs before it is APPROVED by the Project Principal
(Standing Constraint #9). Claude Code marks a prompt APPROVED only after the approval is
recorded in Claude Chat.

| Registry ID | Agent | File | Status | Approved |
|---|---|---|---|---|
| PR-APEX-001 | `apex.ai-assistant` | `apex_assistant_system.md` | **APPROVED** | Project Principal, June 25, 2026 |

`apex.report-generator` uses **no prompt** — it performs deterministic document assembly and
makes no LLM calls.

---

## PR-APEX-001 — v1.0

- **June 25, 2026 — APPROVED.** The APEX AI Assistant system prompt (docs/13_APEX_Architecture.md
  §9). Approval recorded by the Project Principal in Claude Chat (pre-approved in the Session 17
  opening prompt). Enforces plain-prose output (Gap 5), DC-3 traceability (every finding cites a
  source), advisory-only output, and exact conformance to the `ApexAnalysisOutput` schema (GD-16).
  Runtime copy: `src/prompts/apex-assistant.prompt.ts`.
