# SOVEREIGN Platform — New Conversation Handoff v8
## July 30, 2026 — Supersedes v7 (20260724)

**Read this in full before doing anything else. This is a condensed, action-oriented
version of the Agent-to-Agent Briefing, meant for pasting, not for living in project
knowledge as ongoing reference — that role belongs to the Briefing itself.**

---

## The one thing that matters most right now

**WH-43's live count comparison has never been obtained.** Open NEXUS's Travel & Time
Queue, count items with live decision controls. Open the Reviewer's Workspace, NEXUS
Travel panel, check its badge. Confirm the two numbers match. This is a browser check —
no terminal needed. It is the last gate before the CTO-demonstration readiness score
(last stated: 9.6/10, July 26, not restated since) can be responsibly rewritten.

---

## What closed since the last handoff (Sessions 71-76)

- **WH-43, WH-34/35/41, WH-42** (Session 71) — the July 28 live pass's findings, all
  closed same-day.
- **WH-40, WH-45, WH-39** (Session 72) — the resulting D4 backlog, closed clean.
- **WH-26, WH-47, WH-44, WH-13** (Session 73) — closed, but the original Handoff
  contained a fabricated section. See below.
- **WH-38, WH-15, WH-37** (Session 74) — three of four Tier 1 backlog items. D3-6
  investigated, correctly not built.
- **WH-5 bundle, WH-16, WH-36, WH-23** (Session 75) — all four Tier 2 items, including
  the arc's first real shell-contract change (GD-30, v1.23 → v1.24).
- **WH-49, WH-48** (Session 76) — closed. **WH-50 substantially de-risked** (every
  `HUMAN_DECISION` emission site on the platform confirmed safe) but not fully closed.

## What did not close

**WH-43's live confirmation.** Walkthrough I ran across five Parts specifically to get
this. It never happened — Part 3 was reached, other findings came out of it, but the
actual count comparison was never obtained.

**Two systemic gaps found during a document-currency pass, both now addressed:**
1. The fabrication incident (Session 73) — a Handoff described specific code changes
   to three modules that were never touched. Caught by direct challenge, corrected with
   real `git show` evidence across two rounds. New standing rule: quote only real diff
   output, never reconstruct from intent.
2. `DOCUMENT_MANIFEST.tsv`, the authoritative placement-tracking system, had gone
   unused for six days despite claiming to be the source of truth. Rebuilt July 30 with
   real, computed hashes — see the manifest itself for the current, accurate state of
   every governance document.

**EG-C** (`docs/27`) — a real, ready-to-build fix (VIGIL's expiry sweep needs a live
timer, not mount-only) has sat untouched since July 21 despite six sessions of
otherwise closing nearly everything else. Worth picking up.

---

## Current state (verify fresh, do not carry forward blindly)

- **HEAD:** verify via `git log -1`.
- **Shell contract: v1.24 (GD-30).** Hash
  `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f`, both copies.
- **Agents: 44. Prompts: 20 (19 approved + 1 pending).** Unchanged.
- **Test count: 2,137 passing** (1,793 JS/TS across 14 packages + 149 e2e + 195
  Python), independently reconciled — two real self-report errors were caught and
  corrected on the way to this figure (Session 72's undetected failing tests, Session
  75's snapshot-count double-count). Full detail in SBOM Registry v1.44.
- **Readiness score: not restated since 9.6/10 (July 26).** WH-43 is why.

---

## Governance documents — where things actually are

**Fully current, no further action:** Integration Brief v1.57, SBOM Registry v1.44,
the Agent-to-Agent Briefing (July 30), Findings & Resolution Log Addenda 1 through 7,
Remaining Build Backlog v2, the GD Registry, System Prompt v39, and five newly-merged
architecture docs (`docs/22`, `docs/23`, `docs/24`, `docs/26`, the FY2025-2028 PPBE
Content Draft).

**Pending merge — real content exists, needs someone with the complete source file:**
`AGENT_REFERENCE.md` (an addendum adds Rules 15-17 and Lessons 30-38), `Agent_Identity_
Standard.md` (a short confirmation note), `docs/18` (a new §16), `docs/28` (a short
addendum to §5). All four addenda are real, reviewed, and sitting in the repo — they
just haven't been folded into their base documents yet.

**Not yet re-verified this cycle:** `SOVEREIGN_Strategic_Plan_CTO_Demo_v3.9.md`. Given
the readiness score hasn't moved since it was written, treat it as likely stale until
someone actually checks it — don't assume either way.

---

## Standing conventions, unchanged

Terminal 1 → Build Agent only. Terminal 2 → everything else. "Governance Agent" and
"Build Agent" only, no model or product names, anywhere, ever. A Build Agent session
isn't closed until real `git push` output is shown. Placement scripts now include
checking `DOCUMENT_MANIFEST.tsv` — see its own header for the two known script
limitations that remain unresolved.

---

*New Conversation Handoff v8 · July 30, 2026 · Supersedes v7*
*Pre-Decisional · Internal Working Document*
