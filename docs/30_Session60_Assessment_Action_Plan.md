# docs/30 — Session 60 Assessment: Action Plan and Sequencing

**Prepared by:** Governance Agent, July 23, 2026
**Status:** Decided framing, open scoping — this document sets priority and sequencing; the
actual build session(s) still need to be launched.
**Origin:** Session 60's end-to-end R/E/S assessment
(`SOVEREIGN_Platform_EndToEnd_Assessment_20260723.md`). Every finding cited below was
independently re-verified against the real repository by the Governance Agent, not taken from the
report's own claims alone — see the specific file:line evidence in each item.

---

## 1 — The one thing that changes how everything else gets built

**D3-9 is not "one more finding" — it's a constraint on how the resurrection-family fixes and the
navigation fixes have to be sequenced.** Independently verified: `VigilApp.tsx`'s three effects
(expiry sweep, work-queue publish, Workspace publish) are all reactive to its own local state —
none subscribes live to the shared session store (`vigil-approval-session.ts`). It only reflects a
Workspace-made decision because it re-seeds fresh on every mount, and the expiry sweeps only avoid
double-emitting because the shell currently mounts exactly one module at a time with no way back to
Home. **Both properties are accidents of the current navigation model, not real guarantees.**

**Consequence:** fixing D3-5 (adding a way back to Home) without first converting VigilApp's
mount-time seeding into a genuine live subscription would silently reopen the exact bugs Sessions
54 and 55 already closed. The resurrection family and the navigation fixes cannot be scoped as two
independent, sequential sessions — they are one session, done in a specific order.

---

## 2 — Build Session: Session-State + Navigation (one coordinated session)

**Required, in this exact order — order matters, per §1:**

1. **Convert `VigilApp`'s approval-state consumption from mount-time seeding to a live
   subscription** on `vigil-approval-session.ts`. This is the root fix — it removes the
   single-mount assumption D3-9 identified, and everything after this step becomes genuinely safe
   rather than accidentally safe.
2. **D3-1 (HIGH) — VIGIL Alert Queue.** Apply the same session-store pattern
   (`vigil-approval-session.ts` / `scribe-sent-session.ts` shape) to `useAlertQueue.ts`. Confirmed:
   currently plain `useState` seeded from `VigilApp.tsx:76`, no store exists.
3. **D3-2 (MED) — ARIA CPMI-VRS Gates 3/4.** Same pattern. Confirmed: `AriaVrsGates.tsx:77-78`
   holds gate state in plain `useState`; a "permanent" attestation can be re-emitted after remount.
4. **D3-3 (MED) — NEXUS Travel & Time queues.** Same pattern. Confirmed: `useTTIntake.ts:156`
   seeds via `useMemo(..., [])` — computed once, at mount, no store exists in `module-nexus/src/`.
5. **D3-4 (MED) — FLOWPATH approvals.** Same pattern. Confirmed: `FlowpathApp.tsx`'s
   `approvedSessionIds` is a bare `useState<string[]>([])`; `SessionManager.tsx:89` reseeds from
   `SYNTHETIC_SESSIONS` on remount.
6. **D3-5 (MED) — Home-return navigation.** Now safe to build, because step 1 already removed the
   dependency this fix would otherwise have broken. Confirmed: `hasSelectedModule`
   (`main.tsx:152`) is set `true` once and never reset; the "Home" breadcrumb changes `currentPath`
   only, the mounted module never unmounts, and `PlatformHome` (with its own expiry sweep) never
   renders again for the rest of the session.
7. **D3-7 (MED) — `navigateToModule` state consistency.** Two sub-issues, confirmed: (i) the
   sidebar highlight goes stale after "Open in [module]" because the host handler bypasses
   `useNavigationState`'s mirror (`main.tsx:195`); (ii) navigating to a registered-but-currently-
   inaccessible module unmounts everything, then fails the mount, leaving a blank screen with no
   recovery (`main.tsx:166-175`). (ii) is unreachable today (every real caller is role-consistent
   by construction) but unguarded — worth closing while touching this code regardless.

**Test coverage requirement, given tonight's own history:** this session must ship with real,
specific tests proving each resurrection fix — a decision made via one entry point must be
reflected via every other, and must survive a remount. Session 55 shipped equivalent fixes with
zero tests; Session 56 had to close that gap after the fact. Don't repeat it here, especially on a
HIGH-severity item.

**Not required, worth a look if time allows:** D3-8 (VIGIL's alert-count disclosure inconsistency
between Home and its own screen) and D3-10 (the Workspace expiry sweep only running while VIGIL's
section is rendered) are both small and adjacent to this same code — reasonable to fold in, not
worth a separate session for either alone.

---

## 3 — Governance Decisions Needed (Not Blocking the Session Above)

| ID | Finding | The actual question |
|---|---|---|
| **D4-6** | Seven modules share an identical `anthropic-key.ts` reading `VITE_ANTHROPIC_API_KEY` — confirmed present in exactly the seven modules the report names. Vite compiles any `VITE_`-prefixed variable into the client bundle by design. **No real key exists anywhere today — this is not urgent for the demo.** But it needs a real, deliberate decision (server-side proxy, or runtime injection instead of build-time) before any real key is ever configured, not a default arrived at by inertia. This is the one finding from tonight most directly relevant to the "important companies, departments, and organizations" bar — worth treating as a pre-production gate. |
| **D4-2** | The Workspace Activity tab's role list (`SECTION_ROLES.activity`, all five module roles by union) postdates the July 21 Role Access Matrix and was never formally added to it. The code is defensible, not wrong — this is a ratification, not a redesign. |
| **D4-5** | The ARIA/VIGIL banner claims CUI+ processing "is blocked and logged," but the actual enforcement lives at the api-client/NEXUS-intake seam, not in these modules. True of the platform's real intake paths, not of these modules' own inputs. Decide: soften the banner's wording to be accurate about where enforcement actually happens, or extend real classification screening into these modules to match what the banner already claims. Different-sized fixes; needs a real choice. |
| **D3-6** | Module health dots in the sidebar are wired to nothing — `pollAll()`/`startHealthPolling()` exist and are never called; every dot shows "unknown" permanently. Honest (it doesn't lie), but decide: finish wiring it, or remove the dead code and the dots entirely. |
| **D4-9** | LENS's governance explainer registry requires six source documents; only two exist (`vigil_alert_response`, `vigil_agent_approvals`), and neither is even on the registry's own required list. The explainer works, honestly, but only for VIGIL topics. This is a content-authoring task, not a code task — needs someone to write the missing governance-explanation documents, not a build session. |

---

## 4 — Correction to the Session 60 Record Itself

**§4.5 of the assessment report, and Finding F-2 of the Session 60 Handoff, are both wrong.** Both
claim `docs/Session55_Handoff.md` and `docs/Session55_SBOM_Update.md` sit untracked, in `docs/`
rather than the repo root. Independently verified: these files are committed at the **repo root**
(`./Session55_Handoff.md`, `./Session55_SBOM_Update.md`), and `git status` shows a clean working
tree. They were placed there several sessions ago specifically so Session 56's gather script could
reach them. Worth a small, direct correction to both documents — not a new incident, just a stale
claim that should say so.

---

## 5 — Explicitly Not Action Items

Per the report's own severity assessment, independently accepted as correctly triaged, not
requiring a build session: D3-11 (efficiency candidates — "nothing warrants action at current
data sizes"), D4-1 (stale doc comments — trivial, ride along with any session touching those
files), D4-3/D4-4 (already-documented taxonomy gaps, acceptable as-is), D4-8 (a deliberate design
posture, not a defect).

---

## 6 — What This Does Not Replace

The live human Walkthrough repeat pass on Home Dashboard, open since Session 54, remains
genuinely unreplaced by any of Session 60's work — stated in the report's own framing, restated
here for the same reason it's been restated all along: this was a code-level and data-level audit,
never a visual one.

---

*docs/30 — Session 60 Assessment: Action Plan and Sequencing*
*July 23, 2026 · Pre-Decisional · Internal Working Document*
