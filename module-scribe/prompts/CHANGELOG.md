# SCRIBE Prompt Registry — Changelog

SCRIBE prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (companion suite spec Part 3) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-SCRIBE-001 | `drafting_system.md` | `drafting-system-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-16 |
| PR-SCRIBE-004 | `style_analysis_system.md` | `style-analysis-system-v1.0.md` | v1.0 | **PENDING — Project Principal** | 2026-06-17 |

PR-SCRIBE-002/003 (synthesis, framing system prompts) are authored in later
sessions, per the SCRIBE build sequence. PR-SCRIBE-004 (Style DNA analysis) is
authored this session ahead of 002/003 because the Style DNA deliverable (D2)
precedes synthesis/framing in the Session 6 plan; the registry ID follows the
session plan's explicit numbering, not strict authoring order.

## Change History

### v1.0 — 2026-06-16 (Session 5)

- **PR-SCRIBE-001 — SCRIBE Drafting Engine system prompt.** Initial baseline,
  authored alongside the module-scribe scaffold. Instructs `scribe-drafter` to
  produce a single JSON draft whose shape is the canonical output schema for the
  requested `SCRIBEMode` (the six product-intake schemas in `@sovereign/data`
  `scribe-modes.ts` plus the `synthesis` / `framing` intermediate modes). Enforces
  "draft, do not send/file/decide," matches the user's Style DNA when supplied,
  prohibits fabricated facts, and respects each destination schema exactly. The
  draft is validated against the mode's `@sovereign/data` schema before the user
  approves it at Export.
- Agents: `scribe-drafter` (Operational, drafting) and `scribe-style-analyst`
  (Analytical, Style DNA) — declared on the module per the approved decisions that
  name them (GD-2 `VOICE_CAPTURE_COMPLETED` / scribe-drafter; GD-1 `StyleProfile`
  ownership / scribe-style-analyst). Model supplied by `sovereign-api-client`
  (`claude-sonnet-4`) — not hardcoded in SCRIBE.
- Runtime copy: `src/prompts/drafting-system.prompt.ts` (synced to this registry
  file; the version string must match).
- **Scaffold status:** module-scribe is a scaffold this session — it implements
  `SovereignModuleContract`, mounts its React tree via the ModuleLoader, and shows
  the eight-mode selector. The drafting engine (LLM call + per-mode validation +
  three-tier fallback + Export gate) is a later session, following the COUNSEL
  scaffold→core sequence.
- Approved by: **Project Principal — APPROVED 2026-06-16.** Cleared for deployment
  in live (non-synthetic) contexts per the Prompt Registry change-management
  process. (Approving the prompt does not change the module's scaffold status — the
  SCRIBE drafting engine that uses it is a later session.)

### v1.0 — 2026-06-17 (Session 6)

- **PR-SCRIBE-004 — SCRIBE Style DNA style-analysis system prompt.** Authored
  alongside the D2 Style DNA build. Instructs `scribe-style-analyst` (Analytical)
  to read user-supplied writing samples and return ONLY the four StyleProfile
  *analysis* fields (`formality_score` 0–100, `sentence_complexity`,
  `vocabulary_density`, `structural_patterns[]`) from the canonical `@sovereign/data`
  `StyleProfile` (GD-1). The engine assembles the full profile (`user_id`,
  `sample_count`, `created_at`, `updated_at`) and validates it with
  `validateStyleProfile` before the human approves storage. Prohibits drafting,
  evaluation, and inference beyond the samples; prefers neutral values when evidence
  is thin. Data classification: `user`.
- Runtime copy: `src/prompts/style-analysis-system.prompt.ts` (synced to this
  registry file; the version string must match).
- **Approval: PENDING — Project Principal.** Claude cannot self-approve a prompt
  (same boundary as PR-COUNSEL-001 / PR-SCRIBE-001). Until approved, the prompt is
  not cleared for live (non-synthetic) use; the Style DNA feature runs against the
  static/synthetic fallback tiers in the interim.
