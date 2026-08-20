# SOVEREIGN Platform — SBOM Session Update
## Version 1.90 · August 19, 2026

**Supersedes:** v1.89 (`SBOM_Session120_Update.md`, Session 120). Version derived by scanning
all SBOM files on disk — highest was v1.89 — and adding one.
**Session:** 121 — D1: Program Detail header label rename (F-41 family, one line). D2:
nine-convention consistency survey, **report-only — zero code changes** (findings in the
Session 121 Handoff). No shell-contract change, no new agents, no new event type.
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. Confirmed unchanged at open
AND close. No GD raised (next GD remains **GD-43**).

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** **Prompts: 20 (19 approved + 1 pending) — unchanged.**

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2082 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2277** | **High** |

**Change from v1.89:** **+1 JS/TS** (2081 → 2082): one new test in
`module-apex/tests/ProgramDetailView.test.tsx` pinning the renamed header label. Count
methodology unchanged; the 4 key-gated e2e live smokes remain skipped and excluded.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| File | Nature |
|---|---|
| `module-apex/src/ProgramDetailView.tsx` | Header label "Responsible party:" → "Program Manager:" (one line, D1) |
| `module-apex/tests/ProgramDetailView.test.tsx` | +1 test pinning the new label |

**D2 produced zero code changes, as the opening prompt required.** All D2 output is the survey
report in `SOVEREIGN_Session121_Handoff.md`.

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

The D2 survey found **6 substantive findings** (2 banner-wording/coverage gaps in NEXUS and
SCRIBE, 2 missing/misleading AI disclosures in VIGIL and LENS, 1 fixed-colour completion bar in
APEX ReportCharts, 1 partial-coverage pattern across COUNSEL/APEX/FLOWPATH Gate 1 banners) and
confirmed **conventions 2, 3, 4, 8, and 9 clean platform-wide**. Full findings, in the required
per-finding format, are in the Handoff §D2. None were fixed this session, by explicit
instruction.

---

*SOVEREIGN Platform — SBOM Session 121 Update v1.90 · August 19, 2026*
*Supersedes v1.89 (Session 120) · Pre-Decisional · Internal Working Document*
