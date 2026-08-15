# SOVEREIGN Platform — Governance Decision Record
## GD-42 (APPROVED) and GD-40 Amendment
### August 15, 2026 · Governance Agent · Pre-Decisional · Internal Working Document

---

# GD-42 — Model Governance

**Status: APPROVED** · Project Principal, August 15, 2026
**Verification:** complete. Every claim below rests on a document or code path read
directly. Full evidence in GD-42 Proposal Revision D.
**Next available GD number: GD-43.**

---

## 1 — What this decision closes

Integration Brief v1.60 §9 and Remaining Build Backlog v5 described five
model-governance decisions as unrecorded, citing `docs/07 §8.1`. That claim is
**wrong twice over.**

- `docs/06_LocalLLM_Architecture.md` **§8.1** is titled "Decisions Required Before
  Stage 4 Build" and lists D1-D5 as *open questions*.
- `10_LocalLLM_Infrastructure.md` **§7** records the *answers*, decided June 23,
  2026 and entered in Integration Brief v1.17.
- The Session 11 Handoff cites the location correctly as `docs/06 §8.1`. The
  Integration Brief and Backlog cite `docs/07 §8.1` — one document number off.

A section headed "Decisions Required" was read as a list of decisions never made,
without checking whether they had since been answered. They had been, one day
before that document family was finalised.

## 2 — What is decided

**2.1 — The five decisions are confirmed on record. GD-42 does not re-decide
them.** As recorded June 23, 2026 (Integration Brief v1.17), restated in
`docs/10 §7`:

| # | Decision |
|---|---|
| D1 | Infrastructure component — SBOM entry only, no agent registry entry |
| D2 | Local inference on Mac Mini M4; primary provider remains primary through the demonstration; 13B Q4/Q5; three-tier fallback; activates by configuration when a client requires it |
| D3 | Mac Mini M4 for development and demonstration; GovCloud deferred |
| D4 | Inference-only; fine-tuning deferred to Stage 10 |
| D5 | Agent Operator Scope update deferred until live inference activation |

**2.2 — Local inference serves a compliance boundary, stated accurately.**
`docs/06 §7.1` designates the local module as the CUI-and-above inference path.
**The earlier framing — that the commercial API is not FedRAMP-authorised for CUI
and therefore local inference is the only answer — is out of date and must not be
repeated.** FedRAMP-High authorised paths exist through the vendor's government
offering and through major cloud providers' government environments. D3's deferral
of GovCloud was a choice among real options.

**The accurate position:** local inference is the path for work where no
third-party cloud boundary is acceptable at all. For most federal work, managed
authorised paths are the right answer.

**2.3 — Boundary enforcement is active refusal.** `selectProvider()` in
`sovereign-api-client/src/routing.ts` throws `ClassificationNotAuthorizedError` for
CUI, SECRET and TOP_SECRET before provider selection. The CUI-to-local branch sits
below that guard, annotated in source as latent and unreachable while GD-10 stands.
Per `docs/06 §7.1`, mislabelled data reaching the wrong provider is a logged anomaly
event rather than a silent error.

**The qualifier:** the classification label is supplied by the caller and nothing
inspects content. This is an authorisation and routing control, **not** data-loss
prevention.

**2.4 — Session 13's build is confirmed present.** `ollama-provider.ts`,
`provider-registry.ts`, `routing.ts`, `model-registry.ts`, `inference-logger.ts`,
`ollama-endpoint.ts`, with three test files. `VITE_OLLAMA_ENABLED` is not set true
in any committed configuration. `anthropic-provider.ts` was not created as a
separate file; the primary path remained in the existing client — a deviation from
the spec's file list, not from its behaviour.

**2.5 — Model integrity is enforced; alert dispatch is unbuilt Stage 4 scope.**
SHA-256 verification at load throws `ModelIntegrityError`, blocks inference, and
emits `MODEL_HASH_MISMATCH` into the hash-chained record.
**`MODEL_HASH_MISMATCH` is in neither `P1_EVENT_TYPES` nor `P2_EVENT_TYPES`, so no
alert is dispatched.** `docs/06 §4.4` specifies it as P1-CRITICAL, but §4.4 is a
Stage 4 deliverable and Stage 4 has never been authorised. **No document may claim
that event raises an alert.**

**2.6 — Model updates require full re-certification.** Per `docs/06 §6.1`: any
update, including a minor version or quantisation change, re-runs all four CPMI-VRS
gates before promotion. No expedited path. The previous version is retained as
deprecated rather than deleted.

**2.7 — Provider changes are Governance Decisions, not configuration changes.**
Single-point wrapping makes a provider change technically a configuration edit.
That ease does not lower the governance bar.

## 3 — Impact assessment

| # | Question | Assessment |
|---|---|---|
| 1 | New event types emitted? | **None.** The three inference event types exist as of shell contract v1.6 (GD-8). |
| 2 | `HumanDecisionType` change? | **No.** |
| 3 | `SovereignEventType` change? | **No.** (An existing propagation gap is recorded separately in the Backlog.) |
| 4 | `AgentClass` change? | **No** — consistent with D1. |
| 5 | Exhaustive switches over a changed type? | **None.** |
| 6 | Additive or breaking? | **Neither.** Decision-record confirmation and documentation correction. |

Shell contract unchanged. No code. Test suite unaffected.

## 4 — What this decision does not do

Does not activate the second provider or lift the configuration gate. Does not
authorise Stage 4 or the alert-dispatch routing in `docs/06 §4.4`. Does not
re-decide D1-D5 or reopen D3's or D4's deferrals. Does not create a model
governance subsystem. Does not address the AI-output evaluation framework. Does not
change the unclassified-only boundary — GD-10 stands.

## 5 — Document corrections authorised by this decision

| Document | Change |
|---|---|
| Integration Brief | Retract the "five unrecorded decisions" claim explicitly; correct `docs/07 §8.1` to `docs/06 §8.1` |
| Remaining Build Backlog | Model governance row → decided; same citation correction |
| Strategic Plan (Foundry Q&A) | The "no formal model governance layer" framing understates what exists; rewrite |
| System Prompt | Framing contradiction struck; GD-42 cited |
| `DOCUMENT_MANIFEST.tsv` | `docs/` coverage for the Local LLM family |

---

# GD-40 — Amendment

**Status: AMENDED** · Project Principal, August 15, 2026
**Original decision stands. This amendment corrects the scope of its explanation.**

## What GD-40 said

GD-40 named a real, unmerged split between the PPBE-native program dataset
(`SYNTH-PRG-*`) and the World Model dataset (`P-100` series), and identified it as
genuine near-term Layer 3 modelling work.

## What Session 113 established

The split GD-40 names is real, but it explains **only part** of the cross-surface
program-count inconsistency. Verified with file-and-line evidence:

| Surface | Count | Source |
|---|---|---|
| Home Dashboard, Program Health | **5** | PPBE seed, de-duplicated by program id via `uniqueByProgramId` |
| Scenario-analyst output | **18** | The **same** PPBE seed, raw — 5 programs × 4 fiscal years |
| APEX Portfolio Dashboard | **17** | World Model dataset, zero overlap with the PPBE seed |

**GD-40's dataset-split hypothesis explains the 17 against the PPBE surfaces. It
does not explain 5 against 18, which is a dedup-versus-raw filtering difference on
one dataset.**

## What is amended

GD-40's explanatory scope is narrowed to the dataset split it actually describes. A
second, separate cause is recorded: the scenario-analyst enumerates
program-fiscal-year rows and labels them "programs."

**No surface is counting wrongly.** Each number is internally correct for what it
enumerates. The misleading one is the analyst's 18.

## What is not decided here

Whether to resolve the inconsistency by on-screen disclosure or by relabelling the
analyst output. Build Agent recommends disclosure as the lower-risk option before
the demonstration. **That remains an open decision** and is recorded in the
Remaining Build Backlog.

---

*SOVEREIGN Platform — GD-42 APPROVED and GD-40 Amendment · August 15, 2026*
*Governance Agent · Pre-Decisional · Internal Working Document*
*For entry into the GD Registry by a Build Agent placement session*
