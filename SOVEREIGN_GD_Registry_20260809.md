# SOVEREIGN Platform — Governance Decision (GD) Registry
## Update — August 9, 2026 · Governance Agent
## Supersedes SOVEREIGN_GD_Registry_20260806.md

**What changed since the August 6 version:** STRATA Phase 0 repo-verification
(Sessions 98-99) answered all open architectural questions and produced three
v0.4 STRATA draft documents (`docs/37`, `docs/38`, `docs/39`). This update adds
proposed GD-36 through GD-41 — six decisions required before STRATA implementation
begins. **None of these are approved.** They are placed here as structured proposals
for Project Principal decision.

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

**Related but not a GD:** the `SUPERVISOR` role addition (Session 91, shell contract
v1.27 → v1.28) was authorized directly as part of `docs/34`'s original Phase 3 scope,
not issued as a new numbered GD. Same for the AGENT_REFERENCE.md v3.4 rule
formalization (Sessions 94–95) — a documentation-accuracy correction, not a platform
governance decision in the GD sense.

---

## Proposed decisions — pending Project Principal approval

**These entries are PROPOSED, not approved.** The Governance Agent records the
decision when the Project Principal makes it. The Build Agent does not begin
implementation work until the relevant GDs are recorded.

---

**GD-36 — STRATA workspace placement and one-way dependency rule**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **PROPOSED — pending Project Principal decision** |
| Decision | STRATA owns its own workspace in the existing monorepo at the substrate tier (the `sovereign-data` pattern — no shell-contract change required; no module registration; no `SovereignProduct` addition; one `workspaces` array entry and a `package.json`). SOVEREIGN may import from STRATA; STRATA imports nothing from SOVEREIGN. The one-way rule is CI-enforced, not conventional: **no `../` imports may escape the STRATA workspace boundary, and no `@sovereign/*` package may appear in STRATA's `package.json`** — these two rules together make the dependency boundary as hard as a package boundary. (Phase 0 finding #5b, confirmed against the real monorepo dependency graph.) |
| Shell contract impact | None — substrate tier entry, not a shell-mounted UI module |
| Authorized session | Pending |
| Source | `docs/39` §4.2; Architecture Overview `docs/37` §6 |

---

**GD-37 — Deliberate end of the zero-new-production-dependencies streak**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **PROPOSED — pending Project Principal decision** |
| Decision | The platform's zero-new-production-dependencies streak (SBOM-tracked as "unbroken from Session 62") ends by explicit decision when STRATA Phase 2 adds its first ingestion or registry dependency. Dependency choices for the Layer 1 connector and Layer 3 registry are reviewed and approved before being added — not discovered post-hoc in an SBOM entry. |
| Shell contract impact | None |
| Authorized session | Pending |
| Source | `docs/39` §4.2, R7 |

---

**GD-38 — STRATA schema review gate mechanism**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **PROPOSED — pending Project Principal decision** |
| Decision | The STRATA Layer 3 schema review gate uses the `ReviewerWorkspaceSurface` pattern (GD-25), not FLOWPATH's Five-Question Completeness Gate. Phase 0 repo verification confirmed that FLOWPATH's gate is structurally incompatible: `WorkflowType` is a closed four-member union; `evaluateFiveQuestionGate` operates over workflow-step semantics a schema draft cannot satisfy; and the FLOWPATH approval surface provides only whole-artifact approve-or-return granularity, which Layer 3 per-element review requires. A SOVEREIGN-side schema-review component (a new Reviewer's Workspace module) imports STRATA's draft types (the permitted direction), publishes them to the Workspace surface under its own module id, provides per-element accept/reject/modify UI, and emits `HUMAN_DECISION` events of type `SCHEMA_APPROVAL` on steward decision. STRATA does not import from SOVEREIGN; the one-way dependency rule (GD-36) is preserved. |
| Shell contract impact | New `SCHEMA_APPROVAL` member in `HumanDecisionType` — requires a follow-on GD for the shell-contract addition, a version bump, type sync to `sovereign-data/src/shared-types.ts` and the Python logger (Constraint #11), and a Rule 13 parity-test report |
| Authorized session | Pending |
| Source | `docs/37` §6.1; `docs/38` §5; Phase 0 verification report |

---

**GD-39 — Object schema registry as Layer 4 binding surface**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **PROPOSED — pending Project Principal decision** |
| Decision | Layer 4 applications bind to STRATA registry object types by reference rather than reaching into Layer 2 datasets directly. **Open question requiring explicit resolution:** is the STRATA object registry or the shell contract canonical for shared entity structure? Two independent definitions of the same entity would be a Rule 11 violation at architecture scale. This question must be answered before Phase 3 begins. |
| Shell contract impact | To be determined pending the schema-authority resolution |
| Authorized session | Pending |
| Source | `docs/38` §3.2; `docs/39` §9, item 3 |

---

**GD-40 — MCP registry serving and persistent-service precedent**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **PROPOSED — pending Project Principal decision** |
| Decision | The STRATA object registry exposes approved object types to AI agents over the Model Context Protocol. This makes the MCP-served registry the platform's first persistent, out-of-browser service — everything currently running is session-scoped and browser-resident. Before Phase 3 begins, the following must be decided: deployment target, credential management approach, monitoring, backup, and retention governance. These are not implementation details; they are new operational obligation categories with no existing platform precedent. |
| Shell contract impact | None directly — MCP serving is internal to STRATA |
| Authorized session | Pending |
| Source | `docs/37` §5.3; `docs/38` §3.3; `docs/39` §4.2, R15 |

---

**GD-41 — Layer 1 connector for SOVEREIGN log events**

| Field | Value |
|---|---|
| Authority | Project Principal |
| Status | **PROPOSED — pending Project Principal decision** |
| Decision | The first STRATA Layer 1 connector ingests the SOVEREIGN `SovereignLogEvent` stream into persistent Layer 1 storage, using `ctx.logger.getEntries()` (authorized by GD-28, shell-contract v1.23) as the read surface. This connector may constitute a real answer to the long-open Stage 2 persistence question (`docs/28`). Whether it does — and whether Stage 2 is considered closed by it — is a decision to be made explicitly, not by default behavior. |
| Shell contract impact | None — `ctx.logger.getEntries()` already authorized by GD-28 |
| Authorized session | Pending |
| Source | `docs/37` §5.1; `docs/39` §4.2, R12 |

---

## Maintenance going forward

The next available number after GD-41 is **GD-42**, but only after GD-36 through
GD-41 are formally approved or superseded. Before assigning any number, confirm this
table is still accurate against the real repository — a registry that isn't checked
is just a longer inference chain.

---

*Governance Decision Registry · Update · August 9, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
