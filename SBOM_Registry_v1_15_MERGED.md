# SOVEREIGN Platform — SBOM Registry
## Version 1.15 | June 24, 2026
### Merged through Session 14

**Classification:** Pre-Decisional · Internal Working Document
**Base:** SBOM Registry v1.14 (through Session 13)
**Merged:** SBOM_Session14_Update.md (Session 14 — autonomous, D0 GD-10, D1
shell-contract v1.7 / GD-9, D2 AgentOS module)

---

## Package Inventory

| Package | Version | Tests | Status |
|---|---|---|---|
| `@sovereign/data` | 1.2.0 | 43 | HumanDecisionType → 15 members (GD-9 sync) |
| `@sovereign/api-client` | 1.0.0 | **174** | +7 tests D0 · GD-10 boundary enforced |
| `@sovereign/shell` | 1.0.0 | — | Unchanged |
| `@sovereign/module-counsel` | 1.0.0 | 91 | Unchanged |
| `@sovereign/module-scribe` | 1.0.0 | 122 | Unchanged |
| `@sovereign/module-vigil` | 1.0.0 | 113 | Unchanged |
| `@sovereign/module-lens` | 1.0.0 | 58 | Unchanged |
| `@sovereign/module-cpmi` | 1.0.0 | 58 | Unchanged |
| **`@sovereign/module-agentos`** | **1.0.0** | **56** | **NEW — Session 14** |
| `sovereign-security` (Python) | — | 127 | Unchanged |

---

## Shell Contract

| Artifact | Version | SHA-256 | Status |
|---|---|---|---|
| `shell-contract.ts` (both copies) | **v1.7** | **`07f4852410390d937d18bdcbde5511c25f6896487452bbe0cef8e55c79060634`** | Changed Session 14 (GD-9) |

**Previous (v1.6, retired):** `99e47b10…01c8af`

**v1.7 additions (GD-9):**
- `SovereignEventType`: `AGENTOS_TASK_ASSIGNED`, `AGENTOS_APPROVAL_REQUESTED`,
  `AGENTOS_TASK_APPROVED`, `AGENTOS_TASK_REJECTED`, `AGENTOS_TASK_STARTED`,
  `AGENTOS_TASK_COMPLETE`, `AGENTOS_TASK_CANCELLED`
- `HumanDecisionType`: `TASK_APPROVAL`, `TASK_CANCELLATION`
- `@sovereign/data` shared-types synced: 13 → 15 members

---

## Governance Decisions Recorded

| ID | Decision | Session |
|---|---|---|
| GD-9 | AgentOS task lifecycle events (shell-contract v1.7) | 14 |
| GD-10 | Classification boundary — UNCLASSIFIED only · CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError` | 14 |

---

## Classification Boundary (GD-10)

| `data_classification` | Behavior |
|---|---|
| `UNCLASSIFIED` (or absent) | Routes to Anthropic (Provider A) |
| `CUI` / `SECRET` / `TOP_SECRET` | Throws `ClassificationNotAuthorizedError` |

Routing infrastructure for CUI→Ollama is latent — activates when `AUTHORIZED_CLASSIFICATIONS`
is widened by formal governance decision.

---

## Agent Registry (11 registered — unchanged)

AgentOS orchestrator agents NOT YET registered (Constraint #10 — pending
`Agent_Identity_Standard.md` update). `module-agentos.agentCards` is empty.

---

## Test Totals — Cumulative

| Suite | S1–S13 | S14 | Total |
|---|---|---|---|
| sovereign-data | 43 | — | **43** |
| sovereign-api-client | 167 | +7 | **174** |
| module-counsel | 91 | — | **91** |
| module-scribe | 122 | — | **122** |
| module-vigil | 113 | — | **113** |
| module-lens | 58 | — | **58** |
| module-cpmi | 58 | — | **58** |
| module-agentos | — | +56 | **56** |
| **JS total** | 652 | +63 | **715** |
| Python | 127 | — | **127** |
| **Grand total** | 779 | +63 | **842** |

---

## Git History (Recent)

| Commit | Session | Description |
|---|---|---|
| `8df256c` | S14 | D0 — GD-10 Classification Boundary |
| `6f0899a` | S14 | D1 — Shell Contract v1.6 → v1.7 (GD-9) |
| `58e937d` | S14 | D2 — AgentOS Module |
| `82e5dbe` | S14 | docs — Session 14 Handoff + SBOM update |

**HEAD / origin/main: `82e5dbe`**

---

*SOVEREIGN Platform SBOM Registry v1.15 · June 24, 2026*
*Pre-Decisional · Internal Working Document*
