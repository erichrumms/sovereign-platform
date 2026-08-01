# SOVEREIGN Platform — Governance Decision (GD) Registry
## July 30, 2026 · Governance Agent
## First formal registry — no prior version existed

**Why this document exists:** when Session 75 needed to assign a number to a new
governance decision, no registry existed to check against — the next number had to be
inferred by grepping for the highest `GD-NN` reference found anywhere in the repository
and its Handoffs. That method worked (GD-30 was correctly assigned), but it's
inference-level confidence, not registry-level certainty, and it was explicitly flagged
as a real limitation at the time. This document is the fix: a real, checkable index,
starting now.

**Known limitation of this first version:** this registry was reconstructed from what's
referenced across this project's documents, not from a complete audit of every GD ever
issued. Entries below GD-20 are named where referenced but not independently verified in
full. Treat this as the best available starting point, not a guaranteed-complete
history — and update it going forward every time a new GD is issued, rather than
re-deriving the sequence by search each time.

---

## Confirmed governance decisions

| GD | Subject | Status | Notes |
|---|---|---|---|
| GD-10 | Classification boundary — platform processes UNCLASSIFIED data only; CUI/SECRET/TOP SECRET blocked and logged | Approved, standing | Referenced throughout the platform's on-screen banners (APEX, ARIA, FLOWPATH) |
| GD-20 | ARIA/CLEAR shell-contract change | Approved | Referenced as the format precedent for GD-30's own record |
| GD-26 | Workspace product (Reviewer's Workspace) | Approved | Referenced in `docs/24_GD26_Workspace_Product.md` |
| GD-28 | (subject not independently confirmed in this conversation's evidence) | Referenced | Appears as the highest number in `docs/29`'s own content per Session 57's Verification Addendum |
| GD-29 | **Never existed as a real governance decision** | N/A | Session 57's Handoff cited "GD-29" as a citation error for `docs/29` (which contains GD-28), corrected in that session's own Verification Addendum. A separate informal use of "GD-29" as a root-cause label for an unrelated bug is not a governance decision. Confirmed directly, Session 76 |
| GD-30 | Add `point_of_contact` (name, role) to `ProgramStatusSnapshot` in the shell contract | Approved | Shell contract v1.23 → v1.24. First shell-contract change verified under this arc's full two-round scrutiny discipline. Record: `GD-30_POC_ShellContract_APPROVED.md` |

## Maintenance going forward

Every new GD should be added to this table at the time it's approved, not reconstructed
later by search. The next available number as of this version is **GD-31**. Before
assigning it, confirm this table is still accurate against the real repository — a
registry that isn't checked is just a longer inference chain, not a fix.

---

*Governance Decision Registry · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
