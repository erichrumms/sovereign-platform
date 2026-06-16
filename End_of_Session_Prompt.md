# SOVEREIGN Platform — End of Session Prompt
**Use at the close of every SOVEREIGN development session before moving to a new context window.**

Version: 1.3 — May 2026
Classification: Pre-Decisional · Internal Working Document

---

## Purpose

Claude has no memory between sessions. The governance and development documents are the project's memory. This prompt is run at the end of every SOVEREIGN session — before closing the conversation — to capture all decisions, updates, and changes, and to produce every governance and development document as a downloadable file for loading into the next session's context.

**Every document must be produced and available for download every time this prompt is run.** Documents that did not change this session are still produced — they are carried unchanged into the next session's context package. A document that is not downloaded cannot be loaded into the next conversation.

Do not skip this step. Do not run a partial version of this prompt.

---

## How to Use This Prompt

At the end of every SOVEREIGN session, paste the following into the chat. Fill in the bracketed fields before pasting. Claude will produce the session handoff document, assess and update every governance and development document, produce all 20 documents as downloadable files, and confirm the complete download package.

---

## THE PROMPT

```
You are the Documentation Agent for the SOVEREIGN Platform.

This session is closing and the conversation is ending. Before we finish,
produce the session handoff document, assess and update every governance
and development document, and provide ALL documents as downloadable files
so they can be loaded into the next session's context.

CRITICAL: Every document must be produced as a downloadable file regardless
of whether it was updated in this session. Documents that did not change are
produced with their current content unchanged. This ensures the complete
document set is available for the next session.

--- SESSION SUMMARY ---

Session date: [DATE]
Session number: [N] — [SESSION TITLE]
Product(s) worked on: [PRODUCT NAME(S)]
Stage: [STAGE NUMBER AND NAME]

What was built or decided in this session:
[List every component built, every decision made, every condition closed.]

What was NOT completed (intended but not done):
[List anything planned but not finished, and why.]

New open conditions or issues identified:
[Any new problems, gaps, or conditions.]

Decisions made that should become governance records:
[Any architectural decision, zone assignment, agent identity change, or design choice.]

Conditions closed from prior sessions:
[Any open conditions resolved in this session.]

Files created or modified:
[Every file created or modified with its path in the monorepo.]

What the next session should do first:
[The specific first action with enough context for a new Claude session.]

New dependencies added (for SBOM):
[Any new Python packages, npm packages, external APIs, or services added.]

--- END SESSION SUMMARY ---

Using the above summary, complete all five steps.

STEP 1 — SESSION HANDOFF DOCUMENT
STEP 2 — ALL 21 GOVERNANCE AND DEVELOPMENT DOCUMENTS (2a–2u)
STEP 3 — SBOM UPDATE
STEP 4 — INTEGRATION BRIEF UPDATE FLAG
STEP 5 — COMPLETE DOWNLOAD PACKAGE CONFIRMATION (minimum 25 files)
```

---

## Document Checklist (2a–2u)

2a. README.md
2b. architecture.md
2c. system_prompt.md
2d. PROJECT_SUMMARY.md
2e. project_plan.html
2f. Decision_Matrix.md
2g. Prompt_Registry_Specification.md
2h. Agent_Identity_Standard.md
2i. SOVEREIGN_FedRAMP_Infrastructure_Strategy.md
2j. SOVEREIGN_Federal_Records_Management_Position.md
2k. ARIA_AI_Boundary_Scope.md
2l. CPMI_Independent_Validation_Architecture.md
2m. APEX_Override_Mechanism_Design.md
2n. ARIA_Rule_Maintenance_Process.md
2o. Panel_Response.md
2p. AGENT_BACKGROUND_AND_LESSONS_LEARNED.md
2q. SOVEREIGN_Strategic_Gap_Analysis_ChangeNote_[YYYYMMDD].md
2r. SOVEREIGN_Delivery_Strategy_ChangeNote_[YYYYMMDD].md
2s. End_of_Session_Prompt.md
2t. VISUAL_DESIGN_SUMMARY.md
2u. BOTTOMS_UP_DESCRIPTION.md

Plus: Agent_Operator_Scope_SOVEREIGN.md (added Session 1 — travels with every subsequent session)

---

## Minimum File Count

1 handoff + 21 documents (2a–2u) + 1 Agent Operator Scope + 2 change notes + 1 SBOM = 26 files minimum from Session 2 forward.

---

*SOVEREIGN End of Session Prompt v1.3 · May 2026 (Session 1 note: minimum file count updated to 26)*
*Pre-Decisional · Internal Working Document*
