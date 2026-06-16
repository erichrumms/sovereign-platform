# SOVEREIGN Platform — Project Summary
### Everything Learned to Date | Agent Reference Document
Version 2.0 | May 2026 | Updated to reflect Option C architecture decision and full transition build completion

**Purpose:** Load this document into every new Claude session alongside the system prompt and platform integration brief. It contains the full history of decisions, problems encountered, lessons learned, and context that no agent should have to rediscover.

---

## Part 1 — What This Project Is and Where It Came From

### The Origin

This project began as an effort to add security and governance capabilities to four active prototype projects (NEXUS, CPMI, APEX, FLOWPATH) and connect them to AgentOS. As the conversation developed, it became clear that the right framing was not "add security to four apps" but "build the platform infrastructure that makes a portfolio of apps governable." That reframe produced the SOVEREIGN concept.

The triggering insight: federal and enterprise buyers do not just want software that works — they want software they can trust, audit, and explain. A platform with built-in security observability, a documented AI governance standard, and cross-product audit visibility is a qualitatively different offering than individual products with security bolted on afterward.

### The Governing Background Documents

1. **Sovereign AI, Digital Sovereignty, and Procurement Background Paper** — policy context: data sovereignty, infrastructure independence, American AI, procurement-centric AI clauses, AI governance frameworks. All SOVEREIGN design decisions trace back to this document.
2. **SOVEREIGN Platform Build Plan v2.0** — master project plan: 10 delivery stages, milestone gates, agent team structure.
3. **SOVEREIGN Platform Integration Brief v1.3** — the document that travels with every product. Master brief + six product-specific inserts. The standing constraint that goes in every session context.
4. **Intelligence Layer Concept Document** — five-component analytical engine for human-AI boundary analysis. Future seventh product. Documented so current products build toward it.
5. **SOVEREIGN Delivery Strategy v1.0** — deployment architecture options analysis. Option C (Unified Shell + Module Applications) approved. Never re-open this decision.
6. **Enterprise Data Strategy & Data Governance Framework (EDS&DGF) v1.0** — data classification schema, shared entity definitions, governance record requirements.

---

## Part 2 — The Portfolio

### Current Six Products

**NEXUS — Enterprise Task and Correspondence Management (Pipeline Stage 6)**
- Browser-native platform for enterprise task and correspondence management across federal agencies and corporate organizations
- Scale target: program or enterprise-scale daily active users
- Track A prototype complete; Track B (PPTX/document generation) scaffolded, handlers pending
- High near-term revenue opportunity in the portfolio
- Primary Judgment Detection training data source — generates largest volume of HUMAN_DECISION events
- Stack: Node.js 20/Express · React 18/Vite · PostgreSQL 15 + pgvector · AWS ECS Fargate GovCloud
- Governance record: INCOMPLETE (no ISSO contact, ATO boundary, or retention schedule)

**CPMI — Cognitive Program Management Infrastructure (Pipeline Stage 3)**
- AI governance engine for the entire SOVEREIGN portfolio
- 6-step reasoning chain: Context → Rules → Alternatives → Assumptions → Confidence → Recommendation
- CPMI-VRS four-gate certification model — elevated to portfolio-wide governance standard (Stage 3)
- Named product owner: Project Principal (assigned Session 0A — prerequisite for Stage 3 satisfied)
- Operates under enhanced monitoring tier (0.7× anomaly threshold) — integrity is platform-wide dependency
- Two-track: Track A (claude-sonnet-4 direct API) · Track B (Notion MCP, five databases)
- World model REST API not yet deployed — blocks APEX governance HOLD live integration and IL Compliance Mapper
- Governance record: INCOMPLETE

**APEX — Program Analytics and Reporting Platform (Pipeline Stage 6)**
- Program analytics and reporting for federal and corporate program portfolios
- 10 modules; four report types (MSR, QPR, ABS, CSC)
- DOE-NORM-001 HOLD: `sovereignHold()` blocks QPR/ABS generation when CPMI portfolio status is red — first live inter-product dependency in the portfolio
- Known-answer drift detection tied to SOVEREIGN anomaly events — do not rebuild in product
- Current stack: single-file HTML, sql.js v4; production target: PostgreSQL + server proxy
- TCO model implemented (Module 10 fifth tab) — three deployment tiers documented
- Governance record: INCOMPLETE

**FLOWPATH — Workflow Mapping Intelligence Platform v4.0 (Pipeline Stage 1)**
- Most mature product in terms of navigable feature set — 11 modules live
- Six-agent supervised system; RBAC (4 roles, 10 users); Action Triggers (3 types); Domain Translator Showcase
- The Domain Translator is an architectural pattern with applicability beyond FLOWPATH — elevate to platform level if appropriate
- VVR Records with embedded CPMI export schema are the primary input to the Intelligence Layer's Task Decomposition Engine
- Context window approaching limit (~1,350 lines) — fix known issues before adding v5.0 features
- Runtime: single-file React JSX in Claude artifact sandbox (hard constraints — see system_prompt.md)
- Open condition: `cpmi_vrs_disclosure` field must be added to VVR schema
- Governance record: INCOMPLETE

**AgentOS — MLOps Backbone and Agent Orchestration (Pipeline Stage 4)**
- Platform layer beneath the suite — not user-facing
- Hosts SOVEREIGN Security Framework and CPMI-VRS as native modules
- Proof-of-concept pipeline validated AgentOS architecture (personal project, excluded from SOVEREIGN)
- Planned: Run It Good, Program Office Suite (do not start second pipeline before module interface is designed)
- Local Mac mini M4 deployment; cloud migration is an ATO event with explicit criteria
- `evaluate.py` written but not yet run end-to-end against real data
- Medium-risk approval behavior (re-execute vs. acknowledge-only) not formally decided — must be resolved in first SOVEREIGN session
- Privacy boundary is architectural — orchestrator refuses `data_classification: user` sources at code level
- Governance record: INCOMPLETE

**ARIA Suite — ARC · TRACER · CLEAR (Pipeline Stage 7)**
- Three modules, one product owner (Project Principal, assigned Session 0A), one ATO boundary
- Named Product Owner assignment was a Session 0A governance record — ARIA Suite development is unblocked
- Deliberately excludes AI from all decision paths — generates AI-absence attestations
- Five non-negotiable architectural constraints: no self-approval (structural) · AI flags humans decide · append-only audit · role-gated decisions · policy-as-data
- Context-agnostic: same codebase enforces FAR/DFARS, FTR, corporate T&E, DCAA by rules array configuration
- Transition session was documentation-only — five known issues carry forward with exact fixes documented
- Richest ground-truth compliance judgment dataset in the portfolio (26 combined decision scenarios)
- Governance record: INCOMPLETE (ARC only — TRACER and CLEAR governance records not yet created)

**Future Seventh Product — Intelligence Layer**
- Five components: Task Decomposition · Judgment Detection · Automatability Scorer · Risk & Failure Modeler · Compliance Mapper
- Judgment Detection is the hardest component — requires labeled dataset of real human decision events (12+ months minimum)
- Every current product is already exposing the exact fields the IL will consume
- IL does not require any current product to rewrite — this was designed in from the start
- Stage 10 of the delivery schedule produces the IL build plan
- THIS PRODUCT MUST NEVER BE LOST OR DEPRIORITIZED

---

## Part 3 — The Delivery Architecture Decision

### Option C — Unified Shell with Module Applications (Approved)

The SOVEREIGN Delivery Strategy document (v1.0, May 2026) evaluated four deployment architectures:
- **Option A** (Monolithic SPA) — too rigid; cannot scale NEXUS at program or enterprise-scale volume independently from lightweight products
- **Option B** (Micro-Frontends) — architecturally capable but wrong for a small team; brittle module federation contracts
- **Option C** (Unified Shell + Module Apps) — **APPROVED**
- **Option D** (Independent Apps + Portal) — violates integration reliability principle; requires separate ATOs per product

**Why Option C:** It is the only architecture that matches the platform as designed. The shell is the platform layer (AgentOS, Security Framework, CPMI-VRS); modules are the products. Single ATO boundary. Strongest IL integration. Right-size for one primary developer. Natural forcing function for shared infrastructure deployment.

**Critical sequencing requirement:** Shell architecture specification must be approved by the Project Principal before any module development begins. The shell contract (`shell-contract.ts`) defines what the shell exports and what the module interface requires. It is a governance document, not just a technical decision.

**This decision is not re-opened.** It is a permanent governance record.

---

## Part 4 — Key Strategic Decisions Made

These decisions were made and must not be re-debated without a documented reason and Project Principal approval.

1. **SOVEREIGN is the platform name.** Full expansion: Governed Agentic Runtime with Integrated Security, Intelligence, and Oversight Networks. Chosen because it maps directly to Sovereign AI procurement language federal buyers already know.

2. **Build the Security Framework as a standalone library first, then embed into AgentOS.** Real-world validation before enterprise deployment. Products that have tested it become proof of concept.

3. **CPMI-VRS is the portfolio-wide governance standard.** Extended from CPMI to cover all six products. Non-AI products receive AI-absence certifications — stronger governance evidence, not weaker.

4. **ARIA Suite = CLEAR + TRACER + ARC under one owner.** Same user community (PM), same design philosophy (no AI in decision path), same sovereign AI posture. One boundary agreement covers all three.

5. **Intelligence Layer is a seventh product, not a feature.** Too architecturally substantial to be a module inside CPMI or AgentOS.

6. **Option C is the approved deployment architecture.** Unified Shell with Module Applications. Monorepo. Permanent governance record.

7. **Session 0 produces the Platform Integration Brief before any code is written.** Documentation infrastructure prevents platform-unaware design decisions.

8. **Products stay separate; infrastructure converges.** No product mergers. Federation under shared platform.

9. **CPMI's governance record conditions (Session 0A) are satisfied.** Named product owner assigned. Stage 3 may proceed.

10. **ARIA Suite's governance record conditions (Session 0A) are satisfied.** Named product owner assigned. ARIA Suite development may continue.

---

## Part 5 — Problems Encountered and How They Were Resolved

### Problem 1: Context Degrades Across Sessions
**What happened:** Multi-session builds lose architectural coherence. Decisions made in Session 1 are contradicted in Session 3 because they weren't in context.
**Resolution:** Mandatory handoff documents at end of every session. Four-step session pattern. The handoff document is the project's memory — never skip it.

### Problem 2: Products Built Without Platform Awareness
**What happened:** Products designed before SOVEREIGN existed. Each was solving its own logging, governance, and audit trail problems independently.
**Resolution:** SOVEREIGN Platform Integration Brief v1.3 as mandatory context in every session. Standing constraint embedded in every SCD. Session 0 produces briefs before Stage 1 begins.

### Problem 3: AI Absence Attestation Gap
**What happened:** ARIA deliberately excludes AI but CPMI-VRS appeared not to apply — creating a governance blind spot.
**Resolution:** CPMI-VRS Gate 1 applies as AI-absence attestation. States `model: none` and names the human decision-maker. This is stronger governance evidence.

### Problem 4: API Failure Handling Omitted
**What happened:** Architecture documents didn't specify what happens when Claude API fails.
**Resolution:** Three-tier fallback (live → cached → static) is now a hard requirement. Built in the same session as the feature. "We'll add it later" never happens.

### Problem 5: ngrok URL Instability
**What happened:** ngrok URLs change between sessions — breaks OAuth flows.
**Resolution:** Use fixed-domain ngrok or rebuild OAuth state on session start. Do not design features that depend on ngrok URL persistence.

### Problem 6: Shared Entity Schemas Defined Inconsistently
**What happened:** NEXUS, CPMI, APEX each defined their own versions of "program" and "employee" with slightly different field names.
**Resolution:** Canonical data dictionary in architecture.md. All products must use these definitions. Field name divergence is an architectural violation.

### Problem 7: CPMI No Named Owner (Resolved Session 0A)
**What happened:** CPMI-VRS elevation (Stage 3) blocked without named owner with cross-portfolio authority.
**Resolution:** Project Principal named as CPMI Product Owner in Session 0A. Stage 3 is now unblocked. This is a permanent governance record.

### Problem 8: ARIA Suite No Named Owner (Resolved Session 0A)
**What happened:** ARIA Suite development blocked without named owner.
**Resolution:** Project Principal named as ARIA Suite Product Owner in Session 0A. Development continues. This is a permanent governance record.

### Problem 9: Scope Creep in Build Sessions
**What happened:** Sessions trying to complete too many components at once produce unverifiable code.
**Resolution:** One component per exchange. State done condition before building. Wait for human confirmation before proceeding.

### Problem 10: Intelligence Layer Risk of Being Lost
**What happened:** IL concept introduced late in planning. Without explicit documentation, it risked being forgotten.
**Resolution:** IL documented in Build Plan, Integration Brief, every product insert, and this summary. Any agent working on any current product can find what it needs to expose.

### Problem 11: Deployment Architecture Uncertainty (Resolved May 2026)
**What happened:** No formal decision on whether SOVEREIGN would be a single app, multiple apps, or something in between. Different sessions made different implicit assumptions.
**Resolution:** Formal options analysis conducted and documented in SOVEREIGN Delivery Strategy v1.0. Option C approved. Shell architecture specification required before module development. Decision is a permanent governance record.

### Problem 12: Governance Records All Incomplete
**What happened:** All six products have named owners but no ISSO contacts, ATO boundaries, or retention schedules.
**Resolution:** Not yet fully resolved. Governance record completion is the highest-priority non-development action across the portfolio. Blocks ISSO engagement but not SOVEREIGN project entry. Must be completed before any real federal data enters any product.

---

## Part 6 — Project Schedule (from Delivery Strategy v1.0)

| Stage | Name | Duration | Effort | Status |
|---|---|---|---|---|
| S1 | SOVEREIGN Security Framework | 6–8 wks | ~120 hrs | **NEXT** |
| S2 | Framework Deployment — All 6 Products | 8–10 wks | ~160 hrs | Pending |
| S3 | CPMI-VRS Elevation to Portfolio Standard | 6–8 wks | ~100 hrs | Pending (unblocked) |
| S4 | AgentOS — Framework + CPMI-VRS Embedded | 6–8 wks | ~120 hrs | Pending |
| S5 | NEXUS Production Build | 10–14 wks | ~200 hrs | Pending |
| S6 | ARIA Suite — Known Issues + Production Hardening | 8–10 wks | ~160 hrs | Pending |
| S7 | APEX Production Build + Program Data Integration | 6–8 wks | ~100 hrs | Pending |
| S8 | FLOWPATH Production Build | 6–8 wks | ~100 hrs | Pending |
| S9 | Integration Testing — Full Pipeline | 6–8 wks | ~120 hrs | Pending |
| S10 | Intelligence Layer — Design + Data Validation | 8–10 wks | ~140 hrs | Pending |
| ATO | ATO Track (parallel) | 6–18 mos | Gov-driven | In planning |

**Total:** 1,320–1,420 hours · 70–90 weeks calendar time

### Milestone Gates
- **Gate 1 — All Transition Builds Complete:** ✅ Satisfied as of May 2026
- **Gate 2 — Security Framework Installed:** All 6 products on live Logger, no stubs
- **Gate 3 — VRS Certificates Issued:** CPMI world model REST API live; all certificates issued
- **Gate 4 — AgentOS Platform Ready:** Framework + CPMI-VRS embedded as native modules
- **Gate 5 — Full Pipeline Integration Test Passing:** FLOWPATH VVR → ARIA compliance adjudication without manual intervention

---

## Part 7 — Broadly Applicable Lessons Learned

*(Lessons 1–10 carried forward from v1.0 project summary — see that document for full text)*

### Lessons 1–15 (From Prior Version — Preserved)

**Lesson 1:** Specify first. Define the V&V test before writing code. "Build the approval gate" is not a specification.

**Lesson 2:** Claude has no memory. The handoff document is the project. A project without handoff documents spends 20% of every session re-establishing context.

**Lesson 3:** One component, one confirmation, then proceed. Two broken components interacting produce symptoms that point to neither.

**Lesson 4:** Complete files, not fragments. Never diffs, patches, or "add this here" instructions. Complete files are clear, testable, unambiguous.

**Lesson 5:** Build fallbacks in the same session as the feature. Three-tier fallback (live → cached → static). "Later" does not come.

**Lesson 6:** Claude is confidently wrong at predictable times — underspecified problems, near-context-limit, thin training domains. The signal is "this solution seems too simple." Trust that signal and push back.

**Lesson 7:** Define out-of-scope explicitly. Name what you are not building. Out-of-scope lists prevent features from sneaking in as convenient asides.

**Lesson 8:** The system prompt is a living versioned document. Outdated system prompts cause Claude to build against wrong constraints. Version it like code.

**Lesson 9:** Platform awareness must be structural, not remembered. The standing constraint cannot be something the developer remembers to mention. It must be loaded as a document.

**Lesson 10:** Test on real hardware with real data. Simulator testing is necessary but not sufficient. Real GPS, real cell signal dropouts, real OAuth token expiry only appear on real hardware.

**Lesson 11:** Security features are safety features. A safety feature that fails silently in the failure scenario it was designed for is worse than no feature.

**Lesson 12:** Governance documentation is not the last step — it is the first. In federal contexts, products that are more compliance-capable than their documentation reflects cannot be deployed.

**Lesson 13:** Role separation is a design constraint, not a checkbox. Who can read, write, and approve must be in the data model from the start.

**Lesson 14:** The intelligence layer of every system is its data model. SOVEREIGN's long-term value is its data — human decision events, deployment feedback, reasoning traces. Design data models for their downstream consumers from the start.

**Lesson 15:** Production-grade means three things beyond "it works" — failure handling, observability, and maintainability by the next developer without access to original conversations.

### Lessons 16–25 (FLOWPATH and ARIA — Preserved)

**Lesson 16:** Sandbox constraints are architectural — learn them before you code. Claude artifact `localStorage` exists but doesn't work. Tailwind bracket syntax fails silently. These are facts, not bugs.

**Lesson 17:** Data constants outside the component, always. Data inside `App` causes re-evaluation on every render. All data constants belong at module level.

**Lesson 18:** Identity color vs. semantic color is the most important design system discipline. Corporate purple is for structural framing only. Using it to signal functional states makes the UI unreadable.

**Lesson 19:** Fix known issues before adding features. Known issues compound. Every version's first session must resolve prior known issues.

**Lesson 20:** The Domain Translator pattern is bigger than one product. It solves a problem that exists in multiple contexts. When a component solves a problem that appears in multiple products, it belongs in the shared platform.

**Lesson 21:** Structural replacement is stronger than disabled buttons. When a control matters, make it impossible to violate, not hard to violate.

**Lesson 22:** Policy-as-data makes systems context-agnostic. Rules in typed data structures evaluated by pure functions are inspectable, testable, replaceable. Rule logic embedded in code is expensive to adapt.

**Lesson 23:** Reasoning chains at point of decision prevent approver errors. Self-documenting systems at the moment of decision are a design requirement, not a nice-to-have.

**Lesson 24:** Boundary conditions in synthetic data prove deterministic precision. Every compliance system's synthetic dataset should include records at each numeric threshold boundary.

**Lesson 25:** Recurrence detection needs a rolling window, not a counter. Define the window before building the detection logic.

### New Lessons — From Delivery Architecture and Transition Build Phase

**Lesson 26: Architecture decisions need formal documentation to survive session boundaries.** The deployment architecture was implicitly assumed to be different things in different sessions until a formal options analysis was conducted and a governance record was created. Any decision that affects more than one product or more than one session needs a written governance record. "We discussed this" is not a governance record.

**Lesson 27: Transition build assessments surface systemic issues that product-level review misses.** All six transition readiness assessments independently identified incomplete governance records. A per-product review might dismiss this as a product problem. Seeing it across all six simultaneously identifies it as a portfolio-level gap requiring a portfolio-level response.

**Lesson 28: Shell architecture specification is a governance document before it is a technical document.** The shell contract in Option C defines what every module depends on. Changing it after modules are built requires updates to every module. The specification must be approved before module development begins — not designed during module development.

**Lesson 29: Prototype-to-production migration paths must be documented during the prototype phase.** sql.js in APEX and single-file HTML in ARIA are appropriate for the prototype phase. They become technical debt if the migration path to production (PostgreSQL, server proxy, multi-file build) is not documented while the prototype is being built. Document the migration path in the same session that justifies the prototype approach.

**Lesson 30: The ATO track is a parallel track, not a blocking dependency.** Government ATO timelines are not development timelines. Development stages proceed; ATO preparation proceeds in parallel. Treating ATO as a development prerequisite would halt the project for 6–18 months waiting for a government review.

---

## Part 8 — Current Status of Accounts, Services, and Dependencies

| Service | Status | Notes |
|---|---|---|
| Anthropic API | Active | claude-sonnet-4-20250514 in use. Key must be entered by user — never stored in code. |
| Notion MCP | Active | CPMI Track B backend. Five linked databases. World model REST API not yet deployed. |
| Railway (APEX demo) | Live (pre-transition) | `apex2-demo-production.up.railway.app` — no auth, fictional data, pre-transition build. Update before next demo. |
| AWS GovCloud | Planned | Target for NEXUS production. No active account configured yet. |
| MLflow | Local only | File-based tracking at `MLFLOW_TRACKING_URI`. Not deployed to cloud. |
| M365 GCC High | Planned | NEXUS production integration. Endpoints: graph.microsoft.us, login.microsoftonline.us only. |
| EAMS SAML 2.0 | Planned | NEXUS authentication. Not yet configured. |

---

## Part 9 — Risks and Things to Watch Going Forward

**Risk 1 — Governance record gap (all six products)**
All six governance records are incomplete. This is the highest-priority non-development action. If real federal data enters any product before governance records are complete, the Governance Clock activates without a documented compliance posture. Priority: CRITICAL.

**Risk 2 — Shell contract stability**
Option C's value depends on the shell contract remaining stable after modules are built against it. If the shell contract changes after module development begins, every module requires an update. Mitigaton: treat the shell contract as a governance document; require Project Principal approval for any change.

**Risk 3 — FLOWPATH context window**
FLOWPATH is at ~1,350 lines in the Claude artifact environment. Adding v5.0 features without resolving the five known issues first will push it to a point where the artifact becomes unreliable. Mitigation: fix known issues before adding features; consider extracting data constants to separate initialization files.

**Risk 4 — ARIA Suite five known issues**
The ARIA transition session was documentation-only. Five known issues carry forward with no source file changes. The longer these remain unresolved, the more they interact with each other and with any new features. Mitigation: Stage 6 begins with issue resolution before any new capability work.

**Risk 5 — CPMI world model REST API not yet deployed**
APEX DOE-NORM-001 HOLD currently checks local portfolio status. The live inter-product dependency on CPMI's world model API is not yet wired. Mitigation: deploy REST API in Stage 3; `sovereignHold()` is designed to swap internals without call-site rewrites.

**Risk 6 — AgentOS evaluate.py never tested**
The four-gate verification chain has never been run end-to-end. The gates are designed to block, not warn. If a gate is broken, it may block all pipeline promotion without surfacing a useful error. Mitigation: run evaluate.py in the first SOVEREIGN session for AgentOS; expect gate failures on synthetic data.

**Risk 7 — Intelligence Layer training data accumulation**
The Judgment Detection component requires 12+ months of labeled HUMAN_DECISION training events before IL training can begin meaningfully. Every month the platform is not in production is a month of training data not being collected. Mitigation: get the Logger live (Stage 2) as early as possible; even synthetic data from prototype usage is better than nothing.

**Risk 5 — Human Review Volume Architecture Not Yet Designed (R1)**
At program or enterprise-scale production volume, the "human reviews outputs" governance model fails silently — reviewers clear queues to keep operations moving, not because they reviewed each item. The three-tier risk-stratified review architecture (risk tiers, statistical sampling methodology, automatic escalation thresholds) must be designed and documented before Stage 5, not discovered during it. The sovereign-shell review queue component is a Stage 1 design requirement. Priority: HIGH before Stage 5.

**Risk 6 — AI Provider Abstraction Layer Missing (R2)**
CPMI, FLOWPATH, and APEX call the Anthropic API directly. No abstraction layer. For GovCloud production deployment, Anthropic's commercial API endpoints are not within the GovCloud boundary — the LLM provider for the CUI tier is an open architectural decision that affects the Option C monorepo structure. This must be resolved before Stage 5. The sovereign-api-client shared package is a Stage 1 deliverable. Priority: HIGH — Stage 1 deliverable.

**Risk 7 — Agent Operator Role Undefined (R3)**
The Agent Operator — the human responsible for managing agent behavior at portfolio level, reviewing outputs at volume, and responding to Security Framework alerts — is not formally defined or assigned. The Project Principal currently performs this function informally. Stage 2 will route real P1 and P2 alerts. If the Agent Operator role is undefined when alerts go live, they go unresolved. The scope document and formal assignment must precede Stage 2. Priority: HIGH before Stage 2.

**Risk 8 — Federal Client Workforce Transition Unaddressed (R4)**
SOVEREIGN designs for the destination. Federal clients will spend 2–4 years in the transition state where agents are running but organizations have not changed. FLOWPATH pilots with real program offices will encounter resistance if the "you are mapping your own automation" dynamic is not explicitly managed. A Client Implementation Methodology document must exist before any client pilot. Priority: REQUIRED before first client pilot.

**Risk 10 — FLOWPATH Elicitation Methodology Gap (OWI-FP-001)**
FLOWPATH VVRs currently capture process as described, not necessarily process as practiced. Unofficial process — workarounds, exceptions that became norms, informal decision paths — is where operational knowledge lives and rarely surfaces in facilitated sessions. Automation built on official process descriptions fails on contact with operational reality. Dedicated session required before Stage 8 / first pilot. Priority: HIGH before first client pilot.

**Risk 11 — Cross-Product Failure Topology Not Mapped (OWI-INT-001)**
No systematic mapping exists of what happens when inter-product dependencies fail. An error introduced at FLOWPATH can propagate through four products before producing a visible symptom. Reconstruction requires tracing across multiple logs with no defined procedure. Dedicated session required. Stage 9 gate criterion: this map must exist. Priority: HIGH before Stage 9.

**Risk 12 — CPMI Norm Accuracy Validation Gap**
Until the Stage 3 Norm Accuracy Benchmark suite exists, norm-specific accuracy validation depends on Gate 3 reviewer expertise. A reviewer not expert in the specific norm being applied may attest to plausible reasoning they cannot fully evaluate. Mitigation: Norm Accuracy Benchmark is a named Stage 3 deliverable. Priority: MEDIUM — mitigated by Gate 3 but not eliminated until benchmark exists.

**Risk 13 — Tier 2 LLM Provider Unresolved**
Anthropic commercial API is not FedRAMP-authorized for CUI data. The Tier 2 LLM provider decision must be made before Stage 5. The sovereign-api-client abstraction makes it a configuration change — but the decision itself must precede the configuration. Priority: HIGH before Stage 5.

**Risk 9 — NEXUS ATO timeline**
NEXUS requires an ATO for program or enterprise-scale production deployment. ATO processing is government-controlled. If ATO preparation doesn't begin in parallel with development, the gap between "development complete" and "deployment authorized" could be 12–18 months. Mitigation: begin ATO package preparation in Stage 5; treat it as a parallel track from day one.

---
*SOVEREIGN Platform Project Summary v2.0 · May 2026*
*Pre-Decisional · Internal Working Document*
*Load in every session alongside system_prompt.md and Integration Brief v1.3*

**Lesson 31: Close architectural gaps before writing code, not after.** The three blocking gaps (Decision Matrix, Prompt Registry, Agent Identity) were identified before Stage 1 began and closed in Claude Chat sessions. If they had been discovered during Stage 2 or Stage 5, the cost of retrofitting would have been significant — Logger schema changes, prompt reorganization, and decision logic rewrites across multiple products simultaneously.

**Lesson 32: The Decision Matrix is a training data specification, not just a governance document.** The decision_type taxonomy in the Decision Matrix determines the labeling quality of the Intelligence Layer's Judgment Detection training corpus. Inconsistent labeling across products produces a noisy training dataset. The matrix is therefore a data quality requirement as much as a governance requirement.

**Lesson 33: Agent identity is a security architecture decision, not an administrative detail.** Defining agent_id as a required Logger field and establishing the agent registry before any Security Framework deployment means anomaly attribution works from day one. The alternative — adding agent identity after the Security Framework is live — would require updating every Logger call site across six products simultaneously.

**Lesson 34: External review of governance architecture should happen before Stage 1 code, not after.** The AI Stack Advisory Panel review identified architectural gaps — CPMI independent validation, cross-product failure topology, FLOWPATH elicitation methodology — that would have been expensive to retrofit if discovered after the products were built. A credible external review at design time costs two sessions. Discovering the same gaps in production costs months.

**Lesson 35: "No AI in the decision path" is an architectural claim that requires a precisely drawn boundary.** The claim is valuable and accurate for ARIA Suite at the execution layer. It must be stated with the qualifier "at the execution layer" to be complete. The design layer (rule authoring and maintenance) has different governance requirements — permissible AI assistance under documented conditions, not AI-free by design. Imprecise statements of this claim invite challenges that a precise statement would not.

**Lesson 36: A blocking mechanism without a designed override path is a single point of failure.** APEX's governance hold gate is correctly designed as a structural block. The override mechanism is equally part of the design — not an afterthought. The two-person rule for real hold overrides, the watermarking of reports generated under a hold, and the Agent Operator authority for system error overrides are the components that make the blocking mechanism governable rather than brittle.

**Lesson 37: Federal records requirements must be designed in, not retrofitted.** Every federal deployment of SOVEREIGN will produce federal records. The retention schedule fields, FOIA category mapping, AI draft preservation, and records management counsel engagement are pre-production requirements. Organizations that design records management into their systems have shorter federal procurement cycles than those that retrofit it.

---

## Session 1 Additions (June 2026)

### New Strategic Decisions (11–13)

**Decision 11 — Shell contract protocol scope.** Shell contract v1.0 defines MCP, A2A, and AG-UI as platform-level protocol boundaries. No module implements these independently. All three are Stage 2 implementations; the shell contract reserves the interfaces. Permanent governance record.

**Decision 12 — A2A approval behavior.** Platform default ACKNOWLEDGE_AND_CONTINUE. CPMI Gate 3 exception RE_EXECUTE. Encoded in CPMI's agent card. See session 1 handoff.

**Decision 13 — Agent Operator formally assigned.** Project Principal formally assigned as Agent Operator per Agent_Operator_Scope_SOVEREIGN.md v1.0. Temporary assignment — production scale requires review before first client pilot.

### New Lessons Learned (38–40)

**Lesson 38: Tests find real bugs that code review misses.** Three genuine bugs were caught by the Session 1 test suite — none were obvious in code review. The honeytoken registry last-entry-wins bug would have silently reactivated retired tokens. The np.bool_ cast would have caused incorrect downstream behavior. The YAML ${VAR} syntax would have falsely reported remote sink as configured. Write tests before declaring a component complete.

**Lesson 39: Governance documents expressed as TypeScript are more reliable than prose.** The shell contract defines types that are enforced at compile time. A prose document saying "every module must register its agents at mount" can be forgotten. A TypeScript interface with `agentCards: AgentCard[]` in `SovereignModuleContract` cannot be forgotten — the module won't compile without it.

**Lesson 40: Resolve open decisions at the moment they become blocking, not before.** The A2A approval behavior decision was deferred from Session 0 (correctly — nothing depended on it yet). It was resolved at the moment the shell contract was being written (correctly — the type system required a concrete value). Premature decision-making produces decisions that get re-made when context is clearer. Late decision-making blocks work. The right time is when the decision becomes blocking.

### New Problems (13–14)

**Problem 13: YAML ${VAR} syntax assumed to resolve environment variables.**
YAML does not natively resolve `${VAR}` syntax. The original config design used this syntax. At runtime it produces a literal string, causing remote_sink_configured to return True when no endpoint is configured. Resolved: all env var placeholders use null with a comment. Document this as a project-wide convention.

**Problem 14: NumPy type leakage from scikit-learn.**
IsolationForest.predict() returns np.int64, so `prediction == -1` produces np.bool_ not Python bool. Code that checks `is_anomalous is True` fails silently. Resolved: explicit `bool()` cast. Any future scikit-learn integration must check return types explicitly.

### Risk Updates

**Risk 7 — Agent Operator Role Undefined: CLOSED.** Agent_Operator_Scope_SOVEREIGN.md v1.0 produced June 1, 2026. Pending Project Principal approval. Upon approval this risk is eliminated.

**Stage 1 milestone:** Security Framework complete. 127 tests passing. Shell implementation remaining.

---

## Session 2B — sovereign-shell Scaffold (June 2, 2026)

### New Decisions (14–17)

**Decision 14 — Shell context frozen at eight exports.** `SovereignShellContext` exposes exactly auth, logger, governance, data, navigation, mcp, a2a, agui. No LLM client on the context — modules call `createSovereignClient()` directly. The shell imports neither provider client.

**Decision 15 — Role hierarchy is fail-closed, policy-injectable.** No total ordering over the seven roles. Module loader uses an injectable `RoleAccessPolicy`; default = exact match OR SYSTEM_ADMIN. Authoritative role→module matrix is a future governance artifact, injected as policy (not a rewrite). Confirmed by Project Principal.

**Decision 16 — Access-denial taxonomy gap recorded.** No Logger event type denotes module access denial; loader throws + audits internally. Adding an event type is a contract change.

**Decision 17 — Contract canonical home.** `shell-contract.ts` v1.0 copied byte-identical (SHA-verified) to `sovereign-shell/shell-contract.ts`. Both copies must stay identical.

### New Lessons Learned (41–43)

**Lesson 41: The compiler is the contract enforcer.** Building the shell as a strict TypeScript implementation of `shell-contract.ts` meant the eight-export rule, the module contract, and the frozen field names could not drift — every component was type-checked against the contract before it was declared complete. A prose spec would have permitted silent divergence.

**Lesson 42: Presentation must read the context, never re-derive it.** The governance dashboard reads `ctx.governance` (incl. `isOnHold()`) rather than computing hold state itself. This is what lets the Stage 3 swap to CPMI's live world-model API change zero UI code — the same discipline behind APEX's `sovereignHold()` stub-with-stable-signature.

**Lesson 43: Resolve a stub's behavior to match how wrong it can go.** `agui.humanAction()` throws (a human action must never be silently dropped) while `agui.emit()` is an inert no-op (a dropped reasoning event during render must not crash the module). The same "DEFINED" stage produced different stub behaviors because the failure modes differ.

### New Problems (15–16)

**Problem 15: No Logger event type for access denial.** The frozen `SovereignEventType` taxonomy has no member for "module access denied." Surfaced, not papered over — loader throws `ModuleAccessDeniedError`. Needs a governance decision (contract change) before access-denial events can be Logger-observable.

**Problem 16: `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md` absent from the working set — RESOLVED Session 2B.** Checklist item 2p was referenced in the Integration Brief governance set but not present on disk. Authored as v1.0 at Session 2B close — a synthesis of already-recorded material (Lessons 1–43, Problems 1–16, Decisions, Risks from this summary plus the handoffs), introducing no new facts. The document set is now complete (26/26). Keep the v1.0 current at each session close.

### Risk Updates

**Risk 8 — Shell↔module contract drift: MITIGATED.** The shell compiles strict against `shell-contract.ts`; the module contract is enforced at the type level. Residual risk is the two-copy contract (root + shell) diverging — controlled by the byte-identical + governance-change discipline.

**Stage 1 milestone: COMPLETE.** Security Framework (127 tests) + shell-contract v1.0 + sovereign-api-client (143 tests, R2 closed) + sovereign-shell scaffold (0 compile errors). R3 closed. Stage 2 begins in Claude Code.
