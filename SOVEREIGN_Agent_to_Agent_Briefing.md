# SOVEREIGN Platform — Agent-to-Agent Briefing
## Updated July 18, 2026 — governance reconciliation pass complete; SBOM lineage closed to v1.40; AGENT_REFERENCE lineages merged

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker. Non-technical
background, highly engaged, catches process gaps fast — caught a dropped
version counter, a filename drift, and a double-appended manifest row in
one evening. Big picture first, components second. The Build Agent runs
autonomously and may be unattended for extended periods.

**Naming convention, unchanged:** the two AI roles are referred to only as
"Governance Agent" and "Build Agent" throughout — no model or product names
anywhere in this or future governing documents.

**Two operational facts worth knowing before anything else:**
1. **The repo is public and cloneable:** `github.com/erichrumms/
   sovereign-platform`. Any agent with code execution should clone it
   directly for anything committed, rather than waiting on pasted content.
2. **Large chat attachments can fail silently** (arrived empty, mechanism
   never diagnosed). If pasted content seems missing, say so — don't guess
   at its contents.

---

## What's New Since the Last Briefing (July 14 → July 18)

**No build work happened in this window.** What happened instead was a
full governance/documentation reconciliation pass, because an orientation
check kept surfacing real unverified claims. Full detail:
`SOVEREIGN_Governance_Investigation_Report_20260718.md`. Highlights:

1. **The SBOM lineage was found intact, not broken.** A repo-only check
   wrongly concluded no merge existed since Session 17. A continuous,
   real, properly maintained registry (v1.8→v1.39) existed in iCloud the
   whole time — exactly where Lesson 13 says it belongs. The actual gap
   was only Sessions 38 + PromptFix, now closed with **SBOM Registry
   v1.40** (iCloud, placed, checksum-verified). This produced **Lesson
   23**: check every documented storage location before declaring
   anything missing.
2. **AGENT_REFERENCE's two divergent lineages were merged.** Repo version
   (full SOVEREIGN reference, Lessons 1-12, stopped June 26) and
   project-knowledge version (condensed, Rules 1-10, through July 15) are
   now **Unified v3.0** — one document, confirmed committed to the repo
   root and copied to the iCloud root. **Project-knowledge placement is
   unconfirmed — verify with the Project Principal, don't assume.**
3. **`lens-orientation`'s registry entry was corrected — in the file, not
   yet in the repo.** It described an LLM-backed dialogue agent; it's
   actually a static, non-LLM Pipeline Navigator. The corrected
   `Agent_Identity_Standard.md` (1537 lines, `e5e207e8…`) says so
   directly, but **the repo still holds the pre-fix 1527-line version**
   (`a1f0f0d0…`) as of HEAD `ca0e1c9` — this is a queued placement, not
   yet done.
4. **`docs/18` was stale v1.0; replaced with the real v1.1** (corrects a
   prompt-requirement analysis and two placeholder schemas).
5. **The four PPBE prompts' approval was traced and resolved as legitimate
   but off-process:** a real, dated, attributed commit (`33495da`, July
   13) exists; the formal Prompt Approval Record artifact was never
   created for it. **Decision: logged as a one-time deviation, monitored
   through the Walkthrough F repeat pass** — any prompt-content issue
   found there reopens the question.
6. **Repo root cleanup — DONE.** 45 superseded documents plus one stray
   `.docx` moved to iCloud For Disposal, each copy-verified before
   removal; commits `c023baf`/`ca0e1c9`.
7. **Four verification scripts committed:** `sovereign_session_verify.sh`,
   `sovereign_platform_map.sh`, `repo_integrity_check.sh` (bash 3.2
   compatible — macOS default), `check_steps_4_5.sh`.
8. **Two documents were found orphaned — the Walkthrough F compiled
   document (existed only as a chat upload, never placed) and this
   Briefing itself (was stale since July 14, now rewritten as of this
   version). Neither is committed to the repo yet** as of HEAD `ca0e1c9`
   — both are queued placements, same as item 3 above.

---

## Current State — July 18, 2026

| Item | State |
|---|---|
| HEAD | `ca0e1c9` — verify fresh via `git log -1` |
| shell-contract.ts | v1.16, triple-confirmed, unchanged since GD-21 |
| Platform tests | **1923** (1728 JS/TS + 195 Python), independently re-derived, exact match across two derivation methods |
| Registered agents | 44, most-reverified number in the project |
| Prompt registry | 20 registered = 19 approved + 1 pending; PPBE approvals traced to `33495da`, logged as a monitored deviation |
| SBOM lineage | **v1.40**, iCloud, complete and current |
| AGENT_REFERENCE | **Unified v3.0** — confirmed in repo + iCloud root; **project knowledge unconfirmed** |
| Integration Brief | v1.47, but **the committed copy (`26a34dab…`) is one revision behind** a corrected version (`aa642f61…`) — reconcile before treating the placed Brief as authoritative |
| docs/18 | **v1.1**, placed, replaces stale v1.0 |
| Walkthrough F | Repeat pass (Priorities 1-5) — **still not run**, the actual next task |
| CPMI-VRS Gate 3 (APEX) | Unblocked, still not attested |

---

## What's Next

1. **The Walkthrough F repeat pass.** Nothing else is genuinely ahead of
   it in the critical path. Priorities 1-5, then A3/A5/A6 and Part B if
   1-2 hold.
2. Process the Session 38 + PromptFix handoffs' non-SBOM content against
   the Brief — never done.
3. WF-2, WF-6, WF-8 — best decided live, while looking at the actual
   screens during the repeat pass.
4. Standing, low-urgency: exhibit-drafter validation failure; PPBE
   `max_tokens` host wiring; ARIA-EXPORT-GD; the two uninvestigated audit
   flags (F-2 uncarded AgentOS agents; F-3 `vigil-approval-agent`'s
   unexplained prompt file).

---

## Corrections to Carry Forward

- SBOM lineage: **complete through v1.40.** Don't re-open "was there ever
  a merge" — there was, continuously, in iCloud. That question is closed.
- AGENT_REFERENCE: **one document now, Unified v3.0.** Don't treat the
  repo and project-knowledge versions as separate anymore.
- `lens-orientation`: **static, non-LLM, no prompt required.** Don't
  re-flag it as missing a prompt file.
- Test count: **1923**, independently confirmed twice. Trust it without
  re-deriving, unless something material has changed since.
- All standing lessons (13-21) remain in force. **Lesson 22** (verification
  tooling can itself be the source of a false alarm — trace it, don't
  trust or dismiss on sight) and **Lesson 23** (check every storage
  location before declaring something missing) both apply with force to
  any future governance investigation.

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated July 18, 2026*
*Supersedes the July 14 version*
*Pre-Decisional · Internal Working Document*
*File to: git repo root, as `SOVEREIGN_Agent_to_Agent_Briefing.md` (no date suffix)*
