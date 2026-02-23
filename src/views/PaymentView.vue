<template>
  <div class="payment-page">
    <div class="card cart-card">
      <div class="cart-header">
        <h2>Warenkorb</h2>
        <span class="item-count">{{ cartStore.itemCount }} Artikel</span>
      </div>

      <div v-if="cartStore.items.length === 0" class="cart-empty">
        <div class="empty-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <p class="empty-title">Noch keine Artikel</p>
        <p class="empty-subtitle">Scanne Produkte, um sie hier anzuzeigen</p>
      </div>

      <div v-else class="cart-items">
        <div v-for="item in cartStore.items" :key="item.lineId" class="cart-item">
          <div class="ci-info">
            <div class="ci-name">{{ item.name }}</div>
            <div class="ci-meta">{{ item.category }}</div>
          </div>
          <div class="ci-right">
            <div class="ci-price">{{ formatPrice(item.price * item.qty) }}</div>
            <div class="ci-qty">× {{ item.qty }}</div>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Zwischensumme</span>
          <span>{{ formatPrice(cartStore.subtotal) }}</span>
        </div>
        <div class="summary-row">
          <span>MwSt. (19%)</span>
          <span>{{ formatPrice(cartStore.vatAmount) }}</span>
        </div>
        <div class="summary-row total">
          <span>Gesamt</span>
          <span>{{ formatPrice(cartStore.total) }}</span>
        </div>
      </div>
    </div>

    <div class="card payment-card">
      <div class="utility-actions">
        <button class="utility-btn">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Hilfe
        </button>
        <button class="utility-btn">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            ></path>
          </svg>
          Sprache
        </button>
        <button class="utility-btn">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          MwSt
        </button>
      </div>

      <div class="payment-content">
        <div class="payment-header">
        <h2 class="payment-title">Zahlung</h2>
        <p class="payment-subtitle">Wähle deine Zahlungsart</p>
        </div>

        <div class="payment-actions">
          <button class="primary-payment-btn" @click="processPayment" :disabled="isProcessing">
            <div class="btn-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <span class="btn-text">{{
              isProcessing ? 'Wird verarbeitet...' : 'Kartenzahlung'
            }}</span>
            <span class="btn-subtext">Mastercard, Visa, Girocard</span>
          </button>

          <div class="secondary-actions">
            <button class="secondary-btn" @click="processPayment" :disabled="isProcessing">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Bar
            </button>
            <button class="secondary-btn" @click="processPayment" :disabled="isProcessing">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              Smartphone
            </button>
          </div>
        </div>
      </div>

      <div class="bottom-actions">
        <button class="back-btn" @click="goBack">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Zurück zum Einkauf
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const isProcessing = ref(false)

function formatPrice(n) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)
}

function goBack() {
  router.push('/checkout')
}

async function processPayment() {
  if (cartStore.items.length === 0) return

  isProcessing.value = true

  await new Promise((r) => setTimeout(r, 1500))

  cartStore.clearCart()
  isProcessing.value = false

  router.push('/summary')
}
</script>

<style>
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}

body {
  background: linear-gradient(to bottom, #7A5CC2, #6E4FB3);
}
</style>

<style scoped>
.payment-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7%; 
  padding: 48px;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 10px 20px rgba(0, 0, 0, 0.04),
    0 30px 60px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.03),
    0 12px 24px rgba(0, 0, 0, 0.05),
    0 40px 80px rgba(0, 0, 0, 0.1);
}

.cart-card,
.payment-card {
  background: #F4F4F6;
  border-radius: 25px;
  min-height: 80vh;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.cart-card {
  width: 25vw;
  display: flex;
  flex-direction: column;
  align-items: stretch;     
  justify-content: flex-start;
  padding: 40px;           
  gap: 18px;                
}

.cart-card > * {
  width: 100%;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.cart-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.item-count {
  font-size: 13px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 20px;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}

.cart-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 320px;
  padding-right: 4px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 14px;
}

.ci-info {
  flex: 1;
  min-width: 0;
}

.ci-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ci-meta {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.ci-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 12px;
}

.ci-price {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.ci-qty {
  font-size: 13px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 4px 10px;
  border-radius: 12px;
}

.cart-summary {
  margin-top: auto;
  width: 100%;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  color: #6b7280;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  padding-top: 14px;
  margin-top: 6px;
  border-top: 2px solid #f3f4f6;
}

.payment-card {
  width: 60vw;
  position: relative;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.utility-actions {
  position: absolute;
  top: 40px;  
  right: 40px;
  display: flex;
  gap: 10px;
}

.utility-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1; 
}

.utility-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.utility-btn svg {
  display: block; 
  flex-shrink: 0;
}

.payment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 0;     
}

.payment-header {
  margin-top: 0;
}

.payment-title {
  font-size: 22px;      
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.payment-subtitle {
  font-size: 13px;   
  color: #6b7280;
  margin: 0;
}

.payment-actions {
  margin-top: auto; 
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.primary-payment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 20px;
  background: linear-gradient(135deg, #7c3aed 0%, #6b46c1 100%);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(107, 70, 193, 0.4);
}

.primary-payment-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(107, 70, 193, 0.5);
}

.primary-payment-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  color: white;
  opacity: 0.9;
}

.btn-text {
  font-size: 22px;
  font-weight: 700;
  color: white;
}

.btn-subtext {
  font-size: 13px;
  color: white;
  opacity: 0.8;
}

.secondary-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 20px;
  font-size: 15px;
  font-weight: 600;
  color: #6b46c1;
  background: white;
  border: 2px solid #e9d8fd;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover:not(:disabled) {
  background: #faf5ff;
  border-color: #b794f4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.15);
}

.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bottom-actions {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

@media (max-width: 1000px) {
  .payment-page {
    flex-direction: column;
    padding: 24px;
    gap: 24px;
  }

  .cart-card,
  .payment-card {
    width: 100%;
    max-width: 480px;
    min-height: auto;
  }
}
</style>
