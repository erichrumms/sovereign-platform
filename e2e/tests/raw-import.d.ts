/**
 * Type declaration for Vite's ?raw import suffix — e2e-workspace copy.
 *
 * Session 54: the e2e tsc program reaches module sources that import prompt
 * text via `*.md?raw` (found failing at Session 54 open, pre-existing — each
 * module's own raw-import.d.ts is not visible across program boundaries).
 * Same declaration as module-apex/src/raw-import.d.ts; Jest handles these via
 * moduleNameMapper + raw-transformer.
 */
declare module '*.md?raw' {
  const content: string;
  export default content;
}
