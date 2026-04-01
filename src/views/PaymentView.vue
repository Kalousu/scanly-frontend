<template>
  <div class="checkout-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <div class="layout">
      <CartPanel
        :items="orderItems"
        :total-price="orderTotalPrice"
        :editable="false"
        :show-scan-badge="false"
      />

      <main class="panel scan-panel">
        <div class="top-actions">
          <button class="action-pill" @click="toggleLanguage">{{ t('language') }}</button>
          <button class="action-pill" @click="openHelp">{{ t('help') }}</button>
          <button
            class="action-pill"
            :class="{ 'action-pill--active': vatEnabled }"
            @click="vatEnabled = !vatEnabled"
          >
            MwSt
          </button>
        </div>

        <div class="hero-block">
          <div class="hero-eyebrow">
            <img src="../assets/logo-removebg-preview.png" alt="Scanly" />
          </div>

          <div class="status-text">
            <template v-if="status === 'idle'">
              {{ t('payText') }}
            </template>
            <template v-else-if="status === 'scanning'">
              <span class="status--scanning">{{ t('scanning') }}</span>
            </template>
            <template v-else-if="status === 'paying'">
              <span class="status--paying">{{ t('paying') }}</span>
            </template>
            <template v-else-if="status === 'paid'">
              <span class="status--paid">{{ t('paid') }}</span>
            </template>
            <template v-else-if="status === 'cancelled'">
              <span class="status--cancelled">{{ t('cancelled') }}</span>
            </template>
          </div>

          <div class="hero-sub">
            <span v-if="status === 'idle'">{{ t('paySub') }}</span>
            <span v-else>{{ t('heroSubSmall') }}</span>
          </div>
        </div>

        <div class="flow-block">
          <div class="action-row">
            <button
              class="btn btn--pay btn--pay--primary"
              :disabled="orderItems.length === 0 || status === 'paying' || status === 'paid'"
              @click="pay(); printReceipt()"
            >
              <span v-if="status === 'paying'" class="spinner"></span>
              <span v-else>{{ t('pay') }}</span>
            </button>

            <button class="btn btn--coupon-main" @click="openCouponModal">
              Coupon einlösen
            </button>

            <button
              class="btn btn--cancel btn--cancel--secondary"
              @click="cancel"
              :disabled="status === 'paying'"
            >
              {{ t('cancel') }}
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-toast" role="alert">⚠️ {{ errorMessage }}</div>

        <div v-if="modal === 'help'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card modal-card--sm">
            <h3 class="modal-title">{{ t('helpTitle') }}</h3>
            <ul class="help-list">
              <li v-for="(item, i) in helpPayment" :key="i">{{ item }}</li>
            </ul>
            <div class="modal-actions">
              <button class="modal-btn modal-btn--done" @click="closeModal">
                {{ t('close') }}
              </button>
            </div>
          </div>
        </div>

        <CouponModal
          :visible="modal === 'coupon'"
          :code="couponCode"
          :scanning="couponScanning"
          :message="couponMessage"
          :message-type="couponMessageType"
          @update:code="couponCode = $event"
          @redeem="redeemCoupon"
          @toggle-scan="startCouponScan"
          @close="closeModal"
        />

        <LanguageModal
          :visible="modal === 'lang'"
          :current-lang="currentLang"
          :languages="languages"
          :t="t"
          @select="selectLanguage"
          @close="closeModal"
        />
      </main>
    </div>

    <ConfirmDialog
      :visible="showCancelConfirm"
      title="Bestellung abbrechen"
      message="Möchten Sie die Bestellung wirklich abbrechen? Alle Artikel werden entfernt."
      cancel-label="Zurück"
      confirm-label="Bestellung abbrechen"
      @cancel="showCancelConfirm = false"
      @confirm="confirmCancel"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useLanguage, translations as allTranslations } from '../components/Uselanguage'
import api from '@/services/api'
import { PrinterEncoder } from '@/PrinterEncoder'
import CartPanel from '../components/CartPanel.vue'
import LanguageModal from '../components/LanguageModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import CouponModal from '../components/CouponModal.vue'
import { useFormatters } from '../composables/useFormatters'
import { useErrorToast } from '../composables/useErrorToast'

const router = useRouter()
const cartStore = useCartStore()
const { currentLang, languages, t, tFn, setLanguage } = useLanguage()

const { formatPrice } = useFormatters()
const { errorMessage, showError } = useErrorToast()

const translations_local = allTranslations

const helpPayment = computed(() => {
  const items = translations_local[currentLang.value]?.helpPayment
  return items ?? translations_local.de.helpPayment
})

const status = ref('idle')
const modal = ref(null)

const vatEnabled = ref(false)
const vatRate = ref(19)

const orderItems = ref([])
const orderTotalPrice = ref(0)

const scanBuffer = ref('')
let scanTimer = null

const showCancelConfirm = ref(false)

// Coupon state
const couponCode = ref('')
const couponScanning = ref(false)
const couponMessage = ref('')
const couponMessageType = ref('')
const couponInputRef = ref(null)

function selectLanguage(code) {
  setLanguage(code)
  closeModal()
}


async function printReceipt(){
  const device = await navigator.usb.requestDevice({
          filters: [{ vendorId: 0x0483, productId: 0x5840 }]
        });
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(0);
 
        const endpoint = device.configuration.interfaces[0].alternate.endpoints.find(e => e.direction === 'out');
        
        const printer = new PrinterEncoder();
        const result = printer
          .init()
          .setCodepage()
          .setGerman()
          .center()
          .setBold()
          .setItalic()
          .setUnderline()
          .println(0xC3)
          .beep()
          .unsetUnderline()
          .unsetBold()
          .println('Artikel A        3.50 EUR')
          .println('Artikel B        5.00 EUR')
          .println('------------------------')
          .setBold()
          .println('Total            8.50 EUR')
          .unsetBold()
          .unsetItalic()
          .feed(1)
          .cut()
          .encode();
 
        await device.transferOut(endpoint.endpointNumber, result);
        await device.close();
}

function handleKeydown(e) {
  const tag = (e.target?.tagName || '').toLowerCase()

  if (e.key === 'Escape' && modal.value) {
    closeModal()
    return
  }

  if (tag === 'input' || tag === 'textarea') return
  if (modal.value) return

  if (scanTimer) window.clearTimeout(scanTimer)

  if (e.key === 'Enter') {
    const code = scanBuffer.value.trim()
    scanBuffer.value = ''
    if (code) onBarcodeScanned(code)
    return
  }

  if (e.key.length === 1) {
    scanBuffer.value += e.key
    scanTimer = window.setTimeout(() => {
      scanBuffer.value = ''
    }, 300)
  }
}

function onBarcodeScanned(code) {
  status.value = 'idle'
}

function openCouponModal() {
  couponCode.value = ''
  couponScanning.value = false
  couponMessage.value = ''
  couponMessageType.value = ''
  modal.value = 'coupon'
  setTimeout(() => couponInputRef.value?.focus(), 100)
}

function startCouponScan() {
  couponScanning.value = !couponScanning.value
  if (couponScanning.value) {
    couponCode.value = ''
    couponMessage.value = ''
    // Focus the input so barcode scanner input goes there
    couponInputRef.value?.focus()
  }
}

function redeemCoupon() {
  const code = couponCode.value.trim()
  if (!code) return

  // Frontend-only placeholder — no backend call yet
  couponMessage.value = `Coupon „${code}" wird geprüft… (Backend noch nicht verbunden)`
  couponMessageType.value = 'success'
  couponScanning.value = false
}

function openHelp() {
  console.log('lang', currentLang.value)
  console.log('helpPayment', helpPayment.value)
  modal.value = 'help'
}
function toggleLanguage() {
  modal.value = 'lang'
}
function closeModal() {
  modal.value = null
  couponScanning.value = false
}

function cancel() {
  if (status.value === 'paying') return
  closeModal()
  router.push('/checkout')
}

async function pay() {
  if (orderItems.value.length === 0) return
  if (status.value === 'paying') return
  if (!cartStore.orderId) {
    showError('Keine Order vorhanden')
    return
  }

  status.value = 'paying'
  closeModal()

  try {
    await api.post(`/orders/${cartStore.orderId}/checkout`, { paymentMethod: 'Card' })
    status.value = 'paid'
    await new Promise((r) => setTimeout(r, 900))
    router.push('/summary')
  } catch (error) {
    console.error('Checkout-Fehler:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    showError(`Checkout fehlgeschlagen: ${errorMsg}`)
    status.value = 'idle'
  }
}

async function fetchOrder() {
  if (!cartStore.orderId) return
  try {
    const response = await api.get(`/orders/${cartStore.orderId}`)
    console.log(`GET /api/orders/${cartStore.orderId} Response:`, response.data)
    orderItems.value = response.data.orderItems || []
    orderTotalPrice.value = response.data.totalPrice || 0
  } catch (error) {
    console.error(`GET /api/orders/${cartStore.orderId} Error:`, error)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  fetchOrder()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (scanTimer) clearTimeout(scanTimer)
})
</script>

<style>
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
}
body {
  background: linear-gradient(160deg, #071a2a 0%, #0b2c44 60%, #092538 100%);
}

:root {
  --stroke: rgba(255, 255, 255, 0.12);
  --stroke-md: rgba(255, 255, 255, 0.17);
  --stroke-hover: rgba(24, 231, 242, 0.35);
  --text: rgba(255, 255, 255, 0.96);
  --muted: rgba(255, 255, 255, 0.65);
  --muted2: rgba(255, 255, 255, 0.42);
  --cyan: #18e7f2;
  --cyan2: #1bc7ff;
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  --glow: 0 18px 45px rgba(24, 231, 242, 0.26);
  --glow-sm: 0 0 16px rgba(24, 231, 242, 0.2);
  --panel: rgba(11, 32, 49, 0.88);
  --panel-strong: rgba(10, 28, 44, 0.95);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.32);
}

.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.delete-overlay .delete-confirm-card {
  width: min(420px, 90vw);
  background: rgba(10, 28, 44, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 24px;
  padding: 36px 32px 28px;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: scaleIn 0.25s ease;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.delete-overlay .delete-confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #f87171;
}

.delete-overlay .delete-confirm-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: -0.02em;
}

.delete-overlay .delete-confirm-text {
  margin: 0 0 24px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

.delete-overlay .delete-confirm-text strong {
  color: rgba(255, 255, 255, 0.96);
  font-weight: 700;
}

.delete-overlay .delete-confirm-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.delete-overlay .delete-confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}

.delete-overlay .delete-confirm-btn:active {
  transform: scale(0.97);
}

.delete-overlay .delete-confirm-btn--cancel {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.17);
}

.delete-overlay .delete-confirm-btn--cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.delete-overlay .delete-confirm-btn--delete {
  background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 30px rgba(248, 113, 113, 0.25);
}

.delete-overlay .delete-confirm-btn--delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 40px rgba(248, 113, 113, 0.35);
}
</style>

<style scoped>
.checkout-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(160deg, #071a2a 0%, #0b2c44 60%, #092538 100%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.013) 1px, transparent 1px);
  background-size: 44px 44px;
  z-index: 0;
}

.layout::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 400px at 65% 45%, rgba(24, 231, 242, 0.14), transparent 60%),
    radial-gradient(900px 600px at 50% 70%, rgba(24, 231, 242, 0.08), transparent 70%);
  pointer-events: none;
  z-index: -1;
  filter: blur(8px);
}

.layout {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 32px;
  padding: 32px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  max-width: 1600px;
  margin: 0 auto;
  align-items: stretch;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--stroke-md);
  border-radius: 28px;
  backdrop-filter: blur(16px);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  outline: 1px solid rgba(255, 255, 255, 0.04);
  outline-offset: -1px;
}

.cart-panel {
  background:
    radial-gradient(1200px 600px at 30% 20%, rgba(24, 231, 242, 0.06), transparent 60%),
    var(--panel);
  width: 30%;
  min-width: 280px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 36px 32px;
  box-sizing: border-box;
}

.cart-panel,
.cart,
.cart-items {
  overflow-x: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--muted);
  gap: 12px;
}

.empty-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}

.empty-hint {
  margin: 0;
  font-size: 13px;
  color: var(--muted2);
  line-height: 1.55;
  max-width: 220px;
}

.cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--stroke);
}

.cart-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.scan-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  color: var(--cyan);
  background: rgba(24, 231, 242, 0.09);
  border: 1px solid rgba(24, 231, 242, 0.28);
  padding: 5px 12px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.scan-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 6px var(--cyan);
  flex-shrink: 0;
  animation: pulse-dot 1.8s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.65);
  }
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.cart-items::-webkit-scrollbar {
  height: 0px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border: 1px solid var(--stroke);
  min-width: 0;
  border-radius: 16px;
  transition:
    border-color 0.2s,
    background 0.2s,
    transform 0.18s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.ci-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--cyan), var(--cyan2));
  border-radius: 16px 0 0 16px;
  opacity: 0;
  transform: scaleY(0.4);
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.cart-item:hover .ci-accent {
  opacity: 0.7;
  transform: scaleY(1);
}

.cart-item:hover {
  border-color: var(--stroke);
  background: rgba(0, 0, 0, 0.14);
  transform: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.ci-left {
  flex: 1;
  min-width: 0;
}

.ci-name,
.ci-meta {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ci-name {
  font-size: 13.5px;
  font-weight: 650;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.ci-meta {
  font-size: 11px;
  color: var(--muted2);
  margin-top: 3px;
  line-height: 1.2;
}

.ci-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
  flex-shrink: 0;
  max-width: 50%;
}

.ci-price {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  min-width: 52px;
  text-align: right;
  letter-spacing: -0.01em;
}

.ci-qty {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--stroke-md);
  border-radius: 10px;
}

.qty-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border-radius: 5px;
  transition:
    color 0.13s,
    background 0.13s;
}

.qty-btn:hover {
  color: var(--cyan);
  background: rgba(24, 231, 242, 0.12);
}

.qty-val {
  min-width: 18px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}

.remove-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted2);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.13s,
    color 0.13s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(248, 113, 113, 0.14);
  color: #fca5a5;
}

.totals {
  margin-top: 16px;
  border-top: 1px solid var(--stroke);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--muted);
  padding: 3px 0;
  line-height: 1.5;
}

.totals-vat {
  color: var(--muted2);
  font-size: 12px;
}

.totals-total {
  font-size: 20px;
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 18px rgba(24, 231, 242, 0.25);
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--stroke);
  letter-spacing: -0.03em;
}

.totals-total-value {
  color: var(--cyan);
  text-shadow: 0 0 20px rgba(24, 231, 242, 0.5);
}

.scan-panel {
  height: calc(100vh - 64px);
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 40px 32px;
  box-sizing: border-box;
  position: relative;
}

.top-actions {
  position: absolute;
  top: 24px;
  right: 32px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.action-pill:focus-visible,
.btn:focus-visible {
  outline: 3px solid rgba(24, 231, 242, 0.32);
  outline-offset: 3px;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid var(--stroke-md);
  background: rgba(255, 255, 255, 0.04);
  color: var(--muted);
  cursor: pointer;
  letter-spacing: 0.01em;
  transition:
    background 0.18s,
    border-color 0.18s,
    color 0.18s,
    transform 0.13s,
    box-shadow 0.18s;
}

.action-pill:hover {
  color: var(--text);
  background: rgba(24, 231, 242, 0.08);
  border-color: rgba(24, 231, 242, 0.32);
  box-shadow: var(--glow-sm);
  transform: translateY(-1px);
}

.action-pill--active {
  border-color: rgba(24, 231, 242, 0.58);
  box-shadow:
    var(--glow-sm),
    inset 0 0 12px rgba(24, 231, 242, 0.07);
  color: var(--cyan);
  background: rgba(24, 231, 242, 0.08);
}

.hero-block {
  text-align: center;
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.hero-eyebrow {
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cyan);
  opacity: 0.7;
}

.hero-eyebrow img {
  width: 88px;
  display: block;
  filter: brightness(1.1);
}

.status-text {
  font-size: 34px;
  font-weight: 900;
  margin-bottom: 14px;
  letter-spacing: 0.01em;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(24, 231, 242, 0.9));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 600;
  margin-top: 8px;
  gap: 4px;
  letter-spacing: 0.02em;
}

.status--scanning {
  color: var(--cyan);
}
.status--paying {
  color: #a78bfa;
}
.status--paid {
  color: #4ade80;
}
.status--cancelled {
  color: var(--muted2);
}

.flow-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 32px;
  width: 100%;
}

.error-toast {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(248, 113, 113, 0.14);
  color: var(--text);
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
  z-index: 100;
  white-space: nowrap;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.action-row {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.btn {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 800;
  border-radius: 16px;
  border: 1px solid var(--stroke-md);
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    border-color 0.15s,
    background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  letter-spacing: 0.02em;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn--cancel {
  color: var(--muted);
  border-color: rgba(255, 255, 255, 0.13);
}

.btn--cancel:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(24, 231, 242, 0.28);
  color: var(--text);
  background: rgba(24, 231, 242, 0.04);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 0 16px rgba(24, 231, 242, 0.1);
}

.btn--pay {
  border: none;
  background: linear-gradient(90deg, var(--cyan) 0%, var(--cyan2) 100%);
  color: rgba(0, 0, 0, 0.88);
  min-width: 160px;
  font-weight: 900;
  font-size: 16px;
  padding: 15px 38px;
  box-shadow:
    0 0 0 1px rgba(24, 231, 242, 0.35),
    0 12px 28px rgba(24, 231, 242, 0.28),
    0 30px 60px rgba(24, 231, 242, 0.18);
  animation: pay-pulse 3s ease-in-out infinite;
}

@keyframes pay-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 1px rgba(24, 231, 242, 0.35),
      0 12px 28px rgba(24, 231, 242, 0.28),
      0 30px 60px rgba(24, 231, 242, 0.18);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(24, 231, 242, 0.45),
      0 16px 36px rgba(24, 231, 242, 0.35),
      0 36px 70px rgba(24, 231, 242, 0.22);
  }
}

.btn--pay:disabled {
  filter: grayscale(0.25);
  opacity: 0.45;
  box-shadow: none;
}

.btn--pay:disabled:hover {
  transform: none;
}

.btn--pay:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 0 0 1px rgba(24, 231, 242, 0.5),
    0 12px 36px rgba(24, 231, 242, 0.55),
    0 32px 70px rgba(24, 231, 242, 0.32);
  animation: none;
}
.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn--pay--primary {
  width: 100%;
  min-height: 60px;
  padding: 25px 51px;
  font-size: 17px;
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(24, 231, 242, 0.45),
    0 18px 50px rgba(24, 231, 242, 0.3),
    0 38px 90px rgba(24, 231, 242, 0.18);
}

.btn--cancel--secondary {
  width: 100%;
  min-height: 48px;
  padding: 25px 51px;
  font-size: 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  opacity: 0.85;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(0, 0, 0, 0.25);
  border-top-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-card {
  width: min(900px, 95%);
  max-height: 82vh;
  background: var(--panel-strong);
  border: 1px solid var(--stroke-md);
  border-radius: 26px;
  padding: 28px;
  box-shadow:
    var(--shadow),
    0 0 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-card--sm {
  width: min(480px, 95%);
}

.modal-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.02em;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    background 0.15s;
}
.modal-btn--back {
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted);
  border: 1px solid var(--stroke-md);
}
.modal-btn--back:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}
.modal-btn--done {
  background: linear-gradient(90deg, var(--cyan) 0%, var(--cyan2) 100%);
  color: rgba(0, 0, 0, 0.8);
  box-shadow: var(--glow);
}
.modal-btn--done:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 50px rgba(24, 231, 242, 0.3);
}
.modal-btn--done:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.modal-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.help-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 2;
  font-size: 14px;
}
.help-list :deep(b) {
  color: var(--text);
  font-weight: 700;
}

.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.lang-btn {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--stroke-md);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
  transition:
    border-color 0.15s,
    transform 0.13s,
    background 0.15s,
    box-shadow 0.15s;
  letter-spacing: 0.01em;
}

.lang-btn:hover {
  border-color: var(--stroke-hover);
  background: rgba(24, 231, 242, 0.07);
  transform: translateY(-1px);
}

.lang-btn--active {
  border-color: rgba(24, 231, 242, 0.52);
  background: rgba(24, 231, 242, 0.09);
  color: var(--cyan);
  box-shadow: var(--glow-sm);
}

.lang-flag {
  width: 32px;
  height: 22px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.lang-label {
  flex: 1;
  text-align: left;
}

.lang-code {
  font-size: 11px;
  font-weight: 800;
  color: var(--muted2);
  letter-spacing: 0.08em;
}

.lang-btn--active .lang-code {
  color: var(--cyan);
}

/* Coupon button styles */
.btn--coupon-main {
  width: 100%;
  min-height: 48px;
  padding: 16px 32px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 20px;
  border: 1px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.06);
  color: rgba(251, 191, 36, 0.9);
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.02em;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    border-color 0.15s,
    background 0.15s,
    color 0.15s;
}

.btn--coupon-main:hover {
  border-color: rgba(251, 191, 36, 0.55);
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  transform: translateY(-1px);
  box-shadow:
    0 8px 24px rgba(251, 191, 36, 0.15),
    0 0 16px rgba(251, 191, 36, 0.1);
}

.btn--coupon-main:active {
  transform: scale(0.98);
}

.coupon-subtitle {
  margin: 8px 0 18px;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.coupon-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.coupon-input {
  flex: 1;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--stroke-md);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.04em;
  outline: none;
  transition:
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}

.coupon-input::placeholder {
  color: var(--muted2);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.coupon-input:focus {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.04);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.12);
}

.coupon-scan-btn {
  width: 52px;
  min-height: 52px;
  border-radius: 14px;
  border: 1px solid var(--stroke-md);
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.2s,
    background 0.2s,
    color 0.2s,
    transform 0.13s,
    box-shadow 0.2s;
}

.coupon-scan-btn:hover {
  border-color: rgba(24, 231, 242, 0.45);
  background: rgba(24, 231, 242, 0.08);
  color: var(--cyan);
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(24, 231, 242, 0.15);
}

.scan-pulse-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 10px var(--cyan);
  animation: coupon-scan-pulse 1.2s ease-in-out infinite;
}

.scan-pulse-dot-sm {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  animation: coupon-scan-pulse 1.2s ease-in-out infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes coupon-scan-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 10px var(--cyan);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.7);
    box-shadow: 0 0 20px var(--cyan);
  }
}

.coupon-scan-hint {
  margin-top: 12px;
  font-size: 13px;
  color: var(--cyan);
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(24, 231, 242, 0.06);
  border: 1px solid rgba(24, 231, 242, 0.2);
  border-radius: 12px;
  animation: fadeIn 0.25s ease;
}

.coupon-message {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  animation: fadeIn 0.25s ease;
}

.coupon-message--success {
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.25);
  color: #4ade80;
}

.coupon-message--error {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: #f87171;
}
</style>