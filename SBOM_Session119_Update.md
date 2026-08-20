# SOVEREIGN Platform — SBOM Session Update
## Version 1.88 · August 19, 2026

**Supersedes:** v1.87 (`SBOM_Session118_Update.md`, Session 118). Version derived by scanning
all SBOM files on disk — highest was v1.87 — and adding one.
**Session:** 119 — single deliverable: F-41 column rename on the APEX Portfolio Dashboard.
No shell-contract change, no new agents, no new event type, no architecture change. Label-level
change only.
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
| JS/TS | 2080 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2275** | **High** |

**Change from v1.87:** **+1 JS/TS** (2079 → 2080): one new test in
`module-apex/tests/PortfolioDashboard.test.tsx` asserting the renamed column header. Count
methodology unchanged: sum of per-workspace passing counts; the 4 key-gated e2e live smokes
remain skipped and excluded.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| File | Nature |
|---|---|
| `module-apex/src/PortfolioDashboard.tsx` | Column header "Responsible party" → "Program Manager" (one `<th>`) |
| `module-apex/tests/PortfolioDashboard.test.tsx` | +1 test pinning the new header and the absence of the old one |

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **Rule 12 note (reported, not acted on — the opening prompt's stop condition):** the same
   program-level label appears at `ProgramDetailView.tsx:85` ("Responsible party:
   {program.responsible_party}"). If the rename should extend there, that is a one-line
   follow-up needing its own authorization. `ProvenancePanel.tsx:40` also uses "Responsible
   party" but as a DC-3 provenance-record field — a different semantic context, probably
   correctly left as is.
2. **Data redundancy observation:** with the column now titled "Program Manager," each cell
   reads "Program Manager Dana Jones" — the title is now stated twice per row. Stripping the
   prefix from the 17 `responsible_party` seed values would touch `synthetic-world-model.ts`
   (out of this session's scope). Flagged for a Governance Agent decision.
3. **F-25 / F-44:** untouched, per the opening prompt.

---

*SOVEREIGN Platform — SBOM Session 119 Update v1.88 · August 19, 2026*
*Supersedes v1.87 (Session 118) · Pre-Decisional · Internal Working Document*
