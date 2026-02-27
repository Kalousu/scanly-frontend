<template>
  <div class="checkout">
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="main-glow" aria-hidden="true"></div>

    <div class="checkout__container" role="dialog" aria-label="Checkout abgeschlossen">
      <div class="card">
        <div class="card__icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18L14.5 25.5L29 11" stroke="currentColor" stroke-width="3" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>

        <h2 class="card__title">
          Vielen Dank für Ihren <span class="card__title--accent">Einkauf!</span>
        </h2>

        <p class="card__subtitle">
          Ihr Einkauf wurde erfolgreich abgeschlossen.
        </p>

        <div class="card__divider"></div>

        <div class="card__row">
          <div class="countdown" aria-label="Automatische Weiterleitung in {{ countdown }} Sekunden">
            <span class="countdown__num">{{ countdown }}</span>
          </div>
        </div>

        <div class="card__actions">
          <button class="btn btn--primary" type="button" @click="goHome">
            Zur Startseite
          </button>
        </div>

        <p class="card__hint">
          Sie werden automatisch weitergeleitet.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
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
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.checkout {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
  overflow: hidden;
  color: #fff;
}

.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

.main-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  width: 760px;
  height: 440px;
  background: radial-gradient(ellipse at center,
      rgba(0, 210, 235, 0.10) 0%,
      rgba(0, 185, 215, 0.055) 35%,
      transparent 65%);
  pointer-events: none;
  z-index: 1;
}

.checkout__container {
  position: relative;
  z-index: 1;
  width: min(560px, 94vw);
  padding: 24px;
}

.card {
  position: relative; 
  overflow: hidden; 
  text-align: center;
  padding: 56px 60px 44px;
  border-radius: 28px;
  color: #e2eeff;
  background: rgba(10, 22, 50, 0.72);
  border: 1px solid rgba(0, 200, 255, 0.18);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px rgba(0, 180, 255, 0.08) inset,
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 180, 255, 0.08);
  animation: cardIn 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.card::before{
  content:"";
  position:absolute;
  inset:-2px;
  background: radial-gradient(
    900px 420px at 50% -10%,
    rgba(0, 212, 255, 0.10),
    transparent 60%
  );
  pointer-events:none;
}

.card::after{
  content:"";
  position:absolute;
  inset:0;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.06),
    transparent 35%
  );
  opacity: 0.35;
  pointer-events:none;
}

@keyframes cardIn {
  from {
    transform: translateY(16px) scale(0.97);
    opacity: 0;
  }

  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.card__icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  display: grid;
  place-items: center;
  color: #00d4ff; 
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.16), rgba(0, 120, 255, 0.10));
  border: 1px solid rgba(0, 200, 255, 0.26);
  box-shadow:
    0 0 24px rgba(0, 212, 255, 0.22),
    0 8px 32px rgba(0, 0, 0, 0.45);
  animation: iconPop 560ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
}

@keyframes iconPop {
  from {
    transform: scale(0.7);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.card__title {
  margin: 0 auto;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  max-width: 22ch; 
  color: #e2eeff;
  animation: fadeUp 400ms ease 200ms both;
}

.card__title--accent {
  color: #00d4ff;
}

.card__subtitle {
  margin-left: auto; 
  margin-right: auto; 
  max-width: 48ch; 
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(180, 210, 255, 0.6);
  animation: fadeUp 400ms ease 280ms both;
}

@keyframes fadeUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.card__divider {
  height: 1px;
  margin: 26px 0 22px;
  background: linear-gradient(to right,
      transparent,
      rgba(0, 200, 255, 0.2),
      transparent);
  opacity: 0.9; 
  animation: fadeUp 400ms ease 340ms both;
}

.card__row {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
  animation: fadeUp 400ms ease 360ms both;
}

.card__row {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}

.countdown{
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  padding: 18px 22px;
  border-radius: 999px;
  background: rgba(0, 140, 180, 0.10);
  border: 1px solid rgba(0, 200, 255, 0.18);
  box-shadow:
    0 0 0 1px rgba(0, 180, 255, 0.06) inset,
    0 0 40px rgba(0, 212, 255, 0.10);
}

.countdown__num{
  font-size: 4.6rem;
  font-weight: 800;
  line-height: 0.95;
  color: #00d4ff;
  text-shadow: 0 0 40px rgba(0, 212, 255, 0.45);
  letter-spacing: -0.04em;
}

.label {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1;
  color: #00d4ff;
  text-shadow: 0 0 40px rgba(0, 212, 255, 0.45);
  letter-spacing: -0.04em;
  transition: all 300ms ease;
}

.card__actions {
  display: flex;
  justify-content: center;
  animation: fadeUp 400ms ease 420ms both;
}

.btn {
  padding: 16px 40px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition:
    transform 140ms ease,
    box-shadow 140ms ease;
  letter-spacing: 0.01em;
}

.btn:active {
  transform: translateY(2px) scale(0.99);
}

.btn:focus-visible{
  outline: none;
  box-shadow:
    0 0 0 3px rgba(0, 212, 255, 0.35),
    0 0 0 1px rgba(255,255,255,0.12) inset,
    0 0 40px rgba(0, 200, 255, 0.45),
    0 12px 32px rgba(0, 0, 0, 0.5);
}

.btn--primary {
  color: #020d1f;
  background: linear-gradient(135deg, #00d4ff, #0099e6);
  position: relative;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.12) inset,
    0 0 28px rgba(0, 200, 255, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.4);
}

.btn--primary:hover {
  box-shadow:
    0 0 40px rgba(0, 200, 255, 0.55),
    0 12px 32px rgba(0, 0, 0, 0.5);
  transform: translateY(-1px);
}

.card__hint {
  margin-top: 18px;
  font-size: 0.9rem;
  color: rgba(180, 210, 255, 0.38);
  animation: fadeUp 400ms ease 480ms both;
}

@media (prefers-reduced-motion: reduce){
  .card, .card__icon, .card__title, .card__subtitle, .card__divider, .card__row, .card__actions, .card__hint{
    animation: none !important;
  }
  .btn{
    transition: none !important;
  }
}
</style>