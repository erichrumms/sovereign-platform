# SBOM Session 10 Update — SOVEREIGN Platform
## June 23, 2026 · merges into SBOM Registry

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 10 (D1 shell-contract v1.4 / GD-6,
D2 VIGIL Agent Approval Flow). For merge into the master SBOM Registry in Claude Chat.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** D2 is internal to `module-vigil`; D1 edits the
governance contract and its synced data-dictionary copy. `npm audit --omit=dev`:
**0 production vulnerabilities.**

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.3 → v1.4 (GD-6).** New SHA-256 `1a557e3ba3747ab8b922649a42602df8fa4aec16ace10d9eabd9f48acbb435d9` — both synced copies verified identical. Added 4 `SovereignEventType` members + `AGENT_APPROVAL` `HumanDecisionType`. |
| `@sovereign/data` shared-types | `HumanDecisionType` + `HUMAN_DECISION_TYPES` → **11 members** (synced `AGENT_APPROVAL`, Constraint #11). No package version bump (additive). |

---

## 3. New Source Components (`module-vigil`)

| File | Purpose |
|---|---|
| `src/approval-contract.ts` | `AgentApprovalRequest`, decision taxonomy, expiry (15/60/240 min), `workflow_step_id` invariant, `PR_VIGIL_002` binding, validation. |
| `src/approval-port.ts` | Injectable `AgentApprovalPort` + synthetic/dev backing (3 requests: P1 model-deploy / P2 data-export / P3 config-change). |
| `src/approval-engine.ts` | Three-tier brief (live → cache → static); static brief assembled from the request. |
| `src/useApprovalBrief.ts` | Brief hook — one `createSovereignClient()`/brief; `AGENT_STEP_*` Logger emission. |
| `src/useApprovalQueue.ts` | Queue load/sort (P1-first) + expiry → `AGENT_ACTION_EXPIRED` system event. |
| `src/useApprovalDecision.ts` | Approve/Reject/Escalate → `AGENT_ACTION_*` human decisions (`decision_type AGENT_APPROVAL`); Gate 2 fail-closed. |
| `src/ApprovalQueue.tsx`, `src/ApprovalDetail.tsx`, `src/ApprovalDecisionPanel.tsx` | The approval surfaces. |
| `src/prompts/approval-system.prompt.ts` | Runtime copy of PR-VIGIL-002. |
| `prompts/approval-system-v1.0.md` | PR-VIGIL-002 (APPROVED June 23, 2026). |

**Changed:** `src/VigilApp.tsx` (tabbed: Alert Queue + Agent Approval Queue),
`src/index.ts` (registers `vigil-approval-agent`), `prompts/CHANGELOG.md`.

**Superseded (retained):** `src/AgentApprovalQueue.tsx` (A2A-stage stub) — no longer
rendered by VigilApp; standalone test retained. Removable in a future cleanup.

---

## 4. Agent & Prompt Registry Delta

- **`vigil-approval-agent`** — implemented and registered (Monitoring,
  `ACKNOWLEDGE_AND_CONTINUE`). VIGIL now has 2 agents; the platform has 8 companion-suite agents registered.
- **PR-VIGIL-002** — APPROVED (June 23, 2026); runtime copy created. No other prompt changed.

---

## 5. Test Inventory

| Suite | Session 9 | Session 10 |
|---|---|---|
| sovereign-data | 36 | 36 |
| sovereign-api-client | 143 | 143 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 72 | **113** |
| module-lens | 58 | 58 |
| **JS total** | 522 | **563** |
| Python (sovereign-security) | 127 | 127 |
| **Total** | 649 | **690** |

---

*SBOM Session 10 Update · June 23, 2026 · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
