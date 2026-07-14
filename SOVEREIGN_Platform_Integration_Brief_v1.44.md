# SOVEREIGN Platform Integration Brief
## Version 1.44 | July 13, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.43
**Changed this version:** All four post-PPBE wrap-up decisions made and
confirmed committed: three differing Integration Brief version pairs
resolved (`19e4c43`), operational logs gitignored (`9976bc8`), the
cross-module state gap fix scheduled before Walkthrough F, and a live-call
smoke test inserted before Walkthrough F. **All four PPBE prompts are now
APPROVED** (`33495da`) — prompt count reaches its final form: **20
registered = 19 approved + 1 pending.** Next session combines the smoke test
and the cross-module gap fix.

---

## §1-§10 — unchanged, see v1.43

---

## §11 — Current Build Status

Unchanged from v1.43 except: **all four PPBE prompts APPROVED**, and the
critical path now has two concrete near-term steps instead of one vague one.
Test count last verified fresh at the wrap-up pass: 1875 (1680 JS/TS + 195
Python) — no code has changed since (only prompt headers, a doc cleanup, and
a gitignore edit), so this figure should still hold; verify fresh at the
next session's open regardless, per standing practice.

---

## §13 — Open Governance Items

**CLOSED this version:** all four wrap-up decisions, all four PPBE prompt
approvals, the three genuinely-differing Brief duplicate pairs, the
operational log tracking policy.

| ID | Item | Target |
|---|---|---|
| Walkthrough F scenario script | Governance Agent deliverable, still needs the Strategic Plan's exact spec | Not yet drafted — spec needed first |
| docs/18 §5, §7.2, §3 corrections | Fully diagnosed, fixes known | Next docs/18 revision |
| module-lens orientation_system.md missing | Registry requires it, file absent | Governance Agent correction or removal decision |
| VIGIL triage prompt path drift | Registry path vs. actual disk path | Registry correction |
| SBOM merge, Sessions 27-30 | Permanent gap without the four original files | Non-blocking, standing |
| docs/16 Supervision Efficiency | Confirmed absent | Project Principal's own pace |
| Root document cleanup, remaining ~35 stale Brief versions | Not part of this cycle's scope — only the 3 differing pairs were resolved | Optional future cleanup, non-blocking |
| Everything else from v1.43 not listed here | Unchanged | Tracked only |

---

## §14 — SBOM Status

SBOM Registry v1.35 current through Session 33 plus the wrap-up pass.
Sessions 27-30 remain the standing reconstructed-not-primary-sourced gap.
No SBOM change from this decision cycle (docs/config only, no new
components).

## §15-§17 — unchanged from v1.43

---

## §18 — Agent and Prompt Registry

Agent registry: 44, unchanged. **Prompt registry: 20 registered = 19
approved + 1 pending (`PR-SCRIBE-004` only) — final form, fourth and last
correction to this figure.** All four PPBE prompts (`ppbe-evidence-
synthesizer`, `ppbe-scenario-analyst`, `ppbe-exhibit-drafter`, `ppbe-
coordination-assistant`) APPROVED July 13, 2026, commit `33495da`. Code-gate
satisfied for live use; a live-call smoke test is scheduled as a matter of
operational care before the first real walkthrough exposure, not a code
requirement.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.43 | July 13, 2026 | PPBE build-complete (Sessions 32-33); WE-6 satisfied; prompt count corrected to 20/15/5; approval records produced |
| **v1.44** | **July 13, 2026** | **All four wrap-up decisions closed; all four PPBE prompts APPROVED (20/19/1, final); cross-module gap fix and live-call smoke test both scheduled, combined into the next session** |

---

## §20 — Full Build Roadmap

### Next
| Item | Depends on |
|---|---|
| Combined smoke test + cross-module gap fix session | All four prompts approved (now true) |
| Walkthrough F scenario script | Both PPBE build sessions closed (true) + Strategic Plan spec obtained |
| Walkthrough F | Scenario script + smoke test + gap fix all complete |
| Full rehearsal | Walkthrough F findings addressed |
| Demo-ready | Both workflow layers complete (true) + rehearsal clean |

---

## §21 — CTO Demo Readiness Track

**Critical path, current:** combined smoke test + cross-module gap fix
(next) → Walkthrough F scenario script → Walkthrough F → full rehearsal →
demo-ready.

Both governed workflow layers are complete. The remaining path is
verification and validation, not new build scope, with one exception (the
cross-module gap fix itself, sized at roughly one session per the Build
Agent's own estimate).

---

*SOVEREIGN Platform Integration Brief v1.44 · July 13, 2026*
*Pre-Decisional · Internal Working Document*
