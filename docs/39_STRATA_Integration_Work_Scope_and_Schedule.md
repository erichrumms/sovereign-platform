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

**The current platform state, confirmed against the repository:**

- SOVEREIGN is running with seven products: the six named products (COUNSEL, SCRIBE,
  VIGIL, LENS, CPMI, AgentOS) plus NEXUS (shipping in the next planned release),
  and the Reviewer's Workspace as a standalone module.
- The shell contract is at v1.28. The most recent governance decision was GD-35
  (Addendum merge tracking).
- The next available GD number is GD-36, confirmed.
- The platform has one test suite with 2,245 tests and an unbroken production-
  dependencies streak tracked in the SBOM.
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

---

## 3 — What must happen in Phase 1 before any code is written

Phase 1 is governance-only. No STRATA implementation begins until these are done:

1. GD-36 through GD-41 formally recorded in the GD Registry by the Governance Agent
   (proposed entries in §4.2 below — these are proposals, not decisions).
2. The shell-contract authority question resolved (§4.2, Decision #3): is the
   object schema registry or the shell contract canonical for shared entity structure?
3. The MCP server deployment question scoped (§4.2, Decision #6): where does a
   persistent registry server run?

Phase 2 can begin once GD-36 (workspace placement + dependency rule) and GD-37
(dependency-free streak management) are recorded. Phase 3 requires GD-38
additionally. Phase 5/6 requires GD-38 and GD-39 additionally.

---

## 4 — Governance decisions

### 4.1 — Decision-recording authority

Governance decisions are recorded by the Governance Agent before the work they
govern. The Build Agent does not approve GDs — it proposes them, implements the work
once they are recorded, and records completion evidence.

All six GDs in §4.2 are **PROPOSED — pending Project Principal decision**. None
has been approved. This document presents them as structured proposals so the
Governance Agent has a complete, accurate input for recording.

### 4.2 — Proposed GD table (GD-36 through GD-41)

**GD-36 — STRATA workspace placement and one-way dependency rule**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | PROPOSED — pending Project Principal decision |
| Decision | Own workspace in the monorepo at the substrate tier (the `sovereign-data` pattern — no shell-contract change required); SOVEREIGN may import from STRATA; STRATA imports nothing from SOVEREIGN; **the one-way rule is CI-enforced, not conventional**: no `../` imports may escape the STRATA workspace boundary, and no `@sovereign/*` package may appear in STRATA's `package.json` — these two rules make the dependency boundary as hard as a package boundary (Phase 0 finding #5b) |
| Shell contract impact | None — substrate tier entry, not a UI module |
| Authorized session | Pending |

**GD-37 — Deliberate first new production dependency**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | PROPOSED — pending Project Principal decision |
| Decision | The platform's zero-new-production-dependencies streak (SBOM-tracked since Session 62) ends by explicit decision with STRATA Phase 2. Dependency choices for the Layer 1 connector (ingestion library) and Layer 3 registry (schema store) are reviewed and approved before they are added, not discovered post-hoc |
| Shell contract impact | None |
| Authorized session | Pending |

**GD-38 — STRATA schema review gate mechanism**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | PROPOSED — pending Project Principal decision |
| Decision | The STRATA Layer 3 schema review gate uses the `ReviewerWorkspaceSurface` pattern (GD-25) — not FLOWPATH's Five-Question Gate, which is structurally incompatible (closed `WorkflowType` union, wrong gate semantics, whole-artifact-only approval granularity — confirmed by Phase 0 code review). A SOVEREIGN-side schema-review component publishes draft schema elements to the Reviewer's Workspace under its own module id and provides per-element accept/reject/modify UI. On steward decision, it emits a `HUMAN_DECISION` event of type `SCHEMA_APPROVAL`. STRATA does not import from SOVEREIGN; the dependency direction is preserved |
| Shell contract impact | New `SCHEMA_APPROVAL` member in `HumanDecisionType` — GD required, version bump, type sync to `sovereign-data/src/shared-types.ts` and Python logger per Constraint #11, Rule 13 parity-test report |
| Authorized session | Pending |

**GD-39 — Object schema registry as Layer 4 binding surface**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | PROPOSED — pending Project Principal decision |
| Decision | Layer 4 applications bind to STRATA registry object types by reference rather than reaching into Layer 2 datasets directly. Schema authority question must be resolved: is the object registry or the shell contract canonical for shared entity structure? (Raised explicitly — not resolved in this document) |
| Shell contract impact | To be determined pending authority question resolution |
| Authorized session | Pending |

**GD-40 — MCP registry serving and persistent service precedent**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | PROPOSED — pending Project Principal decision |
| Decision | The STRATA object registry exposes approved types over the Model Context Protocol. This introduces the platform's first persistent, out-of-browser service — requiring decisions on deployment target, credential management, monitoring, backup, and retention governance. These are scoped explicitly before Phase 3 begins |
| Shell contract impact | None directly — MCP serving is a STRATA internal concern |
| Authorized session | Pending |

**GD-41 — Layer 1 connector for SOVEREIGN log events**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | PROPOSED — pending Project Principal decision |
| Decision | The first STRATA Layer 1 connector ingests the SOVEREIGN `SovereignLogEvent` stream into persistent Layer 1 storage, using `ctx.logger.getEntries()` (GD-28, shell-contract v1.23) as the read surface. This may constitute the answer to the long-open Stage 2 persistence question (`docs/28`). Whether it does — and whether that question is considered closed by it — is a decision to be made explicitly, not by default |
| Shell contract impact | None — `ctx.logger.getEntries()` already authorized by GD-28 |
| Authorized session | Pending |

---

## 5 — Dependency graph

```
Phase 0 (complete)
    └── Phase 1: GD-36 – GD-41 recorded
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

## 6 — Phase 5/6 scope note: per-element review UI

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

## 7 — Risk register

| ID | Risk | Likelihood | Impact | Owner | Mitigation |
|---|---|---|---|---|---|
| R1 | Phase 1 GDs take longer than one session | Medium | Low | Governance Agent | Structure proposals (§4.2) reduce decision time |
| R2 | Dependency choice for Layer 1 ingestion library introduces a large transitive dependency tree | Medium | Medium | Build Agent | Evaluate dependency cost explicitly before selection; prefer libraries with minimal transitive deps |
| R3 | Entity resolution silently reverses the two-program-dataset architectural decision | High | High | Build Agent | Configure entity resolution explicitly before Layer 2 begins; document the constraint |
| R4 | Phase 7 "should be small" assumption holds only if Phase 5/6 scope is fully delivered | High | Medium | Build Agent | Scope Phase 5/6 explicitly (§6); do not let per-element UI work drift into Phase 7 |
| R5 | `SCHEMA_APPROVAL` type sync missed in Python logger (Constraint #11) | Medium | Medium | Build Agent | Include logger sync as a Phase 7 completion condition; add to Rule 13 parity report |
| R6 | MCP server deployment introduces credential/persistence complexity not scoped in Phase 3 | High | Medium | Project Principal | GD-40 scopes this explicitly before Phase 3 |
| R7 | Zero-production-dependency streak ends without explicit decision | Low | Low | Build Agent | GD-37 makes it explicit; SBOM entry records the decision |
| R8 | Cost tracking missed on taxonomy builder inference calls | Medium | Medium | Build Agent | No uninstrumented inference calls; parity report at Phase 4 completion |
| R9 | Per-element review UI requires non-trivial STRATA-internal state management beyond what any existing Workspace module does | Medium | High | Build Agent | Scoped explicitly (§6); Phase 5/6 estimate includes design time |
| R10 | Layer 3 registry and shell contract diverge on shared entity structure | High | High | Governance Agent | GD-39 authority question must be resolved before Phase 3 |
| R11 | STRATA workspace accidentally imports `@sovereign/*` | Medium | High | Build Agent | CI enforcement per GD-36; no `../` escaping, no `@sovereign/*` in package.json |
| R12 | Stage 2 persistence question remains open even if Layer 1 connector is built | Medium | Medium | Project Principal | GD-41 requires explicit decision — the connector may resolve Stage 2, but does not automatically close the question |
| R13 | Intelligence Layer pipeline-position disagreement (docs/13/docs/15 vs docs/16) unresolved before STRATA builds out Layer 4 interfaces | Medium | Medium | Governance Agent | Surfaced for Governance Agent reconciliation in the Architecture Overview (docs/37 §1.1); flagged here for tracking |
| R14 | **[New v0.3]** **The per-element review UI is under-scoped** — it is net-new design and implementation work with no platform precedent, and may be absorbed silently into Phase 5's estimate without a visible estimate increase. If it is, Phase 7's "1-2 sessions" assumption breaks | High | Medium | Build Agent | Treat Phase 5 (Workspace publisher + review component) and Phase 6 (per-element UI) as separately estimated, even if executed together |
| R15 | **[New v0.3]** **The MCP-served registry becomes the platform's first persistent out-of-browser service by accident rather than decision** — deployment target, credentials, monitoring, backup, and retention are not current-platform concerns; they would be new categories of operational obligation. If introduced without a governance decision, the scope expands silently | High | High | Project Principal | GD-40 (proposed) gates Phase 3 on an explicit decision; the decision must happen before any persistent server is introduced |

---

*STRATA — Integration Work Scope and Schedule · DRAFT v0.4 · August 9, 2026*
*Phase 0 verification applied (v0.3); follow-up addendum incorporated (v0.4)*
*Placed as draft — Phase 1 governance decisions pending before any implementation begins*
*Pre-Decisional · Internal Working Document*
