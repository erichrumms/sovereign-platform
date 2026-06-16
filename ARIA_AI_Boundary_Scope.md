# SOVEREIGN Platform — ARIA Suite AI Boundary Scope Statement
**Formal Definition of the AI-Free Decision Boundary in ARC, TRACER, and CLEAR**

Document Type: Governance Boundary Record  
Version: 1.0 — May 2026  
Authority: Project Principal · SOVEREIGN Platform Governance Authority  
Status: APPROVED — incorporated into Integration Brief v1.3  
Classification: Pre-Decisional · Internal Working Document

---

## 1. The Question This Document Answers

ARIA Suite enforces compliance rules "deterministically with no AI in the decision path." This is a significant governance claim. The panel correctly probed its boundary: if AI tools are used during the setup, configuration, or ongoing maintenance of ARIA's rule base, then AI is in the decision path at the design layer even if not at the execution layer. That distinction matters for federal compliance and audit purposes, and the claim must be precisely scoped.

This document defines exactly where the AI boundary runs, what AI may and may not do in relation to ARIA, and what the claim "no AI in the decision path" means and does not mean.

---

## 2. What "No AI in the Decision Path" Means

### The Execution Layer — AI is Absent

At runtime, when ARIA evaluates a compliance case, no AI model is invoked. The evaluation path is:

1. A compliance record (authorization request, travel request, timecard entry) is submitted
2. ARIA's rules engine evaluates the record against the applicable typed rule objects in `ROUTING_RULES`, `POLICY_RULES`, or `DETECTION_RULES`
3. The evaluation is deterministic JavaScript: pure functions applied to structured data
4. A recommendation tier (APPROVE, APPROVE WITH AWARENESS, ESCALATE, or AUDIT_HOLD) is produced
5. A plain-English reasoning chain is generated from `rule.reasoning(actual, triggered)` — this is a template function applied to the rule data, not an AI generation
6. A named human decision-maker reviews the recommendation and reasoning chain
7. The human makes the decision and it is logged

**At no point in steps 1–7 is an AI model called.** This is enforced architecturally — ARIA modules contain no API calls to any AI provider. There is no conditional path by which an AI model could be invoked during case evaluation. This is verifiable by code inspection.

**The CPMI-VRS Gate 1 AI-absence attestation for every ARIA adjudication record states:**
- `model: none`
- `decision_maker: [human name]`
- `attestation: "This determination was made by a human decision-maker. No AI model evaluated, scored, or influenced this determination."`

This attestation is accurate as a statement about execution-layer behavior.

---

## 3. What "No AI in the Decision Path" Does Not Mean

### The Design Layer — AI May Assist, With Governance

The panel correctly identified that AI may be present at the design layer — in the processes of:
- Writing initial rule definitions
- Drafting plain-English reasoning chain templates
- Reviewing proposed rule changes for completeness and consistency
- Analyzing whether updated regulations are correctly captured in rule updates

**SOVEREIGN's position:** AI assistance at the design layer is permissible under the following conditions, all of which are governed and auditable:

**Condition 1 — Human validation is required before any rule enters production.** No rule definition, whether AI-assisted in drafting or human-authored, enters ARIA's production rule base without human expert validation. "Human expert" means a person with domain knowledge of the regulation being enforced — not just any reviewer. This validation is documented.

**Condition 2 — AI assistance is disclosed in the rule change record.** If Claude or any AI tool was used to draft a rule definition or reasoning chain template, this is noted in the ARIA Rule Maintenance Process change record. The disclosure is not a disqualification — it is a transparency requirement.

**Condition 3 — The rule definition, not the AI output, is the governed artifact.** The rule object in `ROUTING_RULES`, `POLICY_RULES`, or `DETECTION_RULES` — with its `id`, `label`, `field`, `condition`, `value`, `escalateTo`, and `ref` fields — is the artifact that must be human-validated. The AI's draft is an input to that artifact, not the artifact itself.

**Condition 4 — Reasoning chain templates are validated against the rule they explain.** A human reviewer confirms that the reasoning chain template accurately explains what the rule does and why. Misleading plain-English explanations of correct rules are a compliance risk because they affect how reviewers interpret borderline cases.

### Summary of the Boundary

| Activity | AI Role | Permissible | Governance Requirement |
|---|---|---|---|
| Evaluating a compliance case at runtime | None | N/A — AI is absent | AI-absence attestation on every record |
| Generating the recommendation tier | None — deterministic rules only | N/A | Verifiable by code inspection |
| Generating the reasoning chain at runtime | None — template function only | N/A | Verifiable by code inspection |
| Human reviewing the recommendation | None | N/A | Human decision logged with identity |
| Drafting a new rule definition | May assist | Yes, with disclosure | Human expert validation required before production |
| Drafting reasoning chain template text | May assist | Yes, with disclosure | Human validation against the rule required |
| Analyzing regulatory changes for rule impact | May assist | Yes, with disclosure | Human legal/compliance review required |
| Validating that updated rules capture regulation correctly | May assist | Yes, with disclosure | Human expert sign-off is the authoritative step |
| Modifying rule evaluation logic (the engine itself) | None | Not permissible | Engine changes are code changes governed by Prompt Registry process |

---

## 4. Implications for Federal Compliance and Audit

When a federal auditor or inspector general asks "was AI used in making this compliance determination," the correct answer for ARIA is:

**"No AI model was used in evaluating this case or making this determination. The rules applied were human-validated against the applicable regulations. Human expert validation records are available. If AI tools were used during rule drafting, this is disclosed in the rule change record."**

This answer is complete, accurate, and auditable. It does not create exposure from design-layer AI assistance because that assistance is disclosed, governed, and subject to human expert validation before it affects any determination.

---

## 5. The Claim as It Should Be Stated

**Internally and in governance documentation:** "ARIA Suite enforces compliance rules deterministically with no AI in the execution-layer decision path. AI assistance at the design layer — in rule drafting and rule maintenance — is permissible under documented governance conditions including mandatory human expert validation."

**In customer-facing or regulatory contexts:** "ARIA Suite's compliance determinations are made by human decision-makers applying human-validated rules. No AI model participates in case evaluation or adjudication. Rule definitions are maintained by human experts with documented validation processes."

Both statements are accurate. The first is the complete technical statement. The second is the appropriate public-facing statement.

---

*ARIA AI Boundary Scope Statement v1.0 · May 2026*  
*Pre-Decisional · Internal Working Document*
