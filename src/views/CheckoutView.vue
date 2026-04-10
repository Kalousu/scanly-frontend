<template>
  <div class="checkout-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <div class="layout">
      <CartPanel
        :items="orderItems"
        :total-price="orderTotalPrice"
        :editable="true"
        :show-scan-badge="true"
        @update-quantity="updateItemQuantity"
        @delete-item="(item) => confirmDeleteItem = item"
      />

      <main class="panel scan-panel">
        <CheckoutHeaderActions
          :vat-enabled="vatEnabled"
          :t="t"
          @language="modal = 'lang'"
          @help="modal = 'help'"
          @toggle-vat="vatEnabled = !vatEnabled"
        />

        <CheckoutHeroStatus :status="status" :t="t" />

        <div class="flow-block">
          <CheckoutScannerPanel
            ref="scannerPanelRef"
            :auto-start="settingsStore.cameraAutoStart"
            :cooldown="settingsStore.cameraCooldown"
            :t="t"
            @scan="onBarcodeScanned"
          />

          <CheckoutCategoryActions :t="t" @produce="openProduce" @bakery="openBakery" />

          <CheckoutFlowActions
            :item-count="orderItems.length"
            :status="status"
            :t="t"
            @cancel="showCancelConfirm = true"
            @pay="pay"
          />
        </div>

        <div v-if="errorMessage" class="error-toast" role="alert">{{ errorMessage }}</div>

        <ProductPickerModal
          :visible="modal === 'vegetables'"
          mode="vegetables"
          :catalog="produceCatalog"
          :loading="produceLoading"
          :selected="selectedProduce"
          :weight-kg="weightKg"
          :t="t"
          :get-item-name="getItemName"
          @select="addWeighted"
          @deselect="selectedProduce = null"
          @confirm="confirmWeighted"
          @update:weight-kg="weightKg = $event"
          @close="closeModal"
        />

        <ProductPickerModal
          :visible="modal === 'bakery'"
          mode="bakery"
          :catalog="bakeryCatalog"
          :loading="bakeryLoading"
          :selected="selectedBakery"
          :amount="bakeryAmount"
          :t="t"
          :get-item-name="getItemName"
          @select="selectBakeryItem"
          @deselect="selectedBakery = null"
          @confirm="confirmBakeryItem"
          @update:amount="bakeryAmount = $event"
          @close="closeModal"
        />

        <CheckoutHelpModal
          :visible="modal === 'help'"
          :items="helpItems"
          :t="t"
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

    <CheckoutConfirmDialogs
      :show-cancel-confirm="showCancelConfirm"
      :delete-item="confirmDeleteItem"
      :t="t"
      :t-fn="tFn"
      @cancel-order-dismiss="showCancelConfirm = false"
      @cancel-order-confirm="confirmCancel"
      @delete-item-dismiss="confirmDeleteItem = null"
      @delete-item-confirm="deleteItem"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'
import { useLanguage, translations as allTranslations } from '@/components/Uselanguage'
import CartPanel from '@/components/CartPanel.vue'
import LanguageModal from '@/components/LanguageModal.vue'
import ProductPickerModal from '@/components/ProductPickerModal.vue'
import CheckoutCategoryActions from '@/components/checkout/CheckoutCategoryActions.vue'
import CheckoutConfirmDialogs from '@/components/checkout/CheckoutConfirmDialogs.vue'
import CheckoutFlowActions from '@/components/checkout/CheckoutFlowActions.vue'
import CheckoutHeaderActions from '@/components/checkout/CheckoutHeaderActions.vue'
import CheckoutHelpModal from '@/components/checkout/CheckoutHelpModal.vue'
import CheckoutHeroStatus from '@/components/checkout/CheckoutHeroStatus.vue'
import CheckoutScannerPanel from '@/components/checkout/CheckoutScannerPanel.vue'
import { useErrorToast } from '@/composables/useErrorToast'
import { useKeyboardBarcodeScanner } from '@/composables/useKeyboardBarcodeScanner'
import { useOrderSession } from '@/composables/useOrderSession'
import { useProductCatalogPicker } from '@/composables/useProductCatalogPicker'

const router = useRouter()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()
const { currentLang, languages, t, tFn, setLanguage } = useLanguage()

const { errorMessage, showError } = useErrorToast()

const translations_local = allTranslations

const helpItems = computed(() => {
  const items = translations_local[currentLang.value]?.helpItems
  return items ?? translations_local.de.helpItems
})

const status = ref('idle')
const modal = ref(null)
const vatEnabled = ref(false)
const confirmDeleteItem = ref(null)
const showCancelConfirm = ref(false)
const scannerPanelRef = ref(null)

const {
  orderItems,
  orderTotalPrice,
  fetchOrder,
  addItemByCode,
  updateItemQuantity,
  removeItem,
  cancelOrder,
} = useOrderSession(cartStore, showError)

const {
  produceCatalog,
  produceLoading,
  selectedProduce,
  weightKg,
  bakeryCatalog,
  bakeryLoading,
  selectedBakery,
  bakeryAmount,
  getLocalizedName,
  addWeighted,
  selectBakeryItem,
  openProduce,
  openBakery,
} = useProductCatalogPicker({ modal, showError })

function getItemName(item) {
  return getLocalizedName(item, currentLang.value)
}

async function confirmBakeryItem() {
  if (!selectedBakery.value) return
  const added = await addItemByCode(selectedBakery.value.sku, bakeryAmount.value)
  if (added) {
    selectedBakery.value = null
    bakeryAmount.value = 1
    closeModal()
  }
}

async function confirmWeighted() {
  if (!selectedProduce.value) return
  const kg = Number(weightKg.value)
  if (!Number.isFinite(kg) || kg <= 0) return
  const added = await addItemByCode(selectedProduce.value.sku, kg)
  if (added) {
    selectedProduce.value = null
    weightKg.value = 0.25
    closeModal()
  }
}

async function deleteItem() {
  await removeItem(confirmDeleteItem.value)
  confirmDeleteItem.value = null
}

async function onBarcodeScanned(code) {
  status.value = 'scanning'

  await addItemByCode(code, 1)
  status.value = 'idle'
}

function selectLanguage(code) {
  setLanguage(code)
  closeModal()
}
function closeModal() {
  modal.value = null
}

async function confirmCancel() {
  showCancelConfirm.value = false
  const cancelled = await cancelOrder()
  if (!cancelled) return
  cartStore.clearCart()
  clearBuffer()
  scannerPanelRef.value?.stopCamera()
  closeModal()
  router.push('/')
}

async function pay() {
  if (orderItems.value.length === 0) return
  status.value = 'paying'
  closeModal()
  scannerPanelRef.value?.stopCamera()

  await new Promise((r) => setTimeout(r, 400))
  status.value = 'paid'
  await new Promise((r) => setTimeout(r, 400))

  status.value = 'idle'
  router.push(settingsStore.paybackEnabled ? '/payback' : '/payment')
}

function isCameraScannerActive() {
  const nativeScanning = scannerPanelRef.value?.isNativeScanning
  return nativeScanning?.value ?? Boolean(nativeScanning)
}

const { clearBuffer } = useKeyboardBarcodeScanner({
  timeout: settingsStore.scannerBuffer,
  onScan: onBarcodeScanned,
  isEnabled: (event) => {
    if (event.key === 'Escape' && modal.value) {
      closeModal()
      return false
    }
    return !modal.value && !isCameraScannerActive()
  },
})

onMounted(() => {
  fetchOrder()
})
</script>

<style>
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

<style>
.checkout-page {
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
  background: radial-gradient(600px 400px at 65% 45%, rgba(24, 231, 242, 0.18), transparent 60%);
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
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  padding: 36px 32px;
  box-sizing: border-box;
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
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border: 1px solid var(--stroke);
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
  border-color: rgba(24, 231, 242, 0.28);
  background: rgba(24, 231, 242, 0.045);
  transform: translateX(2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    -4px 0 20px rgba(24, 231, 242, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.22);
}

.ci-left {
  flex: 1;
  min-width: 0;
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
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--stroke-md);
  border-radius: 10px;
  padding: 4px 8px;
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
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
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

.delete-btn {
  border: none;
  background: rgba(248, 113, 113, 0.08);
  cursor: pointer;
  color: var(--muted2);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(248, 113, 113, 0.15);
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s,
    transform 0.13s;
}

.delete-btn:hover {
  background: rgba(248, 113, 113, 0.18);
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.35);
  transform: scale(1.08);
}

.delete-btn:active {
  transform: scale(0.95);
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
.btn:focus-visible,
.category-btn:focus-visible,
.retry-btn:focus-visible {
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
  font-size: 13px;
  color: var(--muted2);
  font-weight: 500;
  letter-spacing: 0.01em;
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
  gap: 16px;
  margin-top: 8px;
}

.camera-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 78%;
  margin: 0 auto;
}

.camera-window {
  width: 100%;
  height: 47vh;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--stroke-md);
  box-shadow:
    0 32px 90px rgba(0, 0, 0, 0.55),
    0 0 60px rgba(24, 231, 242, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: border-color 0.2s;
}

.camera-window--error {
  border-color: rgba(248, 113, 113, 0.4);
  box-shadow:
    0 18px 55px rgba(0, 0, 0, 0.42),
    0 0 20px rgba(248, 113, 113, 0.12);
}
.camera-window--nodevice {
  border-color: rgba(255, 255, 255, 0.09);
}
.camera-window video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes scan-sweep {
  0% {
    top: 14%;
    opacity: 0.9;
  }
  45% {
    top: 82%;
    opacity: 0.9;
  }
  50% {
    top: 82%;
    opacity: 0;
  }
  55% {
    top: 14%;
    opacity: 0;
  }
  100% {
    top: 14%;
    opacity: 0.9;
  }
}

.cam-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  padding: 20px;
  text-align: center;
}

.cam-overlay--loading {
  background: rgba(7, 26, 42, 0.96);
}
.cam-overlay--error {
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.9);
}
.cam-overlay--inactive {
  background: rgba(7, 26, 42, 0.9);
}
.cam-overlay--neutral {
  background: rgba(7, 26, 42, 0.9);
  color: rgba(255, 255, 255, 0.84);
}

.cam-nodevice-icon {
  font-size: 40px;
  opacity: 0.7;
  margin-bottom: 2px;
}
.cam-nodevice-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
.cam-error-icon {
  font-size: 32px;
}
.cam-subhint {
  font-size: 12px;
  color: var(--muted2);
  max-width: 300px;
  line-height: 1.5;
}

.spinner-ring {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: var(--cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.retry-btn {
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid rgba(24, 231, 242, 0.35);
  background: linear-gradient(90deg, var(--cyan), var(--cyan2));
  color: rgba(0, 0, 0, 0.8);
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  box-shadow: var(--glow);
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.retry-btn:hover {
  transform: translateY(-1px) scale(1.01);
}

.cam-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid var(--stroke-md);
  background: rgba(0, 0, 0, 0.44);
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition:
    border-color 0.15s,
    transform 0.13s,
    box-shadow 0.15s,
    color 0.15s;
  z-index: 10;
}
.cam-toggle:hover {
  transform: translateY(-1px);
  border-color: var(--stroke-hover);
  color: var(--text);
}
.cam-toggle--active {
  border-color: rgba(24, 231, 242, 0.55);
  color: var(--cyan);
  box-shadow: var(--glow-sm);
}
.cam-toggle:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  transform: none;
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

.category-row {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.category-btn {
  flex: 1;
  max-width: 240px;
  height: 128px;
  transform: scale(1.02);
  border-radius: 22px;
  border: 1px solid var(--stroke-md);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  backdrop-filter: blur(10px);
  box-shadow:
    var(--shadow-card),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition:
    transform 0.15s,
    border-color 0.18s,
    box-shadow 0.18s,
    background 0.18s;
}

.category-btn:hover {
  transform: translateY(-3px);
  border-color: rgba(24, 231, 242, 0.38);
  background: rgba(24, 231, 242, 0.055);
  box-shadow:
    0 18px 52px rgba(0, 0, 0, 0.38),
    0 0 20px rgba(24, 231, 242, 0.14);
}
.category-btn:active {
  transform: scale(0.98);
}

.category-label {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: 0.01em;
}
.category-hint {
  font-size: 11px;
  color: var(--muted2);
  font-weight: 500;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
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
  border-color: rgba(248, 113, 113, 0.4);
  color: #fca5a5;
  background: rgba(248, 113, 113, 0.06);
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
    0 18px 40px rgba(24, 231, 242, 0.25),
    0 0 18px rgba(24, 231, 242, 0.15);
  animation: pay-pulse 3s ease-in-out infinite;
}

@keyframes pay-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 1px rgba(24, 231, 242, 0.3),
      0 8px 24px rgba(24, 231, 242, 0.35),
      0 24px 55px rgba(24, 231, 242, 0.22);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(24, 231, 242, 0.45),
      0 8px 32px rgba(24, 231, 242, 0.48),
      0 28px 65px rgba(24, 231, 242, 0.3);
  }
}

.btn--pay:disabled {
  animation: none;
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

.modal-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.modal-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--stroke-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.02em;
}
.modal-subtitle {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--muted2);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  overflow-y: auto;
  max-height: 45vh;
  padding: 4px 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
}

.product-card {
  aspect-ratio: 1;
  border-radius: 18px;
  border: 1px solid var(--stroke);
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  transition:
    border-color 0.15s,
    transform 0.13s,
    background 0.15s,
    box-shadow 0.15s;
  font-family: inherit;
}
.product-card:hover {
  border-color: var(--stroke-hover);
  transform: translateY(-2px);
  background: rgba(24, 231, 242, 0.05);
  box-shadow: var(--shadow-card);
}
.product-card--selected {
  border-color: var(--cyan);
  background: rgba(24, 231, 242, 0.09);
  box-shadow:
    0 0 0 1px rgba(24, 231, 242, 0.35),
    var(--glow-sm);
}
.product-card:active {
  transform: scale(0.96);
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  line-height: 1.2;
}
.product-price {
  font-size: 12px;
  color: var(--muted);
  font-weight: 650;
}
.price-unit {
  font-size: 10px;
  font-weight: 500;
  color: var(--muted2);
}

.weight-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  background: rgba(24, 231, 242, 0.05);
  border: 1px solid rgba(24, 231, 242, 0.18);
  border-radius: 14px;
  margin-top: 14px;
}
.weight-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}
.weight-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.28);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  outline: none;
  font-family: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.weight-input:focus {
  border-color: rgba(24, 231, 242, 0.5);
  box-shadow: 0 0 0 3px rgba(24, 231, 242, 0.1);
}
.weight-preview {
  font-size: 14px;
  font-weight: 750;
  color: var(--cyan);
  white-space: nowrap;
  min-width: 70px;
  text-align: right;
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

.bakery-qty-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 6px 10px;
}

.bakery-qty-picker .qty-btn {
  width: 32px;
  height: 32px;
  font-size: 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--stroke);
}

.bakery-qty-picker .qty-btn:hover {
  color: var(--cyan);
  background: rgba(24, 231, 242, 0.12);
  border-color: rgba(24, 231, 242, 0.3);
}

.bakery-qty-val {
  min-width: 32px;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
}

.delete-confirm-card {
  text-align: center;
  align-items: center;
}

.delete-confirm-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.delete-confirm-text {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
}

.delete-confirm-text strong {
  color: var(--text);
  font-weight: 700;
}

.modal-btn--delete {
  background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 30px rgba(248, 113, 113, 0.25);
}

.modal-btn--delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 40px rgba(248, 113, 113, 0.35);
}

.modal-btn--delete:active {
  transform: scale(0.98);
}
</style>
