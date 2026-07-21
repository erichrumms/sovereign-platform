# SOVEREIGN Platform — Design Recommendations
## RETIRED — Converted to a Shipped-vs-Open Record

**Original date:** July 18, 2026 · **Retired:** July 21, 2026
**Prepared by:** Governance Agent
**Status:** Historical record — the recommendations below are no longer open proposals

---

## Why this document is being retired, not just updated

All three recommendations in the original version of this document have been
**built**. Not partially, not in spirit — the actual features shipped, each
traceable to a real governance decision and a real commit. A "recommendations"
document whose recommendations are all shipped isn't a live planning document
anymore; it's a record of what happened. Converting it to that record is more
honest than leaving it looking like open scope.

---

## DR-1 — Multi-Persona Login → Built as GD-22

**Original ask:** a dev-only persona switcher, admin-vs-manager contrast at
minimum, full staff-facing role deliberately deferred as its own decision.

**What actually shipped:** GD-22 (Session 41) went further than the original
"two-tier, start narrow" recommendation — `minimumRole` was widened to a real
role list across the entire access-control layer, the DEV persona toggle
covers **all eight** roles (not just the two originally proposed), and ARIA
got the platform's first per-tab role gate as a direct consequence. Five of
eight roles are now live-verified end-to-end, not just code-reviewed.

**What's still genuinely open, unchanged from the original:** a real
staff/employee-facing role. The original recommendation was explicit that
this needs its own deliberate decision, not a default — that's still true.
Not scheduled.

---

## DR-2 — Outlook / Teams Integration → Built as designed, exactly

**Original ask:** a "Copy draft" button plus a visibly disabled "Send via
Outlook — Coming Soon" button, explicitly *not* real integration for the
demo.

**What actually shipped:** exactly this, Session 40, no scope drift in
either direction. Real GCC High integration remains genuinely unstarted,
as the original document predicted — it's a procurement and security-review
timeline, not an engineering task, and nothing since has changed that.

---

## DR-3 — Cross-Module Workflow Cohesion → All three options (A, B, C) built

This is the one worth telling the full story on, because the original
document presented three options — A, B, C — as alternatives to choose
between, not a sequence. **All three ended up getting built, in a natural
order neither the original document nor anyone at the time predicted.**

| Original option | What it proposed | What actually shipped |
|---|---|---|
| **B — lightweight embedding** | Let one module's screen pull a live summary from another module's data | `ProgramStatusSurface` (GD-23, Session 44) — the suggested near-term move in the original document, built almost exactly as scoped, fully resolving WF-20 |
| **C — navigation reorganized around work** | Entry point becomes "what do I need to decide today," not a product list | The Home Dashboard, both phases (Sessions 47 and 49) — Program Health, Flagged Programs, and real cross-module "To Do / Review" queue tiles |
| **A — task-oriented assembled views** | Pull relevant panels from each module a decision depends on into one place | **The Reviewer's Workspace (GD-25, Session 50) — and it went further than "assembled views."** Real VIGIL, ARIA, and SCRIBE decision components are embedded directly, not just their data. A reviewer doesn't see a *summary* of a VIGIL approval — they see and act on the real thing, in place. |

**The order they shipped in matters, worth naming:** B (cheapest, most
contained) came first and proved the underlying pattern; C came next and
gave the platform its first "what do I need to decide" entry point; A came
last and was the biggest lift — by the time it was built, the design
conversation that produced it (`docs/22`) explicitly built on B's proven
pattern rather than starting from scratch. The original document couldn't
have predicted this sequence, but it's a clean, real example of "start
narrow, expand deliberately" playing out over weeks rather than one session.

---

## What this document's retirement means going forward

**Do not treat this document as a source of open scope anymore.** Any future
citation of "DR-1," "DR-2," or "DR-3" should point to the real governance
decisions and specs listed above (GD-22, Session 40, GD-23, GD-25, and the
Home Dashboard sessions) — this document is historical context for how those
came to be, not a live planning artifact.

---

*SOVEREIGN Platform · Design Recommendations · Retired July 21, 2026*
*Originally dated July 18, 2026*
*Pre-Decisional · Internal Working Document — historical record*
