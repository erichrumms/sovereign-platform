# sovereign-data — Companion Suite Package Specification
## Entity and Event Type Additions

**Document Type:** Package Specification — Claude Code Build Reference
**Session:** Companion Suite Registration
**Date:** June 11, 2026
**Classification:** Pre-Decisional · Internal Working Document
**File Location:** `7 - SOVEREIGN/Companion Suite/Governance/`

---

## Purpose

This document specifies the additions to the `sovereign-data` package and
`shell-contract.ts` required by governance decisions GD-1, GD-2, and GD-3.
It is written for Claude Code. A build session opening with this document loaded
can implement all three additions without re-deriving them from governance prose.

---

## Part 1 — `sovereign-data` Package: StyleProfile Entity (GD-1)

### 1.1 Package Location

```
sovereign-platform/
└── sovereign-data/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts              ← public surface — re-exports all canonical types
        ├── entities/
        │   ├── employee.ts       ← existing
        │   ├── program.ts        ← existing
        │   ├── cost-code.ts      ← existing
        │   ├── document.ts       ← existing
        │   ├── vendor.ts         ← existing
        │   └── style-profile.ts  ← NEW — GD-1
        └── events/
            └── sovereign-event-types.ts  ← existing — updated by GD-2 and GD-3
                                            (see Part 2, but event types live in
                                            shell-contract.ts not sovereign-data)
```

**Note on event types:** `SovereignEventType` is defined in `shell-contract.ts`,
not in `sovereign-data`. The event type additions (GD-2, GD-3) are Part 2 of this
document. `sovereign-data` owns entity types and output schemas. `shell-contract.ts`
owns the platform event taxonomy.

### 1.2 StyleProfile Entity — `src/entities/style-profile.ts`

```typescript
/**
 * StyleProfile — Canonical Entity
 * Approved: GD-1, June 11, 2026, Project Principal
 * Owner: module-scribe (scribe-style-analyst agent)
 * Data Classification: user
 *
 * Personal writing voice profile maintained by SCRIBE's Style DNA feature.
 * Contains no program data, task data, or compliance-sensitive content.
 * One profile per user_id. Updates are in-place — history is not retained.
 *
 * FIELD NAMES ARE FROZEN. No module may redefine or rename these fields.
 * Additions require a new governance decision and sovereign-data version increment.
 */

export interface StyleProfile {
  /** SOVEREIGN user identifier — matches ctx.auth.userId */
  user_id: string;

  /**
   * Overall formality level of the user's writing.
   * 0 = highly informal, 100 = highly formal.
   * Integer. Validated: must be 0–100 inclusive.
   */
  formality_score: number;

  /**
   * Characteristic sentence structure complexity.
   * 'simple'   — short sentences, minimal subordinate clauses
   * 'moderate' — mixed structure, some complex sentences
   * 'complex'  — frequent subordinate clauses, longer sentences
   */
  sentence_complexity: 'simple' | 'moderate' | 'complex';

  /**
   * Characteristic vocabulary level.
   * 'accessible'  — common vocabulary, minimal jargon
   * 'technical'   — domain-specific terminology, assumes familiarity
   * 'specialized' — highly specialized, field-specific terminology
   */
  vocabulary_density: 'accessible' | 'technical' | 'specialized';

  /**
   * Recurring structural patterns observed in the user's writing.
   * String array — values are descriptive labels extracted by scribe-style-analyst.
   * Examples: ['active voice', 'short paragraphs', 'bullet-point lists',
   *            'numbered steps', 'direct address', 'hedging language']
   * Array may be empty if no strong patterns are detected.
   */
  structural_patterns: string[];

  /**
   * Total number of writing samples analyzed to build this profile.
   * Additive across profile updates — incremented on each Style DNA analysis call.
   * Used to signal profile confidence: low sample_count = less reliable profile.
   * Minimum meaningful profile: sample_count >= 1 (200+ words recommended per sample).
   */
  sample_count: number;

  /** ISO 8601 — profile first created */
  created_at: string;

  /** ISO 8601 — profile last updated */
  updated_at: string;
}

/**
 * StyleProfileUpdate — the partial shape used when updating an existing profile.
 * user_id and created_at are immutable after creation.
 * sample_count is always incremented, never set directly.
 */
export type StyleProfileUpdate = Omit<StyleProfile, 'user_id' | 'created_at'>;

/**
 * Runtime validation for StyleProfile.
 * Call before writing a StyleProfile to sovereign-data.
 * Returns { valid: true } or { valid: false, errors: string[] }.
 */
export function validateStyleProfile(
  profile: unknown
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];
  const p = profile as Partial<StyleProfile>;

  if (typeof p.user_id !== 'string' || p.user_id.trim() === '') {
    errors.push('user_id: required string');
  }
  if (typeof p.formality_score !== 'number' ||
      !Number.isInteger(p.formality_score) ||
      p.formality_score < 0 ||
      p.formality_score > 100) {
    errors.push('formality_score: must be integer 0–100');
  }
  if (!['simple', 'moderate', 'complex'].includes(p.sentence_complexity as string)) {
    errors.push('sentence_complexity: must be simple | moderate | complex');
  }
  if (!['accessible', 'technical', 'specialized'].includes(p.vocabulary_density as string)) {
    errors.push('vocabulary_density: must be accessible | technical | specialized');
  }
  if (!Array.isArray(p.structural_patterns)) {
    errors.push('structural_patterns: must be string[]');
  }
  if (typeof p.sample_count !== 'number' ||
      !Number.isInteger(p.sample_count) ||
      p.sample_count < 1) {
    errors.push('sample_count: must be integer >= 1');
  }
  if (typeof p.created_at !== 'string') {
    errors.push('created_at: required ISO 8601 string');
  }
  if (typeof p.updated_at !== 'string') {
    errors.push('updated_at: required ISO 8601 string');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
```

### 1.3 Public Surface Update — `src/index.ts`

Add to the existing `index.ts` exports:

```typescript
// Existing exports (do not modify)
export * from './entities/employee';
export * from './entities/program';
export * from './entities/cost-code';
export * from './entities/document';
export * from './entities/vendor';
// ... other existing exports

// GD-1 — approved June 11, 2026
export type { StyleProfile, StyleProfileUpdate } from './entities/style-profile';
export { validateStyleProfile } from './entities/style-profile';
```

### 1.4 Package.json and tsconfig.json

`sovereign-data` follows the same package scaffold as `sovereign-api-client`:
- TypeScript strict mode
- `devDependencies` only (no production runtime npm deps)
- Jest for unit tests
- Exports via `src/index.ts`

Minimum test suite for `style-profile.ts`:
- `validateStyleProfile` passes a valid StyleProfile
- `validateStyleProfile` rejects formality_score outside 0–100
- `validateStyleProfile` rejects non-integer formality_score
- `validateStyleProfile` rejects invalid sentence_complexity value
- `validateStyleProfile` rejects invalid vocabulary_density value
- `validateStyleProfile` rejects sample_count < 1
- `validateStyleProfile` rejects non-array structural_patterns
- Round-trip test: valid profile → validate → re-parse → identical

---

## Part 2 — `shell-contract.ts` v1.1: Event Type Additions (GD-2 + GD-3)

### 2.1 Change Summary

`shell-contract.ts` v1.0 → v1.1. Two new members added to `SovereignEventType`
union type. No other changes.

**Changelog entry to add at top of shell-contract.ts:**

```typescript
/**
 * shell-contract.ts
 * SOVEREIGN Platform Shell ↔ Module Interface Contract
 *
 * v1.1 — June 11, 2026
 *   Added VOICE_CAPTURE_COMPLETED to SovereignEventType (GD-2, approved
 *   Project Principal June 11, 2026)
 *   Added PRIOR_POSITION_RECONCILIATION to SovereignEventType (GD-3, approved
 *   Project Principal June 11, 2026)
 *   See Governance_Decision_Record_GD1_GD2_GD3.md
 *
 * v1.0 — June 2, 2026
 *   Initial approved version
 */
```

### 2.2 SovereignEventType Union — Diff

Locate the existing `SovereignEventType` union in `shell-contract.ts` and add
the two new members. The existing union (reconstruct from shell-contract.ts v1.0
— do not rely on memory for exact existing members):

```typescript
// BEFORE (v1.0) — existing members shown as placeholder; use actual v1.0 content
export type SovereignEventType =
  | 'AGENT_STEP_START'
  | 'AGENT_STEP_COMPLETE'
  | 'HUMAN_DECISION'
  | 'SYSTEM_EVENT'
  | 'FALLBACK_ACTIVATED'
  // ... all existing v1.0 members ...
  ;

// AFTER (v1.1) — add these two members to the union
export type SovereignEventType =
  | 'AGENT_STEP_START'
  | 'AGENT_STEP_COMPLETE'
  | 'HUMAN_DECISION'
  | 'SYSTEM_EVENT'
  | 'FALLBACK_ACTIVATED'
  // ... all existing v1.0 members ...
  // GD-2 — June 11, 2026
  | 'VOICE_CAPTURE_COMPLETED'
  // GD-3 — June 11, 2026
  | 'PRIOR_POSITION_RECONCILIATION'
  ;
```

**Implementation note:** Do not reconstruct the existing union from memory or this
document. Load the actual `shell-contract.ts` v1.0 file and append to it. The
existing members are authoritative; this document shows only the additions.

### 2.3 Event Payload Types

Add these payload type definitions to `shell-contract.ts` alongside existing
event payload types:

```typescript
/**
 * VOICE_CAPTURE_COMPLETED — GD-2, approved June 11, 2026
 * Emitted by: scribe-drafter (module-scribe / useVoiceCapture.ts)
 * Data classification: user — invariant, never change
 */
export interface VoiceCaptureCompletedEvent {
  event_type:          'VOICE_CAPTURE_COMPLETED';
  agent_id:            string;              // 'scribe-drafter'
  duration_seconds:    number;              // capture session duration
  word_count:          number;              // words in resulting transcript
  target_mode:         SCRIBEMode;          // drafting mode the capture feeds
  workflow_step_id?:   string;              // present if initiated from product context
  data_classification: 'user';             // invariant
}

/**
 * SCRIBEMode — the six product-aligned drafting modes plus synthesis and framing.
 * Used in VoiceCaptureCompletedEvent.target_mode.
 * Values must match the mode selector in module-scribe.
 */
export type SCRIBEMode =
  | 'correspondence_draft'    // → NEXUS
  | 'program_narrative'       // → NEXUS / APEX
  | 'report_commentary'       // → APEX
  | 'vvr_description'         // → FLOWPATH
  | 'governance_memo'         // → CPMI
  | 'rule_change_proposal'    // → ARIA
  | 'synthesis'               // → intermediate artifact
  | 'framing'                 // → FLOWPATH pre-work
  ;

/**
 * PRIOR_POSITION_RECONCILIATION — GD-3, approved June 11, 2026
 * Emitted by: counsel-analyst (module-counsel / usePriorPositionCheck.ts)
 * Both resolution paths are logged. Neither is blocked.
 */
export interface PriorPositionReconciliationEvent {
  event_type:             'PRIOR_POSITION_RECONCILIATION';
  agent_id:               string;           // 'counsel-analyst'
  current_decision_id:    string;
  conflicting_record_ids: string[];
  resolution:             'acknowledged' | 'dismissed';
  /**
   * Present when resolution === 'acknowledged'.
   * Absent (not undefined, absent from object) when resolution === 'dismissed'.
   * Schema validation enforces this constraint.
   */
  reconciliation_note?:   string;
  decision_type:          DecisionType;     // from Decision Matrix taxonomy
  workflow_step_id?:      string;
}
```

### 2.4 Impact Assessment Checklist (Claude Code Task)

Before committing `shell-contract.ts` v1.1, complete this assessment:

- [ ] Search all six primary product modules and three companion suite modules
      for `switch` statements on `SovereignEventType` or `event_type`
- [ ] For each exhaustive switch found, add a case for `VOICE_CAPTURE_COMPLETED`
      and `PRIOR_POSITION_RECONCILIATION`
- [ ] Run `tsc --noEmit` strict across the full monorepo — 0 errors required
- [ ] SHA-256 verify the root `shell-contract.ts` and `sovereign-shell/shell-contract.ts`
      copies are byte-identical after update
- [ ] Record impact assessment result in the session handoff document

**Expected result:** Adding new union members to a TypeScript union is non-breaking
for modules that do not use exhaustive switches. The companion suite modules are
new (no existing switch statements). The primary product modules should be checked
but are unlikely to have exhaustive switches on `SovereignEventType` at this stage.

### 2.5 Copy Synchronization

After the v1.1 update, both copies must be updated and verified:

```bash
# After updating the root copy:
cp shell-contract.ts sovereign-shell/shell-contract.ts

# Verify byte-identical:
shasum -a 256 shell-contract.ts
shasum -a 256 sovereign-shell/shell-contract.ts
# Hashes must match. Record both hashes in session handoff.
```

---

## Part 3 — SCRIBE Mode Output Schemas

SCRIBE's `drafting_system.md` prompt (PR-SCRIBE-001) requires mode-specific output
schemas imported from `sovereign-data`. These schemas must be defined in
`sovereign-data` before SCRIBE build begins. Add to `src/schemas/scribe-modes.ts`:

```typescript
/**
 * SCRIBE Mode Output Schemas
 * Imported by module-scribe; validated before user approval at ExportPanel.
 * Each schema matches the target product's canonical intake format.
 * Do not hardcode field names in module-scribe — import from here.
 */

/** Correspondence Draft → NEXUS task intake */
export interface CorrespondenceDraftSchema {
  subject:        string;
  body:           string;
  action_items:   ActionItem[];
  program_id?:    string;
  document_id?:   string;
  decision_type?: DecisionType;
}

export interface ActionItem {
  description:   string;
  owner_role?:   string;
  due_date?:     string;   // ISO 8601
}

/** Program Narrative → NEXUS or APEX */
export interface ProgramNarrativeSchema {
  program_id:    string;
  period:        string;
  narrative:     string;
  key_themes:    string[];
  risks_noted:   string[];
}

/** Report Commentary → APEX QPR/ABS narrative section */
export interface ReportCommentarySchema {
  report_section: 'executive_summary' | 'program_status' |
                  'financial_summary' | 'risks_issues' | 'outlook';
  program_id:     string;
  commentary:     string;
  anomalies_addressed: string[];
}

/** VVR Description → FLOWPATH — frozen fields per Integration Brief §9 */
export interface VVRDescriptionSchema {
  step_id:          string;
  description:      string;
  inputs:           string[];
  outputs:          string[];
  decision_required: boolean;
  human_role:       string;
  decision_type?:   DecisionType;   // provisional label from framing mode
}

/** Governance Memo → CPMI */
export interface GovernanceMemoSchema {
  subject:        string;
  cpmi_reference: string;      // CPMI recommendation or gate reference
  decision:       string;
  reasoning:      string;
  decision_type:  DecisionType;
}

/** Rule Change Proposal → ARIA policy-as-data format */
export interface RuleChangeProposalSchema {
  rule_id:          string;
  current_rule:     string;
  proposed_rule:    string;
  justification:    string;
  regulatory_source: string;
  effective_date?:  string;   // ISO 8601
}
```

Add to `src/index.ts`:

```typescript
// SCRIBE mode output schemas
export type {
  CorrespondenceDraftSchema,
  ActionItem,
  ProgramNarrativeSchema,
  ReportCommentarySchema,
  VVRDescriptionSchema,
  GovernanceMemoSchema,
  RuleChangeProposalSchema,
} from './schemas/scribe-modes';
```

---

## Part 4 — Build Sequence for Claude Code

Execute in this order within the Stage 2 companion suite sessions:

1. **Build `sovereign-data` package scaffold** — `package.json`, `tsconfig.json`,
   Jest config, following the `sovereign-api-client` pattern.

2. **Implement existing canonical entities** — port Employee, Program, Cost Code,
   Document, Vendor from their current definitions into the package with validation
   functions. These should already exist in SOVEREIGN documentation; confirm field
   names against the data dictionary before porting.

3. **Implement `StyleProfile` entity** — from the spec in Part 1 of this document.
   Write tests first. Minimum 8 tests per §1.4.

4. **Implement SCRIBE mode output schemas** — from Part 3 of this document.
   No validation functions required at this stage; types only.

5. **Update `shell-contract.ts` to v1.1** — per Part 2. Run impact assessment.
   `tsc --noEmit` strict, 0 errors. SHA-256 verify both copies.

6. **Scaffold `module-counsel/`** — implement `SovereignModuleContract`,
   register with `ModuleLoader`. Confirm it mounts. Then build COUNSEL core.

7. **Scaffold `module-scribe/`** — same pattern. Then build SCRIBE typed modes.

8. **Scaffold `module-lens/`** — same pattern. Build last.

---

## Part 5 — Session Zero Checklist Additions

Add these items to the Session Zero checklist for any companion suite build session:

- [ ] `sovereign-data` package exists and exports `StyleProfile` (required for
      Style DNA and SCRIBE schema validation)
- [ ] `shell-contract.ts` is at v1.1 (required for `VOICE_CAPTURE_COMPLETED` and
      `PRIOR_POSITION_RECONCILIATION` Logger emission)
- [ ] Integration Brief v1.5 loaded (companion suite §19 must be in context)
- [ ] `Governance_Decision_Record_GD1_GD2_GD3.md` loaded (confirms all three
      decisions are in context — not reconstructed from memory)

---

*sovereign-data Companion Suite Package Specification*
*Session: Companion Suite Registration · June 11, 2026*
*Claude Code build reference — load in Stage 2 companion suite sessions*
*Pre-Decisional · Internal Working Document*
*File Location: 7 - SOVEREIGN/Companion Suite/Governance/*
