// Jest stub for */anthropic-key.ts — see moduleNameMapper in package.json.
// Returns undefined so engines degrade to cache/static (the intended test posture).
export function readAnthropicKey(): string | undefined {
  return undefined;
}
