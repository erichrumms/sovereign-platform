## 16. Update — July 30, 2026: Multi-Year Obligation Math, the BY/BY+1 Gate, and Point-of-Contact Data

**Not an amendment to §3's schema — three real behavioral corrections and one
additive field, built against the schema §14/§15 already established, elaborated here
because each touches this document's own data model directly.**

**WH-34 — a real defect in how §3.2's `obligation_plan` gets aggregated across the
per-year `ProgramRecord`s §15 established.** Consumers summing obligated dollars across
a program's multiple fiscal-year records, while dividing by only one year's planned
figure, produced badly wrong percentages (DELTA read 338% instead of ~95%). Fixed
(Session 71) via two helpers every future consumer of this data must use:
`uniqueByProgramId()` (one record per program, not year-specific) and
`obligationsForYear()` (obligations correctly scoped to a single fiscal year before any
rate or variance calculation). See `SOVEREIGN_PPBE_MultiYear_DataModel_Architecture_20260730.md`
for the full pattern and the rule going forward.

**WH-37 — a real gap in how FY2027 (Budgeting) and FY2028 (Programming) data was
rendered, confirmed by direct code trace, not a hypothetical.** Both had no real
obligation concept per §15's own phase table, but the UI was still rendering obligation
rate, an on-track/off-track badge, and a variance chart against them. Fixed (Session 74)
via an `isBudgetYear` gate showing a planning notice instead. WH-48 (Session 76)
confirmed the same gate correctly suppresses the variance table that later replaced the
variance chart's prose captions — the suppression is structural, not something that had
to be re-implemented per display format.

**WH-49 — fiscal-year selection now carries across navigation, where it previously
didn't.** Selecting PY on the Dashboard and clicking into a program's Detail view
silently reset to CY. Fixed (Session 76) by threading the selected year through the
navigation callback rather than letting the Detail screen re-derive its own default.

**GD-30 — `point_of_contact` added to `ProgramStatusSnapshot` (Session 75), the first
real shell-contract change touching this document's data model since it was written.**
Optional `{ name, role }` field, populated for all five FY2026 SYNTH-PRG programs with
clearly synthetic names. Shell contract v1.23 → v1.24.

---

*docs/18 §16 · July 30, 2026 append*
