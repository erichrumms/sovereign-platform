/**
 * SOVEREIGN Platform — Shell Contract
 * shell-contract.ts
 *
 * GOVERNANCE DOCUMENT — Approved by Project Principal before any module development begins.
 * This file defines exactly what the sovereign-shell exports to every product module.
 * Modules must not reach outside this contract.
 *
 * Version: 1.21
 * Date: July 2026
 * Authority: Project Principal · SOVEREIGN Platform Governance Authority
 * Status: APPROVED — Session 1 governance record
 *
 * Change process: Any modification to this file requires:
 *   1. A documented governance decision by the Project Principal
 *   2. A version increment
 *   3. A changelog entry below
 *   4. Assessment of impact on all six product modules
 *
 * Changelog:
 *   v1.21 (July 20, 2026) — GD-26 (WORKSPACE SovereignProduct member, approved by the
 *                       Project Principal July 20, 2026, Session 52, per docs/24).
 *                       Added `WORKSPACE` as the eleventh member of the SovereignProduct
 *                       union. Impact assessment: NO HumanDecisionType change. NO
 *                       SovereignEventType change. NO AgentClass change. NO SovereignRole
 *                       change. module-workspace's MODULE_PRODUCT entry updated from
 *                       VIGIL to WORKSPACE (loader bookkeeping only — health-fallback
 *                       events now carry the correct product; embedded components
 *                       continue to emit under their own real products). sovereign-
 *                       api-client/src/types.ts synced per its governance obligation.
 *                       Both shell-contract copies SHA-256 re-verified identical at v1.21.
 *   v1.20 (July 20, 2026) — GD-25 (Reviewer's Workspace, approved by the Project Principal
 *                       July 20, 2026, Session 50, per docs/23 §2). Added two new types:
 *                       WorkspaceReviewItem (one reviewable item carrying module_id,
 *                       item_id, an intentionally OPAQUE payload (unknown), and
 *                       published_at) and ReviewerWorkspaceSurface
 *                       (publish/remove/listForModule/list/subscribe — last-write-wins
 *                       by module_id + item_id, same shell-owned in-memory lifetime as
 *                       WorkQueueSurface; remove() is the one addition over the prior
 *                       surfaces, needed because an individual reviewable item must
 *                       actually LEAVE the Workspace once its source module records the
 *                       decision, not just get overwritten on next publish). The payload
 *                       is deliberately `unknown`: the shell contract never imports a
 *                       module's own types (dependency direction preserved) — the
 *                       consuming Workspace module does the real type narrowing by
 *                       module_id, via the established cross-module type-only import
 *                       pattern (module-agentos/src/approval-port.ts,
 *                       useAgentDispatcher.ts, nexus-agentos-port.ts, NexusApp.tsx).
 *                       Added `reviewerWorkspaceSurface` as the THIRTEENTH export on
 *                       SovereignShellContext (Standing Constraint #7 relaxed from
 *                       twelve to thirteen for this GD). Impact assessment: NO
 *                       HumanDecisionType change (not synced to shared-types.ts or
 *                       Python logger — Constraint #11 has nothing to propagate). NO
 *                       SovereignEventType change. NO AgentClass change. NO
 *                       SovereignRole / SovereignProduct change. AgentApprovalRequest,
 *                       ClearEvaluationInput, and TTReviewItem are consumed AS-IS by
 *                       the Workspace (docs/23 §6) — none is added, renamed, or
 *                       reshaped here. Additive only: two new exported types, one new
 *                       context field. CONSUMERS: VIGIL, ARIA, and SCRIBE publish their
 *                       real queue items on load/change and call remove() on their
 *                       existing decision-commit paths (VIGIL onDecided, the ARIA
 *                       certify handler, SCRIBE onSent); the new module-workspace reads
 *                       via list(), type-narrows by module_id, and renders the real
 *                       decision components (ApprovalDetail, ClearCertificationQueue,
 *                       TTManagerReview). Both shell-contract copies SHA-256
 *                       re-verified identical at v1.20.
 *   v1.19 (July 20, 2026) — GD-24 (WorkQueueSurface, approved by the Project Principal
 *                       July 20, 2026, Session 49, per docs/21). Added two new types:
 *                       WorkQueueSummary (aggregate queue summary carrying module_id,
 *                       queue_label, count, highest_severity, updated_at) and
 *                       WorkQueueSurface (publish/listForModule/list/subscribe —
 *                       last-write-wins by module_id+queue_label, same shell-owned
 *                       in-memory lifetime as AriaCertificationSurface and
 *                       ProgramStatusSurface; listForModule is the one addition
 *                       over the prior two surfaces, needed for grouping by module on
 *                       the Home Dashboard). Added `workQueueSurface` as the TWELFTH
 *                       export on SovereignShellContext (Standing Constraint #7 relaxed
 *                       from eleven to twelve for this GD). Impact assessment: NO
 *                       HumanDecisionType change (not synced to shared-types.ts or Python
 *                       logger — Constraint #11 has nothing to propagate). NO
 *                       SovereignEventType change. NO AgentClass change. NO SovereignRole /
 *                       SovereignProduct change. Additive only: two new exported types, one
 *                       new context field. CONSUMERS: VIGIL, SCRIBE, ARIA, NEXUS publish
 *                       queue summaries on module mount; PlatformHome reads and displays
 *                       them in the "To Do / Review" section. Both shell-contract copies
 *                       SHA-256 re-verified identical at v1.19.
 *   v1.18 (July 19, 2026) — GD-23 (ProgramStatusSurface, approved by the Project Principal
 *                       July 19, 2026, Session 44, per docs/20). Added two new types:
 *                       ProgramStatusSnapshot (narrow snapshot carrying program_id,
 *                       percent_obligated, status, narrative, updated_at) and
 *                       ProgramStatusSurface (publish/get/list/subscribe — mirrors
 *                       AriaCertificationSurface exactly: same four methods, same
 *                       last-write-wins-by-id semantics, same shell-owned in-memory lifetime).
 *                       Added `programStatusSurface` as the ELEVENTH export on
 *                       SovereignShellContext (Standing Constraint #7 relaxed from ten to
 *                       eleven for this GD). Impact assessment: NO HumanDecisionType change
 *                       (not synced to shared-types.ts or Python logger — Constraint #11
 *                       has nothing to propagate). NO SovereignEventType change. NO AgentClass
 *                       change. NO SovereignRole / SovereignProduct change. Additive only:
 *                       two new exported types, one new context field. CONSUMERS: APEX
 *                       publishes a ProgramStatusSnapshot per program on data load;
 *                       VIGIL reads in describeWhatChanges() ppbe_obligation case (WF-20
 *                       resolution). Both shell-contract copies SHA-256 re-verified
 *                       identical at v1.18.
 *   v1.17 (July 18, 2026) — GD-22 (Role-Based Access Matrix, pre-approved Session 41 opening
 *                       prompt). Widened `minimumRole: SovereignRole` to `minimumRole:
 *                       SovereignRole[]` on `SovereignModuleContract` (Section 8). This is the
 *                       only field changed — no SovereignEventType, HumanDecisionType, SovereignRole,
 *                       SovereignProduct, AgentClass, or shell export (Constraint #7, still ten)
 *                       was touched. Impact assessment: NO HumanDecisionType change (not synced to
 *                       shared-types.ts or Python logger — Constraint #11 has nothing to propagate
 *                       for this change). NO SovereignEventType change. NO AgentClass change.
 *                       Additive widening: every existing single-role minimumRole assignment becomes
 *                       a one-element array; the loader's defaultRoleAccessPolicy is updated from
 *                       `auth.hasRole(minimumRole)` to `minimumRoles.some(r => auth.hasRole(r))`,
 *                       preserving the SYSTEM_ADMIN superuser clause. CONSUMER UPDATE: all ten
 *                       module index.ts files update their minimumRole declarations to arrays per
 *                       the approved SOVEREIGN_Role_Access_Matrix_20260718.md. Both shell-contract
 *                       copies SHA-256 re-verified identical at v1.17.
 *   v1.16 (July 12, 2026) — GD-21 (TT-GD: Time & Travel Phase II human decisions, decided and
 *                       pre-authorized Session 28 opening prompt §3, per docs/17 §12/§13 — the
 *                       GD docs/17 required before Phase II, pattern identical to GD-20). Added
 *                       three HumanDecisionType members: TRAVEL_APPROVAL (a manager deciding a
 *                       routed travel request — approve/deny/escalate — in the NEXUS/VIGIL
 *                       review flow), TIME_CORRECTION_SENT (a manager sending a time-record
 *                       correction communication after reviewing a tt.time-drafter draft), and
 *                       ESCALATION_AUTHORIZED (a manager authorizing a formal escalation notice
 *                       through the VIGIL Agent Approval Queue). All non-breaking union
 *                       widenings. Impact assessment: emitted only by the Time & Travel workflow
 *                       layer running inside its host modules (module-nexus / module-scribe /
 *                       module-vigil — docs/17 §2, no new module); no exhaustive switch over
 *                       HumanDecisionType exists. NAMING NOTE: TRAVEL_APPROVAL is distinct from
 *                       the v1.0 TRAVEL_APPROVED / TRAVEL_DENIED / TRAVEL_ESCALATED members —
 *                       docs/17 §12 names the new member for the decision ACT on a routed
 *                       TravelRequest (one member, outcome carried in the event payload/status),
 *                       while the v1.0 members are the original per-outcome taxonomy; the v1.0
 *                       members are untouched (Constraint #2 tension documented in the Session
 *                       28 handoff, resolution deferred to governance). Per Standing Constraint
 *                       #11 the three members propagate to the synced HumanDecisionType copy in
 *                       sovereign-data/src/shared-types.ts (type + HUMAN_DECISION_TYPES const,
 *                       19 -> 22) and its test, and to the Python logger APPROVED_DECISION_TYPES
 *                       (19 -> 22). NO SovereignEventType / SovereignProduct / SovereignRole /
 *                       AgentClass change; NO new shell export (Constraint #7 holds at ten).
 *                       Full tsc --noEmit clean; both shell-contract copies SHA-256 re-verified
 *                       identical at v1.16.
 *   v1.15 (June 2026) — GD-20 (ARIA Suite / CLEAR shell-contract enablement, approved
 *                       June 29, 2026). +4 SovereignEventType (ARIA_COMPLIANCE_CHECK,
 *                       ARIA_CERTIFICATION_ISSUED, ARIA_VIOLATION_FLAGGED, ARIA_CALENDAR_ALERT),
 *                       +1 HumanDecisionType (COMPLIANCE_CERTIFICATION), +tenth export aria
 *                       (AriaCertificationSurface). All additive. Constraint #7 advances 9->10
 *                       (the tenth export is `aria` only; future exports require a new GD). This
 *                       GD supersedes docs/16 §4/§7's statement that ARIA Suite requires no
 *                       shell-contract change — that held only while ARIA events were emitted
 *                       Python-side; the Session 23 build emits them from the TypeScript layer.
 *                       Impact assessment: the four event types are emitted only by module-aria
 *                       (clear-engine + Certification Queue) and the deterministic aria.rules-engine;
 *                       COMPLIANCE_CERTIFICATION propagates to the synced HumanDecisionType copy in
 *                       sovereign-data/src/shared-types.ts (type + HUMAN_DECISION_TYPES const,
 *                       18 -> 19) and its test (Constraint #11); the aria export is read by
 *                       module-scribe (export gate) and written by module-aria (Certification Queue)
 *                       only. Per Constraint #11 the four event types and the decision type are
 *                       synced to the Python logger (APPROVED_EVENT_TYPES 75 -> 79,
 *                       APPROVED_DECISION_TYPES 18 -> 19). SovereignEventType is NOT mirrored in
 *                       shared-types (only SovereignRole / ClearanceLevel / HumanDecisionType are);
 *                       AriaCertification is NOT mirrored in shared-types (entity/context types are
 *                       not). NO SovereignProduct / SovereignRole / AgentClass change. Both
 *                       shell-contract copies SHA-256 re-verified identical at v1.15. See GD-20
 *                       record for full detail.
 *   v1.14 (June 29, 2026) — GD-19 (shared task surface, pre-approved Session 22 opening prompt
 *                       per Integration Brief v1.31 + 16_ARIA_Suite_Architecture.md cross-product
 *                       wiring; closes the Session 18 nexus-agentos-port.ts SCOPE BOUNDARY note).
 *                       STANDING CONSTRAINT #7 CHANGE: the shell context advances from EIGHT to
 *                       NINE exports. Added `taskSurface` (SovereignShellContext, Section 7) — a
 *                       shell-owned, in-memory shared task surface that any product publishes
 *                       cross-product tasks to and reads back, so a NEXUS-routed AgentOS task
 *                       (created via the live createAgentOSBackedPort) becomes visible in the
 *                       AgentOS Task Registry panel without either module reaching into the
 *                       other (Constraints #1 / #3 preserved — connection is configuration, not
 *                       rewrite). Constraint #7 is formally relaxed from 8 to 9 exports for this
 *                       addition only; the count is now nine and no further export may be added
 *                       without another GD. Added two exported shared types: SharedTask (the
 *                       governance-frozen cross-product task shape) and TaskSurface (the ninth
 *                       export's interface), plus the supporting SharedTaskStatus union. Impact
 *                       assessment: module-nexus + module-agentos only — NEXUS publishes to the
 *                       surface through its AgentOS-backed port; AgentOS reads the surface in
 *                       useTaskRegistry. SharedTaskStatus is the canonical cross-product task
 *                       status taxonomy; module-agentos's TaskStatus aliases it (Constraint #2 —
 *                       no divergent duplicate; identical eight members, no exhaustive switch
 *                       breaks). NO SovereignEventType / HumanDecisionType change (the surface
 *                       carries no new event or decision — publication rides the EXISTING
 *                       AGENTOS_TASK_ASSIGNED emit), so NO sovereign-data shared-types
 *                       propagation and NO Python logger taxonomy change. NO SovereignProduct /
 *                       SovereignRole / AgentClass change. Synced artifact propagation
 *                       (Constraint #11): the two shell-contract.ts copies only — these are the
 *                       sole synced copies of THIS artifact; shared-types.ts mirrors only the
 *                       three enums (not entity/context types) and is therefore untouched. Full
 *                       tsc --noEmit clean; both shell-contract copies SHA-256 verified identical
 *                       at v1.14.
 *   v1.13 (June 26, 2026) — GD-18 (FLOWPATH event types + workstyle entity, pre-approved
 *                       Session 20 opening prompt + Integration Brief v1.28 §6/GD-18, per
 *                       15_FLOWPATH_Architecture.md §8 / §10). Added ten SovereignEventType
 *                       members for the FLOWPATH workflow-elicitation product:
 *                       FLOWPATH_SESSION_STARTED, FLOWPATH_SESSION_COMPLETE,
 *                       FLOWPATH_ARTIFACT_PRODUCED, FLOWPATH_ARTIFACT_APPROVED,
 *                       FLOWPATH_GATE_FAILED, FLOWPATH_VOCABULARY_CAPTURED,
 *                       FLOWPATH_DATASOURCE_REGISTERED, FLOWPATH_VALIDATION_CADENCE_SET,
 *                       FLOWPATH_WORKSTYLE_ELICITED, FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT (the
 *                       last two are data_classification: user — analyst-scoped, hashed id).
 *                       Added two HumanDecisionType members: WORKFLOW_APPROVAL (a human reviewer
 *                       approving a FLOWPATH workflow artifact before it is committed to the
 *                       registry) and VALIDATION_SIGN_OFF (an analyst signing off on an APEX
 *                       pre-review validation cycle — DC-5). Added one exported user-scoped type
 *                       for the individual-workstyle elicitation contract: AnalystWorkstyleProfile
 *                       (plus its supporting ProgramExpertiseDepth / AnalystProgramExpertise /
 *                       AnalystPersonalThreshold / AnalystVocabularyExtension types). All
 *                       non-breaking additions (union widenings + new exported types). Impact
 *                       assessment: the ten event types are defined only here (the two
 *                       shell-contract copies) and emitted only by module-flowpath; no existing
 *                       module emits them and no exhaustive switch over SovereignEventType exists.
 *                       The two HumanDecisionType members additionally propagate to the synced
 *                       HumanDecisionType copy in sovereign-data/src/shared-types.ts (the type +
 *                       the HUMAN_DECISION_TYPES runtime const, 16 -> 18 members) and its test,
 *                       per Standing Constraint #11. SovereignEventType is NOT mirrored in
 *                       shared-types (only SovereignRole / ClearanceLevel / HumanDecisionType are);
 *                       AnalystWorkstyleProfile is NOT propagated to shared-types either (shared-
 *                       types mirrors only the three enums, not entity types). NO SovereignProduct
 *                       change — FLOWPATH has been a primary product in SovereignProduct since v1.0
 *                       (Standing Constraint #2 — no divergent duplicate); likewise the Python
 *                       logger APPROVED_PRODUCTS already contains FLOWPATH, so no product
 *                       propagation is required (this corrects the opening prompt's "10 -> 11"
 *                       expectation — FLOWPATH was already present). NO AgentClass change — all
 *                       six FLOWPATH agents use the existing Analytical class. Per Standing
 *                       Constraint #11 the ten event types and two decision types are synced to
 *                       the Python logger (APPROVED_EVENT_TYPES 65 -> 75, APPROVED_DECISION_TYPES
 *                       16 -> 18). Full tsc --noEmit clean; both shell-contract copies SHA-256
 *                       verified identical at v1.13.
 *   v1.12 (June 25, 2026) — GD-16 (APEX event types + analysis schema, pre-approved Session 17
 *                       opening prompt + Integration Brief v1.25, per 13_APEX_Architecture.md
 *                       §10). Added seven SovereignEventType members for the APEX analytics /
 *                       reporting product: APEX_ANALYSIS_STARTED, APEX_ANALYSIS_COMPLETE,
 *                       APEX_REPORT_GENERATED, APEX_DOSSIER_EXPORTED, APEX_PROVENANCE_VIEWED,
 *                       REPORT_GENERATION_HELD, APEX_EVENT_RECEIVED. Added one HumanDecisionType
 *                       member: REPORT_ATTESTATION (a human attesting an APEX report before
 *                       export — Standing Constraint #4). Added three exported shared types for
 *                       the apex.ai-assistant → apex.report-generator contract: ApexReportType,
 *                       RiskFinding, ApexAnalysisOutput. All non-breaking additions (union
 *                       widenings + new exported types). Impact assessment: the seven event
 *                       types are defined only here (the two shell-contract copies) and emitted
 *                       only by module-apex; no existing module emits them and no exhaustive
 *                       switch over SovereignEventType exists. REPORT_ATTESTATION additionally
 *                       propagates to the synced HumanDecisionType copy in
 *                       sovereign-data/src/shared-types.ts (the type + the HUMAN_DECISION_TYPES
 *                       runtime const, 15 -> 16 members) and its test, per Standing Constraint
 *                       #11. SovereignEventType is NOT mirrored in shared-types (only
 *                       SovereignRole / ClearanceLevel / HumanDecisionType are). NO AgentClass
 *                       change — both APEX agents use existing classes (Analytical, Operational).
 *                       Per Standing Constraint #11 the event-type taxonomy and the new decision
 *                       type are synced to the Python logger (APPROVED_EVENT_TYPES +
 *                       APPROVED_DECISION_TYPES) AFTER the GD-15 re-sync. Full tsc --noEmit
 *                       clean; both shell-contract copies SHA-256 verified identical at v1.12.
 *   v1.11 (June 24, 2026) — GD-14 (AgentOS A2A messaging events, pre-approved Session 16
 *                       opening prompt). Added two SovereignEventType members for the AgentOS
 *                       agent-to-agent communication layer: AGENT_MESSAGE_SENT,
 *                       AGENT_MESSAGE_RECEIVED. Both are non-breaking union widenings. Impact
 *                       assessment: emitted only by module-agentos (the A2A message bus); no
 *                       existing module emits them and no exhaustive switch over
 *                       SovereignEventType exists. NO HumanDecisionType change (message
 *                       send/receive are agent actions, not human decisions), so NO
 *                       sovereign-data shared-types propagation. Per Standing Constraint #11
 *                       the event-type taxonomy is synced to the Python logger's
 *                       APPROVED_EVENT_TYPES. Full tsc --noEmit clean; both shell-contract
 *                       copies SHA-256 verified identical at v1.11.
 *   v1.10 (June 24, 2026) — GD-13 (model-evaluation event, pre-approved Session 16 opening
 *                       prompt, per 11_AgentOS_Architecture.md §5.2). Added one
 *                       SovereignEventType member: MODEL_EVALUATION_COMPLETE — emitted when
 *                       the sovereign-security evaluate.py CPMI-VRS validation pipeline
 *                       finishes its four-gate check before a model is promoted. Non-breaking
 *                       union widening. Impact assessment: emitted by evaluate.py (Python,
 *                       via the Security Framework logger) under product AGENTOS; no existing
 *                       module emits it and no exhaustive switch over SovereignEventType
 *                       exists. NO HumanDecisionType change (the evaluation verdict is a
 *                       pipeline outcome, not a human decision), so NO sovereign-data
 *                       shared-types propagation is required. Per Standing Constraint #11 the
 *                       event-type taxonomy is synced to the Python logger's
 *                       APPROVED_EVENT_TYPES (sovereign-security/sovereign_logger.py) so
 *                       evaluate.py may emit it. Full tsc --noEmit clean; both shell-contract
 *                       copies SHA-256 verified identical at v1.10.
 *   v1.9 (June 24, 2026) — GD-12 (Orchestration AgentClass for AgentOS orchestrators,
 *                       pre-approved Integration Brief v1.22 §6, Session 16). Added
 *                       "Orchestration" to the AgentClass union (and the matching inline
 *                       SovereignLogEvent.agent_class union) so AgentOS's orchestrator
 *                       agents (agentos.deployer / .exporter / .configurator, registered in
 *                       Agent_Identity_Standard.md v1.3) can carry an AgentCard. Additive
 *                       union widening. Impact assessment: AgentCard / SovereignLogEvent
 *                       agent_class consumers (module-agentos) gain one class; no
 *                       SovereignEventType or HumanDecisionType change; no exhaustive switch
 *                       over AgentClass exists. Per Standing Constraint #11 the agent-class
 *                       taxonomy is also synced to the module loader's VALID_AGENT_CLASSES
 *                       and the Security Framework logger's APPROVED_AGENT_CLASSES
 *                       (sovereign-security/sovereign_logger.py) — these are the synced
 *                       copies of the agent-class taxonomy. No sovereign-data shared-types
 *                       propagation (shared-types mirrors only SovereignRole / ClearanceLevel
 *                       / HumanDecisionType, not AgentClass). Full tsc --noEmit clean; both
 *                       shell-contract copies SHA-256 verified identical at v1.9.
 *   v1.8 (June 24, 2026) — GD-11 (NEXUS work-request lifecycle events, approved Project
 *                       Principal June 24, 2026, Session 15, per 12_NEXUS_Architecture.md
 *                       §4). Added six SovereignEventType members for the NEXUS work-request
 *                       lifecycle state machine: NEXUS_REQUEST_SUBMITTED,
 *                       NEXUS_REQUEST_ROUTED, NEXUS_APPROVAL_PENDING,
 *                       NEXUS_REQUEST_IN_PROGRESS, NEXUS_REQUEST_COMPLETE,
 *                       NEXUS_REQUEST_REJECTED. All six are non-breaking union widenings.
 *                       Impact assessment: the six event types are defined only here (the
 *                       two shell-contract copies) and emitted only by module-nexus (the
 *                       work-request registry); no existing module emits them and no
 *                       exhaustive switch over SovereignEventType exists. NO HumanDecisionType
 *                       change — NEXUS records the OUTCOMES of VIGIL decisions routed via
 *                       AgentOS (the TASK_APPROVAL decision_type added at v1.7 already
 *                       covers the human approval), so NO sovereign-data shared-types
 *                       propagation is required (SovereignEventType is not mirrored in
 *                       shared-types — only SovereignRole / ClearanceLevel / HumanDecisionType
 *                       are; consistent with the GD-8 impact assessment). Full tsc --noEmit
 *                       clean; both shell-contract copies SHA-256 verified identical at v1.8.
 *   v1.7 (June 24, 2026) — GD-9 (AgentOS task lifecycle events, approved Project
 *                       Principal June 24, 2026, Session 14, per 11_AgentOS_Architecture.md
 *                       §4). Added seven SovereignEventType members for the AgentOS task
 *                       lifecycle state machine: AGENTOS_TASK_ASSIGNED,
 *                       AGENTOS_APPROVAL_REQUESTED, AGENTOS_TASK_APPROVED,
 *                       AGENTOS_TASK_REJECTED, AGENTOS_TASK_STARTED, AGENTOS_TASK_COMPLETE,
 *                       AGENTOS_TASK_CANCELLED. Added TASK_APPROVAL (a human approving an
 *                       agent task via VIGIL) and TASK_CANCELLATION (a human cancelling a
 *                       task) to HumanDecisionType. All nine are non-breaking union
 *                       widenings. Impact assessment: the seven event types are defined
 *                       only here (the two shell-contract copies) and emitted only by
 *                       module-agentos (the task registry / dispatcher); no existing module
 *                       emits them and no exhaustive switch over SovereignEventType exists.
 *                       The two HumanDecisionType members additionally propagate to the
 *                       synced copy in sovereign-data/src/shared-types.ts (the type + the
 *                       HUMAN_DECISION_TYPES runtime const, 13 -> 15 members) and its test,
 *                       per Standing Constraint #11. Full tsc --noEmit clean; both
 *                       shell-contract copies SHA-256 verified identical at v1.7.
 *   v1.6 (June 24, 2026) — GD-8 (Local LLM inference events + DataClassification routing,
 *                       approved Project Principal June 24, 2026, Session 13, per
 *                       10_LocalLLM_Infrastructure.md §3). Added three SovereignEventType
 *                       members for the inference layer: INFERENCE_CALL,
 *                       INFERENCE_PROVIDER_FALLBACK, MODEL_HASH_MISMATCH. Non-breaking
 *                       union widenings, emitted only by sovereign-api-client (the Local
 *                       LLM infrastructure). Impact assessment: the three event types are
 *                       defined only here (the two shell-contract copies); no existing
 *                       module emits them and no exhaustive switch over SovereignEventType
 *                       exists. No HumanDecisionType change, so NO sovereign-data
 *                       shared-types propagation is required (SovereignEventType is not
 *                       mirrored in shared-types — only SovereignRole / ClearanceLevel /
 *                       HumanDecisionType are; consistent with the GD-6 / GD-7 impact
 *                       assessments). The spec's "DataClassification routing field" is
 *                       realized WITHOUT a new shell-contract type: the existing
 *                       ClearanceLevel (UNCLASSIFIED | CUI | SECRET | TOP_SECRET) IS the
 *                       data-classification taxonomy (Standing Constraint #2 — no divergent
 *                       duplicate), and the optional data_classification field lives on the
 *                       sovereign-api-client SovereignRequestContext (an api-client type),
 *                       not the shell contract. Full tsc --noEmit clean; both shell-contract
 *                       copies SHA-256 verified identical at v1.6.
 *   v1.5 (June 23, 2026) — GD-7 (CPMI Module / CPMI-VRS Gate Runner, approved Project
 *                       Principal June 23, 2026, Session 11, per 08_CPMI_Architecture.md
 *                       §5 / §9). Added five SovereignEventType members for the CPMI
 *                       reasoning chain + CPMI-VRS gate lifecycle:
 *                       CPMI_REASONING_CHAIN_COMPLETE, CPMI_VRS_GATE_1_PASSED,
 *                       CPMI_VRS_GATE_2_PASSED, CPMI_VRS_GATE_3_ATTESTED,
 *                       CPMI_VRS_GATE_4_PASSED. Added GATE_3_ATTESTATION (Gate 3 human
 *                       attestation) and WORLD_MODEL_UPDATE (human-gated world-model
 *                       update) to HumanDecisionType. All seven are non-breaking union
 *                       widenings. Impact assessment: the five event types are defined
 *                       only here (the two shell-contract copies) and emitted only by
 *                       module-cpmi; no existing module emits them and no exhaustive
 *                       switch over SovereignEventType exists. The two HumanDecisionType
 *                       members additionally propagate to the synced copy in
 *                       sovereign-data/src/shared-types.ts (the type + the
 *                       HUMAN_DECISION_TYPES runtime const, 11 -> 13 members) and its
 *                       test, per Standing Constraint #11. Full tsc --noEmit clean; both
 *                       shell-contract copies SHA-256 verified identical at v1.5.
 *   v1.4 (June 23, 2026) — GD-6 (VIGIL Agent Approval Flow, approved Project
 *                       Principal June 23, 2026, Session 10, per
 *                       05_VIGIL_Agent_Approval.md §7). Added four SovereignEventType
 *                       members for the agent-action approval lifecycle:
 *                       AGENT_ACTION_APPROVED, AGENT_ACTION_REJECTED,
 *                       AGENT_ACTION_ESCALATED, AGENT_ACTION_EXPIRED. Added
 *                       AGENT_APPROVAL to HumanDecisionType (a human authorizing an
 *                       agent action via VIGIL's Agent Approval Queue carries
 *                       decision_type AGENT_APPROVAL — Standing Constraint #4). All
 *                       five are non-breaking union widenings. Impact assessment: the
 *                       four event types are defined only here (the two shell-contract
 *                       copies) and emitted only by module-vigil (vigil-approval-agent
 *                       flow) — no existing module emits them and no exhaustive switch
 *                       over SovereignEventType exists. AGENT_APPROVAL additionally
 *                       propagates to the synced HumanDecisionType copy in
 *                       sovereign-data/src/shared-types.ts (the type + the
 *                       HUMAN_DECISION_TYPES runtime const) and its test, per Standing
 *                       Constraint #11 — the data dictionary is a shared artifact. Full
 *                       tsc --noEmit clean; both shell-contract copies SHA-256 verified
 *                       identical at v1.4.
 *   v1.3 (June 13, 2026) — GD-5 (Companion Suite Contract Enablement, approved
 *                       Project Principal June 13, 2026, Session 3). Added four
 *                       companion products to SovereignProduct: COUNSEL, SCRIBE,
 *                       LENS, VIGIL. Added PLATFORM_ADMIN to SovereignRole
 *                       (enables VIGIL's PLATFORM_ADMIN-or-SYSTEM_ADMIN mount
 *                       gate under the existing fail-closed default policy).
 *                       Both changes are non-breaking union widenings.
 *                       Impact assessment: no exhaustive switch / Record key over
 *                       SovereignProduct or SovereignRole; module-loader gains a
 *                       matching MODULE_PRODUCT update (separate component);
 *                       sovereign-api-client/src/types.ts SovereignProduct updated
 *                       to match (governance-obligated sync per that file's
 *                       header). Full tsc --noEmit clean across both TS packages.
 *                       GD-5 does NOT resolve the role->module access matrix
 *                       (Decision 24), companion VRS-gate treatment, or the
 *                       access-denial taxonomy gap (Decision 25).
 *   v1.2 (June 11, 2026) — Added seven VIGIL SovereignEventType members
 *                       (GD-4, approved Project Principal June 11, 2026):
 *                       ALERT_RECEIVED, ALERT_ACKNOWLEDGED, ALERT_RESOLVED,
 *                       ALERT_ESCALATED, ALERT_FALSE_POSITIVE,
 *                       TRIAGE_ANALYSIS_PRODUCED, APPROVAL_REQUEST_RECEIVED.
 *                       Applied AFTER v1.1, not combined. Seven new union
 *                       members only; non-breaking widening. See
 *                       Governance_Decision_Record_GD4_VIGIL.md. Impact
 *                       assessment: no exhaustive switch on SovereignEventType
 *                       exists in the monorepo; full tsc --noEmit clean.
 *   v1.1 (June 11, 2026) — Added VOICE_CAPTURE_COMPLETED to SovereignEventType
 *                       (GD-2, approved Project Principal June 11, 2026). Added
 *                       PRIOR_POSITION_RECONCILIATION to SovereignEventType
 *                       (GD-3, approved Project Principal June 11, 2026). Added
 *                       SCRIBEMode, VoiceCaptureCompletedEvent, and
 *                       PriorPositionReconciliationEvent payload types (Section 2).
 *                       Two new union members only; no field removed or renamed.
 *                       Non-breaking widening. See Governance_Decision_Record_GD1_GD2_GD3.md.
 *                       Impact assessment: no exhaustive switch on SovereignEventType
 *                       exists in the monorepo; full tsc --noEmit clean.
 *   v1.0 (June 2026) — Initial specification. Covers five original shell exports
 *                       plus three protocol boundary interfaces (MCP, A2A, AG-UI).
 *                       Protocol interfaces are defined and reserved here; implementations
 *                       are Stage 2 deliverables. No module may implement these
 *                       independently at the product level.
 */

// ============================================================
// SECTION 1 — SHARED ENTITY TYPES
// Re-exported from sovereign-data package.
// These are law. Never redefine in a module.
// ============================================================

export interface SovereignUser {
  employee_id: string;
  name: string;
  org_unit: string;
  role: SovereignRole;
  clearance_level: ClearanceLevel;
  cost_code_assignments: string[];
}

export type SovereignRole =
  | "PROGRAM_MANAGER"
  | "ANALYST"
  | "COMPLIANCE_OFFICER"
  | "AGENT_OPERATOR"
  | "INDEPENDENT_REVIEWER"
  | "SYSTEM_ADMIN"
  | "READ_ONLY"
  // GD-5, June 13, 2026 (shell-contract v1.3) — platform administrator role.
  // VIGIL declares minimumRole "PLATFORM_ADMIN"; the fail-closed default
  // RoleAccessPolicy (exact match OR SYSTEM_ADMIN superuser) then admits
  // exactly PLATFORM_ADMIN or SYSTEM_ADMIN — the required VIGIL mount gate.
  | "PLATFORM_ADMIN";

export type ClearanceLevel =
  | "UNCLASSIFIED"
  | "CUI"
  | "SECRET"
  | "TOP_SECRET";

export type SovereignProduct =
  // Six primary products
  | "NEXUS"
  | "CPMI"
  | "APEX"
  | "FLOWPATH"
  | "AGENTOS"
  | "ARIA"
  // Four companion suite modules — GD-5, June 13, 2026 (shell-contract v1.3)
  | "COUNSEL"
  | "SCRIBE"
  | "LENS"
  | "VIGIL"
  // Reviewer's Workspace — GD-26, July 20, 2026 (shell-contract v1.21)
  | "WORKSPACE";

export type SovereignTier = "standard" | "enhanced";


// ============================================================
// SECTION 2 — LOGGER TYPES
// Every module calls shell.logger.log() — never a provider directly.
// Full schema: sovereign-security/sovereign_logger.py
// ============================================================

export type SovereignEventType =
  | "APPROVAL_GATE_OPEN"
  | "APPROVAL_GATE_CLOSE"
  | "HUMAN_DECISION"
  | "AGENT_STEP_START"
  | "AGENT_STEP_COMPLETE"
  | "ANOMALY_DETECTED"
  | "GOVERNANCE_GATE_1"
  | "GOVERNANCE_GATE_2"
  | "GOVERNANCE_GATE_3"
  | "GOVERNANCE_GATE_4"
  | "REASONING_STEP_START"
  | "REASONING_STEP_COMPLETE"
  | "HONEYTOKEN_ACCESS"
  | "FALLBACK_ACTIVATED"
  | "EXTERNAL_DEPENDENCY_FAILURE"
  | "AGENT_ISOLATED"
  | "GOVERNANCE_GATE_OVERRIDE"
  | "AGUI_EVENT"
  | "MCP_TOOL_CALL"
  | "A2A_TASK_HANDOFF"
  | "A2A_TASK_FAILURE"
  // GD-2 — June 11, 2026 (shell-contract v1.1)
  | "VOICE_CAPTURE_COMPLETED"
  // GD-3 — June 11, 2026 (shell-contract v1.1)
  | "PRIOR_POSITION_RECONCILIATION"
  // GD-4 — June 11, 2026 (shell-contract v1.2) — seven VIGIL event types
  | "ALERT_RECEIVED"
  | "ALERT_ACKNOWLEDGED"
  | "ALERT_RESOLVED"
  | "ALERT_ESCALATED"
  | "ALERT_FALSE_POSITIVE"
  | "TRIAGE_ANALYSIS_PRODUCED"
  | "APPROVAL_REQUEST_RECEIVED"
  // GD-6 — June 23, 2026 (shell-contract v1.4) — four agent-action approval
  // lifecycle event types (VIGIL Agent Approval Flow). Emitted only by module-vigil.
  | "AGENT_ACTION_APPROVED"
  | "AGENT_ACTION_REJECTED"
  | "AGENT_ACTION_ESCALATED"
  | "AGENT_ACTION_EXPIRED"
  // GD-7 — June 23, 2026 (shell-contract v1.5) — CPMI reasoning-chain completion +
  // four CPMI-VRS gate lifecycle event types. Emitted only by module-cpmi.
  | "CPMI_REASONING_CHAIN_COMPLETE"
  | "CPMI_VRS_GATE_1_PASSED"
  | "CPMI_VRS_GATE_2_PASSED"
  | "CPMI_VRS_GATE_3_ATTESTED"
  | "CPMI_VRS_GATE_4_PASSED"
  // GD-8 — June 24, 2026 (shell-contract v1.6) — three inference-layer event types
  // (Local LLM infrastructure). Emitted only by sovereign-api-client.
  | "INFERENCE_CALL"
  | "INFERENCE_PROVIDER_FALLBACK"
  | "MODEL_HASH_MISMATCH"
  // GD-9 — June 24, 2026 (shell-contract v1.7) — seven AgentOS task-lifecycle event types
  // (task registry / dispatcher state machine). Emitted only by module-agentos.
  | "AGENTOS_TASK_ASSIGNED"
  | "AGENTOS_APPROVAL_REQUESTED"
  | "AGENTOS_TASK_APPROVED"
  | "AGENTOS_TASK_REJECTED"
  | "AGENTOS_TASK_STARTED"
  | "AGENTOS_TASK_COMPLETE"
  | "AGENTOS_TASK_CANCELLED"
  // GD-11 — June 24, 2026 (shell-contract v1.8) — six NEXUS work-request lifecycle event
  // types (work-request registry state machine). Emitted only by module-nexus.
  | "NEXUS_REQUEST_SUBMITTED"
  | "NEXUS_REQUEST_ROUTED"
  | "NEXUS_APPROVAL_PENDING"
  | "NEXUS_REQUEST_IN_PROGRESS"
  | "NEXUS_REQUEST_COMPLETE"
  | "NEXUS_REQUEST_REJECTED"
  // GD-13 — June 24, 2026 (shell-contract v1.10) — model-evaluation completion event.
  // Emitted by sovereign-security/evaluate.py (CPMI-VRS four-gate validation before a model
  // is promoted), via the Security Framework logger under product AGENTOS.
  | "MODEL_EVALUATION_COMPLETE"
  // GD-14 — June 24, 2026 (shell-contract v1.11) — two AgentOS A2A messaging event types
  // (agent-to-agent message bus). Emitted only by module-agentos.
  | "AGENT_MESSAGE_SENT"
  | "AGENT_MESSAGE_RECEIVED"
  // GD-16 — June 25, 2026 (shell-contract v1.12) — seven APEX analytics/reporting event types
  // (program analysis, report + dossier generation, DC-3 provenance, sovereignHold gate, and
  // the PPBE event-trigger stub). Emitted only by module-apex.
  | "APEX_ANALYSIS_STARTED"
  | "APEX_ANALYSIS_COMPLETE"
  | "APEX_REPORT_GENERATED"
  | "APEX_DOSSIER_EXPORTED"
  | "APEX_PROVENANCE_VIEWED"
  | "REPORT_GENERATION_HELD"
  | "APEX_EVENT_RECEIVED"
  // GD-18 — June 26, 2026 (shell-contract v1.13) — ten FLOWPATH workflow-elicitation event types
  // (elicitation session lifecycle, artifact production/approval, Five-Question Gate, vocabulary
  // capture, data-source registration, validation cadence, and individual workstyle elicitation).
  // Emitted only by module-flowpath. The two workstyle events carry data_classification: user and
  // a hashed analyst_id — they must never appear in a platform-wide audit query without the user
  // filter applied (15_FLOWPATH_Architecture.md §8).
  | "FLOWPATH_SESSION_STARTED"
  | "FLOWPATH_SESSION_COMPLETE"
  | "FLOWPATH_ARTIFACT_PRODUCED"
  | "FLOWPATH_ARTIFACT_APPROVED"
  | "FLOWPATH_GATE_FAILED"
  | "FLOWPATH_VOCABULARY_CAPTURED"
  | "FLOWPATH_DATASOURCE_REGISTERED"
  | "FLOWPATH_VALIDATION_CADENCE_SET"
  | "FLOWPATH_WORKSTYLE_ELICITED"
  | "FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT"
  // GD-20 — June 2026 (shell-contract v1.15) — four ARIA Suite / CLEAR event types
  // (continuous compliance monitoring + export certification). Emitted by module-aria
  // (clear-engine + Certification Queue) and by the deterministic aria.rules-engine.
  | "ARIA_COMPLIANCE_CHECK"      // every automated compliance evaluation
  | "ARIA_CERTIFICATION_ISSUED"  // every export gate opened by CLEAR certification
  | "ARIA_VIOLATION_FLAGGED"     // every compliance deviation surfaced (engine or human)
  | "ARIA_CALENDAR_ALERT";       // every governance-calendar timing violation

export type HumanDecisionType =
  | "HUMAN_APPROVAL"
  | "HUMAN_OVERRIDE"
  | "HUMAN_DENIAL"
  | "AUTHORIZATION_APPROVED"
  | "AUTHORIZATION_DENIED"
  | "TRAVEL_APPROVED"
  | "TRAVEL_DENIED"
  | "TRAVEL_ESCALATED"
  | "LABOR_CORRECTION_APPROVED"
  | "LABOR_ESCALATION_INITIATED"
  // GD-6 — June 23, 2026 (shell-contract v1.4) — a human authorizing an agent action
  // via VIGIL's Agent Approval Queue. Synced to sovereign-data/src/shared-types.ts.
  | "AGENT_APPROVAL"
  // GD-7 — June 23, 2026 (shell-contract v1.5) — CPMI-VRS Gate 3 human attestation and
  // human-gated world-model update. Synced to sovereign-data/src/shared-types.ts.
  | "GATE_3_ATTESTATION"
  | "WORLD_MODEL_UPDATE"
  // GD-9 — June 24, 2026 (shell-contract v1.7) — AgentOS task-lifecycle human decisions:
  // a human approving an agent task via VIGIL (TASK_APPROVAL) and a human cancelling a
  // task (TASK_CANCELLATION). Synced to sovereign-data/src/shared-types.ts.
  | "TASK_APPROVAL"
  | "TASK_CANCELLATION"
  // GD-16 — June 25, 2026 (shell-contract v1.12) — a human attesting an APEX report (MSR/QPR
  // or program dossier) before it is exported. Synced to sovereign-data/src/shared-types.ts.
  | "REPORT_ATTESTATION"
  // GD-18 — June 26, 2026 (shell-contract v1.13) — two FLOWPATH human decisions: a human
  // reviewer approving a FLOWPATH workflow artifact before it is committed to the registry
  // (WORKFLOW_APPROVAL, Screen 3), and an analyst signing off on an APEX pre-review validation
  // cycle (VALIDATION_SIGN_OFF, DC-5). Both synced to sovereign-data/src/shared-types.ts.
  | "WORKFLOW_APPROVAL"
  | "VALIDATION_SIGN_OFF"
  // GD-20 — June 2026 (shell-contract v1.15) — a human reviewer certifying an output as
  // compliant in the CLEAR Certification Queue (opens the SCRIBE/PPBE export gate).
  // Synced to sovereign-data/src/shared-types.ts (18 -> 19 members).
  | "COMPLIANCE_CERTIFICATION"
  // GD-21 — July 12, 2026 (shell-contract v1.16) — three Time & Travel Phase II human
  // decisions (docs/17 §12): a manager deciding a routed travel request (TRAVEL_APPROVAL —
  // distinct from the v1.0 TRAVEL_APPROVED/TRAVEL_DENIED/TRAVEL_ESCALATED outcome members;
  // see the v1.16 changelog naming note), a manager sending a time-record correction
  // communication (TIME_CORRECTION_SENT), and a manager authorizing a formal escalation
  // notice through VIGIL (ESCALATION_AUTHORIZED). All synced to
  // sovereign-data/src/shared-types.ts (19 -> 22 members).
  | "TRAVEL_APPROVAL"
  | "TIME_CORRECTION_SENT"
  | "ESCALATION_AUTHORIZED";

export interface SovereignLogEvent {
  event_type: SovereignEventType;
  workflow_step_id: string;
  sovereign_tier: SovereignTier;
  product: SovereignProduct;
  actor_id: string;
  outcome: string;
  payload: Record<string, unknown>;
  // HUMAN_DECISION events only
  decision_type?: HumanDecisionType;
  actor?: "human" | "agent";
  actor_name?: string;
  // AGENT_STEP_START and AGENT_STEP_COMPLETE events
  agent_id?: string;
  // GD-12 (v1.9) — "Orchestration" added to keep this inline union in sync with AgentClass.
  agent_class?: "Analytical" | "Operational" | "Governance" | "Monitoring" | "Orchestration";
  // AGENT_STEP_COMPLETE events (Intelligence Layer exposure)
  deployment_feedback?: {
    automatability_score: number;
    human_time_seconds: number;
    agent_time_seconds: number;
    override_occurred: boolean;
    override_reason?: string;
  };
}

// ------------------------------------------------------------
// COMPANION SUITE EVENT PAYLOAD TYPES (shell-contract v1.1)
// Auxiliary, fully-typed payload shapes for the GD-2 / GD-3 event types.
// SovereignLogEvent.payload remains Record<string, unknown>; these describe
// the structured payloads a module supplies for these two event types so the
// Intelligence Layer can consume them without re-deriving the shape.
// ------------------------------------------------------------

/**
 * SCRIBEMode — the six product-aligned drafting modes plus synthesis and
 * framing. Used in VoiceCaptureCompletedEvent.target_mode. Values must match
 * the mode selector in module-scribe.
 */
export type SCRIBEMode =
  | "correspondence_draft"   // → NEXUS
  | "program_narrative"      // → NEXUS / APEX
  | "report_commentary"      // → APEX
  | "vvr_description"        // → FLOWPATH
  | "governance_memo"        // → CPMI
  | "rule_change_proposal"   // → ARIA
  | "synthesis"              // → intermediate artifact
  | "framing";               // → FLOWPATH pre-work

/**
 * VOICE_CAPTURE_COMPLETED — GD-2, approved June 11, 2026.
 * Emitted by: scribe-drafter (module-scribe / useVoiceCapture.ts).
 * Data classification: user — invariant, never change.
 */
export interface VoiceCaptureCompletedEvent {
  event_type: "VOICE_CAPTURE_COMPLETED";
  agent_id: string;                // "scribe-drafter"
  duration_seconds: number;        // capture session duration
  word_count: number;              // words in resulting transcript
  target_mode: SCRIBEMode;         // drafting mode the capture feeds
  workflow_step_id?: string;       // present if initiated from product context
  data_classification: "user";     // invariant
}

/**
 * PRIOR_POSITION_RECONCILIATION — GD-3, approved June 11, 2026.
 * Emitted by: counsel-analyst (module-counsel / usePriorPositionCheck.ts).
 * Both resolution paths are logged. Neither is blocked.
 * NOTE: decision_type uses the contract's canonical HumanDecisionType
 * (the Decision Matrix taxonomy), not a separate "DecisionType" type.
 */
export interface PriorPositionReconciliationEvent {
  event_type: "PRIOR_POSITION_RECONCILIATION";
  agent_id: string;                  // "counsel-analyst"
  current_decision_id: string;
  conflicting_record_ids: string[];
  resolution: "acknowledged" | "dismissed";
  /**
   * Present when resolution === "acknowledged".
   * Absent (not just undefined) when resolution === "dismissed".
   * Schema validation enforces this constraint at the emit site.
   */
  reconciliation_note?: string;
  decision_type: HumanDecisionType;  // from the Decision Matrix taxonomy
  workflow_step_id?: string;
}


// ------------------------------------------------------------
// APEX ANALYSIS TYPES (shell-contract v1.12 — GD-16)
// The contract between apex.ai-assistant (produces ApexAnalysisOutput) and
// apex.report-generator (consumes it for deterministic document assembly).
// Defined here so module-apex and any downstream consumer share one schema.
// These are governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

/** The three APEX report kinds: Monthly Status Report, Quarterly Program Review, ad-hoc. */
export type ApexReportType = "MSR" | "QPR" | "AD_HOC";

/**
 * A single risk finding produced by apex.ai-assistant. Carries the DC-3 provenance fields
 * (source_data, baseline, trend, responsible_party) so every surfaced finding is traceable
 * to the data that produced it.
 */
export type RiskFinding = {
  flag_id: string;
  description: string;
  source_data: string;
  baseline: string;
  trend: "IMPROVING" | "STABLE" | "DEGRADING";
  responsible_party: string;
  severity: "P1" | "P2" | "P3";
};

/**
 * The structured output of one apex.ai-assistant analysis run. `status_narrative` and each
 * `recommendations` entry are plain prose (Gap 5). `schema_valid` is the agent's assertion
 * that the output conforms; a schema_valid:false output is not surfaced for report assembly.
 */
export type ApexAnalysisOutput = {
  program_id: string;
  report_type: ApexReportType;
  status_narrative: string;
  risk_findings: RiskFinding[];
  recommendations: string[];
  schema_valid: boolean;
  workflow_step_id: string;
};


// ------------------------------------------------------------
// FLOWPATH INDIVIDUAL WORKSTYLE TYPES (shell-contract v1.13 — GD-18)
// The structured output of FLOWPATH individual (analyst) elicitation
// (15_FLOWPATH_Architecture.md §5a). AnalystWorkstyleProfile is
// data_classification: user WITHOUT EXCEPTION — it belongs to the analyst, not
// the organization. It is stored in sovereign-data alongside StyleProfile,
// queryable only by the owning user, never by any admin/role/elevation path,
// and never passed to CPMI, VIGIL, or any governance product. The analyst's
// identity is carried ONLY as a one-way per-user-salted hash (analyst_id_hash) —
// never a cleartext analyst_id — so no platform query can reverse it (Guarantee 2,
// §5a "Privacy Architecture"). This reconciles §5a's descriptive `analyst_id`
// field to the hashed form mandated by the Session 20 privacy directive.
// These are governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

/** Depth of an analyst's prior familiarity with a program (§5a program_expertise). */
export type ProgramExpertiseDepth =
  | "CURRENT_CYCLE"
  | "MULTIPLE_CYCLES"
  | "LONG_TERM_FAMILIARITY";

/** A program this analyst has reviewed before, with depth rating. */
export type AnalystProgramExpertise = {
  program_id: string;
  depth: ProgramExpertiseDepth;
};

/**
 * A metric value at which this analyst personally becomes concerned. The validator
 * enforces that a personal threshold is AT LEAST as sensitive as the organizational
 * standard — never looser (§5a "Balancing Organizational and Individual Layers").
 * Values are plain prose (Gap 5), e.g. metric "cost variance", value "10 percent".
 */
export type AnalystPersonalThreshold = {
  metric: string;
  value: string;
};

/**
 * A term this analyst uses differently from the organizational vocabulary standard.
 * Surfaced by flowpath.domain-translator for reconciliation; flagged, not blocked.
 */
export type AnalystVocabularyExtension = {
  term: string;
  analyst_usage: string;
  organizational_definition: string;
  intentional_divergence: boolean;
};

/**
 * The structured output of one FLOWPATH individual-workstyle elicitation session.
 * ADVISORY (Layer 2) — it changes how APEX guides this analyst, never what is logged,
 * approved, or audited. data_classification is the literal "user" — mandatory and
 * non-removable. The identity field is the hashed form only.
 */
export type AnalystWorkstyleProfile = {
  analyst_id_hash: string;
  program_expertise: AnalystProgramExpertise[];
  preferred_analysis_sequence: string[];
  personal_thresholds: AnalystPersonalThreshold[];
  program_context_notes: string[];
  vocabulary_extensions: AnalystVocabularyExtension[];
  last_elicited: string;
  profile_version: number;
  data_classification: "user";
};


// ============================================================
// SECTION 3 — GOVERNANCE TYPES
// ============================================================

export type VRSGateState =
  | "NOT_STARTED"
  | "GATE_1_COMPLETE"
  | "GATE_2_COMPLETE"
  | "GATE_3_PENDING"
  | "GATE_3_COMPLETE"
  | "GATE_4_CERTIFIED"
  | "HOLD";

export interface VRSGateStatus {
  product: SovereignProduct;
  gate_state: VRSGateState;
  last_certified: string | null;
  hold_reason?: string;
  certifying_officer?: string;
}

export interface CPMIPortfolioStatus {
  overall: "GREEN" | "AMBER" | "RED";
  products: VRSGateStatus[];
  last_updated: string;
  pending_gate3_reviews: number;
}


// ============================================================
// SECTION 4 — MCP PROTOCOL BOUNDARY
// Governance: SOVEREIGN Security Framework
// Implementation stage: Stage 2
// ============================================================

export type MCPToolCategory =
  | "DATABASE_READ"
  | "DATABASE_WRITE"
  | "EXTERNAL_API"
  | "FILE_OPERATION"
  | "SECURITY_FRAMEWORK"
  | "WORLD_MODEL";

export interface MCPToolEndpoint {
  tool_id: string;
  category: MCPToolCategory;
  product_scope: SovereignProduct[];
  data_classification: ClearanceLevel;
  requires_human_approval: boolean;
  security_observable: boolean;
}

export interface MCPCallResult<T = unknown> {
  tool_id: string;
  success: boolean;
  data?: T;
  error?: string;
  fallback_tier?: "live" | "cache" | "static";
  workflow_step_id: string;
}

export interface SovereignMCPInterface {
  call: <T>(
    tool_id: string,
    params: Record<string, unknown>,
    context: { workflow_step_id: string; product: SovereignProduct }
  ) => Promise<MCPCallResult<T>>;
  listEndpoints: (product: SovereignProduct) => MCPToolEndpoint[];
  manifestVersion: string;
  _stage: "DEFINED" | "IMPLEMENTED";
}


// ============================================================
// SECTION 5 — A2A PROTOCOL BOUNDARY
// Governance: AgentOS
// Implementation stage: Stage 2
//
// OPEN DECISION (unresolved — blocks Stage 2 A2A task lifecycle build):
//   When AgentOS encounters a medium-risk task requiring human approval,
//   does it re-execute after approval or acknowledge and continue?
//   Decision owner: Project Principal.
// ============================================================

export type AgentClass =
  | "Analytical"
  | "Operational"
  | "Governance"
  | "Monitoring"
  // GD-12, June 24, 2026 (shell-contract v1.9) — AgentOS orchestrator class. Manages agent
  // task assignment, routing, and lifecycle; does not execute tasks directly. Synced to the
  // loader VALID_AGENT_CLASSES and the Python logger APPROVED_AGENT_CLASSES (Constraint #11).
  | "Orchestration";

export type TaskLifecycleState =
  | "QUEUED"
  | "RUNNING"
  | "AWAITING_HUMAN_APPROVAL"
  | "APPROVED"
  | "DENIED"
  | "COMPLETE"
  | "FAILED"
  | "ESCALATED";

export interface AgentCard {
  agent_id: string;
  agent_class: AgentClass;
  product: SovereignProduct;
  capabilities: string[];
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  task_lifecycle_contract: {
    supports_long_running: boolean;
    // Platform default: ACKNOWLEDGE_AND_CONTINUE — task resumes from paused state.
    // CPMI Gate 3 exception: RE_EXECUTE — reasoning chain restarts with current
    // world model. Encoded in CPMI agent card. Resolved: Project Principal, June 1, 2026.
    approval_behavior: "RE_EXECUTE" | "ACKNOWLEDGE_AND_CONTINUE";
    partial_failure_behavior: "ESCALATE" | "RETRY" | "FALLBACK";
  };
  data_classification_ceiling: ClearanceLevel;
  security_observable: boolean;
}

export interface A2ATask {
  task_id: string;
  originating_agent: string;
  target_agent: string;
  workflow_step_id: string;
  payload: Record<string, unknown>;
  state: TaskLifecycleState;
  created_at: string;
  updated_at: string;
  hold_reason?: string;
}

export interface SovereignA2AInterface {
  registerAgent: (card: AgentCard) => Promise<{ registered: boolean; registry_version: string }>;
  invokeAgent: (
    target_agent_id: string,
    payload: Record<string, unknown>,
    context: { workflow_step_id: string; originating_agent: string }
  ) => Promise<A2ATask>;
  getTaskState: (task_id: string) => Promise<A2ATask>;
  listAgents: () => AgentCard[];
  _stage: "DEFINED" | "CARDS_REGISTERED" | "IMPLEMENTED";
}


// ============================================================
// SECTION 6 — AG-UI PROTOCOL BOUNDARY
// Governance: CPMI-VRS (gate definitions) + AgentOS (execution)
// Implementation stage: Stage 2
//
// OPEN DECISION (unresolved — blocks Stage 3 annotation program design):
//   Which industry or workflow class does the Intelligence Layer
//   build its knowledge base for first?
//   Decision owner: Project Principal.
// ============================================================

export type AGUIEventType =
  | "REASONING_STEP"
  | "TOOL_CALL_INITIATED"
  | "TOOL_CALL_COMPLETE"
  | "RECOMMENDATION_READY"
  | "HUMAN_INTERRUPT"
  | "HUMAN_REDIRECT"
  | "HUMAN_APPROVAL"
  | "HUMAN_DENIAL"
  | "TASK_COMPLETE"
  | "TASK_FAILED";

export interface AGUIEvent {
  event_id: string;
  event_type: AGUIEventType;
  agent_id: string;
  workflow_step_id: string;
  product: SovereignProduct;
  timestamp: string;
  sequence: number;
  payload: Record<string, unknown>;
  // Human action events
  actor_id?: string;
  actor_name?: string;
  decision_type?: HumanDecisionType;
}

export interface AGUISubscription {
  task_id: string;
  subscriber_id: string;
  product: SovereignProduct;
  gate_context?: VRSGateState;
}

export interface SovereignAGUIInterface {
  emit: (event: Omit<AGUIEvent, "event_id" | "timestamp" | "sequence">) => void;
  subscribe: (
    subscription: AGUISubscription,
    handler: (event: AGUIEvent) => void
  ) => () => void;
  humanAction: (
    task_id: string,
    action: Pick<AGUIEvent, "event_type" | "actor_id" | "actor_name" | "decision_type" | "payload">,
    context: { workflow_step_id: string }
  ) => void;
  taxonomyVersion: string;
  _stage: "DEFINED" | "TAXONOMY_COMPLETE" | "IMPLEMENTED";
}


// ------------------------------------------------------------
// SHARED TASK SURFACE TYPES (shell-contract v1.14 — GD-19)
// The cross-product task surface shape. A SharedTask is the governance-frozen,
// self-contained representation of a unit of work that one product publishes for
// another to observe (e.g. NEXUS routes a work request to AgentOS; the resulting
// AgentOS task is published here so the AgentOS Task Registry panel can show it).
// The surface is intentionally minimal and module-independent: the shell contract
// never imports a module's internal Task type, so SharedTask carries exactly the
// fields a cross-product reader needs to render and trace a task. SharedTaskStatus
// is the CANONICAL cross-product task-status taxonomy — module-agentos's TaskStatus
// aliases it (Standing Constraint #2, no divergent duplicate). These are
// governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

/** The canonical cross-product task lifecycle status (module-agentos TaskStatus aliases this). */
export type SharedTaskStatus =
  | "CREATED"
  | "ASSIGNED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "CANCELLED";

/**
 * A cross-product unit of work published to the shared task surface. `origin_product`
 * names the product that published it (e.g. "NEXUS"); `origin_request_id` carries the
 * publishing product's own id for traceability (e.g. the NEXUS request_id). Every task
 * carries workflow_step_id so a reader can join it to the audit trail (Constraint #6).
 */
export interface SharedTask {
  task_id: string;
  title: string;
  description: string;
  status: SharedTaskStatus;
  origin_product: SovereignProduct;
  assigned_agent_id?: string;
  requires_approval: boolean;
  data_classification: ClearanceLevel;
  workflow_step_id: string;
  /** The publishing product's native id for this work (e.g. NEXUS request_id) — traceability. */
  origin_request_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * The shared task surface — the ninth shell export (GD-19). A shell-owned, in-memory
 * registry of SharedTasks that products publish to and read from. It carries no
 * governance authority of its own (Constraint #1): publishing a task does not log,
 * approve, or route it — the publishing product still emits its own governed Logger
 * events. The surface only makes a published task visible to other products. Reads are
 * snapshots; subscribe() notifies a listener whenever the task set changes.
 */
export interface TaskSurface {
  /** Publish (or replace, by task_id) a task on the shared surface. */
  publish: (task: SharedTask) => void;
  /** Patch an existing task by id. No-op if the id is not present. */
  update: (task_id: string, patch: Partial<Omit<SharedTask, "task_id">>) => void;
  /** A read-only snapshot of every published task (publication order). */
  list: () => readonly SharedTask[];
  /** Look up one published task by id. */
  get: (task_id: string) => SharedTask | undefined;
  /** Subscribe to surface changes; returns an unsubscribe function. */
  subscribe: (listener: (tasks: readonly SharedTask[]) => void) => () => void;
}


// ------------------------------------------------------------
// ARIA CLEAR CERTIFICATION SURFACE (shell-contract v1.15 — GD-20)
// A shell-owned, in-memory record of CLEAR certification decisions. module-aria's
// Certification Queue records a decision here; module-scribe's export gate reads
// isCertified() before opening export. Carries no governance authority of its own
// (Constraint #1) — recording a certification does not itself log; the Certification
// Queue still emits its own governed ARIA_CERTIFICATION_ISSUED / ARIA_VIOLATION_FLAGGED
// Logger event. The surface only makes a certification visible across products.
// Determinism (docs/16 §1/§3): a certification is a human decision recorded against a
// deterministic CLEAR evaluation — no AI inference is involved at any point.
// Governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

export interface AriaCertification {
  document_id: string;
  /** true = certified (export gate opens); false = flagged (export blocked). */
  certified: boolean;
  certifying_actor_id: string;
  certifying_actor_name: string;
  /** Required, >= 10 chars — consistent with the VIGIL decision-note minimum. */
  decision_note: string;
  /** Regulatory sources the CLEAR engine evaluated against for this document. */
  applicable_sources: string[];
  workflow_step_id: string;
  /** ISO 8601 — when the human recorded the certification decision. */
  certified_at: string;
}

export interface AriaCertificationSurface {
  /** Record a CLEAR certification or flag for a document (Certification Queue). */
  record: (certification: AriaCertification) => void;
  /** Whether a document currently holds a positive CLEAR certification (SCRIBE export gate). */
  isCertified: (document_id: string) => boolean;
  /** The full certification record for a document, if any. */
  get: (document_id: string) => AriaCertification | undefined;
  /** Read-only snapshot of every recorded certification (Compliance Dashboard). */
  list: () => readonly AriaCertification[];
  /** Subscribe to certification-set changes; returns an unsubscribe function. */
  subscribe: (listener: (certs: readonly AriaCertification[]) => void) => () => void;
}


// ------------------------------------------------------------
// PROGRAM STATUS SURFACE TYPES (shell-contract v1.18 — GD-23)
// A shell-owned, in-memory record of per-program obligation status. APEX
// publishes a ProgramStatusSnapshot per program whenever program data is
// loaded or changes; VIGIL reads via get() in the ppbe_obligation approval
// brief — providing the approving operator with current program financial
// context (WF-20 resolution). Deliberately narrow: solves the concrete case
// (VIGIL needs program-level obligation context) without becoming a general
// cross-module query mechanism. See docs/20 for the full design rationale.
// Mirrors AriaCertificationSurface exactly: same four methods
// (publish/get/list/subscribe), same last-write-wins-by-id semantics, same
// shell-owned in-memory lifetime per platform session.
// Governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

export interface ProgramStatusSnapshot {
  readonly program_id: string;
  readonly percent_obligated: number;
  readonly status: "on_track" | "at_risk" | "off_track";
  /** Pre-composed, human-readable summary — reuses APEX's obligationRate() narrative
      rather than building a second summarization path (docs/20 §2). */
  readonly narrative: string;
  readonly updated_at: string; // ISO 8601
}

export interface ProgramStatusSurface {
  /** Publish (or replace, by program_id) a program's current obligation status. */
  publish: (status: ProgramStatusSnapshot) => void;
  /** Look up one program's status by id. */
  get: (program_id: string) => ProgramStatusSnapshot | undefined;
  /** A read-only snapshot of every published program status. */
  list: () => readonly ProgramStatusSnapshot[];
  /** Subscribe to surface changes; returns an unsubscribe function. */
  subscribe: (listener: (statuses: readonly ProgramStatusSnapshot[]) => void) => () => void;
}


// ============================================================
// WORK QUEUE SURFACE — the twelfth export (GD-24, shell-contract v1.19)
// Cross-module aggregate queue summaries for the Home Dashboard "To Do / Review"
// section. Mirrors the publish/list/subscribe shape of ProgramStatusSurface and
// AriaCertificationSurface; listForModule() is the one addition — needed because
// the Home Dashboard groups tiles by source module (Pending Approvals under VIGIL,
// T&T Reviews under SCRIBE, etc.). Last-write-wins by module_id + queue_label.
// Shell-owned, in-memory, one session's lifetime. No governance authority of its own
// (Constraint #1) — publishing a summary does not log, approve, or route anything.
// Governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

export interface WorkQueueSummary {
  readonly module_id: string;          // "vigil" | "scribe" | "aria" | "nexus"
  readonly queue_label: string;        // human-readable, e.g. "Pending Approvals"
  readonly count: number;
  readonly highest_severity: "P1" | "P2" | "P3" | "P4" | null;
  readonly updated_at: string;         // ISO timestamp
}

export interface WorkQueueSurface {
  /** Publish (or replace, by module_id + queue_label) one module's queue summary. */
  publish: (summary: WorkQueueSummary) => void;
  /** Every published summary for one module. */
  listForModule: (module_id: string) => readonly WorkQueueSummary[];
  /** Every published summary, across all modules. */
  list: () => readonly WorkQueueSummary[];
  /** Subscribe to surface changes; returns an unsubscribe function. */
  subscribe: (listener: (summaries: readonly WorkQueueSummary[]) => void) => () => void;
}


// ============================================================
// REVIEWER'S WORKSPACE SURFACE — the thirteenth export (GD-25, shell-contract v1.20)
// Cross-module reviewable items for the Reviewer's Workspace module (docs/23).
// Mirrors the publish/list/subscribe shape of WorkQueueSurface; remove() is the
// one addition — an individual reviewable item must actually LEAVE the Workspace
// once its source module records the decision (approved, certified, sent), not
// just get overwritten on next publish. Last-write-wins by module_id + item_id.
// The payload is intentionally OPAQUE (unknown): the shell contract never imports
// a module's own types — modules import from the shell contract, never the
// reverse. The consuming Workspace module does the real type narrowing by
// module_id, via the established cross-module type-only import pattern
// (module-agentos/src/approval-port.ts et al.). Shell-owned, in-memory, one
// session's lifetime. No governance authority of its own (Constraint #1) —
// publishing an item does not log, approve, or route anything; the source module
// still emits its own governed Logger events at decision time.
// Governance-frozen field names — never rename, never omit a required field.
// ------------------------------------------------------------

export interface WorkspaceReviewItem {
  readonly module_id: string; // "vigil" | "aria" | "scribe"
  readonly item_id: string;
  readonly payload: unknown; // narrowed by the consuming Workspace module, not the shell
  readonly published_at: string;
}

export interface ReviewerWorkspaceSurface {
  /** Publish (or replace, by module_id + item_id) one reviewable item. */
  publish: (item: WorkspaceReviewItem) => void;
  /** Remove an item once it's been decided (approved, certified, sent) — it should not
      linger in the Workspace after the source module has resolved it. */
  remove: (module_id: string, item_id: string) => void;
  /** Every item published by one module. */
  listForModule: (module_id: string) => readonly WorkspaceReviewItem[];
  /** Every item, across all three modules. */
  list: () => readonly WorkspaceReviewItem[];
  /** Subscribe to surface changes; returns an unsubscribe function. */
  subscribe: (listener: (items: readonly WorkspaceReviewItem[]) => void) => () => void;
}


// ============================================================
// SECTION 7 — SHELL CONTEXT (THE COMPLETE CONTRACT)
// As of shell-contract v1.20 (GD-25) the context provides THIRTEEN exports
// (Standing Constraint #7 relaxed from twelve to thirteen for
// reviewerWorkspaceSurface; workQueueSurface was the twelfth at v1.19 / GD-24;
// programStatusSurface was the eleventh at v1.18 / GD-23; aria was the tenth
// at v1.15 / GD-20; taskSurface was the ninth at v1.14 / GD-19). No further
// export without a new GD.
// ============================================================

export interface SovereignShellContext {
  auth: {
    user: SovereignUser;
    token: string;
    signOut: () => void;
    hasRole: (role: SovereignRole) => boolean;
    hasClearance: (level: ClearanceLevel) => boolean;
  };
  logger: {
    log: (event: SovereignLogEvent) => void;
  };
  governance: {
    cpmiStatus: CPMIPortfolioStatus;
    vrsGates: VRSGateStatus[];
    isOnHold: (product: SovereignProduct) => boolean;
  };
  data: {
    types: unknown; // sovereign-data package canonical types
  };
  navigation: {
    navigateTo: (path: string) => void;
    currentPath: string;
    breadcrumb: Array<{ label: string; path: string }>;
  };
  // Protocol boundaries
  mcp: SovereignMCPInterface;
  a2a: SovereignA2AInterface;
  agui: SovereignAGUIInterface;
  // Ninth export — GD-19 (shell-contract v1.14). The shared cross-product task surface.
  taskSurface: TaskSurface;
  // Tenth export — GD-20 (shell-contract v1.15). The CLEAR certification surface.
  aria: AriaCertificationSurface;
  // Eleventh export — GD-23 (shell-contract v1.18). The per-program obligation status surface.
  programStatusSurface: ProgramStatusSurface;
  // Twelfth export — GD-24 (shell-contract v1.19). Cross-module work queue summaries for Home.
  workQueueSurface: WorkQueueSurface;
  // Thirteenth export — GD-25 (shell-contract v1.20). Cross-module reviewable items for the
  // Reviewer's Workspace module (docs/23).
  reviewerWorkspaceSurface: ReviewerWorkspaceSurface;
}


// ============================================================
// SECTION 8 — MODULE CONTRACT
// ============================================================

export interface SovereignModuleContract {
  moduleId: string;        // "module-[productname]"
  mountPath: string;       // "/[productname]"
  displayName: string;
  // GD-22 (v1.17): widened from SovereignRole to SovereignRole[] — each module declares
  // the full set of roles that may mount it. The loader's defaultRoleAccessPolicy checks
  // list membership; SYSTEM_ADMIN superuser clause is preserved in the policy, not here.
  minimumRole: SovereignRole[];
  agentCards: AgentCard[];
  mount: (ctx: SovereignShellContext, el: HTMLElement) => void;
  unmount: () => void;
  healthCheck: () => Promise<{
    status: "HEALTHY" | "DEGRADED" | "UNAVAILABLE";
    vrs_gate: VRSGateState;
    degraded_reason?: string;
  }>;
}


// ============================================================
// SECTION 9 — INTELLIGENCE LAYER EXPOSURE (FROZEN)
// Field names are frozen. Never rename, never omit.
//
// ✓ workflow_step_id        — every Logger event
// ✓ decision_type           — every HUMAN_DECISION event
// ✓ deployment_feedback     — every AGENT_STEP_COMPLETE event
// ✓ ANOMALY_DETECTED        — includes workflow_step_id
// ✓ classification_level    — every program entity
// ✓ VVR export schema       — {step_id, description, inputs, outputs,
//                              decision_required, human_role, cpmi_vrs_disclosure}
// ============================================================

export type ILExposureVerified = true;


// ============================================================
// SECTION 10 — GOVERNANCE NOTICE
//
// This file is a governance document expressed as TypeScript.
// Nothing here is executed directly. It is imported by the shell
// (sovereign-shell/src/shell.ts) and by each module's
// module.config.ts.
//
// Changing this file is a governance event, not a refactor.
// The change process is stated at the top of this file.
// ============================================================
