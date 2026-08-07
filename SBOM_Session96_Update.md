# SOVEREIGN Platform — SBOM Update
## Version 1.63 · August 6, 2026

**Supersedes:** v1.62 (Session 95 — AGENT_REFERENCE.md v3.4, Rules 11/12 formalized,
useTTIntake nowIso fix)
**Adds:** Session 96 — governance document placement only. No product code changes,
no test changes, no shell-contract changes.

---

## 1 — Session Summary

Session 96 placed two Governance Agent-authored documents into the repository,
replacing their prior versions via `git rm` / `git add`. Evidence base established
in pre-placement commits `75db6d9` (reconciliation report) and `768aba6` (gather
script). No self-reported figures were carried forward unchecked.

---

## 2 — Changed Components

| File | Change |
|---|---|
| `SOVEREIGN_Platform_Integration_Brief_v1.58.md` | Added. Replaces v1.57. Self-contained §1–10 rewrite; shell-contract history through v1.28; GD-34/GD-35 named; 14/19 cost-tracking sites; 2,245 test total; WH-43 status correct; duplicate Rule 2/3 finding flagged open; Rule 14 closed. |
| `SOVEREIGN_Platform_Integration_Brief_v1.57.md` | Removed (git rm). Fully recoverable via git history. |
| `SOVEREIGN_GD_Registry_20260806.md` | Added. Replaces 20260730. Adds GD-34 and GD-35; corrects next-available number to GD-36. |
| `SOVEREIGN_GD_Registry_20260730.md` | Removed (git rm). Fully recoverable via git history. |
| `PLACEMENT_LOG.tsv` | Two entries appended (Integration Brief v1.58; GD Registry 20260806), with SHA-256 of source files. |

---

## 3 — New Components

| File | Type | Purpose |
|---|---|---|
| `SOVEREIGN_Session96_Handoff.md` | Session artifact | Placement record; what was placed, what was out of scope, commit log |
| `SBOM_Session96_Update.md` | Session artifact | This file |

---

## 4 — Unchanged

- Shell-contract: v1.28 (no change)
- All production packages: no change
- All agent registrations: no change
- All prompt registrations: no change
- JS/TS test results: 2,050 passing / 0 failed (unchanged from Session 95)
- Python test results: 195 passing (unchanged)
- tsc --noEmit: all 15 workspaces exit 0 (unchanged)

---

## 5 — Governance Documents Updated This Session

| Document | Action |
|---|---|
| Integration Brief v1.58 | Placed — supersedes v1.57 |
| GD Registry 20260806 | Placed — supersedes 20260730; GD-34 and GD-35 added, GD-36 is next |

---

*SBOM Session 96 Update · August 6, 2026 · Build Agent*
*Placement session — no product code, no tests, no shell-contract changes*
