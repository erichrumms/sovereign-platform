# SOVEREIGN Platform — SBOM Session Update
## Version 1.81 · August 15, 2026

**Supersedes:** v1.80 (Session 112, August 13, 2026)
**Session:** 113 — Demonstration-surface defect correction
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.
No GD was raised this session (next GD remains GD-42). No shell-contract change.

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** No new agents registered.
**Prompts: 20 (19 approved + 1 pending) — unchanged.** No new prompts authored or approved.

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2053 | High — all 15 suites pass, real exit codes via `sovereign_session_verify.sh` |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2248** | **High** |

**Change from v1.80:** JS/TS 2050 → **2053 (+3)**. The three added tests are all in the new
`module-apex/tests/ppbe-site-breakdown.test.ts` (D2). No existing tests removed. Python unchanged
at 195.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.** No packages added or removed. Vulnerability posture
unchanged from v1.80.

---

## 5 — Changed Components (source — Build Agent close artifacts, not governance documents)

### module-apex/src/ppbe-site-breakdown.ts — D2 (commit `6a310d0`)

`siteStatus` gained an over-obligation case: `if (pct > 100) return "at_risk"`. A site obligating
beyond 100% of plan is no longer reported "on_track." The 135% seeded site (`SYNTH-SITE-A3`,
Tobyhanna/ALPHA) now flags `at_risk`. Interface doc-comment updated to state the new threshold set.

### module-apex/tests/ppbe-site-breakdown.test.ts — NEW (D2, commit `6a310d0`)

3 tests. Asserts the 135% site is `at_risk` (fails without the fix), that all over-obligated sites
flag, and a regression guard that 80–100% sites stay `on_track`.

### module-vigil/src/approval-port.ts — D3 (commit `b9a1ca7`)

Three synthetic AgentOS approval-request ids changed from dash to dot form:
`agentos.deployer` / `agentos.exporter` / `agentos.configurator`, matching the canonical registry
and the AgentOS AgentCards. No test changes required.

### sovereign-shell/src/main.tsx — D4 (commit `b97e96b`)

`DEV_PERSONA_NAMES.SYSTEM_ADMIN`: `"Platform Developer"` → `"Dev — System Admin"` for consistency
with every other persona label. No snapshot change.

---

## 6 — Reported, Not Fixed (scope discipline — see Session 113 Handoff)

- **D1:** program-count inconsistency is a real PPBE-seed vs World-Model dataset split plus a
  dedup-vs-raw filter difference. Recommend on-screen disclosure over a code change; correct GD-40.
- **D2 / Rule 12:** `statusFromObligationRate` (`ppbe-dashboard.ts`) carries the same
  missing-upper-bound gap; ECHO 104% shows "On Track" on Home. Not changed — beyond D2's named
  site surface; recommend as an authorized Screen-1 change.
- **D3:** `module-agentos/src/agent-dispatcher.ts` still holds a dashed copy of the three agent
  ids (separate surface; no runtime break).

---

## 7 — Governance Documents Placed This Session

None. No Integration Brief, spec, or other governance document was authored or placed. Only Build
Agent close artifacts (this SBOM update, the Session 113 Handoff) were committed. `PLACEMENT_LOG.tsv`
unchanged.

---

*SOVEREIGN Platform — SBOM Session 113 Update v1.81 · August 15, 2026*
*Supersedes v1.80 (Session 112) · Pre-Decisional · Internal Working Document*
