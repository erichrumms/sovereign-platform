# SOVEREIGN Platform — Session 14 Handoff
## Claude Code → Project Principal → Claude Chat
## June 24, 2026 — AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Prepared by:** Claude Code (code environment) at Session 14 close.
**Mode:** Autonomous — built D0 → D1 → D2 and closed without Project Principal approval, within scope. **Read §6 (Findings) — several spec ↔ codebase reconciliations were required.**

---

## 1. Session Outcome

Session 14 built the **classification boundary (GD-10)**, the **shell-contract v1.7 / GD-9**
change, and the **AgentOS module** (scaffold + task lifecycle core). All three deliverables
complete, committed separately, pushed.

| Deliverable | Result |
|---|---|
| **D0 — Classification Boundary (GD-10)** | Complete — `ClassificationNotAuthorizedError` + `AUTHORIZED_CLASSIFICATIONS` (UNCLASSIFIED only) in `sovereign-api-client`. `selectProvider()` throws for CUI/SECRET/TOP_SECRET; `routedComplete()` propagates (does not swallow) the error. Session 13 Ollama/CUI route retained as latent architecture. No shell-contract change. |
| **D1 — Shell Contract v1.6 → v1.7 (GD-9)** | Complete — +7 `AGENTOS_*` `SovereignEventType`, +2 `HumanDecisionType` (`TASK_APPROVAL`, `TASK_CANCELLATION`). Both copies SHA-identical at v1.7. `@sovereign/data` propagated 13 → 15 + test (Constraint #11). |
| **D2 — AgentOS Module** | Complete — `module-agentos` workspace package: 8-status task lifecycle state machine, `useTaskRegistry` (Gate-2 fail-closed), synthetic dispatcher with GD-10 enforcement, AgentOS-side VIGIL approval port (closes the Session 10 loop), tabbed UI, PLATFORM_ADMIN gate, mounted via `register-modules.ts`. 56 tests. |

**No live connections. Governance Clock OFF. All data SYNTHETIC/UNCLASSIFIED. No new agents/prompts.**

---

## 2. Shell Contract v1.7 — Hash of Record

```
shell-contract.ts (both copies) — SHA-256:
07f4852410390d937d18bdcbde5511c25f6896487452bbe0cef8e55c79060634
```
- Previous (v1.6): `99e47b10…01c8af` (retired).
- Both copies `diff`-identical, verified at v1.7 before D2 and again at close.
- GD-9 changelog in both copies. Seven event types + two decision types added.

---

## 3. Verification (Session-Close Battery)

| Check | Result |
|---|---|
| JS test suite | **715 passed** (data 43 · api-client 174 · counsel 91 · scribe 122 · vigil 113 · lens 58 · cpmi 58 · **agentos 56**) |
| Python | **127 passed** |
| **Total** | **842 tests** (was 779 — **+63**) |
| `tsc --noEmit` | clean — `sovereign-shell`, `module-agentos`, `sovereign-api-client` |
| `npm audit --omit=dev` | **0 vulnerabilities** |
| `shell-contract.ts` (both copies) | SHA `07f48524…060634` — identical at v1.7 |

`sovereign-api-client` 167 → 174 (+7, D0). `module-agentos` new (+56, D2). All other suites unchanged.

---

## 4. GD-10 — Classification Boundary (the most consequential change)

`sovereign-api-client` now enforces **UNCLASSIFIED-only processing**:

| `data_classification` | Behavior |
|---|---|
| `UNCLASSIFIED` (or absent) | Routes to Anthropic (Provider A), three-tier fallback as before. |
| `CUI` / `SECRET` / `TOP_SECRET` | **Throws `ClassificationNotAuthorizedError`** — message: *"This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator."* The error propagates to the caller. |

The Session 13 CUI→Ollama routing is **retained but latent** — it reactivates by configuration
when a governance decision widens `AUTHORIZED_CLASSIFICATIONS` (Constraint #3). AgentOS dispatch
reuses this boundary (no divergent copy of the rule) — a task above UNCLASSIFIED cannot be
dispatched.

---

## 5. AgentOS Task Lifecycle (D2)

8 statuses, 7 transitions (spec §3.2), each emitting its GD-9 event with the task
`workflow_step_id` (`agentos-task-<taskId>`):

```
CREATED → ASSIGNED → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETE
                           ↓
                        REJECTED → CANCELLED        (Any non-terminal → CANCELLED)
```

- **Human transitions** (APPROVED / REJECTED / CANCELLED) carry `actor:"human"` + `decision_type` (Constraint #4): APPROVED/REJECTED → `TASK_APPROVAL`, CANCELLED → `TASK_CANCELLATION`.
- **Agent transitions** (ASSIGNED / PENDING_APPROVAL / IN_PROGRESS / COMPLETE) carry `actor:"agent"` + `agent_id`, no `decision_type`.
- **Gate-2 fail-closed:** the Logger event is emitted before the state changes; a failed emit blocks the transition.
- **VIGIL loop closed:** `module-agentos/src/approval-port.ts` implements VIGIL's injectable `AgentApprovalPort` (`listPending`) + the AgentOS `submitRequest` / `getDecision` / `recordDecision`. VIGIL injects this where it used `createDevApprovalPort` — no VIGIL rewrite (Constraint #3).

---

## 6. Findings — Spec ↔ Codebase Reconciliations (autonomous: surfaced, not stopped)

1. **VIGIL port shape.** The architecture sketch (11_AgentOS §3.5) shows the port as
   `{ submitRequest, getDecision }`. VIGIL's ACTUAL injectable interface
   (`module-vigil/src/approval-port.ts`) is `AgentApprovalPort = { listPending }`.
   `AgentOSApprovalPort` implements VIGIL's real interface AND adds the AgentOS-side
   submit/poll methods — both shapes honored. The port is pure data plumbing;
   `AGENTOS_APPROVAL_REQUESTED` is emitted once by the task registry on the
   ASSIGNED → PENDING_APPROVAL transition (single source), not by the port.

2. **`agentCards` is empty (Constraint #10).** AgentOS orchestrator agents are NOT in
   `Agent_Identity_Standard.md` (only the 3 CPMI + 7 companion agents are). Claude Code
   does not self-register agents, so `module-agentos.agentCards = []`. The dispatcher's
   synthetic roster (`agentos-deployer` / `-exporter` / `-configurator`, matching VIGIL's
   Session 10 seeds) is dev dispatch-target data, not registration. **For Claude Chat:**
   register AgentOS orchestrator agents in `Agent_Identity_Standard.md`, then a follow-up
   session adds their `AgentCard`s here.

3. **`requires_approval = false` tasks stop at ASSIGNED.** The spec's 7-transition table
   has no `ASSIGNED → IN_PROGRESS` edge; Session 14 does not invent one (non-approval
   execution = real agent execution, explicitly §7 future work). Such tasks are
   assignable and cancellable; the demonstrable happy path uses `requires_approval = true`.

4. **GD-10 supersedes Session 13's CUI fallback.** Under GD-10 a CUI request throws at
   `selectProvider` before reaching the Ollama path or `isClassificationFallback` — both
   are now latent. The Session 13 routing tests (`test_routing` / `test_routed_inference`)
   were rewritten: CUI/SECRET/TOP_SECRET throw; the "never throws" guarantee of
   `routedComplete()` now holds **only for authorized (UNCLASSIFIED) traffic**.

5. **REJECTED `decision_type`.** Only `TASK_APPROVAL` / `TASK_CANCELLATION` were added
   (GD-9). A rejection is the negative of the human approval decision, so it carries
   `decision_type: TASK_APPROVAL` (the event type / outcome distinguish approve vs reject)
   — mirroring how VIGIL uses one `AGENT_APPROVAL` for approve/reject/escalate.

6. **Approval-request `workflow_step_id`.** AgentOS sets the submitted
   `AgentApprovalRequest.workflow_step_id` to the **task's** id (`agentos-task-<taskId>`)
   rather than VIGIL's `vigil-approval-<requestId>` convention, so AgentOS's lifecycle
   events and the request it submits share one audit id end-to-end (Constraint #6). It is
   a plain string field VIGIL consumes as-is — no breakage.

None of these blocked the build — D0, D1, D2 are complete and green.

---

## 7. Update Flags for Integration Brief (next version)

1. **GD-10 recorded** — UNCLASSIFIED-only processing; `ClassificationNotAuthorizedError` in `sovereign-api-client`. CUI/SECRET/TOP_SECRET infrastructure is demonstrable architecture, gated off.
2. **shell-contract v1.7** (GD-9) — record hash `07f48524…060634`; +7 `AGENTOS_*` event types, +2 `HumanDecisionType`.
3. **`module-agentos` is the 6th primary product to land in code** (after CPMI) — scaffold + task lifecycle core; PLATFORM_ADMIN gate; mounted. `agentCards` empty pending agent registration.
4. **VIGIL Agent Approval loop closed** from AgentOS's side — VIGIL's injectable port now has a live AgentOS implementation (no VIGIL rewrite).
5. **`@sovereign/data` HumanDecisionType 13 → 15** (synced v1.7).
6. Test totals **842** (715 JS + 127 Python). Governance Clock OFF.
7. **Governance to-dos:** register AgentOS orchestrator agents (Finding #2); decide whether `requires_approval=false` tasks need a non-approval execution path (Finding #3); decide the trigger/criteria for widening `AUTHORIZED_CLASSIFICATIONS` beyond UNCLASSIFIED (GD-10 lift).

---

## 8. Repo State at Close

- Branch `main`, pushed to `origin`.
- Commits this session: **D0 (GD-10 boundary)**, **D1 (shell-contract v1.7 / GD-9)**, **D2 (AgentOS module)**, **docs (this handoff + SBOM update)**.
- `shell-contract.ts` v1.7 · SHA `07f48524…060634` · both copies identical.
- SBOM update: `SBOM_Session14_Update.md` (this commit).

---

*SOVEREIGN Platform · Session 14 Handoff · June 24, 2026 · Autonomous Session · Pre-Decisional · Internal Working Document*
