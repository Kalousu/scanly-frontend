<template>
  <AdminLayout breadcrumb="Bestellungen" :max-width="1280">
    <div v-if="loading" class="ord-loading">
      <div class="ord-spinner"></div>
      <p>Bestellungen werden geladen…</p>
    </div>

    <div v-else-if="error" class="ord-error">
      <p>⚠ Fehler beim Laden der Bestellungen</p>
      <p class="ord-error-detail">{{ error }}</p>
      <button class="ord-retry-btn" @click="loadOrders">Erneut versuchen</button>
    </div>

    <template v-else>
      <div class="ord-header">
        <div class="ord-header-left">
          <h1 class="ord-title">Bestellungen</h1>
          <p class="ord-subtitle">{{ filteredOrders.length }} von {{ allOrders.length }} Bestellungen</p>
        </div>
        <button class="ord-refresh-btn" @click="loadOrders" :disabled="loading">
          Aktualisieren
        </button>
      </div>

      <div class="ord-kpi-row">
        <div class="ord-kpi">
          <span class="ord-kpi-num">{{ allOrders.length }}</span>
          <span class="ord-kpi-label">Gesamt</span>
        </div>
        <div class="ord-kpi ord-kpi--open">
          <span class="ord-kpi-num">{{ openOrders.length }}</span>
          <span class="ord-kpi-label">Offen</span>
        </div>
        <div class="ord-kpi ord-kpi--closed">
          <span class="ord-kpi-num">{{ closedOrders.length }}</span>
          <span class="ord-kpi-label">Abgeschlossen</span>
        </div>
        <div class="ord-kpi ord-kpi--revenue">
          <span class="ord-kpi-num">{{ formatCurrency(closedRevenue) }}</span>
          <span class="ord-kpi-label">Umsatz</span>
        </div>
      </div>

      <div class="ord-toolbar">
        <div class="ord-search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            class="ord-search"
            placeholder="Suche nach ID, Produkt…"
          />
        </div>
        <div class="ord-filter-group">
          <button
            v-for="f in filters"
            :key="f.value"
            class="ord-filter-btn"
            :class="{ 'ord-filter-btn--active': activeFilter === f.value }"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <div class="ord-table-wrap">
        <table class="ord-table" v-if="filteredOrders.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Datum</th>
              <th>Produkte</th>
              <th>Artikel</th>
              <th>Betrag</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in paginatedOrders"
              :key="order.orderId"
              class="ord-row"
              :class="{ 'ord-row--open': order.orderStatus === 'OPEN' }"
              @click="toggleExpand(order.orderId)"
            >
              <td class="td-id">#{{ order.orderId }}</td>
              <td>{{ formatDate(order.creationDate) }}</td>
              <td class="td-products">
                <span v-if="order.orderItems && order.orderItems.length > 0">
                  {{ order.orderItems.map(i => i.productName).join(', ') }}
                </span>
                <span v-else class="td-empty">Keine Artikel</span>
              </td>
              <td>{{ getItemCount(order) }}</td>
              <td class="td-amount">{{ formatCurrency(order.totalPrice || 0) }}</td>
              <td>
                <span class="status-badge" :class="'status-badge--' + (order.orderStatus || '').toLowerCase()">
                  {{ order.orderStatus === 'CLOSED' ? 'Abgeschlossen' : 'Offen' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="ord-empty">
          <p>Keine Bestellungen gefunden</p>
        </div>
      </div>

      <Transition name="detail-fade">
        <div v-if="expandedOrder" class="ord-detail-overlay" @click.self="expandedOrderId = null">
          <div class="ord-detail-card">
            <div class="ord-detail-header">
              <h3>Bestellung #{{ expandedOrder.orderId }}</h3>
              <button class="ord-detail-close" @click="expandedOrderId = null">X</button>
            </div>
            <div class="ord-detail-meta">
              <div class="ord-detail-meta-item">
                <span class="ord-detail-meta-label">Datum</span>
                <span>{{ formatDate(expandedOrder.creationDate) }}</span>
              </div>
              <div class="ord-detail-meta-item">
                <span class="ord-detail-meta-label">Status</span>
                <span class="status-badge" :class="'status-badge--' + (expandedOrder.orderStatus || '').toLowerCase()">
                  {{ expandedOrder.orderStatus === 'CLOSED' ? 'Abgeschlossen' : 'Offen' }}
                </span>
              </div>
              <div class="ord-detail-meta-item">
                <span class="ord-detail-meta-label">Gesamtbetrag</span>
                <span class="ord-detail-total">{{ formatCurrency(expandedOrder.totalPrice || 0) }}</span>
              </div>
            </div>
            <div class="ord-detail-items" v-if="expandedOrder.orderItems && expandedOrder.orderItems.length > 0">
              <h4>Positionen</h4>
              <table class="ord-detail-table">
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Menge</th>
                    <th>Netto/Stk</th>
                    <th>MwSt</th>
                    <th>Brutto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in expandedOrder.orderItems" :key="item.id">
                    <td>{{ item.productName }}</td>
                    <td>{{ item.amount }}</td>
                    <td>{{ formatCurrency(item.unitPriceNet) }}</td>
                    <td>{{ Math.round((item.taxRate - 1) * 100) }}%</td>
                    <td class="td-amount">{{ formatCurrency(item.totalPriceGross) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="ord-detail-no-items">
              Keine Artikel in dieser Bestellung.
            </div>
          </div>
        </div>
      </Transition>

      <div class="ord-pagination" v-if="totalPages > 1">
        <button class="ord-page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          ← Zurück
        </button>
        <span class="ord-page-info">Seite {{ currentPage }} von {{ totalPages }}</span>
        <button class="ord-page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          Weiter →
        </button>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'
import AdminLayout from '../components/AdminLayout.vue'
import { useFormatters } from '../composables/useFormatters'
import { useOrderUtils } from '../composables/useOrderUtils'

const { formatCurrency, formatDate } = useFormatters()
const { getItemCount } = useOrderUtils()

const allOrders = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const activeFilter = ref('all')
const currentPage = ref(1)
const pageSize = 15
const expandedOrderId = ref(null)

const filters = [
  { label: 'Alle', value: 'all' },
  { label: 'Offen', value: 'OPEN' },
  { label: 'Abgeschlossen', value: 'CLOSED' },
]

const openOrders = computed(() =>
  allOrders.value.filter((o) => (o.orderStatus || '').toUpperCase() === 'OPEN')
)

const closedOrders = computed(() =>
  allOrders.value.filter((o) => (o.orderStatus || '').toUpperCase() === 'CLOSED')
)

const closedRevenue = computed(() =>
  closedOrders.value.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
)

const filteredOrders = computed(() => {
  let result = [...allOrders.value]

  if (activeFilter.value !== 'all') {
    result = result.filter((o) => (o.orderStatus || '').toUpperCase() === activeFilter.value)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter((o) => {
      const idMatch = String(o.orderId).includes(q)
      const productMatch = (o.orderItems || []).some((item) =>
        (item.productName || '').toLowerCase().includes(q)
      )
      return idMatch || productMatch
    })
  }

  result.sort((a, b) => new Date(b.creationDate || 0) - new Date(a.creationDate || 0))
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / pageSize)))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

const expandedOrder = computed(() => {
  if (!expandedOrderId.value) return null
  return allOrders.value.find((o) => o.orderId === expandedOrderId.value) || null
})

watch([activeFilter, searchQuery], () => {
  currentPage.value = 1
})

function toggleExpand(orderId) {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
}


async function loadOrders() {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/orders')
    allOrders.value = Array.isArray(response.data)
      ? response.data
      : response.data.orders || response.data.content || []
  } catch (e) {
    console.error('Failed to load orders:', e)
    error.value = e.message || 'Unbekannter Fehler'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.ord-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.ord-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.2rem;
  color: #fff;
}

.ord-subtitle {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.38);
  margin: 0;
}

.ord-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  cursor: pointer;
}

.ord-refresh-btn:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ord-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  color: rgba(255,255,255,0.4);
  gap: 1rem;
}

.ord-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #00D4E8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.ord-error {
  text-align: center;
  padding: 4rem 1rem;
  color: rgba(255,255,255,0.5);
}

.ord-error-detail {
  font-size: 0.85rem;
  color: rgba(255,100,100,0.7);
}

.ord-retry-btn {
  margin-top: 1rem;
  padding: 0.6rem 1.5rem;
  background: rgba(0, 212, 232, 0.15);
  border: 1px solid rgba(0, 212, 232, 0.3);
  color: #00D4E8;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.ord-retry-btn:hover {
  background: rgba(0, 212, 232, 0.2);
}

.ord-kpi-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.ord-kpi {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.2rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  min-width: 140px;
}

.ord-kpi-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: rgba(255,255,255,0.88);
}

.ord-kpi-label {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ord-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.ord-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
  max-width: 360px;
  padding: 0.55rem 1rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
}

.ord-search-wrap:focus-within {
  border-color: rgba(0, 212, 232, 0.4);
}

.ord-search {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 0.88rem;
}

.ord-search::placeholder {
  color: rgba(255,255,255,0.3);
}

.ord-filter-group {
  display: flex;
  gap: 0.35rem;
}

.ord-filter-btn {
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  cursor: pointer;
}

.ord-filter-btn:hover {
  color: rgba(255,255,255,0.8);
  border-color: rgba(255,255,255,0.2);
}

.ord-filter-btn--active {
  color: #00D4E8;
  background: rgba(0, 212, 232, 0.08);
  border-color: rgba(0, 212, 232, 0.25);
}

.ord-table-wrap {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  overflow: hidden;
}

.ord-table {
  width: 100%;
  border-collapse: collapse;
}

.ord-table th {
  text-align: left;
  padding: 0.8rem 1.1rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.ord-table td {
  padding: 0.75rem 1.1rem;
  font-size: 0.86rem;
  color: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.ord-row {
  cursor: pointer;
}

.ord-row:hover {
  background: rgba(255,255,255,0.04);
}

.ord-table tbody tr:last-child td {
  border-bottom: none;
}

.td-id {
  font-weight: 700;
  color: #00D4E8;
  font-size: 0.82rem;
}

.td-products {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-empty {
  color: rgba(255,255,255,0.25);
  font-style: italic;
}

.td-amount {
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.status-badge {
  font-size: 0.82rem;
  font-weight: 600;
}

.status-badge--closed {
  color: #6EF0B4;
}

.status-badge--open {
  color: #FFC83C;
}

.ord-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3.5rem 1rem;
  color: rgba(255,255,255,0.25);
  gap: 0.75rem;
}

.ord-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

.ord-detail-card {
  width: min(640px, 94vw);
  max-height: 85vh;
  overflow-y: auto;
  background: #0B2C44;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 2rem;
}

.ord-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.ord-detail-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
}

.ord-detail-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
}

.ord-detail-close:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
}

.ord-detail-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.ord-detail-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ord-detail-meta-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.4);
}

.ord-detail-total {
  font-size: 1.2rem;
  font-weight: 800;
  color: #00D4E8;
}

.ord-detail-items h4 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
}

.ord-detail-table {
  width: 100%;
  border-collapse: collapse;
}

.ord-detail-table th {
  text-align: left;
  padding: 0.6rem 0.8rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.ord-detail-table td {
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.ord-detail-table tbody tr:last-child td {
  border-bottom: none;
}

.ord-detail-no-items {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 0.9rem;
}

.ord-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.ord-page-btn {
  padding: 0.5rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.65);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  cursor: pointer;
}

.ord-page-btn:hover:not(:disabled) {
  color: #fff;
  border-color: rgba(255,255,255,0.2);
}

.ord-page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ord-page-info {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.4);
}

@media (max-width: 768px) {
  .ord-title {
    font-size: 1.6rem;
  }
  .ord-kpi-row {
    flex-direction: column;
  }
  .ord-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .ord-search-wrap {
    max-width: 100%;
  }
}
</style>