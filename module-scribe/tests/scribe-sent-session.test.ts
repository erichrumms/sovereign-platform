/**
 * module-scribe — scribe-sent-session.test.ts (Session 56, WG-15).
 *
 * Unit tests for the session-persistent sent-state store:
 * markScribeItemSent / isScribeItemSent / resetScribeSessionForTests.
 * Mirrors the vigil-approval-session.test.ts unit pattern.
 */
import {
  markScribeItemSent,
  isScribeItemSent,
  resetScribeSessionForTests,
} from "../src/scribe-sent-session";

describe("scribe-sent-session — WG-15 session store (Session 55)", () => {
  beforeEach(() => resetScribeSessionForTests());

  it("returns false for any key on a fresh session", () => {
    expect(isScribeItemSent("any-key")).toBe(false);
  });

  it("markScribeItemSent makes isScribeItemSent return true for that key", () => {
    markScribeItemSent("key-a");
    expect(isScribeItemSent("key-a")).toBe(true);
  });

  it("marking one key does not affect other keys", () => {
    markScribeItemSent("key-a");
    expect(isScribeItemSent("key-b")).toBe(false);
  });

  it("markScribeItemSent is idempotent — calling twice leaves the key marked", () => {
    markScribeItemSent("key-a");
    markScribeItemSent("key-a");
    expect(isScribeItemSent("key-a")).toBe(true);
  });

  it("tracks multiple keys independently", () => {
    markScribeItemSent("key-a");
    markScribeItemSent("key-b");
    expect(isScribeItemSent("key-a")).toBe(true);
    expect(isScribeItemSent("key-b")).toBe(true);
    expect(isScribeItemSent("key-c")).toBe(false);
  });

  it("resetScribeSessionForTests wipes all marks — subsequent isScribeItemSent returns false", () => {
    markScribeItemSent("key-a");
    markScribeItemSent("key-b");
    resetScribeSessionForTests();
    expect(isScribeItemSent("key-a")).toBe(false);
    expect(isScribeItemSent("key-b")).toBe(false);
  });
});
