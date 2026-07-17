/**
 * Type declaration for Vite's ?raw import suffix.
 * Lets tsc (moduleResolution: bundler) accept `import text from '*.md?raw'`
 * without error. Jest handles these via moduleNameMapper + raw-transformer.
 */
declare module '*.md?raw' {
  const content: string;
  export default content;
}
