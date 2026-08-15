# SOVEREIGN Platform — SBOM Session Update
## Version 1.84 · August 15, 2026

**Supersedes:** v1.83 (`SBOM_Registry_v1.83_MERGED.md`, the merged registry placed this
session) and v1.82 (Session 114). Version derived by scanning all SBOM files on disk — highest
was v1.83 — and adding one.
**Session:** 115 — Governance-document placement pass (nine documents; no code change).
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.
No GD was raised this session (next GD remains **GD-43**; GD-42 was APPROVED and GD-40 amended by
the Project Principal on August 15, 2026, recorded in the placed source document, not yet in the
GD Registry). No shell-contract change (Constraint #11).

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** No new agents registered (Agent_Identity_Standard.md v1.1 → v1.2 is a
confirmation/formatting update, not a count change).
**Prompts: 20 (19 approved + 1 pending) — unchanged.**

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2059 | High — all 15 suites pass, real exit codes via `sovereign_session_verify.sh` |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2254** | **High** |

**Change from v1.82:** none. This was a documentation-placement session with no code change; test
counts are unchanged (JS/TS 2059, Python 195).

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.** No packages added or removed. Vulnerability posture unchanged.

---

## 5 — Documents Placed This Session (nine)

Governance documents authored by the Governance Agent, placed by the Build Agent into the
repository root. Content unmodified except one authorized filename correction (below).

| Document | Version | Disposition |
|---|---|---|
| AGENT_REFERENCE.md | v3.10 → v3.11 | Lessons 40-45 imported; Lessons 1-45 continuous |
| Agent_Identity_Standard.md | v1.1 → v1.2 | Sessions 107-114 confirmation; agent-id formatting |
| SOVEREIGN_Platform_Integration_Brief_v1.61.md | v1.61 | supersedes v1.58 |
| SOVEREIGN_Strategic_Plan_CTO_Demo_v3.14.md | v3.14 | supersedes v3.11 |
| SOVEREIGN_Remaining_Build_Backlog_v6_20260815.md | v6 | supersedes v3_20260806; **renamed** (D1) |
| GD-42_APPROVED_and_GD-40_Amendment.md | — | source for GD Registry entry (not the registry) |
| SOVEREIGN_CTO_Framework_Applied_v2.md | v2 | new family; authored name preserved |
| SBOM_Registry_v1.83_MERGED.md | v1.83 | supersedes v1.44 (disk) and v1.74 (never placed) |
| DOCUMENT_MANIFEST.tsv | — | Session 115 batch; 111 rows verified against disk |

**One filename reconciliation (D1):** the staged `SOVEREIGN_Remaining_Build_Backlog_v6.md` was
placed as `SOVEREIGN_Remaining_Build_Backlog_v6_20260815.md` to match the on-disk version+date
convention (`v3_20260806`); its manifest row was corrected to agree. This is the only content
change to any staged document this session. The CTO Framework had no on-disk precedent, so its
authored name was preserved.

Superseded versions (Integration Brief v1.58, Strategic Plan v3.11, Backlog v3_20260806, SBOM
registry v1.44) were **not** deleted — they remain the historical record.

---

## 6 — Items Outstanding for the Project Principal

1. **GD Registry** does not yet contain GD-42 or the GD-40 amendment. Registry authoring is
   Governance Agent scope; not done this session.
2. **`DOCUMENT_MANIFEST_v4.tsv`** — stale July-31 artifact in `~/Downloads` (not in repo);
   reported, not deleted or renamed.
3. **AGENT_REFERENCE.md v3.11** manual copy to iCloud root + project knowledge (eighth consecutive
   session; no automated check reaches either destination).

---

*SOVEREIGN Platform — SBOM Session 115 Update v1.84 · August 15, 2026*
*Supersedes v1.83 (registry, this session) and v1.82 (Session 114) · Pre-Decisional · Internal Working Document*
