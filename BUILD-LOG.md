# Build log

## 2026-10-12

**Plan gate:** Verified the Cloudflare account can use Artifacts before building anything. The API token returns 401 on the Artifacts REST endpoints (token lacks the Artifacts scope), but a test Worker deployed with the Artifacts binding listed repos successfully. Conclusion: the binding path works, the account has access. Did not purchase anything.

**Repo:** Could not create `Naylahknee/yourkly-artifacts` via the GitHub API. The stored token returns 403 "Resource not accessible by personal access token" on repo creation. Everything is committed locally; pushing waits on the repo being created (NaLonni or parent agent via browser).

**Architecture decisions:**
- Wrote a minimal Git Smart HTTP client (`src/gitmini.js`) instead of bundling isomorphic-git. isomorphic-git's dependency memfs requires Node built-ins that Workers do not support, even with nodejs_compat. The minimal client does object creation (blob/tree/commit), packfile assembly, and receive-pack push with no filesystem. 7KB of code instead of 1.5MB of bundle.
- The Worker is stateless. Demo state (SHAs, tokens, remotes) lives in the browser UI and is passed back with each request.
- "Keep this one" rebuilds the winner's exact file set as a new save point on the project. Content-identical to the winner's work.
- Tokens are minted per operation and never stored. The UI holds them only for the session.

**Verified end to end (2026-10-12):**
1. Project created on Artifacts with 3 starter files. SHA returned.
2. Three agents forked concurrently, each pushed its changes. SHAs returned, no errors.
3. Cloned the project repo with real git: files and history correct.
4. "Keep this one" on the builder: project main now contains the features section. Verified by fresh clone.
5. `npm test`: 3/3 passing (health, no-jargon homepage, project creation).

**Jenney checklist applied from day one:**
- Git with meaningful commits from the first commit.
- Lean AGENTS.md (guardrails only).
- .gitignore covers .env variants; .env.example has placeholders only; no real values committed.
- Runnable `npm test`, run before claiming done.
- `/api/health` endpoint on the Worker.
- docs/STATUS.md kept current (see below).

**Still open:**
- GitHub repo creation (blocked on token scope, needs NaLonni or parent).
- Push local commits once the repo exists.
- Contest submission itself (video + form) is NaLonni's to do; DEMO-SCRIPT.md is ready.
- No uptime alert wired yet (health endpoint exists; alerting is a follow-up).
