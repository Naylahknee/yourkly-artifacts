// Plain-language web UI. No git jargon anywhere the user can see.
// Translation table (from Yourkly): repository -> project, commit -> save point,
// commit message -> what changed / label, file history -> history,
// restore a commit -> go back to this version, merge -> keep this one,
// fork -> copy for an agent. Branch, SHA and ref are never surfaced.
// GitHub is removed entirely: no GitHub copy, no GitHub buttons, no GitHub OAuth.
// The /app workspace mirrors the original Yourkly app screens: Home dashboard,
// My Projects, Recent Activity, Account, Help hub, and the full project page set
// (Project Home, Updates, Things to Do, Make an Update, Project Files,
// What Changed, Save Points, Separate Versions, Who Can See It, Settings).
// The agents are the contest upgrade inside it: "Send in the helpers" lives in
// the project view (Project Home, Make an Update, Separate Versions), with the
// three stork mascots wherever agents appear.
import {
  IMG_YOURKLY_STORK, IMG_YOURKLY_WORDMARK,
  IMG_STORK_FIXER, IMG_STORK_BUILDER, IMG_STORK_POLISHER,
  IMG_STORK_EMPTY_BASKET,
} from './assets.js';

const PAGE_STYLE = `
  :root { --ink: #1a1a1a; --muted: #666; --line: #e5e5e5; --bg: #fafafa; --purple: #5b4bd6; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--ink); background: var(--bg); line-height: 1.6; }

  /* ── App shell: mirrors the original Yourkly app. Scoped tokens so the
     landing page below stays pixel-identical. ── */
  .app-shell {
    --yp-purple: #6C5CE7; --yp-purple-dark: #5849c4; --yp-ink: #1C1B22; --yp-ink-soft: #4A4753;
    --yp-canvas: #FBFAF8; --yp-grey: #8A8794; --yp-grey-light: #ECEAF4; --yp-grey-border: #D8D6E3;
    --yp-lilac-bg: #F4F2FB; --yp-lilac-border: #E4E0F7; --yp-panel: #FBFAFE;
    --yp-green-bg: #E6F9F4; --yp-green-ink: #0A4F41; --yp-red: #8C3A33; --yp-red-bg: #FBEBEA; --yp-red-border: #F3D9D6;
    --yp-amber-bg: #FAF1E1; --yp-amber-ink: #A3702A;
    --yp-font: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex; min-height: 100vh; background: var(--yp-canvas); color: var(--yp-ink);
    font-family: var(--yp-font); font-size: 15px; line-height: 1.6;
  }
  .app-shell *, .app-shell *::before, .app-shell *::after { box-sizing: border-box; }
  .app-shell h1, .app-shell h2, .app-shell h3, .app-shell h4, .app-shell p { margin: 0; }
  .app-shell button { font-family: var(--yp-font); }
  .app-shell img { max-width: 100%; }

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
  .app-nav-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--yp-grey); padding: 10px 20px 4px; }
  .app-nav-item {
    display: flex; align-items: center; padding: 8px 20px; font-size: 14.5px; font-weight: 500;
    color: var(--yp-ink); text-decoration: none; position: relative; cursor: pointer; background: none; border: none;
    width: 100%; text-align: left;
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
  .screen-padded { padding: 44px 48px 64px; max-width: 1000px; animation: view-in .32s ease both; }
  .screen-narrow { max-width: 600px; }
  @keyframes view-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

  /* Mobile drawer nav */
  .drawer-scrim { position: fixed; inset: 0; background: rgba(28,27,34,.45); z-index: 40; opacity: 0; pointer-events: none; transition: opacity .25s ease; }
  .drawer-scrim.open { opacity: 1; pointer-events: auto; }
  .drawer {
    position: fixed; top: 0; left: 0; bottom: 0; width: min(320px, 84vw); background: #fff; z-index: 41;
    transform: translateX(-105%); transition: transform .28s cubic-bezier(.22,1,.36,1);
    overflow-y: auto; padding: 18px 0 24px; box-shadow: 8px 0 40px rgba(28,27,34,.12);
  }
  .drawer.open { transform: none; }
  .drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 0 20px 14px; border-bottom: 1px solid var(--yp-grey-light); margin-bottom: 8px; }
  .drawer-close { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--yp-grey); padding: 4px 8px; }

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
  .pl-btn--sm { padding: 9px 16px; font-size: 14px; border-radius: 10px; }
  .pl-btn-danger { color: var(--yp-red); border-color: var(--yp-red-border); }
  .pl-btn-danger:hover { border-color: var(--yp-red); color: var(--yp-red); }
  .pl-btn:disabled, .pl-btn-primary:disabled { opacity: .5; cursor: default; }
  .text-link { color: var(--yp-purple); text-decoration: none; font-size: 14px; cursor: pointer; background: none; border: none; padding: 0; }
  .text-link:hover { opacity: .75; }
  .back-link { color: var(--yp-purple); text-decoration: none; font-size: 14px; cursor: pointer; display: inline-block; margin-bottom: 20px; background: none; border: none; padding: 0; }
  .back-link:hover { opacity: .75; }

  .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--yp-grey); margin: 32px 0 12px; }
  .section-label--tight { margin-top: 0; }

  .pl-pill { display: inline-block; font-size: 12.5px; font-weight: 600; padding: 3px 11px; border-radius: 99px; white-space: nowrap; }
  .pl-pill--green { background: var(--yp-green-bg); color: var(--yp-green-ink); }
  .pl-pill--lilac { background: var(--yp-lilac-bg); color: var(--yp-purple); }
  .pl-pill--amber { background: var(--yp-amber-bg); color: var(--yp-amber-ink); }

  input[type=text], .app-shell input[type=text], .app-shell textarea, .app-shell select {
    width: 100%; padding: 12px 14px; font-size: 16px; font-family: var(--yp-font);
    border: 1px solid var(--yp-grey-border); border-radius: 8px; margin-bottom: 12px; background: #fff; color: var(--yp-ink);
  }
  .app-shell textarea { min-height: 120px; line-height: 1.5; resize: vertical; }
  .form-label { font-size: 14px; font-weight: 500; display: block; margin-bottom: 6px; }
  .form-hint { font-size: 13px; color: var(--yp-grey); line-height: 1.5; margin-top: 12px; }
  .error-box { color: var(--yp-red); background: var(--yp-red-bg); border: 1px solid var(--yp-red-border); border-radius: 8px; padding: 12px 14px; margin-top: 12px; font-size: 14px; }
  .ok-msg { color: var(--yp-green-ink); font-size: 14px; margin-top: 12px; }
  .info-callout { background: var(--yp-lilac-bg); border-left: 3px solid var(--yp-purple); border-radius: 0 12px 12px 0; padding: 16px 18px; font-size: 14.5px; color: var(--yp-ink-soft); margin: 20px 0; }
  .info-callout strong { color: var(--yp-ink); }

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
  a.home-activity-what { text-decoration: none; }
  a.home-activity-what:hover { color: var(--yp-purple); }
  .home-activity-meta { display: block; font-size: 12px; color: var(--yp-grey); }
  .home-empty-note { font-size: 14px; color: var(--yp-grey); }

  /* My Projects */
  .projects-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 8px; }
  .projects-hero { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 26px 30px 22px; box-shadow: 0 8px 34px rgba(108,92,231,.12); overflow: hidden; }
  .projects-hero-copy { text-align: center; }
  .projects-hero-copy h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .projects-hero-copy p { font-size: 14.5px; color: var(--yp-grey); max-width: 46em; margin: 0 auto; }
  .projects-intro { font-size: 15px; color: var(--yp-grey); margin: 24px 0 8px; max-width: 62ch; }
  .projects-count { font-size: 14px; color: var(--yp-grey); margin: 18px 0 12px; }
  .project-row {
    background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 18px 20px;
    display: flex; align-items: center; gap: 16px; margin-bottom: 12px;
  }
  .project-row:hover { border-color: var(--yp-purple); box-shadow: 0 4px 18px rgba(108,92,231,.08); }
  .project-row-main { flex: 1; min-width: 0; }
  .project-row-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .project-row-title h3 { font-size: 16.5px; font-weight: 600; text-transform: capitalize; }
  .project-row-desc { font-size: 13.5px; color: var(--yp-grey); margin-top: 4px; }
  .project-row-meta { font-size: 12px; color: var(--yp-grey); margin-top: 4px; }

  /* Empty basket: the stork waits with an empty basket until the first project arrives. */
  .empty-state { text-align: center; padding: 48px 24px; background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; box-shadow: 0 8px 34px rgba(108,92,231,.10); }
  .empty-state img { width: min(300px, 70%); height: auto; margin-bottom: 20px; animation: basket-float 4.5s ease-in-out infinite; }
  .empty-state h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .empty-state p { font-size: 15px; color: var(--yp-grey); max-width: 40em; margin: 0 auto 20px; }
  @keyframes basket-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }

  /* Stork delivery: upgraded flight. Smoother path, gentle bobbing, the parcel
     drops into the basket with a soft bounce and the basket glows on arrival. */
  .stork-delivery-stage { position: relative; height: 118px; max-width: 520px; margin: 0 auto 10px; }
  .stork-delivery-flyer { position: absolute; z-index: 2; left: 0; top: 2px; width: 128px; transform: translate3d(-160px,-8px,0); animation: stork-flight 3.4s cubic-bezier(.22,1,.36,1) both; will-change: transform; }
  .stork-delivery-bird { display: block; width: 112px; height: auto; }
  .stork-delivery-parcel { position: absolute; z-index: 1; left: 0; top: 0; width: 42px; height: 30px; border-radius: 5px; background: var(--yp-purple); box-shadow: 0 5px 12px rgba(108,92,231,.18); animation: parcel-drop 3.4s cubic-bezier(.22,1,.36,1) both; will-change: transform; }
  .stork-delivery-parcel::before { content: ''; position: absolute; left: 5px; top: -6px; width: 17px; height: 8px; border-radius: 4px 4px 0 0; background: var(--yp-purple-dark); }
  .stork-delivery-parcel::after { content: ''; position: absolute; left: 10px; top: 7px; width: 22px; height: 15px; border-radius: 2px; background: #fff; opacity: .92; }
  .stork-delivery-basket { position: absolute; right: 118px; bottom: 4px; width: 74px; height: 50px; border-radius: 7px; background: var(--yp-lilac-bg); border: 2px solid var(--yp-lilac-border); animation: basket-land 3.4s ease both; transform-origin: bottom center; }
  .stork-delivery-basket::before { content: ''; position: absolute; left: 8px; top: -10px; width: 30px; height: 11px; border: 2px solid var(--yp-lilac-border); border-bottom: 0; border-radius: 5px 5px 0 0; }
  @keyframes stork-flight {
    0%   { transform: translate3d(-160px,-10px,0) rotate(-3deg); }
    22%  { transform: translate3d(40px,3px,0) rotate(1.5deg); }
    40%  { transform: translate3d(170px,-5px,0) rotate(-1deg); }
    55%  { transform: translate3d(262px,1px,0) rotate(.8deg); }
    64%  { transform: translate3d(312px,-2px,0) rotate(0deg); }
    80%  { transform: translate3d(470px,-12px,0) rotate(1deg); }
    100% { transform: translate3d(660px,-28px,0) rotate(2deg); }
  }
  @keyframes parcel-drop {
    0%   { transform: translate3d(-94px,65px,0); opacity: 1; }
    22%  { transform: translate3d(106px,76px,0); opacity: 1; }
    40%  { transform: translate3d(236px,68px,0); opacity: 1; }
    55%  { transform: translate3d(328px,74px,0); opacity: 1; }
    64%  { transform: translate3d(372px,78px,0) scale(1); opacity: 1; }
    72%  { transform: translate3d(376px,104px,0) scale(1); opacity: 1; }
    80%  { transform: translate3d(376px,92px,0) scale(.96); opacity: 1; }
    88%  { transform: translate3d(376px,100px,0) scale(1.02); opacity: 1; }
    100% { transform: translate3d(376px,97px,0) scale(1); opacity: 1; }
  }
  @keyframes basket-land {
    0%, 70% { transform: scale(1); box-shadow: none; }
    78% { transform: scale(1.12,.9); box-shadow: 0 0 0 10px rgba(108,92,231,.12); }
    86% { transform: scale(.96,1.05); box-shadow: 0 0 0 6px rgba(108,92,231,.08); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(108,92,231,0); }
  }
  @media (max-width: 560px) {
    .stork-delivery-stage { height: 104px; }
    .stork-delivery-flyer { width: 104px; }
    .stork-delivery-bird { width: 92px; }
    .stork-delivery-parcel { width: 36px; height: 26px; }
    .stork-delivery-basket { right: 60px; width: 64px; height: 44px; }
    @keyframes stork-flight {
      0%   { transform: translate3d(-130px,-8px,0) rotate(-3deg); }
      30%  { transform: translate3d(60px,2px,0) rotate(1deg); }
      60%  { transform: translate3d(200px,-2px,0) rotate(0deg); }
      100% { transform: translate3d(460px,-20px,0) rotate(2deg); }
    }
    @keyframes parcel-drop {
      0%   { transform: translate3d(-75px,55px,0); }
      30%  { transform: translate3d(115px,62px,0); }
      60%  { transform: translate3d(255px,60px,0); }
      72%  { transform: translate3d(258px,86px,0); }
      82%  { transform: translate3d(258px,76px,0) scale(.96); }
      100% { transform: translate3d(258px,81px,0) scale(1); }
    }
  }

  /* New project */
  .choice-chip {
    display: inline-block; padding: 10px 18px; margin: 0 8px 10px 0; background: #fff;
    border: 1px solid var(--yp-grey-border); border-radius: 99px; font-size: 14.5px; font-weight: 600;
    cursor: pointer; color: var(--yp-ink);
  }
  .choice-chip:hover { border-color: var(--yp-purple); color: var(--yp-purple); }
  .choice-chip--on { border-color: var(--yp-purple); color: var(--yp-purple); background: var(--yp-lilac-bg); }
  .wizard-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 18px; padding: 28px 30px; box-shadow: 0 8px 34px rgba(108,92,231,.10); }
  .wizard-card h2 { font-size: 19px; font-weight: 700; margin-bottom: 8px; }
  .wizard-card > p { font-size: 14.5px; color: var(--yp-grey); margin-bottom: 16px; }

  /* Account */
  .account-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 22px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px; }
  .account-avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--yp-lilac-bg); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: var(--yp-purple); flex-shrink: 0; }

  /* Profile preview: floating pill, mirrors the original widget */
  .pp-stage { display: grid; place-items: center; padding: 56px 20px; }
  .pp-pill { --pp-ease: cubic-bezier(.22,1,.36,1); width: 250px; height: 80px; background: #0a0a0b; border-radius: 999px; color: #fff; box-shadow: 0 22px 48px rgba(12,12,18,.19), 0 4px 12px rgba(12,12,18,.12); overflow: hidden; transition: width .56s var(--pp-ease), height .56s var(--pp-ease), border-radius .56s var(--pp-ease); }
  .pp-pill.open { width: min(470px, calc(100vw - 40px)); height: 168px; border-radius: 28px; }
  .pp-collapsed { display: flex; align-items: center; height: 100%; padding: 7px; gap: 4px; }
  .pp-pill.open .pp-collapsed { display: none; }
  .pp-avatar { width: 66px; height: 66px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.94); overflow: hidden; background: #fff; flex: 0 0 auto; }
  .pp-avatar img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .pp-copy { flex: 1; min-width: 0; border: 0; padding: 0 10px; background: transparent; color: inherit; text-align: left; cursor: pointer; font: inherit; }
  .pp-copy span { display: block; color: #a2a2aa; font-size: 11px; font-weight: 600; margin-bottom: 2px; }
  .pp-copy strong { display: block; font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pp-plus { width: 62px; height: 62px; border-radius: 50%; border: 0; background: #34e76c; color: #fff; font-size: 30px; line-height: 1; cursor: pointer; flex: 0 0 auto; }
  .pp-plus:active { transform: scale(.92); }
  .pp-expanded { display: none; height: 100%; padding: 18px 20px; align-items: center; gap: 14px; }
  .pp-pill.open .pp-expanded { display: flex; }
  .pp-id { flex: 1; min-width: 0; }
  .pp-id p { margin: 0 0 2px; color: #a2a2aa; font-size: 12px; font-weight: 600; }
  .pp-id h2 { margin: 0 0 6px; color: #fff; font-size: 20px; letter-spacing: -.02em; }
  .pp-id small { color: #b1b1b9; font-size: 13px; line-height: 1.5; }
  .pp-back { width: 40px; height: 40px; border-radius: 50%; border: 0; background: #242428; color: #fff; font-size: 18px; cursor: pointer; flex: 0 0 auto; }
  @media (max-width: 480px) { .pp-stage { padding: 36px 14px; } .pp-pill.open { height: 190px; } .pp-avatar { width: 58px; height: 58px; } .pp-plus { width: 54px; height: 54px; } }
  @media (prefers-reduced-motion: reduce) { .pp-pill, .pp-plus { transition-duration: 1ms; } }

  /* Project home */
  .project-home-title { font-size: 30px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 8px; text-transform: capitalize; }
  .project-desc { font-size: 15.5px; color: var(--yp-ink-soft); margin-bottom: 16px; max-width: 62ch; }
  .project-status { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 14px; color: var(--yp-grey); margin-bottom: 28px; }
  .project-status .sep { color: var(--yp-grey-border); }
  .project-status .ok { color: var(--yp-green-ink); font-weight: 600; }
  .health-card { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 26px 28px; box-shadow: 0 8px 34px rgba(108,92,231,.12); margin-bottom: 8px; }
  .health-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 4px; }
  .health-title { font-size: 20px; font-weight: 700; }
  .health-sub { font-size: 14px; color: var(--yp-grey); margin-bottom: 16px; }
  .health-check { display: flex; gap: 10px; align-items: flex-start; font-size: 14.5px; padding: 10px 0; border-top: 1px solid var(--yp-grey-light); }
  .health-check .tick { color: var(--yp-green-ink); font-weight: 700; flex-shrink: 0; }
  .health-check .spin { color: var(--yp-purple); flex-shrink: 0; animation: spin 1.1s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .project-recent-row { padding: 10px 0; border-bottom: 1px solid var(--yp-grey-light); }
  .project-recent-row:last-child { border-bottom: none; }
  .project-recent-title { font-weight: 600; font-size: 15px; }
  .project-recent-meta { font-size: 13px; color: var(--yp-grey); }
  .cta-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 16px; }

  /* Helpers promo + agent cards (the contest upgrade, in Yourkly's visual language) */
  .helpers-promo { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 26px 28px; box-shadow: 0 8px 34px rgba(108,92,231,.12); margin: 24px 0 8px; }
  .helpers-promo h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .helpers-promo > p { font-size: 14.5px; color: var(--yp-grey); margin-bottom: 16px; max-width: 58ch; }
  .mascot-trio { display: flex; gap: 8px; margin-bottom: 18px; }
  .mascot-trio img { width: 72px; height: 72px; object-fit: contain; }
  .agent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-top: 16px; }
  .agent-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 20px; animation: card-in .4s ease both; }
  @keyframes card-in { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }
  .agent-card img.mascot { width: 88px; height: 88px; object-fit: contain; display: block; margin-bottom: 10px; }
  .agent-card img.mascot--working { animation: mascot-bob 1.6s ease-in-out infinite; }
  @keyframes mascot-bob { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-7px) rotate(1.5deg); } }
  .agent-card h3 { font-size: 16.5px; font-weight: 600; margin-bottom: 6px; text-transform: capitalize; }
  .agent-card .task { font-size: 13.5px; color: var(--yp-grey); margin-bottom: 10px; }
  .agent-card .status { font-size: 12.5px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .agent-card .status.done { color: var(--yp-green-ink); }
  .agent-card .status.working { color: var(--yp-amber-ink); }
  .dots::after { content: ''; animation: dots 1.2s steps(4) infinite; }
  @keyframes dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } }
  .agent-card .changes { font-size: 14px; background: var(--yp-panel); border-radius: 8px; padding: 12px; margin: 10px 0; white-space: pre-wrap; color: var(--yp-ink-soft); }
  .agent-card.winner { border: 2px solid var(--yp-purple); box-shadow: 0 4px 22px rgba(108,92,231,.22); animation: winner-glow 1.6s ease-in-out infinite; }
  @keyframes winner-glow { 0%,100% { box-shadow: 0 4px 18px rgba(108,92,231,.14); } 50% { box-shadow: 0 4px 28px rgba(108,92,231,.32); } }
  .shimmer { height: 6px; border-radius: 99px; background: linear-gradient(90deg, var(--yp-lilac-bg) 25%, var(--yp-lilac-border) 50%, var(--yp-lilac-bg) 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; margin: 10px 0; }
  @keyframes shimmer { to { background-position: -200% 0; } }
  .hidden { display: none; }

  /* Updates */
  .updates-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 8px; }
  .updates-intro-text { font-size: 15px; color: var(--yp-ink-soft); margin-bottom: 24px; max-width: 62ch; }
  .updates-empty { text-align: center; padding: 32px 16px; }
  .updates-empty p { font-size: 14.5px; color: var(--yp-grey); max-width: 44em; margin: 0 auto 18px; }
  .updates-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 8px; }
  .updates-row { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 18px 20px; display: flex; gap: 20px; justify-content: space-between; text-decoration: none; color: inherit; cursor: pointer; }
  .updates-row:hover { border-color: var(--yp-purple); box-shadow: 0 4px 18px rgba(108,92,231,.08); }
  .updates-row-main { flex: 1; min-width: 0; }
  .updates-row-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }
  .updates-row-title { font-size: 16.5px; font-weight: 600; text-transform: capitalize; }
  .updates-row-goal { font-size: 14px; color: var(--yp-ink-soft); margin-bottom: 6px; }
  .updates-row-meta { font-size: 12.5px; color: var(--yp-grey); }
  .updates-row-next { min-width: 180px; max-width: 240px; }
  .updates-row-next-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--yp-grey); margin-bottom: 4px; }
  .updates-row-next-text { font-size: 13.5px; color: var(--yp-purple); font-weight: 600; }
  .saved-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; margin-bottom: 8px; }

  /* Things to do */
  .todo-form-card { background: var(--yp-lilac-bg); border: 1px solid var(--yp-lilac-border); border-radius: 16px; padding: 22px; margin-bottom: 20px; }
  .todo-item { display: flex; gap: 12px; align-items: flex-start; background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 16px 18px; margin-bottom: 10px; }
  .todo-check { width: 22px; height: 22px; border: 2px solid var(--yp-grey-border); border-radius: 6px; background: #fff; cursor: pointer; flex-shrink: 0; margin-top: 2px; font-size: 14px; line-height: 1; color: #fff; }
  .todo-check--done { background: var(--yp-purple); border-color: var(--yp-purple); }
  .todo-text { flex: 1; min-width: 0; }
  .todo-text strong { display: block; font-size: 15px; }
  .todo-text span { display: block; font-size: 13.5px; color: var(--yp-grey); }
  .todo-text--done strong { text-decoration: line-through; color: var(--yp-grey); }
  .todo-del { background: none; border: none; color: var(--yp-grey); cursor: pointer; font-size: 16px; padding: 2px 6px; }
  .todo-del:hover { color: var(--yp-red); }

  /* Make an update */
  .newupdate-summary { margin-top: 28px; }
  .newupdate-field { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--yp-grey); margin: 18px 0 6px; }
  .newupdate-value { font-size: 15.5px; }
  .newupdate-value--muted { color: var(--yp-grey); }
  .newupdate-summary-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }

  /* Project files */
  .file-legend { font-size: 13.5px; color: var(--yp-grey); margin-bottom: 16px; display: flex; gap: 18px; flex-wrap: wrap; }
  .file-addrow { display: flex; gap: 10px; margin-bottom: 20px; }
  .file-addrow input { margin-bottom: 0; }
  .folder-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 16px 20px; margin-bottom: 10px; }
  .folder-head { display: flex; align-items: center; gap: 12px; }
  .folder-icon { font-size: 18px; }
  .folder-name { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 15px; font-weight: 600; }
  .folder-desc { font-size: 13px; color: var(--yp-grey); margin-top: 2px; }
  .folder-head .spacer { flex: 1; }
  .folder-files { margin-top: 12px; border-top: 1px solid var(--yp-grey-light); padding-top: 6px; }
  .file-row { display: flex; align-items: center; gap: 10px; padding: 12px 4px; border-bottom: 1px solid var(--yp-grey-light); flex-wrap: wrap; }
  .file-row:last-child { border-bottom: none; }
  .file-row-name { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 14px; font-weight: 600; }
  .file-row-desc { font-size: 12.5px; color: var(--yp-grey); flex-basis: 100%; }
  .file-row-actions { display: flex; gap: 6px; margin-left: auto; flex-wrap: wrap; }
  .file-history { flex-basis: 100%; background: var(--yp-panel); border-radius: 8px; padding: 12px 14px; font-size: 13.5px; margin-top: 6px; animation: card-in .3s ease both; }
  .file-history li { margin-bottom: 4px; }

  /* Editor */
  .editor-card { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 24px; box-shadow: 0 8px 34px rgba(108,92,231,.12); margin-top: 16px; animation: card-in .3s ease both; }
  .editor-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
  .editor-bar-name { font-size: 17px; font-weight: 700; flex: 1; min-width: 120px; font-family: ui-monospace, Menlo, Consolas, monospace; }
  .editor-pill { font-size: 12.5px; font-weight: 600; padding: 4px 11px; border-radius: 99px; white-space: nowrap; }
  .editor-pill--saved { background: var(--yp-green-bg); color: var(--yp-green-ink); }
  .editor-pill--unsaved { background: var(--yp-amber-bg); color: var(--yp-amber-ink); }
  textarea.editor-area { width: 100%; min-height: 320px; padding: 14px; font-size: 14px; font-family: ui-monospace, Menlo, Consolas, monospace; border: 1px solid var(--yp-grey-border); border-radius: 8px; line-height: 1.5; background: #fff; color: var(--yp-ink); margin-bottom: 0; }
  .editor-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 12px; }

  /* Save points */
  .points-intro { font-size: 15px; color: var(--yp-ink-soft); margin-bottom: 20px; max-width: 60ch; }
  .points-list { display: flex; flex-direction: column; gap: 8px; }
  .points-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; }
  .points-row-title { font-size: 15px; font-weight: 600; }
  .points-row-meta { font-size: 13px; color: var(--yp-grey); }
  .points-current-tag { font-size: 12.5px; font-weight: 600; color: var(--yp-purple); }
  .points-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .points-confirm-text { font-size: 14px; }

  /* What changed */
  .changed-row { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 16px 20px; margin-bottom: 10px; }
  .changed-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .changed-detail { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--yp-grey-light); font-size: 14px; color: var(--yp-ink-soft); animation: card-in .3s ease both; }
  .changed-detail dl { display: grid; grid-template-columns: 130px 1fr; gap: 6px 12px; margin: 0; }
  .changed-detail dt { color: var(--yp-grey); font-size: 13px; }
  .changed-detail dd { margin: 0; }

  /* Separate versions */
  .versions-main { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 20px 22px; margin-bottom: 12px; }
  .versions-main-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .versions-main-name { font-size: 16.5px; font-weight: 700; }
  .versions-main-body { font-size: 14.5px; color: var(--yp-ink-soft); margin-bottom: 14px; }
  .versions-note { font-size: 13px; color: var(--yp-grey); margin-top: 10px; }
  .version-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 20px 22px; margin-bottom: 12px; display: flex; gap: 18px; align-items: flex-start; }
  .version-card img.mascot { width: 76px; height: 76px; object-fit: contain; flex-shrink: 0; }
  .version-card-main { flex: 1; min-width: 0; }
  .version-card-name { font-size: 16.5px; font-weight: 700; text-transform: capitalize; margin-bottom: 4px; }
  .version-card-desc { font-size: 14px; color: var(--yp-ink-soft); margin-bottom: 6px; }
  .version-card-meta { font-size: 12.5px; color: var(--yp-grey); margin-bottom: 10px; }
  .version-card .changes { font-size: 13.5px; background: var(--yp-panel); border-radius: 8px; padding: 12px; margin: 10px 0; white-space: pre-wrap; color: var(--yp-ink-soft); }
  .versions-footer { background: var(--yp-lilac-bg); border: 1px solid var(--yp-lilac-border); border-radius: 14px; padding: 22px; margin-top: 16px; }
  .versions-footer-title { font-size: 16.5px; font-weight: 700; margin-bottom: 6px; }
  .versions-footer-body { font-size: 14px; color: var(--yp-ink-soft); margin-bottom: 14px; }

  /* Settings */
  .settings-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 22px; margin-bottom: 16px; }
  .settings-label { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .settings-label--danger { color: var(--yp-red); }
  .settings-body { font-size: 14.5px; color: var(--yp-ink-soft); margin-bottom: 12px; }
  .settings-hint { font-size: 13px; color: var(--yp-grey); margin: 10px 0; }
  .settings-card--danger { border-color: var(--yp-red-border); }

  /* Help */
  .help-search { margin-bottom: 28px; }
  .help-section-title { font-size: 20px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 4px; }
  .help-section-intro { font-size: 14px; color: var(--yp-grey); margin-bottom: 18px; }
  .help-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 20px 22px; margin-bottom: 12px; }
  .help-card h2, .help-card h3 { font-size: 16.5px; font-weight: 600; margin-bottom: 6px; }
  .help-card p { font-size: 15px; color: var(--yp-ink-soft); }
  .help-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
  .help-topic-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 20px; text-decoration: none; color: inherit; display: block; }
  .help-topic-card:hover { border-color: var(--yp-purple); box-shadow: 0 4px 18px rgba(108,92,231,.08); }
  .help-topic-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .help-topic-card p { font-size: 13.5px; color: var(--yp-grey); margin-bottom: 10px; }
  .accordion { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; margin-bottom: 10px; overflow: hidden; }
  .accordion-head { width: 100%; background: none; border: none; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; cursor: pointer; font-size: 15px; font-weight: 600; color: var(--yp-ink); text-align: left; }
  .accordion-head:hover { color: var(--yp-purple); }
  .accordion-icon { font-size: 18px; color: var(--yp-grey); flex-shrink: 0; transition: transform .25s ease; }
  .accordion.open .accordion-icon { transform: rotate(45deg); }
  .accordion-body { max-height: 0; overflow: hidden; transition: max-height .3s ease; }
  .accordion-body-inner { padding: 0 20px 20px; font-size: 14.5px; color: var(--yp-ink-soft); }
  .accordion-body-inner p { margin-bottom: 10px; }
  .steps-list { display: flex; flex-direction: column; gap: 10px; margin: 18px 0; }
  .step-row { display: flex; gap: 14px; align-items: flex-start; background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 16px 18px; cursor: pointer; width: 100%; text-align: left; }
  .step-row:hover { border-color: var(--yp-purple); }
  .step-row--on { border-color: var(--yp-purple); background: var(--yp-lilac-bg); }
  .step-num { display: inline-flex; align-items: center; justify-content: center; background: var(--yp-lilac-bg); color: var(--yp-purple); min-width: 28px; height: 28px; border-radius: 50%; font-size: 14px; font-weight: 700; flex-shrink: 0; }
  .step-row--on .step-num { background: var(--yp-purple); color: #fff; }
  .step-text { font-size: 14.5px; font-weight: 600; }
  .step-detail { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 16px; padding: 24px 26px; margin-top: 6px; animation: card-in .3s ease both; }
  .step-detail h3 { font-size: 19px; font-weight: 700; margin-bottom: 8px; }
  .step-detail p { font-size: 14.5px; color: var(--yp-ink-soft); margin-bottom: 10px; }
  .glossary-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; overflow: hidden; font-size: 14.5px; }
  .glossary-table th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--yp-grey); padding: 14px 18px; border-bottom: 1px solid var(--yp-grey-light); background: var(--yp-panel); }
  .glossary-table td { padding: 14px 18px; border-bottom: 1px solid var(--yp-grey-light); vertical-align: top; }
  .glossary-table tr:last-child td { border-bottom: none; }
  .glossary-term { font-weight: 600; white-space: nowrap; }
  .kind-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0 24px; }
  .kind-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 18px; cursor: pointer; text-align: left; }
  .kind-card:hover { border-color: var(--yp-purple); }
  .kind-card--on { border-color: var(--yp-purple); background: var(--yp-lilac-bg); }
  .kind-card strong { display: block; font-size: 15px; margin-bottom: 6px; }
  .kind-card span { font-size: 13px; color: var(--yp-grey); }
  .task-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 18px 0; }
  .task-card { background: #fff; border: 1px solid var(--yp-grey-light); border-radius: 14px; padding: 18px 20px; cursor: pointer; text-align: left; }
  .task-card:hover { border-color: var(--yp-purple); }
  .task-card--on { border-color: var(--yp-purple); background: var(--yp-lilac-bg); }
  .task-card-label { display: block; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .task-card-summary { display: block; font-size: 13.5px; color: var(--yp-grey); }
  .walk-step { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
  .walk-step p { font-size: 14.5px; }

  /* Onboarding tour */
  .tour-card { background: #fff; border: 1px solid var(--yp-lilac-border); border-radius: 18px; padding: 28px 30px; box-shadow: 0 8px 34px rgba(108,92,231,.12); margin-bottom: 16px; animation: card-in .4s ease both; }
  .tour-card h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .tour-card p { font-size: 15px; color: var(--yp-ink-soft); margin-bottom: 16px; }
  .tour-card .step-num { background: var(--yp-ink); color: #fff; margin-right: 8px; vertical-align: middle; }

  @media (max-width: 900px) {
    .app-sidebar { display: none; }
    .app-mobilebar {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--yp-grey-light);
      position: sticky; top: 0; z-index: 30;
    }
    .drawer-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--yp-ink); padding: 6px 10px; }
    .app-mobilebar-brand { display: flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none; }
    .app-mobilebar-brand .app-brand-stork { width: 28px; height: 28px; }
    .app-mobilebar-brand .app-brand-wordmark { height: 22px; }
    .screen-padded { padding: 28px 20px 48px; }
    .home-columns { grid-template-columns: 1fr; }
    .home-hero-card { padding: 24px 20px; }
    .projects-head { flex-direction: column; }
    .updates-row { flex-direction: column; }
    .updates-row-next { max-width: none; }
    .help-grid3, .kind-cards { grid-template-columns: 1fr; }
    .task-grid { grid-template-columns: 1fr; }
    .version-card { flex-direction: column; }
    .file-addrow { flex-direction: column; }
    .project-row { flex-direction: column; align-items: flex-start; }
    .changed-detail dl { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    .screen-padded, .agent-card, .version-card, .editor-card, .tour-card, .step-detail, .file-history, .changed-detail { animation: none; }
    .stork-delivery-flyer, .stork-delivery-parcel { display: none; animation: none; }
    .stork-delivery-basket { animation: none; }
    .empty-state img { animation: none; }
    .agent-card img.mascot--working { animation: none; }
    .shimmer { animation: none; }
    .dots::after { animation: none; content: '...'; }
    .health-check .spin { animation: none; }
    .accordion-body { transition: none; }
    .drawer { transition: none; }
  }
`;

const LANDING_STYLE = `
  body.landing-body { background: #fff; }
  .landing-shell { width: min(1240px, 100%); margin: 0 auto; padding: 36px 28px 0; }
  .landing-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-bottom: 74px; }
  .landing-header .brand-lockup { cursor: default; display: inline-flex; align-items: center; gap: 8px; }
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
<style>${PAGE_STYLE}${LANDING_STYLE}</style>
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
    <button class="drawer-btn" id="drawerBtn" aria-label="Open menu">&#9776;</button>
    <a class="app-mobilebar-brand" data-nav="home" aria-label="Yourkly home">
      <img class="app-brand-stork" src="${IMG_YOURKLY_STORK}" alt="">
      <img class="app-brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="Yourkly">
    </a>
    <button class="pl-btn pl-btn--sm" data-nav="new">+ New</button>
  </div>
  <nav class="app-sidebar" aria-label="Main navigation">
    <a class="app-wordmark" data-nav="home" aria-label="Yourkly home">
      <span class="app-brand-lockup">
        <img class="app-brand-stork" src="${IMG_YOURKLY_STORK}" alt="">
        <img class="app-brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="Yourkly">
      </span>
      <span class="app-tagline">Your work, made clear.</span>
    </a>
    <div class="app-nav-group" id="sideGlobal"></div>
    <div class="app-nav-group hidden" id="sideProjectWrap">
      <div class="app-nav-label" id="sideProjectLabel"></div>
      <div id="sideProject"></div>
    </div>
    <div class="app-sidebar-footer">
      <span class="app-footer-status"><span class="app-status-dot" aria-hidden="true"></span>Your work, saved.</span>
    </div>
  </nav>
  <div class="drawer-scrim" id="drawerScrim"></div>
  <aside class="drawer" id="drawer" aria-label="Menu">
    <div class="drawer-head">
      <span class="app-brand-lockup">
        <img class="app-brand-stork" src="${IMG_YOURKLY_STORK}" alt="" style="width:28px;height:28px">
        <img class="app-brand-wordmark" src="${IMG_YOURKLY_WORDMARK}" alt="Yourkly" style="height:22px">
      </span>
      <button class="drawer-close" id="drawerClose" aria-label="Close menu">&times;</button>
    </div>
    <div class="app-nav-group" id="drawerGlobal"></div>
    <div class="app-nav-group hidden" id="drawerProjectWrap">
      <div class="app-nav-label" id="drawerProjectLabel"></div>
      <div id="drawerProject"></div>
    </div>
  </aside>
  <main class="app-content"><div id="app"></div></main>
</div>

<script>
const MASCOT_IMG = {
  fixer: "${IMG_STORK_FIXER}",
  builder: "${IMG_STORK_BUILDER}",
  polisher: "${IMG_STORK_POLISHER}"
};
const IMG_EMPTY_BASKET = "${IMG_STORK_EMPTY_BASKET}";
const app = document.getElementById('app');
const state = {
  view: 'home', project: null, displayName: null, files: [], savePoints: [],
  openFile: null, agents: [], updateGoal: '', helpTopic: 'getting-started', justKept: '',
};
// Human-visible project name. state.project stays the safe slug used in API paths.
function projLabel() { return state.displayName || state.project || ''; }
function clearProjectState() { state.project = null; state.displayName = null; }

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
  const ctrl = new AbortController();
  const timer = setTimeout(function() { ctrl.abort(); }, 30000);
  try {
    const r = await fetch(path, { method: method || 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal });
    const j = await r.json().catch(function() { return {}; });
    if (!r.ok) throw new Error(j.error || 'Something went wrong');
    return j;
  } catch (e) {
    if (e && e.name === 'AbortError') throw new Error('That took too long. Check your connection and try again.');
    throw e;
  } finally { clearTimeout(timer); }
}
function errBox(e) { return '<div class="error-box">' + esc(e.message || 'Something went wrong') + '</div>'; }
function retryBox() {
  return '<div class="screen-padded">' + errBox(new Error('That took too long. Check your connection and try again.')) +
    '<p><button class="pl-btn-primary" id="retryLoad">Try again</button></p></div>';
}
function bindRetry(viewName) {
  const b = document.getElementById('retryLoad');
  if (b) b.onclick = function() { go(viewName); };
}

/* ---------- Navigation: mirrors the original app's nav ---------- */
const GLOBAL_NAV = [
  ['home', 'Home'], ['projects', 'My Projects'], ['activity', 'Recent Activity'],
  ['account', 'Account'], ['help', 'Help'],
];
const PROJECT_NAV = [
  ['project', 'Project Home'], ['updates', 'Updates'], ['todos', 'Things to Do'],
  ['newupdate', 'Make an Update'], ['files', 'Project Files'], ['changed', 'What Changed'],
  ['points', 'Save Points'], ['versions', 'Separate Versions'],
  ['continue', 'Continue in\\u2026'], ['share', 'Who Can See It'], ['settings', 'Settings'],
];
function navItem(view, label, active) {
  return '<button class="app-nav-item' + (active ? ' app-nav-item--active' : '') + '" data-nav="' + view + '">' + esc(label) + '</button>';
}
function renderNav(activeView) {
  const g = GLOBAL_NAV.map(function(n) { return navItem(n[0], n[1], activeView === n[0] || (activeView === 'new' && n[0] === 'projects')); }).join('');
  document.getElementById('sideGlobal').innerHTML = g;
  document.getElementById('drawerGlobal').innerHTML = g;
  const inProject = !!state.project;
  ['sideProjectWrap', 'drawerProjectWrap'].forEach(function(id) {
    document.getElementById(id).classList.toggle('hidden', !inProject);
  });
  if (inProject) {
    const label = projLabel();
    document.getElementById('sideProjectLabel').textContent = label;
    document.getElementById('drawerProjectLabel').textContent = label;
    const p = PROJECT_NAV.map(function(n) { return navItem(n[0], n[1], activeView === n[0]); }).join('');
    document.getElementById('sideProject').innerHTML = p;
    document.getElementById('drawerProject').innerHTML = p;
  }
  bindNavClicks();
}
function bindNavClicks() {
  document.querySelectorAll('[data-nav]').forEach(function(el) {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', function() {
      closeDrawer();
      go(el.getAttribute('data-nav'));
    });
  });
}
function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawerScrim').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawerScrim').classList.remove('open');
}
document.getElementById('drawerBtn').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
document.getElementById('drawerScrim').addEventListener('click', closeDrawer);

function go(view, arg) {
  renderNav(view);
  state.view = view;
  if (view === 'home') showDashboard();
  else if (view === 'projects') showProjects();
  else if (view === 'activity') showActivity();
  else if (view === 'account') showAccount();
  else if (view === 'profile-preview') showProfilePreview();
  else if (view === 'new') showNewProjectForm();
  else if (view === 'help') showHelp(arg || 'getting-started');
  else if (view === 'project') showProject(state.project);
  else if (view === 'updates') showUpdates();
  else if (view === 'todos') showTodos();
  else if (view === 'newupdate') showNewUpdate();
  else if (view === 'files') showFiles();
  else if (view === 'changed') showChanged();
  else if (view === 'points') showSavePoints();
  else if (view === 'versions') showVersions(arg);
  else if (view === 'continue') showContinueIn();
  else if (view === 'share') showShare();
  else if (view === 'settings') showSettings();
}
function backToHome() {
  return '<button class="back-link" data-go="home">\\u2190 Home</button>';
}
function backToProject() {
  return '<button class="back-link" data-go="project">\\u2190 ' + esc(projLabel()) + '</button>';
}
function bindGoButtons(root) {
  (root || document).querySelectorAll('[data-go]').forEach(function(el) {
    el.addEventListener('click', function() { go(el.getAttribute('data-go')); });
  });
}
async function loadProject(name) {
  const j = await api('/api/projects/' + encodeURIComponent(name));
  state.project = name;
  state.displayName = j.displayName || name;
  state.files = j.files || [];
  state.savePoints = j.savePoints || [];
  state.openFile = null;
  state.agents = [];
  return j;
}

/* ---------- Dashboard (Home) ---------- */
async function showDashboard() {
  renderNav('home');
  state.view = 'home'; clearProjectState();
  app.innerHTML = '<div class="screen-padded"><p>Getting your projects...</p></div>';
  let projects = [];
  try {
    const j = await api('/api/projects');
    projects = (j.projects || []).slice();
  } catch (e) { app.innerHTML = retryBox(); bindRetry('home'); return; }
  if (projects.length === 0) { showOnboarding(); return; }
  projects.sort(function(a, b) { return new Date(b.lastTime || 0) - new Date(a.lastTime || 0); });

  let details = [];
  try {
    details = await Promise.all(projects.slice(0, 4).map(async function(p) {
      try {
        const d = await api('/api/projects/' + encodeURIComponent(p.name));
        return { name: p.name, displayName: p.displayName || p.name, files: d.files.length, savePoints: d.savePoints, lastTime: p.lastTime };
      } catch (e) { return { name: p.name, displayName: p.displayName || p.name, files: 0, savePoints: [], lastTime: p.lastTime }; }
    }));
  } catch (e) { details = []; }

  const most = details[0];
  let hero = '';
  if (most) {
    hero = '<div class="section-label">Continue where you left off</div>' +
      '<section class="home-hero-card">' +
      '<div class="home-hero-context"><span class="home-hero-project">' + esc(most.displayName || most.name) + '</span>' +
      '<span class="home-hero-separator">\\u00b7</span><span class="home-hero-label">Most recent project</span></div>' +
      '<h2 class="home-hero-title">' + esc(most.displayName || most.name) + '</h2>' +
      '<p class="home-hero-goal">' + esc(fileCountLine(most.files, most.savePoints.length)) + '</p>' +
      '<div class="home-hero-actions">' +
      '<button class="pl-btn-primary" id="heroOpen">Open the project</button>' +
      '<button class="pl-btn" data-go="new">New project</button>' +
      '</div></section>';
  }

  let cards = '';
  details.forEach(function(d) {
    cards += '<div class="home-project-card" data-name="' + esc(d.name) + '">' +
      '<div class="home-project-info">' +
      '<h3 class="home-project-name">' + esc(d.displayName || d.name) + '</h3>' +
      '<p class="home-project-desc">' + esc(fileCountLine(d.files, d.savePoints.length)) + '</p>' +
      '<p class="home-project-meta">Last touched ' + esc(timeAgo(d.lastTime) || 'recently') + '</p>' +
      '</div><span class="home-project-chevron" aria-hidden="true">\\u203a</span></div>';
  });

  let events = [];
  details.forEach(function(d) {
    (d.savePoints || []).slice(0, 3).forEach(function(s) {
      events.push({ project: d.name, displayName: d.displayName || d.name, label: s.label, time: s.time });
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
        '<span class="home-activity-meta">' + esc(e.displayName || e.project) + ' \\u00b7 ' + esc(timeAgo(e.time)) + '</span></span></div>';
    });
  }

  app.innerHTML = '<div class="screen-padded">' +
    '<div class="home-header"><div>' +
    '<h1 class="home-greeting">' + esc(greeting()) + '.</h1>' +
    '<p class="home-subtitle">Here\\u2019s where you left off, what changed, and what to do next.</p>' +
    '</div><div><button class="pl-btn" data-go="new">New project</button></div></div>' +
    hero +
    '<div class="home-columns"><div>' +
    '<div class="section-label section-label--tight">Recent projects</div>' +
    '<div class="home-project-list">' + cards + '</div></div>' +
    '<div><div class="section-label section-label--tight">Recent activity</div>' +
    '<div class="home-activity">' + activity + '</div></div></div>' +
    '</div>';

  bindGoButtons(app);
  if (most) {
    document.getElementById('heroOpen').onclick = function() { state.project = most.name; go('project'); };
  }
  app.querySelectorAll('.home-project-card').forEach(function(c) {
    c.onclick = function() { state.project = c.getAttribute('data-name'); go('project'); };
  });
}

/* ---------- My Projects ---------- */
function storkDelivery(count) {
  const title = count === 1 ? 'We found your project.' : 'We found ' + count + ' projects.';
  return '<div class="stork-delivery-stage" aria-hidden="true">' +
    '<div class="stork-delivery-flyer"><img class="stork-delivery-bird" src="' + IMG_YOURKLY_STORK + '" alt=""></div>' +
    '<span class="stork-delivery-parcel"></span>' +
    '<span class="stork-delivery-basket"></span></div>' +
    '<div class="projects-hero-copy"><h2>' + esc(title) + '</h2>' +
    '<p>Your projects are saved and kept safe. Yourkly brought them into view in plain language.</p></div>';
}
async function showProjects() {
  renderNav('projects');
  state.view = 'projects'; clearProjectState();
  app.innerHTML = '<div class="screen-padded"><p>Getting your projects...</p></div>';
  let projects = [];
  try {
    const j = await api('/api/projects');
    projects = (j.projects || []).slice();
  } catch (e) { app.innerHTML = retryBox(); bindRetry('projects'); return; }
  projects.sort(function(a, b) { return new Date(b.lastTime || 0) - new Date(a.lastTime || 0); });

  let body = '<div class="screen-padded">' +
    '<div class="projects-head"><div>' +
    '<h1 class="page-title">My Projects</h1></div>' +
    '<div><button class="pl-btn-primary" data-go="new">Add a project</button></div></div>';

  if (projects.length === 0) {
    body += '<div class="empty-state">' +
      '<img src="' + IMG_EMPTY_BASKET + '" alt="Yourkly the stork carrying an empty basket">' +
      '<h2>Your basket is empty.</h2>' +
      '<p>Start your first project and the stork will carry it home.</p>' +
      '<button class="pl-btn-primary" data-go="new">Add a project</button></div>';
  } else {
    body += '<section class="projects-hero">' + storkDelivery(projects.length) + '</section>' +
      '<p class="projects-intro">These are your projects. Yourkly translates the technical parts into plain language.</p>' +
      '<p><button class="text-link" data-gohelp="glossary">What do these words mean?</button></p>' +
      '<p class="projects-count">' + projects.length + ' project' + (projects.length === 1 ? '' : 's') + '.</p>';
    projects.forEach(function(p) {
      body += '<div class="project-row"><div class="project-row-main">' +
        '<div class="project-row-title"><h3>' + esc(p.displayName || p.name) + '</h3>' +
        '<span class="pl-pill pl-pill--green">Up to date</span></div>' +
        '<p class="project-row-desc">' + esc(p.lastSaved || 'No versions yet') + '</p>' +
        '<p class="project-row-meta">Last touched ' + esc(timeAgo(p.lastTime) || 'recently') + ' \\u00b7 ' + (p.savePoints || 0) + ' Save Point' + ((p.savePoints || 0) === 1 ? '' : 's') + '</p>' +
        '</div><button class="pl-btn" data-open="' + esc(p.name) + '">Open project</button></div>';
    });
  }
  body += '</div>';
  app.innerHTML = body;
  bindGoButtons(app);
  app.querySelectorAll('[data-gohelp]').forEach(function(b) {
    b.onclick = function() { go('help', b.getAttribute('data-gohelp')); };
  });
  app.querySelectorAll('[data-open]').forEach(function(b) {
    b.onclick = function() { state.project = b.getAttribute('data-open'); go('project'); };
  });
}

/* ---------- Recent Activity (Timeline) ---------- */
async function showActivity() {
  renderNav('activity');
  state.view = 'activity'; clearProjectState();
  app.innerHTML = '<div class="screen-padded"><p>Getting your activity...</p></div>';
  let projects = [];
  try { projects = (await api('/api/projects')).projects || []; }
  catch (e) { app.innerHTML = retryBox(); bindRetry('activity'); return; }
  let events = [];
  try {
    const details = await Promise.all(projects.slice(0, 6).map(async function(p) {
      try { const d = await api('/api/projects/' + encodeURIComponent(p.name)); return { name: p.name, displayName: p.displayName || p.name, savePoints: d.savePoints || [] }; }
      catch (e) { return { name: p.name, displayName: p.displayName || p.name, savePoints: [] }; }
    }));
    details.forEach(function(d) {
      (d.savePoints || []).slice(0, 8).forEach(function(s) {
        events.push({ project: d.name, displayName: d.displayName || d.name, what: 'Save Point \\u201c' + s.label + '\\u201d', at: s.time });
      });
    });
  } catch (e) { /* keep what we have */ }
  events.sort(function(a, b) { return new Date(b.at || 0) - new Date(a.at || 0); });

  let body = '<div class="screen-padded">' + backToHome() +
    '<h1 class="page-title">Timeline</h1>' +
    '<p class="page-sub">Your Save Points and recent work, newest first.</p>';
  if (events.length === 0) {
    body += '<div class="home-activity"><p class="home-empty-note">Nothing yet. Anything you or a helper does shows up here.</p>' +
      '<p><button class="text-link" data-go="projects">My Projects</button></p></div>';
  } else {
    body += '<div class="home-activity">';
    events.slice(0, 30).forEach(function(e) {
      body += '<div class="home-activity-row"><span class="home-activity-dot" aria-hidden="true"></span><span>' +
        '<a class="home-activity-what" data-open="' + esc(e.project) + '">' + esc(e.what) + '</a>' +
        '<span class="home-activity-meta">' + esc(e.displayName || e.project) + ' \\u00b7 ' + esc(timeAgo(e.at)) + '</span></span></div>';
    });
    body += '</div>';
  }
  body += '</div>';
  app.innerHTML = body;
  bindGoButtons(app);
  app.querySelectorAll('[data-open]').forEach(function(b) {
    b.onclick = function() { state.project = b.getAttribute('data-open'); go('project'); };
  });
}

/* ---------- Account ---------- */
function showAccount() {
  renderNav('account');
  state.view = 'account'; clearProjectState();
  app.innerHTML = '<div class="screen-padded screen-narrow">' + backToHome() +
    '<h1 class="page-title">Account</h1>' +
    '<p class="page-sub">How Yourkly knows it is you.</p>' +
    '<div class="account-card"><div class="account-avatar">Y</div>' +
    '<div><strong>Hi there.</strong><p class="home-empty-note">You are using Yourkly without an account.</p></div></div>' +
    '<div class="help-card"><h2>No sign-in needed</h2>' +
    '<p>Yourkly works without a login. Your projects are saved and kept safe, and everything stays in your own workspace.</p></div>' +
    '<div class="help-card"><h2>Your projects</h2>' +
    '<p>Only you can open your projects from here. Nothing is shared unless you share it yourself.</p></div>' +
    '<div class="help-card"><h2>Your profile pill</h2>' +
    '<p>A small card that says hello for you, anywhere it appears. Take a look at how it looks.</p>' +
    '<button class="pl-btn" data-go="profile-preview">Preview the pill</button></div>' +
    '</div>';
  bindGoButtons(app);
}

/* ---------- Profile preview: floating pill, mirrors the original widget ---------- */
function showProfilePreview() {
  renderNav('account');
  state.view = 'profile-preview'; clearProjectState();
  app.innerHTML = '<div class="screen-padded screen-narrow">' +
    '<button class="back-link" data-go="account">\\u2190 Account</button>' +
    '<h1 class="page-title">Profile preview</h1>' +
    '<p class="page-sub">This is what your profile pill looks like to others.</p>' +
    '<div class="pp-stage"><div class="pp-pill" id="ppPill">' +
    '<div class="pp-collapsed">' +
    '<span class="pp-avatar"><img src="' + IMG_YOURKLY_STORK + '" alt=""></span>' +
    '<button class="pp-copy" id="ppOpen"><span>Hello, I\\u2019m</span><strong>Your profile</strong></button>' +
    '<button class="pp-plus" id="ppPlus" aria-label="Open profile">+</button>' +
    '</div>' +
    '<div class="pp-expanded">' +
    '<span class="pp-avatar"><img src="' + IMG_YOURKLY_STORK + '" alt=""></span>' +
    '<div class="pp-id"><p>Hello, I\\u2019m</p><h2>Your profile</h2>' +
    '<small>A small card that says hello for you, anywhere it appears.</small></div>' +
    '<button class="pp-back" id="ppBack" aria-label="Back">\\u2190</button>' +
    '</div>' +
    '</div></div></div>';
  bindGoButtons(app);
  var pill = document.getElementById('ppPill');
  document.getElementById('ppOpen').onclick = function() { pill.classList.add('open'); };
  document.getElementById('ppPlus').onclick = function() { pill.classList.add('open'); };
  document.getElementById('ppBack').onclick = function() { pill.classList.remove('open'); };
}

/* ---------- Add a project ---------- */
function showNewProjectForm() {
  renderNav('new');
  state.view = 'new'; clearProjectState();
  app.innerHTML = '<div class="screen-padded screen-narrow">' +
    '<button class="back-link" data-go="projects">\\u2190 My Projects</button>' +
    '<h1 class="page-title">Add a project</h1>' +
    '<p class="page-sub">Start something new. Yourkly sets up a safe place for it and saves the first version.</p>' +
    '<div class="wizard-card"><h2>Make your project</h2>' +
    '<p>A project is simply the thing you are building. Give it a name you recognize and tell Yourkly, in your own words, what it is.</p>' +
    '<div class="info-callout"><strong>No technical description needed.</strong> \\u201cA website for my homeschool group\\u201d is enough.</div>' +
    '<label class="form-label" for="projectName">What should it be called?</label>' +
    '<input type="text" id="projectName" placeholder="my-project" autocomplete="off">' +
    '<label class="form-label" for="projectDesc">What are you building? (optional)</label>' +
    '<input type="text" id="projectDesc" placeholder="One sentence is enough" autocomplete="off">' +
    '<button class="pl-btn-primary" id="btnCreate">Start the project</button>' +
    '<div id="createMsg"></div></div></div>';
  bindGoButtons(app);
  document.getElementById('btnCreate').onclick = async function() {
    const nameInput = document.getElementById('projectName');
    const descInput = document.getElementById('projectDesc');
    const msg = document.getElementById('createMsg');
    const name = nameInput.value.trim();
    if (!name) { msg.innerHTML = '<div class="error-box">Give your project a name first.</div>'; return; }
    msg.innerHTML = '<p>Setting up your project...</p>';
    try {
      const j = await api('/api/projects', 'POST', { name: name });
      const desc = descInput.value.trim();
      if (desc) {
        try {
          await api('/api/projects/' + encodeURIComponent(j.name) + '/files', 'POST', {
            path: 'About this project.md',
            content: '# About this project\\n\\n' + desc + '\\n',
            label: 'Added a description of the project',
          });
        } catch (e) { /* description is a nice-to-have */ }
      }
      state.project = j.name;
      state.displayName = j.displayName || j.name;
      go('project');
    } catch (e) { msg.innerHTML = errBox(e); }
  };
}

/* ---------- Project Home ---------- */
async function showProject(name) {
  renderNav('project');
  state.view = 'project';
  app.innerHTML = '<div class="screen-padded"><p>Opening your project...</p></div>';
  try {
    await loadProject(name);
  } catch (e) {
    app.innerHTML = '<div class="screen-padded">' + backToHome() + errBox(e) + '</div>';
    bindGoButtons(app);
    return;
  }
  renderProjectHome();
}
function renderProjectHome() {
  const name = state.project;
  let keptBanner = '';
  if (state.justKept) {
    keptBanner = '<div class="ok-banner">Kept the ' + esc(state.justKept) + '\u2019s work. That is the project\u2019s current version now.</div>';
    state.justKept = '';
  }
  const total = state.savePoints.length;
  const latest = state.savePoints[0];

  let recentRows = '';
  state.savePoints.slice(0, 3).forEach(function(s, i) {
    recentRows += '<div class="project-recent-row"><div class="project-recent-title">' + esc(s.label) + '</div>' +
      '<div class="project-recent-meta">' + esc(timeAgo(s.time)) + (total ? ' \\u00b7 v' + (total - i) : '') + '</div></div>';
  });
  const recentCard = total === 0
    ? '<section class="health-card"><p class="home-empty-note">No Save Point yet. Save a file and Yourkly keeps the first one.</p></section>'
    : '<div class="section-label">Recently saved</div><section class="health-card">' + recentRows +
      '<p class="form-hint">This is work already saved. Start an update when you want Yourkly to follow a change from beginning to end.</p>' +
      '<div class="cta-row"><button class="pl-btn-primary" data-go="newupdate">Make an update</button>' +
      '<button class="text-link" data-go="changed">See everything that changed \\u2192</button></div></section>';

  app.innerHTML = '<div class="screen-padded">' + backToHome() + keptBanner +
    '<h1 class="project-home-title">' + esc(projLabel()) + '</h1>' +
    '<div class="project-status">' +
    '<span>Main version' + (total ? ' \\u00b7 v' + total : '') + '</span><span class="sep">|</span>' +
    (latest ? '<span>Last Save Point ' + esc(timeAgo(latest.time)) + '</span><span class="sep">|</span>' : '') +
    '<span class="ok">Everything saved</span></div>' +

    '<div class="section-label section-label--tight">Project health</div>' +
    '<section class="health-card" id="healthCard">' +
    '<div class="health-head"><h2 class="health-title">This project looks healthy</h2>' +
    '<button class="pl-btn pl-btn--sm" id="btnRecheck">Check again</button></div>' +
    '<p class="health-sub">Yourkly checks the latest saved version.</p>' +
    '<div id="healthChecks">' +
    '<div class="health-check"><span class="tick">\\u2713</span><span>Everything Yourkly knows about is saved.</span></div>' +
    '<div class="health-check"><span class="tick">\\u2713</span><span>Latest version confirmed' + (latest ? ' (' + esc(timeAgo(latest.time)) + ')' : '') + '.</span></div>' +
    '</div></section>' +

    '<section class="helpers-promo">' +
    '<h2>Send in the helpers</h2>' +
    '<p>Three helpers \\u2014 the fixer, the builder, and the polisher \\u2014 each take a safe copy of this project and work at the same time. You compare what they did in plain words and keep the one you like best.</p>' +
    '<div class="mascot-trio" aria-hidden="true">' +
    '<img src="' + MASCOT_IMG.fixer + '" alt=""><img src="' + MASCOT_IMG.builder + '" alt=""><img src="' + MASCOT_IMG.polisher + '" alt=""></div>' +
    '<button class="pl-btn-primary" id="btnHelpersPromo">Send in the helpers</button></section>' +

    recentCard + '</div>';

  bindGoButtons(app);
  document.getElementById('btnHelpersPromo').onclick = function() { go('versions', { send: true }); };
  document.getElementById('btnRecheck').onclick = async function() {
    const box = document.getElementById('healthChecks');
    box.innerHTML = '<div class="health-check"><span class="spin">\\u25cc</span><span>Checking the latest saved version...</span></div>';
    try {
      await loadProject(state.project);
      const l = state.savePoints[0];
      box.innerHTML =
        '<div class="health-check"><span class="tick">\\u2713</span><span>Everything Yourkly knows about is saved.</span></div>' +
        '<div class="health-check"><span class="tick">\\u2713</span><span>Checked just now \\u2014 latest version confirmed' + (l ? ' (' + esc(timeAgo(l.time)) + ')' : '') + '.</span></div>';
    } catch (e) {
      box.innerHTML = '<div class="error-box">' + esc(e.message || 'Something went wrong') + '</div>';
    }
  };
}

/* ---------- Updates ---------- */
async function showUpdates() {
  renderNav('updates');
  state.view = 'updates';
  app.innerHTML = '<div class="screen-padded"><p>Getting your updates...</p></div>';
  let agents = [];
  try {
    const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/agents');
    agents = j.agents || [];
  } catch (e) { /* no helper versions yet */ }

  let body = '<div class="screen-padded">' + backToProject() +
    '<div class="updates-header"><div><h1 class="page-title">Updates</h1></div>' +
    '<div><button class="pl-btn-primary" data-go="newupdate">Make an update</button></div></div>' +
    '<p class="updates-intro-text">An update is one thing you want to change, described in your words. ' +
    'Yourkly keeps track of what it touched, which helpers worked on it, and whether it\\u2019s saved. ' +
    agents.length + ' update' + (agents.length === 1 ? '' : 's') + ' in progress.</p>';

  if (agents.length === 0) {
    body += '<div class="updates-empty"><p>No updates yet \\u2014 nothing has been followed start to finish inside Yourkly. ' +
      'Work already saved is below.</p>' +
      '<button class="pl-btn-primary" data-go="newupdate">Make an update</button></div>';
  } else {
    body += '<div class="updates-list">';
    agents.forEach(function(a) {
      body += '<div class="updates-row" data-go="versions"><div class="updates-row-main">' +
        '<div class="updates-row-header"><h2 class="updates-row-title">' + esc(a.name) + '</h2>' +
        '<span class="pl-pill pl-pill--amber">Ready to compare</span></div>' +
        '<p class="updates-row-goal">' + esc(a.task || a.description || '') + '</p>' +
        '<p class="updates-row-meta">Worked on with the ' + esc(a.id === 'fix' ? 'fixer' : a.id === 'build' ? 'builder' : 'polisher') + '</p></div>' +
        '<div class="updates-row-next"><p class="updates-row-next-label">Next step</p>' +
        '<p class="updates-row-next-text">Compare and keep one \\u2192</p></div></div>';
    });
    body += '</div>';
  }

  body += '<div class="section-label">Saved</div>' +
    '<p class="page-sub">Every change already saved in this project, newest first.</p>';
  const total = state.savePoints.length;
  if (total === 0) {
    body += '<p class="home-empty-note">Nothing saved yet.</p>';
  } else {
    state.savePoints.slice(0, 8).forEach(function(s, i) {
      body += '<div class="saved-row"><div><div class="points-row-title">' + esc(s.label) + '</div>' +
        '<div class="points-row-meta">' + esc(timeAgo(s.time)) + ' \\u00b7 v' + (total - i) + '</div></div></div>';
    });
  }
  body += '</div>';
  app.innerHTML = body;
  bindGoButtons(app);
  app.querySelectorAll('.updates-row').forEach(function(r) {
    r.onclick = function() { go('versions'); };
  });
}

/* ---------- Make an Update ---------- */
function showNewUpdate() {
  renderNav('newupdate');
  state.view = 'newupdate';
  app.innerHTML = '<div class="screen-padded screen-narrow">' + backToProject() +
    '<h1 class="page-title">What do you want to change?</h1>' +
    '<p class="page-sub">Describe the result you want. You do not need to know which file or technical step is involved.</p>' +
    '<div id="nuForm"><textarea id="nuText" aria-label="What do you want to change" placeholder="Add a clearer welcome message to the homepage and make the main button easier to find."></textarea>' +
    '<div class="cta-row"><button class="pl-btn-primary" id="nuContinue">Continue</button>' +
    '<button class="pl-btn" data-go="project">Cancel</button></div></div>' +
    '<div id="nuSummary"></div></div>';
  bindGoButtons(app);
  document.getElementById('nuContinue').onclick = function() {
    const text = document.getElementById('nuText').value.trim();
    if (!text) { document.getElementById('nuForm').insertAdjacentHTML('beforeend', '<div class="error-box">Describe what you want first.</div>'); return; }
    state.updateGoal = text;
    document.getElementById('nuForm').classList.add('hidden');
    document.getElementById('nuSummary').innerHTML =
      '<section class="newupdate-summary"><div class="section-label section-label--tight">Your update</div>' +
      '<div class="newupdate-field">What you want</div><div class="newupdate-value">' + esc(text) + '</div>' +
      '<div class="newupdate-field">Suggested next step</div>' +
      '<div class="newupdate-value">Send in the helpers. Each takes a safe copy of your project, works on it, and you keep the version you like best.</div>' +
      '<div class="newupdate-summary-actions">' +
      '<button class="pl-btn-primary" id="nuSend">Send in the helpers</button>' +
      '<button class="pl-btn" data-go="files">Browse project files</button>' +
      '<button class="pl-btn" id="nuSaveLater">Save task for later</button></div></section>';
    bindGoButtons(document.getElementById('nuSummary'));
    document.getElementById('nuSend').onclick = function() { go('versions', { send: true }); };
    document.getElementById('nuSaveLater').onclick = function() {
      const all = loadTodos();
      all.unshift({ id: 't' + Date.now().toString(36), text: text, detail: '', done: false });
      saveTodos(all);
      state.updateGoal = '';
      go('todos');
    };
  };
}

/* ---------- Things to Do ---------- */
function todoKey() { return 'yourkly-todos-' + state.project; }
function loadTodos() {
  try { return JSON.parse(localStorage.getItem(todoKey()) || '[]'); }
  catch (e) { return []; }
}
function saveTodos(items) { localStorage.setItem(todoKey(), JSON.stringify(items)); }
function showTodos() {
  renderNav('todos');
  state.view = 'todos';
  const items = loadTodos();
  let list = '';
  items.forEach(function(t) {
    list += '<div class="todo-item"><button class="todo-check' + (t.done ? ' todo-check--done' : '') + '" data-todo="' + t.id + '" aria-label="Mark done">' + (t.done ? '\\u2713' : '') + '</button>' +
      '<div class="todo-text' + (t.done ? ' todo-text--done' : '') + '"><strong>' + esc(t.text) + '</strong>' +
      (t.detail ? '<span>' + esc(t.detail) + '</span>' : '') + '</div>' +
      '<button class="todo-del" data-del="' + t.id + '" aria-label="Remove">\\u00d7</button></div>';
  });
  app.innerHTML = '<div class="screen-padded">' + backToProject() +
    '<h1 class="page-title">Things to do</h1>' +
    '<p class="page-sub">A list of what still needs doing in this project. This list is kept in this browser, on this computer.</p>' +
    '<div class="todo-form-card"><label class="form-label" for="todoText">What needs doing?</label>' +
    '<input type="text" id="todoText" placeholder="What needs doing?" autocomplete="off">' +
    '<label class="form-label" for="todoDetail">Any detail worth remembering (optional)</label>' +
    '<textarea id="todoDetail" rows="2" placeholder="Any detail worth remembering (optional)"></textarea>' +
    '<button class="pl-btn-primary" id="todoAdd">Add to the list</button><div id="todoMsg"></div></div>' +
    '<div id="todoList">' + (list || '<p class="home-empty-note">Nothing on the list. Add the first thing above.</p>') + '</div></div>';
  bindGoButtons(app);
  document.getElementById('todoAdd').onclick = function() {
    const text = document.getElementById('todoText').value.trim();
    if (!text) { document.getElementById('todoMsg').innerHTML = '<div class="error-box">Write what needs doing first.</div>'; return; }
    const all = loadTodos();
    all.unshift({ id: 't' + Date.now().toString(36), text: text, detail: document.getElementById('todoDetail').value.trim(), done: false });
    saveTodos(all);
    showTodos();
  };
  app.querySelectorAll('[data-todo]').forEach(function(b) {
    b.onclick = function() {
      const all = loadTodos();
      const t = all.find(function(x) { return x.id === b.getAttribute('data-todo'); });
      if (t) { t.done = !t.done; saveTodos(all); showTodos(); }
    };
  });
  app.querySelectorAll('[data-del]').forEach(function(b) {
    b.onclick = function() {
      saveTodos(loadTodos().filter(function(x) { return x.id !== b.getAttribute('data-del'); }));
      showTodos();
    };
  });
}

/* ---------- Project Files ---------- */
function folderDesc(folder) {
  const map = { docs: 'Project documents', public: 'Images and public files', src: 'Main application code', tests: 'Tests', scripts: 'Helper scripts' };
  return map[folder] || 'A folder in your project';
}
function fileDesc(path) {
  const base = path.split('/').pop();
  if (base === 'AGENTS.md') return 'Instructions for AI coding tools';
  if (base === '.gitignore') return 'Files to leave out';
  if (base.indexOf('.env') === 0) return 'Example settings file';
  if (base === 'About this project.md') return 'What this project is about';
  const ext = (base.split('.').pop() || '').toLowerCase();
  const map = { md: 'Project notes', html: 'Web page', css: 'Styles', js: 'Code', json: 'Settings', txt: 'Text file', png: 'Image', jpg: 'Image', svg: 'Image' };
  return map[ext] || 'A file in your project';
}
function groupFiles(files) {
  const folders = {}, top = [];
  files.forEach(function(f) {
    const i = f.indexOf('/');
    if (i === -1) top.push(f);
    else {
      const folder = f.slice(0, i);
      (folders[folder] = folders[folder] || []).push(f);
    }
  });
  return { folders: folders, top: top };
}
function showFiles() {
  renderNav('files');
  state.view = 'files';
  const g = groupFiles(state.files);
  let body = '<div class="screen-padded">' + backToProject() +
    '<h1 class="page-title">Project files</h1>' +
    '<p class="page-sub">These are the files in your project. Names stay exactly as they are \\u2014 the grey line under each one explains what it\\u2019s for.</p>' +
    '<div class="file-legend"><span>📁 Folder \\u2014 holds other files</span><span>\\u25A1 File \\u2014 you can open and edit it</span></div>' +
    '<div class="file-addrow"><input type="text" id="newFileName" placeholder="Add a file \\u2014 e.g. NOTES.md" aria-label="New file name" autocomplete="off">' +
    '<button class="pl-btn" id="btnAddFile">Add a file</button></div>' +
    '<div id="folderList">';

  Object.keys(g.folders).sort().forEach(function(folder, fi) {
    body += '<div class="folder-card"><div class="folder-head"><span class="folder-icon" aria-hidden="true">📁</span>' +
      '<div><div class="folder-name">' + esc(folder) + '</div><div class="folder-desc">' + esc(folderDesc(folder)) + '</div></div>' +
      '<span class="spacer"></span><span class="pl-pill pl-pill--lilac">Folder</span>' +
      '<button class="pl-btn pl-btn--sm" data-folder="' + fi + '">Show what\\u2019s inside</button></div>' +
      '<div class="folder-files hidden" id="folder-' + fi + '">';
    g.folders[folder].sort().forEach(function(f) { body += fileRowHtml(f); });
    body += '</div></div>';
  });
  g.top.sort().forEach(function(f) { body += fileRowHtml(f); });
  if (state.files.length === 0) body += '<p class="home-empty-note">No files yet. Add the first one above.</p>';
  body += '</div><div id="editorWrap"></div></div>';
  app.innerHTML = body;
  bindGoButtons(app);
  bindFileRows(app);
  app.querySelectorAll('[data-folder]').forEach(function(b) {
    b.onclick = function() {
      const panel = document.getElementById('folder-' + b.getAttribute('data-folder'));
      const open = panel.classList.toggle('hidden');
      b.textContent = open ? 'Show what\\u2019s inside' : 'Hide';
    };
  });
  document.getElementById('btnAddFile').onclick = function() {
    const n = document.getElementById('newFileName').value.trim();
    if (n) openFile(n, '');
  };
}
function fileRowHtml(f) {
  const short = f.indexOf('/') === -1 ? f : f.slice(f.indexOf('/') + 1);
  return '<div class="file-row" data-filerow="' + esc(f) + '"><span class="file-row-name">' + esc(short) + '</span> ' +
    '<span class="pl-pill pl-pill--lilac">Saved</span>' +
    '<span class="file-row-actions">' +
    '<button class="pl-btn pl-btn--sm" data-fact="open">Open</button>' +
    '<button class="pl-btn pl-btn--sm" data-fact="history">History</button>' +
    '<button class="pl-btn pl-btn--sm" data-fact="download">Download</button>' +
    '<button class="pl-btn pl-btn--sm" data-fact="rename">Rename</button>' +
    '<button class="pl-btn pl-btn--sm pl-btn-danger" data-fact="delete">Delete</button></span>' +
    '<span class="file-row-desc">' + esc(fileDesc(f)) + '</span>' +
    '<div class="file-history hidden" id="hist-' + esc(f).replace(/[^a-zA-Z0-9]/g, '_') + '"></div></div>';
}
function bindFileRows(root) {
  root.querySelectorAll('[data-filerow]').forEach(function(row) {
    const path = row.getAttribute('data-filerow');
    row.querySelectorAll('[data-fact]').forEach(function(b) {
      b.onclick = function(ev) {
        ev.stopPropagation();
        fileAction(path, b.getAttribute('data-fact'), row);
      };
    });
  });
}
async function fileAction(path, act, row) {
  if (act === 'open') { openFile(path); return; }
  if (act === 'download') {
    try {
      const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/file?path=' + encodeURIComponent(path));
      const blob = new Blob([j.content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = path.split('/').pop();
      document.body.appendChild(a); a.click();
      setTimeout(function() { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) { alert(e.message); }
    return;
  }
  if (act === 'rename') {
    const next = prompt('Rename "' + path + '" to:', path);
    if (!next || !next.trim() || next.trim() === path) return;
    const newPath = next.trim();
    try {
      const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/file?path=' + encodeURIComponent(path));
      await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST',
        { path: newPath, content: j.content, label: 'Renamed ' + path + ' to ' + newPath });
      await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST',
        { path: path, remove: true, label: 'Removed the old name after renaming' });
      await loadProject(state.project);
      showFiles();
    } catch (e) { alert(e.message); }
    return;
  }
  if (act === 'delete') {
    if (!confirm('Delete "' + path + '"?')) return;
    try {
      await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST', { path: path, remove: true, label: 'Deleted ' + path });
      await loadProject(state.project);
      showFiles();
    } catch (e) { alert(e.message); }
    return;
  }
  if (act === 'history') {
    const box = row.querySelector('.file-history');
    if (!box.classList.contains('hidden')) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    box.innerHTML = '<p>Checking when this file changed...</p>';
    try {
      const sps = state.savePoints.slice(0, 12);
      const reads = await Promise.all(sps.map(async function(s) {
        try {
          const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/file?path=' + encodeURIComponent(path) + '&ref=' + s.sha);
          return { sp: s, content: j.content };
        } catch (e) { return { sp: s, content: null }; }
      }));
      const changed = [];
      for (let i = 0; i < reads.length; i++) {
        const cur = reads[i].content;
        const older = i + 1 < reads.length ? reads[i + 1].content : undefined;
        if (cur !== null && (older === undefined || cur !== older)) changed.push(reads[i].sp);
      }
      if (changed.length === 0) box.innerHTML = '<p>This file has not changed in the recent Save Points checked.</p>';
      else {
        box.innerHTML = '<p><strong>Changed in ' + changed.length + ' Save Point' + (changed.length === 1 ? '' : 's') + ':</strong></p><ul>' +
          changed.map(function(s) { return '<li>' + esc(s.label) + ' \\u00b7 ' + esc(timeAgo(s.time)) + '</li>'; }).join('') + '</ul>';
      }
    } catch (e) { box.innerHTML = errBox(e); }
  }
}

/* ---------- Editor ---------- */
async function openFile(path, presetContent) {
  state.openFile = path;
  let wrap = document.getElementById('editorWrap');
  if (!wrap) {
    await showFiles();
    wrap = document.getElementById('editorWrap');
  }
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
      '<input type="text" id="saveLabel" placeholder="For example: rewrote the intro" autocomplete="off"></div>' +
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
        await loadProject(state.project);
        showFiles();
        openFile(path);
      } catch (e) { msg.innerHTML = errBox(e); }
    };
    const delBtn = document.getElementById('btnDelFile');
    if (delBtn) delBtn.onclick = async function() {
      if (!confirm('Delete "' + path + '"?')) return;
      try {
        await api('/api/projects/' + encodeURIComponent(state.project) + '/files', 'POST', { path: path, remove: true, label: 'Deleted ' + path });
        await loadProject(state.project);
        showFiles();
      } catch (e) { alert(e.message); }
    };
  } catch (e) { eb.innerHTML = errBox(e); }
}

/* ---------- What Changed ---------- */
function showChanged() {
  renderNav('changed');
  state.view = 'changed';
  const total = state.savePoints.length;
  let body = '<div class="screen-padded">' + backToProject() +
    '<h1 class="page-title">What changed</h1>' +
    '<p class="page-sub">Every Save Point in this project, newest first \\u2014 written the way you wrote it.</p>';
  if (total === 0) {
    body += '<p class="home-empty-note">Nothing saved yet.</p>';
  } else {
    state.savePoints.forEach(function(s, i) {
      const v = total - i;
      body += '<div class="changed-row"><div class="changed-head"><div>' +
        '<div class="points-row-title">' + esc(s.label) + '</div>' +
        '<div class="points-row-meta">' + esc(timeAgo(s.time)) + ' \\u00b7 v' + v + '</div></div>' +
        '<button class="pl-btn pl-btn--sm" data-see="' + i + '">See details</button></div>' +
        '<div class="changed-detail hidden" id="cd-' + i + '">' +
        '<dl><dt>Saved</dt><dd>' + esc(fmtTime(s.time)) + '</dd>' +
        '<dt>Version</dt><dd>v' + v + ' of ' + total + '</dd>' +
        '<dt>What changed?</dt><dd>' + esc(s.label) + '</dd></dl>' +
        (i === 0 ? '<p class="form-hint">This is the current version.</p>'
          : '<p style="margin-top:10px"><button class="pl-btn pl-btn--sm" data-goback="' + esc(s.sha) + '" data-label="' + esc(s.label) + '">Go back to this version</button></p>') +
        '</div></div>';
    });
  }
  body += '</div>';
  app.innerHTML = body;
  bindGoButtons(app);
  app.querySelectorAll('[data-see]').forEach(function(b) {
    b.onclick = function() {
      const d = document.getElementById('cd-' + b.getAttribute('data-see'));
      const open = d.classList.toggle('hidden');
      b.textContent = open ? 'See details' : 'Hide details';
    };
  });
  app.querySelectorAll('[data-goback]').forEach(function(b) {
    b.onclick = async function() {
      if (!confirm('Put these files back? Yourkly saves that as a new Save Point, so nothing newer is ever lost.')) return;
      b.disabled = true; b.textContent = 'Putting them back...';
      try {
        await api('/api/projects/' + encodeURIComponent(state.project) + '/restore', 'POST',
          { sha: b.getAttribute('data-goback'), label: b.getAttribute('data-label') });
        await loadProject(state.project);
        showChanged();
      } catch (e) { alert(e.message); b.disabled = false; b.textContent = 'Go back to this version'; }
    };
  });
}

/* ---------- Save Points ---------- */
function showSavePoints() {
  renderNav('points');
  state.view = 'points';
  const total = state.savePoints.length;
  let body = '<div class="screen-padded">' + backToProject() +
    '<h1 class="page-title">Restore an earlier version</h1>' +
    '<p class="page-sub">Pick the Save Point you want to go back to. Yourkly puts those files back and saves that as a new Save Point \\u2014 so nothing newer is ever lost.</p>' +
    '<div class="points-list" id="spList">';
  if (total === 0) {
    body += '<p class="home-empty-note">No Save Points yet, so there is nothing to go back to.</p>';
  } else {
    state.savePoints.forEach(function(s, i) {
      const v = total - i;
      body += '<div class="points-row" data-sha="' + esc(s.sha) + '">' +
        '<div><div class="points-row-title">' + esc(s.label) + '</div>' +
        '<div class="points-row-meta">' + esc(timeAgo(s.time)) + ' \\u00b7 v' + v + '</div></div>' +
        (i === 0 ? '<span class="points-current-tag">Current version</span>'
          : '<button class="pl-btn pl-btn--sm" data-act="ask">Go back to this version</button>') + '</div>';
    });
  }
  body += '</div></div>';
  app.innerHTML = body;
  bindGoButtons(app);
  app.querySelectorAll('button[data-act="ask"]').forEach(function(b) {
    b.onclick = function() {
      const row = b.closest('.points-row');
      const title = row.querySelector('.points-row-title').textContent;
      const sha = row.getAttribute('data-sha');
      row.innerHTML = '<div><div class="points-row-title">' + esc(title) + '</div></div>' +
        '<div class="points-confirm"><span class="points-confirm-text">Put these files back?</span>' +
        '<button class="pl-btn-primary pl-btn--sm" data-act="yes" style="padding:9px 16px">Yes, go back to this</button>' +
        '<button class="pl-btn pl-btn--sm" data-act="no">Cancel</button></div>';
      row.querySelector('[data-act="no"]').onclick = showSavePoints;
      row.querySelector('[data-act="yes"]').onclick = async function() {
        const btn = this;
        btn.disabled = true;
        btn.textContent = 'Putting them back...';
        try {
          await api('/api/projects/' + encodeURIComponent(state.project) + '/restore', 'POST', { sha: sha, label: title });
          await loadProject(state.project);
          showSavePoints();
        } catch (e) { alert(e.message); showSavePoints(); }
      };
    };
  });
}

/* ---------- Separate Versions (the helpers live here) ---------- */
const AGENT_BLURB = {
  fix: 'The fixer looks for small mistakes \\u2014 typos, broken links, things that do not look right \\u2014 and fixes them.',
  build: 'The builder adds something new to the project.',
  polish: 'The polisher tidies up words and layout so everything reads well.',
};
function agentName(id) {
  return id === 'fix' ? 'Fixer' : id === 'build' ? 'Builder' : id === 'polish' ? 'Polisher' : id;
}
async function showVersions(opts) {
  renderNav('versions');
  state.view = 'versions';
  opts = opts || {};
  const total = state.savePoints.length;
  const latest = state.savePoints[0];
  let body = '<div class="screen-padded">' + backToProject() +
    '<h1 class="page-title">Separate versions</h1>' +
    '<p class="page-sub">A separate version is a safe copy of the whole project. You can try something risky in it without touching your main version \\u2014 and bring it over later if you like it.</p>' +
    '<section class="versions-main"><div class="versions-main-head">' +
    '<span class="versions-main-name">Main version</span>' +
    '<span class="pl-pill pl-pill--green">This is what you\\u2019re working in</span></div>' +
    '<div class="versions-main-body">The real version of your project.' +
    (latest ? ' Last Save Point: ' + esc(latest.label) + ' \\u00b7 ' + esc(timeAgo(latest.time)) + '.' : ' No Save Points yet.') +
    '</div></section>' +
    '<div id="versionList"><p>Getting the separate versions...</p></div>' +
    '<section class="versions-footer"><div class="versions-footer-title">Want to try something without risk?</div>' +
    '<div class="versions-footer-body">Yourkly copies your project as it is right now into a separate version for each helper. Your main version stays exactly as it is.</div>' +
    '<button class="pl-btn-primary" id="btnMakeVersions">Send in the helpers</button>' +
    '<div id="sendMsg"></div></div></div>';
  app.innerHTML = body;
  bindGoButtons(app);
  document.getElementById('btnMakeVersions').onclick = function() { sendAgents(); };
  await renderVersionList();
  if (opts.send) sendAgents();
}
async function renderVersionList() {
  const box = document.getElementById('versionList');
  if (!box) return;
  let agents = [];
  try {
    const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/agents');
    agents = j.agents || [];
  } catch (e) { box.innerHTML = errBox(e); return; }
  state.agents = agents;
  if (agents.length === 0) {
    box.innerHTML = '<p class="home-empty-note">No separate versions yet. Send in the helpers to make three safe copies.</p>';
    return;
  }
  let html = '<div class="section-label">Helper versions \\u2014 compare and keep one</div>';
  if (state.updateGoal) {
    html += '<div class="info-callout"><strong>Your update:</strong> ' + esc(state.updateGoal) + '</div>';
  }
  agents.forEach(function(a, i) {
    html += '<div class="version-card" id="ver' + i + '"><img class="mascot" src="' + MASCOT_IMG[a.mascot] + '" alt="">' +
      '<div class="version-card-main">' +
      '<div class="version-card-name">' + esc(a.name) + '</div>' +
      '<div class="version-card-desc">' + esc(AGENT_BLURB[a.id] || a.task || '') + '</div>' +
      '<div class="version-card-meta">A safe copy of the project, kept separately from your main version.</div>' +
      (a.plainChanges ? '<div class="changes">' + esc(a.plainChanges) + '</div>' : '') +
      '<button class="pl-btn-primary pl-btn--sm" style="padding:11px 20px" data-keep="' + i + '" data-id="' + esc(a.id) + '">Keep this one</button>' +
      '</div></div>';
  });
  box.innerHTML = html;
  box.querySelectorAll('[data-keep]').forEach(function(b) {
    b.onclick = function() { askKeepVersion(parseInt(b.getAttribute('data-keep'), 10)); };
  });
}
async function sendAgents() {
  const msg = document.getElementById('sendMsg');
  const box = document.getElementById('versionList');
  const btn = document.getElementById('btnMakeVersions');
  if (btn) btn.disabled = true;
  const working = ['fix', 'build', 'polish'].map(function(id, i) {
    return '<div class="agent-card" style="animation-delay:' + (i * 0.12) + 's">' +
      '<img class="mascot mascot--working" src="' + MASCOT_IMG[id === 'fix' ? 'fixer' : id === 'build' ? 'builder' : 'polisher'] + '" alt="">' +
      '<h3>' + agentName(id) + '</h3><div class="task">' + esc(AGENT_BLURB[id]) + '</div>' +
      '<div class="status working"><span class="dots">Working</span></div><div class="shimmer"></div></div>';
  }).join('');
  if (box) box.innerHTML = '<div class="section-label">Sending in the helpers...</div><div class="agent-grid">' + working + '</div>';
  if (msg) msg.innerHTML = '<p>Sending in the helpers...</p>';
  else if (box) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try {
    const j = await api('/api/projects/' + encodeURIComponent(state.project) + '/agents', 'POST');
    state.agents = j.agents || [];
    await loadProject(state.project);
    renderNav('versions');
    await renderVersionList();
    const first = document.getElementById('versionList');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    if (msg) msg.innerHTML = errBox(e);
    else if (box) box.innerHTML = errBox(e);
  }
  if (btn) btn.disabled = false;
}
function askKeepVersion(i) {
  const a = state.agents[i];
  if (!a) return;
  const card = document.getElementById('ver' + i);
  const btn = card ? card.querySelector('[data-keep]') : null;
  if (!btn) return;
  btn.outerHTML = '<div class="keep-confirm" id="keepConfirm"><p>Keep the ' + esc(a.name) + '\u2019s work? It becomes the project\u2019s current version.</p>' +
    '<div class="cta-row"><button class="pl-btn-primary pl-btn--sm" id="keepYes">Yes, keep it</button>' +
    '<button class="pl-btn pl-btn--sm" id="keepNo">Not yet</button></div></div>';
  document.getElementById('keepNo').onclick = function() { renderVersionList(); };
  document.getElementById('keepYes').onclick = function() { doKeepVersion(i); };
}
async function doKeepVersion(i) {
  const a = state.agents[i];
  if (!a) return;
  const box = document.getElementById('keepConfirm');
  document.querySelectorAll('[data-keep]').forEach(function(b) { b.disabled = true; });
  const yesBtn = document.getElementById('keepYes');
  const noBtn = document.getElementById('keepNo');
  if (yesBtn) yesBtn.disabled = true;
  if (noBtn) noBtn.disabled = true;
  if (box) box.innerHTML = '<p class="working-note"><span class="dots">Keeping the ' + esc(a.name) + '\u2019s work...</span></p>';
  try {
    await api('/api/projects/' + encodeURIComponent(state.project) + '/keep', 'POST', { winnerId: a.id });
    state.updateGoal = '';
    state.justKept = a.name;
    await loadProject(state.project);
    go('project');
  } catch (e) {
    if (box) box.innerHTML = '<div class="error-box">' + esc(e.message || 'Something went wrong') + '</div>' +
      '<div class="cta-row"><button class="pl-btn pl-btn--sm" id="keepRetry">Try again</button></div>';
    const rb = document.getElementById('keepRetry');
    if (rb) rb.onclick = function() { renderVersionList(); };
  }
}

/* ---------- Continue in... (not built: empty state per owner decision) ---------- */
function showContinueIn() {
  renderNav('continue');
  state.view = 'continue';
  app.innerHTML = '<div class="screen-padded">' + backToProject() +
    '<h1 class="page-title">Continue in...</h1>' +
    '<p class="home-empty-note">Nothing here yet.</p></div>';
  bindGoButtons(app);
}

/* ---------- Who Can See It ---------- */
function showShare() {
  renderNav('share');
  state.view = 'share';
  app.innerHTML = '<div class="screen-padded screen-narrow">' + backToProject() +
    '<h1 class="page-title">Who can see it</h1>' +
    '<p class="page-sub">Only you can see this project.</p>' +
    '<div class="help-card"><h2>Only you</h2>' +
    '<p>Nobody else can open it, find it, or see your files. Your projects are saved and kept safe in your own workspace.</p></div>' +
    '</div>';
  bindGoButtons(app);
}

/* ---------- Project Settings ---------- */
function showSettings() {
  renderNav('settings');
  state.view = 'settings';
  app.innerHTML = '<div class="screen-padded screen-narrow">' + backToProject() +
    '<h1 class="page-title">Project settings</h1>' +
    '<div class="settings-card"><div class="settings-label">' + esc(projLabel()) + '</div>' +
    '<div class="settings-body">This is the project\\u2019s name. Names cannot be changed after a project is made.</div></div>' +
    '<div class="settings-card"><div class="settings-label">Who can see this project</div>' +
    '<div class="settings-body">Only you. Your projects are saved and kept safe in your own workspace.</div></div>' +
    '<div class="settings-card settings-card--danger"><div class="settings-label settings-label--danger">Delete this project</div>' +
    '<div class="settings-body">This deletes the project and every Save Point in it. It cannot be undone, and Yourkly will ask you to type the project name first.</div>' +
    '<label class="settings-hint" for="delConfirm">Type <strong>' + esc(projLabel()) + '</strong> to confirm.</label>' +
    '<input type="text" id="delConfirm" placeholder="' + esc(projLabel()) + '" autocomplete="off">' +
    '<button class="pl-btn pl-btn-danger" id="btnDelete">Delete this project</button><div id="delMsg"></div></div></div>';
  bindGoButtons(app);
  document.getElementById('btnDelete').onclick = async function() {
    const typed = document.getElementById('delConfirm').value.trim();
    const msg = document.getElementById('delMsg');
    if (typed !== projLabel()) { msg.innerHTML = '<div class="error-box">Type the project name exactly to confirm.</div>'; return; }
    msg.innerHTML = '<p>Deleting...</p>';
    try {
      await api('/api/projects/' + encodeURIComponent(state.project), 'DELETE');
      clearProjectState();
      go('projects');
    } catch (e) { msg.innerHTML = errBox(e); }
  };
}

/* ---------- First-run onboarding (the 4-step tour) ---------- */
function showOnboarding() {
  renderNav('home');
  state.view = 'onboarding';
  app.innerHTML = '<div class="screen-padded">' +
    '<h1 class="home-greeting">' + esc(greeting()) + '.</h1>' +
    '<p class="home-subtitle" style="margin-bottom:24px">Welcome. Four quick steps and you will know your way around.</p>' +
    '<div class="tour-card" id="ob1"><h2><span class="step-num">1</span> Start a new project</h2>' +
    '<p>Give your project a name. We will set up a safe place for it and save the first version.</p>' +
    '<input type="text" id="obName" value="demo-project" autocomplete="off">' +
    '<button class="pl-btn-primary" id="obCreate">Start the project</button><div id="obMsg1"></div></div>' +
    '<div class="tour-card hidden" id="ob2"><h2><span class="step-num">2</span> Send in 3 helpers</h2>' +
    '<p>Each helper gets its own safe copy of the project and a written task. They work at the same time without stepping on each other.</p>' +
    '<button class="pl-btn-primary" id="obAgents">Send in the helpers</button><div class="agent-grid" id="obAgentList"></div></div>' +
    '<div class="tour-card hidden" id="ob3"><h2><span class="step-num">3</span> Compare their work</h2>' +
    '<p>Here is what each helper changed, in plain words. Pick the one to keep.</p>' +
    '<div class="agent-grid" id="obCompare"></div></div>' +
    '<div class="tour-card hidden" id="ob4"><h2><span class="step-num">4</span> Done</h2><p id="obDone"></p>' +
    '<button class="pl-btn-primary" id="obGo">See your projects</button></div></div>';

  const tour = { project: null, agents: [] };

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
      tour.agents = j.forks;
      list.innerHTML = '';
      const cl = document.getElementById('obCompare');
      cl.innerHTML = '';
      j.forks.forEach(function(f, i) {
        list.innerHTML += '<div class="agent-card" style="animation-delay:' + (i * 0.12) + 's">' +
          '<img class="mascot" src="' + MASCOT_IMG[f.mascot] + '" alt="">' +
          '<h3>' + esc(f.label) + '</h3><div class="task">Task: ' + esc(f.task) + '</div>' +
          '<div class="status done">Done. Changes saved.</div></div>';
        cl.innerHTML += '<div class="agent-card" id="obcmp' + i + '" style="animation-delay:' + (i * 0.12) + 's">' +
          '<img class="mascot" src="' + MASCOT_IMG[f.mascot] + '" alt="">' +
          '<h3>' + esc(f.label) + '</h3><div class="changes">' + esc(f.plainChanges) + '</div>' +
          '<button class="pl-btn-primary" data-i="' + i + '">Keep this one</button></div>';
      });
      document.getElementById('ob3').classList.remove('hidden');
      cl.querySelectorAll('button').forEach(function(b) {
        b.onclick = async function() {
          const i = parseInt(b.getAttribute('data-i'), 10);
          const f = tour.agents[i];
          b.disabled = true;
          b.textContent = 'Keeping...';
          cl.querySelectorAll('.agent-card').forEach(function(a) { a.classList.remove('winner'); });
          document.getElementById('obcmp' + i).classList.add('winner');
          try {
            await api('/api/demo/keep', 'POST', { project: tour.project, winnerId: f.id });
            document.getElementById('obDone').textContent = 'Kept ' + f.label + '. The project now has their changes. The other helpers\\u2019 copies are still saved if you ever want to look back.';
            document.getElementById('ob4').classList.remove('hidden');
          } catch (e) {
            b.disabled = false;
            b.textContent = 'Keep this one';
            document.getElementById('obDone').textContent = 'Could not keep that version: ' + (e.message || 'Something went wrong') + ' Try again.';
          }
        };
      });
    } catch (e) { list.innerHTML = errBox(e); }
  };

  document.getElementById('obGo').onclick = function() { state.project = tour.project; go('project'); };
}

/* ---------- Help hub ---------- */
const HELP_TOPICS = [
  ['getting-started', 'Getting started'],
  ['how-it-works', 'How Yourkly works'],
  ['tasks', 'What are you trying to do?'],
  ['glossary', 'Plain-English glossary'],
  ['troubleshooting', 'When something looks wrong'],
  ['contact', 'Contact support'],
];
const HELP_INDEX = [
  { t: 'Save Point', topic: 'glossary', k: 'save point version snapshot' },
  { t: 'Make an update', topic: 'tasks', k: 'update change helpers' },
  { t: 'Send in the helpers', topic: 'how-it-works', k: 'helpers agents fixer builder polisher' },
  { t: 'Go back to this version', topic: 'troubleshooting', k: 'undo restore earlier version mistake' },
  { t: 'Separate versions', topic: 'glossary', k: 'separate version copy safe' },
  { t: 'Things to do', topic: 'tasks', k: 'todo list tasks' },
  { t: 'Project files', topic: 'glossary', k: 'files folders' },
  { t: 'I saved something I did not mean to save', topic: 'troubleshooting', k: 'undo mistake saved' },
  { t: 'Contact support', topic: 'contact', k: 'report bug help support' },
  { t: 'Start a project', topic: 'how-it-works', k: 'new project start create' },
];
function showHelp(topic) {
  renderNav('help');
  state.view = 'help';
  state.helpTopic = topic || 'getting-started';
  const t = state.helpTopic;
  let nav = '<div class="app-nav-label" style="padding-left:0">Help topics</div>';
  HELP_TOPICS.forEach(function(h) {
    nav += '<button class="app-nav-item' + (t === h[0] ? ' app-nav-item--active' : '') + '" data-htopic="' + h[0] + '" style="padding-left:0">' + esc(h[1]) + '</button>';
  });
  app.innerHTML = '<div class="screen-padded"><div class="home-columns" style="grid-template-columns:220px 1fr">' +
    '<div><button class="back-link" data-go="home">\\u2190 Home</button>' + nav + '</div>' +
    '<div><h1 class="page-title">Help</h1>' +
    '<p class="page-sub">Yourkly is a plain-English way to work on projects. Your projects are saved and kept safe \\u2014 Yourkly just makes it obvious what\\u2019s going on and what to do next.</p>' +
    '<div class="help-search"><input type="text" id="helpSearch" placeholder="Search help \\u2014 try \\u201csave point\\u201d, \\u201chelpers\\u201d, \\u201cundo\\u201d..." aria-label="Search help" autocomplete="off"><div id="helpResults"></div></div>' +
    '<div id="helpBody"></div></div></div></div>';
  bindGoButtons(app);
  app.querySelectorAll('[data-htopic]').forEach(function(b) {
    b.onclick = function() { showHelp(b.getAttribute('data-htopic')); };
  });
  document.getElementById('helpSearch').addEventListener('input', function(e) {
    const q = e.target.value.trim().toLowerCase();
    const box = document.getElementById('helpResults');
    if (!q) { box.innerHTML = ''; return; }
    const hits = HELP_INDEX.filter(function(h) { return (h.t + ' ' + h.k).toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
    box.innerHTML = hits.length
      ? hits.map(function(h) { return '<p><button class="text-link" data-hit="' + h.topic + '">' + esc(h.t) + '</button></p>'; }).join('')
      : '<p class="home-empty-note">Nothing found. Try \\u201csave point\\u201d or \\u201chelpers\\u201d.</p>';
    box.querySelectorAll('[data-hit]').forEach(function(b) {
      b.onclick = function() { showHelp(b.getAttribute('data-hit')); };
    });
  });
  renderHelpTopic(t);
}
function renderHelpTopic(t) {
  const body = document.getElementById('helpBody');
  if (t === 'getting-started') body.innerHTML = helpGettingStarted();
  else if (t === 'how-it-works') body.innerHTML = helpHowItWorks();
  else if (t === 'tasks') body.innerHTML = helpTasks();
  else if (t === 'glossary') body.innerHTML = helpGlossary();
  else if (t === 'troubleshooting') body.innerHTML = helpTroubleshooting();
  else if (t === 'contact') body.innerHTML = helpContact();
  bindHelpBody(body);
}
function bindHelpBody(body) {
  body.querySelectorAll('[data-htopic]').forEach(function(b) {
    b.onclick = function() { showHelp(b.getAttribute('data-htopic')); };
  });
  body.querySelectorAll('.accordion-head').forEach(function(h) {
    h.onclick = function() {
      const acc = h.closest('.accordion');
      const open = acc.classList.toggle('open');
      const inner = acc.querySelector('.accordion-body');
      inner.style.maxHeight = open ? inner.scrollHeight + 'px' : '0';
      h.querySelector('.accordion-icon').textContent = open ? '\\u2212' : '+';
    };
  });
  const kindCards = body.querySelectorAll('.kind-card');
  kindCards.forEach(function(c) {
    c.onclick = function() {
      kindCards.forEach(function(x) { x.classList.remove('kind-card--on'); });
      c.classList.add('kind-card--on');
      const hid = document.getElementById('reportKind');
      if (hid) hid.value = c.getAttribute('data-kind');
    };
  });
  const steps = body.querySelectorAll('.step-row');
  steps.forEach(function(s) {
    s.onclick = function() {
      steps.forEach(function(x) { x.classList.remove('step-row--on'); });
      s.classList.add('step-row--on');
      document.getElementById('stepDetail').innerHTML = s.getAttribute('data-detail');
    };
  });
  const taskCards = body.querySelectorAll('.task-card');
  taskCards.forEach(function(c) {
    c.onclick = function() {
      taskCards.forEach(function(x) { x.classList.remove('task-card--on'); });
      c.classList.add('task-card--on');
      document.getElementById('taskAnswer').innerHTML = c.getAttribute('data-answer');
    };
  });
  const glossFilter = document.getElementById('glossFilter');
  if (glossFilter) {
    glossFilter.addEventListener('input', function() {
      const q = glossFilter.value.trim().toLowerCase();
      document.querySelectorAll('#glossBody tr').forEach(function(tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }
  const reportBtn = document.getElementById('btnReport');
  if (reportBtn) {
    reportBtn.onclick = function() {
      const kind = (document.getElementById('reportKind') || {}).value || 'Something is broken';
      const what = document.getElementById('reportWhat').value.trim();
      const where = document.getElementById('reportWhere').value.trim();
      const title = encodeURIComponent(kind + (what ? ': ' + what.slice(0, 60) : ''));
      const b = encodeURIComponent('**What happened**\\n' + (what || '(not filled in)') + '\\n\\n**Where in Yourkly**\\n' + (where || '(not filled in)') + '\\n\\n---\\n_Sent from Help \\u2192 Contact support._');
      window.open('https://github.com/Naylahknee/yourkly-artifacts/issues/new?title=' + title + '&body=' + b, '_blank', 'noopener');
    };
  }
}
function helpGettingStarted() {
  return '<div class="help-grid3">' +
    '<button class="help-topic-card" data-htopic="how-it-works"><h3>I\\u2019m new to all of this</h3><p>Four steps, start to finish: start a project, open it, keep a version, send in the helpers.</p><span class="text-link">Show me how Yourkly works \\u2192</span></button>' +
    '<button class="help-topic-card" data-htopic="tasks"><h3>I know what I want to do</h3><p>Pick the thing you are trying to do and get the steps for it, in order.</p><span class="text-link">Find my task \\u2192</span></button>' +
    '<button class="help-topic-card" data-htopic="glossary"><h3>I hit a word I don\\u2019t know</h3><p>Every word Yourkly uses, and what it actually means.</p><span class="text-link">Open the glossary \\u2192</span></button></div>' +
    '<h2 class="help-section-title">The short version</h2>' +
    '<p style="font-size:15.5px;max-width:62ch;margin:12px 0 18px">Your projects are saved and kept safe. Yourkly is the front door: it remembers where you stopped, explains what changed in normal words, and keeps a Save Point every time you save so you can always go back.</p>' +
    '<div class="info-callout"><strong>Two things worth knowing straight away.</strong> Nothing is saved until you press a button that says so \\u2014 until then your edits are drafts waiting for you. And nothing you see in Yourkly is made up: every number, filename and date comes from your real project.</div>' +
    '<div class="cta-row"><button class="pl-btn-primary" data-htopic="how-it-works">Start with how it works</button>' +
    '<button class="pl-btn" data-htopic="glossary">Jump to the glossary</button></div>';
}
const HOW_STEPS = [
  { n: 1, label: 'Start a project', detail: '<div class="section-label section-label--tight">Step 1 of 4</div><h3>Start a project</h3><p>Your projects are saved and kept safe. No new password, nothing to install, nothing to learn first.</p><p>Yourkly keeps your projects in your own workspace and remembers where you left off.</p><div class="info-callout"><strong>Where you\\u2019ll see this</strong><br>The Home screen, when you start your first project.</div>' },
  { n: 2, label: 'Open a project and pick up where you left off', detail: '<div class="section-label section-label--tight">Step 2 of 4</div><h3>Open a project and pick up where you left off</h3><p>Yourkly shows you the last Save Point and what changed, so you start exactly where you stopped.</p><div class="info-callout"><strong>Where you\\u2019ll see this</strong><br>The Home screen, every time you come back.</div>' },
  { n: 3, label: 'Make a Save Point when you want to keep a version', detail: '<div class="section-label section-label--tight">Step 3 of 4</div><h3>Make a Save Point when you want to keep a version</h3><p>A Save Point is a snapshot of your project at a moment in time. Every time you save, Yourkly keeps one, so you can always see what changed and go back.</p><div class="info-callout"><strong>Where you\\u2019ll see this</strong><br>Inside a project, every time you save a file.</div>' },
  { n: 4, label: 'Send in the helpers when you want help', detail: '<div class="section-label section-label--tight">Step 4 of 4</div><h3>Send in the helpers when you want help</h3><p>Three helpers \\u2014 the fixer, the builder, and the polisher \\u2014 each take a safe copy of your project and work at the same time. You compare their work in plain words and keep the one you like best.</p><div class="info-callout"><strong>Where you\\u2019ll see this</strong><br>Inside a project, from Project Home or Separate Versions.</div>' },
];
function helpHowItWorks() {
  let html = '<h2 class="help-section-title">How Yourkly works</h2>' +
    '<p class="help-section-intro">Four steps, start to finish. Click one to see what it actually involves.</p><div class="steps-list">';
  HOW_STEPS.forEach(function(s, i) {
    html += '<button class="step-row' + (i === 0 ? ' step-row--on' : '') + '" data-detail="' + esc(s.detail).replace(/"/g, '&quot;') + '">' +
      '<span class="step-num">' + s.n + '</span><span class="step-text">' + esc(s.label) + '</span></button>';
  });
  html += '</div><div class="step-detail" id="stepDetail">' + HOW_STEPS[0].detail + '</div>';
  return html;
}
const TASK_CARDS = [
  { id: 'save', label: 'I want to save my project', summary: 'Keep a version you can come back to.', answer: '<h3>I want to save my project</h3><div class="walk-step"><span class="step-num">1</span><p>Open your project and open the file you want to change.</p></div><div class="walk-step"><span class="step-num">2</span><p>Make your edits. The pill at the top says \\u201cChanges not saved yet\\u201d while you work.</p></div><div class="walk-step"><span class="step-num">3</span><p>Write one line under \\u201cWhat changed?\\u201d so future-you can find this version.</p></div><div class="walk-step"><span class="step-num">4</span><p>Press \\u201cSave as a new version\\u201d. Yourkly keeps a Save Point.</p></div>' },
  { id: 'helpers', label: 'I want help with my project', summary: 'Send in three helpers and keep the best work.', answer: '<h3>I want help with my project</h3><div class="walk-step"><span class="step-num">1</span><p>Open your project.</p></div><div class="walk-step"><span class="step-num">2</span><p>Open \\u201cSeparate Versions\\u201d and press \\u201cSend in the helpers\\u201d.</p></div><div class="walk-step"><span class="step-num">3</span><p>Compare what each helper changed, in plain words.</p></div><div class="walk-step"><span class="step-num">4</span><p>Press \\u201cKeep this one\\u201d on the version you like best.</p></div>' },
  { id: 'changes', label: 'I want to see what changed', summary: 'Read the story of every Save Point.', answer: '<h3>I want to see what changed</h3><div class="walk-step"><span class="step-num">1</span><p>Open your project.</p></div><div class="walk-step"><span class="step-num">2</span><p>Open \\u201cWhat Changed\\u201d \\u2014 every Save Point, newest first.</p></div><div class="walk-step"><span class="step-num">3</span><p>Press \\u201cSee details\\u201d on any version.</p></div>' },
  { id: 'undo', label: 'I want to undo a mistake', summary: 'Go back to an earlier Save Point without losing anything newer.', answer: '<h3>I want to undo a mistake</h3><div class="walk-step"><span class="step-num">1</span><p>Open \\u201cSave Points\\u201d in your project.</p></div><div class="walk-step"><span class="step-num">2</span><p>Find the version you want to go back to.</p></div><div class="walk-step"><span class="step-num">3</span><p>Press \\u201cGo back to this version\\u201d and confirm.</p></div><div class="walk-step"><span class="step-num">4</span><p>Yourkly puts those files back and saves that as a new Save Point \\u2014 so nothing newer is ever lost.</p></div>' },
  { id: 'files', label: 'I want to work with my files', summary: 'Open, edit, rename, download, and organize.', answer: '<h3>I want to work with my files</h3><div class="walk-step"><span class="step-num">1</span><p>Open \\u201cProject Files\\u201d in your project.</p></div><div class="walk-step"><span class="step-num">2</span><p>Folders open with \\u201cShow what\\u2019s inside\\u201d. Each file has Open, History, Download, Rename, and Delete.</p></div><div class="walk-step"><span class="step-num">3</span><p>History shows which Save Points changed that file.</p></div>' },
];
function helpTasks() {
  let html = '<h2 class="help-section-title">What are you trying to do?</h2>' +
    '<p class="help-section-intro">Pick the closest one. The answer opens underneath.</p><div class="task-grid">';
  TASK_CARDS.forEach(function(t, i) {
    html += '<button class="task-card' + (i === 0 ? ' task-card--on' : '') + '" data-answer="' + esc(t.answer).replace(/"/g, '&quot;') + '">' +
      '<span class="task-card-label">' + esc(t.label) + '</span><span class="task-card-summary">' + esc(t.summary) + '</span></button>';
  });
  html += '</div><div class="step-detail" id="taskAnswer">' + TASK_CARDS[0].answer + '</div>';
  html += '<h2 class="help-section-title" style="margin-top:32px">Step by step</h2>' +
    '<p class="help-section-intro">The same journeys, written out in order, so you can follow along with the app open.</p>';
  const walks = [
    ['I made my first project and want to save it', ['Open the project', 'Open Project Files', 'Add a file or open one', 'Make your edits', 'Press \\u201cSave as a new version\\u201d', 'Write what changed']],
    ['I want the helpers to improve my project', ['Open the project', 'Go to Separate Versions', 'Press \\u201cSend in the helpers\\u201d', 'Wait for the three copies', 'Compare in plain words', 'Press \\u201cKeep this one\\u201d']],
    ['I think I broke something', ['Open Save Points', 'Find an earlier version', 'Press \\u201cGo back to this version\\u201d', 'Confirm', 'Keep working \\u2014 nothing newer is lost']],
  ];
  walks.forEach(function(w) {
    html += '<div class="help-card"><h3>' + esc(w[0]) + '</h3>';
    w[1].forEach(function(s, i) {
      html += '<div class="walk-step"><span class="step-num">' + (i + 1) + '</span><p>' + esc(s) + '</p></div>';
    });
    html += '</div>';
  });
  return html;
}
const GLOSSARY = [
  ['Project', 'One place for all the files that belong together \\u2014 an app, a book, a client job.'],
  ['Save Point', 'A snapshot of your work at a moment in time. Kept forever, and you can always go back to it.'],
  ['What changed?', 'The one line you write when you save, so future-you can find that version again.'],
  ['Main version', 'The real, current version of your project. This is what you work in unless you choose otherwise.'],
  ['Separate version', 'A safe copy of the whole project so you can try something without touching your main version.'],
  ['Helpers', 'Three helpers \\u2014 the fixer, the builder, and the polisher \\u2014 that each take a copy of your project and work at the same time.'],
  ['Restore an earlier version', 'Put the files back the way they were at an earlier Save Point. Nothing newer is deleted.'],
  ['Changes not saved yet', 'Edits you have made but not saved. They are not kept until you save them.'],
  ['Project files', 'The folders and files inside your project.'],
  ['Things to do', 'Your list of what still needs doing in a project, kept in this browser.'],
];
function helpGlossary() {
  let html = '<h2 class="help-section-title">Plain-English glossary</h2>' +
    '<p class="help-section-intro">The word Yourkly uses, and what it actually means.</p>' +
    '<div class="help-search"><input type="text" id="glossFilter" placeholder="Filter these words..." aria-label="Filter glossary" autocomplete="off"></div>' +
    '<table class="glossary-table"><thead><tr><th>Yourkly says</th><th>What it means</th></tr></thead><tbody id="glossBody">';
  GLOSSARY.forEach(function(g) {
    html += '<tr><td class="glossary-term">' + esc(g[0]) + '</td><td>' + esc(g[1]) + '</td></tr>';
  });
  return html + '</tbody></table>';
}
const TROUBLE = [
  ['I edited a file, but I do not see a new Save Point', ['Edits become a Save Point only when you press \\u201cSave as a new version\\u201d in the editor. Until then, the pill at the top of the editor says \\u201cChanges not saved yet\\u201d \\u2014 everything listed there is waiting for you.']],
  ['The helpers say they changed my files, but I see nothing', ['The helpers work in separate copies, never in your main version. Open \\u201cSeparate Versions\\u201d to compare their work, then press \\u201cKeep this one\\u201d on the version you like. Nothing changes in your project until you keep one.']],
  ['I closed the tab \\u2014 is my unsaved work gone?', ['Anything you saved as a Save Point is kept. Edits you never saved were only in the tab, so they are gone. The editor warns you with \\u201cChanges not saved yet\\u201d while edits are unsaved.']],
  ['I saved something I did not mean to save', ['Nothing is ever lost: open \\u201cSave Points\\u201d, find the version from before, and press \\u201cGo back to this version\\u201d. Yourkly puts those files back and saves that as a new Save Point.']],
  ['I kept the wrong helper\\u2019s work', ['Open \\u201cSave Points\\u201d and go back to the version from before you kept it. The other helpers\\u2019 copies stay listed under \\u201cSeparate Versions\\u201d until you send the helpers again.']],
];
function helpTroubleshooting() {
  let html = '<h2 class="help-section-title">When something looks wrong</h2>' +
    '<p class="help-section-intro">Most of these are Yourkly working as intended. Open the one that matches.</p>';
  TROUBLE.forEach(function(t) {
    html += '<div class="accordion"><button class="accordion-head"><span>' + esc(t[0]) + '</span><span class="accordion-icon">+</span></button>' +
      '<div class="accordion-body"><div class="accordion-body-inner">' +
      t[1].map(function(p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div></div></div>';
  });
  html += '<div class="info-callout"><strong>Still stuck?</strong> Tell us what happened and what you expected instead. <button class="text-link" data-htopic="contact">Contact support \\u2192</button></div>';
  return html;
}
function helpContact() {
  return '<h2 class="help-section-title">Contact support</h2>' +
    '<p class="help-section-intro">Reports go to this project\\u2019s issue list, where the people who build Yourkly read them.</p>' +
    '<div class="info-callout"><strong>That page is public.</strong> Anyone can read what you write there, so don\\u2019t include passwords or anything private you wouldn\\u2019t want quoted.</div>' +
    '<div class="section-label">What kind of thing is it?</div>' +
    '<div class="kind-cards">' +
    '<button class="kind-card kind-card--on" data-kind="Something is broken"><strong>Something is broken</strong><span>A screen errors, a button does nothing, a number looks wrong.</span></button>' +
    '<button class="kind-card" data-kind="I got stuck"><strong>I got stuck</strong><span>You couldn\\u2019t work out how to do something Yourkly should do.</span></button>' +
    '<button class="kind-card" data-kind="An idea"><strong>An idea</strong><span>Something Yourkly should do that it does not do yet.</span></button></div>' +
    '<input type="hidden" id="reportKind" value="Something is broken">' +
    '<div class="section-label">What happened?</div>' +
    '<textarea id="reportWhat" placeholder="Tell us what happened and what you expected instead."></textarea>' +
    '<div class="section-label">Where in Yourkly? (optional)</div>' +
    '<input type="text" id="reportWhere" placeholder="For example: Save Points, inside a project" autocomplete="off">' +
    '<div class="cta-row"><button class="pl-btn-primary" id="btnReport">Open a report</button>' +
    '<button class="pl-btn" data-htopic="troubleshooting">Check the common problems first</button></div>';
}

showDashboard();
</script>
</body>
</html>`;
}
