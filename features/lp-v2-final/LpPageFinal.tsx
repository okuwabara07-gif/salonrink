'use client';

import React from 'react';

export default function LpPageFinal() {
  return (
    <>
      <style jsx global>{`

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════ */
:root {
  --ink: #0f1614;
  --ink-2: #3a4340;
  --ink-3: #6b746f;
  --ink-4: #9aa39e;
  --bg: #ffffff;
  --bg-tint: #f6f9f6;
  --bg-soft: #f0f4f0;
  --line: #e6ebe7;
  --line-soft: #f0f3f0;
  --accent: #06C755;
  --accent-dk: #05a648;
  --accent-soft: #e6f7ec;
  --accent-ink: #054d22;
  --coral: #D85A30;
  --coral-soft: #fbe9e1;
  --warn: #c98a2b;
  --warn-soft: #fbf2dc;
  --serif: "Noto Serif JP", "Hiragino Mincho ProN", serif;
  --sans: "Noto Sans JP", "Hiragino Sans", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SF Mono", monospace;
  --shadow-sm: 0 1px 2px rgba(15,22,20,0.04), 0 4px 12px rgba(15,22,20,0.04);
  --shadow-md: 0 2px 6px rgba(15,22,20,0.05), 0 12px 32px rgba(15,22,20,0.06);
  --shadow-lg: 0 8px 24px rgba(15,22,20,0.08), 0 24px 60px rgba(15,22,20,0.08);
  --radius-sm: 10px;
  --radius: 14px;
  --radius-lg: 22px;
  --radius-xl: 28px;
}
*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: var(--bg); color: var(--ink);
  font-family: var(--sans);
  font-feature-settings: "palt";
  -webkit-font-smoothing: antialiased;
}
img, svg { display: block; max-width: 100%; }
button { font: inherit; cursor: pointer; }
a { color: inherit; text-decoration: none; }

/* ═══════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════ */
.sr-container { max-width: 1240px; margin: 0 auto; padding: 0 32px; }
.sr-mono { font-family: var(--mono); font-size: 11px; font-weight: 500; letter-spacing: 0.14em; color: var(--ink-3); text-transform: uppercase; }
.sr-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 12px; font-weight: 500;
  color: var(--accent); letter-spacing: 0.18em; text-transform: uppercase;
}
.sr-eyebrow::before, .sr-eyebrow::after {
  content: ""; width: 24px; height: 1px; background: var(--accent); opacity: 0.5;
}
.sr-h2 {
  font-family: var(--serif); font-weight: 700; font-size: clamp(28px, 3.4vw, 44px);
  line-height: 1.4; letter-spacing: 0.01em; color: var(--ink);
  margin: 0; text-align: center;
}
.sr-h2 .accent { color: var(--accent); }
.sr-lead {
  font-size: 15px; line-height: 1.9; color: var(--ink-2); text-align: center;
  margin: 18px auto 0; max-width: 640px;
}
.sr-check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; background: var(--accent-soft);
  color: var(--accent); flex-shrink: 0;
}
.sr-check svg { width: 10px; height: 10px; }
.sr-section { padding: clamp(64px, 8vw, 112px) 0; position: relative; overflow: hidden; }
.sr-section--tint { background: var(--bg-tint); }
.sr-section__head { text-align: center; margin-bottom: clamp(40px, 5vw, 64px); }
.sr-section__head .sr-eyebrow { margin-bottom: 18px; }
.sr-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 22px; border-radius: 999px;
  font-family: var(--sans); font-weight: 600; font-size: 14px;
  border: 1px solid transparent; cursor: pointer; transition: 0.15s;
  white-space: nowrap;
}
.sr-btn--primary { background: var(--accent); color: #fff; }
.sr-btn--primary:hover { background: var(--accent-dk); }
.sr-btn--outline { background: #fff; color: var(--ink); border-color: var(--line); }
.sr-btn--outline:hover { background: var(--bg-tint); }

/* ═══════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════ */
.nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--line-soft);
}
.nav__inner {
  max-width: 1400px; margin: 0 auto; padding: 14px 32px;
  display: flex; align-items: center; gap: 40px;
}
.logo { display: flex; align-items: center; gap: 10px; }
.logo__mark {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent); display: flex; align-items: center; justify-content: center;
}
.logo__text { display: flex; align-items: baseline; gap: 8px; }
.logo__name { font-family: var(--serif); font-weight: 700; font-size: 22px; color: var(--ink); }
.logo__sub { font-family: var(--mono); font-size: 11px; font-weight: 500; color: var(--ink); letter-spacing: 0.22em; }
.nav__menu { display: flex; gap: 32px; flex: 1; justify-content: center; }
.nav__menu a { font-size: 14px; font-weight: 500; color: var(--ink); transition: 0.15s; }
.nav__menu a:hover { color: var(--accent-dk); }
.nav__cta { display: flex; gap: 10px; }

/* ═══════════════════════════════════════════════
   SECTION 01: HERO
═══════════════════════════════════════════════ */
.hero {
  position: relative;
  padding: 64px 0;
  background: #fff;
  overflow: hidden;
}

.hero__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.hero__content { position: relative; z-index: 1; }

.hero__media { position: relative; }

.hero__image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px;
}
.hero__badge { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 28px; }
.hero__badge .pill {
  background: var(--accent); color: #fff;
  font-family: var(--mono); font-weight: 700; font-size: 11px;
  letter-spacing: 0.16em; padding: 5px 12px; border-radius: 999px;
}
.hero__badge .text { font-size: 13px; color: var(--ink-2); font-weight: 500; }
.hero__title {
  font-family: var(--serif); font-weight: 700;
  font-size: clamp(34px, 4.4vw, 56px);
  line-height: 1.32; color: var(--ink); margin: 0 0 28px;
}
.hero__title .accent { color: var(--accent); }
.hero__sub { font-size: 15px; line-height: 2; color: var(--ink-2); margin: 0 0 32px; }
.hero__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
.stat {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius); padding: 18px 16px;
  box-shadow: var(--shadow-sm);
}
.stat__row { display: flex; align-items: center; gap: 10px; }
.stat__icon { width: 28px; height: 28px; flex-shrink: 0; color: var(--accent); }
.stat__label { font-size: 12px; color: var(--ink-2); font-weight: 500; line-height: 1.3; }
.stat__value {
  font-family: var(--serif); font-weight: 700;
  font-size: 28px; color: var(--accent);
  line-height: 1; margin-top: 4px; letter-spacing: -0.02em;
  text-align: center;
}
.stat__note {
  font-family: var(--mono); font-size: 8.5px; color: var(--ink-3);
  letter-spacing: 0.06em; margin-top: 8px;
  text-align: center; padding-top: 8px; border-top: 1px solid var(--line-soft);
}
.hero__bullets { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; padding: 0; }
.hero__bullets li {
  list-style: none; display: flex; align-items: center; gap: 12px;
  font-size: 14px; color: var(--ink-2);
}
.hero__cta { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.hero__cta .sr-btn { padding: 16px 26px; font-size: 15px; }
.hero__cta .sr-btn--primary { box-shadow: 0 6px 16px rgba(6,199,85,0.28); }
.hero__trust { display: flex; flex-wrap: wrap; gap: 22px; font-size: 12px; color: var(--ink-3); }
.hero__trust span { display: inline-flex; align-items: center; gap: 6px; }
.hero__trust svg { color: var(--accent); }

@media (max-width: 980px) {
  .hero__inner { grid-template-columns: 1fr; gap: 32px; }
  .hero__image { border-radius: 12px; }
  .nav__menu { display: none; }
}

/* ═══════════════════════════════════════════════
   SECTION 02: PROBLEM
═══════════════════════════════════════════════ */
.problem { background: var(--bg-tint); }
.problem__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.pcard {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); padding: 28px;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-sm);
}
.pcard__num {
  font-family: var(--mono); font-size: 11px; font-weight: 600;
  color: var(--accent); letter-spacing: 0.18em; margin-bottom: 12px;
}
.pcard__title {
  font-family: var(--serif); font-weight: 700; font-size: 20px;
  color: var(--ink); margin: 0 0 14px; line-height: 1.55;
}
.pcard__title .accent { color: var(--coral); }
.pcard__body { font-size: 13px; line-height: 1.85; color: var(--ink-2); margin: 0 0 18px; }
.pcard__demo {
  background: var(--bg-soft); border-radius: var(--radius);
  padding: 14px; margin-bottom: 16px;
  font-size: 11.5px; color: var(--ink-2);
}
.demo-chat-row { display: flex; align-items: flex-start; gap: 8px; }
.demo-avatar { width: 28px; height: 28px; border-radius: 50%; background: #fff; flex-shrink: 0; }
.demo-time { font-family: var(--mono); font-size: 9px; color: var(--ink-3); }
.demo-msg { background: #fff; border-radius: 10px; padding: 6px 10px; margin-top: 4px; font-size: 11px; }
.demo-flag { color: var(--coral); font-size: 11px; margin-top: 8px; font-weight: 500; }
.demo-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
.demo-list li { font-size: 11px; color: var(--ink-2); }
.pcard__foot {
  margin-top: auto; display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; background: var(--coral-soft); border-radius: var(--radius);
}
.pcard__foot-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #fff; color: var(--coral);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pcard__foot-text { font-size: 12px; color: var(--ink-2); font-weight: 500; line-height: 1.5; }
.pband {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); padding: 22px 28px;
  margin-top: 40px; display: flex; align-items: center; gap: 28px;
  box-shadow: var(--shadow-sm);
}
.pband__hd { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.pband__hd-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; }
.pband__hd-text { font-family: var(--serif); font-weight: 700; font-size: 15px; line-height: 1.5; color: var(--ink); }
.pband__items {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; flex: 1;
  border-left: 1px dashed var(--line); padding-left: 28px;
  list-style: none; padding-right: 0; padding-top: 0; padding-bottom: 0;
  margin: 0;
}
.pband__items li {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 11px; color: var(--ink-2); line-height: 1.55;
}
.problem__arrow { text-align: center; margin: 48px 0 14px; color: var(--accent); }
.problem__solve {
  text-align: center;
  font-family: var(--serif); font-size: 22px; font-weight: 500;
  color: var(--ink);
}
.problem__solve .brand { color: var(--ink); font-weight: 700; }
.problem__solve .brand-sub { font-family: var(--mono); font-weight: 600; font-size: 14px; letter-spacing: 0.18em; margin-left: 2px; }
@media (max-width: 980px) {
  .problem__grid { grid-template-columns: 1fr; }
  .pband { flex-direction: column; align-items: flex-start; }
  .pband__items { grid-template-columns: 1fr 1fr; border-left: none; padding-left: 0; padding-top: 18px; border-top: 1px dashed var(--line); }
}

/* ═══════════════════════════════════════════════
   SECTION 03: SOLUTION
═══════════════════════════════════════════════ */
.sol__cols {
  display: grid; grid-template-columns: 1fr 70px 1fr;
  gap: 22px; align-items: stretch;
}
.sol__col {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); padding: 32px 30px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column;
}
.sol__col-eyebrow {
  font-family: var(--mono); font-size: 10px; font-weight: 600;
  color: var(--ink-3); letter-spacing: 0.18em; margin-bottom: 8px;
}
.sol__col-title {
  font-family: var(--serif); font-weight: 700; font-size: 22px;
  color: var(--ink); margin: 0 0 12px;
}
.sol__col-sub { font-size: 13px; line-height: 1.85; color: var(--ink-2); margin: 0 0 22px; }
.sol__feat { display: flex; flex-direction: column; gap: 14px; }
.feat { display: flex; align-items: flex-start; gap: 12px; }
.feat__icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--accent-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.feat__body { flex: 1; }
.feat__row { display: flex; align-items: center; gap: 8px; }
.feat__tag {
  font-family: var(--mono); font-size: 9px; font-weight: 600;
  background: var(--bg-soft); color: var(--ink-2);
  padding: 2px 8px; border-radius: 999px; letter-spacing: 0.08em;
}
.feat__title { font-size: 13.5px; font-weight: 600; color: var(--ink); }
.feat__sub { font-size: 11.5px; color: var(--ink-2); line-height: 1.6; margin-top: 4px; }
.sol__arrow-wrap { display: flex; align-items: center; justify-content: center; }
.sol__arrow {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 16px rgba(6,199,85,0.32);
}
.sband {
  background: var(--bg-soft); border-radius: var(--radius-lg);
  padding: 22px 28px; margin-top: 32px;
  display: flex; align-items: center; gap: 28px;
}
.sband__hd { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.sband__hd-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; }
.sband__hd-text { font-family: var(--serif); font-weight: 700; font-size: 15px; line-height: 1.5; color: var(--ink); }
.sband__items {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; flex: 1;
  border-left: 1px dashed var(--line); padding: 0 0 0 28px;
  list-style: none; margin: 0;
}
.sband__item { display: flex; align-items: flex-start; gap: 10px; font-size: 11.5px; color: var(--ink-2); line-height: 1.55; }
.sband__item-icon { width: 28px; height: 28px; border-radius: 50%; background: var(--bg-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
@media (max-width: 980px) {
  .sol__cols { grid-template-columns: 1fr; gap: 16px; }
  .sol__arrow { transform: rotate(90deg); }
  .sband { flex-direction: column; align-items: flex-start; }
  .sband__items { grid-template-columns: 1fr 1fr; border-left: none; padding: 18px 0 0; border-top: 1px dashed var(--line); }
}

/* ═══════════════════════════════════════════════
   SECTION 04: FOR EVERYONE
═══════════════════════════════════════════════ */
.everyone { background: var(--bg-tint); }
.everyone__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.ecard {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: var(--shadow-sm); display: flex; flex-direction: column;
}
.ecard__top {
  padding: 24px 26px 22px;
  background: linear-gradient(180deg, var(--accent-soft) 0%, transparent 100%);
  border-bottom: 1px solid var(--line);
}
.ecard__top-icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: #fff; color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.ecard__top-eyebrow { font-family: var(--mono); font-size: 10px; font-weight: 600; color: var(--ink-3); letter-spacing: 0.18em; margin-bottom: 10px; }
.ecard__top-stat { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.ecard__top-num { font-family: var(--serif); font-weight: 700; font-size: 38px; color: var(--accent); line-height: 1; }
.ecard__top-unit { font-family: var(--serif); font-size: 20px; color: var(--accent); font-weight: 700; }
.ecard__top-pill {
  font-family: var(--mono); font-size: 10px; font-weight: 600;
  color: var(--accent-ink); background: var(--accent-soft);
  padding: 4px 10px; border-radius: 999px; letter-spacing: 0.08em;
}
.ecard__top-note {
  font-family: var(--mono); font-size: 9px; color: var(--ink-3);
  letter-spacing: 0.06em; margin-top: 8px;
}
.ecard__body { padding: 22px 26px 24px; display: flex; flex-direction: column; flex: 1; }
.ecard__title { font-family: var(--serif); font-weight: 700; font-size: 18px; color: var(--ink); margin: 0 0 10px; line-height: 1.55; }
.ecard__title .accent { color: var(--accent); }
.ecard__sub { font-size: 12.5px; line-height: 1.8; color: var(--ink-2); margin: 0 0 16px; }
.ecard__visual { display: flex; gap: 12px; margin-bottom: 14px; }
.ecard__photo {
  width: 100px; height: 120px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, #e8e0d4 0%, #d4c5b1 100%);
  position: relative;
}
.ecard__photo::after {
  content: attr(data-label); position: absolute; bottom: 6px; left: 6px;
  font-family: var(--mono); font-size: 8px; color: rgba(255,255,255,0.85);
  letter-spacing: 0.18em; font-weight: 600;
}
.ecard__photo--staff { background: linear-gradient(135deg, #d4d8d2 0%, #a8b0a8 100%); }
.ecard__checks { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.ecard__checks li { font-size: 11.5px; color: var(--ink-2); display: flex; align-items: center; gap: 8px; line-height: 1.5; }
.ecard__quote {
  background: var(--bg-soft); border-radius: 10px;
  padding: 12px 14px; margin-top: auto;
  display: flex; gap: 8px; align-items: flex-start;
}
.ecard__quote-icon { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.ecard__quote-text { font-size: 11.5px; line-height: 1.65; color: var(--ink-2); font-style: italic; }
.owner-phone {
  width: 100px; flex-shrink: 0;
  background: #1a1a1a; border-radius: 16px; padding: 5px;
}
.owner-phone__screen {
  background: #fff; border-radius: 12px; padding: 8px;
  font-size: 8px; min-height: 110px;
}
.owner-phone__time { font-family: var(--mono); font-size: 7px; color: var(--ink-3); margin-bottom: 4px; }
.owner-phone__head { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
.owner-phone__head .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 7px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.owner-phone__head .ttl { font-size: 7px; font-weight: 600; }
.owner-phone__row { display: flex; justify-content: space-between; font-size: 7px; padding: 3px 0; border-bottom: 1px solid #f0f0f0; }
.owner-phone__row b { font-weight: 700; color: var(--ink); }
.owner-phone__btn { background: var(--accent); color: #fff; text-align: center; padding: 4px; border-radius: 6px; font-size: 7.5px; margin-top: 6px; font-weight: 600; }
.eband {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 22px 28px; margin-top: 32px;
  display: flex; align-items: center; gap: 28px;
  box-shadow: var(--shadow-sm);
}
.eband__icon { width: 44px; height: 44px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.eband__title { font-family: var(--serif); font-weight: 700; font-size: 16px; color: var(--ink); flex-shrink: 0; }
.eband__sub { font-size: 12.5px; color: var(--ink-2); line-height: 1.7; flex: 1; border-left: 1px solid var(--line); padding-left: 24px; }
@media (max-width: 980px) {
  .everyone__grid { grid-template-columns: 1fr; }
  .eband { flex-direction: column; align-items: flex-start; }
  .eband__sub { border-left: none; padding-left: 0; padding-top: 14px; border-top: 1px solid var(--line); }
}

/* ═══════════════════════════════════════════════
   SECTION 05: IN ACTION (Timeline)
═══════════════════════════════════════════════ */
.timeline { position: relative; max-width: 1100px; margin: 0 auto; padding: 20px 0; }
.timeline::before {
  content: ""; position: absolute; top: 0; bottom: 0; left: 50%;
  width: 2px; background: linear-gradient(180deg, var(--accent-soft), var(--accent), var(--accent-soft));
  transform: translateX(-50%);
}
.scene { display: grid; grid-template-columns: 1fr 60px 1fr; gap: 24px; margin-bottom: 56px; align-items: center; position: relative; }
.scene__body { background: #fff; border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-sm); }
.scene__body--left { text-align: right; }
.scene__time { font-family: var(--mono); font-size: 11px; font-weight: 600; color: var(--accent); letter-spacing: 0.14em; margin-bottom: 10px; }
.scene__title { font-family: var(--serif); font-weight: 700; font-size: 22px; color: var(--ink); margin: 0 0 12px; line-height: 1.5; }
.scene__title .accent { color: var(--accent); }
.scene__desc { font-size: 13px; line-height: 1.85; color: var(--ink-2); margin: 0 0 14px; }
.scene__tags { display: flex; gap: 8px; flex-wrap: wrap; }
.scene__body--left .scene__tags { justify-content: flex-end; }
.scene__tag { font-family: var(--mono); font-size: 9.5px; font-weight: 600; background: var(--bg-soft); color: var(--ink-2); padding: 4px 10px; border-radius: 999px; letter-spacing: 0.1em; }
.scene__dot {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-weight: 700; font-size: 14px;
  z-index: 2; margin: 0 auto;
  box-shadow: 0 6px 16px rgba(6,199,85,0.4); border: 4px solid #fff;
}
.scene__phone {
  width: 240px; margin: 0 auto;
  background: #1a1a1a; border-radius: 22px; padding: 6px;
  box-shadow: var(--shadow-md);
}
.scene__phone-screen { background: #f7f7f7; border-radius: 18px; overflow: hidden; }
.scene__phone-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #fff; border-bottom: 1px solid #eee; }
.scene__phone-head .back { font-size: 16px; color: #999; }
.scene__phone-head .avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--bg-soft); display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-weight: 600; font-size: 10px; color: var(--ink-2); }
.scene__phone-body { padding: 12px; min-height: 200px; }
.mini-msg-row { display: flex; gap: 6px; margin-bottom: 8px; align-items: flex-end; }
.mini-msg-row--user { justify-content: flex-end; }
.mini-msg-avatar { width: 20px; height: 20px; border-radius: 50%; background: var(--bg-soft); flex-shrink: 0; }
.mini-msg { background: #fff; border-radius: 10px; padding: 7px 10px; font-size: 10px; line-height: 1.5; max-width: 75%; }
.mini-msg--user { background: #B2EBC8; }
.mini-time { font-size: 8px; color: var(--ink-3); }
.mini-card { background: #fff; border-radius: 10px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.mini-card__title { font-size: 9.5px; font-weight: 700; color: var(--ink); margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
.mini-card__title .dot { font-size: 11px; }
.mini-card__row { display: flex; justify-content: space-between; font-size: 9px; padding: 3px 0; border-bottom: 1px solid #f5f5f5; }
.mini-card__row b { font-weight: 700; color: var(--ink); }
.suggest { background: var(--accent-soft); border: 1px dashed var(--accent); border-radius: 10px; padding: 10px; margin-bottom: 8px; }
.suggest__head { display: flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; color: var(--accent-ink); margin-bottom: 6px; }
.suggest__body { font-size: 9.5px; line-height: 1.5; color: var(--ink); }
@media (max-width: 980px) {
  .timeline::before { left: 24px; }
  .scene { grid-template-columns: 60px 1fr; gap: 16px; }
  .scene--reverse { grid-template-columns: 60px 1fr; }
  .scene__body--left { text-align: left; order: 2; }
  .scene__body--right { order: 2; }
  .scene__body--left .scene__tags { justify-content: flex-start; }
  .scene__dot { order: 1; margin: 0; }
  .scene__phone { display: none; }
}

/* ═══════════════════════════════════════════════
   SECTION 06: AI KARTE
═══════════════════════════════════════════════ */
.karte { background: var(--bg-tint); }
.karte__main { display: grid; grid-template-columns: 1fr 70px 1fr; gap: 22px; align-items: stretch; margin-bottom: 40px; }
.karte__left, .karte__right {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); padding: 24px;
  box-shadow: var(--shadow-sm); display: flex; flex-direction: column;
}
.karte__head-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.karte__head-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--bg-soft); color: var(--ink-2); display: flex; align-items: center; justify-content: center; }
.karte__head-title { font-family: var(--serif); font-weight: 600; font-size: 13px; color: var(--ink); }
.karte__head-sub { font-family: var(--mono); font-size: 10px; color: var(--ink-3); margin-left: auto; }
.chat-scroll { display: flex; flex-direction: column; gap: 10px; flex: 1; padding: 4px; min-height: 220px; }
.cs-row { display: flex; gap: 6px; align-items: flex-end; }
.cs-row--user { justify-content: flex-end; }
.cs-avatar { width: 20px; height: 20px; border-radius: 50%; background: var(--bg-soft); flex-shrink: 0; }
.cs-msg { background: var(--bg-soft); border-radius: 10px; padding: 7px 10px; font-size: 11px; line-height: 1.55; max-width: 80%; }
.cs-msg--user { background: var(--accent-soft); }
.cs-time { font-size: 8.5px; color: var(--ink-3); margin: 0 2px; }
.karte__steps { display: flex; justify-content: space-between; padding: 14px 8px 0; margin-top: 14px; border-top: 1px dashed var(--line); }
.karte__steps-item { font-family: var(--mono); font-size: 10px; color: var(--ink-3); display: flex; align-items: center; gap: 6px; }
.karte__steps-num { width: 18px; height: 18px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10px; }
.karte__arrow { display: flex; align-items: center; justify-content: center; }
.karte__arrow-pill {
  background: var(--accent); color: #fff;
  border-radius: 999px; padding: 8px 14px;
  display: flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-weight: 700; font-size: 11px;
  box-shadow: 0 6px 16px rgba(6,199,85,0.3);
}
.kr__top { display: flex; gap: 14px; margin-bottom: 16px; }
.kr__photo { width: 56px; height: 70px; border-radius: 10px; background: linear-gradient(135deg, #d8d0c4 0%, #b8a890 100%); flex-shrink: 0; }
.kr__top-body { flex: 1; }
.kr__name { font-family: var(--serif); font-weight: 700; font-size: 16px; color: var(--ink); }
.kr__meta { font-family: var(--mono); font-size: 9.5px; color: var(--ink-3); margin-top: 2px; }
.kr__chips { display: flex; gap: 5px; margin-top: 8px; flex-wrap: wrap; }
.kr__chip { font-family: var(--mono); font-size: 9px; font-weight: 600; padding: 3px 8px; border-radius: 999px; }
.kr__chip--accent { background: var(--accent-soft); color: var(--accent-ink); }
.kr__chip--coral { background: var(--coral-soft); color: var(--coral); }
.kr__chip--neutral { background: var(--bg-soft); color: var(--ink-2); }
.kr__section { padding: 12px 0; border-top: 1px dashed var(--line); }
.kr__section-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.kr__label { font-family: var(--serif); font-weight: 600; font-size: 11px; color: var(--ink); }
.kr__src { font-family: var(--mono); font-size: 9px; color: var(--accent); }
.kr__field-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
.kr__field-row span:first-child { color: var(--ink-3); }
.kr__field-row span:last-child { color: var(--ink); font-weight: 500; }
.kr__note { background: var(--accent-soft); border-radius: 10px; padding: 10px 12px; font-size: 11.5px; line-height: 1.6; color: var(--accent-ink); display: flex; gap: 8px; align-items: flex-start; }
.kr__note-icon { width: 18px; height: 18px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.karte__feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.karte__feat { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; box-shadow: var(--shadow-sm); }
.karte__feat-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.karte__feat-title { font-family: var(--serif); font-weight: 700; font-size: 15px; color: var(--ink); margin-bottom: 6px; }
.karte__feat-sub { font-size: 12px; line-height: 1.7; color: var(--ink-2); }
@media (max-width: 980px) {
  .karte__main { grid-template-columns: 1fr; gap: 16px; }
  .karte__arrow-pill { transform: rotate(90deg); }
  .karte__feats { grid-template-columns: 1fr; }
}

/* ═══════════════════════════════════════════════
   SECTION 07: NUMBERS
═══════════════════════════════════════════════ */
.numbers__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-bottom: 32px; }
.nc {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); padding: 30px 28px 26px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column;
  position: relative;
}
.nc--featured { background: linear-gradient(180deg, var(--accent-soft) 0%, #fff 30%); border-color: var(--accent); box-shadow: 0 12px 32px rgba(6,199,85,0.12); }
.nc__eyebrow { font-family: var(--mono); font-size: 10px; font-weight: 600; color: var(--accent); letter-spacing: 0.16em; margin-bottom: 12px; }
.nc__title { font-family: var(--serif); font-weight: 700; font-size: 17px; color: var(--ink); margin-bottom: 18px; line-height: 1.55; }
.nc__stat { display: flex; align-items: baseline; gap: 2px; margin-bottom: 14px; }
.nc__sign { font-family: var(--serif); font-weight: 700; font-size: 30px; color: var(--accent); }
.nc__sign--minus { color: var(--coral); }
.nc__num { font-family: var(--serif); font-weight: 700; font-size: 56px; color: var(--accent); line-height: 1; letter-spacing: -0.02em; }
.nc__num--coral { color: var(--coral); }
.nc__unit { font-family: var(--serif); font-weight: 700; font-size: 26px; color: var(--accent); margin-left: 2px; }
.nc__unit--coral { color: var(--coral); }
.nc__caption { font-size: 12px; line-height: 1.8; color: var(--ink-2); margin: 0 0 18px; }
.nc__arrow-chart { position: relative; height: 60px; margin-top: auto; }
.nc__line-up { position: absolute; inset: 0; }
.nc__chart { margin-top: auto; }
.nc__chart-head { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 9.5px; color: var(--ink-3); margin-bottom: 6px; }
.nc__bars { display: flex; align-items: flex-end; gap: 3px; height: 50px; }
.nc__bar { flex: 1; background: var(--bg-soft); border-radius: 2px; }
.nc__bar--mid { background: var(--accent-soft); }
.nc__bar--hi { background: var(--accent); }
.nc__time { display: flex; align-items: center; gap: 10px; background: var(--bg-tint); border-radius: 14px; padding: 14px; margin-top: auto; }
.nc__time-icon { width: 36px; height: 36px; border-radius: 10px; background: #fff; color: var(--coral); display: flex; align-items: center; justify-content: center; }
.nc__time-body { flex: 1; font-size: 11px; color: var(--ink-2); line-height: 1.6; }
.nc__time-body b { font-family: var(--serif); color: var(--ink); font-weight: 700; }
.numbers__foot {
  text-align: center; padding: 18px 24px;
  background: var(--coral-soft); border-radius: var(--radius);
  font-size: 12px; color: var(--ink-2); line-height: 1.75;
  border: 1px solid var(--coral);
}
.numbers__foot b { color: var(--coral); font-weight: 700; }
@media (max-width: 980px) { .numbers__grid { grid-template-columns: 1fr; } }

/* ═══════════════════════════════════════════════
   SECTION 08: CASE 01 (キレイ鶴見店)
═══════════════════════════════════════════════ */
.case { background: var(--bg-tint); }
.case__card {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: var(--shadow-md);
  max-width: 1100px; margin: 0 auto;
}
.case__top { display: grid; grid-template-columns: 380px 1fr; gap: 0; }
.case__photo {
  background-image: url('/images/case/kirei-tsurumi-real.jpg');
  background-size: cover; background-position: center 30%;
  position: relative;
  min-height: 540px;
  padding: 24px;
  display: flex; flex-direction: column; justify-content: space-between;
  color: #fff;
}
.case__photo::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 30%, transparent 50%, rgba(0,0,0,0.7) 95%, rgba(0,0,0,0.9) 100%);
  pointer-events: none;
}
.case__photo-top {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.95); color: var(--accent-dk);
  padding: 6px 12px; border-radius: 999px;
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  letter-spacing: 0.16em; backdrop-filter: blur(8px);
  z-index: 1; align-self: flex-start; position: relative;
}
.case__photo-bottom { position: relative; z-index: 1; }
.case__photo-name { font-family: var(--serif); font-weight: 700; font-size: 32px; line-height: 1.3; letter-spacing: 0.01em; margin: 0 0 8px; }
.case__photo-meta { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.12em; opacity: 0.85; margin-bottom: 12px; }
.case__photo-meta-links { font-size: 11px; opacity: 0.92; margin-bottom: 14px; line-height: 1.7; }
.case__photo-meta-links a { color: #fff; text-decoration: underline; opacity: 0.95; }
.case__photo-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.case__photo-tag {
  background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.4);
  backdrop-filter: blur(8px); padding: 4px 10px; border-radius: 999px;
  font-size: 10px; font-weight: 500;
}
.case__top-body { padding: 32px 36px; }
.case__quote-mark { font-family: var(--serif); font-size: 60px; line-height: 1; color: var(--accent); margin: 0 0 -8px; }
.case__quote { font-family: var(--serif); font-weight: 500; font-size: 17px; line-height: 1.9; color: var(--ink); margin: 0 0 14px; }
.case__quote .accent { color: var(--accent); font-weight: 700; }
.case__quote-by { font-family: var(--mono); font-size: 11px; color: var(--ink-3); margin-bottom: 26px; letter-spacing: 0.08em; }
.case__before-after { display: grid; grid-template-columns: 1fr 36px 1fr; gap: 10px; align-items: stretch; }
.ba-col { background: var(--bg-soft); border-radius: 12px; padding: 16px; }
.ba-col--after { background: var(--accent-soft); border: 1px solid var(--accent); }
.ba-label { font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 0.18em; color: var(--ink-3); margin-bottom: 8px; }
.ba-col--after .ba-label { color: var(--accent-ink); }
.ba-text { font-size: 12px; line-height: 1.75; color: var(--ink-2); }
.ba-col--after .ba-text { color: var(--ink); font-weight: 500; }
.ba-arrow { display: flex; align-items: center; justify-content: center; color: var(--accent); }
.case__metrics { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line); }
.case__metric { padding: 22px 16px; text-align: center; border-right: 1px solid var(--line); }
.case__metric:last-child { border-right: none; }
.case__metric-label { font-family: var(--mono); font-size: 10px; color: var(--ink-3); letter-spacing: 0.1em; margin-bottom: 8px; }
.case__metric-stat { display: flex; align-items: baseline; justify-content: center; gap: 2px; margin-bottom: 6px; }
.case__metric-num { font-family: var(--serif); font-weight: 700; font-size: 32px; color: var(--accent); line-height: 1; }
.case__metric-num--coral { color: var(--coral); }
.case__metric-unit { font-family: var(--serif); font-weight: 700; font-size: 16px; color: var(--accent); }
.case__metric-num--coral + .case__metric-unit { color: var(--coral); }
.case__metric-sub { font-family: var(--mono); font-size: 9px; color: var(--ink-3); letter-spacing: 0.06em; }
.case__sim-note {
  background: var(--warn-soft); border-top: 1px solid var(--warn);
  padding: 14px 28px;
  font-size: 11px; color: var(--ink-2); line-height: 1.7; text-align: center;
}
.case__sim-note b { color: var(--warn); font-weight: 700; }
.case__timeline { padding: 28px 36px 32px; border-top: 1px solid var(--line); }
.case__timeline-title { font-family: var(--serif); font-weight: 700; font-size: 14px; color: var(--ink); margin-bottom: 20px; letter-spacing: 0.05em; }
.case__tl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; position: relative; }
.case__tl::before { content: ""; position: absolute; top: 14px; left: 24px; right: 24px; height: 1px; background: linear-gradient(90deg, var(--accent), var(--accent-soft)); opacity: 0.4; }
.case__tl-item { padding-top: 28px; position: relative; }
.case__tl-item::before { content: ""; position: absolute; top: 8px; left: 0; width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 2px solid var(--accent); }
.case__tl-item.done::before { background: var(--accent); }
.case__tl-time { font-family: var(--mono); font-size: 10px; color: var(--accent); font-weight: 600; letter-spacing: 0.1em; margin-bottom: 4px; }
.case__tl-title { font-family: var(--serif); font-weight: 700; font-size: 13.5px; color: var(--ink); margin-bottom: 4px; line-height: 1.4; }
.case__tl-sub { font-size: 11px; color: var(--ink-2); line-height: 1.55; }
@media (max-width: 980px) {
  .case__top { grid-template-columns: 1fr; }
  .case__photo { min-height: 380px; }
  .case__before-after { grid-template-columns: 1fr; }
  .ba-arrow { transform: rotate(90deg); padding: 4px 0; }
  .case__metrics { grid-template-columns: 1fr 1fr; }
  .case__metric:nth-child(2n) { border-right: none; }
  .case__metric:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
  .case__tl { grid-template-columns: 1fr; gap: 18px; }
  .case__tl::before { display: none; }
  .case__tl-item { padding-top: 0; padding-left: 28px; }
  .case__tl-item::before { top: 0; left: 0; }
}

/* ═══════════════════════════════════════════════
   SECTION 09: ONBOARDING
═══════════════════════════════════════════════ */
.onb__steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; position: relative; margin-bottom: 40px; }
.onb__steps::before { content: ""; position: absolute; top: 36px; left: 60px; right: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-soft) 0%, var(--accent) 50%, var(--accent-soft) 100%); }
.ostep {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); padding: 24px 22px;
  box-shadow: var(--shadow-sm); position: relative;
}
.ostep__num {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif); font-weight: 700; font-size: 16px;
  margin: 0 auto 12px; position: relative; z-index: 1;
  box-shadow: 0 4px 12px rgba(6,199,85,0.3);
}
.ostep__tag { font-family: var(--mono); font-size: 10px; font-weight: 600; color: var(--accent); letter-spacing: 0.1em; text-align: center; margin-bottom: 12px; }
.ostep__title { font-family: var(--serif); font-weight: 700; font-size: 16px; color: var(--ink); text-align: center; margin: 0 0 10px; line-height: 1.5; }
.ostep__sub { font-size: 12px; line-height: 1.75; color: var(--ink-2); text-align: center; margin: 0 0 16px; }
.ostep__visual { background: var(--bg-soft); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 8px; }
.ostep__visual-icon { width: 28px; height: 28px; border-radius: 8px; background: #fff; color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ostep__visual-text { font-size: 10.5px; line-height: 1.5; color: var(--ink-2); }
.ostep__visual-text b { color: var(--ink); font-weight: 700; }
.ostep__hpb-pill {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 10px;
  background: var(--accent-soft); color: var(--accent);
  padding: 5px 12px; border-radius: 999px;
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  letter-spacing: 0.06em;
}
.onb__cta { background: linear-gradient(135deg, var(--accent-soft) 0%, #fff 50%, var(--accent-soft) 100%); border: 2px solid var(--accent); border-radius: var(--radius-lg); padding: 28px 36px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; box-shadow: 0 12px 32px rgba(6,199,85,0.15); }
.onb__cta-head { display: flex; align-items: center; gap: 18px; }
.onb__cta-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.onb__cta-text h3 { font-family: var(--serif); font-weight: 700; font-size: 20px; color: var(--ink); margin: 0 0 4px; }
.onb__cta-text p { font-size: 12.5px; color: var(--ink-2); margin: 0; }
.onb__cta-btns { display: flex; gap: 10px; }
.onb__cta-btns .sr-btn { padding: 14px 22px; }
@media (max-width: 980px) {
  .onb__steps { grid-template-columns: 1fr; gap: 16px; }
  .onb__steps::before { display: none; }
  .onb__cta { grid-template-columns: 1fr; }
  .onb__cta-btns { flex-direction: column; }
}

/* ═══════════════════════════════════════════════
   SECTION 10: COMPARE
═══════════════════════════════════════════════ */
.compare { background: var(--bg-tint); }
.cmp__table {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: var(--shadow-sm); max-width: 1100px; margin: 0 auto;
}
.cmp__row { display: grid; grid-template-columns: 1.4fr 1fr 1.2fr 1fr; align-items: center; }
.cmp__row:not(:last-child) { border-bottom: 1px solid var(--line-soft); }
.cmp__cell { padding: 18px 20px; font-size: 13px; color: var(--ink-2); display: flex; align-items: center; gap: 8px; }
.cmp__cell:first-child { background: var(--bg-tint); }
.cmp__val { justify-content: center; text-align: center; border-left: 1px solid var(--line-soft); }
.cmp__val--featured { background: var(--accent-soft); border-left: 2px solid var(--accent); border-right: 2px solid var(--accent); position: relative; }
.cmp__row--head .cmp__cell { padding: 22px 16px; }
.cmp__row--head .cmp__val { background: var(--bg-tint); }
.cmp__row--head .cmp__val--featured { background: linear-gradient(180deg, var(--accent) 0%, var(--accent-dk) 100%); color: #fff; }
.cmp__head-cell { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
.cmp__head-mark { width: 32px; height: 32px; border-radius: 8px; background: #fff; color: var(--ink-2); display: flex; align-items: center; justify-content: center; }
.cmp__head-cell--featured .cmp__head-mark { background: rgba(255,255,255,0.2); color: #fff; }
.cmp__head-eyebrow { font-family: var(--mono); font-size: 10px; font-weight: 600; opacity: 0.6; letter-spacing: 0.14em; }
.cmp__head-name { font-family: var(--serif); font-weight: 700; font-size: 14px; }
.cmp__head-pill { font-family: var(--mono); font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,0.95); color: var(--accent-dk); letter-spacing: 0.12em; margin-top: 4px; }
.cmp__label { display: flex; flex-direction: column; gap: 2px; }
.cmp__label-sub { font-family: var(--mono); font-size: 9.5px; color: var(--ink-3); letter-spacing: 0.06em; font-weight: 400; }
.cmp__icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; }
.cmp__icon--yes { background: var(--accent); color: #fff; }
.cmp__icon--mid { background: var(--warn-soft); color: var(--warn); }
.cmp__icon--no { background: var(--coral-soft); color: var(--coral); }
.cmp__val small { font-family: var(--mono); font-size: 9.5px; color: var(--ink-3); letter-spacing: 0.04em; }
.cmp__disclaimer {
  margin-top: 16px;
  padding: 14px 20px;
  background: var(--bg-soft); border-left: 3px solid var(--ink-3);
  border-radius: 0 8px 8px 0;
  font-size: 11px; line-height: 1.7; color: var(--ink-3);
  max-width: 1100px; margin-left: auto; margin-right: auto;
}
.cmp__cta { margin-top: 40px; text-align: center; }
.cmp__cta h3 { font-family: var(--serif); font-weight: 700; font-size: 22px; color: var(--ink); margin: 0 0 12px; }
.cmp__cta p { font-size: 13px; color: var(--ink-2); margin: 0 0 22px; }
.cmp__cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
@media (max-width: 980px) {
  .cmp__row { grid-template-columns: 1fr 1fr; }
  .cmp__cell:nth-child(1) { grid-column: 1 / -1; }
  .cmp__row--head .cmp__cell:nth-child(1) { display: none; }
  .cmp__row--head { grid-template-columns: 1fr 1fr 1fr; }
}

/* ═══════════════════════════════════════════════
   PREVIEW BANNER
═══════════════════════════════════════════════ */
.preview-banner {
  background: linear-gradient(135deg, #2a2a2a 0%, #0f1614 100%); color: #fff;
  padding: 12px 32px; font-family: var(--mono); font-size: 11px;
  letter-spacing: 0.12em; text-align: center;
}
.preview-banner b { color: var(--accent); font-weight: 700; }

/* ═══════════════════════════════════════════════
   IMAGE OVERLAYS (PATCH-01 〜 06)
═══════════════════════════════════════════════ */
.hero-img { width: 100%; height: auto; max-width: 480px; display: block; margin: 0 auto; }
.problem { position: relative; overflow: hidden; }
.problem__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.45; pointer-events: none; }
.problem::before { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(246,249,246,0.78), rgba(246,249,246,0.9)); z-index: 0; pointer-events: none; }
.problem .sr-container { position: relative; z-index: 1; }
section#solution { position: relative; overflow: hidden; }
.sol__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.35; pointer-events: none; }
section#solution::before { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.92)); z-index: 0; pointer-events: none; }
section#solution .sr-container { position: relative; z-index: 1; }
.sband__img { width: 100%; height: auto; display: block; border-radius: 14px; }
.everyone__deco { position: absolute; top: 50%; transform: translateY(-50%); width: 120px; height: 150px; object-fit: cover; border-radius: 12px; opacity: 0.85; pointer-events: none; box-shadow: 0 8px 24px rgba(15,22,20,0.08); }
.everyone__deco--l { left: 32px; }
.everyone__deco--r { right: 32px; }
.everyone .sr-section__head { position: relative; }
.ecard__photo-img { width: 100%; height: 180px; object-fit: cover; }
.scene { position: relative; }
.scene__photo { position: absolute; top: 50%; transform: translateY(-50%); width: 200px; height: 260px; object-fit: cover; pointer-events: none; z-index: 0; opacity: 0.88; border-radius: 16px; box-shadow: 0 12px 32px rgba(15,22,20,0.12); }
.scene__photo--l { left: -120px; }
.scene__photo--r { right: -100px; }
.scene__body, .scene__dot, .scene__phone { position: relative; z-index: 1; }
.karte__hero-img { width: 100%; height: auto; border-radius: 14px; margin-bottom: 32px; box-shadow: var(--shadow-md); }
.karte__feat { position: relative; }
.karte__feat-photo { position: absolute; top: 16px; right: 16px; width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(15,22,20,0.1); }
@media (max-width: 980px) {
  .problem__bg, .sol__bg { opacity: 0.25; }
  .everyone__deco { display: none; }
  .scene__photo { display: none; }
}


      `}</style>


{/* ═══════════════════════════════════════════════════════
     PREVIEW BANNER
═══════════════════════════════════════════════════════ */}
{/* ═══════════════════════════════════════════════════════
     NAV
═══════════════════════════════════════════════════════ */}
<header className="nav">
  <div className="nav__inner">
    <a className="logo" href="#top">
      <span className="logo__mark">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2C5.7 2 3 4.5 3 7.3c0 1.7.9 3.1 2.4 4L4 14l2.8-1.5c.7.2 1.5.3 2.2.3 3.3 0 6-2.3 6-5.5S12.3 2 9 2z" fill="#fff"/>
        </svg>
      </span>
      <span className="logo__text">
        <span className="logo__name">SalonRink</span>
        <span className="logo__sub">CONCIERGE</span>
      </span>
    </a>
    <nav className="nav__menu">
      <a href="#problem">課題</a>
      <a href="#solution">機能</a>
      <a href="#case">導入事例</a>
      <a href="#plans">料金</a>
      <a href="#compare">比較</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div className="nav__cta">
      <button className="sr-btn sr-btn--primary" style={{padding: '12px 18px'}}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C4.4 1.5 1.5 4 1.5 7c0 1.7.9 3.2 2.4 4.2L3 14l3-1.5c.6.2 1.3.3 2 .3 3.6 0 6.5-2.5 6.5-5.8S11.6 1.5 8 1.5z" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>
        LINEで始める
      </button>
      <button className="sr-btn sr-btn--outline" style={{padding: '12px 18px'}}>資料をダウンロード</button>
    </div>
  </div>
</header>

{/* ═══════════════════════════════════════════════════════
     SECTION 01 — HERO
═══════════════════════════════════════════════════════ */}
<section className="hero" id="top">
  <div className="hero__inner">
    <div className="hero__content">
      <div className="hero__badge">
        <span className="pill">NEW</span>
        <span className="text">LINE公式アカウント拡張ツール · 2026.05 リリース</span>
      </div>
      <h1 className="hero__title">いまのLINE公式アカウントを、<br /><span className="accent">サロンの売上につながる</span><br />業務システムに。</h1>
      <p className="hero__sub">予約・顧客対応・リピート施策まで、LINEの中で完結。<br />お客様との関係を深め、サロンの成長を加速させます。</p>

      <div className="hero__stats">
        <div className="stat">
          <div className="stat__row">
            <svg className="stat__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>
            <span className="stat__label">顧客対応の工数</span>
          </div>
          <div className="stat__value">−30<span style={{fontSize: '18px'}}>分/日</span></div>
          <div className="stat__note">※ シミュレーション値</div>
        </div>
        <div className="stat">
          <div className="stat__row">
            <svg className="stat__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
            <span className="stat__label">リピート率</span>
          </div>
          <div className="stat__value">+25<span style={{fontSize: '18px'}}>%</span></div>
          <div className="stat__note">※ シミュレーション値</div>
        </div>
        <div className="stat">
          <div className="stat__row">
            <svg className="stat__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20h16M6 16V8m5 8V4m5 12v-6m5 6V12" stroke-linecap="round"/></svg>
            <span className="stat__label">客単価アップ</span>
          </div>
          <div className="stat__value">+15<span style={{fontSize: '18px'}}>%</span></div>
          <div className="stat__note">※ シミュレーション値</div>
        </div>
      </div>

      <ul className="hero__bullets">
        <li><span className="sr-check"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg></span>お客様は使い慣れたLINEのまま、サロン体験がもっと便利に</li>
        <li><span className="sr-check"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg></span>1人サロンの店主が、面倒な作業から解放され接客に集中</li>
        <li><span className="sr-check"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg></span>HPB予約も自動取込、ダブルブッキング防止</li>
      </ul>

      <div className="hero__cta">
        <button className="sr-btn sr-btn--primary">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C4.4 1.5 1.5 4 1.5 7c0 1.7.9 3.2 2.4 4.2L3 14l3-1.5c.6.2 1.3.3 2 .3 3.6 0 6.5-2.5 6.5-5.8S11.6 1.5 8 1.5z" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>
          LINEで無料ではじめる
        </button>
        <button className="sr-btn sr-btn--outline">
          1日の動作を見る
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1l7 5-7 5z"/></svg>
        </button>
      </div>

      <div className="hero__trust">
        <span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1.5" stroke-linecap="round"/></svg>5分で連携完了</span>
        <span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 1l5 2v4c0 3-2.2 5.5-5 6.5C4.2 12.5 2 10 2 7V3l5-2z"/></svg>初期費用0円</span>
        <span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 2l7 5-7 5z" stroke-linejoin="round"/></svg>月¥1,980〜 / 14日間無料</span>
      </div>
    </div>
    <div className="hero__media">
      <img className="hero__image" src="/images/hero/hero-right.png" alt="キレイ鶴見店の店内とLINE公式アカウントのトーク画面" width={1672} height={941}/>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 02 — PROBLEM
═══════════════════════════════════════════════════════ */}
<section className="problem sr-section" id="problem">
  <img className="problem__bg" src="/images/problem/problem-bg-salon.png" alt="" aria-hidden="true"/>
  <div className="sr-container">
    <div className="sr-section__head">
      <div className="sr-eyebrow">PROBLEM</div>
      <h2 className="sr-h2">1人サロンだからこそ、<br />こんな"もったいない"<span className="accent">起きていませんか？</span></h2>
      <p className="sr-lead">毎日LINEで予約も連絡も受けているのに、<br />お客様1人ひとりの情報は、トーク履歴の海に埋もれていく…</p>
    </div>

    <div className="problem__grid">
      <article className="pcard">
        <div className="pcard__num">01</div>
        <h3 className="pcard__title">「いつもの田中さま」が、<br /><span className="accent">前回何だったか思い出せない</span></h3>
        <p className="pcard__body">前回の仕上がり、避けたい色、頭皮の状態…<br />1人で全部覚えるのは限界。<br />忙しい時に限って思い出せない。</p>
        <div className="pcard__demo">
          <div className="demo-chat-row">
            <div className="demo-avatar"></div>
            <div style={{flex: '1'}}>
              <div style={{display: 'flex', gap: '8px', alignItems: 'baseline'}}>
                <span className="demo-time">10:32</span>
                <span style={{fontSize: '11px', color: 'var(--ink-2)', fontWeight: '600'}}>田中様　LINE</span>
              </div>
              <div className="demo-msg">「いつもの感じでお願いします！」</div>
            </div>
          </div>
          <div className="demo-flag">▸ 前回は…どんなだっけ？</div>
        </div>
        <div className="pcard__foot">
          <span className="pcard__foot-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6"/></svg></span>
          <span className="pcard__foot-text">接客の質が<br />不安定になる</span>
        </div>
      </article>

      <article className="pcard">
        <div className="pcard__num">02</div>
        <h3 className="pcard__title">予約管理が、<br /><span className="accent">LINEとHPBで二重</span></h3>
        <p className="pcard__body">LINE予約とホットペッパーの両方を毎日確認。<br />ダブルブッキングの不安、<br />2画面の行き来で時間がどんどん消えていく。</p>
        <div className="pcard__demo">
          <ul className="demo-list">
            <li>💬 LINE予約　今日 5件</li>
            <li>📅 HPB予約　今日 3件</li>
            <li>🤔 …合計何時に何人？</li>
          </ul>
          <div className="demo-flag">▸ 二重チェックで時間ロス</div>
        </div>
        <div className="pcard__foot">
          <span className="pcard__foot-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg></span>
          <span className="pcard__foot-text">予約管理だけで<br />1日30分以上の損失</span>
        </div>
      </article>

      <article className="pcard">
        <div className="pcard__num">03</div>
        <h3 className="pcard__title">「そろそろの時期」を、<br /><span className="accent">いつ送るか分からない</span></h3>
        <p className="pcard__body">リピートにつながる連絡を送りたい。<br />でも誰に、いつ、どんな文面で？<br />結局送れないまま、お客様が他店に流れる。</p>
        <div className="pcard__demo">
          <ul className="demo-list">
            <li>👥 LINE友だち　1,284 名</li>
            <li>💬 最終配信　2ヶ月前</li>
          </ul>
          <div className="demo-flag">▸ 機会損失が積み重なる</div>
        </div>
        <div className="pcard__foot">
          <span className="pcard__foot-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20h16M6 16V8m5 8V4m5 12v-6m5 6V12" stroke-linecap="round"/></svg></span>
          <span className="pcard__foot-text">リピート機会の<br />取りこぼし</span>
        </div>
      </article>
    </div>

    <div className="pband">
      <div className="pband__hd">
        <span className="pband__hd-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="9"/><path d="M6 11l3.5 3.5L16 8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span className="pband__hd-text">1人サロンに、<br />こんなお悩みはありませんか？</span>
      </div>
      <ul className="pband__items">
        <li><span className="sr-check"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg></span>LINEの返信に時間がかかり、本来の施術に集中できない</li>
        <li><span className="sr-check"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg></span>リピートにつながる連絡のタイミングがつかめない</li>
        <li><span className="sr-check"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg></span>HPB予約とLINE予約の管理で1日が終わる</li>
        <li><span className="sr-check"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg></span>過去のお客様情報を引き出せず、提案が画一的になる</li>
      </ul>
    </div>

    <div className="problem__arrow">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4v22M8 18l8 10 8-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div className="problem__solve">
      <span className="brand">SalonRink<span className="brand-sub">CONCIERGE</span></span> <span style={{color: 'var(--ink-3)', fontWeight: '400'}}>が、</span><b>その悩みを解決します。</b>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 03 — SOLUTION
═══════════════════════════════════════════════════════ */}
<section className="sr-section" id="solution">
  <img className="sol__bg" src="/images/solution/solution-bg-stylist.png" alt="" aria-hidden="true"/>
  <div className="sr-container">
    <div className="sr-section__head">
      <div className="sr-eyebrow">SOLUTION</div>
      <h2 className="sr-h2">LINEを置き換えない。<br />LINEに、"<span className="accent">乗せる</span>"。</h2>
      <p className="sr-lead">SalonRinkは独立した管理ツールではありません。<br />お使いのLINE公式アカウントに連携する、サロン特化の業務レイヤーです。</p>
    </div>

    <div className="sol__cols">
      <div className="sol__col">
        <div className="sol__col-eyebrow">YOUR LINE OFFICIAL ACCOUNT</div>
        <h3 className="sol__col-title">いつものLINE</h3>
        <p className="sol__col-sub">お客様もあなたも、新しく覚えることはありません。<br />今日と同じ操作のまま、いつものLINEを使えます。</p>

        <div className="sol__feat">
          <div className="feat">
            <div className="feat__icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5h12v6H8l-3 3V5z"/></svg></div>
            <div className="feat__body">
              <div className="feat__row"><span className="feat__tag">UI</span><span className="feat__title">LINEトーク画面</span></div>
              <div className="feat__sub">いつものトークでそのままやりとり。</div>
            </div>
          </div>
          <div className="feat">
            <div className="feat__icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="12" height="11" rx="1.5"/><path d="M3 7h12M6 2v3M12 2v3"/></svg></div>
            <div className="feat__body">
              <div className="feat__row"><span className="feat__tag">予約</span><span className="feat__title">LINE公式の予約・配信</span></div>
              <div className="feat__sub">予約受付・キャンセル・リマインド配信もそのまま。</div>
            </div>
          </div>
          <div className="feat">
            <div className="feat__icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="2.5"/><path d="M2 15c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/></svg></div>
            <div className="feat__body">
              <div className="feat__row"><span className="feat__tag">管理</span><span className="feat__title">既存の友だち一覧</span></div>
              <div className="feat__sub">既存のLINE友だちにそのまま連動。</div>
            </div>
          </div>
          <div className="feat">
            <div className="feat__icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8a4 4 0 018 0v3l1 2H4l1-2V8z"/><path d="M7 15a2 2 0 004 0"/></svg></div>
            <div className="feat__body">
              <div className="feat__row"><span className="feat__tag">通知</span><span className="feat__title">LINE通知 / リッチメニュー</span></div>
              <div className="feat__sub">リッチメニューや通知もそのまま活用。</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sol__arrow-wrap">
        <div className="sol__arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 10h10M11 5l4 5-4 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>

      <div className="sol__col">
        <div className="sol__col-eyebrow">SALONRINK — LAYER</div>
        <h3 className="sol__col-title">裏側の業務レイヤー</h3>
        <p className="sol__col-sub">LINEの会話を読み取り、カルテを自動生成。<br />HPB予約も同じ画面で管理できます。</p>

        <div className="sol__feat">
          <div className="feat">
            <div className="feat__icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 15h12M5 13V8m4 5V5m4 8v-6" stroke-linecap="round"/></svg></div>
            <div className="feat__body">
              <div className="feat__row"><span className="feat__tag">AUTO</span><span className="feat__title">会話 → カルテ 自動構造化</span></div>
              <div className="feat__sub">会話を読み取り、カルテを自動生成。</div>
            </div>
          </div>
          <div className="feat">
            <div className="feat__icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="4.5"/><path d="M11.5 11.5L16 16" stroke-linecap="round"/></svg></div>
            <div className="feat__body">
              <div className="feat__row"><span className="feat__tag">検索</span><span className="feat__title">LINEで「@田中様」と打つだけ</span></div>
              <div className="feat__sub">過去の会話・施術履歴・好みを瞬時に呼び出し。</div>
            </div>
          </div>
          <div className="feat" style={{background: 'var(--accent-soft)', borderRadius: '10px', padding: '12px', margin: '-2px'}}>
            <div className="feat__icon" style={{background: 'var(--accent)', color: '#fff'}}><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="14" height="12" rx="1.5"/><circle cx="6" cy="7" r="1.5"/><path d="M2 12l4-4 4 4 3-3 3 3"/></svg></div>
            <div className="feat__body">
              <div className="feat__row">
                <span className="feat__tag" style={{background: 'var(--accent)', color: '#fff'}}>NEW</span>
                <span className="feat__title">HPB予約も一画面で管理</span>
              </div>
              <div className="feat__sub">ホットペッパー予約を自動取込。ダブルブッキング防止。</div>
            </div>
          </div>
          <div className="feat">
            <div className="feat__icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2h8l3 3v11H4V2z"/><path d="M12 2v3h3M6 8h6M6 11h6M6 14h4"/></svg></div>
            <div className="feat__body">
              <div className="feat__row"><span className="feat__tag">提案</span><span className="feat__title">リピート提案を自動下書き</span></div>
              <div className="feat__sub">「そろそろの時期」のお客様リスト + 配信文の下書きを自動生成。</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="sband">
      <img className="sband__img" src="/images/solution/solution-bottom-panel.png" alt="導入しても、いつものLINEのまま。だから、定着しやすい。1人サロンでもすぐに使い始められる。業務効率が上がり、接客に集中できる。HPB予約も同時に管理。サロンの価値が、自然と積み上がる。"/>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 04 — FOR EVERYONE
═══════════════════════════════════════════════════════ */}
<section className="everyone sr-section" id="everyone">
  <div className="sr-container">
    <div className="sr-section__head">
      <img className="everyone__deco everyone__deco--l" src="/images/for-everyone/header-left-customer.png" alt="" aria-hidden="true"/>
      <img className="everyone__deco everyone__deco--r" src="/images/for-everyone/header-right-staff.png" alt="" aria-hidden="true"/>
      <div className="sr-eyebrow">FOR EVERYONE</div>
      <h2 className="sr-h2">お客様も、これから雇うスタッフも、<br />そして<span className="accent">あなた自身</span>も。</h2>
      <p className="sr-lead">1人サロンのあなたが軸。<br />でも、お客様とこれから雇うスタッフ、それぞれの視点で考えました。</p>
    </div>

    <div className="everyone__visual" style={{position: 'relative', width: '100%', maxWidth: '1240px', margin: '0 auto'}}>
      <img src="/images/for-everyone/for-everyone-full.png" alt="FOR EVERYONE — お客様も、これから雇うスタッフも、そしてあなた自身も。3つの視点から見たSalonRinkの価値（FOR CUSTOMERS / FOR STAFF / FOR YOU）" style={{width: '100%', height: 'auto', display: 'block'}}/>
      <span className="everyone__num everyone__num--customers" style={{position: 'absolute', top: '41%', left: '6%', fontFamily: 'var(--serif)', fontWeight: '700', color: '#06C755', fontSize: 'clamp(20px, 2.6vw, 38px)', lineHeight: '1', pointerEvents: 'none'}}>+25%</span>
      <span className="everyone__num everyone__num--staff" style={{position: 'absolute', top: '41%', left: '38%', fontFamily: 'var(--serif)', fontWeight: '700', color: '#06C755', fontSize: 'clamp(20px, 2.6vw, 38px)', lineHeight: '1', pointerEvents: 'none'}}>−30分/日</span>
      <span className="everyone__num everyone__num--you" style={{position: 'absolute', top: '41%', left: '72%', fontFamily: 'var(--serif)', fontWeight: '700', color: '#06C755', fontSize: 'clamp(20px, 2.6vw, 38px)', lineHeight: '1', pointerEvents: 'none'}}>+15%</span>
    </div>

    <div className="eband">
      <span className="eband__icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 2v2M3.5 5l1.5 1.5M18.5 5L17 6.5M2 11h2M18 11h2M11 5a5 5 0 00-3 9v2h6v-2a5 5 0 00-3-9z"/></svg></span>
      <span className="eband__title">すべては、1人サロンの成長のために。</span>
      <span className="eband__sub">お客様満足・将来のスタッフの働きやすさ・売上向上を、LINEの中でシンプルに実現します。</span>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 05 — IN ACTION
═══════════════════════════════════════════════════════ */}
<section className="sr-section" id="in-action">
  <div className="sr-container">
    <div className="sr-section__head">
      <div className="sr-eyebrow">IN ACTION · 1日の動き</div>
      <h2 className="sr-h2">朝から夜まで、<br />1日のサロン業務が<span className="accent">こう流れる</span>。</h2>
      <p className="sr-lead">予約・接客・記録・提案・分析まで、<br />1日の業務をLINEの中でつないでいきます。</p>
    </div>

    <div className="timeline">
      <div className="scene-pair scene-pair--1-2">
        <img src="/images/in-action/in-action-scene-1-2-full.png" alt="朝から夜まで、1日のサロン業務がこう流れる。Scene 01 / 07:00 朝: 朝のLINEに今日のサマリーが届く。予約件数・予測売上・再来候補がConciergeから自動配信。Scene 02 / 09:30 午前: HPB予約も一画面で確認。ホットペッパーBeautyの予約がLINE予約と同じ画面に自動で並びます。" style={{width: '100%', maxWidth: '1240px', height: 'auto', display: 'block'}}/>
      </div>

      <div className="scene-block scene-block--3-4" style={{position: 'relative', padding: '64px 0', overflow: 'hidden'}}>
        <img src="/images/in-action/in-action-scene-3-4-bg.png" alt="" aria-hidden="true" style={{position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: '0', opacity: '0.35', pointerEvents: 'none', userSelect: 'none'}}/>
        <div style={{position: 'absolute', inset: '0', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.8) 100%)', zIndex: '0', pointerEvents: 'none'}}></div>

        <div className="scene" style={{position: 'relative', zIndex: '1'}}>
          <div className="scene__body scene__body--left">
            <div className="scene__time">13:45 ／ 来店前</div>
            <h3 className="scene__title">名前を打つだけで、<br /><span className="accent">過去のすべてが瞬時に</span>。</h3>
            <p className="scene__desc">LINEのトーク内で「@田中様」と打つだけ。<br />前回履歴・写真・好み・注意事項が、すぐに表示されます。</p>
            <div className="scene__tags">
              <span className="scene__tag">@MENTION</span>
              <span className="scene__tag">AUTO CHART</span>
            </div>
          </div>
          <div className="scene__dot">03</div>
          <div className="scene__phone">
            <div className="scene__phone-screen">
              <div className="scene__phone-head">
                <span className="back">‹</span>
                <div className="avatar">田</div>
                <div style={{flex: '1'}}>
                  <div style={{fontSize: '11px'}}>田中 真由美 さま</div>
                  <div style={{fontSize: '8px', color: 'var(--ink-3)', fontWeight: '400'}}>来店 18回目</div>
                </div>
              </div>
              <div className="scene__phone-body">
                <div className="mini-msg-row mini-msg-row--user">
                  <div className="mini-msg mini-msg--user">@田中様</div>
                  <div className="mini-time">13:45</div>
                </div>
                <div className="mini-msg-row">
                  <div className="mini-msg-avatar" style={{background: 'var(--accent)'}}></div>
                  <div className="mini-card" style={{maxWidth: '88%', padding: '12px'}}>
                    <div className="mini-card__title"><span className="dot">C</span> Concierge カルテ</div>
                    <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                      <div style={{width: '36px', height: '44px', background: 'linear-gradient(135deg, #d4b89c, #a08a6e)', borderRadius: '6px'}}></div>
                      <div style={{flex: '1', fontSize: '9px'}}>
                        <div style={{color: 'var(--ink-3)'}}>前回 3/29</div>
                        <div style={{fontWeight: '600'}}>白髪染め × 自然ブラウン</div>
                      </div>
                    </div>
                    <div className="mini-card__row"><span>避けたい色</span><b>赤味の強い色</b></div>
                    <div className="mini-card__row"><span>頭皮</span><b style={{color: 'var(--coral)'}}>敏感肌</b></div>
                    <div className="mini-card__row"><span>最終 3/29</span><b>3ヶ月半 前</b></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scene scene--reverse" style={{position: 'relative', zIndex: '1'}}>
          <div className="scene__phone">
            <div className="scene__phone-screen">
              <div className="scene__phone-head">
                <span className="back">‹</span>
                <div className="avatar">K</div>
                <div style={{flex: '1'}}>
                  <div style={{fontSize: '11px'}}>キレイ鶴見店</div>
                  <div style={{fontSize: '8px', color: 'var(--ink-3)', fontWeight: '400'}}>配信予約済</div>
                </div>
              </div>
              <div className="scene__phone-body">
                <div className="suggest">
                  <div className="suggest__head">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 9h8M4 7V3m4 4V5"/></svg>
                    Concierge 提案 — 配信文案
                  </div>
                  <div className="suggest__body">
                    田中さま、こんにちは🌸<br />
                    前回のご来店から3ヶ月半が経ちました。<br />
                    そろそろリタッチのタイミングですね。
                  </div>
                </div>
                <div className="suggest" style={{background: 'var(--coral-soft)', borderColor: 'var(--coral)'}}>
                  <div className="suggest__head" style={{color: '#7a2912'}}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6" cy="6" r="4.5"/><path d="M6 4v2.5l1.5 1"/></svg>
                    おすすめタイミング
                  </div>
                  <div className="suggest__body">
                    来週金曜 14:00〜 がご都合よろしいかと
                  </div>
                </div>
                <div style={{background: 'var(--accent)', color: '#fff', textAlign: 'center', padding: '8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '600'}}>
                  確認して配信
                </div>
              </div>
            </div>
          </div>
          <div className="scene__dot">04</div>
          <div className="scene__body scene__body--right">
            <div className="scene__time">18:00 ／ 営業後</div>
            <h3 className="scene__title">「次の連絡、誰に？」を、<br /><span className="accent">自動で提案</span>。</h3>
            <p className="scene__desc">過去の周期と履歴から、再来タイミングをConciergeが予測。<br />配信文の下書きまで自動で用意。確認して送るだけ。</p>
            <div className="scene__tags">
              <span className="scene__tag">AUTO SUGGEST</span>
              <span className="scene__tag">1-TAP SEND</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 06 — AI KARTE
═══════════════════════════════════════════════════════ */}
<section className="karte sr-section" id="karte" style={{position: 'relative', overflow: 'hidden'}}>
  <img src="/images/ai-karte/karte-bg-empty-salon.png" alt="" aria-hidden="true" style={{position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: '0', opacity: '0.45', pointerEvents: 'none', userSelect: 'none'}}/>
  <div style={{position: 'absolute', inset: '0', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0.85) 100%)', zIndex: '0', pointerEvents: 'none'}}></div>
  <div className="sr-container" style={{position: 'relative', zIndex: '1'}}>
    <div className="sr-section__head">
      <div className="sr-eyebrow">CONCIERGE KARTE</div>
      <h2 className="sr-h2">流れる会話を、<br />"<span className="accent">資産</span>"に変える。</h2>
      <p className="sr-lead">LINEのトーク履歴を自動で読み取り、顧客カルテに構造化。<br />サロンの暗黙知が、検索可能なデータベースになります。</p>
    </div>

    <div className="karte__main">
      <div className="karte__left">
        <div className="karte__head-row">
          <span className="karte__head-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4h12v6H6l-4 3V4z"/></svg></span>
          <span className="karte__head-title">LINE トーク履歴</span>
          <span className="karte__head-sub">過去5回分</span>
        </div>

        <div className="chat-scroll">
          <div className="cs-row">
            <div className="cs-avatar"></div>
            <div className="cs-msg">前回の白髪染め、ナチュラルなブラウンですごく気に入りました🌸</div>
            <div className="cs-time">3/29</div>
          </div>
          <div className="cs-row cs-row--user">
            <div className="cs-msg cs-msg--user">ありがとうございます。<br />仕上がりお気に召して何より🌿</div>
            <div className="cs-time">3/29</div>
          </div>
          <div className="cs-row">
            <div className="cs-avatar"></div>
            <div className="cs-msg">あとカラー剤がしみる感じがちょっと強かったので、敏感肌対応のものってありますか？</div>
            <div className="cs-time">3/29</div>
          </div>
          <div className="cs-row cs-row--user">
            <div className="cs-msg cs-msg--user">承知しました🙇<br />次回からゼロアルカリの低刺激タイプに変更しますね</div>
            <div className="cs-time">3/29</div>
          </div>
          <div className="cs-row">
            <div className="cs-avatar"></div>
            <div className="cs-msg">ちなみに、もう一段階暗いトーンも気になっていて...</div>
          </div>
        </div>

        <div className="karte__steps">
          <div className="karte__steps-item"><span className="karte__steps-num">1</span><span>抽出</span></div>
          <div className="karte__steps-item"><span className="karte__steps-num">2</span><span>整理</span></div>
          <div className="karte__steps-item"><span className="karte__steps-num">3</span><span>分類</span></div>
          <div className="karte__steps-item"><span className="karte__steps-num">4</span><span>構造化</span></div>
        </div>
      </div>

      <div className="karte__arrow">
        <div className="karte__arrow-pill">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 5l4 5-4 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>AUTO</span>
        </div>
      </div>

      <div className="karte__right">
        <div className="kr__top">
          <div className="kr__photo"></div>
          <div className="kr__top-body">
            <div className="kr__name">田中 真由美</div>
            <div className="kr__meta">CUSTOMER #2841 · 来店 18 回</div>
            <div className="kr__chips">
              <span className="kr__chip kr__chip--accent">常連</span>
              <span className="kr__chip kr__chip--coral">敏感肌</span>
              <span className="kr__chip kr__chip--neutral">3ヶ月周期</span>
            </div>
          </div>
        </div>

        <div className="kr__section">
          <div className="kr__section-h">
            <span className="kr__label">前回 / 3.29</span>
            <span className="kr__src">▸ 自動抽出</span>
          </div>
          <div className="kr__field-row"><span>スタイル</span><span>白髪染め × ナチュラルブラウン</span></div>
          <div className="kr__field-row"><span>使用カラー剤</span><span>ゼロアルカリ 7N</span></div>
          <div className="kr__field-row"><span>仕上がり評価</span><span>★★★★★（気に入りました）</span></div>
        </div>

        <div className="kr__section">
          <div className="kr__section-h">
            <span className="kr__label">好み / 注意事項</span>
            <span className="kr__src">▸ 会話から抽出</span>
          </div>
          <div className="kr__field-row"><span>避けたい色</span><span>赤味の強い色</span></div>
          <div className="kr__field-row"><span>頭皮</span><span>敏感肌 → 低刺激カラー必須</span></div>
          <div className="kr__field-row"><span>次回希望</span><span>もう一段階暗いトーン</span></div>
        </div>

        <div className="kr__section" style={{borderTop: '1px dashed var(--accent)'}}>
          <div className="kr__note">
            <span className="kr__note-icon"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4v3M5 4v3M8 4v3M2 7h6"/></svg></span>
            <span><b>次回提案：</b>同系統 × 0.5トーンダウン。低刺激タイプ継続を推奨。</span>
          </div>
        </div>
      </div>
    </div>

    <div className="karte__feats">
      <div className="karte__feat">
        <div className="karte__feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="6"/><path d="M13 13l5 5" stroke-linecap="round"/></svg></div>
        <div className="karte__feat-title">名前1つで全部わかる</div>
        <div className="karte__feat-sub">LINEで「@◯◯様」と打つだけ。過去の会話・施術・写真を瞬時に呼び出し。</div>
      </div>
      <div className="karte__feat">
        <div className="karte__feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h11v9H7l-4 3V4z"/><path d="M6 7h5M6 10h3"/></svg></div>
        <div className="karte__feat-title">会話 → カルテ 自動化</div>
        <div className="karte__feat-sub">写真・キーワード・好みを自動抽出。手入力ゼロでカルテが育つ。</div>
      </div>
      <div className="karte__feat">
        <div className="karte__feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4 4l2 2M14 14l2 2M4 16l2-2M14 6l2-2"/></svg></div>
        <div className="karte__feat-title">引き継ぎゼロ</div>
        <div className="karte__feat-sub">将来スタッフを雇った時も、新人スタッフでも、同じ品質で接客できる。</div>
      </div>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 07 — NUMBERS
═══════════════════════════════════════════════════════ */}
<section className="sr-section" id="numbers">
  <div className="sr-container">
    <div className="sr-section__head">
      <div className="sr-eyebrow">EXPECTED EFFECTS · 期待できる効果</div>
      <h2 className="sr-h2">SalonRink Concierge で、<br /><span className="accent">期待できる効果</span>。</h2>
      <p className="sr-lead">具体的な数値は、あなたのサロンと運用次第。<br />でも、確かに変わる3つの本質的な価値を、お約束します。</p>
    </div>

    <div className="numbers__grid">
      <div className="nc">
        <div className="nc__eyebrow">01 / リピート率</div>
        <div className="nc__title">「そろそろの時期」を<br />逃さない</div>
        <div className="nc__stat">
          <span className="nc__sign">+</span><span className="nc__num">25</span><span className="nc__unit">%</span>
        </div>
        <p className="nc__caption">最適タイミングでの再来店リマインドと、過去履歴に基づくパーソナライズ提案で、来店周期が安定します。</p>
        <div className="nc__arrow-chart">
          <div className="nc__line-up">
            <svg viewBox="0 0 200 24" fill="none" preserveAspectRatio="none">
              <path d="M0 22 Q60 22 90 14 T200 2" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="0" cy="22" r="3" fill="var(--accent)" opacity="0.4"/>
              <circle cx="200" cy="2" r="4" fill="var(--accent)"/>
            </svg>
          </div>
          <div style={{position: 'absolute', left: '14px', bottom: '0', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--ink-3)'}}>導入前</div>
          <div style={{position: 'absolute', right: '14px', bottom: '0', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--accent)', fontWeight: '600'}}>導入後</div>
        </div>
      </div>

      <div className="nc nc--featured">
        <div className="nc__eyebrow">02 / 客単価</div>
        <div className="nc__title">提案力UPで<br />客単価が向上</div>
        <div className="nc__stat">
          <span className="nc__sign">+</span><span className="nc__num">15</span><span className="nc__unit">%</span>
        </div>
        <p className="nc__caption">過去履歴と好みに基づく提案で、追加メニュー・トリートメントの選択率が上昇します。</p>
        <div className="nc__chart">
          <div className="nc__chart-head">
            <span>導入前 ¥7,000</span>
            <span style={{color: 'var(--accent)', fontWeight: '600'}}>¥8,050 / +1,050</span>
          </div>
          <div className="nc__bars">
            <div className="nc__bar" style={{height: '40%'}}></div>
            <div className="nc__bar" style={{height: '50%'}}></div>
            <div className="nc__bar" style={{height: '60%'}}></div>
            <div className="nc__bar nc__bar--mid" style={{height: '70%'}}></div>
            <div className="nc__bar nc__bar--hi" style={{height: '85%'}}></div>
            <div className="nc__bar nc__bar--hi" style={{height: '92%'}}></div>
            <div className="nc__bar nc__bar--hi" style={{height: '100%'}}></div>
          </div>
        </div>
      </div>

      <div className="nc">
        <div className="nc__eyebrow">03 / 業務工数</div>
        <div className="nc__title">確認・引継ぎ時間を<br />削減</div>
        <div className="nc__stat">
          <span className="nc__sign nc__sign--minus">−</span><span className="nc__num nc__num--coral">30</span><span className="nc__unit nc__unit--coral">分/日</span>
        </div>
        <p className="nc__caption">カルテ検索・HPB予約取込・配信文作成のすべてを自動化。接客と提案に時間が使えます。</p>
        <div className="nc__time">
          <span className="nc__time-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="6.5"/><path d="M9 5v4l3 2" stroke-linecap="round"/></svg></span>
          <div className="nc__time-body">1日あたり <b>30分</b> の<br />業務時間を削減</div>
        </div>
      </div>
    </div>

    <div className="numbers__foot">
      ※ 上記数値は <b>キレイ鶴見店(2026年4月導入)</b> の運用状況に基づく <b>社内シミュレーション値</b> であり、実測値ではありません。効果は店舗・業態・運用状況により異なります。
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 08 — CASE 01 (キレイ鶴見店)
═══════════════════════════════════════════════════════ */}
<section className="case sr-section" id="case">
  <div className="sr-container">
    <div className="sr-section__head">
      <div className="sr-eyebrow">CASE 01 · 導入店舗の声</div>
      <h2 className="sr-h2">「LINEだけで、<br />サロン業務が<span className="accent">ここまで変わる</span>」</h2>
    </div>

    <article className="case__card">
      <div className="case__top">
        <div className="case__photo" style={{position: 'relative', overflow: 'hidden'}}>
          <img className="case__photo-img" src="/images/case/kirei-tsurumi-real.jpg" alt="キレイ鶴見店の店内 — ヴィンテージ調の鏡台と化粧道具が並ぶ落ち着いた1人サロン" style={{position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: '0'}}/>
          <div style={{position: 'absolute', inset: '0', background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.45) 70%, rgba(0, 0, 0, 0.65) 100%)', zIndex: '1', pointerEvents: 'none'}}></div>
          <div className="case__photo-top" style={{position: 'relative', zIndex: '2'}}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="3"/></svg>
            REAL PHOTO · 実店舗
          </div>
          <div className="case__photo-bottom" style={{position: 'relative', zIndex: '2'}}>
            <div className="case__photo-name">キレイ鶴見店</div>
            <div className="case__photo-meta">WHITE HAIR COLOR SALON · 1人サロン</div>
            <div className="case__photo-meta-links">
              HPB · H000501100<br />
              <a href="https://instagram.com/kirei.tsurumi" target="_blank">@kirei.tsurumi</a>
            </div>
            <div className="case__photo-tags">
              <span className="case__photo-tag">白髪染め特化</span>
              <span className="case__photo-tag">1人サロン</span>
              <span className="case__photo-tag">横浜・鶴見</span>
            </div>
          </div>
        </div>

        <div className="case__top-body">
          <div className="case__quote-mark">"</div>
          <p className="case__quote">
            LINEで連絡するタイミングが分かるようになって、<br />
            自然に<span className="accent">リピートにつながる流れ</span>ができてきました。<br />
            「いつものお客様」が、もっと深いお付き合いに。
          </p>
          <div className="case__quote-by">— キレイ鶴見店 オーナー</div>

          <div className="case__before-after">
            <div className="ba-col">
              <div className="ba-label">BEFORE</div>
              <div className="ba-text">紙のカルテと記憶頼り。「そろそろ連絡」のタイミングを逃すことが多かった。</div>
            </div>
            <div className="ba-arrow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 5l4 5-4 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div className="ba-col ba-col--after">
              <div className="ba-label">AFTER</div>
              <div className="ba-text">LINEで「@お客様名」と打つだけで過去情報が瞬時に。配信文も自動で下書き。</div>
            </div>
          </div>
        </div>
      </div>

      <div className="case__metrics">
        <div className="case__metric">
          <div className="case__metric-label">リピート率</div>
          <div className="case__metric-stat">
            <span className="case__metric-num">+25</span><span className="case__metric-unit">%</span>
          </div>
          <div className="case__metric-sub">シミュレーション</div>
        </div>
        <div className="case__metric">
          <div className="case__metric-label">客単価</div>
          <div className="case__metric-stat">
            <span className="case__metric-num">+15</span><span className="case__metric-unit">%</span>
          </div>
          <div className="case__metric-sub">シミュレーション</div>
        </div>
        <div className="case__metric">
          <div className="case__metric-label">業務時間</div>
          <div className="case__metric-stat">
            <span className="case__metric-num case__metric-num--coral">−30</span><span className="case__metric-unit">分/日</span>
          </div>
          <div className="case__metric-sub">シミュレーション</div>
        </div>
        <div className="case__metric">
          <div className="case__metric-label">月商変化</div>
          <div className="case__metric-stat">
            <span className="case__metric-num">+12</span><span className="case__metric-unit">%</span>
          </div>
          <div className="case__metric-sub">シミュレーション</div>
        </div>
      </div>

      <div className="case__sim-note">
        <b>※ シミュレーション値の根拠:</b> 上記数値はキレイ鶴見店(2026年4月導入)の運用状況に基づく社内シミュレーション値であり、実測値ではありません。<br />効果は店舗・業態・運用状況により異なります。
      </div>

      <div className="case__timeline">
        <div className="case__timeline-title">導入からのタイムライン</div>
        <div className="case__tl">
          <div className="case__tl-item done">
            <div className="case__tl-time">DAY 1 · 4/1</div>
            <div className="case__tl-title">5分でLINE連携</div>
            <div className="case__tl-sub">LINE公式と連携。当日から運用開始。</div>
          </div>
          <div className="case__tl-item done">
            <div className="case__tl-time">WEEK 2 · 4/14</div>
            <div className="case__tl-title">過去履歴がカルテ化</div>
            <div className="case__tl-sub">過去のLINEトークから、お客様情報を自動構造化。</div>
          </div>
          <div className="case__tl-item done">
            <div className="case__tl-time">現在 · 5/25</div>
            <div className="case__tl-title">日常運用に定着</div>
            <div className="case__tl-sub">リピート提案・カルテ自動化が日常運用に定着。</div>
          </div>
          <div className="case__tl-item">
            <div className="case__tl-time">予定 · 6/1〜</div>
            <div className="case__tl-title">リピート提案 本格運用</div>
            <div className="case__tl-sub">最適タイミングでの再来店案内を本格運用予定。</div>
          </div>
        </div>
      </div>
    </article>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 09 — ONBOARDING
═══════════════════════════════════════════════════════ */}
<section className="sr-section sr-section--tint" id="onboarding">
  <div className="sr-container">
    <div className="sr-section__head">
      <div className="sr-eyebrow">ONBOARDING · 導入の流れ</div>
      <h2 className="sr-h2">最短<span className="accent">5分</span>で、<br />サロンが Concierge 化。</h2>
      <p className="sr-lead">複雑な設定は不要。LINE公式アカウントをお持ちなら、<br />つないで終わり。すぐに活用がはじまります。</p>
    </div>

    <div className="onb__steps">
      <div className="ostep">
        <div className="ostep__num">1</div>
        <div className="ostep__tag">STEP 01 · 30秒</div>
        <h3 className="ostep__title">無料アカウント<br />を作成</h3>
        <p className="ostep__sub">LINE公式アカウントでログイン。<br />追加情報の入力なしで始められます。</p>
        <div className="ostep__visual">
          <span className="ostep__visual-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 1.5C5.4 1.5 2.5 4 2.5 7c0 1.7.9 3.2 2.4 4.2L4 14l3-1.5c.6.2 1.3.3 2 .3 3.6 0 6.5-2.5 6.5-5.8S12.6 1.5 9 1.5z"/></svg></span>
          <span className="ostep__visual-text">LINEで<b>ログイン</b><br />パスワード設定なし</span>
        </div>
      </div>

      <div className="ostep">
        <div className="ostep__num">2</div>
        <div className="ostep__tag">STEP 02 · 2分</div>
        <h3 className="ostep__title">LINE公式と<br />連携</h3>
        <p className="ostep__sub">タップ1つでLINEと接続。<br />サロン情報を簡単に登録。</p>
        <div className="ostep__visual">
          <span className="ostep__visual-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 9c0-2 1.6-3.5 3.5-3.5S12 7 12 9M5 13l-2 2M13 5l2-2"/><circle cx="8.5" cy="9" r="1.5"/></svg></span>
          <span className="ostep__visual-text">公式アカウント<br /><b>3クリック</b>で連携</span>
        </div>
        <span className="ostep__hpb-pill">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-6"/></svg>
          HPB連携も同時に可能
        </span>
      </div>

      <div className="ostep">
        <div className="ostep__num">3</div>
        <div className="ostep__tag">STEP 03 · 約2分</div>
        <h3 className="ostep__title">過去履歴を<br />自動でカルテ化</h3>
        <p className="ostep__sub">過去のLINEトークから、お客様情報・好み・履歴を自動抽出。</p>
        <div className="ostep__visual">
          <span className="ostep__visual-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h11v9H7l-4 3V4z"/><path d="M6 7h5M6 10h3"/></svg></span>
          <span className="ostep__visual-text">過去 <b>6ヶ月</b>を<br />自動構造化</span>
        </div>
      </div>

      <div className="ostep">
        <div className="ostep__num">4</div>
        <div className="ostep__tag">STEP 04 · すぐに</div>
        <h3 className="ostep__title">すぐに<br />運用スタート</h3>
        <p className="ostep__sub">LINEのトーク画面から、Conciergeが動き始めます。<br />追加アプリ不要。</p>
        <div className="ostep__visual">
          <span className="ostep__visual-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l4 4 8-9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span className="ostep__visual-text">本日から<br /><b>すぐ利用可能</b></span>
        </div>
      </div>
    </div>

    <div className="onb__cta">
      <div className="onb__cta-head">
        <span className="onb__cta-icon"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="15" cy="15" r="11"/><path d="M10 15l3.5 3.5L20 12" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <div className="onb__cta-text">
          <h3>14日間、無料でお試しいただけます。</h3>
          <p>月¥1,980〜 / 初期費用0円 / クレジットカード登録不要 / 解約料0円 / いつでもキャンセル可</p>
        </div>
      </div>
      <div className="onb__cta-btns">
        <button className="sr-btn sr-btn--primary">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C4.4 1.5 1.5 4 1.5 7c0 1.7.9 3.2 2.4 4.2L3 14l3-1.5c.6.2 1.3.3 2 .3 3.6 0 6.5-2.5 6.5-5.8S11.6 1.5 8 1.5z" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>
          LINEで無料ではじめる
        </button>
        <button className="sr-btn sr-btn--outline">資料をダウンロード</button>
      </div>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     SECTION 10 — COMPARE
═══════════════════════════════════════════════════════ */}
<section className="compare sr-section" id="compare">
  <div className="sr-container">
    <div className="sr-section__head">
      <div className="sr-eyebrow">COMPARE · 他サービスとの違い</div>
      <h2 className="sr-h2">「LINEを置き換える」ではなく、<br />「LINEを<span className="accent">活かしきる</span>」。</h2>
      <p className="sr-lead">1人サロンが選ぶべきは、どのタイプ?<br />SalonRink Concierge の立ち位置をご紹介します。</p>
    </div>

    <div className="cmp__table">
      <div className="cmp__row cmp__row--head">
        <div className="cmp__cell"></div>
        <div className="cmp__cell cmp__val">
          <div className="cmp__head-cell">
            <span className="cmp__head-mark"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="16" height="16" rx="2"/><path d="M3 8h16M7 3v3M15 3v3"/></svg></span>
            <span className="cmp__head-eyebrow">TYPE A</span>
            <span className="cmp__head-name">予約管理SaaS型</span>
          </div>
        </div>
        <div className="cmp__cell cmp__val cmp__val--featured">
          <div className="cmp__head-cell cmp__head-cell--featured">
            <span className="cmp__head-mark"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2C7.5 2 4.5 4.5 4.5 7.8c0 1.8 1 3.4 2.5 4.5L6 16l3.2-1.7c.7.2 1.5.3 2.3.3 3.6 0 6.5-2.5 6.5-5.8S14.6 2 11 2z" fill="#fff"/></svg></span>
            <span className="cmp__head-eyebrow">SALONRINK</span>
            <span className="cmp__head-name">Concierge</span>
            <span className="cmp__head-pill">RECOMMENDED</span>
          </div>
        </div>
        <div className="cmp__cell cmp__val">
          <div className="cmp__head-cell">
            <span className="cmp__head-mark"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="16" height="13" rx="2"/><path d="M3 9h16M7 13h2M7 16h5"/></svg></span>
            <span className="cmp__head-eyebrow">TYPE B</span>
            <span className="cmp__head-name">カルテ専業型</span>
          </div>
        </div>
      </div>

      <div className="cmp__row">
        <div className="cmp__cell"><span className="cmp__label">お客様との接点<span className="cmp__label-sub">普段の連絡手段</span></span></div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--mid">!</span>専用アプリ</div>
        <div className="cmp__cell cmp__val cmp__val--featured"><span className="cmp__icon cmp__icon--yes">✓</span>LINEのまま</div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--mid">!</span>アプリDL必要</div>
      </div>

      <div className="cmp__row">
        <div className="cmp__cell"><span className="cmp__label">導入の手間<span className="cmp__label-sub">スタッフ研修・設定時間</span></span></div>
        <div className="cmp__cell cmp__val"><small>2週間</small></div>
        <div className="cmp__cell cmp__val cmp__val--featured"><span style={{fontFamily: 'var(--serif)', fontWeight: '700', color: 'var(--accent)', fontSize: '18px'}}>5分</span></div>
        <div className="cmp__cell cmp__val"><small>3日</small></div>
      </div>

      <div className="cmp__row">
        <div className="cmp__cell"><span className="cmp__label">HPB予約取込<span className="cmp__label-sub">ダブルブッキング防止</span></span></div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--no">−</span>未対応</div>
        <div className="cmp__cell cmp__val cmp__val--featured"><span className="cmp__icon cmp__icon--yes">✓</span>自動取込</div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--no">−</span>未対応</div>
      </div>

      <div className="cmp__row">
        <div className="cmp__cell"><span className="cmp__label">カルテ作成<span className="cmp__label-sub">入力負担 / 自動化</span></span></div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--no">−</span>手入力</div>
        <div className="cmp__cell cmp__val cmp__val--featured"><span className="cmp__icon cmp__icon--yes">✓</span>自動作成</div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--mid">!</span>テンプレ入力</div>
      </div>

      <div className="cmp__row">
        <div className="cmp__cell"><span className="cmp__label">リピート施策<span className="cmp__label-sub">タイミング / 文面</span></span></div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--no">−</span>手動配信</div>
        <div className="cmp__cell cmp__val cmp__val--featured"><span className="cmp__icon cmp__icon--yes">✓</span>自動下書き + 配信</div>
        <div className="cmp__cell cmp__val"><span className="cmp__icon cmp__icon--mid">!</span>連携なし</div>
      </div>

      <div className="cmp__row">
        <div className="cmp__cell"><span className="cmp__label">月額費用<span className="cmp__label-sub">標準プラン目安</span></span></div>
        <div className="cmp__cell cmp__val"><small>¥9,800〜</small></div>
        <div className="cmp__cell cmp__val cmp__val--featured">
          <span style={{fontFamily: 'var(--serif)', fontWeight: '700', color: 'var(--accent)', fontSize: '18px'}}>¥1,980〜</span>
          <small style={{display: 'block', marginTop: '4px'}}>14日間無料</small>
        </div>
        <div className="cmp__cell cmp__val"><small>¥3,300〜</small></div>
      </div>
    </div>

    <p className="cmp__disclaimer">
      ※ 他サービス A / B は、予約管理SaaS・カルテ専業SaaSの一般的な水準を参考に記載しています。特定の競合サービスを指すものではありません。各サービスの料金・機能は変更される場合があります。
    </p>

    <div className="cmp__cta">
      <h3>あなたのサロンに、ぴったり合うか<br />14日間、無料でお試しください。</h3>
      <p>クレジットカード登録不要 / 解約料0円 / いつでもキャンセル可</p>
      <div className="cmp__cta-row">
        <button className="sr-btn sr-btn--primary" style={{padding: '16px 28px', fontSize: '14px'}}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C4.4 1.5 1.5 4 1.5 7c0 1.7.9 3.2 2.4 4.2L3 14l3-1.5c.6.2 1.3.3 2 .3 3.6 0 6.5-2.5 6.5-5.8S11.6 1.5 8 1.5z" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>
          LINEで無料ではじめる
        </button>
        <button className="sr-btn sr-btn--outline" style={{padding: '16px 28px', fontSize: '14px'}}>資料をダウンロード</button>
      </div>
    </div>
  </div>
</section>

{/* ═══════════════════════════════════════════════════════
     PREVIEW FOOTER
═══════════════════════════════════════════════════════ */}

    </>
  );
}