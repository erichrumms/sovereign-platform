/**
 * module-counsel — jsdom test setup.
 * Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.) for the
 * component tests. Harmless under the default node environment (it only augments
 * expect); the DOM matchers are exercised only by the jsdom-tagged component tests.
 */
import "@testing-library/jest-dom";
