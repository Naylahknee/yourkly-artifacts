# Yourkly on Artifacts

Version control for people (and agents) who never want to hear the word git.

This is a contest entry for Cloudflare's "build the next Git platform" competition. It takes Yourkly's plain-language approach to version control and rebuilds it on Cloudflare Workers + Artifacts, designed for a world where AI agents do the coding.

**Live demo:** https://yourk.app (custom domain, connected 2026-10-12; the old workers.dev address below still works too)

## What it does

1. **Start a new project.** You name it. The app creates a versioned home for it on Cloudflare Artifacts and saves the first version.
2. **Send in 3 agents.** Each agent gets its own private copy of the project plus a written task. They work at the same time without stepping on each other. Every copy carries its task description and instructions alongside the code, so the *why* travels with the *what*.
3. **Compare their work.** You see what each agent changed in plain words, side by side.
4. **Keep this one.** You pick the winner. Their work becomes the project's main version. The other copies stay saved in case you want to look back.

No commits, no merges, no forks, no branches in anything you see. Just projects, copies, save points, and keeping the one you like.

## Try it

Open the live demo link above and click through the four steps. Each run creates fresh repos; nothing you do affects anyone else.

## Run it yourself

You need a Cloudflare account on the Workers Paid plan (Artifacts is in open beta there).

```bash
npm install
npm test          # runs the smoke tests against the live Worker
npm run build     # bundles the Worker with esbuild
npm run deploy    # deploys to your Cloudflare account
```

`npm run deploy` uses the same credential pattern as the rest of this workspace (see `scripts/deploy.js`). It uploads `dist/worker.js` with the Artifacts binding to namespace `default`.

## How it works

- `src/worker.js` — the Worker: HTTP routes, Artifacts orchestration, demo flow.
- `src/ui.js` — the plain-language web interface (single page, no framework).
- `src/gitops.js` — pushes file changes to Artifacts repos.
- `src/gitmini.js` — a minimal Git Smart HTTP client (object creation, packfiles, push). No filesystem needed, which is what makes it work inside a Worker.
- `src/logo.js` — the Yourkly logo, reused unchanged.

## License

MIT. See LICENSE.
