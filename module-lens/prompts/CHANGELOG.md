# LENS Prompt Registry — Changelog

LENS prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (LENS spec) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-LENS-001 | `explainer_system.md` | `explainer-system-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-18 |

## Change History

### Session 8, D1 — LENS Core (2026-06-22)

- **PR-LENS-001 status: APPROVED — Project Principal, June 18, 2026.** Confirmed in the
  Session 8 opening prompt; the approval record lives in the governance documents. The
  prompt file header (which still read PENDING) was corrected to APPROVED this session.
- **Runtime copy created:** `src/prompts/explainer-system.prompt.ts` — the model-facing
  body of `explainer-system-v1.0.md`, verbatim. The LENS core explanation engine sends
  this copy. Sync obligation: any prompt change is a new registry version + a CHANGELOG
  entry + Project Principal approval, mirrored into the runtime copy.
- **Output shape:** the prompt's output is the canonical `LensExplanation` entity in
  `@sovereign/data` (`explanation`, `sources[]`, `confidence` grounded|partial, `gaps[]`).
  The entity was aligned to this prompt per the Project Principal's Session 8 decision.
- **`lens-explainer` agent class corrected** Operational → Analytical (LENS spec §2.1) in
  `src/index.ts` and this prompt's header.
- **PR-LENS-002 (orientation) — still deferred.** The Pipeline Navigator is a static
  render and makes no LLM call.

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
