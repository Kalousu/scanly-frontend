<script setup>
import { ref, computed } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import {
  fetchProductByBarcode,
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/api'

// Modal & form state
const activeModal = ref(null)
const searchQuery = ref('')
const searchLoading = ref(false)
const searchError = ref('')
const foundProduct = ref(null)

const form = ref(getEmptyForm())

// Per-action loading/error/success
const actionState = ref({ loading: false, error: '', success: false })

// Database state
const showDatabase = ref(false)
const allProducts = ref([])
const dbLoading = ref(false)
const dbError = ref('')
const dbSearchQuery = ref('')
const dbCategoryFilter = ref('ALL')

// Action cards displayed on the page
const actionCards = [
  {
    id: 'add',
    title: 'Produkt hinzufügen',
    description: 'Neues Produkt zum Katalog hinzufügen',
  },
  {
    id: 'edit',
    title: 'Produkt bearbeiten',
    description: 'Bestehende Produkte und Preise ändern',
  },
  {
    id: 'remove',
    title: 'Produkt entfernen',
    description: 'Produkte aus dem Katalog löschen',
  },
  {
    id: 'db',
    title: 'Produktdatenbank',
    description: 'Komplette Produktliste anzeigen und durchsuchen',
  },
]

const categories = [
  { value: '', label: 'Kategorie wählen…' },
  { value: 'FRUITS_VEGETABLES', label: 'Obst/Gemüse' },
  { value: 'BAKERY', label: 'Backwaren' },
  { value: 'OTHERS', label: 'Others' },
]

const categoryLabelMap = {
  FRUITS_VEGETABLES: 'Obst/Gemüse',
  BAKERY: 'Backwaren',
  OTHERS: 'Others',
}

const dbCategories = [
  { value: 'ALL', label: 'Alle' },
  { value: 'FRUITS_VEGETABLES', label: 'Obst/Gemüse' },
  { value: 'BAKERY', label: 'Backwaren' },
  { value: 'OTHERS', label: 'Others' },
]

// Computed
const filteredProducts = computed(() => {
  let list = allProducts.value

  if (dbCategoryFilter.value !== 'ALL') {
    list = list.filter(p => p.category === dbCategoryFilter.value)
  }

  const query = dbSearchQuery.value.trim().toLowerCase()
  if (query) {
    list = list.filter(p =>
      [p.name, p.code, p.ean, p.barcode]
        .filter(Boolean)
        .some(val => String(val).toLowerCase().includes(query))
    )
  }

  return list
})

const modalTitle = computed(() => {
  const titles = { add: 'Produkt hinzufügen', edit: 'Produkt bearbeiten', remove: 'Produkt entfernen' }
  return titles[activeModal.value] || ''
})

const priceLabel = computed(() =>
  form.value.category === 'FRUITS_VEGETABLES' ? 'Nettopreis pro Kilo (€)' : 'Nettopreis (€)'
)

const pricePlaceholder = computed(() =>
  form.value.category === 'FRUITS_VEGETABLES' ? '0.00 €/kg' : '0.00'
)

// Helpers
function getEmptyForm() {
  return { name: '', priceNet: '', taxRate: '1.19', category: '', ean: '' }
}

function resetAll() {
  form.value = getEmptyForm()
  searchQuery.value = ''
  searchLoading.value = false
  searchError.value = ''
  foundProduct.value = null
  actionState.value = { loading: false, error: '', success: false }
}

function formatTaxRate(rate) {
  const map = {
    1.19: '19 %', 19: '19 %', 0.19: '19 %',
    1.07: '7 %', 7: '7 %', 0.07: '7 %',
    1.0: '0 %', 0: '0 %',
  }
  return map[rate] ?? String(rate ?? '—')
}

function toTaxRateSelect(taxRate) {
  if ([1.19, 19, 0.19].includes(taxRate)) return '1.19'
  if ([1.07, 7, 0.07].includes(taxRate)) return '1.07'
  if ([1.0, 0].includes(taxRate)) return '1.00'
  return '1.19'
}

function getBarcode(product) {
  return product?.ean || product?.barcode || product?.code || searchQuery.value.trim()
}

function formatPrice(product) {
  const price = (product.price ?? product.priceNet ?? 0).toFixed(2)
  const suffix = product.category === 'FRUITS_VEGETABLES' ? '/kg' : ''
  return `${price} €${suffix}`
}

function isFormValid() {
  return form.value.name && form.value.category && form.value.priceNet && form.value.ean
}

function handleCardClick(cardId) {
  if (cardId === 'db') {
    loadAllProducts()
  } else {
    openModal(cardId)
  }
}

// Modal
function openModal(type) {
  activeModal.value = type
  resetAll()
}

function closeModal() {
  activeModal.value = null
  resetAll()
}

// Database
async function loadAllProducts() {
  showDatabase.value = true
  dbLoading.value = true
  dbError.value = ''
  try {
    const data = await fetchAllProducts()
    allProducts.value = Array.isArray(data) ? data : (data.products || data.content || [])
  } catch (err) {
    dbError.value = 'Fehler beim Laden der Produkte. Bitte versuche es erneut.'
    console.error('loadAllProducts:', err)
  } finally {
    dbLoading.value = false
  }
}

// Search
async function searchByBarcode() {
  const barcode = searchQuery.value.trim()
  if (!barcode) {
    searchError.value = 'Bitte eine EAN / Barcode eingeben.'
    return
  }

  searchLoading.value = true
  searchError.value = ''
  foundProduct.value = null
  form.value = getEmptyForm()

  try {
    const product = await fetchProductByBarcode(barcode)
    foundProduct.value = product
    form.value = {
      name: product.name || '',
      priceNet: product.priceNet ?? product.price ?? '',
      taxRate: toTaxRateSelect(product.taxRate ?? 19),
      category: product.category || '',
      ean: product.ean || product.barcode || barcode,
    }
  } catch (err) {
    searchError.value = err.response?.status === 404
      ? 'Kein Produkt mit dieser EAN gefunden.'
      : 'Fehler bei der Suche. Bitte versuche es erneut.'
  } finally {
    searchLoading.value = false
  }
}

// CRUD operations with shared pattern
async function executeAction(apiCall, successMessage) {
  actionState.value = { loading: true, error: '', success: false }
  try {
    await apiCall()
    actionState.value.success = true
    setTimeout(() => closeModal(), 1200)
  } catch (err) {
    console.error(err)
    actionState.value.error = successMessage
  } finally {
    actionState.value.loading = false
  }
}

function addProduct() {
  if (!isFormValid()) {
    actionState.value.error = 'Bitte alle Felder ausfüllen.'
    return
  }
  executeAction(
    () => createProduct({
      name: form.value.name,
      category: form.value.category,
      price: parseFloat(form.value.priceNet),
      taxRate: parseFloat(form.value.taxRate),
      code: form.value.ean,
    }),
    'Fehler beim Hinzufügen des Produkts. Bitte versuche es erneut.'
  )
}

function editProduct() {
  if (!isFormValid()) {
    actionState.value.error = 'Bitte alle Felder ausfüllen.'
    return
  }
  const barcode = getBarcode(foundProduct.value)
  if (!barcode) {
    actionState.value.error = 'Kein Barcode vorhanden.'
    return
  }
  executeAction(
    () => updateProduct(barcode, {
      name: form.value.name,
      code: form.value.ean,
      price: parseFloat(form.value.priceNet),
      taxRate: parseFloat(form.value.taxRate),
      productCategory: form.value.category,
    }),
    'Fehler beim Aktualisieren des Produkts. Bitte versuche es erneut.'
  )
}

function removeProduct() {
  const barcode = getBarcode(foundProduct.value)
  if (!barcode) {
    actionState.value.error = 'Kein Produkt ausgewählt.'
    return
  }
  executeAction(
    () => deleteProduct(barcode),
    'Fehler beim Entfernen des Produkts. Bitte versuche es erneut.'
  )
}
</script>

<template>
  <AdminLayout breadcrumb="Produkte" :max-width="1000">
      <div class="prod-header">
        <h1 class="prod-title">Produkte verwalten</h1>
        <p class="prod-subtitle">Produkte hinzufügen, bearbeiten oder entfernen</p>
      </div>

      <!-- Action Cards -->
      <div class="prod-actions">
        <div
          v-for="card in actionCards"
          :key="card.id"
          :class="['prod-action-card', `prod-action-card--${card.id}`]"
          @click="handleCardClick(card.id)"
        >

          <h3 class="prod-action-title">{{ card.title }}</h3>
          <p class="prod-action-desc">{{ card.description }}</p>
        </div>
      </div>

      <!-- Product Database Section -->
      <Transition name="db-fade">
        <div v-if="showDatabase" class="prod-db-section">
          <div class="prod-db-header">
            <h2 class="prod-db-title">
              Produktdatenbank
              <span class="prod-db-count">{{ filteredProducts.length }} Produkte</span>
            </h2>
            <button class="prod-btn prod-btn--secondary prod-db-close-btn" @click="showDatabase = false">
              
              Schließen
            </button>
          </div>

          <!-- Filters -->
          <div class="prod-db-filters">
            <div class="prod-db-search">
              
              <input v-model="dbSearchQuery" type="text" class="prod-db-search-input" placeholder="Nach Produktname oder EAN suchen…" />
              <button v-if="dbSearchQuery" class="prod-db-search-clear" @click="dbSearchQuery = ''">
                
              </button>
            </div>
            <div class="prod-db-category-filter">
              <button
                v-for="cat in dbCategories"
                :key="cat.value"
                :class="['prod-db-cat-btn', { 'prod-db-cat-btn--active': dbCategoryFilter === cat.value }]"
                @click="dbCategoryFilter = cat.value"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="dbLoading" class="prod-db-loading">
            <span class="prod-spinner prod-spinner--lg"></span>
            <p>Produkte werden geladen…</p>
          </div>

          <!-- Error -->
          <div v-else-if="dbError" class="prod-search-error" style="margin-top: 0;">
            
            <p>{{ dbError }}</p>
          </div>

          <!-- Table -->
          <div v-else-if="filteredProducts.length > 0" class="prod-db-table-wrap">
            <table class="prod-db-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produktname</th>
                  <th>EAN / Barcode</th>
                  <th>Kategorie</th>
                  <th>Nettopreis</th>
                  <th>Steuersatz</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, idx) in filteredProducts" :key="product.id || product.ean || idx">
                  <td class="prod-db-td-num">{{ idx + 1 }}</td>
                  <td class="prod-db-td-name">{{ product.name }}</td>
                  <td class="prod-db-td-ean">{{ product.code || product.ean || product.barcode }}</td>
                  <td>{{ categoryLabelMap[product.category] || product.category }}</td>
                  <td class="prod-db-td-price">{{ formatPrice(product) }}</td>
                  <td class="prod-db-td-tax">{{ formatTaxRate(product.taxRate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty -->
          <div v-else class="prod-db-empty">
            
            <p>Keine Produkte gefunden.</p>
          </div>
        </div>
      </Transition>
    <!-- Modal -->
    <Transition name="modal-fade">
      <div v-if="activeModal" class="prod-modal-overlay" @click.self="closeModal">
        <div class="prod-modal">
          <div class="prod-modal-header">
            <h2 class="prod-modal-title">{{ modalTitle }}</h2>
            <button class="prod-modal-close" @click="closeModal">
              X
            </button>
          </div>

          <!-- Add Product -->
          <div v-if="activeModal === 'add'" class="prod-modal-body">
            <div class="prod-form-group">
              <label class="prod-label">Produktname</label>
              <input v-model="form.name" type="text" class="prod-input" placeholder="z.B. Monster White" />
            </div>
            <div class="prod-form-group">
              <label class="prod-label">Kategorie</label>
              <select v-model="form.category" class="prod-input">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="prod-form-row">
              <div class="prod-form-group">
                <label class="prod-label">{{ priceLabel }}</label>
                <input v-model="form.priceNet" type="number" step="0.01" class="prod-input" :placeholder="pricePlaceholder" />
              </div>
              <div class="prod-form-group">
                <label class="prod-label">MwSt-Satz</label>
                <select v-model="form.taxRate" class="prod-input">
                  <option value="1.19">19%</option>
                  <option value="1.07">7%</option>
                  <option value="1.00">0%</option>
                </select>
              </div>
            </div>
            <div class="prod-form-group">
              <label class="prod-label">EAN / Barcode</label>
              <input v-model="form.ean" type="text" class="prod-input" placeholder="z.B. 4006381333634" />
            </div>

            <div v-if="actionState.error" class="prod-search-error">
              
              <p>{{ actionState.error }}</p>
            </div>
            <div v-if="actionState.success" class="prod-found-card" style="margin-top: 0.75rem;">
              <div class="prod-found-header">
                
                <span>Produkt erfolgreich hinzugefügt!</span>
              </div>
            </div>

            <div class="prod-modal-footer">
              <button class="prod-btn prod-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="prod-btn prod-btn--primary prod-btn--add" @click="addProduct" :disabled="actionState.loading">
                <span v-if="actionState.loading" class="prod-spinner"></span>
                
                {{ actionState.loading ? 'Wird hinzugefügt…' : 'Produkt hinzufügen' }}
              </button>
            </div>
          </div>

          <!-- Edit Product -->
          <div v-if="activeModal === 'edit'" class="prod-modal-body">
            <!-- Search -->
            <div class="prod-form-group">
              <label class="prod-label">Produkt per EAN suchen</label>
              <div class="prod-search-row">
                <input v-model="searchQuery" type="text" class="prod-input" placeholder="EAN / Barcode eingeben…" @keyup.enter="searchByBarcode" />
                <button class="prod-btn prod-btn--search" @click="searchByBarcode" :disabled="searchLoading">
                  
                  <span v-if="searchLoading" class="prod-spinner"></span>
                  {{ searchLoading ? 'Suche…' : 'Suchen' }}
                </button>
              </div>
            </div>

            <div v-if="searchError" class="prod-search-error">
              
              <p>{{ searchError }}</p>
            </div>

            <!-- Found product info -->
            <div v-if="foundProduct" class="prod-found-card">
              <div class="prod-found-header">
                
                <span>Produkt gefunden</span>
              </div>
              <div class="prod-found-details">
                <div class="prod-found-row">
                  <span class="prod-found-label">Name</span>
                  <span class="prod-found-value">{{ foundProduct.name }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">EAN</span>
                  <span class="prod-found-value prod-found-ean">{{ getBarcode(foundProduct) }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Kategorie</span>
                  <span class="prod-found-value">{{ categoryLabelMap[foundProduct.category] || foundProduct.category }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Nettopreis</span>
                  <span class="prod-found-value">{{ formatPrice(foundProduct) }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">MwSt-Satz</span>
                  <span class="prod-found-value">{{ foundProduct.taxRate !== undefined ? foundProduct.taxRate : '—' }}</span>
                </div>
              </div>
            </div>

            <div class="prod-divider"></div>
            <p v-if="!foundProduct" class="prod-hint">Gib eine EAN ein und klicke auf „Suchen", um das Produkt zu laden. Die Felder werden dann vorausgefüllt.</p>

            <!-- Edit form -->
            <div class="prod-form-group">
              <label class="prod-label">Produktname</label>
              <input v-model="form.name" type="text" class="prod-input" placeholder="Produktname" :disabled="!foundProduct" />
            </div>
            <div class="prod-form-group">
              <label class="prod-label">Kategorie</label>
              <select v-model="form.category" class="prod-input" :disabled="!foundProduct">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="prod-form-row">
              <div class="prod-form-group">
                <label class="prod-label">{{ priceLabel }}</label>
                <input v-model="form.priceNet" type="number" step="0.01" class="prod-input" :placeholder="pricePlaceholder" :disabled="!foundProduct" />
              </div>
              <div class="prod-form-group">
                <label class="prod-label">MwSt-Satz</label>
                <select v-model="form.taxRate" class="prod-input" :disabled="!foundProduct">
                  <option value="1.19">19%</option>
                  <option value="1.07">7%</option>
                  <option value="1.00">0%</option>
                </select>
              </div>
            </div>
            <div class="prod-form-group">
              <label class="prod-label">EAN / Barcode</label>
              <input v-model="form.ean" type="text" class="prod-input" placeholder="EAN / Barcode" :disabled="!foundProduct" />
            </div>

            <div v-if="actionState.error" class="prod-search-error">
              
              <p>{{ actionState.error }}</p>
            </div>
            <div v-if="actionState.success" class="prod-found-card" style="margin-top: 0.75rem;">
              <div class="prod-found-header">
                
                <span>Produkt erfolgreich aktualisiert!</span>
              </div>
            </div>

            <div class="prod-modal-footer">
              <button class="prod-btn prod-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="prod-btn prod-btn--primary prod-btn--edit" :disabled="!foundProduct || actionState.loading" @click="editProduct">
                <span v-if="actionState.loading" class="prod-spinner"></span>
                
                {{ actionState.loading ? 'Wird gespeichert…' : 'Änderungen speichern' }}
              </button>
            </div>
          </div>

          <!-- Remove Product -->
          <div v-if="activeModal === 'remove'" class="prod-modal-body">
            <div class="prod-form-group">
              <label class="prod-label">Produkt per EAN suchen</label>
              <div class="prod-search-row">
                <input v-model="searchQuery" type="text" class="prod-input" placeholder="EAN / Barcode eingeben…" @keyup.enter="searchByBarcode" />
                <button class="prod-btn prod-btn--search" @click="searchByBarcode" :disabled="searchLoading">
                  
                  <span v-if="searchLoading" class="prod-spinner"></span>
                  {{ searchLoading ? 'Suche…' : 'Suchen' }}
                </button>
              </div>
            </div>

            <div v-if="searchError" class="prod-search-error">
              
              <p>{{ searchError }}</p>
            </div>

            <div v-if="foundProduct" class="prod-found-card prod-found-card--remove">
              <div class="prod-found-header">
                
                <span>Produkt gefunden</span>
              </div>
              <div class="prod-found-details">
                <div class="prod-found-row">
                  <span class="prod-found-label">Name</span>
                  <span class="prod-found-value">{{ foundProduct.name }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">EAN</span>
                  <span class="prod-found-value prod-found-ean">{{ getBarcode(foundProduct) }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Kategorie</span>
                  <span class="prod-found-value">{{ categoryLabelMap[foundProduct.category] || foundProduct.category }}</span>
                </div>
                <div class="prod-found-row">
                  <span class="prod-found-label">Nettopreis</span>
                  <span class="prod-found-value">{{ formatPrice(foundProduct) }}</span>
                </div>
              </div>
            </div>

            <div class="prod-divider"></div>
            <div class="prod-remove-warning">
              <div>
                <p class="prod-warning-title">Achtung</p>
                <p class="prod-warning-text">Das Entfernen eines Produkts kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>

            <div v-if="actionState.error" class="prod-search-error">
              
              <p>{{ actionState.error }}</p>
            </div>
            <div v-if="actionState.success" class="prod-found-card" style="margin-top: 0.75rem;">
              <div class="prod-found-header">
                
                <span>Produkt erfolgreich entfernt!</span>
              </div>
            </div>

            <div class="prod-modal-footer">
              <button class="prod-btn prod-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="prod-btn prod-btn--primary prod-btn--remove" :disabled="!foundProduct || actionState.loading" @click="removeProduct">
                <span v-if="actionState.loading" class="prod-spinner"></span>
                
                {{ actionState.loading ? 'Wird entfernt…' : 'Produkt entfernen' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </AdminLayout>
</template>

<style scoped>
.prod-header { margin-bottom: 2.5rem; }

.prod-title {
  font-size: 2rem; font-weight: 800; margin: 0 0 0.3rem;
  color: #fff;
}

.prod-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.38); margin: 0; }

/* Action Cards */
.prod-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }

.prod-action-card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 2.5rem 1.5rem; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
  cursor: pointer;
}

.prod-action-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }

.prod-action-title { margin: 0 0 0.4rem; font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.9); }
.prod-action-desc { margin: 0; font-size: 0.8rem; color: rgba(255,255,255,0.38); line-height: 1.4; max-width: 20ch; }

/* Modal */
.prod-modal-overlay {
  position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(6px);
}

.prod-modal {
  width: min(560px, 94vw); max-height: 90vh; overflow-y: auto;
  background: #0B2C44;
  border: 1px solid rgba(255,255,255,0.12); border-radius: 20px;
}

.prod-modal-header {
  display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem 1.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.prod-modal-title { flex: 1; margin: 0; font-size: 1.15rem; font-weight: 700; color: #fff; }

.prod-modal-close {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; color: rgba(255,255,255,0.5); cursor: pointer;
  flex-shrink: 0;
}

.prod-modal-close:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
.prod-modal-close svg { width: 16px; height: 16px; }
.prod-modal-body { padding: 1.5rem 1.75rem; }

/* Form */
.prod-form-group { margin-bottom: 1rem; }
.prod-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.prod-label {
  display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: rgba(255,255,255,0.45); margin-bottom: 0.35rem;
}

.prod-input {
  width: 100%; padding: 0.65rem 0.9rem; font-size: 0.9rem; color: #fff;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; outline: none; box-sizing: border-box;
}

.prod-input:focus { border-color: rgba(0, 212, 232, 0.5); }
.prod-input:disabled { opacity: 0.35; cursor: not-allowed; }
.prod-input::placeholder { color: rgba(255,255,255,0.25); }
select.prod-input { appearance: none; cursor: pointer; }

.prod-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 1.25rem 0; }
.prod-hint { font-size: 0.82rem; color: rgba(255,255,255,0.35); margin: 0 0 1rem; line-height: 1.5; }

/* Search Row */
.prod-search-row { display: flex; gap: 0.6rem; align-items: stretch; }
.prod-search-row .prod-input { flex: 1; }

.prod-btn--search {
  display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.65rem 1.1rem;
  font-size: 0.85rem; font-weight: 600; color: #fff;
  background: rgba(0, 212, 232, 0.15); border: 1px solid rgba(0, 212, 232, 0.3);
  border-radius: 10px; cursor: pointer; white-space: nowrap; flex-shrink: 0;
}

.prod-btn--search svg { width: 16px; height: 16px; }
.prod-btn--search:hover:not(:disabled) { background: rgba(0, 212, 232, 0.25); border-color: rgba(0, 212, 232, 0.5); }
.prod-btn--search:disabled { opacity: 0.5; cursor: not-allowed; }


/* Error */
.prod-search-error {
  display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1rem; margin-top: 0.75rem;
  background: rgba(255, 107, 138, 0.08); border: 1px solid rgba(255, 107, 138, 0.2); border-radius: 10px;
}

.prod-search-error svg { width: 18px; height: 18px; flex-shrink: 0; color: #FF6B8A; }
.prod-search-error p { margin: 0; font-size: 0.82rem; color: rgba(255,255,255,0.6); }

/* Found Product Card */
.prod-found-card {
  margin-top: 0.75rem; background: rgba(0, 212, 232, 0.06);
  border: 1px solid rgba(0, 212, 232, 0.2); border-radius: 12px; overflow: hidden;
}

.prod-found-card--remove { background: rgba(255, 107, 138, 0.06); border-color: rgba(255, 107, 138, 0.2); }

.prod-found-header {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1rem;
  background: rgba(0, 212, 232, 0.08); border-bottom: 1px solid rgba(0, 212, 232, 0.12);
}

.prod-found-card--remove .prod-found-header { background: rgba(255, 107, 138, 0.08); border-bottom-color: rgba(255, 107, 138, 0.12); }
.prod-found-header svg { width: 18px; height: 18px; color: #6EF0B4; }
.prod-found-card--remove .prod-found-header svg { color: #FF6B8A; }
.prod-found-header span { font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.85); }

.prod-found-details { padding: 0.75rem 1rem; }

.prod-found-row { display: flex; justify-content: space-between; align-items: center; padding: 0.35rem 0; }
.prod-found-row + .prod-found-row { border-top: 1px solid rgba(255,255,255,0.05); }

.prod-found-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: rgba(255,255,255,0.4); }
.prod-found-value { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.85); }

.prod-found-ean { font-family: 'SF Mono', 'Consolas', 'Monaco', monospace; font-size: 0.82rem; color: #00D4E8; letter-spacing: 0.04em; }
.prod-found-card--remove .prod-found-ean { color: #FF6B8A; }

/* Remove warning */
.prod-remove-warning {
  display: flex; gap: 0.75rem; padding: 1rem;
  background: rgba(255, 107, 138, 0.06); border: 1px solid rgba(255, 107, 138, 0.15);
  border-radius: 12px; margin-bottom: 1rem;
}

.prod-warning-icon { width: 24px; height: 24px; flex-shrink: 0; color: #FF6B8A; margin-top: 0.1rem; }
.prod-warning-title { margin: 0 0 0.25rem; font-size: 0.85rem; font-weight: 700; color: #FF6B8A; }
.prod-warning-text { margin: 0; font-size: 0.8rem; color: rgba(255,255,255,0.45); line-height: 1.45; }

/* Footer */
.prod-modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 1rem;
}

.prod-btn {
  display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.25rem;
  font-size: 0.85rem; font-weight: 600; border-radius: 10px;
  cursor: pointer; border: 1px solid transparent;
}

.prod-btn svg { width: 16px; height: 16px; }
.prod-btn--secondary { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
.prod-btn--secondary:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1); }
.prod-btn--primary { color: #071A2A; font-weight: 700; }
.prod-btn--primary:disabled { opacity: 0.35; cursor: not-allowed; }

.prod-btn--add { background: #6EF0B4; }
.prod-btn--add:hover:not(:disabled) { background: #5cd9a0; }
.prod-btn--edit { background: #00D4E8; }
.prod-btn--edit:hover:not(:disabled) { background: #00bfd2; }
.prod-btn--remove { background: #FF6B8A; color: #fff; }
.prod-btn--remove:hover:not(:disabled) { background: #e85a78; }


/* Database Section */
.prod-db-section {
  margin-top: 2.5rem; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.75rem;
}

.prod-db-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }

.prod-db-title { display: flex; align-items: center; gap: 0.6rem; margin: 0; font-size: 1.2rem; font-weight: 700; color: rgba(255,255,255,0.9); }
.prod-db-title-icon { width: 24px; height: 24px; color: #A882FF; flex-shrink: 0; }

.prod-db-count {
  font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.06); padding: 0.2rem 0.65rem; border-radius: 999px; margin-left: 0.25rem;
}

.prod-db-close-btn svg { width: 14px; height: 14px; }

/* Filters */
.prod-db-filters { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
.prod-db-search { position: relative; display: flex; align-items: center; }
.prod-db-search-icon { position: absolute; left: 0.85rem; width: 18px; height: 18px; color: rgba(255,255,255,0.3); pointer-events: none; }

.prod-db-search-input {
  width: 100%; padding: 0.7rem 2.5rem 0.7rem 2.75rem; font-size: 0.9rem; color: #fff;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; outline: none; box-sizing: border-box;
}

.prod-db-search-input:focus { border-color: rgba(168, 130, 255, 0.5); }
.prod-db-search-input::placeholder { color: rgba(255,255,255,0.25); }

.prod-db-search-clear {
  position: absolute; right: 0.6rem; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 8px;
  color: rgba(255,255,255,0.5); cursor: pointer;
}

.prod-db-search-clear:hover { background: rgba(255,100,100,0.15); color: #FF6B8A; }
.prod-db-search-clear svg { width: 14px; height: 14px; }

.prod-db-category-filter { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.prod-db-cat-btn {
  padding: 0.4rem 0.9rem; font-size: 0.78rem; font-weight: 600;
  color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 999px;
  cursor: pointer;
}

.prod-db-cat-btn:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
.prod-db-cat-btn--active { color: #A882FF; background: rgba(168, 130, 255, 0.1); border-color: rgba(168, 130, 255, 0.35); }

/* Loading */
.prod-db-loading { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem 1rem; color: rgba(255,255,255,0.4); font-size: 0.85rem; }
.prod-spinner--lg { width: 28px; height: 28px; border-width: 3px; }

/* Table */
.prod-db-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
.prod-db-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.prod-db-table thead { background: rgba(255,255,255,0.04); }

.prod-db-table th {
  padding: 0.75rem 1rem; text-align: left; font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap;
}

.prod-db-table td { padding: 0.65rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); }
.prod-db-table tbody tr:hover { background: rgba(255,255,255,0.03); }
.prod-db-table tbody tr:last-child td { border-bottom: none; }

.prod-db-td-num { color: rgba(255,255,255,0.25); font-size: 0.78rem; width: 40px; }
.prod-db-td-name { font-weight: 600; color: rgba(255,255,255,0.9); }
.prod-db-td-ean { font-family: 'SF Mono', 'Consolas', 'Monaco', monospace; font-size: 0.8rem; color: rgba(255,255,255,0.5); letter-spacing: 0.03em; }
.prod-db-td-price { font-weight: 600; color: #6EF0B4; white-space: nowrap; }
.prod-db-td-tax { color: rgba(255,255,255,0.45); font-size: 0.8rem; }

/* Empty State */
.prod-db-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem 1rem; color: rgba(255,255,255,0.35); font-size: 0.85rem; }
.prod-db-empty-icon { width: 36px; height: 36px; opacity: 0.4; }


/* Responsive */
@media (max-width: 768px) {
  .prod-actions { grid-template-columns: 1fr; }
  .prod-title { font-size: 1.6rem; }
  .prod-form-row { grid-template-columns: 1fr; }
}
</style>