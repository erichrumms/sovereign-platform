/**
 * SOVEREIGN Platform — module-cpmi
 * cpmi-world-model-endpoint.ts — reads the CPMI world-model endpoint from platform config.
 *
 * Isolated into its own module on purpose, identical to vigil-endpoint.ts (Session 9):
 * `import.meta` is ESM-only and resolved by the bundler (Vite) at build time. The jest
 * CommonJS transform cannot parse `import.meta`, so jest maps this module to a stub
 * (tests/__mocks__/cpmi-world-model-endpoint.ts via moduleNameMapper) that returns null —
 * the default synthetic/dev posture.
 *
 * This is the platform-config binding for the Notion-backed world model. Providing
 * VITE_CPMI_WORLD_MODEL_ENDPOINT (and VITE_NOTION_API_KEY) is a CONFIGURATION change that
 * activates the live world model — NOT a CPMI rewrite (Standing Constraint #3). Governance
 * Clock stays OFF; until an endpoint is supplied this returns null and the synthetic/dev
 * backing is served.
 *
 * Version: 1.0 · Session 12 · June 23, 2026
 */
function env(): Record<string, string | undefined> | undefined {
  return (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
}

export function readWorldModelEndpoint(): string | null {
  return env()?.["VITE_CPMI_WORLD_MODEL_ENDPOINT"] ?? null;
}

export function readNotionApiKey(): string | undefined {
  return env()?.["VITE_NOTION_API_KEY"];
}
