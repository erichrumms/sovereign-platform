# SOVEREIGN Platform — Governance Decision (GD) Registry
## Update — August 15, 2026 · Governance Agent
## Supersedes SOVEREIGN_GD_Registry_20260810.md

**What changed since the August 10 version:** **GD-42 (Model Governance) approved**
by the Project Principal on August 15, 2026, and **GD-40 amended** the same day to
narrow the scope of its explanation. Both were recorded via direct Governance Agent /
Project Principal interview; no Build Agent code session was the vehicle. Full source
text: `GD-42_APPROVED_and_GD-40_Amendment.md`, placed in Session 115.

**Next available number after GD-42 is GD-43.**

---

**What changed since the August 9 version:** GD-36 through GD-41, placed as
proposals in Session 98, were approved by the Project Principal on August 10, 2026
via direct Governance Agent / Project Principal interview (Session 99 — governance
recording; no Build Agent code session). All six are now confirmed governance
decisions. Two notes on the approvals:

1. **GD-40's subject — entity resolution for the two program datasets — was
   unchanged from its first proposal.** Session 98 draft documents (including
   `SOVEREIGN_GD_Registry_20260809.md`) mislabeled GD-40 as covering MCP registry
   serving; that was an error in those drafts, not a description of GD-40's intended
   subject. What changed following direct review of
   `docs/SOVEREIGN_Two_Program_Datasets_Clarification_20260730.md` was the reasoning:
   the approved text treats the PPBE-native / World Model separation as a current
   historical artifact requiring domain-expert confirmation to resolve, not a permanent
   semantic distinction. The MCP-serving / persistent-service question is a separate
   concern, not addressed by GD-40. It remains open and will require its own
   governance decision before Phase 3 begins.

2. **GD-38's approval authorizes the mechanism, not the shell-contract change.**
   Approval establishes `SCHEMA_APPROVAL` as the future `HumanDecisionType` addition
   and the `ReviewerWorkspaceSurface` pattern as the schema review gate. The actual
   shell-contract change (version bump, type sync, Rule 13 parity-test report) is
   deferred to Phase 3+ build work, after the demo-pause completes. No shell-contract
   change is authorized by this session.

The Build Agent placed the proposals; the Governance Agent records decisions. The
distinction between a found answer (Phase 0 finding) and a closed decision (recorded
GD) is maintained throughout — per the discipline established at the time of Rule 16.

---

## Confirmed governance decisions

| GD | Subject | Status | Notes |
|---|---|---|---|
| GD-10 | Classification boundary — UNCLASSIFIED only, CUI/SECRET/TOP SECRET blocked and logged | Approved, standing | Unchanged |
| GD-20 | ARIA/CLEAR shell-contract change | Approved | Unchanged |
| GD-26 | Workspace product (Reviewer's Workspace) | Approved | Unchanged |
| GD-28 | (subject not independently reconfirmed this update) | Referenced | Unchanged from prior registry |
| GD-29 | Never existed as a real governance decision | N/A | Unchanged |
| GD-30 | Add `point_of_contact` to `ProgramStatusSnapshot` | Approved | Shell contract v1.23 → v1.24 |
| **GD-31** | **Token & Cost Telemetry — `token_usage?` field on `SovereignLogEvent`; 10 real `AGENT_STEP_COMPLETE` sites instrumented; NexusApp Gate 2 follow-on** | **Approved** | **Session 77. Shell contract v1.24 → v1.25. Docs: `docs/31`. Real live-call cost data did not exist on this platform before this GD.** |
| **GD-32** | **SysAdmin Cost Dashboard** | **Approved** | **Session 78. No shell-contract change — reads existing `getEntries()`. Docs: `docs/32`. Session-scoped only (no Stage 2 persistence).** |
| **GD-33** | **Program & Staff Data Foundation — `reports_to?` on `SovereignUser`; `StaffProjectAssignment` entity; 56 real synthetic staff across 8 teams; PPBE-native 5→15 programs; World Model corrected-baseline 5→18 programs; T&T 8→42 travel / 6→30 time records** | **Approved** | **Session 79. Shell contract v1.25 → v1.26. Docs: `docs/35` (not `docs/33` — doc numbering and GD numbering are independent sequences; `docs/33` was never created).** |
| **GD-34** | **Cost-tracking observability — failure categorization (`fallback_category`), `duration_ms`, `stop_reason` (truncation signal), `responded_at`; Cost Dashboard per-category breakdown** | **Approved** | **Session 87. Shell contract v1.26 → v1.27. Grew from a Build Agent reflection session (86) that examined the shipped GD-31/32 work and proposed what was missing — not originally scoped in GD-31.** |
| **GD-35** | **F5 — the three PPBE "advisory" panels (Exhibit, Coordination, Agents×2 = 4 real call sites) instrumented with the same Gate 2 + full field-set pattern as every other live-call site** | **Approved** | **Session 88. No shell-contract change. Resolves a real gap: "advisory" was confirmed to mean the AI output is non-binding, not that the call should be unobserved. Cost Dashboard coverage: 10 → 14 real sites.** |
| **GD-36** | **STRATA workspace placement and one-way dependency rule** | **Approved** | **August 10, 2026. No shell-contract change. CI-enforced: no `../` escaping STRATA boundary, no `@sovereign/*` in STRATA `package.json`.** |
| **GD-37** | **Deliberate end of the zero-new-production-dependencies streak** | **Approved** | **August 10, 2026. No shell-contract change. Streak ends by decision with Phase 2; each new dependency reviewed before addition.** |
| **GD-38** | **STRATA schema review gate — `ReviewerWorkspaceSurface` pattern; `SCHEMA_APPROVAL` decision type authorized as eventual mechanism** | **Approved** | **August 10, 2026. Shell-contract change (SCHEMA_APPROVAL addition) deferred to Phase 3+ — not authorized for the demo period. FLOWPATH gate confirmed structurally incompatible (Phase 0).** |
| **GD-39** | **Object schema registry as Layer 4 binding surface** | **Approved** | **August 10, 2026. Shell-contract impact to be determined pending schema-authority resolution (registry vs. shell contract as canonical for shared entity structure).** |
| **GD-40** | **Entity resolution — PPBE-native and World Model program datasets** | **Approved · AMENDED August 15, 2026** | **August 10, 2026. No shell-contract change. Subject was always entity resolution — Session 98 draft mislabel corrected. MCP serving is a separate open question requiring its own future GD. AMENDED: the decision stands; its explanatory scope is narrowed — see the amendment note below.** |
| **GD-41** | **Layer 1 connector for SOVEREIGN log events** | **Approved** | **August 10, 2026. No shell-contract change. `ctx.logger.getEntries()` already authorized by GD-28. Building and operating the connector is the unconditional answer to Stage 2 persistence (`docs/28`) — resolved once built, no further separate decision required.** |
| **GD-42** | **Model Governance — confirms the five Local LLM decisions of June 23, 2026 as standing; corrects the citation from `docs/07 §8.1` to `docs/06 §8.1`** | **Approved** | **August 15, 2026. No shell-contract change, no code. Does not re-decide D1-D5, does not activate the second provider, does not authorize Stage 4. Retracts the "five unrecorded decisions" claim carried in Integration Brief v1.60 and Backlog v5.** |

**Related but not a GD:** the `SUPERVISOR` role addition (Session 91, shell contract
v1.27 → v1.28) was authorized directly as part of `docs/34`'s original Phase 3 scope,
not issued as a new numbered GD. Same for the AGENT_REFERENCE.md v3.4 rule
formalization (Sessions 94–95) — a documentation-accuracy correction, not a platform
governance decision in the GD sense.

---

## Approved decisions — GD-36 through GD-41

**These entries are now APPROVED.** Approved via direct Governance Agent / Project
Principal interview, August 10, 2026. No Build Agent code session was the vehicle
for these approvals. The Build Agent does not begin implementation work until the
relevant GDs are recorded — which they now are, for all six.

---

**GD-36 — STRATA workspace placement and one-way dependency rule**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | STRATA owns its own workspace in the existing monorepo at the substrate tier (the `sovereign-data` pattern — no shell-contract change required; no module registration; no `SovereignProduct` addition; one `workspaces` array entry and a `package.json`). SOVEREIGN may import from STRATA; STRATA imports nothing from SOVEREIGN. The one-way rule is CI-enforced, not conventional: **no `../` imports may escape the STRATA workspace boundary, and no `@sovereign/*` package may appear in STRATA's `package.json`** — these two rules together make the dependency boundary as hard as a package boundary. (Phase 0 finding #5b, confirmed against the real monorepo dependency graph.) |
| Shell contract impact | None — substrate tier entry, not a shell-mounted UI module |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. Phase 2 (STRATA workspace creation) may proceed once GD-36 and GD-37 are recorded — they now are. |
| Source | `docs/39` §4.2; Architecture Overview `docs/37` §6 |

---

**GD-37 — Deliberate end of the zero-new-production-dependencies streak**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | The platform's zero-new-production-dependencies streak (SBOM-tracked as "unbroken from Session 62") ends by explicit decision when STRATA Phase 2 adds its first ingestion or registry dependency. Dependency choices for the Layer 1 connector and Layer 3 registry are reviewed and approved before being added — not discovered post-hoc in an SBOM entry. |
| Shell contract impact | None |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. |
| Source | `docs/39` §4.2, R7 |

---

**GD-38 — STRATA schema review gate mechanism**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | The STRATA Layer 3 schema review gate uses the `ReviewerWorkspaceSurface` pattern (GD-25), not FLOWPATH's Five-Question Completeness Gate. Phase 0 repo verification confirmed that FLOWPATH's gate is structurally incompatible: `WorkflowType` is a closed four-member union; `evaluateFiveQuestionGate` operates over workflow-step semantics a schema draft cannot satisfy; and the FLOWPATH approval surface provides only whole-artifact approve-or-return granularity, which Layer 3 per-element review requires. A SOVEREIGN-side schema-review component (a new Reviewer's Workspace module) imports STRATA's draft types (the permitted direction), publishes them to the Workspace surface under its own module id, provides per-element accept/reject/modify UI, and emits `HUMAN_DECISION` events of type `SCHEMA_APPROVAL` on steward decision. STRATA does not import from SOVEREIGN; the one-way dependency rule (GD-36) is preserved. |
| Shell contract impact | **Mechanism approved; shell-contract change deferred.** `SCHEMA_APPROVAL` is authorized as the future `HumanDecisionType` addition. The actual change — shell-contract version bump, type sync to `sovereign-data/src/shared-types.ts` and the Python logger (Constraint #11), and Rule 13 parity-test report — is deferred to Phase 3+ build work, after the demo-pause completes. This approval does not authorize touching the shell contract. |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. Shell-contract change requires a separate authorized Build Agent session in Phase 3+. |
| Source | `docs/37` §6.1; `docs/38` §5; Phase 0 verification report |

---

**GD-39 — Object schema registry as Layer 4 binding surface**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | Layer 4 applications bind to STRATA registry object types by reference rather than reaching into Layer 2 datasets directly. **Schema authority question — open, blocking Phase 3:** is the STRATA object registry or the shell contract canonical for shared entity structure? Two independent definitions of the same entity would be a Rule 11 violation at architecture scale. This question must be answered before Phase 3 begins and requires its own governance decision. |
| Shell contract impact | To be determined pending the schema-authority resolution |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. |
| Source | `docs/38` §3.2; `docs/39` §9, item 3 |

---

**GD-40 — Entity resolution — PPBE-native and World Model program datasets**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | STRATA Layer 2 entity resolution must not silently merge PPBE-native programs (`SYNTH-PRG-ALPHA` series) and World Model programs (`P-100` series). The basis for keeping them separate is that they are currently un-cross-referenced artifacts of separate development history — not that they are semantically distinct entity types. The two schemas capture different aspects of the same real-world programs (financial obligation tracking vs. governance/risk/milestone tracking) and in principle represent the same entities viewed from different angles. Establishing the cross-reference between the two ID schemes is genuine near-term Layer 3 modeling work: a subject-matter expert — specifically, a real Program Manager who knows which PPBE programs correspond to which World Model programs — must confirm the record correspondence before entity resolution proceeds. This work is not deferred indefinitely and the separation is not treated as permanent. Until the cross-reference is established and confirmed by a domain expert, entity resolution must be explicitly configured to leave the two datasets separate rather than merging by structural similarity alone. |
| Shell contract impact | None — entity resolution configuration is a STRATA Layer 2 concern |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. GD-40's subject — entity resolution for the two program datasets — was unchanged from its first proposal. Session 98 draft documents mislabeled GD-40 as covering MCP registry serving; that error is corrected here. What changed following review of `docs/SOVEREIGN_Two_Program_Datasets_Clarification_20260730.md` was the reasoning: the approved text treats the PPBE-native / World Model separation as a historical artifact of separate development history, not a permanent semantic distinction, and names the cross-reference work as genuine near-term Layer 3 modeling work requiring domain-expert confirmation. |
| Source | `docs/38` §2; `docs/39` §8 R3; `docs/SOVEREIGN_Two_Program_Datasets_Clarification_20260730.md` |

---

**GD-41 — Layer 1 connector for SOVEREIGN log events**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | The first STRATA Layer 1 connector ingests the SOVEREIGN `SovereignLogEvent` stream into persistent Layer 1 storage, using `ctx.logger.getEntries()` (authorized by GD-28, shell-contract v1.23) as the read surface. The connector's construction and operation constitutes the unconditional answer to Stage 2 persistence (`docs/28`) — resolved once built, without requiring a further separate decision. |
| Shell contract impact | None — `ctx.logger.getEntries()` already authorized by GD-28 |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. |
| Source | `docs/37` §5.1; `docs/39` §4.2, R12 |

---

## GD-42 — Model Governance

**Approved August 15, 2026 · Project Principal.** Recorded via direct Governance
Agent / Project Principal interview. Verification complete before approval; every
claim rests on a document or code path read directly.

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 15, 2026 · Project Principal** |
| Decision | The five Local LLM governance decisions (D1-D5) were recorded June 23, 2026 in Integration Brief v1.17 and restated in `10_LocalLLM_Infrastructure.md` §7. **They are confirmed as standing, not re-decided.** The citation is corrected: the questions live in `docs/06_LocalLLM_Architecture.md` §8.1, titled "Decisions Required Before Stage 4 Build" — **not** `docs/07 §8.1`, which two governance documents cited in error. Single-provider operation is a deliberate posture, not an unbuilt capability. The classification-routed second provider is built, tested, and unreachable under GD-10: `selectProvider()` throws `ClassificationNotAuthorizedError` before provider selection. Model integrity is enforced — SHA-256 verified at load; a mismatch throws, blocks inference, and is recorded. Model updates re-run all four CPMI-VRS gates with no expedited path. **Provider changes are Governance Decisions, not configuration changes**, notwithstanding that single-point client wrapping makes them technically a config edit. |
| Recorded qualifiers | (a) `MODEL_HASH_MISMATCH` reaches the audit log but is in neither `P1_EVENT_TYPES` nor `P2_EVENT_TYPES` — **no alert is dispatched.** Alert routing is a Stage 4 deliverable (`docs/06 §4.4`) and Stage 4 was never authorized. **No document may claim that event raises an alert.** (b) The classification label is supplied by the caller and nothing inspects content — this is an authorisation and routing control, **not** data-loss prevention. (c) Model governance is strongest for the provider currently switched off; the commercial provider in active use resolves through a default model constant and has no registry entry. (d) The earlier framing that the commercial API's lack of CUI authorisation makes local inference the *only* answer is **out of date and must not be repeated** — FedRAMP-High authorised paths exist; GovCloud was deferred by decision (D3), not dismissed. |
| Shell contract impact | **None.** The three inference event types exist as of v1.6 (GD-8). No `HumanDecisionType`, `SovereignEventType`, or `AgentClass` change. Neither additive nor breaking — decision-record confirmation and documentation correction. |
| Does not | Activate the second provider or lift the configuration gate. Authorize Stage 4 or the `docs/06 §4.4` alert routing. Re-decide D1-D5 or reopen D3's or D4's deferrals. Create a model governance subsystem. Address the AI-output evaluation framework. Change GD-10. |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 15, 2026. No Build Agent code session. |
| Source | `docs/06_LocalLLM_Architecture.md` §4.4, §6.1, §7.1, §8.1; `10_LocalLLM_Infrastructure.md` §7; `docs/07_LocalLLM_Decision_Framework.md`; `GD-42_APPROVED_and_GD-40_Amendment.md` |

---

## GD-40 — Amendment, August 15, 2026

**The original decision stands unchanged. This amendment corrects the scope of what
that decision explains.**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ AMENDED — August 15, 2026 · Project Principal** (original approval August 10, 2026 unchanged) |
| What is amended | GD-40 names a real, unmerged split between the PPBE-native (`SYNTH-PRG-*`) and World Model (`P-100`) datasets. Session 113 established with file-and-line evidence that **this split explains only part of the cross-surface program-count inconsistency.** Home Dashboard shows 5 (PPBE seed, de-duplicated by program id); the scenario analyst shows 18 (the **same** seed, raw — 5 programs × 4 fiscal years); APEX Portfolio shows 17 (World Model, zero overlap). GD-40's dataset split explains 17 against the PPBE surfaces. **It does not explain 5 against 18**, which is a dedup-versus-raw filtering difference on one dataset. A second, separate cause is therefore recorded: the scenario analyst enumerates program-fiscal-year rows and labels them "programs." **No surface counts wrongly** — each number is internally correct for what it enumerates. |
| Not decided here | Whether to resolve the inconsistency by on-screen disclosure or by relabelling the analyst output. Build Agent recommends disclosure as the lower-risk option before the CTO demonstration. **This remains an open decision**, recorded in the Remaining Build Backlog. |
| Shell contract impact | None |
| Source | Session 113 Handoff, D1 finding; `GD-42_APPROVED_and_GD-40_Amendment.md` |

---

## Open questions after this approval pass

The following questions were surfaced during the STRATA planning and GD approval
process and remain unresolved:

1. **Schema authority** — is the STRATA object registry or the shell contract
   canonical for shared entity structure? (GD-39 names this as blocking Phase 3.)
2. **MCP-serving question** — the STRATA object registry will expose types over MCP,
   making it the platform's first persistent out-of-browser service. Deployment
   target, credential management, monitoring, backup, and retention governance must
   be decided before Phase 3 begins. This is a distinct open concern, separate from
   GD-40 (entity resolution). It will require its own governance decision.
3. **Intelligence Layer pipeline-position disagreement** — `docs/13` and `docs/15`
   place it between FLOWPATH and CPMI; `docs/16` places it after ARIA Suite. Surfaced
   in `docs/37` §1.1 for Governance Agent reconciliation; not resolved here.

---

## Maintenance going forward

The next available number after GD-42 is **GD-43**. Before assigning any number,
confirm this table is still accurate against the real repository — a registry that
isn't checked is just a longer inference chain.

---

*Governance Decision Registry · Update · August 15, 2026 · Governance Agent*
*GD-42 approved and GD-40 amended — governance-recording, August 15, 2026*
*Supersedes the August 10, 2026 registry (GD-36 through GD-41 approved, Session 99)*
*Pre-Decisional · Internal Working Document*
