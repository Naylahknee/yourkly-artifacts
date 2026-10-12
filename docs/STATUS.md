# Status

**Last updated:** 2026-10-12 (Phase 2 complete)

## What is working

- Worker deployed and live at https://yourkly-artifacts.madincrease.workers.dev
- **Full product, not just a demo:**
  - Project dashboard: lists all projects with name, last-saved label and time, save-point count. Empty state shows the 4-step onboarding tour.
  - Project view: file list, text editor, save-as-new-version with a "what changed" label, new file, delete file.
  - Save points: labeled history, "go back to this version" restore (restores as a new save point, nothing is lost).
  - Agents integrated: "send in the helpers" from any project, 3 agents (fixer, builder, polisher) work concurrently on private copies, compare screen shows each mascot plus plain-words changes, "keep this one" brings the winner into the project. Losing copies stay saved.
  - Delete project (also removes its agent copies).
- Everything stored in Artifacts repos. No GitHub, no localStorage.
- Real logo lockup in the header: stork + wordmark side by side (originals untouched).
- Per-agent stork mascots (fixer, builder, polisher) shown on agent cards and the compare screen.
- Artifacts binding read APIs mapped exactly: `log()` entries are `{hash, treeHash, message, parents, authoredAt, committedAt}`; `readTree(treeHash)` returns `[{name, mode, hash, type}]`; `readFile()` returns a Blob (decode with `.text()`). Pushes must use the full ref `refs/heads/main`; pushing to bare `main` silently creates an unresolvable ref.
- `/api/health` returns ok.
- `npm test`: 5/5 passing (health, no-jargon homepage, full project lifecycle, agents flow, legacy onboarding flow).
- No git jargon anywhere user-facing (homepage HTML scanned in tests).
- Pushed to GitHub: Naylahknee/yourkly-artifacts (public, MIT).

## What is still incomplete

- Contest video not recorded (NaLonni records it; DEMO-SCRIPT.md updated for the full product).
- Contest form not submitted (deadline Oct 14, 2026).
- No uptime alert connected to `/api/health` yet.

## Technical risks

- Test repos accumulate in the `default` namespace if test runs are interrupted (each test cleans up after itself; orphans can be deleted via the dashboard).
- The Artifacts REST API is not reachable with the current token (401). All Artifacts access goes through the Worker binding, which works.

## In Progress

- None. Phase 2 build is complete and verified. Waiting on NaLonni: record the demo video, submit the contest form.
