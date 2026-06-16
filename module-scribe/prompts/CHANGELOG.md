# SCRIBE Prompt Registry — Changelog

SCRIBE prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (companion suite spec Part 3) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-SCRIBE-001 | `drafting_system.md` | `drafting-system-v1.0.md` | v1.0 | **PENDING Project Principal** | 2026-06-16 |

PR-SCRIBE-002+ (Style DNA analysis, synthesis) are authored in later sessions, per
the SCRIBE build sequence.

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
- Approved by: **PENDING Project Principal.** Authored Session 5; deployment in a
  live (non-synthetic) context requires Project Principal approval per the Prompt
  Registry change-management process.
