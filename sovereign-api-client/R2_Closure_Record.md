# SOVEREIGN Platform — R2 Closure Record
**AI Provider Abstraction Layer — Formally Closed as Rewrite-Debt Obligation**

Document Type: Governance Decision Record
Version: 1.0 — Session 2A, June 2, 2026
Authority: Project Principal · SOVEREIGN Platform Governance Authority
Status: CLOSED — R2 rewrite-debt obligation satisfied
Classification: Pre-Decisional · Internal Working Document

---

## What R2 Required

Architecture Section 14.2 stated:

> *"sovereign-api-client must provide: provider abstraction (products call the shared client — never a provider API directly; switching providers requires one config change in sovereign_config.yaml, not six product rewrites), three-tier fallback as platform standard, GovCloud endpoint routing (a separate configuration path for GovCloud deployments — this must be a first-class design path, not a retrofit), and a multi-vendor test harness."*

R2 also required this of the Tier 2 provider question:

> *"The Project Principal must determine before Stage 5: (a) which LLM provider or self-hosted model is authorized for the CUI tier, (b) whether a separate GovCloud LLM deployment is required, and (c) how this affects the tiered infrastructure design."*

---

## Governance Decision — Recorded June 2, 2026

**Decision maker:** Project Principal
**Decision date:** June 2, 2026
**Session:** Session 2A

> *"The sovereign-api-client will be built so that the Tier 2 (GovCloud/CUI) LLM provider is a configuration value, not a code dependency."*

This decision means: when the Tier 2 provider is selected (required before Stage 5 per R7), the resolution is a configuration change in `sovereign_config.yaml` — not a rewrite of any product module, not a change to the shell, and not a change to the Security Framework.

---

## What Was Built — Session 2A

| File | Location | Purpose |
|---|---|---|
| `types.ts` | `sovereign-api-client/src/types.ts` | Local re-export of `SovereignProduct` and `SovereignTier` — package compiles standalone |
| `base-client.ts` | `sovereign-api-client/src/base-client.ts` | Abstract base: auth headers, SOVEREIGN metadata injection, timeout enforcement, three-tier fallback (live → cached → static), FALLBACK_ACTIVATED Logger events |
| `anthropic-client.ts` | `sovereign-api-client/src/anthropic-client.ts` | Tier 1 provider: Anthropic Messages API wrapper, system message extraction, response parsing, Tier 1 enforcement (rejects enhanced-tier requests) |
| `govcloud-client.ts` | `sovereign-api-client/src/govcloud-client.ts` | Tier 2 provider stub: identical interface to AnthropicClient, `UNRESOLVED_PENDING_GOVCLOUD_DECISION` placeholder, `GovCloudNotYetResolvedException`, Tier 2 enforcement (rejects standard-tier requests) |
| `index.ts` | `sovereign-api-client/src/index.ts` | Package entry point: `createSovereignClient()` factory, all public exports, TypeScript exhaustiveness check on tier selection |

**Test results: 143 tests, 143 passing, 0 failures.**

| Test File | Tests | Coverage |
|---|---|---|
| `test_base_client.test.ts` | 33 | Three-tier fallback, metadata injection, timeout, cache key determinism, NullFallbackCache |
| `test_anthropic_client.test.ts` | 41 | Tier guard, header injection, message translation, response parsing, API errors, fallback integration |
| `test_govcloud_client.test.ts` | 32 | Tier guard, placeholder behavior, cache fallback, exception shape, named constants |
| `test_index.test.ts` | 37 | Provider selection, config overrides, misconfiguration errors, tier cross-enforcement, export surface |

---

## How the Three-Tier Fallback Works

Every LLM call goes through `BaseSovereignClient.complete()`, which executes this sequence regardless of which provider is selected:

**Tier 1 — Live provider:** The real HTTP call. On success, the response is wrapped in the SOVEREIGN metadata envelope and written to the cache for future fallback use.

**Tier 2 — Cache:** If the live call fails (timeout, API error, network error, or placeholder guard), the cache is checked for a prior successful response keyed on `product + workflow_step_id + provider`. If found, the cached response is returned with `fallback_activated: true` and the current request's `workflow_step_id` stamped into the metadata.

**Tier 3 — Static:** If both live and cache are unavailable, a static fallback response is returned. Content reads: *"SOVEREIGN AI service is temporarily unavailable. This is a static fallback response. Do not act on this content — retry when the service is restored."* `fallback_activated: true`. A `FALLBACK_ACTIVATED` Logger event is emitted at every non-live tier.

**Callers must gate on `response.fallback_activated` before taking consequential action.** This is enforced by convention, not by type — a fallback response is structurally identical to a live response except for the `fallback_tier` and `fallback_activated` fields.

---

## How GovCloud Routing Works

The Tier 2 routing path is fully built and enforced:

- `createSovereignClient({ tier: "enhanced" }, config, ...)` returns a `GovCloudClient` instance
- `GovCloudClient.complete()` rejects any request with `tier: "standard"` (mirror of `AnthropicClient` rejecting `"enhanced"`)
- `GovCloudClient.callProvider()` checks whether `this.endpoint === GOVCLOUD_PROVIDER_ENDPOINT`. If the placeholder is still in place, it throws `GovCloudNotYetResolvedException`, which the base class catches and converts to a static fallback response
- When R7 is resolved: set `GOVCLOUD_PROVIDER_ENDPOINT` in `sovereign_config.yaml`, update `GOVCLOUD_AUTH_HEADER_NAME`, `GOVCLOUD_PROVIDER_NAME`, and `GOVCLOUD_MODEL_ID`, implement the HTTP call in `callProvider()`, and remove the placeholder guard. **No other files change.**

---

## What Is Deferred and Why It Is Not Rewrite Debt

**What is deferred:** The identity of the Tier 2 LLM provider — which model, which endpoint, which auth mechanism. This is R7, tracked in Integration Brief v1.3 Section 11, required before Stage 5.

**Why it is not rewrite debt:** The `sovereign-api-client` package defines a stable interface (`BaseSovereignClient.complete()`) that all product modules call. The interface does not change when the Tier 2 provider is selected. The `GovCloudClient` class already exists, already has the correct method signatures, and already enforces the tier boundary. Resolving R7 changes the values inside `govcloud-client.ts` — it does not change the contract between the package and its callers.

**Analogy used in the governance decision discussion:** The package is the adapter panel in the wall. Products plug into the adapter. When the outlet standard (provider) changes, only the adapter internals change — not the appliances.

---

## What Remains Open

| Item | ID | Required Before | Status |
|---|---|---|---|
| Tier 2 LLM provider selection | R7 | Stage 5 | OPEN — not blocked by this session |
| FedRAMP sponsoring agency identification | — | Stage 5 | OPEN |
| Tier 3 (Classified) architecture design | — | Classified deployment | OPEN — deferred by design |

R7 is explicitly not a Stage 2 prerequisite. It is a Stage 5 prerequisite. The sovereign-api-client abstraction layer was built precisely so that R7's resolution is decoupled from product development.

---

## Integration Brief v1.4 Update Required

The following updates must be applied to Integration Brief v1.4 at the next Integration Brief session:

1. **R2 status:** Change to `CLOSED — sovereign-api-client v1.0 built Session 2A, June 2, 2026`
2. **R3 status:** Change to `CLOSED — Agent Operator Scope Document v1.0 approved June 2, 2026`
3. **Shell contract status:** Already recorded in v1.3 — no change needed
4. **New standing constraint:** Add to Section 6 — *"No product calls an LLM provider API directly — all LLM calls go through sovereign-api-client. Use `createSovereignClient()` from `@sovereign/api-client`. Never instantiate AnthropicClient or GovCloudClient directly."*
5. **SBOM:** New npm dependencies logged in SBOM_Registry.md (this session)

---

*R2 Closure Record v1.0 · Session 2A · June 2, 2026*
*Pre-Decisional · Internal Working Document*
*SOVEREIGN Platform — Project Principal approved*
