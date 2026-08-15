# SOVEREIGN Platform — Strategic Plan to CTO Demo
## Version 3.14 · August 15, 2026

**Supersedes:** v3.13 (August 11, 2026) — drafted but never placed
**Status:** v3.13 upgraded readiness language once the live walkthrough was
complete. It was never placed, and nine sessions have happened since. This version
records GD-42's approval and rewrites the Foundry Q&A answer, which v3.13
**materially understated**.

---

## PART I — STRATEGY

### 1. The Objective

**Unchanged and correct:** PPBE execution governance with a deterministic compliance
layer and a real, verified audit trail.

**New evidence since v3.13, and it is the strongest kind.** Sessions 113 and 114
found and fixed two errors on demonstration surfaces — a site at 135% obligated and
a program at 104% obligated, both displaying "On track" because an obligation-status
function had a lower bound and no upper bound. The second was found by searching for
the same root cause elsewhere after fixing the first.

**Why this matters strategically:** the platform's own ledger monitor flagged program
ECHO at P1 for exceeding its ceiling, and the end-to-end test asserted
CEILING_EXCEEDED for it, while the Home Dashboard published "On Track."
**The alerting and the dashboard disagreed, and the platform's own process caught
it.** Screen 1 now agrees with both.

**The target remains Advance.** What remains before delivery is reading material
that already exists, confirming six roles on screen, and two governance decisions —
not platform verification.

### 2. Demo Scope, In Presentation Order

| # | Component | Role | Different this version |
|---|---|---|---|
| 1 | Core six-product pipeline + companion suite | Foundation | Unchanged |
| 2 | Governance/certification story, incl. GD-10 | The differentiator — lead with it | Unchanged |
| 3 | Reliability evidence | Substantiates 1 and 2 | **Four disclosed self-corrections, plus two demonstration-surface defects found and fixed in the last week.** Screen 1 now agrees with the platform's own alerting |
| 4 | Time & Travel, end to end | Proof-of-concept #1 | Unchanged |
| 5 | PPBE, end to end | Proof-of-concept #2 | Unchanged |
| 6 | Cost & Operations transparency | A genuinely new proof point | Rehearsal-ready. **State it as measured, not governed** — no budgets or caps exist |
| 7 | Intelligence Layer | Named, not built | Unchanged |
| 8 | STRATA, named alongside it | "Name it, don't apologise for it" | Still a draft, still not Build-Agent-verified or placed |

### 3-4. Strategic Principles / What This Plan Does Not Chase

*(Unchanged from v3.7.)*

---

## PART II — GOVERNING DECISIONS STATUS

**GD-42 APPROVED, August 15, 2026** — model governance. Next available: GD-43.
**GD-40 AMENDED, August 15, 2026** — explanatory scope narrowed.

---

## PART IX — CHANGE CONTROL

| Date | Change | Reason |
|---|---|---|
| *(through v3.12 — see those versions)* | — | — |
| **August 11, 2026** | v3.13 — readiness language upgraded; walkthrough complete; test suite and cross-module wiring independently re-verified | The rehearsal caveat no longer applied |
| **August 15, 2026** | **v3.14 — GD-42 recorded APPROVED; the Foundry Q&A model-governance answer rewritten; two demonstration-surface defects recorded as fixed; cost stated as measured rather than governed** | v3.13's model-governance framing understated what is built. Two errors on demo surfaces were found and closed. Both corrections belong in the plan the demonstration is delivered from |

---

## PART XII — CTO EVALUATION LENS

**Still points to the ten-category framework, whose actual questions remain
unread.** SOVEREIGN's own answers to it exist
(`SOVEREIGN_CTO_Framework_Applied_20260730.md`) and a real opening-remarks script
exists (`SOVEREIGN_CTO_Session_ReadAhead_20260730.md`). Both were located and read
this arc. **The framework's questions themselves have still not been read**, and
everything CTO-facing has been drafted without them.

### Prepared answer — "How is this different from Palantir Foundry?"

*(The category argument is unchanged from v3.13 and remains correct: this is a
different category of thing, not a smaller version of the same thing — a specific
set of already-built governed applications, with a data layer being added
underneath, and no visual builder because nothing here is meant to be assembled by
someone who is not engineering it.)*

**The model-governance passage is rewritten. v3.13 said the platform has no formal
model governance layer. That understates what exists, and GD-42 establishes why.**

> *"We run one primary provider. A second, local provider is built and tested — it
> routes by data classification, and it is unreachable today because our operating
> boundary is unclassified-only and the routing function throws a named error on
> anything above that before provider selection even happens. That is fifteen lines
> you could read, not a policy we are asking you to trust. Model weights are
> SHA-256 verified at load; a mismatch throws, blocks inference, and lands in the
> same append-only audit log as every other decision. Any model update — even a
> quantisation change — re-runs all four certification gates before promotion, with
> no expedited path, and the previous version stays in the SBOM as deprecated so a
> failed promotion has somewhere to fall back to. And changing providers is a
> governance decision here, not a config edit — even though technically it is a
> config edit, because every external call goes through one client."*

**Two qualifiers to volunteer rather than concede:**

- **The asymmetry.** Model governance is strongest for the provider that is
  currently switched off. The commercial provider in active use resolves through a
  default model constant and has no equivalent registry entry. Extending the
  registry to cover it is straightforward and is on the roadmap.
- **The FedRAMP correction.** Do **not** say the commercial API's lack of CUI
  authorisation makes local inference the only answer. FedRAMP-High authorised paths
  exist through the vendor's government offering and through major cloud providers'
  government environments. GovCloud was deferred by decision, not dismissed. Local
  inference is the path for work where no third-party cloud boundary is acceptable
  at all.

### LENS — confirmed live

A Governance Explainer (RAG-grounded, VIGIL-scoped today), a Pipeline Navigator whose
agent lists matched what was independently seen elsewhere, and an AI Transparency
panel. **Describe it as covering both orientation and explanation** — how the
platform works, and why it did what it did — not only post-hoc explanation.

**Say what it does not claim:** LENS does not expose a model's internal reasoning. It
shows the inputs, rules, evidence, and decisions that produced an outcome.

---

## PART XIII — WHAT NOT TO CLAIM (new this version)

Six phrasings were corrected against verified code this arc. The demonstration should
use the corrected forms.

| Do not say | Say instead |
|---|---|
| ARIA "decides compliance questions" | ARIA applies compliance rules; no AI in that decision path |
| CPMI "checks the AI's reasoning" | CPMI makes AI reasoning traceable and reviewable |
| "Nothing runs until someone approves it" | An AI's work stays advice until a person signs for it; AI may analyse and draft freely |
| "Permanent, tamper-evident record" | Append-only, hash-chained record — tamper *evidence*, not prevention |
| "The platform refuses anything above unclassified" | A request *marked* above unclassified is refused before any model call. The label is trusted; content is not inspected |
| "`MODEL_HASH_MISMATCH` raises a priority-one alert" | It blocks inference and is recorded. Alert dispatch is unbuilt Stage 4 scope |

**And one framing to hold:** SOVEREIGN is a governed application architecture, not a
control plane. Specific controls are enforced in the code path rather than in a
procedure. There is no runtime boundary that would stop a developer who deliberately
went around the shared client — that discipline is held by architecture and code
review. **Volunteer this before it is extracted.**

---

*SOVEREIGN Platform — Strategic Plan to CTO Demo v3.14 · August 15, 2026*
*Records GD-42; rewrites the model-governance answer v3.13 understated*
*Pre-Decisional · Internal Working Document*
