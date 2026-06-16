# SOVEREIGN Platform — Agent Background and Lessons Learned
### Written to future SOVEREIGN build agents
Version 1.0 | June 2, 2026 (Session 2B)

**Provenance:** This document is a v1.0 **synthesis assembled from already-recorded material** — it introduces no new facts. Every lesson, decision, problem, and pattern below is drawn from `PROJECT_SUMMARY.md` (Lessons 1–43, Problems 1–16, Decisions, Risks), the Session 1 / 2A / 2B handoffs, `architecture.md`, and `system_prompt.md`. Where a point is compressed here, the cited source holds the full text. It was authored at Session 2B close to fill checklist item 2p (`AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`), which was referenced in the Integration Brief governance set but absent from the working directory (PROJECT_SUMMARY Problem 16). Keep it current at each session close.

**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Read This First — You Have No Memory

You are a build agent for the SOVEREIGN Platform and you have no memory between sessions. The governance and development documents ARE the project's memory. Before any other action, confirm your context package is loaded: Integration Brief (current version), `system_prompt.md`, the relevant product transition package, and the prior session handoff. Name each document explicitly. If a document you expect is missing, say so — do not proceed on assumption (that is exactly how 2p went missing; see Problem 16).

The single most expensive failure mode on this project is context loss across sessions (Problem 1). The handoff document is the antidote. Never skip it. Never run a partial End of Session Prompt.

---

## 2. What SOVEREIGN Is, and Why It Exists

SOVEREIGN began as "add security and governance to four prototypes (NEXUS, CPMI, APEX, FLOWPATH) and connect them to AgentOS." The reframe that created the platform: the right problem was not "add security to four apps" but "build the infrastructure that makes a portfolio of apps governable." Federal and enterprise buyers want software they can **trust, audit, and explain** — a platform with built-in security observability, a documented AI governance standard, and cross-product audit visibility is a categorically different offering than products with security bolted on.

Full name: *Governed Agentic Runtime with Integrated Security, Intelligence, and Oversight Networks* — chosen to map onto the Sovereign AI procurement language federal buyers already use.

**The pipeline (memorize):**
```
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
```
Every product's output is the next stage's input. Pipeline breaks require rewrites. Design every component with its pipeline position in mind.

**The seven products:** FLOWPATH (elicit), CPMI (govern, enhanced tier), AgentOS (orchestrate — infrastructure, not user-facing), NEXUS (report/correspondence), APEX (analytics/reporting), ARIA Suite (comply — deliberately no AI in decision path), and the **Intelligence Layer** (future seventh product — five components; NEVER lose or deprioritize it; every current product already exposes the fields it will consume).

---

## 3. The Frozen Things (Never Change These)

- **Option C** — Unified Shell + Module Applications. Permanent governance record. Not re-opened (Decision 6; Delivery Strategy v1.0).
- **Frozen IL exposure fields** — `workflow_step_id`, `decision_type`, `deployment_feedback`, `classification_level`, and the VVR export schema `{step_id, description, inputs, outputs, decision_required, human_role}`. Never rename, never restructure. They are a contract with the future Intelligence Layer.
- **Canonical data dictionary** — Employee, Program, Cost Code, Document, Vendor have exact field names. Field-name divergence is an architectural violation (Problem 6).
- **`shell-contract.ts` v1.0** — governance document expressed as TypeScript. Eight context exports (auth, logger, governance, data, navigation, mcp, a2a, agui), `SovereignModuleContract`, three reserved protocol boundaries. Any change = governance decision + version increment + changelog + six-module impact assessment (Decision 18; Risk 2). The canonical copy lives at `sovereign-shell/shell-contract.ts`, byte-identical to the root copy (Decision 17/26).
- **Decision Matrix zones, Prompt Registry structure, Agent Identity Standard (`agent_id`)** — standing constraints since Integration Brief v1.3.

---

## 4. How To Work Here (The Session Protocol)

1. **Open** — confirm all context documents loaded; name each.
2. **State the done condition** — specific, testable, not aspirational. Wait for Project Principal approval before any build work.
3. **One component per exchange** — build it, type-check/test it, report what was built and what was not, wait for confirmation, then proceed. Never batch components (Problem 9, Lesson 3).
4. **Close with the handoff** — and run the full End of Session Prompt (produce the complete document set).

Supporting disciplines: complete files, never diffs (Lesson 4). Build the three-tier fallback in the same session as the feature, never "later" (Lesson 5, Problem 4). Every Logger call carries `workflow_step_id` — no exceptions. Define out-of-scope explicitly (Lesson 7). When a solution "seems too simple," that is the signal you are confidently wrong — push back, do not build through uncertainty (Lesson 6).

---

## 5. Architectural Patterns That Recur (Use These)

- **Stub-with-stable-signature.** Reserve the interface now, implement later, with zero call-site rewrites when the real thing lands. Examples: `SOVEREIGN_LOGGER_ENDPOINT` (null until Stage 2); APEX `sovereignHold()` (swaps to CPMI REST API internals later); the GovCloud `UNRESOLVED_PENDING_GOVCLOUD_DECISION` placeholder (R7 resolves to a config change); the shell's `mcp`/`a2a`/`agui` boundaries at `_stage: "DEFINED"`. Stage 2 connection must be configuration, not rewrite (Standing Constraint).
- **Three-tier fallback (live → cached → static).** Platform standard for every external dependency. The local/append-only tier is the durable source of truth; the remote tier self-heals and self-reports `FALLBACK_ACTIVATED`.
- **Policy-as-data / policy-injection.** Rules in typed structures evaluated by pure functions are inspectable, testable, replaceable (Lesson 22). The shell's `RoleAccessPolicy` is fail-closed by default and injectable so the authoritative role→module matrix replaces it with no code change (Decision 15/24).
- **Structural replacement over disabled buttons.** When a control matters, make it impossible to violate, not hard to violate — component replacement, not CSS/disable (Lesson 21; ARIA no-self-approval).
- **The compiler is the contract enforcer.** A governance rule expressed as a TypeScript type cannot be forgotten — the module won't compile without it. Prefer types to prose for invariants (Lessons 39, 41).
- **Presentation reads the context; it never re-derives it.** The governance dashboard reads `ctx.governance.isOnHold()` rather than recomputing hold state — which is why the Stage 3 live-API swap touches zero UI (Lesson 42).
- **Stub behavior should match how wrong it can go.** `agui.humanAction()` throws (a human action must never be silently dropped); `agui.emit()` is an inert no-op (a dropped render-time event must not crash a module). Same stage, different failure modes, different stub behavior (Lesson 43).

---

## 6. Anti-Patterns (Avoid These)

- Building security, governance, audit, or anomaly detection **inside a product** — the platform provides these; replicating them is a Standing Constraint violation.
- Calling an LLM provider API directly from a product — all LLM calls go through `sovereign-api-client` via `createSovereignClient()`. Never instantiate `AnthropicClient`/`GovCloudClient` directly (Decision 23).
- Re-defining a shared entity with different field names (Problem 6).
- Deferring the fallback ("we'll add it later" never comes — Lesson 5).
- Premature OR late decisions — resolve an open decision at the moment it becomes blocking, not before, not after (Lesson 40).
- Treating a governance document as a refactor. Changing `shell-contract.ts` is a governance event, not a code cleanup.
- Inventing a Logger event type, role ordering, or taxonomy member that the approved governance does not authorize. Surface the gap; do not paper over it (Problems 15, 16; Decision 16/25).
- Designing features that depend on ngrok URL persistence (Problem 5).

---

## 7. The Lessons, Consolidated (full text in PROJECT_SUMMARY.md)

**Specification & process (1–9, 26–28, 31):** Specify the V&V test before code. Claude has no memory — the handoff is the project. One component, one confirmation. Complete files, not fragments. Fallbacks in the same session. Out-of-scope is explicit. The system prompt is versioned like code. Platform awareness must be structural (loaded), not remembered. Architecture decisions affecting >1 product or >1 session need a written governance record ("we discussed this" is not one). The shell spec is a governance document before it is a technical one — approve it before module development. Close architectural gaps before writing code, not after.

**Security, governance, records (11–13, 33, 36, 37):** Security features are safety features — silent failure in the designed-for scenario is worse than no feature. Governance documentation is the first step, not the last. Role separation belongs in the data model from the start. Agent identity (`agent_id`) is security architecture — establish the registry before Security Framework deployment so anomaly attribution works day one. A blocking mechanism without a designed override path is a single point of failure. Federal records requirements are designed in, not retrofitted.

**Data & the Intelligence Layer (14, 32):** The intelligence layer of every system is its data model — design for downstream consumers from the start. The Decision Matrix `decision_type` taxonomy is a training-data quality spec, not just governance: inconsistent labeling poisons Judgment Detection.

**UI / prototype discipline (16–25, 29):** Sandbox constraints are architectural facts, not bugs — learn them before coding. Data constants outside the component. Identity color vs. semantic color is the most important design-system discipline. Fix known issues before adding features. The Domain Translator pattern is bigger than one product — elevate cross-product patterns to the platform. Policy-as-data makes systems context-agnostic. Boundary-condition records in synthetic data prove deterministic precision. Recurrence detection needs a rolling window, not a counter. Document the prototype→production migration path while building the prototype.

**Validation & external review (10, 15, 30, 34, 35):** Test on real hardware with real data. Production-grade = failure handling + observability + maintainability by the next developer. The ATO track is parallel, not blocking. External governance review belongs at design time (two sessions) not post-build (months). "No AI in the decision path" is an execution-layer claim and must be stated with that qualifier.

**Build-phase findings (38–43):** Tests find real bugs code review misses (write tests before "complete"). Governance-as-TypeScript beats governance-as-prose. Resolve decisions when they become blocking. The compiler enforces the contract. Presentation reads the context, never re-derives it. Stub behavior should match its failure mode.

---

## 8. Decisions Not To Re-Debate

Option C (shell + module monorepo). Security Framework as a standalone shared library. CPMI-VRS as the portfolio-wide standard. CPMI enhanced monitoring (0.7× threshold — architectural, not configurable). AgentOS is infrastructure, not a product. ARIA deliberately excludes AI from decision paths (a feature). No-self-approval is structural replacement. The Intelligence Layer is the seventh product. The Decision Matrix zones are standing. The Prompt Registry is authoritative — no agent runs an unregistered prompt. The Agent Identity Standard governs every agent class. All data is currently SYNTHETIC; the Governance Clock has not activated. ATO is a parallel, government-controlled track.

Platform-build decisions of record: A2A approval behavior = `ACKNOWLEDGE_AND_CONTINUE` default, CPMI Gate 3 = `RE_EXECUTE` (Decision 19). YAML `${VAR}` is a literal string — env placeholders use `null` + comment (Decision 21; Problems 13–14). Shell context = exactly eight exports, no LLM client (Decision 23). Role policy is fail-closed and injectable (Decision 24).

---

## 9. Where Things Stand (as of Session 2B, June 2, 2026)

**Stage 1 — COMPLETE.** Security Framework (127 tests), `shell-contract.ts` v1.0 approved, `sovereign-api-client` (143 tests, R2 closed), `sovereign-shell` scaffold (compiles strict against the contract, 0 errors). R3 closed (Agent Operator Scope approved). Monorepo scaffold exists on the Mac Mini.

**Stage 2 — NEXT, in Claude Code.** Deploy the Security Framework across all six products; first real module mount via `ModuleLoader`; wire Logger emission pathways; advance `mcp`/`a2a`/`agui` `_stage` from `DEFINED`.

**Open obligations to carry:** R1 (human-review-volume architecture + shell review-queue component — not yet built, before Stage 5), R4–R9 per the Integration Brief, OWI-FP-001 / OWI-INT-001 dedicated sessions, all six governance records still INCOMPLETE (highest-priority non-development action), and the Session 2B governance items (role→module access matrix; access-denial taxonomy gap; `sovereign-data` package outstanding; esbuild dev-server advisory deferred to the pre-production Vite review).

**Standing reminders:** Get the Logger live as early as possible — every month not in production is a month of IL training data not collected (Risk 7). Complete governance records before any real federal data enters any product. Keep the Intelligence Layer in view in every session.

---
*SOVEREIGN Agent Background and Lessons Learned v1.0 · Session 2B · June 2, 2026*
*Synthesis of recorded material — see PROJECT_SUMMARY.md for full lesson/problem/decision text*
*Pre-Decisional · Internal Working Document*
