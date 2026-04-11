<template>
  <div class="checkout">
    <div class="bg-grid" aria-hidden="true"></div>

    <nav class="navbar">
      <div class="navbar-logo-wrap">
        <img src="../assets/logo-removebg-preview.png" class="logo" alt="Scanly" />
      </div>

      <div class="navbar-actions">
        <button
          type="button"
          class="navbar-btn navbar-pill"
          @click="isAdminAuthOpen = true"
          :aria-label="t('adminDashboard')"
        >
          <span class="navbar-text">Admin</span>
        </button>
        <button
          type="button"
          class="navbar-btn navbar-pill"
          @click="isHelpOpen = true"
          :aria-label="t('help')"
        >
          <span class="navbar-text">{{ t('help') }}</span>
        </button>
      </div>
    </nav>

    <main class="main">
      <div class="main-glow" aria-hidden="true"></div>
      <div class="main-inner">
        <h1 class="main-title">
          <span class="title-line title-line--light">{{ t('welcomePrefix') }}</span>
          <span class="title-line title-line--accent">{{ t('welcomeAccent') }}</span>
        </h1>

        <p class="main-sub">{{ t('instruction') }}</p>

        <button type="button" class="start" @click="onStart">
          <span class="start-text">{{ t('start') }}</span>
        </button>
        <p v-if="startError" class="start-error" role="alert">{{ startError }}</p>
      </div>
    </main>

    <footer class="language-bar" :aria-label="t('languageBarLabel')">
      <div class="language-bar-inner">
        <button
          v-for="lang in languages"
          :key="lang.code"
          type="button"
          class="language-bar-btn"
          :class="{ 'language-bar-btn-active': currentLang === lang.code }"
          :aria-label="lang.label"
          @click="setLanguage(lang.code)"
        >
          <img class="language-bar-flag" :src="lang.flag" :alt="lang.label" aria-hidden="true" />
          <span class="language-bar-code">{{ lang.code.toUpperCase() }}</span>
        </button>
      </div>
    </footer>

    <HelpModal
      v-model="isHelpOpen"
      :current-lang="currentLang"
      :translations="translations"
    />

    <AdminAuthPopup
      :visible="isAdminAuthOpen"
      @close="isAdminAuthOpen = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HelpModal from '@/components/HelpModal.vue'
import AdminAuthPopup from '@/components/AdminAuthPopup.vue'
import { useLanguage, translations } from '@/components/Uselanguage'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/services/api'

const router = useRouter()
const cartStore = useCartStore()
const { currentLang, languages, t, setLanguage } = useLanguage()

const isHelpOpen = ref(false)
const isAdminAuthOpen = ref(false)
const startError = ref('')

async function onStart() {
  startError.value = ''
  try {
    cartStore.resetOrderSession()
    const order = await createOrder()
    cartStore.setOrderId(order.id ?? order.orderId ?? order)
    cartStore.clearCoupon()
    cartStore.setPaymentSummary({ subtotal: 0, discount: 0, total: 0 })
    router.push('/checkout')
  } catch {
    startError.value = t('startOrderError')
  }
}
</script>

<style scoped>
.checkout {
  position: fixed;
  inset: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

.bg-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

.navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 3rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.9);
  backdrop-filter: blur(8px);
}

.navbar-logo-wrap {
  display: flex;
  align-items: center;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.navbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.87);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  transition: background 0.18s, transform 0.13s, color 0.18s, border-color 0.18s;
  letter-spacing: 0.01em;
}

.navbar-pill {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.10);
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
}

.navbar-btn:hover {
  color: rgba(255, 255, 255, 1);
  background: rgba(0, 212, 232, 0.08);
  border-color: rgba(0, 212, 232, 0.3);
  box-shadow: 0 0 12px rgba(0, 212, 232, 0.12);
  transform: translateY(-1px);
}

.navbar-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  flex-shrink: 0;
  opacity: 0.72;
  transition: opacity 0.18s;
}

.navbar-btn:hover .navbar-icon {
  opacity: 1;
}

.icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.navbar-text {
  line-height: 1;
  white-space: nowrap;
  font-size: 0.95rem;
}

.logo {
  width: 88px;
  display: block;
  filter: brightness(1.1);
}

.main-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  width: 760px;
  height: 440px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 210, 235, 0.10) 0%,
    rgba(0, 185, 215, 0.055) 35%,
    transparent 65%
  );
  pointer-events: none;
  z-index: 1;
}

.main {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding-bottom: 10vh;
  text-align: center;
}

.main-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-top: 4vh;
}

.main-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0 0.85rem;
  line-height: 1.05;
}

.title-line {
  display: block;
  font-size: clamp(3.5rem, 7.5vw, 6.5rem);
  font-weight: 800;
}

.title-line--light {
  color: rgba(255, 255, 255, 0.88);
  font-size: clamp(2.8rem, 6vw, 5.2rem);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.title-line--accent {
  display: inline-block;
  padding-right: 0.08em;
  padding-top: 0.06em;
  -webkit-background-clip: text;
  background-clip: text;
  background: linear-gradient(90deg, #00D4E8 0%, #6EF0F9 100%);
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: clamp(4rem, 8.5vw, 7.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  padding-bottom: 0.12em;
}

.main-sub {
  margin: 0.55rem 0 2.5rem;
  font-size: clamp(0.73rem, 1.3vw, 0.87rem);
  color: rgba(255, 255, 255, 0.42);
  font-weight: 400;
  letter-spacing: 0.03em;
}

.start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 68px;
  width: 22vw;
  min-width: 280px;
  padding: 0 2.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #071A2A;
  border: 0;
  border-radius: 40px;
  background: linear-gradient(90deg, #1fd6d6 0%, #1ec3ff 100%);
  cursor: pointer;
  box-shadow:
    0 6px 28px rgba(30, 195, 255, 0.28),
    0 2px 8px rgba(31, 214, 214, 0.18);
  transition: transform 0.18s ease, box-shadow 0.22s ease, background 0.2s ease;
}

.start-text {
  line-height: 1;
}

.start:hover {
  background: linear-gradient(90deg, #3de0e0 0%, #3dd1ff 100%);
  transform: translateY(-2px) scale(1.015);
  box-shadow:
    0 8px 36px rgba(30, 195, 255, 0.38),
    0 3px 10px rgba(31, 214, 214, 0.22);
}

.start:active {
  transform: translateY(0);
  box-shadow: 0 3px 12px rgba(30, 195, 255, 0.25);
}

.start-error {
  margin: 18px 0 0;
  color: #fca5a5;
  font-size: 0.95rem;
  font-weight: 650;
}

.language-bar {
  position: absolute;
  bottom: 2.5rem;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
}

.language-bar-inner {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: rgba(7, 26, 42, 0.75);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.language-bar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 5px 8px;
  cursor: pointer;
  transition: border-color 0.18s, transform 0.13s, background 0.18s;
}

.language-bar-btn:hover {
  background: rgba(255,255,255,0.06);
  transform: translateY(-1px);
}

.language-bar-btn-active {
  border-color: #00D4E8;
  background: rgba(0, 212, 232, 0.08);
}

.language-bar-flag {
  width: 36px;
  height: 24px;
  border-radius: 6px;
  object-fit: cover;
  display: block;
}

.language-bar-code {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.45);
  line-height: 1;
}

.language-bar-btn-active .language-bar-code {
  color: #00D4E8;
}

</style>
