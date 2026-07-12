# Time & Travel Workflow Layer Prompt Registry — Changelog

Registered per `Prompt_Registry_Specification.md`. The Time & Travel workflow
layer is not a product module (docs/17 §2 — no new module directory), so its
prompts live in `tt/prompts/` rather than a `module-*/prompts/` directory; this
CHANGELOG is the registry record for that directory.

**Filename note (spec-vs-reality reconciliation, Session 27):** the Prompt
Registry Specification's naming convention is `[name]-v[major].[minor].md`, but
these two prompts are registered in `Agent_Identity_Standard.md` (D-TT5) under
the exact paths `tt/prompts/travel_drafting_system.md` and
`tt/prompts/time_drafting_system.md`. The AIS-registered paths are kept —
renaming them would break the authoritative agent registry's references.
Versions are tracked in this table instead.

## Current Versions

| Prompt | Agent | Current Version | Approved By | Date |
|---|---|---|---|---|
| travel_drafting_system | `tt.travel-drafter` | v1.0 | Project Principal | 2026-07-11 |
| time_drafting_system | `tt.time-drafter` | v1.0 | Project Principal | 2026-07-11 |

## Change History

### v1.0 — 2026-07-11 (registered 2026-07-12, Session 27)
- Initial baselines, drafted July 11, 2026 against the D-TT3-approved entity
  fields (TravelRequest/TravelPolicy for travel; TimeRecord/ComplianceFlag/
  ChargeAccount for time & expense).
- Approved by: Project Principal, July 11, 2026, alongside the D-TT7 Option A
  decision (D-TT3 entities reaffirmed unchanged) — the precaution that held
  approval pending D-TT7 resolved with no rework required.
- Benchmark pass: N/A (first version establishes the baseline; neither agent is
  CPMI Track A).
- Both agents remain Phase II builds (docs/17 §14) — registration satisfies
  Standing Constraint #9 (all prompts registered before build) ahead of the
  Session 28 build session. No agent operates under these prompts yet.
