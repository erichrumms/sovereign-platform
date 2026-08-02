# SOVEREIGN Platform — SBOM Registry
## Version 1.46 · August 2, 2026

**Supersedes:** v1.45 (GD-31 Build Session 1 + NexusApp follow-on)
**Adds:** GD-32 Build Session 2 (SysAdmin Cost Dashboard)

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.25 | GD-31 Build Session 1 | Added optional `token_usage?` field to `SovereignLogEvent`. | `d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7` |
| **v1.25** | **GD-32 Build Session 2** | **Unchanged — no shell-contract modification needed. docs/32 §4 confirmed: no new server-side query method, no new surface, no new context export. Standing Constraint #7 (export count) holds at 14. SHA-256 unchanged.** | **`d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies** — `CostDashboardSection` is a pure computation
over `ctx.logger.getEntries()`, already available through the shell contract, with
client-side aggregation using only standard JS built-ins. No new library introduced.
Zero-new-production-dependency streak continues unbroken from Session 62 through
this session.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| GD-31 Build Session 1 (follow-on) | 1,813 | 149 (4 skip) | 195 | 2,157 | High |
| **GD-32 Build Session 2** | **1,818** | 149 (4 skip) | 195 | **2,162** | **High — full 14-package run at close; +5 convergence tests in module-workspace** |

---

## 4 — GD-32 Build Session 2 Component Changes

**Shell Contract** — v1.25, unchanged. No new export, no type change. Both copies
SHA-256 re-verified identical (unchanged from GD-31 Build Session 1 close).

**module-workspace/src/WorkspaceApp.tsx** — new "Cost Dashboard" tab added to
the Reviewer's Workspace:
- `Section` type widened: `WorkspaceModuleId | "activity" | "cost"`.
- `SECTION_ROLES.cost`: `["PLATFORM_ADMIN", "SYSTEM_ADMIN"]` — same two roles as
  VIGIL; matches docs/32 §3 placement decision.
- `SECTION_PRIMARY_ROLE.cost`: `"PLATFORM_ADMIN / SYSTEM_ADMIN"` — shown in
  disabled-tab tooltip for all other roles (honest `LockedSectionNotice`, same
  convention as docs/23 §3).
- `SECTIONS` and `SECTION_ORDER`: "Cost Dashboard" inserted between FLOWPATH
  Review and Activity & Decisions.
- `countFor.cost`: count of `AGENT_STEP_COMPLETE` events with `token_usage != null`
  in the current session buffer — shown as the tab badge.
- `renderSection()` switch: new `case "cost"` branch (exhaustiveness guard preserved;
  TypeScript would flag an unhandled Section member at the `assertHandled` default).
- `CostDashboardSection` component (new): reads `ctx.logger.getEntries()` — the same
  session-scoped in-memory buffer the Activity tab uses. Computes:
  - Running total: `input_tokens`, `output_tokens`, `estimated_cost_usd` from all
    `AGENT_STEP_COMPLETE` events where `token_usage != null`.
  - Per-product breakdown: aggregated `Map` keyed by `event.product`.
  - Per-agent breakdown: aggregated `Map` keyed by `event.agent_id`.
  - Fallback count: total `FALLBACK_ACTIVATED` events — shown as a distinct
    "wasted spend" row, never merged into the running cost total.
  - Session-scope disclosure banner: same `activityDisclosureStyle` and same wording
    pattern as the Activity & Decisions tab ("Session-scoped only: this buffer is
    in-memory and does not persist across page reloads…").
  - Coverage disclosure (green banner): states that all 10 in-scope
    `AGENT_STEP_COMPLETE` emission sites are instrumented (GD-31 Build Session 1),
    and that the 5 excluded sites do not call the model — affirmative, not a hedge.
- Six new style constants added (all local to WorkspaceApp.tsx): `costCoverageStyle`,
  `costBlockStyle`, `costHeadingStyle`, `costTableStyle`, `costThStyle`,
  `costLabelCellStyle`, `costNumCellStyle`, `costTotalRowStyle`, `costFallbackRowStyle`.

**module-workspace/tests/WorkspaceApp.test.tsx** — five new tests in new
`"WorkspaceApp Cost Dashboard (GD-32 / docs/32)"` describe block:
1. Tab gating: enabled for SYSTEM_ADMIN/PLATFORM_ADMIN, disabled with correct
   tooltip for COMPLIANCE_OFFICER, PROGRAM_MANAGER, ANALYST.
2. Session-scope disclosure: banner present with "session-scoped only" and
   "in-memory" text — same pattern as the Activity tab disclosure test.
3. Coverage disclosure: banner present with "GD-31" and "10 in-scope" text.
4. Empty state: shown when logSink is empty.
5. **Convergence test** (docs/32 §6 DC-6): seeds a logSink with 3 live
   `AGENT_STEP_COMPLETE` events (with `token_usage`), 1 fallback
   `AGENT_STEP_COMPLETE` (without `token_usage`), and 2 `FALLBACK_ACTIVATED`
   events. Asserts by direct calculation:
   - `cost-total-input` = 600 (100+200+300)
   - `cost-total-output` = 250 (50+80+120)
   - `cost-total-usd` = "$0.0060" (0.001+0.002+0.003)
   - `cost-total-steps` = 3 (live only; fallback step excluded)
   - `cost-fallback-count` = 2 (distinct row, not merged into cost total)
   - Per-product VIGIL row: input=300, output=130
   - Per-product NEXUS row: input=300, output=120
   - Per-agent `vigil-triage-agent`: 2 steps
   - Per-agent `nexus-router-agent`: 1 step (live only)

---

## 5 — Done Condition Verification (docs/32 §6)

1. **Tab gating** — new tab in Reviewer's Workspace, SYSTEM_ADMIN/PLATFORM_ADMIN
   only, with `LockedSectionNotice` for other roles. ✓
2. **Running-total, per-product, per-agent views** — computed from real
   `getEntries()` data; no placeholder figures. ✓
3. **Fallback/retry count** — distinct row labeled "wasted spend", never merged
   into cost total. ✓
4. **Session-scope disclosure banner** — same `activityDisclosureStyle`, same
   wording pattern as Activity & Decisions tab. ✓
5. **Coverage disclosure** — affirmative statement grounded in GD-31 facts:
   10 in-scope sites instrumented, 5 excluded sites don't call the model. ✓
6. **Convergence test** — seeds known events, asserts aggregates match direct
   calculation across totals, per-product, and per-agent dimensions. ✓

---

## 6 — Lineage and Audit Note

v1.46 extends v1.45's methodology unchanged: test count independently re-derived
(full 14-package run at close), not taken from any session self-report.

**GD-31 Build Session 2 is now complete. Both sessions of GD-31 are closed.**

---

*SOVEREIGN Platform — SBOM Registry v1.46 · August 2, 2026*
*Supersedes v1.45 (GD-31 Build Session 1) · Adds GD-32 Build Session 2*
*Pre-Decisional · Internal Working Document*
