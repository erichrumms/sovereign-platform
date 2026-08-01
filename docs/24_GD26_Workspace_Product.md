# docs/24 — GD-26: `WORKSPACE` as a Real `SovereignProduct` Member

**Prepared by:** Governance Agent, July 20, 2026
**Status:** Pre-Decisional · Internal Working Document
**Governance Decision:** **GD-26 — proposed, not yet approved.**
**Resolves:** Session 50's documented reconciliation — `module-workspace` currently maps to
product `VIGIL` in `MODULE_PRODUCT` because `SovereignProduct` has no `WORKSPACE` member and
GD-25 didn't authorize adding one.

---

## 1 — What this is, deliberately kept small

This is a narrow, single-purpose GD — closer to Session 43's scope than Session 50's. No new
surface, no new module, no new pattern. One union member, one map entry, one verification.

## 2 — The exact change

**`SovereignProduct`** (`shell-contract.ts:467-479`), currently ten members (six primary + four
companion), gains an eleventh: `WORKSPACE`.

**`MODULE_PRODUCT`** (`sovereign-shell/src/module-loader/index.ts:65`, a
`Record<string, SovereignProduct>`), line 87 currently reads `"module-workspace": "VIGIL"` —
changes to `"module-workspace": "WORKSPACE"`.

That is the entire functional change.

## 3 — Confirmed low risk

**No exhaustive switch over `SovereignProduct` exists anywhere in the codebase** — checked
directly. Adding a new member has no unhandled-case risk to trace. Standard GD impact
assessment still applies and should be stated explicitly in the handoff, not assumed:
`HumanDecisionType`, `SovereignEventType`, and `AgentClass` are all unaffected by this change.

---

## 4 — Done Condition

1. `WORKSPACE` added to `SovereignProduct` in both shell-contract copies, identical, SHA-256
   re-verified.
2. `MODULE_PRODUCT`'s `module-workspace` entry updated from `"VIGIL"` to `"WORKSPACE"`.
3. The reconciliation comment in `register-modules.ts` (lines 92-93, currently describing the
   workaround) updated to reflect that the real product member now exists — remove the
   "future GD" language, since this session is that GD.
4. Confirm nothing else in the codebase assumed `module-workspace` mapped to `VIGIL` — a direct
   search, not an assumption (Rule 8).

---

*docs/24 — GD-26: WORKSPACE as a Real SovereignProduct Member · July 20, 2026*
*Pre-Decisional · Internal Working Document*

---

## Update — July 30, 2026: GD-26's Actual Status — Flagged, Not Confirmed

**This document's header reads "GD-26 — proposed, not yet approved."** Unlike GD-25
(docs/23, confirmed built via the Role Access Matrix's direct account), no document
reviewed during this update cycle independently confirms whether `WORKSPACE` was
actually added to `SovereignProduct`, or whether `module-workspace` still maps to
`"VIGIL"` in `MODULE_PRODUCT` as this document's own §0 describes as the problem being
fixed. **This is a real gap in verification, not a claim either way** — worth a direct
code check (`grep "module-workspace" sovereign-shell/src/module-loader/index.ts`)
before this document's status line is corrected in either direction.

---

*docs/24 · July 30, 2026 append*
