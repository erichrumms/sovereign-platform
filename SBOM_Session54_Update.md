# SBOM — Session 54 Update
## Walkthrough G Build Session 1 · July 22, 2026

**Session:** 54
**Scope:** WG-1, WG-2, WG-3, WG-4, WG-5, WG-12, WG-13 (Findings Report,
`docs/SOVEREIGN_Walkthrough_G_Findings_Report_20260721.md`).
**Shell contract:** v1.22 — **unchanged**. SHA-256 (both copies, verified at close):
`28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443`

---

## 1 — New Components (exact paths as built)

| File | Purpose |
|---|---|
| `module-vigil/src/vigil-approval-session.ts` | Session-persistent shared approval-queue store (WG-1/WG-5/WG-13) |
| `sovereign-shell/src/startup-publish.ts` | Eager cross-module surface publication at shell start (WG-1) |
| `sovereign-shell/src/raw-import.d.ts` | Shell-workspace `*.md?raw` ambient declaration (pre-existing tsc gap, Handoff F1) |
| `e2e/tests/raw-import.d.ts` | e2e-workspace `*.md?raw` ambient declaration (same gap) |
| `module-vigil/tests/vigil-approval-session.test.ts` | Store unit tests (6 tests) |
| `e2e/tests/startup-publish-convergence.test.ts` | WG-1 surface-population convergence tests (4 tests) |
| `e2e/tests/home-dashboard-startup.test.tsx` | Fresh-session PlatformHome + WorkspaceApp render tests (3 tests) |

## 2 — Changed Components

| File | Change |
|---|---|
| `module-vigil/src/approval-contract.ts` | + `SOF_APPROVAL_SYSTEM`, `EXPIRY_SWEEP_INTERVAL_MS`, `agentActionExpiredEvent()` (single event-shape source, WG-5) |
| `module-vigil/src/useApprovalQueue.ts` | Emits via the shared builder; `remove()`/`expireOverdue()` mirror into the session store (WG-13) |
| `module-vigil/src/VigilApp.tsx` | Queue seeded from the session store; live interval expiry sweep; notice wording (WG-5/WG-13) |
| `module-vigil/src/ApprovalQueue.tsx` | Removed unused `formatIso` import (pre-existing tsc error, Handoff F1) |
| `module-workspace/src/WorkspaceApp.tsx` | VIGIL section: store removal on decision + live expiry sweep (WG-5/WG-13) |
| `sovereign-shell/src/main.tsx` | Calls `publishModuleSurfacesAtStartup()` at host construction (WG-1) |
| `sovereign-shell/src/navigation/ModuleNav.tsx` | InfoBadge popover via `createPortal` to `document.body` (WG-2) |
| `module-apex/src/PPBEDashboard.tsx` | Codename key line (WG-3); explicit legend content renderer (WG-4, recharts-3 reconciliation); dependency detail table (WG-12) |
| `module-vigil/tests/VigilApp.test.tsx` | `beforeEach` session-store reset (test isolation) |
| `module-vigil/tests/VigilAppObligation.test.tsx` | `beforeEach` session-store reset (test isolation) |
| `module-apex/tests/PPBEDashboard.test.tsx` | + Session 54 block (3 tests: WG-3/WG-4/WG-12) |

## 3 — Packages / Agents / Prompts

- **Production packages:** no additions, no removals, no version changes.
- **Dev packages:** no additions. `npm audit --omit=dev`: 0 vulnerabilities (exit 0).
- **Agents:** 44 — unchanged. No agent identity added or modified.
- **Prompts:** 20 (19 approved + 1 pending) — unchanged. No prompt authored or run.
- **Shell-contract:** v1.22 unchanged; both copies SHA-identical (hash above).
- **Constraint #11 synced copies:** untouched (no taxonomy change this session).

## 4 — Test Counts (full explicit table; real exit codes checked directly)

| Suite | Tests | Result | Exit |
|---|---|---|---|
| @sovereign/data | 125 | passed | 0 |
| @sovereign/api-client | 175 | passed | 0 |
| @sovereign/shell | 14 | passed (14 snapshots) | 0 |
| @sovereign/module-counsel | 100 | passed | 0 |
| @sovereign/module-scribe | 220 | passed | 0 |
| @sovereign/module-vigil | 183 | passed | 0 |
| @sovereign/module-lens | 58 | passed | 0 |
| @sovereign/module-cpmi | 58 | passed | 0 |
| @sovereign/module-agentos | 89 | passed | 0 |
| @sovereign/module-nexus | 159 | passed | 0 |
| @sovereign/module-apex | 208 | passed | 0 |
| @sovereign/module-flowpath | 135 | passed | 0 |
| @sovereign/module-aria | 139 | passed | 0 |
| @sovereign/module-workspace | 19 | passed | 0 |
| @sovereign/e2e | 150 | 146 passed, 4 skipped (pre-existing live-key smokes) | 0 |
| **JS/TS total** | **1832** | 1828 passed, 4 skipped | 0 |
| Python (sovereign-security) | 195 | passed | 0 |
| **Platform total** | **2027** | **2023 passed, 4 skipped** | 0 |

Delta vs. Session 53: **+16 tests** (6 store, 4 startup convergence, 3 fresh-session
render, 3 APEX). `tsc --noEmit` exit 0 in all 15 workspaces (shell and e2e were
failing at session open — pre-existing, fixed this session; Handoff F1).

---

*SBOM Session 54 Update · July 22, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document · iCloud archival per Lesson 13*
