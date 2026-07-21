/**
 * SOVEREIGN Platform — sovereign-api-client
 * types.ts
 *
 * Local re-exports of the shell-contract types consumed by this package.
 *
 * WHY THIS FILE EXISTS:
 * sovereign-api-client is a shared package that must compile and test in
 * isolation — without the full monorepo present. Rather than importing
 * directly from ../../sovereign-shell/shell-contract (which breaks
 * standalone builds), we maintain local copies of the two types this
 * package needs.
 *
 * GOVERNANCE CONSTRAINT:
 * These type definitions must remain identical to the canonical versions
 * in shell-contract.ts. Any change to SovereignProduct or SovereignTier
 * in shell-contract.ts requires a matching update here. This is a
 * governance obligation, not an optional sync.
 *
 * Source of truth: sovereign-shell/shell-contract.ts (Section 1)
 * Version: 1.3 — synced to shell-contract v1.21 (GD-26), Session 52, July 20, 2026
 *   (added WORKSPACE to SovereignProduct)
 * Version: 1.2 — synced to shell-contract v1.6 (GD-8), Session 13, June 24, 2026
 *   (added ClearanceLevel for the Local LLM data-classification routing field;
 *    ClearanceLevel is the canonical classification taxonomy — Standing Constraint #2,
 *    no divergent "DataClassification" duplicate)
 */

/**
 * The SOVEREIGN products: six primary products plus the four companion suite
 * modules (GD-5, June 13, 2026) plus the Reviewer's Workspace (GD-26, July 20, 2026).
 * Companion suite agents (e.g. counsel-analyst, scribe-drafter) are LLM-backed and
 * call this client, so their product identifiers must be representable here.
 * Canonical source: shell-contract.ts, Section 1 — kept byte-for-meaning
 * identical per the governance obligation in this file's header.
 */
export type SovereignProduct =
  // Six primary products
  | "NEXUS"
  | "CPMI"
  | "APEX"
  | "FLOWPATH"
  | "AGENTOS"
  | "ARIA"
  // Four companion suite modules — GD-5, shell-contract v1.3
  | "COUNSEL"
  | "SCRIBE"
  | "LENS"
  | "VIGIL"
  // Reviewer's Workspace — GD-26, July 20, 2026 (shell-contract v1.21)
  | "WORKSPACE";

/**
 * Infrastructure deployment tier.
 * standard = Tier 1 Commercial (Anthropic commercial API)
 * enhanced  = Tier 2 GovCloud/CUI (provider TBD — UNRESOLVED_PENDING_GOVCLOUD_DECISION)
 * Canonical source: shell-contract.ts, Section 1.
 */
export type SovereignTier = "standard" | "enhanced";

/**
 * Data classification of a request — the canonical taxonomy used for Local LLM
 * provider routing (GD-8, shell-contract v1.6). This is the SAME taxonomy as
 * shell-contract.ts `ClearanceLevel` (Section 1): there is no separate
 * "DataClassification" type (Standing Constraint #2 — no divergent duplicate of a
 * data-dictionary concept). Synced copy, governance-obligated per this file's header.
 */
export type ClearanceLevel =
  | "UNCLASSIFIED"
  | "CUI"
  | "SECRET"
  | "TOP_SECRET";
