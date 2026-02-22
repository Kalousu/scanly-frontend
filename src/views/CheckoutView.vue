<template>
  <div class="page">
    <div class="card">
      <div v-if="cart.length === 0" class="empty-state">
        <div class="icon">🧾</div>
        <h2>{{ t.emptyTitle }}</h2>
        <p>{{ t.emptyHint }}</p>
      </div>

      <div v-else class="cart">
        <div class="cart-header">
          <h2>{{ t.cartTitle }}</h2>
          <div class="hint">{{ t.scanActive }}</div>
        </div>

        <div class="cart-items">
          <div v-for="item in cart" :key="item.lineId" class="cart-item">
            <div class="ci-left">
              <div class="ci-name">{{ item.name }}</div>
              <div class="ci-meta">
                <span v-if="item.sku">SKU: {{ item.sku }}</span>
                <span v-else>{{ item.category }}</span>
              </div>
            </div>

            <div class="ci-right">
              <div class="ci-price">{{ formatPrice(item.price) }}</div>

              <div class="ci-qty">
                <button class="qty-btn" @click="dec(item)">−</button>
                <div class="qty-val">{{ item.qty }}</div>
                <button class="qty-btn" @click="inc(item)">+</button>
              </div>

              <button class="remove" @click="removeLine(item.lineId)">✕</button>
            </div>
          </div>
        </div>

        <div class="totals">
          <div class="row">
            <span>{{ t.subtotal }}</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="row small" v-if="vatEnabled">
            <span>{{ t.vat }}</span>
            <span>{{ formatPrice(vatAmount) }}</span>
          </div>
          <div class="row total">
            <span>{{ t.total }}</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="paying">
      <div class="top-actions">
        <button class="action-btn" @click="toggleLanguage">{{ t.language }}</button>
        <button class="action-btn" @click="openHelp">{{ t.help }}</button>
        <button
          class="action-btn"
          :class="{ active: vatEnabled }"
          @click="vatEnabled = !vatEnabled"
        >
          MwSt
        </button>
      </div>

      <div class="scan-text">
        <div v-if="status === 'idle'">{{ t.scanPrompt }}</div>
        <div v-else-if="status === 'scanning'">{{ t.scanning }}</div>
        <div v-else-if="status === 'paying'">{{ t.paying }}</div>
        <div v-else-if="status === 'paid'">{{ t.paid }}</div>
        <div v-else-if="status === 'cancelled'">{{ t.cancelled }}</div>

        <div class="scan-debug" v-if="scanBuffer.length">
          Scan: <strong>{{ scanBuffer }}</strong>
        </div>
      </div>

      <div class="camera-container">
        <div class="camera-window" :class="{ error: cameraError }">
          <video
            v-show="cameraActive && !cameraError"
            ref="videoRef"
            autoplay
            playsinline
            muted
          ></video>

          <div v-if="cameraLoading" class="camera-overlay loading">
            <div class="spinner-small"></div>
            <span>{{ t.cameraLoading }}</span>
          </div>

          <div v-else-if="cameraError" class="camera-overlay error">
            <div class="error-icon">📷</div>
            <span>{{ cameraError }}</span>
            <button class="retry-btn" @click="startCamera">{{ t.retry }}</button>
          </div>

          <div v-else-if="!cameraActive" class="camera-overlay inactive">
            <span>{{ t.cameraOff }}</span>
          </div>

          <button class="camera-toggle" @click="toggleCamera" :class="{ active: cameraActive }">
            {{ cameraActive ? t.cameraOn : t.cameraOff }}
          </button>
        </div>

        <div v-if="barcodeSupported === false" class="barcode-warning">
          {{ t.barcodeNotSupported }}
        </div>
      </div>

      <div v-if="errorMessage" class="error-toast">⚠️ {{ errorMessage }}</div>

      <div class="category-buttons">
        <button class="category-btn" @click="openProduce">
          🥦
          <span>{{ t.produce }}</span>
        </button>

        <button class="category-btn" @click="openBakery">
          🥐
          <span>{{ t.bakery }}</span>
        </button>
      </div>

      <div class="buttons">
        <button class="btn cancel" @click="cancel" :disabled="status === 'paying'">
          {{ t.cancel }}
        </button>
        <button class="btn pay" :disabled="cart.length === 0 || status === 'paying'" @click="pay">
          <span v-if="status === 'paying'" class="spinner"></span>
          <span v-else>{{ t.pay }}</span>
        </button>
      </div>

      <div v-if="modal === 'produce'" class="modal">
        <div class="modal-card">
          <div class="modal-title">{{ t.selectProduce }}</div>
          <div class="grid">
            <button v-for="p in produceCatalog" :key="p.sku" class="pill" @click="addWeighted(p)">
              {{ getItemName(p) }} · {{ formatPrice(p.pricePerKg) }}{{ t.priceKg }}
            </button>
          </div>

          <div class="weight-row">
            <label>{{ t.weightLabel }}</label>
            <input v-model.number="weightKg" type="number" min="0.01" step="0.01" />
            <button class="pill primary" @click="confirmWeighted">{{ t.add }}</button>
          </div>

          <div class="modal-actions">
            <button class="pill" @click="closeModal">{{ t.close }}</button>
          </div>
        </div>
      </div>

      <div v-if="modal === 'bakery'" class="modal">
        <div class="modal-card">
          <div class="modal-title">{{ t.selectBakery }}</div>
          <div class="grid">
            <button v-for="b in bakeryCatalog" :key="b.sku" class="pill" @click="addItem(b)">
              {{ getItemName(b) }} · {{ formatPrice(b.price) }}
            </button>
          </div>

          <div class="modal-actions">
            <button class="pill" @click="closeModal">{{ t.close }}</button>
          </div>
        </div>
      </div>

      <div v-if="modal === 'help'" class="modal">
        <div class="modal-card">
          <div class="modal-title">{{ t.helpTitle }}</div>
          <ul class="help-list">
            <li v-if="language === 'de'">
              Scanner: einfach scannen, <b>Enter</b> beendet den Barcode.
            </li>
            <li v-if="language === 'de'">Gemüse/Obst: auswählen, Gewicht eingeben, hinzufügen.</li>
            <li v-if="language === 'de'">Backwaren: antippen zum Hinzufügen.</li>
            <li v-if="language === 'de'">Abbrechen: Warenkorb wird geleert.</li>
            <li v-if="language === 'en'">Scanner: just scan, <b>Enter</b> finishes the barcode.</li>
            <li v-if="language === 'en'">Produce: select, enter weight, add.</li>
            <li v-if="language === 'en'">Bakery: tap to add.</li>
            <li v-if="language === 'en'">Cancel: empties the cart.</li>
          </ul>
          <div class="modal-actions">
            <button class="pill" @click="closeModal">{{ t.close }}</button>
          </div>
        </div>
      </div>

      <div v-if="modal === 'lang'" class="modal">
        <div class="modal-card">
          <div class="modal-title">{{ t.langTitle }}</div>
          <div class="grid">
            <button class="pill" @click="setLanguage('de')">Deutsch</button>
            <button class="pill" @click="setLanguage('en')">English</button>
          </div>
          <div class="modal-actions">
            <button class="pill" @click="closeModal">{{ t.close }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const status = ref('idle')
const language = ref('de')
const modal = ref(null)

const vatEnabled = ref(false)
const vatRate = ref(19)

const cart = cartStore.items

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

const catalogByBarcode = {
  123456789: {
    sku: '123456789',
    name: { de: 'Wasser', en: 'Water' },
    price: 0.79,
    category: { de: 'Getränke', en: 'Drinks' },
  },
  123450000: {
    sku: '123450000',
    name: { de: 'Schokolade', en: 'Chocolate' },
    price: 1.29,
    category: { de: 'Süßwaren', en: 'Sweets' },
  },
  129999999: {
    sku: '129999999',
    name: { de: 'Milch', en: 'Milk' },
    price: 1.19,
    category: { de: 'Kühlregal', en: 'Dairy' },
  },
  111111111: {
    sku: '111111111',
    name: { de: 'Brot', en: 'Bread' },
    price: 1.99,
    category: { de: 'Backwaren', en: 'Bakery' },
  },
  222222222: {
    sku: '222222222',
    name: { de: 'Butter', en: 'Butter' },
    price: 1.49,
    category: { de: 'Kühlregal', en: 'Dairy' },
  },
  333333333: {
    sku: '333333333',
    name: { de: 'Käse', en: 'Cheese' },
    price: 2.99,
    category: { de: 'Kühlregal', en: 'Dairy' },
  },
  444444444: {
    sku: '444444444',
    name: { de: 'Joghurt', en: 'Yogurt' },
    price: 0.99,
    category: { de: 'Kühlregal', en: 'Dairy' },
  },
  555555555: {
    sku: '555555555',
    name: { de: 'Apfelsaft', en: 'Apple Juice' },
    price: 1.79,
    category: { de: 'Getränke', en: 'Drinks' },
  },
  666666666: {
    sku: '666666666',
    name: { de: 'Chips', en: 'Chips' },
    price: 1.99,
    category: { de: 'Snacks', en: 'Snacks' },
  },
  777777777: {
    sku: '777777777',
    name: { de: 'Cola', en: 'Cola' },
    price: 1.59,
    category: { de: 'Getränke', en: 'Drinks' },
  },
}

const produceCatalog = ref([
  { sku: 'PLU-APL', name: { de: 'Apfel', en: 'Apple' }, pricePerKg: 2.49 },
  { sku: 'PLU-BAN', name: { de: 'Banane', en: 'Banana' }, pricePerKg: 1.99 },
  { sku: 'PLU-TOM', name: { de: 'Tomate', en: 'Tomato' }, pricePerKg: 3.29 },
  { sku: 'PLU-GUR', name: { de: 'Gurke', en: 'Cucumber' }, pricePerKg: 1.79 },
  { sku: 'PLU-MOE', name: { de: 'Möhren', en: 'Carrots' }, pricePerKg: 2.19 },
  { sku: 'PLU-PAP', name: { de: 'Paprika', en: 'Pepper' }, pricePerKg: 4.49 },
  { sku: 'PLU-BIR', name: { de: 'Birne', en: 'Pear' }, pricePerKg: 2.99 },
  { sku: 'PLU-ORI', name: { de: 'Orange', en: 'Orange' }, pricePerKg: 2.29 },
])

const bakeryCatalog = ref([
  {
    sku: 'BAK-CRO',
    name: { de: 'Croissant', en: 'Croissant' },
    price: 0.99,
    category: { de: 'Backwaren', en: 'Bakery' },
  },
  {
    sku: 'BAK-BRO',
    name: { de: 'Brötchen', en: 'Roll' },
    price: 0.39,
    category: { de: 'Backwaren', en: 'Bakery' },
  },
  {
    sku: 'BAK-BRE',
    name: { de: 'Brezel', en: 'Pretzel' },
    price: 0.89,
    category: { de: 'Backwaren', en: 'Bakery' },
  },
  {
    sku: 'BAK-SEM',
    name: { de: 'Semmel', en: 'Bread Roll' },
    price: 0.35,
    category: { de: 'Backwaren', en: 'Bakery' },
  },
  {
    sku: 'BAK-MI',
    name: { de: 'Milchbrötchen', en: 'Milk Roll' },
    price: 0.65,
    category: { de: 'Backwaren', en: 'Bakery' },
  },
  {
    sku: 'BAK-WE',
    name: { de: 'Weizenbrot', en: 'Wheat Bread' },
    price: 2.49,
    category: { de: 'Backwaren', en: 'Bakery' },
  },
])

const selectedProduce = ref(null)
const weightKg = ref(0.25)
const errorMessage = ref('')
let errorTimeout = null

const t = computed(() => ({
  emptyTitle: language.value === 'de' ? 'Noch keine Artikel gescannt' : 'No items scanned yet',
  emptyHint:
    language.value === 'de'
      ? 'Scanne ein Produkt, um es hier anzuzeigen.'
      : 'Scan a product to display it here.',
  cartTitle: language.value === 'de' ? 'Warenkorb' : 'Shopping Cart',
  scanActive:
    language.value === 'de'
      ? 'Scan aktiv (Enter beendet Scan)'
      : 'Scan active (Enter finishes scan)',
  subtotal: language.value === 'de' ? 'Zwischensumme' : 'Subtotal',
  vat: language.value === 'de' ? `MwSt (${vatRate.value}%)` : `VAT (${vatRate.value}%)`,
  total: language.value === 'de' ? 'Gesamt' : 'Total',
  scanPrompt:
    language.value === 'de' ? 'Bitte scannen Sie Ihre Artikel ein' : 'Please scan your items',
  scanning: language.value === 'de' ? 'Scanne...' : 'Scanning...',
  paying: language.value === 'de' ? 'Zahlung wird verarbeitet...' : 'Payment processing...',
  paid: language.value === 'de' ? 'Bezahlt. Danke!' : 'Paid. Thank you!',
  cancelled: language.value === 'de' ? 'Vorgang abgebrochen.' : 'Transaction cancelled.',
  help: language.value === 'de' ? 'Hilfe' : 'Help',
  language: language.value === 'de' ? 'Sprache' : 'Language',
  produce: language.value === 'de' ? 'Gemüse / Obst' : 'Produce',
  bakery: language.value === 'de' ? 'Backwaren' : 'Bakery',
  cancel: language.value === 'de' ? 'Abbrechen' : 'Cancel',
  pay: language.value === 'de' ? 'Zahlen' : 'Pay',
  close: language.value === 'de' ? 'Schließen' : 'Close',
  add: language.value === 'de' ? 'Hinzufügen' : 'Add',
  selectProduce: language.value === 'de' ? 'Gemüse / Obst auswählen' : 'Select Produce',
  selectBakery: language.value === 'de' ? 'Backwaren auswählen' : 'Select Bakery',
  weightLabel: language.value === 'de' ? 'Gewicht (kg)' : 'Weight (kg)',
  unknown: language.value === 'de' ? 'Unbekannter Artikel' : 'Unknown item',
  helpTitle: language.value === 'de' ? 'Hilfe' : 'Help',
  langTitle: language.value === 'de' ? 'Sprache' : 'Language',
  priceKg: language.value === 'de' ? '/kg' : '/kg',
  error: language.value === 'de' ? 'Artikel nicht gefunden!' : 'Item not found!',
  cameraLoading: language.value === 'de' ? 'Kamera startet...' : 'Starting camera...',
  cameraOff: language.value === 'de' ? 'Kamera aus' : 'Camera off',
  cameraOn: language.value === 'de' ? 'Kamera an' : 'Camera on',
  retry: language.value === 'de' ? 'Erneut versuchen' : 'Retry',
  cameraPermissionDenied:
    language.value === 'de' ? 'Kamera-Zugriff verweigert' : 'Camera access denied',
  cameraNotAvailable: language.value === 'de' ? 'Keine Kamera verfügbar' : 'No camera available',
  barcodeNotSupported:
    language.value === 'de'
      ? 'Barcode-Scanning im Browser nicht unterstützt – bitte Hardware-Scanner verwenden.'
      : 'Barcode scanning not supported in browser – please use hardware scanner.',
}))

const subtotal = computed(() => cartStore.subtotal)

const vatAmount = computed(() => {
  if (!vatEnabled.value) return 0
  return subtotal.value * (vatRate.value / 100)
})

const total = computed(() => subtotal.value + vatAmount.value)

function round2(n) {
  return Math.round(n * 100) / 100
}

function formatPrice(n) {
  return new Intl.NumberFormat(language.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)
}

function getLocalizedName(item) {
  if (typeof item.name === 'object') {
    return item.name[language.value] || item.name.de || Object.values(item.name)[0]
  }
  return item.name
}

function getItemName(item) {
  return getLocalizedName(item)
}

function getLocalizedCategory(item) {
  if (typeof item.category === 'object') {
    return item.category[language.value] || item.category.de || Object.values(item.category)[0]
  }
  return item.category || 'Artikel'
}

function addItem(item) {
  status.value = 'idle'

  cartStore.addItem({
    sku: item.sku,
    name: getLocalizedName(item),
    category: getLocalizedCategory(item),
    price: item.price,
    unit: 'each',
  })
}

function addWeighted(p) {
  selectedProduce.value = p
  weightKg.value = 0.25
}

function confirmWeighted() {
  if (!selectedProduce.value) return

  const kg = Number(weightKg.value)
  if (!Number.isFinite(kg) || kg <= 0) return

  status.value = 'idle'

  const linePrice = selectedProduce.value.pricePerKg * kg
  const itemName = getLocalizedName(selectedProduce.value)
  const categoryName = language.value === 'de' ? 'Gemüse/Obst' : 'Produce'

  cartStore.addWeighted(
    {
      sku: selectedProduce.value.sku,
      name: `${itemName} (${kg.toFixed(2)} kg)`,
      category: categoryName,
      price: round2(linePrice),
    },
    kg,
  )

  selectedProduce.value = null
  weightKg.value = 0.25
  closeModal()
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
  const tag = (e.target && e.target.tagName && e.target.tagName.toLowerCase()) || ''
  if (tag === 'input' || tag === 'textarea') return

  if (scanTimer) window.clearTimeout(scanTimer)

  if (e.key === 'Enter') {
    const code = scanBuffer.value.trim()
    scanBuffer.value = ''
    if (code) onBarcodeScanned(code)
    return
  }

  if (e.key.length === 1) {
    scanBuffer.value += e.key
  }

  scanTimer = window.setTimeout(() => {
    scanBuffer.value = ''
  }, 120)
}

function onBarcodeScanned(code) {
  status.value = 'scanning'

  const item = catalogByBarcode[code]
  if (!item) {
    showError(`${t.value.error} (${code})`)
    status.value = 'idle'
    return
  }

  setTimeout(() => {
    addItem(item)
    status.value = 'idle'
  }, 300)
}

function showError(msg) {
  if (errorTimeout) clearTimeout(errorTimeout)
  errorMessage.value = msg
  errorTimeout = setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

function openHelp() {
  modal.value = 'help'
}

function toggleLanguage() {
  modal.value = 'lang'
}

function setLanguage(lang) {
  language.value = lang
  closeModal()
}

function openProduce() {
  modal.value = 'produce'
}

function openBakery() {
  modal.value = 'bakery'
}

function closeModal() {
  modal.value = null
}

function cancel() {
  cartStore.clearCart()
  scanBuffer.value = ''
  status.value = 'cancelled'
  closeModal()
}

async function pay() {
  if (cart.length === 0) return

  status.value = 'paying'
  closeModal()
  stopCamera()

  await new Promise((r) => setTimeout(r, 900))

  status.value = 'paid'

  await new Promise((r) => setTimeout(r, 900))
  status.value = 'idle'

  router.push('/payback')
}

async function startCamera() {
  cameraLoading.value = true
  cameraError.value = ''

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(t.value.cameraNotAvailable)
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

    if (barcodeSupported.value === null) {
      if ('BarcodeDetector' in window) {
        try {
          barcodeDetector = new BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
          })
          barcodeSupported.value = true
          startBarcodeScanning()
        } catch {
          barcodeSupported.value = false
        }
      } else {
        barcodeSupported.value = false
      }
    }
  } catch (err) {
    cameraLoading.value = false
    cameraActive.value = false

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = t.value.cameraPermissionDenied
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraError.value = t.value.cameraNotAvailable
    } else {
      cameraError.value = err.message || t.value.cameraNotAvailable
    }
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
  cameraActive.value = false
  stopBarcodeScanning()
}

function toggleCamera() {
  if (cameraActive.value) {
    stopCamera()
  } else {
    startCamera()
  }
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
        }, 1500)
      }
    } catch {
      /* ignore detection errors */
    }
  }, 250)
}

function stopBarcodeScanning() {
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
}

function cleanup() {
  stopCamera()
  if (scanTimer) {
    clearTimeout(scanTimer)
    scanTimer = null
  }
  if (errorTimeout) {
    clearTimeout(errorTimeout)
    errorTimeout = null
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  startCamera()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  cleanup()
})

defineExpose({
  status,
  language,
  modal,
  vatEnabled,
  vatRate,
  cart,
  scanBuffer,
  produceCatalog,
  bakeryCatalog,
  selectedProduce,
  weightKg,
  subtotal,
  vatAmount,
  total,
  formatPrice,
  addItem,
  addWeighted,
  confirmWeighted,
  removeLine,
  inc,
  dec,
  openHelp,
  toggleLanguage,
  setLanguage,
  openProduce,
  openBakery,
  closeModal,
  cancel,
  pay,
  cameraActive,
  cameraLoading,
  cameraError,
  startCamera,
  stopCamera,
  toggleCamera,
  onBarcodeScanned,
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
  background: linear-gradient(to bottom, #7a5cc2, #6e4fb3);
}
</style>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7%;
  padding: 120px;
  box-sizing: border-box;
}

.card,
.paying {
  background: #f4f4f6;
  border-radius: 25px;
  min-height: 80vh;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.card {
  width: 25vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.paying {
  width: 60vw;
  position: relative;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-actions {
  position: absolute;
  top: 25px;
  right: 30px;
  display: flex;
  gap: 15px;
}

.scan-text {
  text-align: center;
  font-size: 30px;
  font-weight: 600;
  color: #6b6b6b;
  margin-top: 8%;
  margin-bottom: 30px;
  letter-spacing: 0.5px;
}

.action-btn {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
}

.action-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
}

.action-btn.active {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 75%;
  margin: 0 auto;
}

.camera-window {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 24px;
  overflow: hidden;
  background: #1a1a2e;
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.25);
  border: 3px solid rgba(124, 58, 237, 0.3);
}

.camera-window video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: 500;
}

.camera-overlay.loading {
  background: rgba(26, 26, 46, 0.95);
}

.camera-overlay.error {
  background: rgba(127, 29, 29, 0.9);
}

.camera-overlay.inactive {
  background: rgba(26, 26, 46, 0.85);
}

.error-icon {
  font-size: 48px;
  opacity: 0.8;
}

.retry-btn {
  margin-top: 8px;
  padding: 12px 28px;
  border-radius: 20px;
  border: none;
  background: white;
  color: #dc2626;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  transform: scale(1.05);
}

.camera-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  z-index: 10;
}

.camera-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.camera-toggle.active {
  background: rgba(16, 185, 129, 0.8);
}

.spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.barcode-warning {
  margin-top: 12px;
  padding: 10px 20px;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.category-buttons {
  display: flex;
  justify-content: center;
  gap: 80px;
}

.category-btn {
  width: 40%;
  height: 150px;
  border-radius: 26px;
  border: none;
  cursor: pointer;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.35);
  transition: all 0.25s ease;
}

.category-btn span {
  font-size: 20px;
}

.category-btn:hover {
  transform: translateY(-6px);
  box-shadow: 0 30px 60px rgba(124, 58, 237, 0.5);
}

.category-btn:active {
  transform: scale(0.96);
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.btn {
  padding: 14px 36px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:active {
  transform: scale(0.97);
}

.cancel {
  background: transparent;
  border: 2px solid #7c3aed;
  color: #7c3aed;
}

.cancel:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-2px);
}

.pay {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
}

.pay:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.6);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  color: #6b6b6b;
}

.empty-state .icon {
  font-size: 50px;
  margin-bottom: 15px;
  opacity: 0.7;
}

.empty-state h2 {
  font-weight: 600;
  margin: 0;
  font-size: 22px;
}

.empty-state p {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.8;
}

.cart {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.cart-header h2 {
  margin: 0;
  font-size: 18px;
  color: #3f3f46;
}

.hint {
  font-size: 12px;
  color: #71717a;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 52vh;
  overflow: auto;
  padding-right: 6px;
}

.cart-item {
  background: white;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
}

.ci-name {
  font-weight: 600;
  color: #27272a;
}

.ci-meta {
  font-size: 12px;
  color: #71717a;
  margin-top: 2px;
}

.ci-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ci-price {
  font-weight: 700;
  color: #3f3f46;
  min-width: 90px;
  text-align: right;
}

.ci-qty {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 999px;
  padding: 6px 10px;
}

.qty-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  color: #7c3aed;
}

.qty-val {
  min-width: 22px;
  text-align: center;
  font-weight: 700;
  color: #3f3f46;
}

.remove {
  border: none;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
  border-radius: 10px;
  width: 34px;
  height: 34px;
}

.totals {
  margin-top: auto;
  background: rgba(0, 0, 0, 0.03);
  padding: 14px 16px;
  border-radius: 16px;
}

.totals .row {
  display: flex;
  justify-content: space-between;
  color: #3f3f46;
  font-weight: 600;
  margin: 6px 0;
}

.totals .row.small {
  font-weight: 500;
  color: #71717a;
  font-size: 13px;
}

.totals .row.total {
  font-size: 18px;
  font-weight: 800;
  margin-top: 10px;
}

.scan-debug {
  margin-top: 10px;
  font-size: 14px;
  color: #71717a;
}

.error-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #fee2e2;
  color: #dc2626;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 18px;
  box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
  z-index: 100;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.modal {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  padding: 18px;
}

.modal-card {
  width: min(720px, 95%);
  background: #f7f7fb;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
}

.modal-title {
  font-weight: 700;
  color: #2b2b2f;
  margin-bottom: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pill {
  border: none;
  cursor: pointer;
  border-radius: 16px;
  padding: 12px 14px;
  font-weight: 700;
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
}

.pill.primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.weight-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.weight-row input {
  flex: 1;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
}

.help-list {
  margin: 0;
  padding-left: 18px;
  color: #3f3f46;
  line-height: 1.6;
}

.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0 auto;
  width: 75%;
}

.camera-window {
  width: 100%;
  height: 280px;
  background: #1a1a2e;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.25),
    0 0 0 4px rgba(255, 255, 255, 0.1);
}

.camera-window video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-window.error {
  background: #2a2a3e;
}

.camera-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #a1a1aa;
  font-size: 15px;
  font-weight: 500;
}

.camera-overlay.loading {
  background: rgba(26, 26, 46, 0.95);
}

.camera-overlay.error {
  background: rgba(42, 42, 62, 0.98);
  color: #fca5a5;
}

.camera-overlay.inactive {
  background: rgba(26, 26, 46, 0.9);
}

.spinner-small {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(124, 58, 237, 0.3);
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-icon {
  font-size: 36px;
}

.retry-btn {
  margin-top: 8px;
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
}

.retry-btn:active {
  transform: scale(0.96);
}

.camera-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px 14px;
  border-radius: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  z-index: 10;
}

.camera-toggle:hover {
  background: rgba(124, 58, 237, 0.8);
}

.camera-toggle.active {
  background: rgba(16, 185, 129, 0.8);
}

.barcode-warning {
  padding: 10px 16px;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 900px) {
  .camera-window {
    height: 220px;
  }

  .camera-container {
    width: 85%;
  }
}

@media (max-width: 600px) {
  .camera-window {
    height: 180px;
  }

  .camera-container {
    width: 92%;
  }
}
</style>
