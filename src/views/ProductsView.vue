<script setup>
import { ref, computed } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import {
  fetchProductByBarcode,
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/api'

const activeModal = ref(null)
const searchQuery = ref('')
const searchLoading = ref(false)
const searchError = ref('')
const foundProduct = ref(null)

const form = ref(getEmptyForm())

const actionState = ref({ loading: false, error: '', success: false })

const showDatabase = ref(false)
const allProducts = ref([])
const dbLoading = ref(false)
const dbError = ref('')
const dbSearchQuery = ref('')
const dbCategoryFilter = ref('ALL')

const actionCards = [
  { id: 'add', title: 'Produkt hinzufügen', description: 'Neues Produkt zum Katalog hinzufügen' },
  { id: 'edit', title: 'Produkt bearbeiten', description: 'Bestehende Produkte und Preise ändern' },
  { id: 'remove', title: 'Produkt entfernen', description: 'Produkte aus dem Katalog löschen' },
  { id: 'db', title: 'Produktdatenbank', description: 'Komplette Produktliste anzeigen und durchsuchen' },
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

function getEmptyForm() {
  return { name: '', priceNet: '', taxRate: '0.19', category: '', ean: '' }
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
  if ([1.19, 19, 0.19].includes(taxRate)) return '0.19'
  if ([1.07, 7, 0.07].includes(taxRate)) return '0.07'
  if ([1.0, 0, 0.0].includes(taxRate)) return '0.00'
  return '0.19'
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

function openModal(type) {
  activeModal.value = type
  resetAll()
}

function closeModal() {
  activeModal.value = null
  resetAll()
}

async function loadAllProducts() {
  showDatabase.value = true
  dbLoading.value = true
  dbError.value = ''
  try {
    const data = await fetchAllProducts()
    allProducts.value = Array.isArray(data) ? data : (data.products || data.content || [])
  } catch {
    dbError.value = 'Fehler beim Laden der Produkte. Bitte versuche es erneut.'
  } finally {
    dbLoading.value = false
  }
}

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

async function executeAction(apiCall, errorMessage) {
  actionState.value = { loading: true, error: '', success: false }
  try {
    await apiCall()
    actionState.value.success = true
    setTimeout(() => closeModal(), 1200)
  } catch {
    actionState.value.error = errorMessage
  } finally {
    actionState.value.loading = false
  }
}

function addProduct() {
  if (!isFormValid()) { actionState.value.error = 'Bitte alle Felder ausfüllen.'; return }
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
  if (!isFormValid()) { actionState.value.error = 'Bitte alle Felder ausfüllen.'; return }
  const barcode = getBarcode(foundProduct.value)
  if (!barcode) { actionState.value.error = 'Kein Barcode vorhanden.'; return }
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
  if (!barcode) { actionState.value.error = 'Kein Produkt ausgewählt.'; return }
  executeAction(
    () => deleteProduct(barcode),
    'Fehler beim Entfernen des Produkts. Bitte versuche es erneut.'
  )
}
</script>

<template>
  <AdminLayout breadcrumb="Produkte" :max-width="1000">
    <div class="admin-page-header">
      <h1 class="admin-page-title">Produkte verwalten</h1>
      <p class="admin-page-subtitle">Produkte hinzufügen, bearbeiten oder entfernen</p>
    </div>

    <!-- Action Cards -->
    <div class="prod-actions">
      <div
        v-for="card in actionCards"
        :key="card.id"
        :class="['admin-card admin-card--interactive prod-action-card', `prod-action-card--${card.id}`]"
        @click="handleCardClick(card.id)"
      >
        <h3 class="prod-action-title">{{ card.title }}</h3>
        <p class="prod-action-desc">{{ card.description }}</p>
      </div>
    </div>

    <!-- Product Database Section -->
    <Transition name="db-fade">
      <div v-if="showDatabase" class="prod-db-section admin-card">
        <div class="prod-db-header">
          <h2 class="prod-db-title">
            Produktdatenbank
            <span class="prod-db-count">{{ filteredProducts.length }} Produkte</span>
          </h2>
          <button class="admin-btn admin-btn--secondary" @click="showDatabase = false">Schließen</button>
        </div>

        <!-- Filters -->
        <div class="prod-db-filters">
          <div class="admin-search-wrap" style="max-width:100%">
            <input v-model="dbSearchQuery" type="text" class="admin-search-input" placeholder="Nach Produktname oder EAN suchen…" />
          </div>
          <div class="admin-filter-group">
            <button
              v-for="cat in dbCategories"
              :key="cat.value"
              class="admin-filter-btn"
              :class="{ 'admin-filter-btn--active': dbCategoryFilter === cat.value }"
              @click="dbCategoryFilter = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="dbLoading" class="admin-loading">
          <div class="admin-spinner"></div>
          <p>Produkte werden geladen…</p>
        </div>

        <!-- Error -->
        <div v-else-if="dbError" class="admin-alert admin-alert--error">
          <p>{{ dbError }}</p>
        </div>

        <!-- Table -->
        <div v-else-if="filteredProducts.length > 0" class="admin-table-wrap">
          <table class="admin-table">
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
                <td class="td-num">{{ idx + 1 }}</td>
                <td class="td-name">{{ product.name }}</td>
                <td class="td-ean">{{ product.code || product.ean || product.barcode }}</td>
                <td>{{ categoryLabelMap[product.category] || product.category }}</td>
                <td class="td-price">{{ formatPrice(product) }}</td>
                <td class="td-tax">{{ formatTaxRate(product.taxRate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty -->
        <div v-else class="admin-empty">
          <p>Keine Produkte gefunden.</p>
        </div>
      </div>
    </Transition>

    <!-- Modal -->
    <Transition name="modal-fade">
      <div v-if="activeModal" class="admin-modal-overlay" @click.self="closeModal">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h2 class="admin-modal-title">{{ modalTitle }}</h2>
            <button class="admin-modal-close" @click="closeModal">X</button>
          </div>

          <!-- Add Product -->
          <div v-if="activeModal === 'add'" class="admin-modal-body">
            <div class="admin-form-group">
              <label class="admin-label">Produktname</label>
              <input v-model="form.name" type="text" class="admin-input" placeholder="z.B. Monster White" />
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Kategorie</label>
              <select v-model="form.category" class="admin-input">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label class="admin-label">{{ priceLabel }}</label>
                <input v-model="form.priceNet" type="number" step="0.01" class="admin-input" :placeholder="pricePlaceholder" />
              </div>
              <div class="admin-form-group">
                <label class="admin-label">MwSt-Satz</label>
                <select v-model="form.taxRate" class="admin-input">
                  <option value="0.19">19%</option>
                  <option value="0.07">7%</option>
                  <option value="0.00">0%</option>
                </select>
              </div>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">EAN / Barcode</label>
              <input v-model="form.ean" type="text" class="admin-input" placeholder="z.B. 4006381333634" />
            </div>

            <div v-if="actionState.error" class="admin-alert admin-alert--error">
              <p>{{ actionState.error }}</p>
            </div>
            <div v-if="actionState.success" class="prod-success-msg">
              Produkt erfolgreich hinzugefügt!
            </div>

            <div class="admin-modal-footer">
              <button class="admin-btn admin-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="admin-btn admin-btn--success" @click="addProduct" :disabled="actionState.loading">
                <span v-if="actionState.loading" class="admin-spinner admin-spinner--sm"></span>
                {{ actionState.loading ? 'Wird hinzugefügt…' : 'Produkt hinzufügen' }}
              </button>
            </div>
          </div>

          <!-- Edit Product -->
          <div v-if="activeModal === 'edit'" class="admin-modal-body">
            <div class="admin-form-group">
              <label class="admin-label">Produkt per EAN suchen</label>
              <div class="prod-search-row">
                <input v-model="searchQuery" type="text" class="admin-input" placeholder="EAN / Barcode eingeben…" @keyup.enter="searchByBarcode" />
                <button class="prod-btn-search" @click="searchByBarcode" :disabled="searchLoading">
                  <span v-if="searchLoading" class="admin-spinner admin-spinner--sm"></span>
                  {{ searchLoading ? 'Suche…' : 'Suchen' }}
                </button>
              </div>
            </div>

            <div v-if="searchError" class="admin-alert admin-alert--error">
              <p>{{ searchError }}</p>
            </div>

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

            <div class="admin-divider"></div>
            <p v-if="!foundProduct" class="prod-hint">Gib eine EAN ein und klicke auf „Suchen", um das Produkt zu laden.</p>

            <div class="admin-form-group">
              <label class="admin-label">Produktname</label>
              <input v-model="form.name" type="text" class="admin-input" placeholder="Produktname" :disabled="!foundProduct" />
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Kategorie</label>
              <select v-model="form.category" class="admin-input" :disabled="!foundProduct">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label class="admin-label">{{ priceLabel }}</label>
                <input v-model="form.priceNet" type="number" step="0.01" class="admin-input" :placeholder="pricePlaceholder" :disabled="!foundProduct" />
              </div>
              <div class="admin-form-group">
                <label class="admin-label">MwSt-Satz</label>
                <select v-model="form.taxRate" class="admin-input" :disabled="!foundProduct">
                  <option value="0.19">19%</option>
                  <option value="0.07">7%</option>
                  <option value="0.00">0%</option>
                </select>
              </div>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">EAN / Barcode</label>
              <input v-model="form.ean" type="text" class="admin-input" placeholder="EAN / Barcode" :disabled="!foundProduct" />
            </div>

            <div v-if="actionState.error" class="admin-alert admin-alert--error">
              <p>{{ actionState.error }}</p>
            </div>
            <div v-if="actionState.success" class="prod-success-msg">
              Produkt erfolgreich aktualisiert!
            </div>

            <div class="admin-modal-footer">
              <button class="admin-btn admin-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="admin-btn admin-btn--primary" :disabled="!foundProduct || actionState.loading" @click="editProduct">
                <span v-if="actionState.loading" class="admin-spinner admin-spinner--sm"></span>
                {{ actionState.loading ? 'Wird gespeichert…' : 'Änderungen speichern' }}
              </button>
            </div>
          </div>

          <!-- Remove Product -->
          <div v-if="activeModal === 'remove'" class="admin-modal-body">
            <div class="admin-form-group">
              <label class="admin-label">Produkt per EAN suchen</label>
              <div class="prod-search-row">
                <input v-model="searchQuery" type="text" class="admin-input" placeholder="EAN / Barcode eingeben…" @keyup.enter="searchByBarcode" />
                <button class="prod-btn-search" @click="searchByBarcode" :disabled="searchLoading">
                  <span v-if="searchLoading" class="admin-spinner admin-spinner--sm"></span>
                  {{ searchLoading ? 'Suche…' : 'Suchen' }}
                </button>
              </div>
            </div>

            <div v-if="searchError" class="admin-alert admin-alert--error">
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

            <div class="admin-divider"></div>
            <div class="admin-alert admin-alert--warning">
              <div>
                <p class="prod-warning-title">Achtung</p>
                <p class="prod-warning-text">Das Entfernen eines Produkts kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>

            <div v-if="actionState.error" class="admin-alert admin-alert--error">
              <p>{{ actionState.error }}</p>
            </div>
            <div v-if="actionState.success" class="prod-success-msg">
              Produkt erfolgreich entfernt!
            </div>

            <div class="admin-modal-footer">
              <button class="admin-btn admin-btn--secondary" @click="closeModal">Abbrechen</button>
              <button class="admin-btn admin-btn--danger" :disabled="!foundProduct || actionState.loading" @click="removeProduct">
                <span v-if="actionState.loading" class="admin-spinner admin-spinner--sm"></span>
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
/* Products-specific styles only */

.prod-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.prod-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
}

.prod-action-title {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.prod-action-desc {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.38);
  line-height: 1.4;
  max-width: 20ch;
}

/* Database section */
.prod-db-section {
  margin-top: 1rem;
}

.prod-db-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.prod-db-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.prod-db-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.06);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  margin-left: 0.25rem;
}

.prod-db-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

/* Table cell tweaks */
.td-num { color: rgba(255,255,255,0.25); font-size: 0.78rem; width: 40px; }
.td-name { font-weight: 600; color: rgba(255,255,255,0.9); }
.td-ean { font-family: 'SF Mono', 'Consolas', 'Monaco', monospace; font-size: 0.8rem; color: rgba(255,255,255,0.5); letter-spacing: 0.03em; }
.td-price { font-weight: 600; color: #6EF0B4; white-space: nowrap; }
.td-tax { color: rgba(255,255,255,0.45); font-size: 0.8rem; }

/* Search row in modals */
.prod-search-row {
  display: flex;
  gap: 0.6rem;
  align-items: stretch;
}

.prod-search-row .admin-input { flex: 1; }

.prod-btn-search {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 212, 232, 0.15);
  border: 1px solid rgba(0, 212, 232, 0.3);
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.prod-btn-search:hover:not(:disabled) { background: rgba(0, 212, 232, 0.25); border-color: rgba(0, 212, 232, 0.5); }
.prod-btn-search:disabled { opacity: 0.5; cursor: not-allowed; }

/* Found product card */
.prod-found-card {
  margin-top: 0.75rem;
  background: rgba(0, 212, 232, 0.06);
  border: 1px solid rgba(0, 212, 232, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.prod-found-card--remove {
  background: rgba(255, 107, 138, 0.06);
  border-color: rgba(255, 107, 138, 0.2);
}

.prod-found-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background: rgba(0, 212, 232, 0.08);
  border-bottom: 1px solid rgba(0, 212, 232, 0.12);
}

.prod-found-card--remove .prod-found-header {
  background: rgba(255, 107, 138, 0.08);
  border-bottom-color: rgba(255, 107, 138, 0.12);
}

.prod-found-header span {
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
}

.prod-found-details { padding: 0.75rem 1rem; }

.prod-found-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0;
}

.prod-found-row + .prod-found-row { border-top: 1px solid rgba(255,255,255,0.05); }

.prod-found-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.4);
}

.prod-found-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
}

.prod-found-ean {
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 0.82rem;
  color: #00D4E8;
  letter-spacing: 0.04em;
}

.prod-found-card--remove .prod-found-ean { color: #FF6B8A; }

/* Hint text */
.prod-hint {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.35);
  margin: 0 0 1rem;
  line-height: 1.5;
}

/* Warning */
.prod-warning-title { margin: 0 0 0.25rem; font-size: 0.85rem; font-weight: 700; color: #FF6B8A; }
.prod-warning-text { margin: 0; font-size: 0.8rem; color: rgba(255,255,255,0.45); line-height: 1.45; }

/* Success message */
.prod-success-msg {
  margin-top: 0.75rem;
  padding: 0.7rem 1rem;
  background: rgba(0, 212, 232, 0.06);
  border: 1px solid rgba(0, 212, 232, 0.2);
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
}

/* Responsive */
@media (max-width: 768px) {
  .prod-actions { grid-template-columns: 1fr; }
}
</style>
