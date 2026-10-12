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

## 2. Sign in — BUILT 2026-10-12

Try-first, email later (NaLonni approved 2026-10-12). No account needed to
try it: click "Continue with Yourkly" and you are in.

- Landing "Sign in" opens the in-app sign-in screen: "Type your email. We
  will send you a code to type in. No password to remember."
- Type the 6-digit code (works for 10 minutes). First sign-in goes to
  "Create your profile": "What should Yourkly call you?" (name, required)
  plus an optional picture pick (stork by default).
- Returning users skip profile setup and go straight in.
- Signed-in projects are saved under the email (repo names carry an
  owner prefix); signed-out users keep the anonymous workspace unchanged.
  The dashboard nudges signed-out users with projects: "Want these
  projects on any device? Sign in."
- Account page: signed out shows the sign-in prompt; signed in shows the
  profile (picture + name + email) with "Edit profile" and "Sign out."
- The profile-preview pill shows "Hello, I'm [name]" with the chosen
  picture.
- Help "How Yourkly works" step 1 ("Sign in with your email / Your email
  is your login. No new password to remember.") describes this flow.
- Email sending: needs RESEND_API_KEY (see STATUS.md). Until it is set,
  codes cannot be delivered to real inboxes.

## 3. Start a project

- From My Projects ("Add a project"): "Make your project."
- Give the project a name and, if you like, one sentence about what you are building (saved as "About this project.md"). We set up a safe place for it and save the first version.
- Land in the project view (Project Home).
- Status: BUILT.

## 3b. Bring a project over (import)

- From the dashboard ("Import"): "Bring a project over."
- Paste a GitHub link (full URL or owner/repo shorthand). No GitHub account, no login, no token. Public projects only.
- Yourkly fetches the whole project and makes it a native Yourkly project: every file lands in its versioned storage, and the first save point is labeled "Brought over from GitHub." You land on Project Home.
- Clear errors for bad links ("That does not look like a GitHub link."), private or missing repos ("That repo is private or does not exist. Only public repos can be brought over right now."), and oversized projects.
- GitHub is named only inside this migration flow and its help card, nowhere else.
- Status: BUILT 2026-10-12.

## 4. Work on files

- Project Files: folders open with "Show what's inside"; each file has Open, History, Download, Rename, Delete. "Add a file" for new ones.
- The editor bar shows the file name and whether changes are saved yet. Write, label what changed, "Save as a new version."
- Nothing here should need explaining. If it does, the design is wrong.
- Status: BUILT.

## 5. Save points (versions)

- Save Points ("Restore an earlier version") lists every version with its label, how long ago, and its version number (v1, v2, ...), newest first. The newest is tagged "Current version."
- "Go back to this version" asks "Put these files back?" first. Going back saves as a new Save Point, so nothing newer is ever lost.
- "What Changed" lists every save point newest first with "See details".
- The dashboard's "Recent activity" feed and the Timeline page are built from save points across projects.
- Status: BUILT.

## 6. Send in the helpers

- From Project Home ("Send in the helpers" promo), Make an Update ("What do you want to change?" then "Send in the helpers"), or Separate Versions.
- Three helpers (the fixer, the builder, the polisher) each take a safe copy of the project and work at the same time. You see each one with its stork mascot, so you always know who is doing what.
- Status: BUILT.

## 7. Compare

- In Separate Versions, the helper copies appear as version cards.
- Each one is explained in plain words: what it changed and why.
- Each card shows the helper's mascot so you can tell them apart at a glance.
- Status: BUILT.

## 8. Keep one

- "Keep this one" makes that helper's version the project's current version.
- The other copies stay saved. Nothing is thrown away.
- You are back on Project Home, on the winning version.
- Status: BUILT.

## 9. Share — LATER (after the contest)

- Share a project link, publish a version. Out of contest scope.
- "Who Can See It" is an honest placeholder ("Only you"). "Continue in..." is the agreed empty state. "Put It on the Web" is omitted (no dead buttons).
- Do not build these before the 14th.

## Rules for this flow

- Every step must work with zero explanation. Plain words only.
- No step may require knowing what git is.
- The main Yourkly logo is never redesigned. Agent mascots follow the
  basket concept (stork carries a woven basket of files; the basket's
  contents show the agent's job).
