# SOVEREIGN Platform Integration Brief
## Version 1.45 | July 13, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.44
**Changed this version:** Session 35 closed (three parts). **Cross-module state
gap fix COMPLETE** — real fix, 21 regression tests, e2e convergence proof.
**Prompt registry count CONFIRMED** — 20/19/1 was correct all along; the
historical "16 approved" in Sessions 27-30 was a registered-vs-approved
mislabel, now traced and closed. Test count: **1900 passing** (1705 JS/TS +
195 Python), up from 1875. **New standing config fact:** PPBE host wiring
must override `max_tokens` (default 1,000 truncates synthesis output). **One
open item remains before Walkthrough F:** the PPBE live-call smoke test's
live half needs a Project Principal action (a credentialed test run) — the
harness itself is built, committed, and its fail-closed half is a passing
permanent regression.

---

## §1-§10 — unchanged, see v1.44

---

## §11 — Current Build Status

**Test count: 1900 passing** (1705 JS/TS + 195 Python), plus 4 key-gated live
smoke tests (skipped by design, no dev credential). Verified independently
this cycle by re-summing the per-workspace breakdown in `SBOM_Session35_Update.md`
rather than trusting the total alone. `tsc --noEmit` clean, 14/14 workspaces.
0 vulnerabilities. Shell contract v1.16, both copies re-verified, unchanged.
Agent registry: 44, unchanged. Prompt registry: 20 registered = 19 approved +
1 pending — **confirmed by direct on-disk census, not carried-forward
arithmetic** (see §18).

---

## §13 — Open Governance Items

**CLOSED this version:**
- Cross-module state gap fix — was open since Session 30's close, scheduled before Walkthrough F. Now COMPLETE: `module-vigil/src/tt-escalation-surface.ts` + `module-scribe/src/useVigilEscalationAuthorizations.ts`, 21 regression tests, e2e convergence test demonstrates the live fix end to end. Ready for Walkthrough F to validate.
- Prompt registry count discrepancy (flagged in the prior governance cycle, unresolved as of v1.44/SBOM v1.37) — CONFIRMED 20/19/1 correct, root cause identified (registered-vs-approved mislabel in Sessions 27-30 handoffs, not a real gap). No document needs a number changed; historical entries should be read as "registered," not "approved."
- SBOM merge, Sessions 27-30 — was already resolved this cycle (SBOM v1.37, prior to Session 35) via the four primary-source session update files; carried forward as closed.

| ID | Item | Target |
|---|---|---|
| **PPBE live-call smoke test — live half** | Harness built and committed (`c8a5ff4`); fail-closed half passing as permanent regression; live half needs one credentialed command from the Project Principal | Run `RUN_PPBE_LIVE_SMOKE=1 ANTHROPIC_API_KEY=<key> npm run test:e2e -- ppbe-live-smoke` before Walkthrough F |
| Walkthrough F scenario script | Governance Agent deliverable, unblocked (Strategic Plan Part IV supplies the format); not yet drafted | Can be drafted now in parallel with the Part 1 live run — doesn't depend on its result |
| PPBE host wiring for `max_tokens` | No production UI composition-root wiring exists yet for the four PPBE agents; the harness is the only reference implementation | Apply the 4,096 override when real host wiring is built |
| docs/18 §5, §7.2, §3 corrections | Already applied in docs/18 v1.1 — Brief's tracking of this as "open" was itself stale as of last cycle; confirm closed | Verify docs/18 v1.1 is current in repo, then remove this row entirely next cycle |
| module-lens orientation_system.md missing | Registry requires it, file absent | Governance Agent correction or removal decision |
| VIGIL triage prompt path drift | Registry path vs. actual disk path | Registry correction |
| TT agent Status fields stale | All 8 TT agents still read pre-build "REGISTERED — build may proceed..." despite being fully implemented since Session 30; PPBE's six got this correction, TT never did | Cosmetic, non-blocking; fold into next `Agent_Identity_Standard.md` revision |
| Root document cleanup, ~35 stale Brief versions | Not part of any recent cycle's scope | Optional future cleanup, non-blocking |
| docs/16 Supervision Efficiency | Confirmed absent | Project Principal's own pace |
| Everything else from v1.44 not listed here | Unchanged | Tracked only |

---

## §14 — SBOM Status

SBOM Registry v1.38 current through Session 35. Merges onto v1.37 (which
itself restored Sessions 27-30 from primary source, not v1.35, which is what
`SBOM_Session35_Update.md` assumed as its baseline — Claude Code has no
visibility into this chat's iCloud-only documents; reconciled correctly, no
conflict, see SBOM v1.38 §0). Sessions 27-30 no longer a reconstruction —
confirmed real, per SBOM v1.37/v1.38.

## §15-§17 — unchanged from v1.44

---

## §18 — Agent and Prompt Registry

Agent registry: 44, unchanged. **Prompt registry: 20 registered = 19 approved
+ 1 pending (`PR-SCRIBE-004` only) — CONFIRMED by direct on-disk census,
Session 35 Part 3.** No prompt added, edited, or re-statused this session.
Historical note for the record: Sessions 27-30's "Approved prompts: 16" was
the *registered* figure (15 approved + 1 pending at that time), not the
approved figure — a labeling error in those handoffs, not a real gap. Do not
correct the historical documents themselves; this note is the correction.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.43 | July 13, 2026 | PPBE build-complete (Sessions 32-33); WE-6 satisfied; prompt count corrected to 20/15/5; approval records produced |
| v1.44 | July 13, 2026 | All four wrap-up decisions closed; all four PPBE prompts APPROVED (20/19/1, final); cross-module gap fix and live-call smoke test both scheduled, combined into Session 35 |
| **v1.45** | **July 13, 2026** | **Session 35 closed: cross-module gap fix COMPLETE; prompt count 20/19/1 CONFIRMED (root cause of historical discrepancy found and closed); test count 1900; new max_tokens config fact; Part 1 live smoke test is the one remaining pre-Walkthrough-F item, gated on a Project Principal action, not further build work** |

---

## §20 — Full Build Roadmap

### Next
| Item | Depends on |
|---|---|
| PPBE live-call smoke test, live half | Project Principal runs one credentialed command — no further build work needed |
| Walkthrough F scenario script | Both PPBE build sessions closed (true) + Strategic Plan spec (obtained) — **unblocked, can start now** |
| Walkthrough F | Scenario script + live smoke confirmation both complete |
| Full rehearsal | Walkthrough F findings addressed |
| Demo-ready | Both workflow layers complete (true) + rehearsal clean |

---

## §21 — CTO Demo Readiness Track

**Critical path, current:** PPBE live smoke confirmation (Project Principal
action) + Walkthrough F scenario script (Governance Agent, can start in
parallel) → Walkthrough F → full rehearsal → demo-ready.

Both governed workflow layers are complete, and both Session 35 build parts
(cross-module fix, prompt reconciliation) closed clean. The only thing
between here and Walkthrough F opening is one credentialed test run — not new
build scope.

---

## Key Lessons — Current

Lessons 15-18 unchanged, see v1.44. **New:**

**Lesson 19 — Bare counts for anything approval-gated should always be stated
as three numbers (registered/approved/pending), never a single total.** The
test-count discipline ("state both numbers together — a bare combined figure
has been wrong three times on this project") already existed for tests. This
session showed prompt counts needed the identical treatment: Sessions 27-30's
bare "16 approved" silently conflated registered-with-approved for four
consecutive sessions, and unwinding it took a dedicated Part 3 investigation
to resolve. The three-number format doesn't just describe state more
precisely — it's the format that makes this exact conflation impossible to
state by accident. Apply it to prompts, agents, or any other approval-gated
count from now on.

---

*SOVEREIGN Platform Integration Brief v1.45 · July 13, 2026*
*Pre-Decisional · Internal Working Document*
