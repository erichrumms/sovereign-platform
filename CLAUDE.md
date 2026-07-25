# SOVEREIGN Platform — Build Agent Conventions

Read this before any commit. The full reference is `AGENT_REFERENCE.md`; this file
carries only the conventions that have actually been violated in this repository.

## 1 — Naming convention (non-negotiable)

The two AI roles are referred to **only** as **"Governance Agent"** and **"Build Agent."**
Never a model name, a version number, or a product name — not in commit messages, not in
Handoffs, not in SBOM updates, not in any `docs/NN` file, not anywhere.

This has been violated three times: a Session 58 Handoff "Agent:" line, a Session 61
Handoff "Build Agent:" line, and — continuously, from Session 55 through Session 61 — the
`Co-Authored-By` trailer on thirteen commits.

## 2 — Commit messages carry no tool attribution

Do **not** append any of the following to a commit message or PR body:

- `Co-Authored-By:` lines of any kind
- "Generated with…" footers
- Session deep-link URLs
- Any model, version, or product identifier

`.claude/settings.json` sets `attribution.commit`, `attribution.pr`, and
`attribution.sessionUrl` to suppress these. **That setting is known not to work** — an
upstream defect causes the built-in instruction to take precedence over the configured
value. This file is therefore the primary control, and `.githooks/commit-msg` is the
backstop. Do not remove either.

The thirteen historical commits carrying trailers are left in place deliberately: removing
them would require rewriting shared history. They are a documented, known gap, not a
hidden one.

## 3 — A session is not closed until `git push` has actually run

A chat recap describing finished work is not the same claim as a completed push. Show the
real output. Non-negotiable since Session 31.

## 4 — Governance documents are not yours to author

Never author or restructure a `docs/NN` spec, an Integration Brief, a Strategic Plan, or
any other governance document — even when the content would be accurate, and even after a
build completes. Surface the need; the Governance Agent writes it. (`AGENT_REFERENCE.md`
Lesson 25.)

## 5 — Placement discipline

Any commit that follows a governance-document placement must include `PLACEMENT_LOG.tsv`.
The placement script appends to it; omitting it from `git add` has now happened three times.

## 6 — Verify, don't assume

A claim about the repository's *state* needs the same verification as a claim about its
code. Run `ls` or `git status` before writing either down. Two consecutive sessions (60, 61)
each got the same file-location question wrong without ever checking.
