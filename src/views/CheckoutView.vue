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
          <div class="hero-eyebrow"><img src="../assets/logo-removebg-preview.png" /></div>
          <div class="status-text">
            <span v-if="status === 'idle'">{{ t('scanPrompt') }}</span>
            <span v-else-if="status === 'scanning'" class="status--scanning">{{
              t('scanning')
            }}</span>
            <span v-else-if="status === 'cancelled'" class="status--cancelled">{{
              t('cancelled')
            }}</span>
          </div>
          <div class="hero-sub" v-if="status === 'idle'">{{ t('heroSub') }}</div>
        </div>

        <div class="flow-block">
          <div class="camera-wrap">
            <div
              class="camera-window"
              :class="{
                'camera-window--error': cameraError && !cameraNoDevice,
                'camera-window--nodevice': cameraNoDevice,
              }"
            >
              <video
                v-show="cameraActive && !cameraError"
                ref="videoRef"
                autoplay
                playsinline
                muted
              ></video>

              <div v-if="cameraLoading" class="cam-overlay cam-overlay--loading">
                <div class="spinner-ring"></div>
                <span>{{ t('cameraLoading') }}</span>
              </div>

              <div v-else-if="cameraNoDevice" class="cam-overlay cam-overlay--neutral">
                <div class="cam-nodevice-icon">⚠️</div>
                <span class="cam-nodevice-title">{{ t('cameraNotAvailable') }}</span>
                <span class="cam-subhint">{{ t('barcodeNotSupported') }}</span>
              </div>

              <div v-else-if="cameraError" class="cam-overlay cam-overlay--error">
                <span class="cam-error-icon">⚠️</span>
                <span>{{ cameraError }}</span>
                <button class="retry-btn" @click="startCamera">{{ t('retry') }}</button>
              </div>

              <div v-else-if="!cameraActive" class="cam-overlay cam-overlay--inactive">
                <span>{{ t('cameraOff') }}</span>
              </div>

              <button
                class="cam-toggle"
                :class="{ 'cam-toggle--active': cameraActive }"
                :disabled="cameraNoDevice"
                @click="toggleCamera"
              >
                {{ cameraNoDevice ? t('noCamera') : cameraActive ? t('cameraOn') : t('cameraOff') }}
              </button>
            </div>
          </div>

          <div class="category-row">
            <button class="category-btn" @click="openProduce">
              <span class="category-label">{{ t('produce') }}</span>
              <span class="category-hint">PLU · {{ t('weightLabel') }}</span>
            </button>
            <button class="category-btn" @click="openBakery">
              <span class="category-label">{{ t('bakery') }}</span>
              <span class="category-hint">{{ t('bakerySubtitle') }}</span>
            </button>
          </div>

          <div class="action-row">
            <button class="btn btn--cancel" @click="cancel" :disabled="status === 'paying'">
              {{ t('cancel') }}
            </button>
            <button
              class="btn btn--pay"
              :disabled="orderItems.length === 0 || status === 'paying'"
              @click="pay"
            >
              <span v-if="status === 'paying'" class="spinner"></span>
              <span v-else>{{ t('pay') }}</span>
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-toast" role="alert">⚠️ {{ errorMessage }}</div>

        <div v-if="modal === 'produce'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-head">
              <div class="modal-icon">🥦</div>
              <div>
                <h3 class="modal-title">{{ t('produce') }}</h3>
                <p class="modal-subtitle">{{ t('produceSubtitle') }}</p>
              </div>
            </div>

            <div v-if="produceLoading" class="product-grid" style="display: flex; align-items: center; justify-content: center; min-height: 120px;">
              <div class="spinner-ring"></div>
            </div>
            <div v-else class="product-grid">
              <button
                v-for="p in produceCatalog"
                :key="p.sku"
                class="product-card"
                :class="{ 'product-card--selected': selectedProduce?.sku === p.sku }"
                @click="addWeighted(p)"
              >
                <div class="product-name">{{ getItemName(p) }}</div>
                <div class="product-price">
                  {{ formatPrice(p.pricePerKg) }}<span class="price-unit">/kg</span>
                </div>
              </button>
            </div>

            <div v-if="selectedProduce" class="weight-row">
              <label class="weight-label">{{ t('weightLabel') }}</label>
              <input
                v-model.number="weightKg"
                type="number"
                min="0.01"
                step="0.01"
                class="weight-input"
              />
              <span class="weight-preview"
                >= {{ formatPrice(selectedProduce.pricePerKg * weightKg) }}</span
              >
            </div>

            <div class="modal-actions">
              <button
                class="modal-btn modal-btn--back"
                @click="selectedProduce ? (selectedProduce = null) : closeModal()"
              >
                {{ t('back') }}
              </button>
              <button
                class="modal-btn modal-btn--done"
                :disabled="!selectedProduce"
                @click="confirmWeighted"
              >
                {{ t('add') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="modal === 'bakery'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-head">
              <div class="modal-icon">🥐</div>
              <div>
                <h3 class="modal-title">{{ t('bakery') }}</h3>
                <p class="modal-subtitle">{{ t('bakerySubtitle') }}</p>
              </div>
            </div>

            <div v-if="bakeryLoading" class="product-grid" style="display: flex; align-items: center; justify-content: center; min-height: 120px;">
              <div class="spinner-ring"></div>
            </div>
            <div v-else class="product-grid">
              <button
                v-for="b in bakeryCatalog"
                :key="b.sku"
                class="product-card"
                :class="{ 'product-card--selected': selectedBakery?.sku === b.sku }"
                @click="selectBakeryItem(b)"
              >
                <div class="product-name">{{ getItemName(b) }}</div>
                <div class="product-price">{{ formatPrice(b.price) }}</div>
              </button>
            </div>

            <div v-if="selectedBakery" class="weight-row">
              <label class="weight-label">{{ t('amount') }}</label>
              <div class="bakery-qty-picker">
                <button class="qty-btn" @click="bakeryAmount > 1 && bakeryAmount--">−</button>
                <span class="qty-val bakery-qty-val">{{ bakeryAmount }}</span>
                <button class="qty-btn" @click="bakeryAmount++">+</button>
              </div>
              <span class="weight-preview">= {{ formatPrice(selectedBakery.price * bakeryAmount) }}</span>
            </div>

            <div class="modal-actions">
              <button
                class="modal-btn modal-btn--back"
                @click="selectedBakery ? (selectedBakery = null) : closeModal()"
              >
                {{ t('back') }}
              </button>
              <button
                class="modal-btn modal-btn--done"
                :disabled="!selectedBakery"
                @click="confirmBakeryItem"
              >
                {{ t('add') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="modal === 'help'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card modal-card--sm">
            <h3 class="modal-title">{{ t('helpTitle') }}</h3>
            <ul class="help-list">
              <li v-for="(item, i) in helpItems" :key="i" v-html="item"></li>
            </ul>
            <div class="modal-actions">
              <button class="modal-btn modal-btn--done" @click="closeModal">
                {{ t('close') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="modal === 'lang'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card modal-card--sm">
            <h3 class="modal-title">{{ t('langTitle') }}</h3>
            <div class="lang-grid">
              <button
                v-for="lang in languages"
                :key="lang.code"
                class="lang-btn"
                :class="{ 'lang-btn--active': currentLang === lang.code }"
                @click="
                  setLanguage(lang.code); closeModal()
                "
              >
                <img :src="lang.flag" :alt="lang.label" class="lang-flag" />
                <span class="lang-label">{{ lang.label }}</span>
                <span class="lang-code">{{ lang.code.toUpperCase() }}</span>
              </button>
            </div>
            <div class="modal-actions">
              <button class="modal-btn modal-btn--back" @click="closeModal">
                {{ t('close') }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Teleport to="body">
      <div v-if="showCancelConfirm" class="delete-overlay" @click.self="showCancelConfirm = false">
        <div class="delete-confirm-card">
          <div class="delete-confirm-icon" style="color: #fbbf24; background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.25);">
          </div>
          <h3 class="delete-confirm-title">Bestellung abbrechen</h3>
          <p class="delete-confirm-text">
            Möchten Sie die Bestellung wirklich abbrechen? Alle Artikel werden entfernt.
          </p>
          <div class="delete-confirm-actions">
            <button class="delete-confirm-btn delete-confirm-btn--cancel" @click="showCancelConfirm = false">
              Zurück
            </button>
            <button class="delete-confirm-btn delete-confirm-btn--delete" @click="confirmCancel">
              Bestellung abbrechen
            </button>
          </div>
        </div>
      </div>

      <div v-if="confirmDeleteItem" class="delete-overlay" @click.self="confirmDeleteItem = null">
        <div class="delete-confirm-card">
          <div class="delete-confirm-icon">
          </div>
          <h3 class="delete-confirm-title">Produkt löschen</h3>
          <p class="delete-confirm-text">
            Wollen Sie <strong>{{ confirmDeleteItem.productName }}</strong> wirklich löschen?
          </p>
          <div class="delete-confirm-actions">
            <button class="delete-confirm-btn delete-confirm-btn--cancel" @click="confirmDeleteItem = null">
              Abbrechen
            </button>
            <button class="delete-confirm-btn delete-confirm-btn--delete" @click="deleteItem">
              Löschen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useSettingsStore } from '../stores/settings'
import { storeToRefs } from 'pinia'
import { useLanguage, translations as allTranslations } from '../components/Uselanguage'
import api, { fetchBakeryProducts, fetchFruitsAndVegetables } from '@/services/api'
import CartPanel from '../components/CartPanel.vue'
import { useFormatters } from '../composables/useFormatters'
import { useErrorToast } from '../composables/useErrorToast'

const router = useRouter()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()
const { currentLang, languages, t, tFn, setLanguage } = useLanguage()

const { formatPrice } = useFormatters()
const { errorMessage, showError } = useErrorToast()

const translations_local = allTranslations

const helpItems = computed(() => {
  const items = translations_local[currentLang.value]?.helpItems
  return items ?? translations_local.de.helpItems
})

const status = ref('idle')
const modal = ref(null)

const cameraNoDevice = ref(false)
const vatEnabled = ref(false)
const vatRate = ref(19)

const orderItems = ref([])
const orderTotalPrice = ref(0)

const scanBuffer = ref('')
let scanTimer = null

const cameraActive = ref(false)
const cameraLoading = ref(false)
const cameraError = ref('')
const videoRef = ref(null)
let mediaStream = null

const barcodeSupported = ref(null)
let barcodeDetector = null
let scanInterval = null
let scanCooldown = false


const produceCatalog = ref([])
const produceLoading = ref(false)

const bakeryCatalog = ref([])
const bakeryLoading = ref(false)
const selectedBakery = ref(null)
const bakeryAmount = ref(1)

const selectedProduce = ref(null)
const weightKg = ref(0.25)
const confirmDeleteItem = ref(null)
const showCancelConfirm = ref(false)


function isFruitsVegetables(item) {
  const cat = item.productCategory || item.category
  if (cat) return cat === 'FRUITS_VEGETABLES'
  return !Number.isInteger(item.amount)
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function getLocalizedName(item) {
  if (typeof item.name === 'object') {
    return item.name[currentLang.value] || item.name.de || Object.values(item.name)[0]
  }
  return item.name
}

function getItemName(item) {
  return getLocalizedName(item)
}

function getLocalizedCategory(item) {
  if (typeof item.category === 'object') {
    return item.category[currentLang.value] || item.category.de || Object.values(item.category)[0]
  }
  return item.category || t('bakery')
}

function addItem(item) {
  status.value = 'idle'
  cartStore.addItem({
    sku: item.sku,
    name: item.name,
    category: item.category,
    price: item.price,
    unit: 'each',
  })
}

function selectBakeryItem(item) {
  selectedBakery.value = item
  bakeryAmount.value = 1
}

async function confirmBakeryItem() {
  if (!selectedBakery.value) return
  if (!cartStore.orderId) {
    showError('Keine Order vorhanden')
    return
  }
  try {
    await api.post(`/orders/${cartStore.orderId}/items`, {
      code: selectedBakery.value.sku,
      amount: bakeryAmount.value,
    })
    await fetchOrder()
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Backware:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    showError(`Fehler: ${errorMsg}`)
  }
  selectedBakery.value = null
  bakeryAmount.value = 1
  closeModal()
}

function addWeighted(p) {
  selectedProduce.value = p
  weightKg.value = 0.25
}

async function confirmWeighted() {
  if (!selectedProduce.value) return
  const kg = Number(weightKg.value)
  if (!Number.isFinite(kg) || kg <= 0) return
  if (!cartStore.orderId) {
    showError('Keine Order vorhanden')
    return
  }
  try {
    await api.post(`/orders/${cartStore.orderId}/items`, {
      code: selectedProduce.value.sku,
      amount: kg,
    })
    await fetchOrder()
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Produkts:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    showError(`Fehler: ${errorMsg}`)
  }
  selectedProduce.value = null
  weightKg.value = 0.25
  closeModal()
}

async function updateItemQuantity(item, delta) {
  if (!cartStore.orderId) return
  try {
    await api.patch(`/orders/${cartStore.orderId}/items/${item.id}`, {
      delta: delta,
    })
    await fetchOrder()
  } catch (error) {
    console.error('Fehler beim Ändern der Menge:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    showError(`Fehler: ${errorMsg}`)
  }
}

async function deleteItem() {
  if (!confirmDeleteItem.value || !cartStore.orderId) return
  try {
    await api.delete(`/orders/${cartStore.orderId}/items/${confirmDeleteItem.value.id}`)
    await fetchOrder()
  } catch (error) {
    console.error('Fehler beim Löschen des Artikels:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    showError(`Fehler: ${errorMsg}`)
  }
  confirmDeleteItem.value = null
}

function removeLine(lineId) {
  cartStore.removeLine(lineId)
}
function inc(line) {
  cartStore.inc(line)
}
function dec(line) {
  cartStore.dec(line)
}

function handleKeydown(e) {
  const tag = (e.target?.tagName || '').toLowerCase()

  if (e.key === 'Escape' && modal.value) {
    closeModal()
    return
  }

  if (tag === 'input' || tag === 'textarea') return
  if (modal.value) return

  if (cameraActive.value && barcodeSupported.value === true) return

  if (scanTimer) window.clearTimeout(scanTimer)

  if (e.key === 'Enter') {
    const code = scanBuffer.value.trim()
    scanBuffer.value = ''
    if (code) onBarcodeScanned(code)
    return
  }

  if (e.key.length === 1) scanBuffer.value += e.key
  scanTimer = window.setTimeout(() => {
    scanBuffer.value = ''
  }, settingsStore.scannerBuffer)
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

async function onBarcodeScanned(code) {
  status.value = 'scanning'

  if (!cartStore.orderId) {
    showError(`${t('error')} - Keine Order vorhanden`)
    status.value = 'idle'
    return
  }

  try {
    await api.post(`/orders/${cartStore.orderId}/items`, {
      code: code,
      amount: 1,
    })
    console.log(`POST /api/orders/${cartStore.orderId}/items - code: ${code}`)

    await fetchOrder()
    status.value = 'idle'
  } catch (error) {
    console.error(`POST /api/orders/${cartStore.orderId}/items Error:`, error)
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    showError(`${t('error')} (${code}): ${errorMsg}`)
    status.value = 'idle'
  }
}

function openHelp() {
  modal.value = 'help'
}
function toggleLanguage() {
  modal.value = 'lang'
}
async function openProduce() {
  modal.value = 'produce'
  selectedProduce.value = null
  weightKg.value = 0.25
  if (produceCatalog.value.length === 0) {
    produceLoading.value = true
    try {
      const products = await fetchFruitsAndVegetables()
      produceCatalog.value = products.map((p) => ({
        sku: p.code,
        name: p.name,
        pricePerKg: p.price,
        category: p.category,
      }))
    } catch (err) {
      console.error('Fehler beim Laden der Produkte:', err)
      showError('Produkte konnten nicht geladen werden.')
    } finally {
      produceLoading.value = false
    }
  }
}
async function openBakery() {
  modal.value = 'bakery'
  selectedBakery.value = null
  bakeryAmount.value = 1
  if (bakeryCatalog.value.length === 0) {
    bakeryLoading.value = true
    try {
      const products = await fetchBakeryProducts()
      bakeryCatalog.value = products.map((p) => ({
        sku: p.code,
        name: p.name,
        price: p.price,
        category: p.category,
      }))
    } catch (err) {
      console.error('Fehler beim Laden der Backwaren:', err)
      showError('Backwaren konnten nicht geladen werden.')
    } finally {
      bakeryLoading.value = false
    }
  }
}
function closeModal() {
  modal.value = null
}

function cancel() {
  showCancelConfirm.value = true
}

async function confirmCancel() {
  showCancelConfirm.value = false
  try {
    if (cartStore.orderId) {
      await api.delete(`/orders/${cartStore.orderId}`)
    }
  } catch (error) {
    console.error('Fehler beim Abbrechen der Bestellung:', error)
  }
  cartStore.clearCart()
  scanBuffer.value = ''
  stopCamera()
  closeModal()
  router.push('/')
}

async function pay() {
  if (orderItems.value.length === 0) return
  status.value = 'paying'
  closeModal()
  stopCamera()

  await new Promise((r) => setTimeout(r, 400))
  status.value = 'paid'
  await new Promise((r) => setTimeout(r, 400))

  status.value = 'idle'
  router.push(settingsStore.paybackEnabled ? '/payback' : '/payment')
}

async function startCamera() {
  cameraLoading.value = true
  cameraError.value = ''
  cameraNoDevice.value = false

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraNoDevice.value = true
      throw new Error(t('cameraNotAvailable'))
    }

    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play()
    }

    cameraActive.value = true
    cameraLoading.value = false
    cameraError.value = ''
    cameraNoDevice.value = false

    if (barcodeSupported.value === null) {
      if ('BarcodeDetector' in window) {
        try {
          barcodeDetector = new BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
          })
          barcodeSupported.value = true
        } catch {
          barcodeSupported.value = false
          barcodeDetector = null
        }
      } else {
        barcodeSupported.value = false
        barcodeDetector = null
      }
    }

    if (barcodeSupported.value === true && barcodeDetector) {
      startBarcodeScanning()
    }
  } catch (err) {
    cameraLoading.value = false
    cameraActive.value = false
    cameraError.value = err?.message || t('cameraNotAvailable')

    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      cameraError.value = t('cameraPermissionDenied')
      return
    }

    if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
      cameraNoDevice.value = true
      cameraError.value = t('cameraNotAvailable')
      return
    }
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop())
    mediaStream = null
  }
  if (videoRef.value) videoRef.value.srcObject = null
  cameraActive.value = false
  stopBarcodeScanning()
}

function toggleCamera() {
  if (cameraNoDevice.value) return
  cameraActive.value ? stopCamera() : startCamera()
}

function startBarcodeScanning() {
  if (scanInterval || !barcodeDetector) return
  scanInterval = setInterval(async () => {
    if (!cameraActive.value || !videoRef.value || scanCooldown) return
    try {
      const video = videoRef.value
      if (video.readyState !== video.HAVE_ENOUGH_DATA) return
      const barcodes = await barcodeDetector.detect(video)
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue
        scanCooldown = true
        onBarcodeScanned(code)
        setTimeout(() => {
          scanCooldown = false
        }, settingsStore.cameraCooldown)
      }
    } catch {
      
    }
  }, 250)
}

function stopBarcodeScanning() {
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  fetchOrder()
  if (settingsStore.cameraAutoStart) {
    startCamera()
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopCamera()
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
