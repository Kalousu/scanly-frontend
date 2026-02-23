<template>
  <div class="checkout-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <div class="layout">

      <aside class="panel cart-panel">
        <div v-if="cart.length === 0" class="empty-state">
          <div class="empty-icon">🧾</div>
          <h2 class="empty-title">{{ t.emptyTitle }}</h2>
          <p class="empty-hint">{{ t.emptyHint }}</p>
        </div>

        <div v-else class="cart">
          <div class="cart-header">
            <h2 class="cart-title">{{ t.cartTitle }}</h2>
            <span class="scan-badge">{{ t.scanActive }}</span>
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
                  <span class="qty-val">{{ item.qty }}</span>
                  <button class="qty-btn" @click="inc(item)">+</button>
                </div>

                <button class="remove-btn" @click="removeLine(item.lineId)" aria-label="Entfernen">✕</button>
              </div>
            </div>
          </div>

          <div class="totals">
            <div class="totals-row">
              <span>{{ t.subtotal }}</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="totals-row totals-vat" v-if="vatEnabled">
              <span>{{ t.vat }}</span>
              <span>{{ formatPrice(vatAmount) }}</span>
            </div>
            <div class="totals-row totals-total">
              <span>{{ t.total }}</span>
              <span>{{ formatPrice(total) }}</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="panel scan-panel">

        <div class="top-actions">
          <button class="action-pill" @click="toggleLanguage">{{ t.language }}</button>
          <button class="action-pill" @click="openHelp">{{ t.help }}</button>
          <button
            class="action-pill"
            :class="{ 'action-pill--active': vatEnabled }"
            @click="vatEnabled = !vatEnabled"
          >
            MwSt
          </button>
        </div>

        <div class="status-text">
          <span v-if="status === 'idle'">{{ t.scanPrompt }}</span>
          <span v-else-if="status === 'scanning'">{{ t.scanning }}</span>
          <span v-else-if="status === 'paying'">{{ t.paying }}</span>
          <span v-else-if="status === 'paid'">{{ t.paid }}</span>
          <span v-else-if="status === 'cancelled'">{{ t.cancelled }}</span>
        </div>

        <div class="camera-wrap">
          <div class="camera-window" :class="{ 'camera-window--error': cameraError }">
            <video
              v-show="cameraActive && !cameraError"
              ref="videoRef"
              autoplay
              playsinline
              muted
            ></video>

            <div v-if="cameraActive && !cameraError" class="scan-guides" aria-hidden="true">
              <span class="guide guide--tl"></span>
              <span class="guide guide--tr"></span>
              <span class="guide guide--bl"></span>
              <span class="guide guide--br"></span>
            </div>

            <div v-if="cameraLoading" class="cam-overlay cam-overlay--loading">
              <div class="spinner-ring"></div>
              <span>{{ t.cameraLoading }}</span>
            </div>

            <div v-else-if="cameraError" class="cam-overlay cam-overlay--error">
              <span class="cam-error-icon">📷</span>
              <span>{{ cameraError }}</span>
              <button class="retry-btn" @click="startCamera">{{ t.retry }}</button>
            </div>

            <div v-else-if="!cameraActive" class="cam-overlay cam-overlay--inactive">
              <span>{{ t.cameraOff }}</span>
            </div>

            <button
              class="cam-toggle"
              :class="{ 'cam-toggle--active': cameraActive }"
              @click="toggleCamera"
            >
              {{ cameraActive ? t.cameraOn : t.cameraOff }}
            </button>
          </div>

          <div v-if="barcodeSupported === false" class="barcode-warning">
            {{ t.barcodeNotSupported }}
          </div>
        </div>

        <div v-if="errorMessage" class="error-toast" role="alert">
          ⚠️ {{ errorMessage }}
        </div>

        <div class="category-row">
          <button class="category-btn" @click="openProduce">
            <span class="category-emoji">🥦</span>
            <span class="category-label">{{ t.produce }}</span>
          </button>
          <button class="category-btn" @click="openBakery">
            <span class="category-emoji">🥐</span>
            <span class="category-label">{{ t.bakery }}</span>
          </button>
        </div>

        <div class="action-row">
          <button class="btn btn--cancel" @click="cancel" :disabled="status === 'paying'">
            {{ t.cancel }}
          </button>
          <button
            class="btn btn--pay"
            :disabled="cart.length === 0 || status === 'paying'"
            @click="pay"
          >
            <span v-if="status === 'paying'" class="spinner"></span>
            <span v-else>{{ t.pay }}</span>
          </button>
        </div>

        <div v-if="modal === 'produce'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-head">
              <div class="modal-icon">🥦</div>
              <h3 class="modal-title">{{ t.produce }}</h3>
            </div>

            <div class="product-grid">
              <button
                v-for="p in produceCatalog"
                :key="p.sku"
                class="product-card"
                :class="{ 'product-card--selected': selectedProduce?.sku === p.sku }"
                @click="addWeighted(p)"
              >
                <div class="product-name">{{ getItemName(p) }}</div>
                <div class="product-price">{{ formatPrice(p.pricePerKg) }}{{ t.priceKg }}</div>
              </button>
            </div>

            <div v-if="selectedProduce" class="weight-row">
              <label class="weight-label">{{ t.weightLabel }}</label>
              <input
                v-model.number="weightKg"
                type="number"
                min="0.01"
                step="0.01"
                class="weight-input"
              />
            </div>

            <div class="modal-actions">
              <button class="modal-btn modal-btn--back" @click="selectedProduce ? (selectedProduce = null) : closeModal()">
                Zurück
              </button>
              <button class="modal-btn modal-btn--done" :disabled="!selectedProduce" @click="confirmWeighted">
                Fertig
              </button>
            </div>
          </div>
        </div>

        <div v-if="modal === 'bakery'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-head">
              <div class="modal-icon">🥐</div>
              <h3 class="modal-title">{{ t.bakery }}</h3>
            </div>

            <div class="product-grid">
              <button
                v-for="b in bakeryCatalog"
                :key="b.sku"
                class="product-card"
                @click="addItem(b); closeModal()"
              >
                <div class="product-name">{{ getItemName(b) }}</div>
                <div class="product-price">{{ formatPrice(b.price) }}</div>
              </button>
            </div>

            <div class="modal-actions">
              <button class="modal-btn modal-btn--back" @click="closeModal">Zurück</button>
              <button class="modal-btn modal-btn--done" @click="closeModal">Fertig</button>
            </div>
          </div>
        </div>

        <div v-if="modal === 'help'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card modal-card--sm">
            <h3 class="modal-title">{{ t.helpTitle }}</h3>
            <ul class="help-list">
              <li v-if="language === 'de'">Scanner: einfach scannen, <strong>Enter</strong> beendet den Barcode.</li>
              <li v-if="language === 'de'">Gemüse/Obst: auswählen, Gewicht eingeben, hinzufügen.</li>
              <li v-if="language === 'de'">Backwaren: antippen zum Hinzufügen.</li>
              <li v-if="language === 'de'">Abbrechen: Warenkorb wird geleert.</li>
              <li v-if="language === 'en'">Scanner: just scan, <strong>Enter</strong> finishes the barcode.</li>
              <li v-if="language === 'en'">Produce: select, enter weight, add.</li>
              <li v-if="language === 'en'">Bakery: tap to add.</li>
              <li v-if="language === 'en'">Cancel: empties the cart.</li>
            </ul>
            <div class="modal-actions">
              <button class="modal-btn modal-btn--done" @click="closeModal">{{ t.close }}</button>
            </div>
          </div>
        </div>

        <div v-if="modal === 'lang'" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card modal-card--sm">
            <h3 class="modal-title">{{ t.langTitle }}</h3>
            <div class="lang-grid">
              <button class="lang-btn" @click="setLanguage('de')">Deutsch</button>
              <button class="lang-btn" @click="setLanguage('en')">English</button>
            </div>
            <div class="modal-actions">
              <button class="modal-btn modal-btn--back" @click="closeModal">{{ t.close }}</button>
            </div>
          </div>
        </div>

      </main>
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
  123456789: { sku: '123456789', name: { de: 'Wasser', en: 'Water' }, price: 0.79, category: { de: 'Getränke', en: 'Drinks' } },
  123450000: { sku: '123450000', name: { de: 'Schokolade', en: 'Chocolate' }, price: 1.29, category: { de: 'Süßwaren', en: 'Sweets' } },
  129999999: { sku: '129999999', name: { de: 'Milch', en: 'Milk' }, price: 1.19, category: { de: 'Kühlregal', en: 'Dairy' } },
  111111111: { sku: '111111111', name: { de: 'Brot', en: 'Bread' }, price: 1.99, category: { de: 'Backwaren', en: 'Bakery' } },
  222222222: { sku: '222222222', name: { de: 'Butter', en: 'Butter' }, price: 1.49, category: { de: 'Kühlregal', en: 'Dairy' } },
  333333333: { sku: '333333333', name: { de: 'Käse', en: 'Cheese' }, price: 2.99, category: { de: 'Kühlregal', en: 'Dairy' } },
  444444444: { sku: '444444444', name: { de: 'Joghurt', en: 'Yogurt' }, price: 0.99, category: { de: 'Kühlregal', en: 'Dairy' } },
  555555555: { sku: '555555555', name: { de: 'Apfelsaft', en: 'Apple Juice' }, price: 1.79, category: { de: 'Getränke', en: 'Drinks' } },
  666666666: { sku: '666666666', name: { de: 'Chips', en: 'Chips' }, price: 1.99, category: { de: 'Snacks', en: 'Snacks' } },
  777777777: { sku: '777777777', name: { de: 'Cola', en: 'Cola' }, price: 1.59, category: { de: 'Getränke', en: 'Drinks' } },
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
  { sku: 'BAK-CRO', name: { de: 'Croissant', en: 'Croissant' }, price: 0.99, category: { de: 'Backwaren', en: 'Bakery' } },
  { sku: 'BAK-BRO', name: { de: 'Brötchen', en: 'Roll' }, price: 0.39, category: { de: 'Backwaren', en: 'Bakery' } },
  { sku: 'BAK-BRE', name: { de: 'Brezel', en: 'Pretzel' }, price: 0.89, category: { de: 'Backwaren', en: 'Bakery' } },
  { sku: 'BAK-SEM', name: { de: 'Semmel', en: 'Bread Roll' }, price: 0.35, category: { de: 'Backwaren', en: 'Bakery' } },
  { sku: 'BAK-MI', name: { de: 'Milchbrötchen', en: 'Milk Roll' }, price: 0.65, category: { de: 'Backwaren', en: 'Bakery' } },
  { sku: 'BAK-WE', name: { de: 'Weizenbrot', en: 'Wheat Bread' }, price: 2.49, category: { de: 'Backwaren', en: 'Bakery' } },
])

const selectedProduce = ref(null)
const weightKg = ref(0.25)
const errorMessage = ref('')
let errorTimeout = null

const t = computed(() => ({
  emptyTitle: language.value === 'de' ? 'Noch keine Artikel gescannt' : 'No items scanned yet',
  emptyHint: language.value === 'de' ? 'Scanne ein Produkt, um es hier anzuzeigen.' : 'Scan a product to display it here.',
  cartTitle: language.value === 'de' ? 'Warenkorb' : 'Shopping Cart',
  scanActive: language.value === 'de' ? 'Scan aktiv' : 'Scan active',
  subtotal: language.value === 'de' ? 'Zwischensumme' : 'Subtotal',
  vat: language.value === 'de' ? `MwSt (${vatRate.value}%)` : `VAT (${vatRate.value}%)`,
  total: language.value === 'de' ? 'Gesamt' : 'Total',
  scanPrompt: language.value === 'de' ? 'Bitte scannen Sie Ihre Artikel ein' : 'Please scan your items',
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
  weightLabel: language.value === 'de' ? 'Gewicht (kg)' : 'Weight (kg)',
  helpTitle: language.value === 'de' ? 'Hilfe' : 'Help',
  langTitle: language.value === 'de' ? 'Sprache' : 'Language',
  priceKg: '/kg',
  error: language.value === 'de' ? 'Artikel nicht gefunden!' : 'Item not found!',
  cameraLoading: language.value === 'de' ? 'Kamera startet...' : 'Starting camera...',
  cameraOff: language.value === 'de' ? 'Kamera aus' : 'Camera off',
  cameraOn: language.value === 'de' ? 'Kamera an' : 'Camera on',
  retry: language.value === 'de' ? 'Erneut versuchen' : 'Retry',
  cameraPermissionDenied: language.value === 'de' ? 'Kamera-Zugriff verweigert' : 'Camera access denied',
  cameraNotAvailable: language.value === 'de' ? 'Keine Kamera verfügbar' : 'No camera available',
  barcodeNotSupported: language.value === 'de'
    ? 'Barcode-Scanning im Browser nicht unterstützt – bitte Hardware-Scanner verwenden.'
    : 'Barcode scanning not supported in browser – please use hardware scanner.',
}))

const subtotal = computed(() => cartStore.subtotal)
const vatAmount = computed(() => vatEnabled.value ? subtotal.value * (vatRate.value / 100) : 0)
const total = computed(() => subtotal.value + vatAmount.value)

function round2(n) { return Math.round(n * 100) / 100 }

function formatPrice(n) {
  return new Intl.NumberFormat(language.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency', currency: 'EUR',
  }).format(n)
}

function getLocalizedName(item) {
  if (typeof item.name === 'object') return item.name[language.value] || item.name.de || Object.values(item.name)[0]
  return item.name
}

function getItemName(item) { return getLocalizedName(item) }

function getLocalizedCategory(item) {
  if (typeof item.category === 'object') return item.category[language.value] || item.category.de || Object.values(item.category)[0]
  return item.category || 'Artikel'
}

function addItem(item) {
  status.value = 'idle'
  cartStore.addItem({ sku: item.sku, name: getLocalizedName(item), category: getLocalizedCategory(item), price: item.price, unit: 'each' })
}

function addWeighted(p) { selectedProduce.value = p; weightKg.value = 0.25 }

function confirmWeighted() {
  if (!selectedProduce.value) return
  const kg = Number(weightKg.value)
  if (!Number.isFinite(kg) || kg <= 0) return
  status.value = 'idle'
  const linePrice = selectedProduce.value.pricePerKg * kg
  const itemName = getLocalizedName(selectedProduce.value)
  const categoryName = language.value === 'de' ? 'Gemüse/Obst' : 'Produce'
  cartStore.addWeighted({ sku: selectedProduce.value.sku, name: `${itemName} (${kg.toFixed(2)} kg)`, category: categoryName, price: round2(linePrice) }, kg)
  selectedProduce.value = null; weightKg.value = 0.25; closeModal()
}

function removeLine(lineId) { cartStore.removeLine(lineId) }
function inc(line) { cartStore.inc(line) }
function dec(line) { cartStore.dec(line) }

function handleKeydown(e) {
  const tag = (e.target?.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea') return
  if (modal.value) return
  if (scanTimer) window.clearTimeout(scanTimer)
  if (e.key === 'Enter') {
    const code = scanBuffer.value.trim(); scanBuffer.value = ''
    if (code) onBarcodeScanned(code); return
  }
  if (e.key.length === 1) scanBuffer.value += e.key
  scanTimer = window.setTimeout(() => { scanBuffer.value = '' }, 120)
}

function onBarcodeScanned(code) {
  status.value = 'scanning'
  const item = catalogByBarcode[code]
  if (!item) { showError(`${t.value.error} (${code})`); status.value = 'idle'; return }
  setTimeout(() => { addItem(item); status.value = 'idle' }, 300)
}

function showError(msg) {
  if (errorTimeout) clearTimeout(errorTimeout)
  errorMessage.value = msg
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 3000)
}

function openHelp() { modal.value = 'help' }
function toggleLanguage() { modal.value = 'lang' }
function setLanguage(lang) { language.value = lang; closeModal() }
function openProduce() { modal.value = 'produce' }
function openBakery() { modal.value = 'bakery' }
function closeModal() { modal.value = null }

function cancel() { cartStore.clearCart(); scanBuffer.value = ''; status.value = 'cancelled'; closeModal() }

async function pay() {
  if (cart.length === 0) return
  status.value = 'paying'; closeModal(); stopCamera()
  await new Promise(r => setTimeout(r, 900))
  status.value = 'paid'
  await new Promise(r => setTimeout(r, 900))
  status.value = 'idle'
  router.push('/payback')
}

async function startCamera() {
  cameraLoading.value = true; cameraError.value = ''
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error(t.value.cameraNotAvailable)
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
    if (videoRef.value) { videoRef.value.srcObject = mediaStream; await videoRef.value.play() }
    cameraActive.value = true; cameraLoading.value = false
    if (barcodeSupported.value === null) {
      if ('BarcodeDetector' in window) {
        try { barcodeDetector = new BarcodeDetector({ formats: ['ean_13','ean_8','code_128','code_39','qr_code','upc_a','upc_e'] }); barcodeSupported.value = true; startBarcodeScanning() }
        catch { barcodeSupported.value = false }
      } else { barcodeSupported.value = false }
    }
  } catch(err) {
    cameraLoading.value = false; cameraActive.value = false
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') cameraError.value = t.value.cameraPermissionDenied
    else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') cameraError.value = t.value.cameraNotAvailable
    else cameraError.value = err.message || t.value.cameraNotAvailable
  }
}

function stopCamera() {
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null }
  if (videoRef.value) videoRef.value.srcObject = null
  cameraActive.value = false; stopBarcodeScanning()
}

function toggleCamera() { cameraActive.value ? stopCamera() : startCamera() }

function startBarcodeScanning() {
  if (scanInterval || !barcodeDetector) return
  scanInterval = setInterval(async () => {
    if (!cameraActive.value || !videoRef.value || scanCooldown) return
    try {
      const video = videoRef.value
      if (video.readyState !== video.HAVE_ENOUGH_DATA) return
      const barcodes = await barcodeDetector.detect(video)
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue; scanCooldown = true; onBarcodeScanned(code)
        setTimeout(() => { scanCooldown = false }, 1500)
      }
    } catch { /* balsdasd*/ }
  }, 250)
}

function stopBarcodeScanning() { if (scanInterval) { clearInterval(scanInterval); scanInterval = null } }

onMounted(() => { window.addEventListener('keydown', handleKeydown); startCamera() })
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopCamera()
  if (scanTimer) clearTimeout(scanTimer)
  if (errorTimeout) clearTimeout(errorTimeout)
})
</script>

<style>
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}
body {
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}
</style>

<style scoped>
:root {
  --navy-0: #071A2A;
  --navy-1: #0B2C44;
  --navy-2: #092538;

  --panel-bg:     rgba(10, 30, 45, 0.70);
  --panel-strong: rgba(10, 30, 45, 0.85);
  --stroke:       rgba(255, 255, 255, 0.10);
  --stroke-hover: rgba(24, 231, 242, 0.30);

  --text:   rgba(255, 255, 255, 0.92);
  --muted:  rgba(255, 255, 255, 0.60);
  --muted2: rgba(255, 255, 255, 0.40);

  --cyan:  #18E7F2;
  --cyan2: #1BC7FF;

  --glow:   0 18px 45px rgba(24, 231, 242, 0.22);
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.checkout-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
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
}

.panel {
  background: var(--panel-bg);
  border: 1px solid var(--stroke);
  border-radius: 28px;
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.cart-panel {
  width: 30%;
  min-width: 280px;
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

.empty-icon { font-size: 48px; opacity: 0.7; }

.empty-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}

.empty-hint {
  margin: 0;
  font-size: 13px;
  color: var(--muted2);
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
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.scan-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--cyan);
  background: rgba(24, 231, 242, 0.10);
  border: 1px solid rgba(24, 231, 242, 0.25);
  padding: 4px 12px;
  border-radius: 999px;
  letter-spacing: 0.03em;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.10) transparent;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(0,0,0,0.18);
  border: 1px solid var(--stroke);
  border-radius: 16px;
  transition: border-color 0.15s;
}

.cart-item:hover { border-color: var(--stroke-hover); }

.ci-left { flex: 1; min-width: 0; }

.ci-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ci-meta {
  font-size: 11px;
  color: var(--muted2);
  margin-top: 2px;
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
  font-weight: 700;
  color: var(--text);
  min-width: 52px;
  text-align: right;
}

.ci-qty {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--stroke);
  border-radius: 10px;
  padding: 3px 8px;
}

.qty-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
  padding: 0;
  line-height: 1;
  transition: color 0.13s;
}

.qty-btn:hover { color: var(--text); }

.qty-val {
  min-width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.remove-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--muted2);
  font-size: 13px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.13s, color 0.13s;
}

.remove-btn:hover {
  background: rgba(248,113,113,0.12);
  color: #fca5a5;
}

.totals {
  margin-top: 16px;
  border-top: 1px solid var(--stroke);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--muted);
  padding: 3px 0;
}

.totals-vat { color: var(--muted2); font-size: 12px; }

.totals-total {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--stroke);
}

.scan-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 36px 40px;
  box-sizing: border-box;
  position: relative;
}

.top-actions {
  position: absolute;
  top: 28px;
  right: 32px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.87);
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.13s, box-shadow 0.18s;
}

.action-pill:hover {
  color: #fff;
  background: rgba(0, 212, 232, 0.08);
  border-color: rgba(24, 231, 242, 0.30);
  box-shadow: 0 0 12px rgba(24, 231, 242, 0.12);
  transform: translateY(-1px);
}

.action-pill--active {
  border-color: rgba(24, 231, 242, 0.55);
  box-shadow: var(--glow);
  color: var(--cyan);
}

.status-text {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
  margin-top: 52px;
  margin-bottom: 20px;
  letter-spacing: 0.01em;
}

.camera-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 72%;
  margin: 0 auto;
}

.camera-window {
  width: 100%;
  height: 260px;
  background: rgba(0,0,0,0.35);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--stroke);
  box-shadow: 0 18px 55px rgba(0,0,0,0.40);
  transition: border-color 0.2s;
}

.camera-window--error { border-color: rgba(248,113,113,0.45); }

.camera-window video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-guides {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.guide {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: var(--cyan);
  border-style: solid;
  opacity: 0.7;
}

.guide--tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
.guide--tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
.guide--bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
.guide--br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

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
}

.cam-overlay--loading { background: rgba(7,26,42,0.95); }
.cam-overlay--error   { background: rgba(42,18,18,0.96); color: #fca5a5; }
.cam-overlay--inactive { background: rgba(7,26,42,0.88); }

.cam-error-icon { font-size: 36px; }

.spinner-ring {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255,255,255,0.12);
  border-top-color: var(--cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.retry-btn {
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid rgba(24,231,242,0.35);
  background: linear-gradient(90deg, var(--cyan), var(--cyan2));
  color: rgba(0,0,0,0.80);
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  box-shadow: var(--glow);
  transition: transform 0.15s, box-shadow 0.15s;
}

.retry-btn:hover { transform: translateY(-1px) scale(1.01); }

.cam-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid var(--stroke);
  background: rgba(0,0,0,0.40);
  color: var(--text);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: border-color 0.15s, transform 0.13s, box-shadow 0.15s;
  z-index: 10;
}

.cam-toggle:hover { transform: translateY(-1px); border-color: var(--stroke-hover); }
.cam-toggle--active { border-color: rgba(24,231,242,0.55); box-shadow: 0 0 14px rgba(24,231,242,0.18); }

.barcode-warning {
  padding: 9px 16px;
  background: rgba(245,158,11,0.12);
  color: #d97706;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.error-toast {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(248,113,113,0.14);
  color: var(--text);
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid rgba(248,113,113,0.35);
  box-shadow: 0 18px 60px rgba(0,0,0,0.45);
  z-index: 100;
  white-space: nowrap;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.category-row {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.category-btn {
  flex: 1;
  max-width: 240px;
  height: 120px;
  border-radius: 24px;
  border: 1px solid var(--stroke);
  background: rgba(0,0,0,0.20);
  color: var(--text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 40px rgba(0,0,0,0.28);
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.category-btn:hover {
  transform: translateY(-2px);
  border-color: var(--stroke-hover);
  box-shadow: 0 18px 52px rgba(0,0,0,0.38);
}

.category-btn:active { transform: scale(0.98); }

.category-emoji { font-size: 30px; }

.category-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
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
  border: 1px solid var(--stroke);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0,0,0,0.18);
  color: var(--text);
  letter-spacing: 0.02em;
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn--cancel {
  color: var(--muted);
  border-color: rgba(255,255,255,0.14);
}

.btn--cancel:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(248,113,113,0.40);
}

.btn--pay {
  border: none;
  background: linear-gradient(90deg, var(--cyan) 0%, var(--cyan2) 100%);
  color: rgba(0,0,0,0.80);
  box-shadow: var(--glow);
  min-width: 120px;
}

.btn--pay:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.015);
  box-shadow: 0 22px 55px rgba(24,231,242,0.30);
}

.btn:active:not(:disabled) { transform: scale(0.98); }

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(0,0,0,0.25);
  border-top-color: rgba(0,0,0,0.70);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  width: min(900px, 95%);
  max-height: 82vh;
  background: var(--panel-strong);
  border: 1px solid var(--stroke);
  border-radius: 26px;
  padding: 28px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-card--sm { width: min(480px, 95%); }

.modal-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.modal-icon {
  font-size: 36px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--stroke);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  overflow-y: auto;
  max-height: 45vh;
  padding: 4px 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.product-card {
  aspect-ratio: 1;
  border-radius: 18px;
  border: 1px solid var(--stroke);
  background: rgba(0,0,0,0.20);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  transition: border-color 0.15s, transform 0.13s, background 0.15s, box-shadow 0.15s;
}

.product-card:hover {
  border-color: var(--stroke-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0,0,0,0.30);
}

.product-card--selected {
  border-color: var(--cyan);
  background: rgba(24,231,242,0.08);
  box-shadow: 0 0 0 1px rgba(24,231,242,0.35), var(--glow);
}

.product-card:active { transform: scale(0.96); }

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.product-price {
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
}

.weight-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(0,0,0,0.18);
  border: 1px solid var(--stroke);
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
  background: rgba(0,0,0,0.28);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.weight-input:focus { border-color: rgba(24,231,242,0.45); }

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
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}

.modal-btn--back {
  background: rgba(255,255,255,0.07);
  color: var(--muted);
  border: 1px solid var(--stroke);
}

.modal-btn--back:hover { background: rgba(255,255,255,0.11); transform: translateY(-1px); }

.modal-btn--done {
  background: linear-gradient(90deg, var(--cyan) 0%, var(--cyan2) 100%);
  color: rgba(0,0,0,0.80);
  box-shadow: var(--glow);
}

.modal-btn--done:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 22px 50px rgba(24,231,242,0.28); }
.modal-btn--done:disabled { opacity: 0.4; cursor: not-allowed; }
.modal-btn:active:not(:disabled) { transform: scale(0.98); }

.help-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.8;
  font-size: 14px;
}

.help-list strong { color: var(--text); }

.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.lang-btn {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--stroke);
  background: rgba(0,0,0,0.20);
  color: var(--text);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, transform 0.13s, background 0.15s;
}

.lang-btn:hover {
  border-color: var(--stroke-hover);
  background: rgba(24,231,242,0.07);
  transform: translateY(-1px);
}
</style>
