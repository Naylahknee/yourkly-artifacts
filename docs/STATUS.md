# Status

**Last updated:** 2026-10-12 (workspace reshaped to mirror the original Yourkly app)

## What is working

- Worker deployed and live at https://yourkly-artifacts.madincrease.workers.dev
- **Landing page (front door at /):** mirrors the original Yourkly landing page. (Unchanged by this task.)
- **Workspace at /app reshaped 2026-10-12 to mirror the original Yourkly app:**
  - App shell: 248px sidebar (stork + wordmark, "Your work, made clear." tagline, nav: Home / New project / Help, footer "Your work, saved."), collapses to a mobile bar under 900px. Same tokens, buttons, and cards as the original.
  - Dashboard: "Good morning." greeting + "Here's where you left off, what changed, and what to do next.", "New project" button (no Import; GitHub-only), "Continue where you left off" hero card for the most recent project ("Open the project" / "New project"), "Recent projects" cards (name, "N files · M Save Points", "Last touched X ago", chevron), "Recent activity" feed built from save points ("Save Point "label" in Project · time ago", or "Nothing yet. Save Points you make show up here."). Empty state keeps the 4-step onboarding tour.
  - Project view mirrors the original Project Home: "← Home" back link, title, status row ("Main version · vN | Last Save Point X ago | Everything saved"), "Recently saved" card, "Or do something else" with three action rows: "Work on files" (Browse files), "Send in the helpers" (the contest upgrade), "Review save points" (View save points).
  - Files: file list, "New file", editor bar with filename + "Changes not saved yet"/"Saved" pill, "Save as a new version" with a "What changed?" label, delete file.
  - Helpers (contest upgrade, in Yourkly's visual language): "Send in the helpers" from the project view; fixer/builder/polisher cards with 3D mascots and tasks; compare screen with each mascot and plain-words changes; "Keep this one" brings the winner in. Losing copies stay saved.
  - Save points: "Restore an earlier version" with the original's explainer, rows with label + "time ago · vN", "Current version" tag on the newest, inline "Put these files back?" confirm ("Yes, go back to this" / Cancel). Restore saves as a new save point.
  - Delete project (also removes its helper copies), with confirm.
- Everything stored in Artifacts repos. No GitHub, no localStorage.
- No user-facing mention of Artifacts, Cloudflare, or Workers. No git jargon. No dead buttons.
- `/api/health` returns ok.
- `npm test`: 8/8 passing (health, no-jargon homepage, workspace behind /app with sidebar, landing mirrors original, no tech/GitHub mentions on landing, full project lifecycle, agents flow, legacy onboarding flow).
- Per-agent stork mascots in TWO sets, NaLonni approved: 3D set (soft stylized 3D render, embedded in the UI) and line-art set (flat line art matching the logo). Each stork carries a woven basket of files from its beak.
- Pushed to GitHub: Naylahknee/yourkly-artifacts (public, MIT).

## What is still incomplete

- Contest video not recorded (NaLonni records it; DEMO-SCRIPT.md updated for the full product).
- Contest form not submitted (deadline Oct 14, 2026).
- No uptime alert connected to `/api/health` yet.

## Technical risks

- Test repos accumulate in the `default` namespace if test runs are interrupted (each test cleans up after itself; orphans can be deleted via the dashboard).
- The Artifacts REST API is not reachable with the current token (401). All Artifacts access goes through the Worker binding, which works.

## In Progress

- None. Workspace reshape is complete and verified (8/8 tests, live). Waiting on NaLonni: signup-flow decision (docs/FLOW.md step 2), record the demo video, submit the contest form.
