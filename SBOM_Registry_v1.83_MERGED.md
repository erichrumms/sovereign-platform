# SOVEREIGN Platform — SBOM Registry
## Version 1.83 (MERGED) · August 15, 2026 · Governance Agent

**Supersedes:** v1.74 (MERGED, August 11, 2026), which covered GD-31 Build Session 1
through Session 105 and which **was never placed in the repository**. The only
registry file on disk is `SBOM_Registry_v1.44.md` (July 30, covering through Session
76). This version supersedes both.

**Numbering.** Per the convention settled in Sessions 110–111, per-session updates and
merged registries **share one number space**. The next number is derived by scanning
every SBOM file and adding one. The highest on disk is v1.82 (Session 114), so this
registry is **v1.83**. The drafts that carried v1.74 and v1.75 are superseded — both
of those numbers were already occupied by per-session updates.

**Merges:** everything in v1.74, plus Sessions 107 through 114 from verbatim
per-session sources. **Session 106 and the five sessions v1.74 could not merge remain
unmerged** — see §6. The gap is recorded, not closed by inference.

---

## 1 — Shell Contract History

Carried forward from v1.74, extended through Session 114.

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.25 | GD-31 Build Session 1 | Optional `token_usage?` added to `SovereignLogEvent` | `d22694a3…` |
| v1.26 | GD-33 Build Session | `reports_to?: string` added to `SovereignUser` | `42a479ca…` |
| v1.27 | Session 87 (GD-34) | `FallbackCategory` type; `fallback_category?`; `duration_ms?`, `stop_reason?`, `responded_at?` on `token_usage` | `3570923c…` |
| **v1.28** | **Session 91 (docs/34 Phase 3)** | **`SUPERVISOR` added to `SovereignRole`** | `c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b` |
| v1.28 | Sessions 92–114 | **Unchanged.** Both copies re-verified byte-identical at every session close, most recently Session 114 | `c99355ce…` |

**No shell-contract change has occurred since Session 91.** Twenty-three consecutive
sessions with the contract untouched and verified identical at each close.

---

## 2 — Agent and Prompt Registry

**Agents: 44. Prompts: 20 (19 approved + 1 pending).** Unchanged from Session 76
through Session 114 — thirty-eight sessions. Confirmed by direct count in the Session
107 currency review and again in the Sessions 107–114 confirmation note appended to
`Agent_Identity_Standard.md` v1.2.

---

## 3 — Test Count History

| Session | JS/TS | Python | Total | Note |
|---|---|---|---|---|
| 105 | 2,050 | 195 | 2,245 | Independently re-run from zero across all 15 workspaces |
| 107–112 | 2,050 | 195 | 2,245 | Unchanged. Documentation and governance sessions |
| **113** | **2,053** | 195 | **2,248** | +3 — `module-apex/tests/ppbe-site-breakdown.test.ts` (over-obligated sites) |
| **114** | **2,059** | 195 | **2,254** | +6 — `module-apex/tests/ppbe-dashboard.test.ts` (over-obligated programs) |

**All nine tests added in this window were proven to fail without their fix**, in
Session 114's case by reverting the source and re-running.

**Historical note carried forward from v1.74, not smoothed over:** a real arithmetic
error was found during that merge — two sessions' test totals had silently dropped a
whole package's count from a restatement, understating both by 20. Corrected there;
recorded here so the correction is not lost with the superseded document.

**Session 112 anomaly, recorded:** the verify script's full run recorded `test:shell`
as exit 139 (segmentation fault). Re-run standalone it passed cleanly at 20 tests.
Transient, not reproducible, unrelated to any change that session.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies from Session 62 through Session 114.**
Independently confirmed at every session close.

Vulnerability posture unchanged across the window: 5 findings (1 moderate, 4 high) —
brace-expansion, esbuild, js-yaml, postcss — **all in development tooling, none on the
runtime surface.** Unremediated and recorded as such.

---

## 5 — Sessions 107–114, Merged

### Session 107 (v1.75) — Governance document currency
`AGENT_REFERENCE.md` stale test figure corrected (934 → the real count, with its
source session attached). `Agent_Identity_Standard.md` header corrected v1.0 → v1.1;
Sessions 77–106 confirmation note appended; `deployment_feedback` gap documented.
Read-only investigation established that the canonical registry uses dotted ids for
product agents and that VIGIL's dashed form was the deviation.

### Session 108 (v1.76) — Parallel lineage recovery
`AGENT_REFERENCE.md` v3.5 → v3.6, 2,006 lines. Three content blocks recovered from a
second copy (1,993 lines, SHA `14aa83ad…`) that had been produced locally in July and
**never committed**: Lessons 26–29, the Rule 10 July 26 amendment, and the
session-store extraction decision. The manifest's claim that the SHA "described a file
state that never existed" was **retracted** — the state existed; the commit never
happened.

### Session 109 (v1.77) — Rules 13/14 resolution
`AGENT_REFERENCE.md` v3.6 → v3.7. The parallel lineage's Rule 13 evidence folded into
canonical Rule 17; its Rule 14 content re-homed as **Lesson 39**, leaving Rule 14
permanently unassigned. Duplicate Rule 2/3 numbering confirmed intentional and
citation guidance recorded — closing a finding carried open across multiple System
Prompt versions. Session 108's handoff HEAD corrected. Manifest: 3 stale rows fixed,
12 rows added.

### Session 110 (v1.78) — Conventions and the manifest gap
`AGENT_REFERENCE.md` v3.7 → v3.8. **Handoff close tables no longer carry a HEAD
value** — it cannot be accurate when written, and three consecutive sessions recorded
a wrong one. Terminal HEAD moves to `DOCUMENT_MANIFEST.tsv`. SBOM numbering settled as
one shared space with a derivation rule. **47 manifest rows added** for Sessions 81–98
and 101–106, closing a 27-session hole. Downloads inventory found System Prompt v37
and v38 present, retracting a "no file on disk anywhere" claim.

### Session 111 (v1.79) — The verify script becomes a real check
`sovereign_session_verify.sh` v4 → v5, 186 → 364 lines. **Four invariant checks
added:** manifest-to-disk SHA integrity, version-chain continuity, SBOM count
accuracy, PLACEMENT_LOG file existence. **Six standing warnings resolved**, every one
a real staleness — an expected HEAD frozen since Session 43, a contract hash frozen at
v1.20 since Session 51, filename checks pointing at files that do not exist. Running
the script with full output quoted became a stated close requirement.
**First run found four real manifest SHA drifts.**

### Session 112 (v1.80) — Lessons 13–23 and the enforcement layer
`AGENT_REFERENCE.md` v3.9 → v3.10, 2,212 lines. **Lessons 13–23 imported verbatim
from `PROJECT_SUMMARY.md` Part 7** — flagged as a structural gap five times, the
content having been in the repository the whole time in a second lineage using a
different heading format. Four manifest SHA drifts corrected. `docs/40` §10 appended.
`pull_category3_docs_to_icloud.sh` marked broken. Three frozen hash expectations
reported and **deliberately not refreshed** — a frozen expectation in a script nobody
runs should be deleted.

### Session 113 (v1.81) — Demonstration-surface defects
Program-count discrepancy **investigated, not changed**: three surfaces, two distinct
datasets plus one dedup-versus-raw filter difference, established with file-level
evidence. Disclosure recommended over a code change. Site obligation status fixed —
a site at 135% displayed "On track"; over-obligation now flags `at_risk`, +3 tests.
VIGIL's three AgentOS ids dotted. Operator label corrected. **A Rule 12 root-cause
search found the same missing upper bound at program level and reported it rather than
fixing it**, because it touched a surface beyond the deliverable's scope.

### Session 114 (v1.82) — The Screen 1 correction
`statusFromObligationRate` gained the over-obligation case reported by Session 113.
**Program ECHO, at 104%, had been publishing "On Track" to the Home Dashboard while
the platform's own ledger monitor flagged it P1 for exceeding its ceiling and the
end-to-end test asserted CEILING_EXCEEDED.** Alerting and dashboard disagreed; they
now agree. +6 tests, proven to fail without the fix by reverting the source. Flagged
programs moved 1 → 2. **A Session 113 prediction that this would change a snapshot was
checked and found wrong** — that snapshot renders hardcoded fixtures, not the live
seed.

---

## 6 — What Remains Genuinely Unmerged

**Six sessions.** Real work done, no verbatim SBOM source available to merge from:

- **Session 99** and **Sessions 101–104** — carried forward unmerged from v1.74.
- **Session 106** — new to this gap. The session is well documented in the Session 107
  and 108 handoffs, but its own SBOM update was not available to this merge.

Gathering these six documents directly would close the backlog item completely.
**They are recorded as unmerged rather than reconstructed from surrounding handoffs**,
which would produce a plausible record rather than a true one.

---

## 7 — Governance Decisions in This Window

**GD-42 — Model Governance — APPROVED August 15, 2026.** The five Local LLM decisions
were recorded June 23, 2026; the claim that they were unrecorded rested on a citation
one document number off. Next available: **GD-43**.

**GD-40 — AMENDED August 15, 2026.** Its dataset-split explanation covers the World
Model versus PPBE difference only, not the dedup-versus-raw filtering difference.

No shell-contract change was raised by either.

---

## 8 — The Enforcement Layer (new in this window)

Did not exist at v1.74.

| Tier | Mechanism | State at Session 114 |
|---|---|---|
| 0 | Context gather script | Live; blocked a paste correctly in Session 113 |
| 1 | `.githooks/pre-commit` | **Live and BLOCKING** on growing cross-artifact drift. Baselines `EMITTED_NOT_IN_CONTRACT=4`, `STALE_CONTRACT_HASH_IN_TOOLING=3` |
| 2 | `sovereign_session_verify.sh` v5 | Four invariant checks, full output quoted at every close |
| 3 | Periodic orphan and lineage scan | **Not built** |

Two Tier 1 checks are **parked rather than baselined** because their parsers do not
measure the property they name. `.githooks/commit-msg` strips attribution trailers and
is verified holding: zero trailers, zero model names across the last 60 commits.
`core.hooksPath` must be set once per clone — the directory is versioned, the pointer
is not.

---

*SOVEREIGN Platform — SBOM Registry v1.83 (MERGED) · August 15, 2026 · Governance Agent*
*Supersedes v1.74 (never placed) and v1.44 (on disk, through Session 76).*
*Merges everything in v1.74 plus Sessions 107–114 from verbatim sources.*
*Six sessions remain genuinely unmerged and are named in §6.*
*Pre-Decisional · Internal Working Document*
