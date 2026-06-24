# CPMI Prompt Registry — Changelog

CPMI prompts live here, versioned per the SOVEREIGN Prompt Registry Specification
(`[function]-[role]-v[major].[minor].md`). No agent operates under an unregistered
or unapproved prompt. Old versions are never deleted; this file records the current one.

## Current Versions

| Registry ID | Logical name (CPMI spec §8) | File | Current Version | Approved By | Date |
|---|---|---|---|---|---|
| PR-CPMI-001 | `reasoning_chain.md` | `reasoning-chain-v1.0.md` | v1.0 | **APPROVED — Project Principal** | 2026-06-23 |

## Change History

### v1.0 — 2026-06-23 (Session 11, D2 — CPMI Module)

- **PR-CPMI-001 — CPMI reasoning-chain system prompt.** Authored per
  `08_CPMI_Architecture.md` §8. Instructs `cpmi.reasoning-chain` (Governance) to execute
  the six-step reasoning chain (Context Assembly → Risk Identification → Constraint
  Mapping → Option Generation → Recommendation Formation → Output Schema Validation),
  producing a single `ReasoningChainOutput` JSON object. Encodes the spec boundaries:
  steps are sequential and not combined; a `schema_valid: false` output is never
  surfaced downstream; the agent does not approve its own outputs — Gate 3 human
  attestation is required before a recommendation becomes canonical. Approval behavior
  `RE_EXECUTE` (the chain restarts after Gate 3 attestation). Model supplied by
  `sovereign-api-client` (`claude-sonnet-4`) — not hardcoded.
- **Approval: APPROVED — Project Principal, 2026-06-23** (recorded in
  `08_CPMI_Architecture.md` §8 / §10). Claude cannot self-approve a prompt.
- **Runtime copy created.** `src/prompts/reasoning-chain.prompt.ts` mirrors the body of
  `reasoning-chain-v1.0.md` verbatim. SYNC OBLIGATION applies.
- **Agents:** `cpmi.reasoning-chain` (Governance), `cpmi.world-model-api` (Operational),
  `cpmi.vrs-certification` (Governance) are registered on the CPMI module contract this
  session and recorded in `Agent_Identity_Standard.md v1.2`. Only `cpmi.reasoning-chain`
  uses a prompt; the other two serve structured queries / issue records (no prompt).
