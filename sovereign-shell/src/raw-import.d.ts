/**
 * Type declaration for Vite's ?raw import suffix — shell-workspace copy.
 *
 * Session 54: the shell's tsc program reaches module sources (via the
 * registered @sovereign/module-* imports and the WG-1 startup publisher), and
 * several module files import prompt text via `*.md?raw`. Each module carries
 * its own raw-import.d.ts for its own tsconfig, but ambient declarations are
 * not visible across program boundaries — without this copy the SHELL
 * workspace's `tsc --noEmit` fails on those imports (found failing at
 * Session 54 open, pre-existing). Same declaration as module-apex/src/
 * raw-import.d.ts; Jest handles these via moduleNameMapper + raw-transformer.
 */
declare module '*.md?raw' {
  const content: string;
  export default content;
}
