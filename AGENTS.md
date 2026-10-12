# Agent Instructions for yourkly-artifacts

Read this file before making any change to this repository.

## What this is

A Cloudflare contest entry: Yourkly's plain-language version control, rebuilt on
Cloudflare Workers + Artifacts. It shows multiple agents working on the same
project at the same time, with every step explained in ordinary words.

## What you must not do

- Do not modify ~/workspace/yourkly-work in any way. It is read-only reference.
- Do not redesign the logo. Reuse public/yourkly-logo.png exactly as is.
- Do not commit, push, or deploy unless the owner explicitly asks.
- Do not use git jargon in anything the user sees. Translations:
  - commit -> save point
  - restore -> go back to this version
  - merge -> keep this one
  - repository -> project
  - fork -> copy for an agent
  - branch -> not surfaced
- No em-dashes in user-facing writing.

## Stack (do not change without asking)

- Cloudflare Workers, plain JavaScript, no framework
- Artifacts binding for versioned storage
- isomorphic-git for git operations inside the Worker

## After every substantial task

Update docs/STATUS.md: what changed, what works, what is still broken.
Run the test suite before claiming anything works.
