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
 * Version: 1.1 — synced to shell-contract v1.3 (GD-5), Session 3, June 13, 2026
 */

/**
 * The SOVEREIGN products: six primary products plus the four companion suite
 * modules (GD-5, June 13, 2026). Companion suite agents (e.g. counsel-analyst,
 * scribe-drafter) are LLM-backed and call this client, so their product
 * identifiers must be representable here.
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
  | "VIGIL";

/**
 * Infrastructure deployment tier.
 * standard = Tier 1 Commercial (Anthropic commercial API)
 * enhanced  = Tier 2 GovCloud/CUI (provider TBD — UNRESOLVED_PENDING_GOVCLOUD_DECISION)
 * Canonical source: shell-contract.ts, Section 1.
 */
export type SovereignTier = "standard" | "enhanced";
