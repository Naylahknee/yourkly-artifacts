// Plain-language web UI. No git jargon anywhere the user can see.
// Translation table (from Yourkly): repository -> project, commit -> save point,
// commit message -> what changed / label, file history -> history,
// restore a commit -> go back to this version, merge -> keep this one,
// fork -> copy for an agent. Branch, SHA and ref are never surfaced.
//
// The /app workspace mirrors the original Yourkly app screens (dashboard,
// project view, editor, save points). The agents are an upgrade inside the
// project view. Backend API and Artifacts storage are unchanged.
import {
  IMG_YOURKLY_STORK, IMG_YOURKLY_WORDMARK,
  IMG_STORK_FIXER, IMG_STORK_BUILDER, IMG_STORK_POLISHER,
} from './assets.js';

const PAGE_STYLE = `
  :root { --ink: #1a1a1a; --muted: #666; --line: #e5e5e5; --bg: #fafafa; --purple: #5b4bd6; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--ink); background: var(--bg); line-height: 1.6; }

  /* ── App shell: mirrors the original Yourkly app. Scoped tokens so the
     landing page above stays pixel-identical. ── */
  .app-shell {
    --yp-purple: #6C5CE7; --yp-purple-dark: #5849c4; --yp-ink: #1C1B22; --yp-ink-soft: #4A4753;
    --yp-canvas: #FBFAF8; --yp-grey: #8A8794; --yp-grey-light: #ECEAF4; --yp-grey-border: #D8D6E3;
    --yp-lilac-bg: #F4F2FB; --yp-lilac-border: #E4E0F7; --yp-panel: #FBFAFE;
    --yp-green-bg: #E6F9F4; --yp-green-ink: #0A4F41; --yp-red: #8C3A33; --yp-red-bg: #FBEBEA; --yp-red-border: #F3D9D6;
    --yp-font: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex; min-height: 100vh; background: var(--yp-canvas); color: var(--yp-ink);
    font-family: var(--yp-font); font-size: 15px; line-height: 1.6;
  }
  .app-shell *, .app-shell *::before, .app-shell *::after { box-sizing: border-box; }
  .app-shell h1, .app-shell h2, .app-shell h3, .app-shell p { margin: 0; }
  .app-shell button { font-family: var(--yp-font); }

  .app-sidebar {
    width: 248px; flex-shrink: 0; background: #fff; border-right: 1px solid var(--yp-grey-light);
    display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; padding-bottom: 24px;
  }
  .app-wordmark { display: flex; flex-direction: column; padding: 24px 20px 20px; text-decoration: none; border-bottom: 1px solid var(--yp-grey-light); margin-bottom: 8px; cursor: pointer; }
  .app-brand-lockup { display: flex; align-items: center; gap: 10px; min-height: 38px; }
  .app-brand-stork { width: 34px; height: 34px; object-fit: contain; }
  .app-brand-wordmark { height: 26px; width: auto; }
  .app-tagline { font-size: 12px; color: var(--yp-grey); margin-top: 2px; }
  .app-nav-group { display: flex; flex-direction: column; padding: 8px 0; border-bottom: 1px solid var(--yp-grey-light); }
  .app-nav-item {
    display: flex; align-items: center; padding: 8px 20px; font-size: 14.5px; font-weight: 500;
    color: var(--yp-ink); text-decoration: none; position: relative; cursor: pointer;
  }
  .app-nav-item::before { content: ''; position: absolute; left: 0; top: 9px; bottom: 9px; width: 3px; border-radius: 2px; background: transparent; }
  .app-nav-item:hover { background: #F7F6FC; color: var(--yp-purple); }
  .app-nav-item--active { color: var(--yp-purple); }
  .app-nav-item--active::before { background: var(--yp-purple); }
  .app-sidebar-footer { margin-top: auto; padding: 16px 20px 0; border-top: 1px solid var(--yp-grey-light); }
  .app-footer-status { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--yp-grey); }
  .app-status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #00B894; }

  .app-mobilebar { display: none; }
  .app-content { flex: 1; min-width: 0; overflow-y: auto; }
  .screen-padded { padding: 44px 48px 64px; max-width: 1000px; }
  .screen-narrow { max-width: 600px; }

  .page-title { font-size: 30px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 8px; }
  .page-sub { font-size: 15.5px; color: var(--yp-grey); margin-bottom: 24px; }

  .pl-btn-primary {
    padding: 15px 26px; background: var(--yp-purple); color: #fff; border: none; border-radius: 12px;
    font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 6px 18px rgba(108,92,231,.26);
    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
  }
  .pl-btn-primary:hover { background: var(--yp-purple-dark); }
  .pl-btn {
    padding: 14px 20px; background: #fff; color: var(--yp-ink); border: 1px solid var(--yp-grey-border);
    border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .pl-btn:hover { border-color: var(--yp-purple); color: var(--yp-purple); }
  .pl-btn-danger { color: var(--yp-red); border-color: var(--yp-red-border); }
  .pl-btn-danger:hover { border-color: var(--yp-red); color: var(--yp-red); }
  .pl-btn:disabled, .pl-btn-primary:disabled { opacity: .5; cursor: default; }
  .text-link { color: var(--yp-purple); text-decoration: none; font-size: 14px; cursor: pointer; }
  .text-link:hover { opacity: .75; }
  .back-link { color: var(--yp-purple); text-decoration: none; font-size: 14px; cursor: pointer; display: inline-block; margin-bottom: 20px; }
  .back-link:hover { opacity: .75; }

  .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--yp-grey); margin: 32px 0 12px; }
  .section-label--tight { margin-top: 0; }

  input[type=text], .app-shell input[type=text] {
    width: 100%; padding: 12px 14px; font-size: 16px; font-family: var(--yp-font);
    border: 1px solid var(--yp-grey-border); border-radius: 8px; margin-bottom: 12px; background: #fff; color: var(--yp-ink);
  }
  .form-label { font-size: 14px; font-weight: 500; display: block; margin-bottom: 6px; }
  .form-hint { font-size: 13px; color: var(--yp-grey); line-height: 1.5; margin-top: 12px; }
  .error-box { color: var(--yp-red); background: var(--yp-red-bg); border: 1px solid var(--yp-red-border); border-radius: 8px; padding: 12px 14px; margin-top: 12px; font-size: 14px; }
  .ok-msg { color: var(--yp-green-ink); font-size: 14px; margin-top: 12px; }

  /* Dashboard */
  .home-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 8px; }
  .home-greeting { font-size: 30px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 8px; }
  .home-subtitle { font-size: 15.5px; color: var(--yp-grey); }
  .home-hero-card { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 32px 34px; box-shadow: 0 8px 34px rgba(108,92,231,.12); }
  .home-hero-context { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; }
  .home-hero-project { color: var(--yp-purple); font-weight: 600; }
  .home-hero-separator, .home-hero-label { color: var(--yp-grey); }
  .home-hero-title { font-size: 34px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 8px; text-transform: capitalize; }
  .home-hero-goal { font-size: 16.5px; color: var(--yp-ink-soft); margin-bottom: 16px; }
  .home-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .home-columns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; }
  .home-project-list { display: flex; flex-direction: column; gap: 12px; }
  .home-project-card {
    background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 18px 20px;
    cursor: pointer; display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;
  }
  .home-project-card:hover { border-color: var(--yp-purple); box-shadow: 0 4px 18px rgba(108,92,231,.08); }
  .home-project-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
  .home-project-name { font-size: 16.5px; font-weight: 600; text-transform: capitalize; }
  .home-project-desc { font-size: 13.5px; color: var(--yp-grey); }
  .home-project-meta { font-size: 12px; color: var(--yp-grey); }
  .home-project-chevron { color: var(--yp-grey); font-size: 20px; }
  .home-activity { display: flex; flex-direction: column; gap: 12px; }
  .home-activity-row { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; }
  .home-activity-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--yp-purple); flex-shrink: 0; margin-top: 6px; }
  .home-activity-what { display: block; color: var(--yp-ink); }
  .home-activity-meta { display: block; font-size: 12px; color: var(--yp-grey); }
  .home-empty-note { font-size: 14px; color: var(--yp-grey); }

  /* Project view */
  .project-home-title { font-size: 30px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 8px; text-transform: capitalize; }
  .project-status { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 14px; color: var(--yp-grey); margin-bottom: 28px; }
  .project-status .sep { color: var(--yp-grey-border); }
  .project-status .ok { color: var(--yp-green-ink); font-weight: 600; }
  .project-update-card { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 28px 30px; box-shadow: 0 8px 34px rgba(108,92,231,.12); margin-bottom: 8px; }
  .project-recent-row { padding: 10px 0; border-bottom: 1px solid var(--yp-grey-light); }
  .project-recent-row:last-child { border-bottom: none; }
  .project-recent-title { font-weight: 600; font-size: 15px; }
  .project-recent-meta { font-size: 13px; color: var(--yp-grey); }
  .else-title { font-size: 22px; font-weight: 700; letter-spacing: -.02em; margin: 36px 0 4px; }
  .else-sub { font-size: 14px; color: var(--yp-grey); margin-bottom: 16px; }
  .project-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
  .project-action {
    background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 18px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; text-decoration: none; color: inherit;
  }
  .project-action:hover { border-color: var(--yp-purple); box-shadow: 0 4px 18px rgba(108,92,231,.08); }
  .project-action-text { display: flex; flex-direction: column; gap: 4px; }
  .project-action-title { font-size: 16.5px; font-weight: 600; }
  .project-action-body { font-size: 13.5px; color: var(--yp-grey); }
  .project-action-cta { font-size: 14px; font-weight: 600; color: var(--yp-purple); white-space: nowrap; }
  .proj-section { margin-top: 36px; }
  .proj-section > h2 { font-size: 22px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 4px; }
  .proj-section > p.sub { font-size: 14px; color: var(--yp-grey); margin-bottom: 16px; }

  /* Files + editor */
  .file-list { list-style: none; margin: 0 0 12px; padding: 0; background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; overflow: hidden; }
  .file-list li { padding: 12px 18px; cursor: pointer; font-size: 15px; border-bottom: 1px solid var(--yp-grey-light); }
  .file-list li:last-child { border-bottom: none; }
  .file-list li:hover { background: var(--yp-lilac-bg); }
  .file-list li.active { background: var(--yp-lilac-bg); font-weight: 600; color: var(--yp-purple); }
  .editor-card { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 24px; box-shadow: 0 8px 34px rgba(108,92,231,.12); }
  .editor-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
  .editor-bar-name { font-size: 17px; font-weight: 700; flex: 1; min-width: 120px; }
  .editor-pill { font-size: 12.5px; font-weight: 600; padding: 4px 11px; border-radius: 99px; white-space: nowrap; }
  .editor-pill--saved { background: var(--yp-green-bg); color: var(--yp-green-ink); }
  .editor-pill--unsaved { background: #FAF1E1; color: #A3702A; }
  textarea.editor-area { width: 100%; min-height: 320px; padding: 14px; font-size: 14px; font-family: ui-monospace, Menlo, Consolas, monospace; border: 1px solid var(--yp-grey-border); border-radius: 8px; line-height: 1.5; background: #fff; color: var(--yp-ink); }
  .editor-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 12px; }

  /* Helpers (the contest upgrade, in Yourkly's visual language) */
  .agent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 16px; }
  .agent-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 20px; }
  .agent-card img.mascot { width: 88px; height: 88px; object-fit: contain; display: block; margin-bottom: 10px; }
  .agent-card h3 { font-size: 16.5px; font-weight: 600; margin-bottom: 6px; }
  .agent-card .task { font-size: 13.5px; color: var(--yp-grey); margin-bottom: 10px; }
  .agent-card .status { font-size: 12.5px; font-weight: 600; margin-bottom: 6px; }
  .agent-card .status.done { color: var(--yp-green-ink); }
  .agent-card .status.working { color: #A3702A; }
  .agent-card .changes { font-size: 14px; background: var(--yp-panel); border-radius: 8px; padding: 12px; margin: 10px 0; white-space: pre-wrap; color: var(--yp-ink-soft); }
  .agent-card.winner { border: 2px solid var(--yp-purple); box-shadow: 0 4px 18px rgba(108,92,231,.12); }
  .hidden { display: none; }

  /* Save points */
  .points-intro { font-size: 15px; color: var(--yp-ink-soft); margin-bottom: 20px; max-width: 60ch; }
  .points-list { display: flex; flex-direction: column; gap: 8px; }
  .points-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; }
  .points-row-title { font-size: 15px; font-weight: 600; }
  .points-row-meta { font-size: 13px; color: var(--yp-grey); }
  .points-current-tag { font-size: 12.5px; font-weight: 600; color: var(--yp-purple); }
  .points-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .points-confirm-text { font-size: 14px; }
  .points-restored { display: flex; gap: 12px; align-items: flex-start; background: var(--yp-green-bg); border-radius: 12px; padding: 16px; margin-bottom: 16px; font-size: 15px; color: var(--yp-green-ink); }

  .danger-zone { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--yp-grey-light); }

  /* Help */
  .help-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 20px 22px; margin-bottom: 12px; }
  .help-card h2 { font-size: 16.5px; font-weight: 600; margin-bottom: 6px; }
  .help-card p { font-size: 15px; color: var(--yp-ink-soft); }

  /* Onboarding tour */
  .tour-card { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 28px 30px; box-shadow: 0 8px 34px rgba(108,92,231,.12); margin-bottom: 16px; }
  .tour-card h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .tour-card p { font-size: 15px; color: var(--yp-ink-soft); margin-bottom: 16px; }
  .step-num { display: inline-flex; align-items: center; justify-content: center; background: var(--yp-ink); color: #fff; width: 28px; height: 28px; border-radius: 50%; font-size: 14px; font-weight: 700; margin-right: 8px; vertical-align: middle; }

  @media (max-width: 900px) {
    .app-sidebar { display: none; }
    .app-mobilebar {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--yp-grey-light);
      position: sticky; top: 0; z-index: 10;
    }
    .app-mobilebar-brand { display: flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none; }
    .app-mobilebar-brand .app-brand-stork { width: 28px; height: 28px; }
    .app-mobilebar-brand .app-brand-wordmark { height: 22px; }
    .screen-padded { padding: 28px 20px 48px; }
    .home-columns { grid-template-columns: 1fr; }
    .home-hero-card { padding: 24px 20px; }
  }

  /* Landing page: mirrors the original Yourkly landing. */
  body.landing-body { background: #fff; }
  .landing-shell { width: min(1240px, 100%); margin: 0 auto; padding: 36px 28px 0; }
  .landing-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-bottom: 74px; }
  .landing-header .brand-lockup { cursor: default; }
  .landing-header .brand-stork { width: 34px; height: 34px; }
  .landing-header .brand-wordmark { height: 30px; }
  .landing-signin { color: var(--ink); text-decoration: none; font-size: 15px; font-weight: 600; }
  .landing-signin:hover { color: var(--purple); }
  .landing-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, .93fr); align-items: center; gap: clamp(42px, 7vw, 92px); padding-bottom: 120px; }
  .landing-hero-copy h1 { margin: 0; max-width: 11ch; font-size: clamp(44px, 5.45vw, 68px); font-weight: 800; line-height: 1.04; letter-spacing: -.045em; }
  .landing-hero-copy > p { margin: 28px 0 0; max-width: 31ch; color: #555; font-size: clamp(18px, 1.8vw, 21px); line-height: 1.5; }
  .landing-cta-stack { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; margin-top: 32px; }
  .landing-cta { display: inline-block; border: 0; border-radius: 14px; padding: 19px 30px; background: var(--purple); color: #fff; box-shadow: 0 10px 24px rgba(98, 70, 234, .24); font-size: 17px; font-weight: 700; line-height: 1; text-decoration: none; cursor: pointer; }
  .landing-cta:hover { background: #4a3fb8; }
  .landing-cta-stack > span { color: var(--muted); font-size: 14px; line-height: 1.4; }
  .landing-product-wrap { position: relative; min-width: 0; }
  .landing-stork-peek { position: absolute; z-index: 0; width: min(150px, 27%); right: -28px; top: -80px; pointer-events: none; }
  .landing-product-preview { position: relative; z-index: 1; min-height: 340px; padding: 26px; background: #fff; border: 1px solid var(--line); border-radius: 24px; box-shadow: 0 24px 60px rgba(23, 23, 36, .10); }
  .landing-product-head { display: flex; align-items: center; gap: 12px; }
  .landing-product-icon { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; background: var(--purple); color: #fff; font-size: 16px; font-weight: 800; line-height: 1; }
  .landing-product-head > span:last-child { display: grid; gap: 2px; min-width: 0; }
  .landing-product-head strong { font-size: 16px; font-weight: 700; line-height: 1.25; }
  .landing-product-head small { color: var(--muted); font-size: 12px; line-height: 1.25; }
  .landing-product-label { display: block; margin: 25px 0 14px; color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  .landing-task-card { display: grid; gap: 18px; padding: 20px; border: 1px solid #ededf3; border-radius: 16px; background: #fcfcfe; }
  .landing-task-card strong { font-size: 19px; font-weight: 700; line-height: 1.4; letter-spacing: -.02em; }
  .landing-preview-action { align-self: flex-start; padding: 15px 20px; border-radius: 12px; background: var(--purple); color: #fff; box-shadow: 0 8px 20px rgba(98, 70, 234, .22); font-size: 15px; font-weight: 700; line-height: 1; }
  .landing-preview-action i { font-style: normal; }
  .landing-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 32px 0 40px; border-top: 1px solid #ededf3; color: var(--muted); font-size: 14px; }
  .landing-footer a { color: #555; text-decoration: none; }
  .landing-footer a:hover { color: var(--purple); }
  @media (max-width: 820px) {
    .landing-shell { padding: 24px 20px 0; }
    .landing-header { padding-bottom: 52px; }
    .landing-hero { grid-template-columns: minmax(0, 1fr); gap: 52px; padding-bottom: 76px; }
    .landing-hero-copy h1 { max-width: 12ch; font-size: clamp(40px, 12vw, 54px); }
    .landing-hero-copy > p { margin-top: 22px; font-size: 18px; }
    .landing-cta-stack { align-items: stretch; }
    .landing-cta { width: 100%; text-align: center; }
    .landing-cta-stack > span { text-align: center; }
    .landing-stork-peek { width: 102px; right: -7px; top: -56px; }
    .landing-product-preview { min-height: 320px; padding: 21px; border-radius: 20px; }
    .landing-task-card strong { font-size: 18px; }
  }
`;

export function renderLanding() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yourkly</title>
<style>${PAGE_STYLE}</style>
</head>
<body class="landing-body">
<div class="landing-shell">
  <header class="landing-header">
    <div class="brand-lockup">
      <img class="brand-stork" src="${IMG_YOURKLY_STORK}" alt="">
      <img class="brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="Yourkly">
    </div>
    <a class="landing-signin" href="/app">Sign in</a>
  </header>

  <main>
    <section class="landing-hero">
      <div class="landing-hero-copy">
        <h1>Your projects, made clear</h1>
        <p>Know what changed, what it means, and exactly what to do next.</p>
        <div class="landing-cta-stack">
          <a class="landing-cta" href="/app">Continue with Yourkly</a>
          <span id="welcomeBack" class="hidden"></span>
        </div>
      </div>
      <div class="landing-product-wrap">
        <img class="landing-stork-peek" src="${IMG_YOURKLY_STORK}" alt="" aria-hidden="true">
        <div class="landing-product-preview" aria-label="Yourkly project preview">
          <div class="landing-product-head">
            <span class="landing-product-icon">y</span>
            <span><strong>Yourkly</strong><small>Updated 2 hours ago</small></span>
          </div>
          <span class="landing-product-label">What to do next</span>
          <div class="landing-task-card">
            <strong>Review the landing-page update, then continue in Lovable.</strong>
            <span class="landing-preview-action">Continue in Lovable <i aria-hidden="true">&rarr;</i></span>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="landing-footer">
    <span>&copy; 2026 Yourkly</span>
    <a href="https://github.com/Naylahknee/yourkly-artifacts/issues/new" target="_blank" rel="noopener noreferrer">Support</a>
  </footer>
</div>
<script>
fetch('/api/projects').then(function(r){return r.json();}).then(function(j){
  var n=(j.projects||[]).length;
  if(n>0){
    var el=document.getElementById('welcomeBack');
    el.textContent='Welcome back! You have '+n+' project'+(n===1?'':'s')+'.';
    el.classList.remove('hidden');
  }
}).catch(function(){});
</script>
</body>
</html>`;
}

export function renderApp() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yourkly</title>
<style>${PAGE_STYLE}</style>
</head>
<body>
<div class="app-shell">
  <div class="app-mobilebar">
    <a class="app-mobilebar-brand" data-nav="home" aria-label="Yourkly home">
      <img class="app-brand-stork" src="${IMG_YOURKLY_STORK}" alt="">
      <img class="app-brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="Yourkly">
    </a>
    <button class="pl-btn" data-nav="new" style="padding:10px 16px">+ New</button>
  </div>
  <nav class="app-sidebar" aria-label="Main navigation">
    <a class="app-wordmark" data-nav="home" aria-label="Yourkly home">
      <span class="app-brand-lockup">
        <img class="app-brand-stork" src="${IMG_YOURKLY_STORK}" alt="">
        <img class="app-brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="Yourkly">
      </span>
      <span class="app-tagline">Your work, made clear.</span>
    </a>
    <div class="app-nav-group">
      <a class="app-nav-item" data-nav="home">Home</a>
      <a class="app-nav-item" data-nav="new">New project</a>
      <a class="app-nav-item" data-nav="help">Help</a>
    </div>
    <div class="app-sidebar-footer">
      <span class="app-footer-status"><span class="app-status-dot" aria-hidden="true"></span>Your work, saved.</span>
    </div>
  </nav>
  <main class="app-content"><div id="app"></div></main>
</div>

<script>
const MASCOT_IMG = {
  fixer: "${IMG_STORK_FIXER}",
  builder: "${IMG_STORK_BUILDER}",
  polisher: "${IMG_STORK_POLISHER}"
};
const app = document.getElementById('app');
const state = { view: 'home', project: null, files: [], savePoints: [], openFile: null, agents: [] };

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtTime(t) {
  if (!t) return '';
  try { return new Date(t).toLocaleString(); } catch (e) { return ''; }
}
function timeAgo(t) {
  if (!t) return '';
  const s = Math.max(0, (Date.now() - new Date(t).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' minute' + (m === 1 ? '' : 's') + ' ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' hour' + (h === 1 ? '' : 's') + ' ago';
  const d = Math.floor(h / 24);
  if (d < 30) return d + ' day' + (d === 1 ? '' : 's') + ' ago';
  try { return new Date(t).toLocaleDateString(); } catch (e) { return ''; }
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
function fileCountLine(n, m) {
  const f = n + ' file' + (n === 1 ? '' : 's');
  if (m === 0) return f + ' \\u00b7 No Save Point yet.';
  return f + ' \\u00b7 ' + m + ' Save Point' + (m === 1 ? '' : 's');
}
async function api(path, method, body) {
  const r = await fetch(path, { method: method || 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(function() { return {}; });
  if (!r.ok) throw new Error(j.error || 'Something went wrong');
  return j;
}
function setNav(name) {
  document.querySelectorAll('.app-nav-item').forEach(function(a) {
    a.classList.toggle('app-nav-item--active', a.getAttribute('data-nav') === name);
  });
}
document.querySelectorAll('[data-nav]').forEach(function(el) {
  el.addEventListener('click', function() {
    const v = el.getAttribute('data-nav');
    if (v === 'home') showDashboard();
    else if (v === 'new') showNewProjectForm();
    else if (v === 'help') showHelp();
  });
});
function errBox(e) { return '<div class="error-box">' + esc(e.message || 'Something went wrong') + '</div>'; }

// ---------- Dashboard (mirrors the original Home screen) ----------
async function showDashboard() {
  setNav('home');
  state.view = 'home'; state.project = null;
  app.innerHTML = '<div class="screen-padded"><p>Getting your projects...</p></div>';
  let projects = [];
  try {
    const j = await api('/api/projects');
    projects = (j.projects || []).slice();
  } catch (e) { app.innerHTML = '<div class="screen-padded">' + errBox(e) + '</div>'; return; }
  if (projects.length === 0) { showOnboarding(); return; }
  projects.sort(function(a, b) { return new Date(b.lastTime || 0) - new Date(a.lastTime || 0); });

  let details = [];
  try {
    details = await Promise.all(projects.slice(0, 4).map(async function(p) {
      try {
        const d = await api('/api/projects/' + encodeURIComponent(p.name));
        return { name: p.name, files: d.files.length, savePoints: d.savePoints, lastTime: p.lastTime };
      } catch (e) { return { name: p.name, files: 0, savePoints: [], lastTime: p.lastTime }; }
    }));
  } catch (e) { details = []; }

  const most = details[0];
  let hero = '';
  if (most) {
    hero = '<div class="section-label">Continue where you left off</div>' +
      '<section class="home-hero-card">' +
      '<div class="home-hero-context"><span class="home-hero-project">' + esc(most.name) + '</span>' +
      '<span class="home-hero-separator">\\u00b7</span><span class="home-hero-label">Most recent project</span></div>' +
      '<h2 class="home-hero-title">' + esc(most.name) + '</h2>' +
      '<p class="home-hero-goal">' + esc(fileCountLine(most.files, most.savePoints.length)) + '</p>' +
      '<div class="home-hero-actions">' +
      '<button class="pl-btn-primary" id="heroOpen">Open the project</button>' +
      '<button class="pl-btn" data-nav2="new">New project</button>' +
      '</div></section>';
  }

  let cards = '';
  details.forEach(function(d) {
    cards += '<div class="home-project-card" data-name="' + esc(d.name) + '">' +
      '<div class="home-project-info">' +
      '<h3 class="home-project-name">' + esc(d.name) + '</h3>' +
      '<p class="home-project-desc">' + esc(fileCountLine(d.files, d.savePoints.length)) + '</p>' +
      '<p class="home-project-meta">Last touched ' + esc(timeAgo(d.lastTime) || 'recently') + '</p>' +
      '</div><span class="home-project-chevron" aria-hidden="true">\\u203a</span></div>';
  });

  let events = [];
  details.forEach(function(d) {
    (d.savePoints || []).slice(0, 3).forEach(function(s) {
      events.push({ project: d.name, label: s.label, time: s.time });
    });
  });
  events.sort(function(a, b) { return new Date(b.time || 0) - new Date(a.time || 0); });
  events = events.slice(0, 5);
  let activity = '';
  if (events.length === 0) {
    activity = '<p class="home-empty-note">Nothing yet. Save Points you make show up here.</p>';
  } else {
    events.forEach(function(e) {
      activity += '<div class="home-activity-row"><span class="home-activity-dot" aria-hidden="true"></span><span>' +
        '<span class="home-activity-what">Save Point \\u201c' + esc(e.label) + '\\u201d</span>' +
        '<span class="home-activity-meta">' + esc(e.project) + ' \\u00b7 ' + esc(timeAgo(e.time)) + '</span></span></div>';
    });
  }

  app.innerHTML = '<div class="screen-padded">' +
    '<div class="home-header"><div>' +
    '<h1 class="home-greeting">' + esc(greeting()) + '.</h1>' +
    '<p class="home-subtitle">Here\\u2019s where you left off, what changed, and what to do next.</p>' +
    '</div><div><button class="pl-btn" data-nav2="new">New project</button></div></div>' +
    hero +
    '<div class="home-columns"><div>' +
    '<div class="section-label section-label--tight">Recent projects</div>' +
    '<div class="home-project-list">' + cards + '</div></div>' +
    '<div><div class="section-label section-label--tight">Recent activity</div>' +
    '<div class="home-activity">' + activity + '</div></div></div>' +
    '</div>';

  if (most) {
    document.getElementById('heroOpen').onclick = function() { showProject(most.name); };
  }
  app.querySelectorAll('[data-nav2="new"]').forEach(function(b) { b.onclick = showNewProjectForm; });
  app.querySelectorAll('.home-project-card').forEach(function(c) {
    c.onclick = function() { showProject(c.getAttribute('data-name')); };
  });
}

// ---------- New project ----------
function showNewProjectForm() {
  setNav('new');
  state.view = 'new'; state.project = null;
  app.innerHTML = '<div class="screen-padded screen-narrow">' +
    '<a class="back-link" id="backBtn">\\u2190 Home</a>' +
    '<h1 class="page-title">Start a new project</h1>' +
    '<p class="page-sub">Give your project a name. We will set up a safe place for it and save the first version.</p>' +
    '<label class="form-label" for="projectName">Project name</label>' +
    '<input type="text" id="projectName" placeholder="my-project">' +
    '<button class="pl-btn-primary" id="btnCreate">Start the project</button>' +
    '<div id="createMsg"></div>' +
    '<p class="form-hint">Nothing is visible to anyone else.</p></div>';
  document.getElementById('backBtn').onclick = showDashboard;
  document.getElementById('btnCreate').onclick = async function() {
    const input = document.getElementById('projectName');
    const msg = document.getElementById('createMsg');
    msg.innerHTML = '<p>Setting up your project...</p>';
    try {
      const j = await api('/api/projects', 'POST', { name: input.value });
      showProject(j.name);
    } catch (e) { msg.innerHTML = errBox(e); }
  };
}

// ---------- Help ----------
function showHelp() {
  setNav('help');
  state.view = 'help'; state.project = null;
  app.innerHTML = '<div class="screen-padded screen-narrow">' +
    '<a class="back-link" id="backBtn">\\u2190 Home</a>' +
    '<h1 class="page-title">Help</h1>' +
    '<p class="page-sub">Yourkly in plain words.</p>' +
    '<div class="help-card"><h2>What is a Save Point?</h2>' +
    '<p>A Save Point is a snapshot of your project at a moment in time. Every time you save, Yourkly keeps one, so you can always see what changed and go back.</p></div>' +
    '<div class="help-card"><h2>How do I go back to an earlier version?</h2>' +
    '<p>Open your project, find \\u201cReview save points\\u201d, and choose \\u201cGo back to this version\\u201d on the one you want. Yourkly puts those files back and saves that as a new Save Point, so nothing newer is ever lost.</p></div>' +
    '<div class="help-card"><h2>What are the helpers?</h2>' +
    '<p>Three helpers \\u2014 the fixer, the builder, and the polisher \\u2014 can each take a copy of your project and work on it at the same time. You compare what they did in plain words and keep the one you like best.</p></div>' +
    '</div>';
  document.getElementById('backBtn').onclick = showDashboard;
}

// ---------- First-run onboarding (the 4-step tour) ----------
function showOnboarding() {
  setNav('home');
  state.view = 'onboarding';
  app.innerHTML = '<div class="screen-padded">' +
    '<h1 class="home-greeting">' + esc(greeting()) + '.</h1>' +
    '<p class="home-subtitle" style="margin-bottom:24px">Welcome. Four quick steps and you will know your way around.</p>' +
    '<div class="tour-card" id="ob1"><h2><span class="step-num">1</span> Start a new project</h2>' +
    '<p>Give your project a name. We will set up a safe place for it and save the first version.</p>' +
    '<input type="text" id="obName" value="demo-project">' +
    '<button class="pl-btn-primary" id="obCreate">Start the project</button><div id="obMsg1"></div></div>' +
    '<div class="tour-card hidden" id="ob2"><h2><span class="step-num">2</span> Send in 3 helpers</h2>' +
    '<p>Each helper gets its own private copy of the project and a written task. They work at the same time without stepping on each other.</p>' +
    '<button class="pl-btn-primary" id="obAgents">Send in the helpers</button><div class="agent-grid" id="obAgentList"></div></div>' +
    '<div class="tour-card hidden" id="ob3"><h2><span class="step-num">3</span> Compare their work</h2>' +
    '<p>Here is what each helper changed, in plain words. Pick the one to keep.</p>' +
    '<div class="agent-grid" id="obCompare"></div></div>' +
    '<div class="tour-card hidden" id="ob4"><h2><span class="step-num">4</span> Done</h2><p id="obDone"></p>' +
    '<button class="pl-btn-primary" id="obGo">See your projects</button></div></div>';

  const tour = { project: null };

  document.getElementById('obCreate').onclick = async function() {
    const msg = document.getElementById('obMsg1');
    msg.innerHTML = '<p>Setting up your project...</p>';
    try {
      const j = await api('/api/demo/project', 'POST', { name: document.getElementById('obName').value });
      tour.project = j.name;
      msg.innerHTML = '<p class="ok-msg">Project ready. First version saved.</p>';
      document.getElementById('ob2').classList.remove('hidden');
    } catch (e) { msg.innerHTML = errBox(e); }
  };

  document.getElementById('obAgents').onclick = async function() {
    const list = document.getElementById('obAgentList');
    list.innerHTML = '<p>Sending in the helpers...</p>';
    try {
      const j = await api('/api/demo/agents', 'POST', { project: tour.project });
      list.innerHTML = '';
      const cl = document.getElementById('obCompare');
      cl.innerHTML = '';
      j.forks.forEach(function(f, i) {
        list.innerHTML += agentCard(f.label, f.mascot, 'Task: ' + f.task, 'Done. Changes saved.', '');
        cl.innerHTML += '<div class="agent-card" id="obcmp' + i + '"><img class="mascot" src="' + MASCOT_IMG[f.mascot] + '" alt="">' +
          '<h3>' + esc(f.label) + '</h3><div class="changes">' + esc(f.plainChanges) + '</div>' +
          '<button class="pl-btn-primary" data-i="' + i + '">Keep this one</button></div>';
      });
      document.getElementById('ob3').classList.remove('hidden');
      cl.querySelectorAll('button').forEach(function(b) {
        b.onclick = async function() {
          const i = parseInt(b.getAttribute('data-i'), 10);
          const f = j.forks[i];
          cl.querySelectorAll('.agent-card').forEach(function(a) { a.classList.remove('winner'); });
          document.getElementById('obcmp' + i).classList.add('winner');
          try {
            await api('/api/demo/keep', 'POST', { project: tour.project, winnerId: f.id });
            document.getElementById('obDone').textContent = 'Kept ' + f.label + '. The project now has their changes. The other helpers\\u2019 copies are still saved if you ever want to look back.';
            document.getElementById('ob4').classList.remove('hidden');
          } catch (e) { alert(e.message); }
        };
      });
    } catch (e) { list.innerHTML = errBox(e); }
  };

  document.getElementById('obGo').onclick = showDashboard;
}

function agentCard(title, mascot, task, statusText, extra) {
  return '<div class="agent-card"><img class="mascot" src="' + MASCOT_IMG[mascot] + '" alt="">' +
    '<h3>' + esc(title) + '</h3>' +
    (task ? '<div class="task">' + esc(task) + '</div>' : '') +
    '<div class="status done">' + esc(statusText) + '</div>' + (extra || '') + '</div>';
}

// ---------- Project view (mirrors the original Project Home) ----------
async function showProject(name) {
  setNav('');
  state.view = 'project'; state.project = name;
  app.innerHTML = '<div class="screen-padded"><p>Opening your project...</p></div>';
  try {
    const j = await api('/api/projects/' + encodeURIComponent(name));
    state.files = j.files;
    state.savePoints = j.savePoints;
    state.openFile = null;
    state.agents = [];
    renderProject();
  } catch (e) {
    app.innerHTML = '<div class="screen-padded"><a class="back-link" id="backBtn">\\u2190 Home</a>' + errBox(e) + '</div>';
    document.getElementById('backBtn').onclick = showDashboard;
  }
}

function renderProject() {
  const name = state.project;
  const total = state.savePoints.length;
  const latest = state.savePoints[0];

  let recentRows = '';
  state.savePoints.slice(0, 3).forEach(function(s, i) {
    recentRows += '<div class="project-recent-row"><div class="project-recent-title">' + esc(s.label) + '</div>' +
      '<div class="project-recent-meta">' + esc(timeAgo(s.time)) + (total ? ' \\u00b7 v' + (total - i) : '') + '</div></div>';
  });
  const recentCard = total === 0
    ? '<section class="project-update-card"><p class="home-empty-note">No Save Point yet. Save a file and Yourkly keeps the first one.</p></section>'
    : '<div class="section-label">Recently saved</div><section class="project-update-card">' + recentRows + '</section>';

  app.innerHTML = '<div class="screen-padded">' +
    '<a class="back-link" id="backBtn">\\u2190 Home</a>' +
    '<h1 class="project-home-title">' + esc(name) + '</h1>' +
    '<div class="project-status">' +
    '<span>Main version' + (total ? ' \\u00b7 v' + total : '') + '</span><span class="sep">|</span>' +
    (latest ? '<span>Last Save Point ' + esc(timeAgo(latest.time)) + '</span><span class="sep">|</span>' : '') +
    '<span class="ok">Everything saved</span></div>' +
    recentCard +
    '<h2 class="else-title">Or do something else</h2>' +
    '<p class="else-sub">Pick one. You can always come back here.</p>' +
    '<div class="project-actions">' +
    '<div class="project-action" id="actFiles"><span class="project-action-text">' +
    '<span class="project-action-title">Work on files</span>' +
    '<span class="project-action-body">Open and edit the files in this project.</span></span>' +
    '<span class="project-action-cta">Browse files</span></div>' +
    '<div class="project-action" id="actAgents"><span class="project-action-text">' +
    '<span class="project-action-title">Send in the helpers</span>' +
    '<span class="project-action-body">Three helpers each take a copy of this project and work at the same time. You compare their work in plain words and keep the winner.</span></span>' +
    '<span class="project-action-cta">Send in the helpers</span></div>' +
    '<div class="project-action" id="actPoints"><span class="project-action-text">' +
    '<span class="project-action-title">Review save points</span>' +
    '<span class="project-action-body">See every version and what changed. Go back to any of them.</span></span>' +
    '<span class="project-action-cta">View save points</span></div>' +
    '</div>' +

    '<div class="proj-section" id="secFiles"><h2>Files</h2><p class="sub">Everything in this project.</p>' +
    '<ul class="file-list" id="fileList"></ul>' +
    '<button class="pl-btn" id="btnNewFile">New file</button>' +
    '<div id="editorWrap" style="margin-top:16px"></div></div>' +

    '<div class="proj-section" id="secHelpers"><h2>AI helpers</h2>' +
    '<p class="sub">Send in three helpers. Each gets its own copy of the project and a written task. They work at the same time, then you compare and keep the winner.</p>' +
    '<button class="pl-btn-primary" id="btnAgents">Send in the helpers</button>' +
    '<div class="agent-grid" id="agentList"></div>' +
    '<div class="hidden" id="compareWrap" style="margin-top:16px"><h2 style="font-size:18px;margin-bottom:4px">Compare their work</h2>' +
    '<p class="sub">Here is what each helper changed, in plain words. Pick the one to keep.</p>' +
    '<div class="agent-grid" id="compareList"></div></div></div>' +

    '<div class="proj-section" id="secPoints"><h2>Restore an earlier version</h2>' +
    '<p class="sub">Pick the Save Point you want to go back to. Yourkly puts those files back and saves that as a new Save Point, so nothing newer is ever lost.</p>' +
    '<div class="points-list" id="spList"></div></div>' +

    '<div class="danger-zone"><button class="pl-btn pl-btn-danger" id="btnDelete">Delete this project</button></div>' +
    '</div>';

  document.getElementById('backBtn').onclick = showDashboard;
  document.getElementById('actFiles').onclick = function() { document.getElementById('secFiles').scrollIntoView({ behavior: 'smooth' }); };
  document.getElementById('actPoints').onclick = function() { document.getElementById('secPoints').scrollIntoView({ behavior: 'smooth' }); };
  document.getElementById('actAgents').onclick = function() {
    document.getElementById('secHelpers').scrollIntoView({ behavior: 'smooth' });
    sendAgents();
  };

  renderFileList();
  renderSavePoints();

  document.getElementById('btnNewFile').onclick = function() {
    const n = prompt('Name the new file (for example: notes.md)');
    if (n && n.trim()) openFile(n.trim(), '');
  };
  document.getElementById('btnAgents').onclick = sendAgents;
  document.getElementById('btnDelete').onclick = async function() {
    if (!confirm('Delete "' + name + '" and all its helper copies? This cannot be undone.')) return;
    try {
      await api('/api/projects/' + encodeURIComponent(name), 'DELETE');
      showDashboard();
    } catch (e) { alert(e.message); }
  };
}

function renderFileList() {
  const fl = document.getElementById('fileList');
  if (!fl) return;
  let html = '';
  state.files.forEach(function(f) {
    html += '<li data-f="' + esc(f) + '" class="' + (state.openFile === f ? 'active' : '') + '">' + esc(f) + '</li>';
  });
  fl.innerHTML = html || '<li style="cursor:default;color:var(--yp-grey)">No files yet.</li>';
  fl.querySelectorAll('li[data-f]').forEach(function(li) {
    li.onclick = function() { openFile(li.getAttribute('data-f')); };
  });
}

async function openFile(path, presetContent) {
  state.openFile = path;
  renderFileList();
  const wrap = document.getElementById('editorWrap');
  wrap.innerHTML = '<div class="editor-card"><div class="editor-bar">' +
    '<span class="editor-bar-name">' + esc(path) + '</span>' +
    '<span class="editor-pill editor-pill--saved" id="savePill">Saved</span></div>' +
    '<div id="editorBody"><p>Loading...</p></div></div>';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const eb = document.getElementById('editorBody');
  try {
    let content = presetContent;
    const isNew = presetContent !== undefined;
    if (!isNew) {
      const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/file?path=' + encodeURIComponent(path));
      content = j.content;
    }
    const savedContent = content;
    eb.innerHTML = '<textarea class="editor-area" id="fileEditor" aria-label="Contents of ' + esc(path) + '"></textarea>' +
      '<div style="margin-top:12px"><label class="form-label" for="saveLabel">What changed?</label>' +
      '<input type="text" id="saveLabel" placeholder="For example: rewrote the intro"></div>' +
      '<div class="editor-actions"><button class="pl-btn-primary" id="btnSave">Save as a new version</button>' +
      (isNew ? '' : '<button class="pl-btn pl-btn-danger" id="btnDelFile">Delete this file</button>') + '</div><div id="saveMsg"></div>';
    const ta = document.getElementById('fileEditor');
    ta.value = content;
    const pill = document.getElementById('savePill');
    ta.addEventListener('input', function() {
      const dirty = ta.value !== savedContent;
      pill.textContent = dirty ? 'Changes not saved yet' : 'Saved';
      pill.className = 'editor-pill ' + (dirty ? 'editor-pill--unsaved' : 'editor-pill--saved');
    });
    document.getElementById('btnSave').onclick = async function() {
      const msg = document.getElementById('saveMsg');
      msg.innerHTML = '<p>Saving...</p>';
      try {
        await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST', {
          path: path, content: ta.value,
          label: document.getElementById('saveLabel').value || ('Saved ' + path),
        });
        showProject(state.project);
      } catch (e) { msg.innerHTML = errBox(e); }
    };
    const delBtn = document.getElementById('btnDelFile');
    if (delBtn) delBtn.onclick = async function() {
      if (!confirm('Delete "' + path + '"?')) return;
      try {
        await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST', { path: path, remove: true, label: 'Deleted ' + path });
        showProject(state.project);
      } catch (e) { alert(e.message); }
    };
  } catch (e) { eb.innerHTML = errBox(e); }
}

function renderSavePoints() {
  const list = document.getElementById('spList');
  if (!list) return;
  const total = state.savePoints.length;
  if (total === 0) {
    list.innerHTML = '<p class="home-empty-note">No Save Points yet, so there is nothing to go back to.</p>';
    return;
  }
  let html = '';
  state.savePoints.forEach(function(s, i) {
    const v = total - i;
    html += '<div class="points-row" data-sha="' + esc(s.sha) + '">' +
      '<div><div class="points-row-title">' + esc(s.label) + '</div>' +
      '<div class="points-row-meta">' + esc(timeAgo(s.time)) + ' \\u00b7 v' + v + '</div></div>' +
      (i === 0
        ? '<span class="points-current-tag">Current version</span>'
        : '<button class="pl-btn" data-act="ask">Go back to this version</button>') +
      '</div>';
  });
  list.innerHTML = html;
  list.querySelectorAll('button[data-act="ask"]').forEach(function(b) {
    b.onclick = function() {
      const row = b.closest('.points-row');
      const title = row.querySelector('.points-row-title').textContent;
      const sha = row.getAttribute('data-sha');
      row.innerHTML = '<div><div class="points-row-title">' + esc(title) + '</div></div>' +
        '<div class="points-confirm"><span class="points-confirm-text">Put these files back?</span>' +
        '<button class="pl-btn-primary" data-act="yes">Yes, go back to this</button>' +
        '<button class="pl-btn" data-act="no">Cancel</button></div>';
      row.querySelector('[data-act="no"]').onclick = renderSavePoints;
      row.querySelector('[data-act="yes"]').onclick = async function() {
        const btn = this;
        btn.disabled = true;
        btn.textContent = 'Putting them back...';
        try {
          await api('/api/projects/' + encodeURIComponent(state.project) + '/restore', 'POST', { sha: sha, label: title });
          showProject(state.project);
        } catch (e) { alert(e.message); renderSavePoints(); }
      };
    };
  });
}

async function sendAgents() {
  const list = document.getElementById('agentList');
  if (!list) return;
  list.innerHTML = '<p>Sending in the helpers...</p>';
  try {
    const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/agents', 'POST');
    state.agents = j.agents;
    list.innerHTML = '';
    const wrap = document.getElementById('compareWrap');
    const cl = document.getElementById('compareList');
    cl.innerHTML = '';
    j.agents.forEach(function(a, i) {
      list.innerHTML += agentCard(a.name, a.mascot, 'Task: ' + a.task, 'Done. Changes saved.', '');
      cl.innerHTML += '<div class="agent-card" id="cmp' + i + '"><img class="mascot" src="' + MASCOT_IMG[a.mascot] + '" alt="">' +
        '<h3>' + esc(a.name) + '</h3><div class="changes">' + esc(a.plainChanges) + '</div>' +
        '<button class="pl-btn-primary" data-i="' + i + '" data-id="' + esc(a.id) + '">Keep this one</button></div>';
    });
    wrap.classList.remove('hidden');
    wrap.scrollIntoView({ behavior: 'smooth' });
    cl.querySelectorAll('button').forEach(function(b) {
      b.onclick = async function() {
        const i = parseInt(b.getAttribute('data-i'), 10);
        const a = j.agents[i];
        cl.querySelectorAll('.agent-card').forEach(function(c) { c.classList.remove('winner'); });
        document.getElementById('cmp' + i).classList.add('winner');
        try {
          await api('/api/projects/' + encodeURIComponent(state.project) + '/keep', 'POST', { winnerId: b.getAttribute('data-id') });
          alert('Kept ' + a.name + '\\u2019s work. The project now has their changes. The other helpers\\u2019 copies are still saved.');
          showProject(state.project);
        } catch (e) { alert(e.message); }
      };
    });
  } catch (e) { list.innerHTML = errBox(e); }
}

showDashboard();
</script>
</body>
</html>`;
}
