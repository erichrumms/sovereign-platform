# SOVEREIGN Platform — SBOM Update
## Version 1.62 · August 5, 2026

**Supersedes:** v1.61 (Session 94 — docs/36 citation-accuracy correction note; no code changes)
**Adds:** Session 95 — AGENT_REFERENCE.md v3.4 (Rules 11/12 formalized, Rule 13 renumbered,
Rule 14 explicitly unassigned, Rule 17 widened, phantom cross-reference removed); docs/36 and
root-level Router_Inspection_Audit_Process.md citation updates; fix for pre-existing
useTTIntake.test.tsx test-data-drift failure (nowIsoFn injectable in TTIntakePorts).
Zero new production dependencies. Shell-contract unchanged at v1.28.

---

## 1 — Session Summary

Session 95 had two workstreams:

1. **Governance rule formalization (D1–D8):** Implemented the Governance Agent's explicit,
   authorized decision resolving Session 94's three Committee Review Standard findings about
   unformalized rule principles. Edits to four governance documents; no production code.

2. **Pre-existing test-data drift fix:** Investigated and resolved the `useTTIntake.test.tsx`
   failure that had been re-flagged across Sessions 92, 93, and 95 without a root-cause
   finding. Determined to be test-data drift (fixed `travel_start_date` becoming too close
   to real current date). Fix: `nowIsoFn?: () => string` injectable added to `TTIntakePorts`;
   test injects a fixed date for deterministic lead-time calculation. Full root-cause
   Committee Review Standard finding in the Session 95 Handoff.

---

## 2 — Changed Components

| File | Change |
|---|---|
| `AGENT_REFERENCE.md` | v3.3 → v3.4. Rules 11 and 12 added (single-computation and root-cause-search-elsewhere principles). Former Rule 11 (shell-contract-bump parity reporting, Session 93) renumbered to Rule 13; content unchanged. Rule 14 added as explicitly unassigned. Phantom cross-reference in former Rule 11's closing paragraph removed. Version header and v3.4 changelog entry added. |
| `AGENT_REFERENCE_Addendum_20260730.md` | Rule 17 scope widened. Original governance-document application preserved. Added second application domain: monitoring agents and anomaly-detector thresholds, with distinct verification action. Scope-widening note added citing Session 94 Finding C and Session 95 as authority. |
| `docs/36_Router_Inspection_Audit_Process.md` | All rule citations updated to final numbers. Status paragraph: "Rule 11" references updated to "Rule 13" for shell-contract-bump citations. Relationship section: "Rules 11-14" → "Rules 11, 12, and 17". Session 94 note: past-tense corrected and resolution pointer added. Session 95 resolution note added. §6 steps 5 and 8: "Rule 13" → "Rule 17". §8: "Rules 11-14" → "Rules 11, 12, and 17". |
| `Router_Inspection_Audit_Process.md` | Root-level draft (predates docs/36). Same citation corrections applied: Relationship section, §6 steps 5 and 8, §8. |
| `module-nexus/src/useTTIntake.ts` | `nowIsoFn?: () => string` added to `TTIntakePorts` interface. `nowIso` constant derived from port (falls back to `new Date().toISOString()` when not injected). Three call sites in `submitTravel`, `previewTravel`, and `submitTime` updated from literal `new Date().toISOString()` to `nowIso()`. |
| `module-nexus/tests/useTTIntake.test.tsx` | `ports()` helper updated to inject `nowIsoFn: () => "2026-07-01T00:00:00.000Z"`. This gives 50 days of lead time to the fixed `travel_start_date: "2026-08-20"` — deterministic regardless of when the test runs. |

---

## 3 — New Components

| File | Type | Purpose |
|---|---|---|
| `SOVEREIGN_Session95_Handoff.md` | Session artifact | Full Committee Review Standard record of governance formalization; historical-document citation audit; test results |
| `SBOM_Session95_Update.md` | Session artifact | This file |

---

## 4 — Unchanged

- Shell-contract: v1.28 (no change)
- All production packages: no change
- All agent registrations: no change
- All prompt registrations: no change
- JS/TS test results: 2050 passing / 0 failed (module-nexus: 172 passed, 0 failed;
  e2e: 160 passed, 4 skipped, 0 failed; all other workspaces fully green)
- Python test results: 195 passing
- tsc --noEmit: all 15 workspaces exit 0

---

## 5 — Rule Registry (final state, Part II of AGENT_REFERENCE.md)

| Rule | Principle | Formalized |
|---|---|---|
| Rule 1 | The Integration Brief is always current in the repo | Prior to v3.0 |
| Rule 2 | The shell-contract hash must match before any build work begins | Prior to v3.0 |
| Rule 3 | The gather script must match the Integration Brief's context package | Prior to v3.0 |
| Rule 4 | A decision made outside the canonical conversation does not propagate on its own | Prior to v3.0 |
| Rule 5 | A claim that something is "in progress" is not evidence that it exists | Prior to v3.0 |
| Rule 6 | A Hard Stop is surfaced, never routed around | Prior to v3.0 |
| Rule 7 | Verify a test result by its exit code, never by reading truncated output | Prior to v3.0 |
| Rule 8 | Trace the actual path before applying a diagnosis, including your own | Prior to v3.0 |
| Rule 9 | A passing result must be checked for what it actually exercised | Prior to v3.0 |
| Rule 10 | Verify a file's actual content before committing it, not just before downloading it | Prior to v3.0 |
| **Rule 11** | **One fact, one computation (single-computation principle)** | **Session 95 (v3.4)** |
| **Rule 12** | **Root-cause search for same pattern everywhere** | **Session 95 (v3.4)** |
| **Rule 13** | Any session that bumps the shell-contract version must explicitly run and report the Workspace parity-test suite | Session 93 (formerly Rule 11); renumbered Session 95 |
| **Rule 14** | **[Deliberately unassigned]** | **Session 95 (v3.4)** |
| Rule 15 | Handoff descriptions must be written with the diff open (addendum, July 30, 2026) | Addendum |
| Rule 16 | A finding that de-risks a question ≠ a finding that answers it (addendum) | Addendum |
| Rule 17 | A tool's or safeguard's continued existence is not evidence of continued use (addendum, widened Session 95) | Addendum; widened Session 95 |

---

## 6 — Governance Items Closed This Session

| Item | Source | Resolution |
|---|---|---|
| Finding A — single-computation principle unformalized | Session 94 Handoff | Closed — Rule 11 formalized in AGENT_REFERENCE.md v3.4 |
| Finding B — root-cause-search principle unformalized | Session 94 Handoff | Closed — Rule 12 formalized in AGENT_REFERENCE.md v3.4 |
| Finding C — safeguard/tool existence principle gap (Rule 17 scope vs. "Rule 13") | Session 94 Handoff | Closed — Rule 17 scope widened to cover monitoring-agent safeguards |
| Rule 11 numbering collision (Session 93 formal Rule 11 vs. informal prior usage) | Session 94 Handoff | Closed — resolved by renumbering Session 93's Rule 11 to Rule 13 |
| Phantom cross-reference at former Rule 11 line ~1603 | Session 94 Handoff | Closed — cross-reference removed; Rule 11 (one fact, one computation) substituted |
| Pre-existing `useTTIntake.test.tsx` failure (Sessions 92, 93, 95 open item) | Session 95 Handoff Open Item 1 | Closed — test-data drift, not regression. `nowIsoFn` injectable added; test injects fixed "2026-07-01" baseline |

---

*SBOM Session 95 Update · August 5, 2026 · Build Agent*
*Zero new production dependencies · Shell-contract v1.28 · Code changes: useTTIntake.ts, useTTIntake.test.tsx (test-data drift fix)*
