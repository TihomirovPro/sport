<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const features = [
  {
    icon: '🏋️',
    title: 'Дневник тренировок',
    desc: 'Записывайте подходы, повторения, вес и усилие (RPE). Полная история всегда под рукой.',
  },
  {
    icon: '📈',
    title: 'Умная прогрессия',
    desc: 'Алгоритм анализирует результаты и рекомендует оптимальную нагрузку на каждую тренировку.',
  },
  {
    icon: '⚖️',
    title: 'Контроль веса',
    desc: 'Отслеживайте динамику веса тела с наглядными графиками по неделям и месяцам.',
  },
  {
    icon: '📏',
    title: 'Замеры тела',
    desc: 'Фиксируйте обхваты и другие параметры, чтобы видеть реальные изменения формы.',
  },
  {
    icon: '📡',
    title: 'Работает офлайн',
    desc: 'Записывайте тренировки без интернета — данные автоматически синхронизируются при подключении.',
  },
  {
    icon: '🌙',
    title: 'Тёмная тема',
    desc: 'Удобна при любом освещении. Автоматически подстраивается под системные настройки.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Добавьте упражнение',
    desc: 'Создайте упражнение с нужными параметрами: название, тип нагрузки, цвет и иконку.',
  },
  {
    num: '02',
    title: 'Записывайте тренировки',
    desc: 'После каждой сессии вносите подходы, повторения, вес и субъективную оценку усилия.',
  },
  {
    num: '03',
    title: 'Следуйте рекомендациям',
    desc: 'Алгоритм подберёт оптимальную нагрузку — просто нажмите «Применить» перед тренировкой.',
  },
]
</script>

<template lang="pug">
.landing

  //- ─── NAVIGATION ────────────────────────────────────────────────────────────
  nav.l-nav
    .l-nav__inner
      .l-logo
        .l-logo__icon ⚡
        span.l-logo__text Power Progress
      a.l-nav__link(href="/login") Войти →

  //- ─── HERO ──────────────────────────────────────────────────────────────────
  section.l-hero
    .l-orb.l-orb--1
    .l-orb.l-orb--2
    .l-orb.l-orb--3
    .l-hero__content
      .l-badge ✦ Приложение для серьёзных тренировок
      h1.l-hero__title
        | Power
        br
        span.l-hero__accent Progress
      p.l-hero__sub
        | Умный дневник тренировок, который помогает
        br
        | расти быстрее и тренироваться эффективнее.
      .l-hero__actions
        a.l-btn.l-btn--primary(href="/login") Начать бесплатно
        a.l-btn.l-btn--ghost(href="#features") Узнать больше ↓
      .l-hero__stats
        .l-stat
          .l-stat__num 6+
          .l-stat__label Типов нагрузки
        .l-stat__sep
        .l-stat
          .l-stat__num PWA
          .l-stat__label Офлайн-режим
        .l-stat__sep
        .l-stat
          .l-stat__num ∞
          .l-stat__label Тренировок

  //- ─── FEATURES ──────────────────────────────────────────────────────────────
  section#features.l-features
    .l-section
      .l-section__label Возможности
      h2.l-section__title Всё для роста результатов
      p.l-section__sub
        | Полный набор инструментов — от дневника до умных рекомендаций.
      .l-grid
        .l-card(v-for="f in features" :key="f.title")
          .l-card__icon {{ f.icon }}
          h3.l-card__title {{ f.title }}
          p.l-card__desc {{ f.desc }}

  //- ─── HOW IT WORKS ──────────────────────────────────────────────────────────
  section.l-steps-section
    .l-section
      .l-section__label Как это работает
      h2.l-section__title Три простых шага
      .l-steps
        .l-step(v-for="s in steps" :key="s.num")
          .l-step__num {{ s.num }}
          h3.l-step__title {{ s.title }}
          p.l-step__desc {{ s.desc }}

  //- ─── PROGRESSION SPOTLIGHT ─────────────────────────────────────────────────
  section.l-prog
    .l-orb.l-orb--p1
    .l-orb.l-orb--p2
    .l-prog__inner
      .l-prog__label ✦ Умная прогрессия
      h2.l-prog__title Больше не нужно гадать, какой вес взять
      p.l-prog__desc
        | Power Progress анализирует вашу историю, RPE и динамику повторений.
        | Алгоритм сам определяет — когда добавить нагрузку, когда держать вес
        | и когда снизить, чтобы вы росли без перетренированности.
      .l-prog__chips
        .l-chip
          .l-chip__dot
          span Анализ по профилям нагрузки
        .l-chip
          .l-chip__dot
          span Учёт RPE и интервалов отдыха
        .l-chip
          .l-chip__dot
          span Адаптивный шаг прогрессии
        .l-chip
          .l-chip__dot
          span Уровень уверенности рекомендации

  //- ─── CTA ───────────────────────────────────────────────────────────────────
  section.l-cta
    .l-orb.l-orb--c1
    .l-orb.l-orb--c2
    .l-cta__content
      h2.l-cta__title Начни тренироваться умнее
      p.l-cta__sub Бесплатно. Офлайн. Без подписок.
      a.l-btn.l-btn--primary.l-btn--lg(href="/login") Войти через Google

  //- ─── FOOTER ────────────────────────────────────────────────────────────────
  footer.l-footer
    .l-footer__inner
      .l-logo
        .l-logo__icon ⚡
        span.l-logo__text Power Progress
      p.l-footer__note Дневник тренировок для серьёзных атлетов
</template>

<style scoped>
/* ─── BASE ──────────────────────────────────────────────────────────────────── */
.landing {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  background: #fff;
  color: #0f172a;
}

/* ─── NAV ───────────────────────────────────────────────────────────────────── */
.l-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.l-nav__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 3.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.l-nav__link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}
.l-nav__link:hover { color: #fff; }

/* ─── LOGO ──────────────────────────────────────────────────────────────────── */
.l-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.l-logo__icon {
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.l-logo__text {
  font-weight: 700;
  font-size: 1.0625rem;
  color: #fff;
}

/* ─── HERO ──────────────────────────────────────────────────────────────────── */
.l-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  overflow: hidden;
  padding: 8rem 1.5rem 5rem;
}
.l-hero__content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 680px;
}

/* floating orbs */
.l-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: l-float 10s ease-in-out infinite;
}
.l-orb--1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(59,130,246,0.38) 0%, transparent 70%);
  top: -12%; left: -6%;
  animation-delay: 0s;
}
.l-orb--2 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(99,102,241,0.32) 0%, transparent 70%);
  bottom: 0; right: -4%;
  animation-delay: -4s;
}
.l-orb--3 {
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%);
  top: 55%; left: 55%;
  animation-delay: -7s;
}
@keyframes l-float {
  0%, 100% { transform: translateY(0) scale(1); }
  40%       { transform: translateY(-22px) scale(1.04); }
  70%       { transform: translateY(12px) scale(0.97); }
}

.l-badge {
  display: inline-block;
  background: rgba(59,130,246,0.15);
  border: 1px solid rgba(59,130,246,0.35);
  color: #93c5fd;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.3rem 0.875rem;
  border-radius: 100px;
  margin-bottom: 1.5rem;
}
.l-hero__title {
  font-size: clamp(3rem, 9vw, 5.75rem);
  font-weight: 800;
  line-height: 1.04;
  color: #fff;
  margin: 0;
  letter-spacing: -0.025em;
}
.l-hero__accent {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 55%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.l-hero__sub {
  font-size: 1.125rem;
  color: rgba(255,255,255,0.6);
  margin: 1.25rem auto 0;
  max-width: 480px;
  line-height: 1.7;
}
.l-hero__actions {
  display: flex;
  gap: 0.875rem;
  justify-content: center;
  margin-top: 2.5rem;
  flex-wrap: wrap;
}
.l-hero__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 3.5rem;
}
.l-stat { text-align: center; }
.l-stat__num {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.l-stat__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.45);
  margin-top: 0.25rem;
}
.l-stat__sep {
  width: 1px;
  height: 30px;
  background: rgba(255,255,255,0.12);
}

/* ─── BUTTONS ───────────────────────────────────────────────────────────────── */
.l-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.75rem 1.625rem;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}
.l-btn--primary {
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 0 28px rgba(59,130,246,0.45);
}
.l-btn--primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 0 40px rgba(59,130,246,0.65);
}
.l-btn--ghost {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.14);
}
.l-btn--ghost:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}
.l-btn--lg {
  font-size: 1.0625rem;
  padding: 0.875rem 2.25rem;
  border-radius: 14px;
}

/* ─── SHARED SECTION ────────────────────────────────────────────────────────── */
.l-section {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}
.l-section__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3b82f6;
  margin-bottom: 0.6rem;
}
.l-section__title {
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}
.l-section__sub {
  font-size: 1rem;
  margin: 0.75rem auto 0;
  max-width: 460px;
  color: #64748b;
}

/* ─── FEATURES ──────────────────────────────────────────────────────────────── */
.l-features {
  padding: 6.5rem 1.5rem;
  background: #fff;
}
.l-features .l-section__title { color: #0f172a; }

.l-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.125rem;
  margin-top: 3.5rem;
  text-align: left;
}
@media (max-width: 860px) { .l-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .l-grid { grid-template-columns: 1fr; } }

.l-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.l-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(15,23,42,0.1);
}
.l-card__icon {
  font-size: 1.875rem;
  display: block;
  margin-bottom: 0.875rem;
}
.l-card__title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
  color: #0f172a;
}
.l-card__desc {
  font-size: 0.8375rem;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
}

/* ─── HOW IT WORKS ──────────────────────────────────────────────────────────── */
.l-steps-section {
  padding: 6.5rem 1.5rem;
  background: #f1f5f9;
}
.l-steps-section .l-section__title { color: #0f172a; }

.l-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3.5rem;
  text-align: left;
}
@media (max-width: 680px) { .l-steps { grid-template-columns: 1fr; } }

.l-step__num {
  font-size: 3.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
}
.l-step__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem;
}
.l-step__desc {
  font-size: 0.8375rem;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
}

/* ─── PROGRESSION ───────────────────────────────────────────────────────────── */
.l-prog {
  position: relative;
  padding: 6.5rem 1.5rem;
  background: #0f172a;
  overflow: hidden;
}
.l-orb--p1 {
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%);
  top: -20%; left: -8%;
  animation-delay: -1s;
}
.l-orb--p2 {
  width: 360px; height: 360px;
  background: radial-gradient(circle, rgba(99,102,241,0.24) 0%, transparent 70%);
  bottom: -15%; right: -5%;
  animation-delay: -5s;
}
.l-prog__inner {
  position: relative;
  z-index: 2;
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}
.l-prog__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #60a5fa;
  margin-bottom: 0.875rem;
}
.l-prog__title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  margin: 0 0 1.25rem;
  line-height: 1.2;
}
.l-prog__desc {
  font-size: 1rem;
  color: rgba(255,255,255,0.58);
  line-height: 1.8;
  margin: 0 0 2.25rem;
}
.l-prog__chips {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;
  text-align: left;
}
@media (max-width: 480px) { .l-prog__chips { grid-template-columns: 1fr; } }

.l-chip {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.22);
  border-radius: 10px;
  font-size: 0.8375rem;
  color: rgba(255,255,255,0.8);
}
.l-chip__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
}

/* ─── CTA ───────────────────────────────────────────────────────────────────── */
.l-cta {
  position: relative;
  padding: 7rem 1.5rem;
  background: #0f172a;
  overflow: hidden;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.l-orb--c1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%);
  top: -120px; left: 50%;
  transform: translateX(-60%);
  animation-delay: -2s;
}
.l-orb--c2 {
  width: 380px; height: 380px;
  background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
  bottom: -100px; right: 8%;
  animation-delay: -6s;
}
.l-cta__content {
  position: relative;
  z-index: 2;
}
.l-cta__title {
  font-size: clamp(2rem, 5.5vw, 3rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.025em;
  margin: 0 0 0.75rem;
}
.l-cta__sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.55);
  margin: 0 0 2.5rem;
}

/* ─── FOOTER ────────────────────────────────────────────────────────────────── */
.l-footer {
  background: #020617;
  padding: 2.25rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.l-footer__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.875rem;
}
.l-footer__note {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
  margin: 0;
}

/* ─── DARK MODE overrides for light sections ────────────────────────────────── */
:global(html.dark) .l-features {
  background: #1e293b;
}
:global(html.dark) .l-features .l-section__title,
:global(html.dark) .l-card__title,
:global(html.dark) .l-step__title {
  color: #f1f5f9;
}
:global(html.dark) .l-features .l-section__sub,
:global(html.dark) .l-card__desc {
  color: rgba(255,255,255,0.45);
}
:global(html.dark) .l-card {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.08);
}
:global(html.dark) .l-steps-section {
  background: #0f172a;
}
:global(html.dark) .l-steps-section .l-section__title { color: #f1f5f9; }
:global(html.dark) .l-step__desc { color: rgba(255,255,255,0.45); }
:global(html.dark) .landing {
  background: #0f172a;
}
</style>
