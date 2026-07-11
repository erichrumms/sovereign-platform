# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated July 11, 2026 — TT prompts delivered, docs/18 status corrected, prompt/D-TT7 dependency clarified

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker. Non-technical background,
highly engaged, learning fast. Big picture first, components second. One question at
a time. He pastes Terminal output directly into chat — read it carefully. **He wants
to demo SOVEREIGN to a CTO** — this is the current organizing priority; treat requests
through that lens when relevant, without inventing urgency that isn't there.

---

## What SOVEREIGN Is

A governed, AI-aligned operations platform — six integrated core products (NEXUS,
CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite) plus four companion modules (COUNSEL,
SCRIBE, LENS, VIGIL), a future seventh product (the Intelligence Layer) that every
current product feeds, and two governed workflow layers (PPBE, Time & Travel) —
never products, never their own shell module or certification cycle.

**All six primary products and all four companion modules are feature-complete.**
Walkthroughs A–D complete, including full remediation of every Walkthrough D finding.

---

## Current State — July 9, 2026

| Item | State |
|---|---|
| HEAD / origin/main | `c3684f0` (AIS-dedupe fix, July 9) — verify current before assuming unchanged |
| shell-contract.ts | v1.15 · `939c2441…bfa5876` — unchanged since Session 23 |
| Platform tests | 1288 · 0 production vulnerabilities — unchanged since Session 26 (no build session since; `c3684f0` is docs-only) |
| CPMI-VRS Gate 3 (ARIA Suite) | Unblocked, **not yet attested** |
| Time & Travel | **D-TT1–D-TT6 decided June 29, 2026** (fully filed record). `docs/17` complete. **D-TT7 open — does not block prompts.** Two prompts drafted and delivered (`tt/prompts/`), approval pending D-TT7 only if Option C is chosen. |
| PPBE | **D-P1–D-P6 decided June 29, 2026** (well-evidenced, original record not located — reconstruction provided). `docs/18` **not yet started** (corrected — was previously described as in progress). **D-P7 open.** |
| Registered agents | 44 (36 master, including 6 PPBE agents — not separate from the 36 — + 8 `tt.*`) |
| Approved prompts | 14 approved; 2 Time & Travel prompts drafted, pending formal approval alongside D-TT7 |

**Do not assume PPBE's or Time & Travel's data-dictionary entities are still open
decisions — they are not.** The only open questions are D-P7 and D-TT7: whether those
already-approved entities should be *amended*, not whether they should be *approved*.

---

## ⚠️ The Reconciliation This Update Reflects — Read Before Trusting Older Documents

Integration Brief v1.40 and earlier incorrectly carried PPBE's and Time & Travel's
data-dictionary decisions as pending. **They were decided June 29, 2026, in
governance sessions that happened outside the main session-to-session continuity
thread** — discovered only through a multi-document reconciliation effort on July 9
after the Project Principal noticed the discrepancy and supplied source material for
verification. If you encounter any document dated between June 30 and July 9 that
treats PPBE's or Time & Travel's entities as unapproved, **trust this Briefing and
Integration Brief v1.41 over it.**

**Standing lesson from this:** governance decisions made in a conversation outside the
main continuity thread do not automatically propagate. If a side conversation produces
a real decision, its output needs to be explicitly brought back and reconciled — it
doesn't happen on its own, and the gap can persist for weeks before anyone notices.

---

## ✅ Gate 3 Is Unblocked — Not Yet Attested

D-11/D-12 fixed, Session 26. Pre-formed attestation statement, blocked until
determinism passes, verbatim-logged. **Attestation itself is still a deliberate,
un-undoable Project Principal action on his own timeline** — don't frame it as
overdue just because it's unblocked.

---

## D-P7 and D-TT7 — Open Reconsideration Decisions

Both workflow layers' six approved data-dictionary entities are being reconsidered —
not reopened wholesale, only the entity-approval decision (D-P3, D-TT3) in each —
given two platform precedents where a "no shell-contract change needed" or "frozen
interface" assessment turned out wrong once real build work tested it: `AriaCertification`
(Session 26, D-3) and GD-20 superseding `docs/16`'s claim that ARIA needed no
shell-contract change. Full records: `Governance_Decision_Record_PPBE_DP7.md`,
`Governance_Decision_Record_TT_DTT7.md`. Each offers three options — reaffirm,
narrow reserved-field amendment, or full architecture first. **Neither decided yet.**
Do not build against either workflow layer's data dictionary as if these are settled.

---

## Time & Travel Is the Lead Candidate for the Demo

Unlike PPBE, Time & Travel has a **complete, approved build specification**
(`docs/17_TimeAndTravel_Architecture.md`) — tool designs, ten compliance rule
categories, Logger events, shell-contract impact assessment, autonomous-operation
rules for Claude Code — **and now both drafting prompts, delivered July 11**
(`tt/prompts/travel_drafting_system.md`, `tt/prompts/time_drafting_system.md`).
It is the most build-ready path to a demonstrable, working workflow layer.
Sequence build sessions accordingly unless directed otherwise.

**On the two prompts specifically:** drafting them did not require D-TT7 to resolve
first — they don't reference any field beyond what D-TT3 already approved. Formal
approval is held pending D-TT7 only as a precaution against Option C (full
architecture) changing the underlying fields; if D-TT7 resolves to Option A or B,
approve the prompts as-written alongside the decision, no rework needed.

---

## Corrections to Carry Forward

- **`AIS-dedupe` is resolved.** `Agent_Identity_Standard.md`'s Time & Travel section was
  found duplicated three times (a July 1 merge commit, `88cd04e`, unknowingly worsened
  an existing double-duplication to triple). Fixed and verified July 9 — file truncated
  to its single clean copy (1,359 lines), all three prior copies confirmed byte-identical
  before the cut, committed as `c3684f0`. No longer open — don't re-flag it.
- **npm-dev-vulns is not an open decision.** The `esbuild`/Vite advisory has been
  deferred to the Stage 5+ Vite major-version review since Session 2B (June 18). Stop
  tracking it as "pending" — it's already resolved as "deferred with a trigger condition."
- **`docs/16`'s retroactive Supervision Efficiency section — status still genuinely
  unverified.** `docs/14`'s addendum required it before Walkthrough D. Whether it
  actually happened is unconfirmed either way. Worth a direct check, not an assumption.
- **`Agent_Identity_Standard_v1_2.md` and `v1_3.md` are a confirmed-dead, abandoned
  numbered-versioning branch** — early, short-lived, superseded by the append-only
  document before Session 15. If encountered again, don't treat them as current.

---

## Key Codebase Facts (Unchanged Since Session 26)

- Python `APPROVED_EVENT_TYPES` 84, permanently 5 more than TS's 79 (3 TRACER + 2 ARC,
  Python-only by design)
- `ARIA_ADAPTATION_DECISION` — reserved event type, not yet wired
- `GATE_3_ATTESTATION` — `HumanDecisionType`, GD-7, shared across CPMI/APEX/FLOWPATH/ARIA
- `AriaCertification` has no destination/recipient fields — audit-capture only,
  enforcement deferred to `ARIA-EXPORT-GD`
- ARC outputs deliberately not routed through `ctx.aria`
- COUNSEL has no `regulation_basis` field — candidate GD, reinforced three ways now

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Treating PPBE/TT entities as still-open | They're decided — only D-P7/D-TT7 (amendment) are open |
| Wrong shell-contract hash | Verify v1.15 — unchanged since Session 23 |
| Agent count wrong | Count the authoritative table directly — a naive grep returns 46 |
| Building against Time & Travel or PPBE data dictionary before D-TT7/D-P7 resolve | Wait — amendment could still change field shape |
| Treating `AIS-dedupe` as still open | It's resolved (`c3684f0`, July 9) — don't re-flag it |
| Treating npm-dev-vulns as an open choice | It's an already-made, deferred decision |
| A side conversation's governance decision not making it back into the main thread | This is exactly what caused the multi-week reconciliation — bring outputs back explicitly, promptly |
| Session closes without handoff | Non-negotiable |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated July 9, 2026*
*Supersedes July 1, 2026 version — full PPBE/TT governance reconciliation, demo track added*
*Pre-Decisional · Internal Working Document*
