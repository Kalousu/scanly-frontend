<template>
  <div class="checkout">
    <div class="bg-grid" aria-hidden="true"></div>

    <div class="checkout__container" role="dialog" :aria-label="t('dialogLabel')">
      <div class="panel card">
        <div class="card__icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18L14.5 25.5L29 11" stroke="currentColor" stroke-width="3" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>

        <h2 class="card__title">
          {{ t('thankYou') }} <span class="card__title--accent">{{ t('thankYouAccent') }}</span>
        </h2>

        <p class="card__subtitle">
          {{ t('subtitle') }}
        </p>

        <div class="card__divider"></div>

        <div class="card__row" :aria-label="tFn('countdownLabel', countdown)">
          <div class="countdown">
            <span class="countdown__num">{{ countdown }}</span>
          </div>
        </div>

        <p class="card__hint">
          {{ t('hint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useLanguage } from '../components/Uselanguage'

const router = useRouter();
const { t, tFn } = useLanguage()
const countdown = ref(5);

let timer = null;

const goHome = () => {
  router.push("/");
};

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      goHome();
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style>
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}
body {
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

:root {
  --stroke: rgba(255,255,255,0.12);
  --stroke-md: rgba(255,255,255,0.17);
  --stroke-hover: rgba(24,231,242,0.35);
  --text: rgba(255,255,255,0.96);
  --muted: rgba(255,255,255,0.65);
  --muted2: rgba(255,255,255,0.42);
  --cyan: #18E7F2;
  --cyan2: #1BC7FF;
  --shadow: 0 20px 60px rgba(0,0,0,0.50);
  --glow: 0 18px 45px rgba(24,231,242,0.26);
  --glow-sm: 0 0 16px rgba(24,231,242,0.20);
  --panel: rgba(11, 32, 49, 0.88);
  --panel-strong: rgba(10, 28, 44, 0.95);
  --shadow-card: 0 8px 32px rgba(0,0,0,0.32);
}
</style>

<style scoped>
.checkout {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
  overflow: hidden;
  color: #fff;
}

.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.013) 1px, transparent 1px);
  background-size: 44px 44px;
  z-index: 0;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--stroke-md);
  border-radius: 28px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255,255,255,0.07);
  outline: 1px solid rgba(255,255,255,0.04);
  outline-offset: -1px;
}

.checkout__container {
  position: relative;
  z-index: 1;
  width: min(520px, 94vw);
  padding: 24px;
}

.card {
  background:
    radial-gradient(900px 420px at 50% -10%, rgba(24,231,242,0.09), transparent 60%),
    var(--panel);
  text-align: center;
  padding: 52px 56px 48px;
  animation: cardIn 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardIn {
  from { transform: translateY(16px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1);       opacity: 1; }
}

.card__icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  display: grid;
  place-items: center;
  color: var(--cyan);
  border-radius: 20px;
  background: rgba(24,231,242,0.10);
  border: 1px solid rgba(24,231,242,0.26);
  box-shadow: var(--glow-sm), 0 8px 32px rgba(0,0,0,0.45);
  animation: iconPop 560ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
}

@keyframes iconPop {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.card__title {
  margin: 0 auto;
  font-size: 1.95rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  max-width: 22ch;
  color: var(--text);
  animation: fadeUp 400ms ease 200ms both;
}

.card__title--accent {
  color: var(--cyan);
  text-shadow: 0 0 20px rgba(24,231,242,0.40);
}

.card__subtitle {
  margin: 10px auto 0;
  max-width: 40ch;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--muted);
  animation: fadeUp 400ms ease 280ms both;
}

@keyframes fadeUp {
  from { transform: translateY(10px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.card__divider {
  height: 1px;
  margin: 28px 0 32px;
  background: linear-gradient(to right, transparent, rgba(24,231,242,0.22), transparent);
  animation: fadeUp 400ms ease 340ms both;
}

.card__row {
  display: flex;
  justify-content: center;
  margin-bottom: 36px;
  animation: fadeUp 400ms ease 360ms both;
}

.countdown {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: rgba(24,231,242,0.07);
  border: 1px solid rgba(24,231,242,0.22);
  box-shadow:
    inset 0 0 0 1px rgba(24,231,242,0.06),
    0 0 40px rgba(24,231,242,0.12),
    var(--shadow-card);
}

.countdown__num {
  font-size: 4.4rem;
  font-weight: 900;
  line-height: 1;
  color: var(--cyan);
  text-shadow: 0 0 40px rgba(24,231,242,0.55);
  letter-spacing: -0.04em;
}

.card__hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted2);
  animation: fadeUp 400ms ease 420ms both;
}

@media (prefers-reduced-motion: reduce) {
  .card, .card__icon, .card__title,
  .card__subtitle, .card__divider,
  .card__row, .card__hint {
    animation: none !important;
  }
}
</style>
