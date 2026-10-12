# Yourkly Artifacts — App Flow

How a person goes from never having heard of this to being a happy user.
This is the master flow. Every screen we build must serve one of these steps.

## 1. Arrive — the landing page (`/`)

A first-time visitor (or contest judge) lands here. The page mirrors the
original Yourkly landing page. Nothing about it should feel different
from Yourkly.

- Header: stork + wordmark on the left, quiet "Sign in" on the right.
- Headline: "Your projects, made clear."
- Subtext: "Know what changed, what it means, and exactly what to do
  next."
- One button: "Continue with Yourkly." That is the whole call to action.
  It leads into the workspace (/app).
- If the visitor already has projects, a quiet line says so:
  "Welcome back! You have N projects."
- Story card on the right with the stork peeking over it: "What to do
  next" with a sample task card, exactly like the original.
- Footer: "© 2026 Yourkly" and Support.
- The GitHub-specific rows from the original are dropped (this version
  does not use GitHub). Everything else is identical.
- No mention of Artifacts, Cloudflare, or Workers anywhere the user can
  see. The tech story lives in the repo and the demo video, not the page.
- Status: BUILT (reverted 2026-10-12 to mirror the original).

## 2. Sign up — DECISION NEEDED

Recommendation: no account needed to try it. Click "Start a project,"
name it, and you are in. Judges will not sign up for anything, and the
demo must work in one click.

When someone wants to keep their projects across devices, ask for email
then (code sent to their inbox, the way the main Yourkly does it).

NaLonni to approve: try-first with email later, yes or no?

## 3. Start a project

- From the dashboard sidebar or the "New project" button: "Start a new project."
- Give the project a name. We set up a safe place for it and save the first version.
- Land in the project view.
- Status: BUILT.

## 4. Work on files

- In the project view, "Work on files" shows the file list. "New file" button. Click a file to open it.
- The editor bar shows the file name and whether changes are saved yet. Write, label what changed, "Save as a new version."
- Nothing here should need explaining. If it does, the design is wrong.
- Status: BUILT.

## 5. Save points (versions)

- "Review save points" lists every version with its label, how long ago, and its version number (v1, v2, ...), newest first. The newest is tagged "Current version."
- "Go back to this version" asks "Put these files back?" first. Going back saves as a new Save Point, so nothing newer is ever lost.
- The dashboard's "Recent activity" feed is built from save points across projects.
- Status: BUILT.

## 6. Send in the helpers

- From any project, "Or do something else" offers "Send in the helpers."
- Three helpers (the fixer, the builder, the polisher) each take a copy of the project and work at the same time. You see each one with its stork mascot, so you always know who is doing what.
- Status: BUILT.

## 7. Compare

- When the helpers finish, their work appears side by side.
- Each one is explained in plain words: what it changed and why.
- Each card shows the helper's mascot so you can tell them apart at a glance.
- Status: BUILT.

## 8. Keep one

- "Keep this one" makes that helper's version the project's current version.
- The other copies stay saved. Nothing is thrown away.
- You are back in the project view, on the winning version.
- Status: BUILT.

## 9. Share — LATER (after the contest)

- Share a project link, publish a version. Out of contest scope.
- Do not build this before the 14th.

## Rules for this flow

- Every step must work with zero explanation. Plain words only.
- No step may require knowing what git is.
- The main Yourkly logo is never redesigned. Agent mascots follow the
  basket concept (stork carries a woven basket of files; the basket's
  contents show the agent's job).
