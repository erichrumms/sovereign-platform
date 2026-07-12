# SOVEREIGN Platform — SBOM Session 27 Update
## Time & Travel Phase I — entities, six agent scaffolds, prompt registration

**Date:** July 12, 2026
**Session:** 27
**Merge basis for:** SBOM Registry v1.28 (supersedes v1.27)
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Shell Contract — UNCHANGED

| Version | GD | SHA-256 | Status |
|---|---|---|---|
| **v1.15** | GD-20 | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` | **CURRENT — unchanged in Session 27** |

No Governance Decision this session (none pre-authorized beyond D-TT7 Option A and the
prompt approvals, both taken July 11 in Claude Chat). Both synced copies verified at this
hash at session open **and** close. The eleven TT event types are Python-Logger-only per
docs/17 §12 — deliberately NOT added to `SovereignEventType`.

**Hard Stop surfaced (not acted on):** `SovereignProduct` does not include `TIME_TRAVEL`,
which docs/17 §7/§15's VIGIL alert routing presumes. Decision required before Session 28
VIGIL wiring — see Session 27 Handoff §6.1.

## 2. Governance Decisions Applied (made outside this session, July 11, 2026)

- **D-TT7 — Option A:** D-TT3's six entities reaffirmed unchanged; built against as-is.
- **TT prompt approvals:** both drafting prompts approved; registered this session.

No filed decision record for either exists in-repo — flagged as housekeeping (Handoff §7).

## 3. New Components

| Component | Path | Notes |
|---|---|---|
| TravelPolicy entity + validator | `sovereign-data/src/entities/travel-policy.ts` | D-TT3; docs/17 §4 |
| TravelRequest entity + validator | `sovereign-data/src/entities/travel-request.ts` | D-TT3; docs/17 §5.1/§5.3 |
| TimeRecord entity + validator | `sovereign-data/src/entities/time-record.ts` | D-TT3; docs/17 §6 |
| ChargeAccount entity + validator | `sovereign-data/src/entities/charge-account.ts` | **extends CostCode** — not standalone |
| ComplianceFlag entity + validator | `sovereign-data/src/entities/compliance-flag.ts` | exports frozen `TIME_RULE_SEVERITY` map |
| CorrectionRecord entity + validator | `sovereign-data/src/entities/correction-record.ts` | D-TT3; docs/17 §6.2/§6.4/§11 |
| tt.travel-compliance-engine scaffold | `module-nexus/src/tt-travel-compliance-engine.ts` | deterministic; no LLM |
| tt.travel-router scaffold | `module-nexus/src/tt-travel-router.ts` | deterministic; below-authority routing structurally blocked |
| tt.time-compliance-engine scaffold | `module-apex/src/tt-time-compliance-engine.ts` | deterministic; ten-rule evaluation, frozen severities |
| tt.pattern-analyst scaffold | `module-apex/src/tt-pattern-analyst.ts` | deterministic; hashed employee IDs, informational-only |
| tt.audit-reporter scaffold | `module-apex/src/tt-audit-reporter.ts` | deterministic; session/period exports |
| tt.escalation-monitor scaffold | `module-vigil/src/tt-escalation-monitor.ts` | deterministic; stops at EscalationDecision boundary |
| TT prompt registry | `tt/prompts/CHANGELOG.md` | both prompts v1.0 APPROVED, registered |
| Tests (new files) | `sovereign-data/tests/tt-entities.test.ts`, `module-nexus/tests/tt-travel-engine.test.ts`, `module-apex/tests/tt-time-engine.test.ts`, `module-vigil/tests/tt-escalation-monitor.test.ts` | 78 new JS/TS tests |

## 4. Changed Components

| Component | Change |
|---|---|
| `sovereign-data/src/index.ts` | +6 entity exports; version 1.2.0 → 1.3.0 |
| `module-nexus/src/index.ts` | agentCards [] → 2 TT cards (host product NEXUS) |
| `module-apex/src/index.ts` | agentCards 2 → 5 (3 TT cards, host product APEX) |
| `module-vigil/src/index.ts` | agentCards 2 → 3 (1 TT card, host product VIGIL) |
| `sovereign-security/sovereign_logger.py` | `APPROVED_EVENT_TYPES` 84 → 95 (11 `TT_*`, Python-only) |
| `sovereign-security/test_sovereign_logger.py` | count assertion 84 → 95; +4 TT taxonomy tests |
| `tt/prompts/*.md` (both) | STATUS headers DRAFT → APPROVED v1.0 |
| Module index tests (nexus/apex/vigil) | card assertions extended for TT cards |

## 5. Test & Verification State

- **Platform tests: 1370** (1208 JS/TS + 162 Python) — up from 1288 (+82), all passing,
  counted per-workspace from live runs.
- `tsc --noEmit` clean across all 14 workspaces.
- 0 new dependencies added — no supply-chain delta. npm-dev-vulns posture unchanged
  (deferred to Stage 5+ Vite review, per standing decision).
- Agent registry: 44 (unchanged). Approved prompts: **16** (14 + 2 TT).

---

*SBOM Session 27 Update · July 12, 2026*
*Pre-Decisional · Internal Working Document*
