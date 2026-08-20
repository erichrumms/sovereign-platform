# SOVEREIGN Platform — SBOM Session Update
## Version 1.89 · August 19, 2026

**Supersedes:** v1.88 (`SBOM_Session119_Update.md`, Session 119). Version derived by scanning
all SBOM files on disk — highest was v1.88 — and adding one.
**Session:** 120 — single deliverable: strip the "Program Manager " prefix from the 17
program-level `responsible_party` seed values (follow-on to F-41). No shell-contract change,
no new agents, no new event type. Seed-data label change only.
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
| JS/TS | 2081 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2276** | **High** |

**Change from v1.88:** **+1 JS/TS** (2080 → 2081): one new test in
`module-apex/tests/PortfolioDashboard.test.tsx` pinning the bare names (and the absence of the
old prefixed form). Count methodology unchanged: sum of per-workspace passing counts; the 4
key-gated e2e live smokes remain skipped and excluded.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| File | Nature |
|---|---|
| `module-apex/src/synthetic-world-model.ts` | 17 program-level `responsible_party` values: "Program Manager <name>" → "<name>". The 11 provenance-record `responsible_party` values (DC-3 context) deliberately unchanged. |
| `module-apex/tests/PortfolioDashboard.test.tsx` | +1 test pinning the bare names |

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **D1 nuance worth recording:** `ProvenancePanel.tsx` / `report-generator.ts` do NOT read the
   program-level field — they render `ProvenanceRecord.responsible_party`, populated from
   `risk_flags[].provenance` (via `apex-analysis.ts:144`). Same field NAME, different entity —
   the strip was applied only to the 17 program-level literals, so the DC-3 context keeps its
   role-prefixed values ("Business Financial Manager Alex Reed" etc.), as the opening prompt
   required.
2. **Still open from Session 119:** `ProgramDetailView.tsx:85`'s own label "Responsible party:"
   — explicitly out of scope this session; the rendered line now reads "Responsible party:
   Dana Jones", which is accurate but still uses the old label term. Decision pending.
3. **Transient test-runner note (honesty over tidiness):** one full `module-apex` run showed a
   suite-level worker failure on `ProvenancePanel.test.tsx` with all executed tests passing;
   the suite passed in isolation and in two consecutive full re-runs (29/29 suites, 252/252
   tests). Not reproducible; no code implicated.
4. **F-25 / F-44 / Gate 3:** untouched, per the opening prompt.

---

*SOVEREIGN Platform — SBOM Session 120 Update v1.89 · August 19, 2026*
*Supersedes v1.88 (Session 119) · Pre-Decisional · Internal Working Document*
