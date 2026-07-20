// Jest stub for */cpmi-world-model-endpoint.ts — see moduleNameMapper in package.json.
// Returns null/undefined so CPMI stays in the synthetic/dev posture.
export function readWorldModelEndpoint(): string | null {
  return null;
}

export function readNotionApiKey(): string | undefined {
  return undefined;
}
