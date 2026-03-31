<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useLanguage } from '../components/Uselanguage'

const router = useRouter()
const cart = useCartStore()
const { t, tFn } = useLanguage()

const PAYMENT_DURATION_MS = 3000
const paymentStatus = ref('idle') // 'idle' | 'processing' | 'done'
let paymentTimeout = null

const cartItems = computed(() => cart.items)
const formattedSubtotal = computed(() => cart.subtotal.toFixed(2))
const formattedTotal = computed(() => cart.total.toFixed(2))

const taxGroups = computed(() => {
  const groups = {}
  for (const item of cart.items) {
    const rate = item.taxRate ?? 1.19
    const percentage = Math.round((rate - 1) * 100)
    if (!groups[percentage]) groups[percentage] = 0
    groups[percentage] += item.quantity * (item.price ?? item.priceNet ?? 0) * (rate - 1)
  }
  return Object.entries(groups).map(([rate, amount]) => ({
    rate: Number(rate),
    amount: amount.toFixed(2),
  }))
})

const paymentMethods = [
  { name: 'Maestro', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'Visa', icon: '💳' },
  { name: 'Alipay', icon: '📱' },
]

function formatItemTotal(item) {
  return ((item.price ?? item.priceNet ?? 0) * item.quantity).toFixed(2)
}

function startPayment() {
  if (paymentStatus.value !== 'idle') return
  paymentStatus.value = 'processing'

  paymentTimeout = setTimeout(() => {
    paymentStatus.value = 'done'
    setTimeout(() => router.push({ name: 'SummaryView' }), 800)
  }, PAYMENT_DURATION_MS)
}

function cancelPayment() {
  cart.clearCart()
  router.push('/')
}

onMounted(() => {
  if (cart.items.length === 0) router.push('/')
})

onBeforeUnmount(() => {
  if (paymentTimeout) clearTimeout(paymentTimeout)
})
</script>

<template>
  <div class="payment-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <main class="payment-main">
      <div class="payment-card">
        <!-- Header -->
        <div class="payment-header">
          <div class="payment-icon-wrap">
            <svg viewBox="0 0 24 24" fill="currentColor" class="payment-icon">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
          </div>
          <h1 class="payment-title">{{ t('payText') }}</h1>
          <p class="payment-subtitle">{{ t('paySub') }}</p>
        </div>

        <!-- Cart Items -->
        <div class="payment-items">
          <div v-for="(item, idx) in cartItems" :key="idx" class="payment-item">
            <div class="payment-item-info">
              <span class="payment-item-name">{{ item.name }}</span>
              <span class="payment-item-qty">× {{ item.quantity }}</span>
            </div>
            <span class="payment-item-price">{{ formatItemTotal(item) }} €</span>
          </div>
        </div>

        <!-- Totals -->
        <div class="payment-totals">
          <div class="payment-total-row">
            <span>{{ t('subtotal') }}</span>
            <span>{{ formattedSubtotal }} €</span>
          </div>
          <div v-for="tax in taxGroups" :key="tax.rate" class="payment-total-row payment-total-row--tax">
            <span>{{ tFn('vat', tax.rate) }}</span>
            <span>{{ tax.amount }} €</span>
          </div>
          <div class="payment-total-row payment-total-row--final">
            <span>{{ t('total') }}</span>
            <span>{{ formattedTotal }} €</span>
          </div>
        </div>

        <!-- Accepted Payment Methods -->
        <div class="payment-methods">
          <span v-for="method in paymentMethods" :key="method.name" class="payment-method-badge">
            {{ method.icon }} {{ method.name }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="payment-actions">
          <button class="payment-cancel-btn" @click="cancelPayment" :disabled="paymentStatus === 'processing'">
            {{ t('cancel') }}
          </button>
          <button class="payment-pay-btn" @click="startPayment" :disabled="paymentStatus !== 'idle'">
            <span v-if="paymentStatus === 'processing'" class="payment-spinner"></span>
            <svg v-else-if="paymentStatus === 'done'" viewBox="0 0 24 24" fill="currentColor" class="payment-check-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {{
              paymentStatus === 'processing' ? t('paying')
              : paymentStatus === 'done' ? t('paid')
              : t('pay')
            }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.payment-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

.payment-main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  padding: 2rem;
}

.payment-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 2.5rem 2rem;
}

/* Header */
.payment-header {
  text-align: center;
  margin-bottom: 2rem;
}

.payment-icon-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 232, 0.12);
  border-radius: 16px;
}

.payment-icon {
  width: 30px;
  height: 30px;
  color: #00D4E8;
}

.payment-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 0.4rem;
  color: #fff;
}

.payment-subtitle {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.4);
  margin: 0;
}

/* Items List */
.payment-items {
  margin-bottom: 1.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
}

.payment-item + .payment-item {
  border-top: 1px solid rgba(255,255,255,0.05);
}

.payment-item-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
}

.payment-item-qty {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
}

.payment-item-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
}

/* Totals */
.payment-totals {
  padding: 1rem 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 1.5rem;
}

.payment-total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
}

.payment-total-row--tax {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.35);
}

.payment-total-row--final {
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 1.1rem;
  font-weight: 800;
  color: #6EF0B4;
}

/* Payment Methods */
.payment-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.payment-method-badge {
  padding: 0.3rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
}

/* Actions */
.payment-actions {
  display: flex;
  gap: 0.75rem;
}

.payment-cancel-btn {
  flex: 1;
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s;
}

.payment-cancel-btn:hover:not(:disabled) {
  color: #FF6B8A;
  background: rgba(255, 107, 138, 0.08);
  border-color: rgba(255, 107, 138, 0.2);
}

.payment-cancel-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.payment-pay-btn {
  flex: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #071A2A;
  background: linear-gradient(90deg, #00D4E8, #6EF0F9);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s;
}

.payment-pay-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(0, 212, 232, 0.3);
}

.payment-pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.payment-check-icon {
  width: 18px;
  height: 18px;
}

.payment-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(7, 26, 42, 0.3);
  border-top-color: #071A2A;
  border-radius: 50%;
  animation: payment-spin 0.6s linear infinite;
}

@keyframes payment-spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .payment-main {
    padding: 1.5rem;
  }
  .payment-card {
    padding: 2rem 1.5rem;
  }
  .payment-title {
    font-size: 1.2rem;
  }
}
</style>