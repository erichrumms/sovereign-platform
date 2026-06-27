# SOVEREIGN Platform — SBOM Session 20 Update
## To be merged into SBOM_Registry by the Governance Agent
## June 26, 2026 · Stage 5b — FLOWPATH

**Classification:** Pre-Decisional · Internal Working Document
**Prepared by:** Claude Code at Session 20 close. Merge into the cumulative `SBOM_Registry`
(current merged: v1.20). Suggested merged version: **v1.21**.

---

## 1. Shell-Contract Version History — NEW ENTRY

| Version | GD | Date | SHA-256 | Change |
|---|---|---|---|---|
| **v1.13** | **GD-18** | **June 26, 2026** | `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569` | 10 FLOWPATH SovereignEventType members; WORKFLOW_APPROVAL + VALIDATION_SIGN_OFF HumanDecisionType (16→18); AnalystWorkstyleProfile (+ 4 supporting types) exported. Additive only. |
| v1.12 | GD-16 | June 25, 2026 | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` | APEX event types + analysis schema. |

Both copies (`shell-contract.ts`, `sovereign-shell/shell-contract.ts`) SHA-256 verified identical at v1.13.

---

## 2. Governance Decision — GD-18 (RECORDED, EXECUTED)

**GD-18 — FLOWPATH event types + workstyle entity.** Pre-approved (Integration Brief v1.28),
executed Session 20 as D1. Impact: 10 new event types emitted only by `module-flowpath`; 2 new
HumanDecisionType members propagated to `sovereign-data` shared-types; 1 new exported user-scoped
type (`AnalystWorkstyleProfile`); no AgentClass change; no SovereignProduct change (FLOWPATH already
present since v1.0 — corrects the "10→11" expectation). Constraint #11 propagation complete across
all five synced copies (see Handoff §E). Python logger: APPROVED_EVENT_TYPES 65→75,
APPROVED_DECISION_TYPES 16→18.

---

## 3. Internal Workspace Packages — NEW

| Package | Version | Role | Tests |
|---|---|---|---|
| **@sovereign/module-flowpath** | 1.0.0 | FLOWPATH — workflow elicitation (pipeline entry point), Stage 5b | **52** |

Registered in root `package.json` workspaces and `sovereign-shell/src/register-modules.ts`. No new
production npm dependency (deps: @sovereign/api-client, @sovereign/data, react, react-dom).

---

## 4. Registered Agents — SIX FLOWPATH AGENTCARDS NOW ACTIVE

All six registered in `Agent_Identity_Standard.md` (commit `8f8ebed`) and activated as AgentCards in
`module-flowpath/src/index.ts`. All Analytical class, product FLOWPATH, UNCLASSIFIED ceiling (GD-10).

| Agent ID | Class | LLM-Backed | Status |
|---|---|---|---|
| `flowpath.coordinator` | Analytical | No (routing/state) | Active |
| `flowpath.interviewer` | Analytical | Yes (PR-FLOWPATH-001 org / PR-FLOWPATH-002 individual) | Active |
| `flowpath.mapper` | Analytical | Yes (structuring) | Active |
| `flowpath.validator` | Analytical | No (gate + boundary checks) | Active |
| `flowpath.analyzer` | Analytical | Yes (PR-FLOWPATH-004) | Active |
| `flowpath.domain-translator` | Analytical | No (vocabulary divergence) | Active |

**Registry reconciliation note:** the authoritative `Agent_Identity_Standard.md` held 15 entries
before `8f8ebed`; with the six FLOWPATH agents the true total is **21**. The Integration Brief's
"18 registered" is stale and should be corrected to 21 at merge (see Handoff §G.1).

---

## 5. Approved Prompts — FOUR FLOWPATH PROMPTS APPROVED IN CODE

| Registry ID | Agent | Mode | File | Status | Approved |
|---|---|---|---|---|---|
| PR-FLOWPATH-001 | flowpath.interviewer | organizational | prompts/org_elicitation_system.md | APPROVED | June 26, 2026 |
| PR-FLOWPATH-002 | flowpath.interviewer | individual workstyle | prompts/individual_elicitation_system.md | APPROVED | June 26, 2026 |
| PR-FLOWPATH-003 | flowpath.validator | completeness gate | prompts/completeness_gate_system.md | APPROVED | June 26, 2026 |
| PR-FLOWPATH-004 | flowpath.analyzer | workflow analysis | prompts/workflow_analysis_system.md | APPROVED | June 26, 2026 |

Total approved prompts: **14** (unchanged — the four FLOWPATH prompts were already counted in the
Brief; now marked APPROVED in the module CHANGELOG). PR-FLOWPATH-002 carries the verbatim analyst
trust statement (spec §5a Guarantee 1).

---

## 6. Test Totals (per suite + platform)

| Suite | Tests |
|---|---|
| sovereign-data | 43 |
| sovereign-api-client | 174 |
| module-counsel | 91 |
| module-scribe | 122 |
| module-vigil | 113 |
| module-lens | 58 |
| module-cpmi | 58 |
| module-agentos | 86 |
| module-nexus | 52 |
| module-apex | 97 |
| **module-flowpath** | **52** |
| e2e | 6 |
| **JS total** | **952** |
| Python | 142 |
| **Platform total** | **1094** |

`npm audit --omit=dev`: **0 vulnerabilities**.

---

## 7. New Data Dictionary Entity

| Entity | Classification | Status |
|---|---|---|
| `AnalystWorkstyleProfile` | user | LIVE (GD-18) — stored alongside StyleProfile; hashed analyst id, no admin read path |
| `OrganizationalVocabulary` | user | LIVE (module-flowpath) — calibration data, not World Model |
| `WorkflowArtifact` / `DataSourceRegistry` / `ValidationCadenceRecord` | (module-local) | LIVE (module-flowpath) |

---

*SOVEREIGN Platform · SBOM Session 20 Update · June 26, 2026 · Pre-Decisional · Internal Working Document*
