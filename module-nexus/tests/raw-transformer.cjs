/**
 * Jest raw-file transformer — returns the source text as a CJS string export.
 * Used in concert with moduleNameMapper stripping the Vite ?raw suffix so that
 * `import text from '*.md?raw'` resolves in Jest the same way it does in Vite.
 * esModuleInterop's __importDefault wraps the string as { default: value }.
 */
module.exports = {
  process(sourceText) {
    return { code: `module.exports = ${JSON.stringify(sourceText)};` };
  },
};
