# Status

**Last updated:** 2026-10-12 (email-code sign-in + profiles built; 41 tests passing)

## What is working

- Worker deployed and live at https://yourkly-artifacts.madincrease.workers.dev
- **Sign-in (new 2026-10-12):** email-code login, no passwords, no GitHub login. Landing "Sign in" opens the in-app sign-in screen ("Type your email. We will send you a code to type in. No password to remember."). 6-digit codes work for 10 minutes, 5 tries max, 5 sends per hour per email. Sessions last 30 days via a secure cookie. First sign-in goes through "Create your profile" ("What should Yourkly call you?" + optional picture pick: the stork, pre-selected, or your initial in a circle); returning users skip it. Projects made while signed in are saved under the email (owner-prefixed repos, invisible to signed-out users and to other accounts); signed-out behavior is unchanged. Account page shows the profile (picture, name, email) with "Edit profile" and "Sign out"; signed-out it shows the sign-in prompt. The profile-preview pill shows "Hello, I'm [name]" with the chosen picture. Sign-in records live in a hidden `yourkly-signin-data` Artifacts repo (codes, sessions, profiles as JSON; expired entries pruned on write).
- **Email sending status:** the worker sends codes through Resend when `RESEND_API_KEY` is set (optional `AUTH_FROM_EMAIL` sender, defaults to Yourkly <hello@yourkly.com>). NO KEY IS CONFIGURED YET, so codes cannot reach real inboxes. Until NaLonni approves adding the key, sign-in works end to end only for test addresses (the reserved example.com domain returns the code in the API response for tests; clearly labeled in code, no real mailbox exists there). Codes are never logged.
- **Landing page (front door at /):** mirrors the original Yourkly landing page. Leftover "Lovable" mention in the story card fixed 2026-10-12.
- **Workspace at /app rebuilt 2026-10-12 to mirror the full original Yourkly page map** (20 screenshots). Same layout, same copy (GitHub mentions swapped for neutral truthful language), same structure. GitHub removed entirely; no dead buttons.
  - App shell: 248px sidebar (stork + wordmark, "Your work, made clear." tagline, nav: Home / My Projects / Recent Activity / Account / Help, footer "Your work, saved."), project nav appears inside a project (Project Home, Updates, Things to Do, Make an Update, Project Files, What Changed, Save Points, Separate Versions, Continue in..., Who Can See It, Settings). Mobile: hamburger opens a slide-over drawer with the full nav; all screens responsive at desktop and mobile widths.
  - Dashboard: "Good morning." greeting, "New project" button, "Continue where you left off" hero card, "Recent projects" cards, "Recent activity" feed. Empty state keeps the 4-step onboarding tour.
  - My Projects: stork delivery animation (upgraded: smoother flight, parcel drops into the basket with a bounce and glow), "We found N projects.", "Your projects are saved and kept safe.", rows with "Up to date" pill, "Last touched X ago", "Open project", "Add a project". Empty state: the empty-basket stork with "Your basket is empty. Start your first project and the stork will carry it home."
  - Recent Activity: "Timeline" page, save points newest first across projects.
  - Account: sign-in prompt when signed out; profile (picture, name, email) with "Edit profile" and "Sign out" when signed in. Includes a "Preview the pill" link to the profile preview.
  - Profile preview (new): floating profile pill mirroring the original widget. Dark rounded pill with the avatar circle, "Hello, I'm [display name]", and a + button that expands to the profile state (back button collapses). Same transitions, reduced-motion fallback, mobile responsive. Reached from the Account page.
  - Add a project: "Make your project" form (name + optional "What are you building?"); the description is saved as "About this project.md". The GitHub-import wizard options are gone (they cannot work here).
  - Bring a project over (new): dashboard "Import" button opens an import screen. Paste a GitHub link (full URL or owner/repo shorthand); no GitHub account, no login, no token. The Worker fetches the public tarball, extracts every file (up to 2000 files / 50MB, very large single files are left behind with a note), and makes it a native Yourkly project with the first save point labeled "Brought over from GitHub." You land on Project Home. Clear errors for bad links, private/missing repos ("Only public repos can be brought over right now."), and oversized projects. Name collisions get a numbered suffix; nothing is ever overwritten. The "I want to bring a project from GitHub" help card now describes the real flow. GitHub is named only in this flow and its help card.
  - Project Home: status row ("Main version · vN | Last Save Point X ago | Everything saved"), "Project health" card with a working "Check again", "Send in the helpers" promo with the mascot trio, "Recently saved" card, "Make an update" + "See everything that changed".
  - Updates: helper versions as update rows ("Ready to compare", next step "Compare and keep one"), "Saved" section below.
  - Things to Do: todo list kept in this browser (add, check off, delete). Honest note that it lives on this computer.
  - Make an Update: "What do you want to change?" form; Continue shows the update summary and "Send in the helpers".
  - Project Files: folders with "Show what's inside", per-file rows (Open, History, Download, Rename, Delete), grey description lines, "Add a file". Per-file History is computed from save points via the existing file-at-version API.
  - Editor: filename + "Changes not saved yet"/"Saved" pill, "What changed?" label, "Save as a new version", delete file.
  - What Changed: every save point newest first with "See details" (full timestamp, version, restore button).
  - Save Points: "Restore an earlier version" with inline "Put these files back?" confirm. Restore saves as a new save point.
  - Separate Versions: main version card + helper version cards with mascots, plain-words changes, "Keep this one". "Send in the helpers" with animated working states (bobbing mascots, shimmer progress).
  - Continue in...: kept as the agreed empty state ("Nothing here yet."). Not built, per owner decision.
  - Who Can See It: honest single card ("Only you. Nobody else can open it, find it, or see your files.").
  - Settings: project name (read-only), visibility ("Only you"), delete with type-the-name confirm.
  - Help hub with search and all 6 topics, reference-checked 2026-10-12 against the original's screenshots: Getting started, How Yourkly works (4 steps in 2-column layout with Previous/Next, step 1 is the email sign-in step, 'Where you'll see this' boxes), What are you trying to do? (all 8 task cards in 2-col grid including 'I want to bring a project from GitHub', plus Step by step), Plain-English glossary (filter plus Yourkly/Technical-term toggle pills, 'Also called' column only where the plainer word teaches), When something looks wrong (accordions with the adapted entries), Contact support (kind cards, plain 'Open a report' button opening the repo issues page). Sidebar Help expands into a HELP TOPICS submenu with the active topic highlighted purple; it collapses when navigating away.
- Helpers (contest upgrade, in Yourkly's visual language): fixer/builder/polisher with 3D mascots; working states animate; compare in plain words; "Keep this one" with confirm; losing copies stay saved. Agents appear only in the project view, never on the dashboard or landing.
- Everything stored in Artifacts repos. No GitHub, no localStorage except the Things-to-Do list.
- No user-facing mention of Artifacts, Cloudflare, or Workers. No git jargon. No em-dashes.
- `/api/health` returns ok.
- `npm test`: 42/42 passing (health, no-jargon homepage, workspace behind /app with full nav, landing mirrors original, no tech/GitHub mentions on landing, every screen group served, continue-in empty state, empty-basket mascot, agent mascots, upgraded animations, no GitHub/Artifacts/Cloudflare/Workers in user text except the migration flow, full project lifecycle, agents flow, legacy onboarding flow, sidebar Help submenu, 6 help-topic reference checks, import screen + 4 import API tests, sign-in screen copy + link, auth API validation (bad email, no pending code, me, sign-out), glossary Helpers wording, avatar picker (stork + initial only), full sign-in flow with profile creation and owner-scoped projects, returning-user profile skip).
- Per-agent stork mascots in TWO sets, NaLonni approved: 3D set (embedded in the UI) and line-art set (alternates in public/). Each stork carries a woven basket of files from its beak. Plus the empty-basket stork for the zero-projects state.
- Pushed to GitHub: Naylahknee/yourkly-artifacts (public, MIT), remote main at 7ec7b2bd.

## What is still incomplete

- Contest video not recorded (NaLonni records it; DEMO-SCRIPT.md updated for the full page map).
- Contest form not submitted (deadline Oct 14, 2026).
- Not built (need backends that do not exist; no dead buttons left): publishing ("Put It on the Web" omitted from nav), sharing/invites, the "Continue in..." brief builder (nav item kept as the agreed empty state).
- Per-file History checks the 12 most recent save points (client-side; deeper history would need a backend diff endpoint).
- Mobile + desktop: responsive CSS verified in markup (900px breakpoint, drawer nav); visual check at both widths still needs a live browser pass.
- No uptime alert connected to `/api/health` yet.

## Technical risks

- Test repos accumulate in the `default` namespace if test runs are interrupted (each test cleans up after itself; orphans can be deleted via the dashboard).
- The Artifacts REST API is not reachable with the current token (401). All Artifacts access goes through the Worker binding, which works.
- Worker bundle is 4.3MB (well under the 10MB limit) with 6 embedded images.

## In Progress

- None. Full page map is built, tested, deployed, and pushed. Waiting on NaLonni: add the Resend key so sign-in codes reach real inboxes (see "Email sending status" above), record the demo video, submit the contest form.
