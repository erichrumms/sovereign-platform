/**
 * SOVEREIGN Platform — module-scribe
 * scribe-sent-session.ts — session-persistent store of SCRIBE's sent T&T
 * review communications (WG-15, Session 55).
 *
 * Mirrors vigil-approval-session.ts's module-level singleton pattern
 * (Constraint #2): one in-memory Set per browser session, lazily initialized.
 * Tracks which TTReviewItem keys have been sent so ScribeApp, WorkspaceApp's
 * SCRIBE section, and startup-publish.ts all see the same live sent-state
 * rather than re-deriving from the static DEMO_TT_REVIEW_ITEMS seed on every
 * mount.
 *
 * Before this file, ScribeApp's two mount useEffects unconditionally published
 * ALL six DEMO_TT_REVIEW_ITEMS, so a user who sent item A in the Reviewer's
 * Workspace and then navigated to SCRIBE would see all six republished — the
 * sent item reappeared (WG-15 root cause).
 *
 * No governance authority (Constraint #1): marking an item sent does not emit
 * any Logger event. TTManagerReview's own onSent path emits
 * TIME_CORRECTION_SENT independently. This store tracks the fact.
 *
 * SESSION-SCOPED ONLY: in-memory, one browser session. NOT cross-session
 * decision history — that is WG-14, a separate governance decision (Session 54
 * opening prompt, D6 scope note).
 *
 * Version: 1.0 · Session 55 (WG-15) · July 22, 2026
 */

let sentKeys: Set<string> | null = null;

function ensureSentKeys(): Set<string> {
  if (sentKeys === null) sentKeys = new Set();
  return sentKeys;
}

/** Mark a T&T review item key as sent for this session. Idempotent. */
export function markScribeItemSent(key: string): void {
  ensureSentKeys().add(key);
}

/** Returns true if this item key was sent earlier in this session. */
export function isScribeItemSent(key: string): boolean {
  return sentKeys?.has(key) ?? false;
}

/** Test-only: discard the session so each test starts with a clean slate. */
export function resetScribeSessionForTests(): void {
  sentKeys = null;
}
