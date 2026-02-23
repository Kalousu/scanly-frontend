<template>
  <div class="checkout">
    <div class="checkout__overlay" aria-hidden="true"></div>

    <div
      class="checkout__container"
      role="dialog"
      aria-label="Checkout abgeschlossen"
    >
      <div class="card">
        <div class="card__icon" aria-hidden="true">✓</div>

        <h2 class="card__title">
          Vielen Dank für Ihren Einkauf!
        </h2>

        <p class="card__subtitle">
          Ihr Einkauf wurde erfolgreich abgeschlossen.
        </p>

        <div class="card__divider"></div>

        <div class="card__row">
          <span class="label">{{ countdown }}</span>
        </div>

        <div class="card__actions">
          <button
            class="btn btn--primary"
            type="button"
            @click="goHome"
          >
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
  background-image: url("https://www.edeka.de/static/media/eh/edeka-resp/minden-hannover/edeka-fromm-m%C3%BCllerstr.-12a-c/16x9-titel-startbild-edk-fromm-12a-c.jpg");
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.checkout__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      1200px 600px at 70% 20%,
      rgba(255, 255, 255, 0.08),
      transparent 60%
    ),
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0.88) 0%,
      rgba(0, 0, 0, 0.68) 55%,
      rgba(0, 0, 0, 0.45) 100%
    );
}

.checkout__container {
  position: relative;
  z-index: 1;
  width: min(1000px, 94vw);
  padding: 40px;
}

.card {
  text-align: center;
  padding: 60px 70px 45px;
  border-radius: 24px;
  color: #0f172a;
  background: rgba(244, 244, 246, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(14px);
  box-shadow:
    0 35px 90px rgba(0, 0, 0, 0.45),
    0 6px 20px rgba(0, 0, 0, 0.25);
  animation: pop 420ms ease-out;
}

@keyframes pop {
  from {
    transform: translateY(8px) scale(0.98);
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
  margin: 0 auto 20px;
  display: grid;
  place-items: center;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  border-radius: 20px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  box-shadow: 0 18px 35px rgba(34, 197, 94, 0.35);
}

.card__title {
  margin: 0;
  font-size: 2.2rem;
  letter-spacing: -0.02em;
}

.card__subtitle {
  margin: 14px 0 0;
  font-size: 1.15rem;
  line-height: 1.6;
  color: rgba(15, 23, 42, 0.75);
}

.card__divider {
  height: 1px;
  margin: 30px 0 24px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(15, 23, 42, 0.18),
    transparent
  );
}

.card__row {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.label {
  font-size: 5rem;
  font-weight: 700;
  line-height: 1;
  color: #1d4ed8;
}

.card__actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn--primary {
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 18px 35px rgba(37, 99, 235, 0.28);
}

.btn--primary:hover {
  box-shadow: 0 22px 45px rgba(37, 99, 235, 0.35);
}

.card__hint {
  margin-top: 24px;
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.6);
}
</style>