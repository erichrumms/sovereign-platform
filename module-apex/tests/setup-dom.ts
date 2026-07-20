/**
 * module-apex — jsdom test setup.
 * Registers @testing-library/jest-dom matchers for the component tests.
 * ResizeObserver mock required for recharts (added Session 46).
 */
import "@testing-library/jest-dom";

// recharts uses ResizeObserver internally; jsdom does not provide it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
