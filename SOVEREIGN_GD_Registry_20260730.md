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
| GD-31 | Token & Cost Telemetry — `token_usage?` field on `SovereignLogEvent`; 10 `AGENT_STEP_COMPLETE` emission sites instrumented; NexusApp follow-on | Approved | Session 77. Docs: `docs/31_TCO_Token_Cost_Telemetry.md`. SBOM v1.44 → v1.45 (`SBOM_TCO1_Update.md`). Handoff: `SESSION_TCO1_HANDOFF.md` |
| GD-32 | SysAdmin Cost Dashboard | Approved | Session 78. Docs: `docs/32_SysAdmin_Cost_Dashboard.md`. SBOM v1.45 → v1.46 (`SBOM_TCO2_Update.md`). Handoff: `SESSION_TCO2_HANDOFF.md`. **Known inconsistency in historical documents:** `SBOM_TCO2_Update.md` and `SESSION_TCO2_HANDOFF.md` internally label this work as "GD-31 Build Session 2" and close with "Both sessions of GD-31 are closed." GD-32 is a separate governance decision, not a second session of GD-31. The historical documents are not being corrected — this note is the on-the-record acknowledgment of the discrepancy, consistent with the project's policy of flagging rather than erasing known errors. |
| GD-33 | Program & Staff Data Foundation (`docs/35`) | Approved | Session 79. Docs: `docs/35_Program_Staff_Data_Foundation.md`. SBOM v1.46 → v1.47 (`SBOM_GD33_Update.md`). Handoff: `SESSION_GD33_HANDOFF.md`. Note: `docs/34_Program_Staff_Visibility_Roadmap.md` exists in the same session but is a design/roadmap document, not a separate GD. |

## Maintenance going forward

Every new GD should be added to this table at the time it's approved, not reconstructed
later by search. The next available number as of this version is **GD-34**. Before
assigning it, confirm this table is still accurate against the real repository — a
registry that isn't checked is just a longer inference chain, not a fix.

---

*Governance Decision Registry · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
