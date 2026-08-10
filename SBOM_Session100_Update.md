# SOVEREIGN Platform — SBOM Update
## Session 100 · v1.68 · August 10, 2026

**Supersedes:** SBOM_Session99_Update.md (v1.67)
**Session type:** Record correction — Session 99 integrity pass

---

## What changed this session

No production dependencies added or removed.
No shell-contract changes.
No new code modules.
No new governance decisions.

Session 99 introduced a factual error in its governance record: GD-40's
"Authorized session" fields (across `SOVEREIGN_GD_Registry_20260810.md`,
`SOVEREIGN_Session99_Handoff.md`, `SBOM_Session99_Update.md`, and
`docs/39`) falsely stated that the proposed GD-40 subject was MCP registry
serving, and that the subject was re-scoped to entity resolution during
approval. In fact, GD-40's subject was always entity resolution — the
mislabel originated in Session 98 draft documents and was incorrectly
treated as authoritative. This session corrects all instances of that claim.

---

## Files corrected

| File | Correction |
|---|---|
| `SOVEREIGN_GD_Registry_20260810.md` | Header note, confirmed-decisions table, Authorized session, Open Questions #2 |
| `docs/39_STRATA_Integration_Work_Scope_and_Schedule.md` | Decision field and Authorized session field for GD-40 |
| `SOVEREIGN_Session99_Handoff.md` | Note #1 and Open Questions #2 |
| `SBOM_Session99_Update.md` | GD registry state note #1 |

---

## Platform state

| Item | v1.67 (Session 99) | v1.68 (Session 100) |
|---|---|---|
| Shell contract | v1.28 | v1.28 (unchanged) |
| JS/TS tests | 2,050 | 2,050 (unchanged) |
| Python tests | 195 | 195 (unchanged) |
| GD Registry | `SOVEREIGN_GD_Registry_20260810.md` | Same — corrected |

---

*SBOM v1.68 · Session 100 · August 10, 2026*
*Record correction — Session 99 integrity pass*
