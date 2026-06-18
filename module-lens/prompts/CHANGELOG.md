# LENS Prompt Registry — Changelog

LENS prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (LENS spec) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-LENS-001 | `explainer_system.md` | `explainer-system-v1.0.md` | v1.0 | **PENDING — Project Principal** | 2026-06-18 |

## Change History

### v1.0 — 2026-06-18 (Session 7, D2 — LENS Scaffold)

- **PR-LENS-001 — LENS Explainer system prompt.** Authored alongside the LENS scaffold
  (D2). Instructs `lens-explainer` (Operational) to explain platform behaviour in plain
  language, grounded ONLY in the supplied knowledge-base source documents (e.g.
  `vigil_alert_response.md`, `vigil_agent_approvals.md`) and context — no fabrication,
  no operational advice, no exposure of restricted record contents. Model supplied by
  `sovereign-api-client` (`claude-sonnet-4`) — not hardcoded.
- **Not wired this session.** The LENS scaffold ships its agent cards but makes no LLM
  call. No runtime copy (`src/prompts/explainer-system.prompt.ts`) is created until LENS
  core consumes the prompt, to avoid an unused copy that could silently drift from this
  registry entry. The prompt text is provisional pending the LENS architecture spec
  (`03_LENS_Orientation_Module.md`); a revision there is a new registry version + a
  CHANGELOG entry + Project Principal approval.
- **Approval: PENDING — Project Principal.** Claude cannot self-approve a prompt (same
  boundary as PR-COUNSEL-001 / PR-SCRIBE-001 / PR-SCRIBE-004 / PR-VIGIL-001). Until
  approved, the prompt is not cleared for live (non-synthetic) use.
- **PR-LENS-002 (orientation prompt) — deferred** to the LENS core build (not authored
  this session).
