<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useLanguage } from '@/components/Uselanguage'
import { useFormatters } from '@/composables/useFormatters'

const router = useRouter()
const cart = useCartStore()
const { t, tFn } = useLanguage()
const { formatCurrency } = useFormatters()

const REDIRECT_SECONDS = 10
const countdown = ref(REDIRECT_SECONDS)
let countdownInterval = null

const subtotal = computed(() => Number(cart.paymentSummary?.subtotal || 0))
const discount = computed(() => Number(cart.paymentSummary?.discount || 0))
const finalTotal = computed(() => {
  const summaryTotal = Number(cart.paymentSummary?.total || 0)
  return summaryTotal > 0 ? summaryTotal : cart.total
})

function startCountdown() {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      finishAndRedirect()
    }
  }, 1000)
}

function finishAndRedirect() {
  cart.clearCart()
  router.push('/')
}

onMounted(() => {
  startCountdown()
})

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <div class="summary-page" role="dialog" :aria-label="t('dialogLabel')">
    <div class="bg-grid" aria-hidden="true"></div>

    <main class="summary-main">
      <div class="summary-card">
        <h1 class="summary-title">
          {{ t('thankYou') }}
          <span class="summary-accent">{{ t('thankYouAccent') }}</span>
        </h1>
        <p class="summary-subtitle">{{ t('subtitle') }}</p>

        <div class="summary-total">
          <div class="summary-total-copy">
            <span class="summary-total-label">{{ t('total') }}</span>
            <span v-if="discount > 0" class="summary-total-subline">
              {{ t('summaryPreDiscount') }}: {{ formatCurrency(subtotal) }}
            </span>
            <span
              v-if="discount > 0"
              class="summary-total-subline summary-total-subline--discount"
            >
              {{ t('summaryCouponDiscount') }}: -{{ formatCurrency(discount) }}
            </span>
          </div>
          <span class="summary-total-value">{{ formatCurrency(finalTotal) }}</span>
        </div>

        <div class="summary-countdown">
          <div class="summary-progress-bar">
            <div
              class="summary-progress-fill"
              :style="{ width: (countdown / REDIRECT_SECONDS) * 100 + '%' }"
            ></div>
          </div>
          <p class="summary-countdown-text">{{ tFn('countdownLabel', countdown) }}</p>
        </div>

        <p class="summary-hint">{{ t('hint') }}</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.summary-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(160deg, #071a2a 0%, #0b2c44 60%, #092538 100%);
}

.bg-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

.summary-main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  text-align: center;
}

.summary-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  color: #fff;
}

.summary-accent {
  background: linear-gradient(90deg, #00d4e8, #6ef0f9);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.summary-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0 0 2rem;
}

.summary-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  margin-bottom: 2rem;
}

.summary-total-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}

.summary-total-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-total-subline {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.42);
}

.summary-total-subline--discount {
  color: #6ef0b4;
}

.summary-total-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #6ef0b4;
}

.summary-countdown {
  margin-bottom: 1.5rem;
}

.summary-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.summary-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4e8, #6ef0f9);
  border-radius: 999px;
  transition: width 1s linear;
}

.summary-countdown-text {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.summary-hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
}

@media (max-width: 768px) {
  .summary-main {
    padding: 1.5rem;
  }

  .summary-card {
    padding: 2rem 1.5rem;
  }

  .summary-title {
    font-size: 1.4rem;
  }
}
</style>
