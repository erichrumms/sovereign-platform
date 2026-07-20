/**
 * sovereign-shell — jsdom test setup.
 * Registers @testing-library/jest-dom matchers for the component tests. Harmless
 * under the default node environment (it only augments expect).
 */
import "@testing-library/jest-dom";
