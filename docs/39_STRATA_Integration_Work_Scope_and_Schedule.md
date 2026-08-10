# STRATA — Integration Work Scope and Schedule
## DRAFT v0.4 · August 9, 2026
## Supersedes: DRAFT v0.3 (August 9, 2026)
## v0.3 changes applied by the Build Agent from the Phase 0 repo-verification pass;
## v0.4 changes applied by the Build Agent from the Phase 0 follow-up addendum

**Status: DRAFT — placed for repo visibility, not yet authoritative.** Phase 0
verification is complete and its findings are incorporated. No phase has begun;
this is a planning document, not a progress record.

**v0.4 changes from v0.3:**
- §4.2 GD-36 row: specific CI enforcement mechanism added to the recommendation
  text (`../` import rule and `@sovereign/*` package.json rule), per the task
  instruction to put these details directly in the GD-36 recommendation, not only
  in the risk register.
- All v0.3 corrections and Phase 0 findings carried forward unchanged.

**Companion documents (read first):**
- `docs/37_STRATA_Architecture_Overview.md` — overall architecture, dependency rule,
  FLOWPATH vs. Workspace resolution
- `docs/38_STRATA_Layer3_Semantic_Modeling_Build_Spec.md` — Layer 3 detailed spec

---

## 1 — Scope statement

**[Corrected v0.3 — "Screen 8" in v0.2 was wrong.]** This document scopes the work
required to integrate STRATA (Layers 1-4) beneath and alongside the SOVEREIGN
platform, using SOVEREIGN's existing build conventions (Project Principal / Governance
Agent / Build Agent), starting from the current platform state.

**The current platform state, per Integration Brief v1.58 and the GD Registry:**

- SOVEREIGN comprises six products (COUNSEL, SCRIBE, VIGIL, LENS, CPMI, AgentOS),
  four companion modules (NEXUS, APEX, FLOWPATH, ARIA Suite), the Reviewer's
  Workspace, and two governed workflow layers — all currently operational.
- The shell contract is at v1.28. GD-35 (PPBE Advisory Panels instrumentation,
  Session 88) is the most recently approved decision; GD-36 through GD-41 are
  **approved August 10, 2026 · Project Principal** (Session 99 — governance recording).
- The platform has one test suite with 2,245 tests (2,050 JS/TS + 195 Python) and
  an unbroken production-dependencies streak tracked in the SBOM.
- **No STRATA code exists.** This work scope starts from zero lines of STRATA
  implementation.

**What this scope does not include:** Layer 4 application development (building
SOVEREIGN features that *consume* STRATA objects), the Intelligence Layer build, or
Stage 2 persistence beyond the STRATA Layer 1 connector that may resolve it.

---

## 2 — Phased plan

| Phase | Deliverable | Sessions (estimated) | Notes |
|---|---|---|---|
| 0 | Repo verification: answer all open architectural questions against real code | 1-2 sessions | **Complete as of August 9, 2026** |
| 1 | Governance decisions: GD-36 through GD-41 formally recorded | 1 session | Decisions only — no code |
| 2 | STRATA workspace: monorepo entry, package.json, CI | 2-3 | Substrate tier entry (`sovereign-data` pattern); includes CI rules from GD-36 |
| 3 | Layer 3 registry: schema store + registry API | 3-5 | Core data model, no UI |
| 4 | Layer 3 taxonomy builder: AI drafting tool | 4-6 | Inference instrumented per Rule 11/Rule 13 |
| 5 | SOVEREIGN-side schema review: review component + Workspace publisher | 4-6 | Imports STRATA types; per-element review UI (net-new design work per Phase 0 Concern 1) |
| 6 | Per-element review UI: accept/reject/modify at property granularity | 4-6 | Bundled with Phase 5 or sequenced after — scoped explicitly because Phase 0 confirmed this is net-new with no platform precedent; must not be silently absorbed into Phase 5's estimate |
| 7 | Review-gate connection: publisher + `SCHEMA_APPROVAL` shell-contract change | 1-2 | **Should be small** — Phase 5/6 do the heavy lifting; Phase 7 is the formal wiring. Honest if Phase 5/6 are well-scoped |
| 8 | Layer 1 connector: SOVEREIGN `SovereignLogEvent` → persistent storage | 3-5 | First Layer 1 connector; may resolve Stage 2 persistence |
| 9 | Layer 2 transformations: clean + standardize SOVEREIGN data | 4-6 | First transformation pipelines; entity resolution config must account for two-program-dataset constraint |

**Phase 0 note on Phase 7:** The "1-2 sessions" estimate remains honest only if
per-element review UI work has been completed in Phase 5/6. Phase 0 (Concern 1)
confirmed that the review UI has no platform precedent. If Phase 7 absorbs that
work, its estimate does not hold.

**Total estimated build:** roughly 27-45 sessions across all nine post-Phase 0
phases. Phases 2-7 and Phases 8-9 can run in parallel after Phase 1 completes.

### Phase rationale

**Phase 3 (registry before builder):** The builder produces drafts; without a
registry those drafts have nowhere to go. Reversing this order is the most likely
sequencing error in this plan. The registry must be buildable by hand and queryable
by a Layer 4 consumer before the AI tool is added.

**Phase 3 is also the first thing that produces real value.** An object type defined
by hand, promoted with a complete governance record, and queried by an MCP agent is
a complete, demonstrable capability — and it uses a read surface already authorized
by GD-28.

**Phase 4 explicitly out of scope for Phase 2:** Workspace entry and package.json.
No cross-system entity resolution. One stream, no identity matching yet.

**Phase 5/6 (per-element UI):** The largest and least predictable phases. Moved
explicitly to Phase 5/6 by Phase 0's finding: accept/reject/modify at single-property
granularity has no precedent anywhere in the platform. Every existing review surface
is whole-item-with-note. This is real design work, not connection work. Re-scope
after Phase 3 completes.

**Phase 7 should be small — and Phase 0 makes that honest rather than hopeful.**
This is the same publisher-plus-component shape five modules have already executed.
If it is not small, the review UI was under-scoped in Phase 5/6 — stop and re-scope
rather than pushing through.

**Phase 8 (first Layer 1 connector):** Scoped to a single connector — SOVEREIGN's
own event stream, which uses a read surface already under our control (`ctx.logger.getEntries()`,
GD-28) and requires no external system credentials. Additional sources are separate,
later decisions. Scope creep from one connector to many is one of the most likely
execution risks (R10).

---

## 3 — Phase 0 — Repo-review pass (complete)

**Ran August 9, 2026, as a deliberately non-standard session** (read-only against
the repository; all deliverables to `~/Downloads/`; no commit, no push, no Handoff,
no SBOM entry — stated plainly so it is not mistaken for an incomplete session).
All seven questions now have real answers:

1. ~~Is FLOWPATH's gate model general enough to accept a new artifact type?~~
   **Answered: No — and the plan improves because of it.** FLOWPATH's gate is
   hard-wired to workflow artifacts (closed four-member type union; the
   Five-Question Gate evaluates workflow-step semantics; whole-artifact-only
   review granularity). The extensible mechanism is the shell contract's
   `ReviewerWorkspaceSurface` (GD-25) — deliberately type-agnostic, with five
   modules already publishing through it. The gate connection becomes "write a
   publisher and a review component, plus one governance-gated `SCHEMA_APPROVAL`
   decision-type addition to the shell contract." Full evidence in the Phase 0
   report; design consequences in Build Spec §5.

2. ~~Does anything in `docs/` already define the Intelligence Layer's intent?~~
   **Answered: Yes, substantively** — five named components (`docs/06` §7.2), a
   "seventh product" identity (`docs/07` §5), named training-signal sources
   (`docs/14`, `docs/15`, `docs/22`). No collision with the STRATA boundary, but
   one directional claim in the Architecture Overview was backwards
   (`deployment_feedback` is the Intelligence Layer's *input*, not its output) —
   corrected in Architecture Overview v0.3 §1.1. The docs are also internally
   inconsistent about the Intelligence Layer's pipeline position; surfaced to the
   Governance Agent in the Phase 0 report (see Architecture Overview §1.1).

3. ~~What is the real current shell contract version and hash?~~ **Answered:
   v1.28, hash `c99355ce...`** (re-confirmed this pass at HEAD `d696c88`).

4. ~~What are the next real `docs/` and GD numbers?~~ **Answered in full.** GD:
   **GD-36**. `docs/`: highest in use is **36**; next available is **docs/37**
   (the three STRATA documents placed as 37-39). Note: no `docs/33` exists — a
   real numbering gap — and numbered specs 01/02/04 live at repo root, not in
   `docs/`.

5. ~~What does the real dependency graph across the 15 workspaces look like?~~
   **Answered.** Declared dependencies are uniform and shallow (every UI module →
   `@sovereign/api-client` + `@sovereign/data`; those two have zero runtime
   dependencies), but the real graph adds ~118 relative-path shell-contract
   imports and ~41 undeclared lateral module-to-module source imports. Two
   findings matter for STRATA: **(a)** a non-UI substrate workspace enters the
   monorepo the way `sovereign-data` did — one `workspaces` array entry, no
   module registration, no shell-contract change (the governance-gated
   "eleven canonical modules" path applies only to shell-mounted UI modules);
   **(b)** the lateral-import culture means the one-way dependency rule must be
   CI-enforced, exactly as GD-36 specifies.

6. ~~Confirm the cost-tracking coverage gap directly.~~ **Answered: 14 of 19 real
   live-call sites, 5 named uninstrumented** (three COUNSEL `REASONING_STEP_*`
   hooks, FLOWPATH's `useFlowpathElicitation`, APEX's `useApexAnalysis`) —
   re-confirmed against the five real files this pass.

7. ~~Reconcile the "14 of 14" vs "14 of 18" discrepancy.~~ **Answered: neither was
   correct. The real figure is 14 of 19** (see #6).

**Deliverable:** the Phase 0 verification and feedback report, plus v0.3 of all
three STRATA documents with repo-verified corrections applied. Where the drafts
disagreed with the repo, the repo won.

---

## 4 — What must happen in Phase 1 before any code is written

Phase 1 is governance-only. No STRATA implementation begins until these are done:

1. GD-36 through GD-41 formally recorded in the GD Registry by the Governance Agent
   — **done: all six approved August 10, 2026 · Project Principal (Session 99).**
2. The shell-contract authority question resolved (§5.2, GD-39): is the
   object schema registry or the shell contract canonical for shared entity structure?
   — **open: GD-39 approved the binding-surface principle; the authority question
   remains open and blocks Phase 3.**
3. The MCP server deployment question scoped: where does a persistent registry server
   run? — **open: the original proposed GD-40 on this subject was not approved in
   that form; this question requires its own future governance decision before Phase 3.**

Phase 2 can begin once GD-36 (workspace placement + dependency rule) and GD-37
(dependency-free streak management) are recorded. Phase 3 requires GD-38
additionally. Phase 5/6 requires GD-38 and GD-39 additionally.

---

## 5 — Governance decisions

### 5.1 — Decision-recording authority

Governance decisions are recorded by the Governance Agent before the work they
govern. The Build Agent does not approve GDs — it proposes them, implements the work
once they are recorded, and records completion evidence.

All six GDs in §5.2 are **APPROVED — August 10, 2026 · Project Principal** (Session 99
— governance recording via direct interview, not a Build Agent code session). This
section retains the original proposal text as the record of what was decided; the
authoritative approved entries are in `SOVEREIGN_GD_Registry_20260810.md`. Note that
GD-40's approved text differs from its proposed text — see the GD Registry for the
approved language.

### 5.2 — GD table (GD-36 through GD-41) — all approved August 10, 2026

**GD-36 — STRATA workspace placement and one-way dependency rule**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | Own workspace in the monorepo at the substrate tier (the `sovereign-data` pattern — no shell-contract change required); SOVEREIGN may import from STRATA; STRATA imports nothing from SOVEREIGN; **the one-way rule is CI-enforced, not conventional**: no `../` imports may escape the STRATA workspace boundary, and no `@sovereign/*` package may appear in STRATA's `package.json` — these two rules make the dependency boundary as hard as a package boundary (Phase 0 finding #5b) |
| Shell contract impact | None — substrate tier entry, not a UI module |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. |

**GD-37 — Deliberate first new production dependency**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | The platform's zero-new-production-dependencies streak (SBOM-tracked since Session 62) ends by explicit decision with STRATA Phase 2. Dependency choices for the Layer 1 connector (ingestion library) and Layer 3 registry (schema store) are reviewed and approved before they are added, not discovered post-hoc |
| Shell contract impact | None |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. |

**GD-38 — STRATA schema review gate mechanism**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | The STRATA Layer 3 schema review gate uses the `ReviewerWorkspaceSurface` pattern (GD-25) — not FLOWPATH's Five-Question Gate, which is structurally incompatible (closed `WorkflowType` union, wrong gate semantics, whole-artifact-only approval granularity — confirmed by Phase 0 code review). A SOVEREIGN-side schema-review component publishes draft schema elements to the Reviewer's Workspace under its own module id and provides per-element accept/reject/modify UI. On steward decision, it emits a `HUMAN_DECISION` event of type `SCHEMA_APPROVAL`. STRATA does not import from SOVEREIGN; the dependency direction is preserved |
| Shell contract impact | `SCHEMA_APPROVAL` authorized as the eventual `HumanDecisionType` addition. **Shell-contract change deferred to Phase 3+ build work — not authorized for the current demo period.** |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. Shell-contract change requires a separate authorized Build Agent session in Phase 3+. |

**GD-39 — Object schema registry as Layer 4 binding surface**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | Layer 4 applications bind to STRATA registry object types by reference rather than reaching into Layer 2 datasets directly. Schema authority question must be resolved: is the object registry or the shell contract canonical for shared entity structure? (Raised explicitly — not resolved in this document) |
| Shell contract impact | To be determined pending authority question resolution |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. Schema authority question remains open and blocks Phase 3 — requires its own future governance decision. |

**GD-40 — Entity resolution — PPBE-native and World Model program datasets**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | STRATA Layer 2 entity resolution must not silently merge PPBE-native programs (`SYNTH-PRG-ALPHA` series) and World Model programs (`P-100` series). The basis for keeping them separate is that they are currently un-cross-referenced artifacts of separate development history — not that they are semantically distinct entity types. Establishing the cross-reference is genuine near-term Layer 3 modeling work requiring domain-expert confirmation. This work is not deferred indefinitely. See `SOVEREIGN_GD_Registry_20260810.md` for the full approved decision text. |
| Shell contract impact | None — entity resolution configuration is a STRATA Layer 2 concern |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. GD-40's subject was always entity resolution for the two program datasets. Session 98 draft documents mislabeled it as MCP registry serving; that error is corrected in `SOVEREIGN_GD_Registry_20260810.md`. |

**GD-41 — Layer 1 connector for SOVEREIGN log events**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **✅ APPROVED — August 10, 2026 · Project Principal** |
| Decision | The first STRATA Layer 1 connector ingests the SOVEREIGN `SovereignLogEvent` stream into persistent Layer 1 storage, using `ctx.logger.getEntries()` (GD-28, shell-contract v1.23) as the read surface. This may constitute the answer to the long-open Stage 2 persistence question (`docs/28`). Whether it does — and whether that question is considered closed by it — is a decision to be made explicitly, not by default |
| Shell contract impact | None — `ctx.logger.getEntries()` already authorized by GD-28 |
| Authorized session | Approved via direct Governance Agent / Project Principal interview, August 10, 2026. No Build Agent code session. |

---

## 6 — Dependency graph

```
Phase 0 (complete)
    └── Phase 1: GD-36 – GD-41 recorded (complete — August 10, 2026)
            ├── Phase 2: STRATA workspace (requires GD-36, GD-37)
            │       └── Phase 3: Layer 3 registry (requires GD-36, GD-38)
            │               └── Phase 4: Taxonomy builder
            │                       └── Phase 5/6: Schema review component + per-element UI
            │                               └── Phase 7: Review-gate wiring (SCHEMA_APPROVAL)
            └── Phase 8: Layer 1 connector (requires GD-41)
                    └── Phase 9: Layer 2 transformations
```

Phases 2-7 and Phases 8-9 can run in parallel once Phase 1 is complete and the
relevant GDs are recorded.

---

## 7 — Phase 5/6 scope note: per-element review UI

Phase 0 (Concern 1) confirmed that per-element accept/reject/modify review UI has
no platform precedent. Every existing Reviewer's Workspace tab operates at whole-
artifact granularity. The Phase 5/6 scope therefore includes:

- Design: what "partial approval" means in the registry (some properties accepted,
  others pending or rejected).
- Design: whether per-element decisions each emit a `HUMAN_DECISION` event or batch
  into one structured event.
- Design: interaction model for modify (inline edit, comment + re-draft, direct
  override).
- Implementation: the new review component with per-element state.
- Implementation: the Workspace publisher under STRATA's module id.

This is not a light extension of an existing component. The estimate of 4-6 sessions
for Phase 5/6 combined accounts for design time. Phase 7's "1-2 sessions" estimate
is only honest if this work is done before Phase 7 begins.

---

## 8 — Risk register

| ID | Risk | Likelihood | Impact | Owner | Mitigation |
|---|---|---|---|---|---|
| R1 | Phase 1 GDs take longer than one session | Medium | Low | Governance Agent | Structure proposals (§5.2) reduce decision time |
| R2 | Dependency choice for Layer 1 ingestion library introduces a large transitive dependency tree | Medium | Medium | Build Agent | Evaluate dependency cost explicitly before selection; prefer libraries with minimal transitive deps |
| R3 | Entity resolution silently reverses the two-program-dataset architectural decision | High | High | Build Agent | Configure entity resolution explicitly before Layer 2 begins; document the constraint |
| R4 | Phase 7 "should be small" assumption holds only if Phase 5/6 scope is fully delivered | High | Medium | Build Agent | Scope Phase 5/6 explicitly (§7); do not let per-element UI work drift into Phase 7 |
| R5 | `SCHEMA_APPROVAL` type sync missed in Python logger (Constraint #11) | Medium | Medium | Build Agent | Include logger sync as a Phase 7 completion condition; add to Rule 13 parity report |
| R6 | MCP server deployment introduces credential/persistence complexity not scoped in Phase 3 | High | Medium | Project Principal | GD-40 was re-scoped to entity resolution (approved August 10, 2026) — MCP serving was not approved in this session. MCP serving requires its own future governance decision before Phase 3 begins. **Risk remains open.** |
| R7 | Zero-production-dependency streak ends without explicit decision | Low | Low | Build Agent | GD-37 makes it explicit; SBOM entry records the decision |
| R8 | Cost tracking missed on taxonomy builder inference calls | Medium | Medium | Build Agent | No uninstrumented inference calls; parity report at Phase 4 completion |
| R9 | Per-element review UI requires non-trivial STRATA-internal state management beyond what any existing Workspace module does | Medium | High | Build Agent | Scoped explicitly (§7); Phase 5/6 estimate includes design time |
| R10 | **Scope creep from one connector to many** — Phase 8 scoped to a single connector; additional sources are separate later decisions; the platform's recent history includes meaningful feature additions that started small | High | Medium | Build Agent | Explicit Phase 8 scope boundary; additional connectors each require their own scoping and GD; stop and re-scope if Phase 8 expands |
| R11 | STRATA workspace accidentally imports `@sovereign/*` | Medium | High | Build Agent | CI enforcement per GD-36; no `../` escaping, no `@sovereign/*` in package.json |
| R12 | Stage 2 persistence question remains open even if Layer 1 connector is built | Medium | Medium | Project Principal | GD-41 requires explicit decision — the connector may resolve Stage 2, but does not automatically close the question |
| R13 | **Technical currency assumptions may be stale** — open-table-format tooling and semantic-layer tooling moved quickly through 2024-2025; the architectural principles in these documents are stable, but specific tool names and library choices should be verified fresh before Phase 2 begins | Medium | Low | Build Agent | Verify specific tool choices at Phase 2 start; do not treat any tool name in these documents as a confirmed selection |
| R14 | **[New v0.3]** **The per-element review UI is under-scoped** — it is net-new design and implementation work with no platform precedent, and may be absorbed silently into Phase 5's estimate without a visible estimate increase. If it is, Phase 7's "1-2 sessions" assumption breaks | High | Medium | Build Agent | Treat Phase 5 (Workspace publisher + review component) and Phase 6 (per-element UI) as separately estimated, even if executed together |
| R15 | **[New v0.3]** **The MCP-served registry becomes the platform's first persistent out-of-browser service by accident rather than decision** — deployment target, credentials, monitoring, backup, and retention are not current-platform concerns; they would be new categories of operational obligation. If introduced without a governance decision, the scope expands silently | High | High | Project Principal | GD-40 was re-scoped to entity resolution (approved August 10, 2026) — MCP serving requires its own future governance decision before Phase 3 begins. This risk remains open and unmitigated until that decision is recorded. |
| R16 | Layer 3 registry and shell contract diverge on shared entity structure | High | High | Governance Agent | GD-39 authority question must be resolved before Phase 3 |
| R17 | Intelligence Layer pipeline-position disagreement (docs/13/docs/15 vs docs/16) unresolved before STRATA builds out Layer 4 interfaces | Medium | Medium | Governance Agent | Surfaced for Governance Agent reconciliation in the Architecture Overview (docs/37 §1.1); flagged here for tracking |

---

## 9 — Standing conventions applying to every phase

**STRATA is built using the same methodology as SOVEREIGN — Project Principal,
Governance Agent, Build Agent — at every layer. There is no low-code build path.**

The session estimates in §2 are more reliable than they would be for an unfamiliar
process: these are ordinary Build Agent sessions, scoped and closed the same way
every prior session was. There is no separate tooling track to stand up — no visual
pipeline builder, no application assembly environment — which removes a category of
work the generic source documents assumed.

Otherwise unchanged from existing practice:

- "Governance Agent" and "Build Agent" only — no model or product names, anywhere.
- A session is not closed until real `git push` output is shown.
- Handoff and SBOM committed to repo root **and** copied to `~/Desktop/`.
- Rule 13 — any session bumping the shell contract reports Workspace parity-test
  results explicitly. The `SCHEMA_APPROVAL` addition in Phase 7 will trigger
  exactly this.
- Verify rather than trust the recap. Check real `git log`/`git diff` output against
  what a session claims — the v0.3 corrections to this very document are that
  discipline applied to these drafts themselves.

---

*STRATA — Integration Work Scope and Schedule · DRAFT v0.4 · August 9, 2026*
*Phase 0 verification applied (v0.3); follow-up addendum incorporated (v0.4)*
*Phase 1 governance decisions recorded August 10, 2026 — GD-36 through GD-41 approved by Project Principal (Session 99). This document remains DRAFT v0.4 pending formal adoption.*
*Pre-Decisional · Internal Working Document*
