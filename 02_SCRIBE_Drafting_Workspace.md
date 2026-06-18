# SCRIBE — Structured Capture, Reasoning, and Intelligence Bridge for Entry

**Document Type:** Companion App Architecture Specification  
**Version:** 1.0 — June 2026  
**Companion To:** SOVEREIGN Platform Integration Brief v1.3  
**Classification:** Pre-Decisional · Internal Working Document

-----

## Purpose

SCRIBE is the individual knowledge worker's drafting, synthesis, and capture workspace for work that flows *into* SOVEREIGN products. It is a structured environment that produces outputs in formats SOVEREIGN products can consume directly — without reformatting, without copy-paste, without manual entry. A program manager uses SCRIBE to draft a NEXUS correspondence. A reporting analyst uses SCRIBE to synthesize source data before APEX generates the quarterly report. A workflow analyst uses SCRIBE to capture informal process knowledge via voice before encoding it in a FLOWPATH VVR. An executive uses SCRIBE on mobile to capture a decision brief during a commute.

SCRIBE does not orchestrate agents. AgentOS owns orchestration. SCRIBE makes one LLM call at a time, routed through `sovereign-api-client`, with a human reviewing and approving every output before it enters any SOVEREIGN product.

-----

## 1. What SCRIBE Is Not

**SCRIBE does not have its own agent fleet.** SCRIBE calls the LLM once per task, with a human in the loop at every step. AgentOS runs pipelines.

**SCRIBE does not maintain its own knowledge graph.** SOVEREIGN's shared data model is the platform's knowledge layer. SCRIBE reads from SOVEREIGN products and writes back to them. Style DNA profiles are stored as canonical `StyleProfile` entities in `sovereign-data`, not in a private SCRIBE data store.

**SCRIBE does not manage workflows.** FLOWPATH owns workflow mapping. SCRIBE's voice-capture framing mode helps users *think through and capture* a workflow before opening FLOWPATH, but it does not encode, store, or execute workflows.

**SCRIBE is not an external publishing platform.** Output Studio (Section 3.6) handles external publication for non-SOVEREIGN content. SCRIBE's primary function is content that flows *into* the SOVEREIGN pipeline. Output Studio is a bounded secondary function for content flowing *out* to external audiences.

-----

## 2. The Core Problem SCRIBE Solves

SOVEREIGN's pipeline moves structured data from FLOWPATH VVRs through task management (NEXUS), governance review (CPMI), reporting (APEX), and compliance adjudication (ARIA). The humans who work in this pipeline spend a significant portion of their time on unstructured cognitive work: drafting, synthesis, field capture, and problem framing that does not yet fit into a product's structured fields.

Without SCRIBE, that work happens outside SOVEREIGN — in a personal note app, a voice memo, a general-purpose AI chat session, or the person's head. The output eventually makes its way into SOVEREIGN through manual entry, but the reasoning behind it is lost, the voice capture is unstructured, and the pipeline never sees it. COUNSEL captures decision reasoning; SCRIBE captures everything that needs to be drafted, synthesized, or captured before structured action is possible.

-----

## Project Architecture Summary

This section is written for Claude Code. Read it before writing any code, creating any file, or making any architectural decision for SCRIBE. When in doubt about the stack, return here rather than inferring from context.

### 1. What the App Is

SCRIBE is the drafting, synthesis, and capture module in the SOVEREIGN companion suite. It serves individual knowledge workers — program managers, reporting analysts, workflow analysts, field researchers — who need to produce structured content that enters SOVEREIGN products correctly, without manual reformatting or copy-paste. SCRIBE's two input modalities are typed text and voice capture (via Smart Capture). Its outputs are validated against the target SOVEREIGN product's canonical schema before the user approves export.

The core problem it solves: unstructured cognitive work — drafting, synthesis, field capture, problem framing — currently happens outside the SOVEREIGN pipeline, in tools with no governance provenance. SCRIBE brings that work inside the boundary, with a human approval gate before anything enters a SOVEREIGN product.

### 2. Technical Stack

|Layer               |Technology                                             |Notes                                                                                                                                          |
|--------------------|-------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
|Language            |TypeScript                                             |Strict mode; all files `.ts` or `.tsx`                                                                                                         |
|Framework           |React 18                                               |Functional components only; hooks pattern throughout                                                                                           |
|Module host         |`sovereign-shell`                                      |Option C federated module architecture; SCRIBE mounts as `module-scribe`                                                                       |
|State management    |React hooks (`useState`, `useReducer`, `useContext`)   |No Redux, no Zustand, no external state library                                                                                                |
|Voice capture       |Web Speech API                                         |Browser-native; no external transcription service. Supported in Chrome and Edge; degrades gracefully (typed-only mode) in unsupported browsers.|
|LLM calls           |`sovereign-api-client`                                 |Three-tier fallback: live API → cached → static template. Never call Anthropic API directly.                                                   |
|LLM model           |`claude-sonnet-4`                                      |Specified in `sovereign-api-client` config; do not hardcode model strings in SCRIBE                                                            |
|Logging             |SOF Logger via `ctx.logger`                            |SHA-256 hash-chained, append-only JSONL; inherited from shell context                                                                          |
|Auth                |`ctx.auth`                                             |SOVEREIGN RBAC; inherited from shell; do not implement independently                                                                           |
|Governance          |`ctx.governance`                                       |CPMI-VRS status; inherited from shell; do not implement independently                                                                          |
|Navigation          |`ctx.navigation`                                       |Shell-managed routing; use for all export routing to SOVEREIGN products                                                                        |
|Data types          |`sovereign-data` package                               |Import all canonical entity types and output schemas from here                                                                                 |
|Style profiles      |`sovereign-data` `StyleProfile` entity                 |Pending Governance Decision 1; do not build Style DNA until entity is approved                                                                 |
|External publication|GitHub + Cloudflare Pages (Output Studio web path only)|Strictly isolated behind DataClassificationGate; disabled by platform config flag for federal deployments                                      |
|Styling             |Tailwind CSS                                           |Shell-configured; use utility classes only                                                                                                     |
|Mobile layout       |Single-column, bottom-nav, one-handed capture spec     |Applied at breakpoints for Smart Capture views; see mobile capture design spec                                                                 |
|Testing             |Jest + React Testing Library                           |Unit tests for hooks; integration tests for export schema validation                                                                           |
|Build               |Vite                                                   |Per SOVEREIGN monorepo config                                                                                                                  |

### 3. Data Model

SCRIBE has no database of its own. `StyleProfile` entities (once Governance Decision 1 is approved) are stored in `sovereign-data` via `ctx.data`. All other SCRIBE data is transient session state, discarded when the session ends. The SOF Logger records what was produced and exported.

The entities SCRIBE works with:

**`DraftInput`** — the structured input for a drafting or synthesis session. Fields: `mode` (one of six product-aligned drafting modes or synthesis/framing), `inputModality` (`typed` | `voice`), `rawContent` (typed text or voice transcript), `sourceDocumentIds[]` (optional SOVEREIGN document references), `workflowStepId` (optional, if initiated from a SOVEREIGN product context). Transient session object.

**`DraftResult`** — the structured JSON returned by the LLM and validated against the target product's schema. Fields vary by `mode` — a Correspondence Draft has NEXUS task fields; a VVR Description has FLOWPATH VVR fields. Schema validation runs before this object is presented to the user.

**`StyleProfile`** — the user writing voice profile. Fields: `user_id`, `formality_score` (0–100), `sentence_complexity`, `vocabulary_density`, `structural_patterns[]`, `sample_count`, `created_at`, `updated_at`. Stored as a canonical entity in `sovereign-data`. **Pending Governance Decision 1.** Do not define this type in SCRIBE — import from `sovereign-data` once approved.

**`SynthesisBrief`** — the intermediate artifact produced by synthesis mode before drafting. Fields: `sourceCount`, `keyThemes[]`, `conflictingClaims[]`, `recommendedFraming`. Transient — it exists in session state as a review artifact; it is not exported to SOVEREIGN directly.

**Relationships:** One `DraftInput` → one `DraftResult` (validated against target schema) → user approves → export to SOVEREIGN product or Output Studio. A `StyleProfile` (if exists) is injected into the `DraftInput` processing step, not stored in the draft itself.

### 4. Key Integrations and Dependencies

|Integration                                           |Direction                             |Data                                                                                                                                               |Constraint                                                                                                             |
|------------------------------------------------------|--------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
|`sovereign-api-client`                                |Outbound                              |Mode-specific prompt + input → structured draft JSON                                                                                               |All LLM calls route here; never call Anthropic API directly                                                            |
|Web Speech API                                        |Inbound (browser-native)              |Live audio → real-time transcript                                                                                                                  |No external service; no audio data leaves the device. Graceful degradation if unavailable.                             |
|SOF Logger (`ctx.logger`)                             |Outbound                              |`SCRIBE_DRAFT_CREATED`, `SCRIBE_EXPORT_APPROVED`, `SCRIBE_EXPORT_EXTERNAL`, `VOICE_CAPTURE_COMPLETED` (pending GD2), `STYLE_PROFILE_UPDATED` events|Append-only; every event carries `agent_id` and `prompt_version`                                                       |
|`sovereign-data`                                      |Inbound (types + entity store)        |Output schemas per mode; `StyleProfile` entity read/write (pending GD1)                                                                            |Import only for types; write `StyleProfile` via `ctx.data`, not direct DB access                                       |
|SOVEREIGN products (NEXUS, APEX, CPMI, FLOWPATH, ARIA)|Outbound (export)                     |Schema-validated draft → target product                                                                                                            |Via `ctx.navigation`; no direct product API calls from SCRIBE                                                          |
|GitHub + Cloudflare Pages                             |Outbound (Output Studio web path only)|Public-classified content only                                                                                                                     |Blocked by `DataClassificationGate`; disabled by platform config for federal deployments; never receives SOVEREIGN data|

**Data sovereignty constraint:** Voice capture (Web Speech API) is processed entirely in the browser — no audio leaves the device. All text content flows through `sovereign-api-client`. The Output Studio web publishing path is the only route where content leaves the SOVEREIGN trust boundary, and it is blocked by mandatory data classification confirmation and a platform configuration flag.

### 5. Deployment and Environment

SCRIBE is a module in the SOVEREIGN monorepo with no independent deployment. It deploys when `sovereign-shell` deploys.

|Environment|Notes                                                                                                                                                  |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
|Development|Local monorepo dev server; `ctx.governance` uses local portfolio status stub; Output Studio web path can be tested with a dev GitHub repo              |
|Staging    |Per SOVEREIGN platform staging config; Output Studio web path disabled unless explicitly enabled                                                       |
|Production |Per SOVEREIGN platform production config; CPMI-VRS Gate 4 required before promotion; Output Studio web path disabled by default for federal deployments|

**Federal deployment constraint:** The Output Studio web publishing path (`Publish to Web`) must be suppressed via platform configuration flag for any federal or FedRAMP-authorized deployment. The code path exists; the flag disables it. Do not remove the code — remove access via configuration.

**Mobile constraint:** Smart Capture's mobile layout activates at standard Tailwind `md` breakpoint. The mobile layout is a distinct rendering path, not a responsive variant — it uses different component layouts optimized for one-handed capture. Confirm mobile layout spec before building the capture UI.

### 6. Component Map

```
module-scribe/
  ModeSelector            ← Entry point. User selects drafting/synthesis/framing/capture mode.
    ↓
  SmartCapturePanel       ← Voice capture via Web Speech API. Produces editable transcript.
  InputPanel              ← Typed input fields, per-mode structure. Accepts transcript from SmartCapture.
  StyleDNAManager         ← Style profile setup and management. Reads/writes StyleProfile entity.
    ↓
  useDraft                ← Hook: injects StyleProfile, calls sovereign-api-client, validates schema.
    ↓
  DraftViewer             ← Renders draft with inline editing.
  RevisionComparison      ← Side-by-side view of original and revised draft.
    ↓
  ExportPanel             ← Human approval step. Routes to SOVEREIGN product or Output Studio.
    ↓ (branching on export destination)
  [SOVEREIGN product]     ← Via ctx.navigation; schema-validated payload.
  DataClassificationGate  ← Mandatory confirmation before Output Studio path.
    ↓
  OutputStudio            ← Format selection (PDF, Word, plain text, email, web page).
```

Each component is a self-contained React component with a corresponding hook. The hook owns all LLM calls, Web Speech API interaction, entity reads/writes, and Logger emission. **Do not put API calls, Logger calls, or entity writes in component bodies.**

### 7. Governance and Access Rules

**RBAC:** SCRIBE inherits role-based access from `ctx.auth`. All four SOVEREIGN roles can access SCRIBE's core drafting and synthesis modes. Output Studio web publishing is additionally gated by a role permission check — not all roles can publish to the web even when the platform config allows it.

**CPMI-VRS gates enforced in code:**

- Gate 1: Disclosure banner in `ModeSelector` on every session start and in `SmartCapturePanel` before voice capture begins.
- Gate 2: `useLogger` emits on every draft creation, every capture session end, every style profile update, and every export (internal or external). If a Logger emit fails, surface an error — do not silently continue.
- Gate 3: No content reaches any SOVEREIGN product or Output Studio without explicit user approval in `ExportPanel`. Schema validation must pass before the approval button is active — a draft that fails schema validation cannot be exported.
- Gate 4: Pending Stage 3 REST API; no code changes required.

**Schema validation rule:** Every mode's output schema is imported from `sovereign-data`, not defined in SCRIBE. If the target product's schema changes, SCRIBE inherits the change on the next build. Do not hardcode field names or structures inside SCRIBE.

**Output Studio data boundary rule:** `DataClassificationGate` is not a UI nicety — it is a data boundary enforcement component. It must run before any content reaches the Output Studio code path. It cannot be bypassed by direct navigation, URL manipulation, or prop injection. Treat it as a security boundary, not a confirmation dialog.

**Prompt registry:** All four prompts (`drafting_system.md`, `synthesis_system.md`, `framing_system.md`, `style_analysis_system.md`) must be registered before any build session.

**Agent registry:** Both agent IDs (`scribe-drafter`, `scribe-style-analyst`) must be registered before any build session.

-----

## 3. Core Capabilities

### 3.1 Smart Capture (Voice Input)

Smart Capture is the voice input layer for all SCRIBE modes. The user speaks; SCRIBE transcribes in real time using the Web Speech API; the transcript feeds directly into the selected SCRIBE mode as the input text.

Smart Capture is not a standalone module. It is an input modality — an alternative to typing — available on every SCRIBE input panel. The user selects a mode (drafting, synthesis, framing), then chooses whether to type or capture by voice. The transcript is editable before submission, and the user confirms it before SCRIBE sends it to the LLM.

**Mobile capture:** Smart Capture is specifically optimized for mobile use. The mobile layout is single-column with one-handed operation, a large capture button, and a bottom navigation bar replacing the desktop sidebar. This matches the real-world usage pattern: voice capture happens on the move (commuting, between meetings, in the field); editing and export happen at a workstation.

**VOICE_CAPTURE_COMPLETED event:** When a capture session ends, SCRIBE emits a `VOICE_CAPTURE_COMPLETED` Logger event with duration, word count, target mode, and optional `workflow_step_id` if the capture was initiated from a SOVEREIGN product context. This event requires **Governance Decision 2** before it can be built.

### 3.2 Style DNA

Style DNA is a user writing voice profile that SCRIBE maintains across sessions and injects into drafting prompts. The profile is built from writing samples the user provides — pasted text, uploaded documents, or previously approved SCRIBE drafts. The analysis extracts formality, sentence complexity, vocabulary density, and structural patterns.

Once a Style DNA profile exists, SCRIBE's drafting prompts include a style instruction block derived from the profile. The result is drafts that read like the user's own writing, requiring fewer revision cycles for style correction. This separates the signal in SCRIBE's `revision_count` Logger events: style-correction revisions (which drop once a profile exists) are distinguished from content-correction revisions (which reflect genuine task complexity). Content-correction revision counts are the meaningful input to the Intelligence Layer's Automatability Scorer.

**StyleProfile entity:** Style DNA profiles are stored as `StyleProfile` canonical entities in `sovereign-data`, not in browser storage or a private SCRIBE data store. This requires **Governance Decision 1** (approval of `StyleProfile` as a new data dictionary entity) before it can be built. The `StyleProfile` entity is tagged `data_classification: user` in all Logger events and cannot be ingested by AgentOS pipelines without explicit user consent.

**Style DNA analysis agent:** The style analysis LLM call is performed by a registered agent (`scribe-style-analyst`) under a registered prompt (`style_analysis_system.md`). The resulting profile is a structured JSON object conforming to the `StyleProfile` schema, validated before storage.

### 3.3 Structured Drafting

SCRIBE provides a drafting environment for text artifacts that will enter SOVEREIGN products. Drafting modes are product-aligned:

|Mode                |Target Product|Output Format                                     |Voice Input Available|
|--------------------|--------------|--------------------------------------------------|---------------------|
|Correspondence Draft|NEXUS         |Task body + action items in NEXUS task schema     |✓                    |
|Program Narrative   |NEXUS / APEX  |Structured narrative with program_id reference    |✓                    |
|Report Commentary   |APEX          |QPR/ABS narrative section in APEX module format   |✓                    |
|VVR Description     |FLOWPATH      |Workflow step description in VVR export schema    |✓                    |
|Governance Memo     |CPMI          |Structured memo with decision_type tag            |✓                    |
|Rule Change Proposal|ARIA          |Proposed rule update in ARIA policy-as-data format|✓                    |

Each mode provides a structured prompt template. SCRIBE submits the completed template through `sovereign-api-client` and returns a draft. If a Style DNA profile exists, the draft prompt includes a style instruction block. The user edits the draft inline, then approves it for export. No draft enters a SOVEREIGN product without explicit human approval.

### 3.4 Source Synthesis

Before drafting, users often need to synthesize multiple sources — meeting notes, prior reports, policy documents, captured voice sessions — into a coherent understanding. SCRIBE's synthesis mode accepts multiple input blocks and produces a structured synthesis artifact — not the final document, but a synthesis brief the user reviews and annotates before drafting begins.

Synthesis inputs can include:

- Free text or voice-transcribed content
- Document references by `document_id` (SOVEREIGN canonical entity)
- Prior COUNSEL Decision Records (by record ID) — allowing SCRIBE to draft in awareness of a decision already analyzed
- Captured voice sessions from Smart Capture

The two-step structure (synthesize → review → draft) ensures the human is engaging with the material rather than delegating comprehension.

### 3.5 Voice-to-FLOWPATH Field Capture

This mode is the primary mitigation for OWI-FP-001 — the FLOWPATH Elicitation Methodology Gap identified in the SOVEREIGN Project Summary (Risk 10).

The gap: FLOWPATH VVRs currently capture process as described, not process as practiced. Unofficial workarounds, exceptions that became norms, and informal decision paths — the knowledge that lives in people's heads and surfaces in conversation — rarely emerge in structured facilitated sessions. Automation built on official process descriptions fails on contact with operational reality.

Voice capture is the natural solution. A workflow analyst conducting an informal conversation with a subject matter expert — in a facility, not a meeting room — can use SCRIBE on mobile to capture the conversation via Smart Capture, then route the transcript through the framing mode with particular attention to unofficial process, and export the structured pre-work directly to FLOWPATH as session context.

**The framing mode's field prompts** are specifically calibrated for this use case. They ask explicitly for:

- **Unofficial process paths.** What workarounds exist? Which exceptions have become norms?
- **Decision points.** Where does a human make a judgment call? (These become `decision_type` candidates in the VVR.)
- **Handoff friction.** Where does current process require manual reformatting or copy-paste?
- **Informal knowledge holders.** Who actually knows how this works, as distinct from who is officially responsible?

**Export to FLOWPATH:** The framing output is formatted as a structured pre-work document conforming to the FLOWPATH VVR export schema (`{step_id, description, inputs, outputs, decision_required, human_role}` — frozen fields from Integration Brief Section 2.1) and exported as a FLOWPATH session context artifact. The analyst brings this into a FLOWPATH session; FLOWPATH encodes the VVR. SCRIBE does not write VVRs — FLOWPATH does.

### 3.6 Iteration and Revision

Every SCRIBE output is versioned within the session. The user can request revisions with specific instructions, and SCRIBE maintains a side-by-side comparison of the original and revised draft.

When the user approves a draft for export, the approved version and the revision history are logged via the SOF Logger. The Logger event captures `revision_count`, `style_correction_revisions` (where Style DNA was available), and `content_correction_revisions`. This separation allows the Intelligence Layer's Automatability Scorer to distinguish revision cycles driven by content complexity from those driven by style mismatch, producing a more accurate signal of where human judgment is genuinely required.

### 3.7 Output Studio (Bounded External Publication)

Output Studio handles the output direction that SCRIBE's standard export path does not: content flowing *out* of SOVEREIGN to external audiences, not content flowing *into* SOVEREIGN products.

Output Studio is only accessible via the SCRIBE export step. It is not a standalone module. When a user approves a draft for export, the export destination choices are:

1. **SOVEREIGN product** (standard path — routes into the platform pipeline)
1. **Output Studio** (external publication path — requires data classification confirmation)

Choosing Output Studio triggers a mandatory data classification confirmation. The user must explicitly confirm that the content:

- Does not contain program data, CUI, or federal-sensitive information
- Has not been sourced from a SOVEREIGN product record or document
- Is appropriate for external distribution

If confirmed, Output Studio presents five export formats:

|Format      |Best for                               |
|------------|---------------------------------------|
|PDF         |Client delivery, formal reporting      |
|Word (.docx)|Collaborative editing, client templates|
|Plain text  |Pasting into any editor or CMS         |
|Email draft |Direct stakeholder communication       |
|Web page    |Living documents (see note below)      |

**Web page / Publish to Web:** This format is disabled by default. It is enabled only for users whose role and data classification permit public publication. When enabled, it routes content to Cloudflare Pages via GitHub. This path is architecturally isolated: no SOVEREIGN data can reach it unless the user explicitly confirms the data classification. The isolation is enforced at the SCRIBE export layer, not by policy reminder.

**Federal context note:** For federal-context deployments of SOVEREIGN, the web publishing path should be disabled at the platform configuration layer. The export path exists in the codebase; it is suppressed by a platform configuration flag for deployments where public web publishing is not permitted.

Output Studio actions are logged via the SOF Logger with `target: 'external'` and `data_classification_confirmed: true`. These events are auditable.

-----

## 4. Architecture

### 4.1 Position in the SOVEREIGN Monorepo

```
sovereign-shell/
  module-scribe/
    src/
      components/
        ModeSelector.tsx              ← selects drafting/synthesis/framing/capture mode
        SmartCapturePanel.tsx         ← voice input via Web Speech API
        InputPanel.tsx                ← structured input fields per mode
        StyleDNAManager.tsx           ← style profile setup and management
        DraftViewer.tsx               ← renders draft with inline editing
        RevisionComparison.tsx        ← side-by-side revision view
        ExportPanel.tsx               ← approves and routes output
        OutputStudio.tsx              ← external publication module
        DataClassificationGate.tsx    ← enforces classification check before Output Studio
      agents/
        scribe-drafter/
          prompts/
            drafting_system.md        ← versioned, registered in Prompt Registry
            synthesis_system.md       ← versioned, registered in Prompt Registry
            framing_system.md         ← versioned, registered in Prompt Registry
        scribe-style-analyst/
          prompts/
            style_analysis_system.md  ← versioned, registered in Prompt Registry
      types/
        scribe.ts                     ← output schemas per mode; no sovereign-data divergence
      hooks/
        useDraft.ts                   ← single-call LLM interface via sovereign-api-client
        useVoiceCapture.ts            ← Web Speech API integration
        useStyleProfile.ts            ← reads/writes StyleProfile entity
        useExport.ts                  ← routes approved output to SOVEREIGN product or Output Studio
        useLogger.ts                  ← SOF Logger event emission
```

### 4.2 LLM Call Architecture

SCRIBE makes one LLM call per user action. No chained calls, no parallel requests, no agent state across calls.

```
useDraft.ts
  → injects StyleProfile if available (from useStyleProfile)
  → createSovereignClient()               ← from sovereign-api-client
  → client.complete(modePrompt, schema)   ← mode-specific prompt + output schema
    → Tier 1: Live API
    → Tier 2: Cached response
    → Tier 3: Static template
  → validateSchema(response)
  → return DraftResult
```

The output schema is mode-specific and validated against the target product's canonical schema before the user approves export. A NEXUS task that arrives with missing required fields is a pipeline break. Schema validation at SCRIBE catches this before it happens.

### 4.3 Voice Capture Architecture

```
useVoiceCapture.ts
  → initializes Web Speech API
  → on start: begins real-time transcription
  → on stop:
    → transcript → InputPanel (user reviews and confirms)
    → emits VOICE_CAPTURE_COMPLETED Logger event (requires Governance Decision 2)
    → confirmed transcript feeds selected SCRIBE mode as input text
```

Voice capture does not call the LLM. It uses the browser's native Web Speech API for transcription. The LLM call happens at the drafting step, not the capture step.

### 4.4 Style DNA Architecture

```
useStyleProfile.ts
  → on load: reads StyleProfile entity from sovereign-data (if exists)
  → injects profile into drafting prompt if available

StyleDNAManager.tsx
  → accepts writing samples (paste or upload)
  → createSovereignClient() → scribe-style-analyst prompt → StyleProfile JSON
  → validateSchema(StyleProfile)
  → writes approved StyleProfile to sovereign-data via ctx.data
  → emits STYLE_PROFILE_UPDATED Logger event
```

The style analysis call is a registered agent call under a registered prompt. The resulting profile is stored in the canonical `sovereign-data` entity store, not in browser storage. This means the profile is available across devices and sessions — the same profile applies whether the user is capturing on mobile or drafting on desktop.

### 4.5 Export Architecture

```
ExportPanel.tsx
  → on approve:
    → if target: SOVEREIGN product
        → validateSchema(draft, targetProductSchema)
        → route via shell navigation to target product
        → emit SCRIBE_EXPORT_APPROVED Logger event
    → if target: Output Studio
        → DataClassificationGate.tsx: confirm data classification
        → if confirmed: OutputStudio.tsx → format selection
        → emit SCRIBE_EXPORT_EXTERNAL Logger event (data_classification_confirmed: true)
        → if NOT confirmed: block export, surface explanation
```

### 4.6 Registered Agents and Prompts

SCRIBE registers four prompts and two agent identities before any build begins:

|Prompt File               |Agent ID              |Purpose                                         |
|--------------------------|----------------------|------------------------------------------------|
|`drafting_system.md`      |`scribe-drafter`      |Structured drafting in all product-aligned modes|
|`synthesis_system.md`     |`scribe-drafter`      |Multi-source synthesis into structured brief    |
|`framing_system.md`       |`scribe-drafter`      |VVR pre-work and problem framing                |
|`style_analysis_system.md`|`scribe-style-analyst`|Writing sample analysis to extract StyleProfile |

-----

## 5. Integration with SOVEREIGN Products

### 5.1 NEXUS

NEXUS is the highest-volume SOVEREIGN product. SCRIBE complements NEXUS at the moment before a task is created or a correspondence is drafted.

**Inbound from NEXUS:** A task requiring a drafted response deep-links to SCRIBE in drafting mode, pre-populated with task context. Voice input is available — the user can dictate the response rather than type it. The draft exports back to NEXUS.

**Outbound to NEXUS:** SCRIBE exports approved correspondence drafts as NEXUS task payloads, formatted to the canonical task schema. NEXUS Track B document generation handlers are downstream consumers of content SCRIBE helps draft before it reaches the generation pipeline.

### 5.2 APEX

APEX generates reports. The human narrative contribution — management commentary, anomaly interpretation, executive analysis — has no structured home in the SOVEREIGN pipeline without SCRIBE.

**Before report generation:** SCRIBE's synthesis mode accepts program data, prior period reports, and anomaly flags as input (typed or voice-captured). It synthesizes a management commentary brief. The analyst reviews, edits, and exports it to the relevant APEX report section.

**DOE-NORM-001 HOLD context:** When APEX's governance hold is active, SCRIBE surfaces the hold notice from `ctx.governance`. Drafts created during a hold are tagged in the Logger event with a hold flag. This does not block drafting but ensures the audit trail reflects the governance condition at time of work.

### 5.3 FLOWPATH

SCRIBE's voice-to-FLOWPATH capability (Section 3.5) is the direct integration with FLOWPATH's OWI-FP-001 elicitation problem. The voice capture → framing → export path is the primary mechanism by which informal process knowledge reaches the FLOWPATH pipeline in structured form.

**Decision type pre-labeling:** The framing mode asks the analyst to tentatively label decision points with `decision_type` values from the Decision Matrix taxonomy. This pre-labeling is reviewed and confirmed during the FLOWPATH session. Pre-labeled decision types are more consistent than on-the-fly labeling — improving Judgment Detection training data quality downstream.

### 5.4 CPMI

CPMI produces governance recommendations. Humans reviewing those recommendations sometimes need to draft a response — an acceptance memo, a clarification request, a documented exception. SCRIBE's governance memo mode supports this, producing a memo that includes the CPMI recommendation reference, the decision, the reasoning, and the `decision_type` tag.

### 5.5 ARIA Suite

ARIA excludes AI from execution-layer decisions. SCRIBE respects this boundary absolutely. Authorization approvals, travel authorizations, and timecard compliance adjudications are out of scope.

In scope: ARIA rule maintenance decisions. Rule change proposals require a drafted justification, comparison of old and new rule text, and documentation of the regulatory source. SCRIBE's drafting mode produces the structured proposal; ARIA's rule maintenance process governs what happens next.

-----

## 6. Logger Event Design

```typescript
interface SCRIBELoggerEvent {
  event_type: 'SCRIBE_DRAFT_CREATED' | 'SCRIBE_SYNTHESIS_PRODUCED' |
              'SCRIBE_FRAMING_COMPLETED' | 'SCRIBE_EXPORT_APPROVED' |
              'SCRIBE_EXPORT_EXTERNAL' | 'VOICE_CAPTURE_COMPLETED' |  // pending GD2
              'STYLE_PROFILE_UPDATED';
  agent_id: string;
  prompt_version: string;
  workflow_step_id?: string;
  target_product?: SOVEREIGNProduct;
  drafting_mode: SCRIBEMode;
  input_modality: 'typed' | 'voice';
  revision_count: number;
  style_correction_revisions?: number;    // populated when Style DNA profile is active
  content_correction_revisions?: number;  // populated when Style DNA profile is active
  export_schema_valid: boolean;
  governance_hold_active: boolean;
  data_classification_confirmed?: boolean; // Output Studio path only
}
```

The separation of `style_correction_revisions` and `content_correction_revisions` is only meaningful when a Style DNA profile is active. These fields are `undefined` when no profile exists. When Style DNA is active, the Intelligence Layer's Automatability Scorer can isolate content-complexity revision cycles — the meaningful signal — from style-mismatch revision cycles, which reflect the absence of a style profile rather than task difficulty.

-----

## 7. CPMI-VRS Certification

|Gate                    |Requirement                                                                          |SCRIBE Status                               |
|------------------------|-------------------------------------------------------------------------------------|--------------------------------------------|
|Gate 1 — Disclosure     |AI involvement disclosed at mode selection and capture                               |✓ Disclosure in mode selector and capture UI|
|Gate 2 — Audit Trail    |Every draft, synthesis, capture, and export logged                                   |✓ Logger events on all actions              |
|Gate 3 — Human Oversight|No export without explicit human approval; classification gate before external export|✓ Approval required on all export paths     |
|Gate 4 — Certification  |CPMI world model confirms SCRIBE behavioral norms                                    |Pending — Stage 3 REST API                  |

-----

## 8. Governance Decision Dependencies

SCRIBE has two governance dependencies before the voice and style features can be built:

**Governance Decision 1** (new canonical entity `StyleProfile`): Required before Style DNA build. All typed drafting modes, synthesis mode, and framing mode have no dependency on this decision and can be built immediately.

**Governance Decision 2** (new Logger event type `VOICE_CAPTURE_COMPLETED`): Required before Smart Capture Logger emission can be built. The Web Speech API transcription itself can be built and tested first; the Logger event is added once the governance decision is recorded.

Both decisions are recommended to be requested together in a single governance session alongside Governance Decision 3 (COUNSEL's `PRIOR_POSITION_RECONCILIATION` event type).

-----

## 9. Session Zero Requirements

Before SCRIBE build work begins in any Claude Code session:

1. Load `SOVEREIGN_Integration_Brief_v1.3` + SCRIBE product insert + prior session handoff.
1. Confirm all four SCRIBE prompt registry entries exist in `Prompt_Registry_Specification.md`.
1. Confirm both SCRIBE agent IDs (`scribe-drafter`, `scribe-style-analyst`) exist in `Agent_Identity_Standard.md`.
1. Confirm output schemas for each drafting mode match the target product's canonical schema (imported from `sovereign-data`).
1. If building Style DNA: confirm Governance Decision 1 is recorded before proceeding.
1. If building Smart Capture Logger emission: confirm Governance Decision 2 is recorded before proceeding.
1. State the specific done condition for the session. Wait for Project Principal approval.

-----

*SCRIBE Architecture Specification · June 2026*  
*Pre-Decisional · Internal Working Document*  
*Companion to SOVEREIGN Platform Integration Brief v1.3*
