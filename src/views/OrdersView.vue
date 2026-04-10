<template>
  <AdminLayout breadcrumb="Bestellungen" :max-width="1280">
    <div v-if="loading" class="admin-loading">
      <div class="admin-spinner"></div>
      <p>Bestellungen werden geladen…</p>
    </div>

    <div v-else-if="error" class="admin-error">
      <p>⚠ Fehler beim Laden der Bestellungen</p>
      <p class="admin-error-detail">{{ error }}</p>
      <button class="admin-retry-btn" @click="loadOrders">Erneut versuchen</button>
    </div>

    <template v-else>
      <div class="ord-header">
        <div class="ord-header-left">
          <h1 class="admin-page-title">Bestellungen</h1>
          <p class="admin-page-subtitle">{{ filteredOrders.length }} von {{ allOrders.length }} Bestellungen</p>
        </div>
        <button class="admin-btn--ghost" @click="loadOrders" :disabled="loading">
          Aktualisieren
        </button>
      </div>

      <div class="admin-kpi-row">
        <div class="admin-kpi">
          <span class="admin-kpi-num">{{ allOrders.length }}</span>
          <span class="admin-kpi-label">Gesamt</span>
        </div>
        <div class="admin-kpi">
          <span class="admin-kpi-num">{{ openOrders.length }}</span>
          <span class="admin-kpi-label">Offen</span>
        </div>
        <div class="admin-kpi">
          <span class="admin-kpi-num">{{ closedOrders.length }}</span>
          <span class="admin-kpi-label">Abgeschlossen</span>
        </div>
        <div class="admin-kpi">
          <span class="admin-kpi-num">{{ formatCurrency(closedRevenue) }}</span>
          <span class="admin-kpi-label">Umsatz</span>
        </div>
      </div>

      <div class="admin-toolbar">
        <div class="admin-search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            class="admin-search-input"
            placeholder="Suche nach ID, Produkt…"
          />
        </div>
        <div class="admin-filter-group">
          <button
            v-for="f in filters"
            :key="f.value"
            class="admin-filter-btn"
            :class="{ 'admin-filter-btn--active': activeFilter === f.value }"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table" v-if="filteredOrders.length > 0">
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
              <td class="admin-td-id">#{{ order.orderId }}</td>
              <td>{{ formatDate(order.creationDate) }}</td>
              <td class="td-products">
                <span v-if="order.orderItems && order.orderItems.length > 0">
                  {{ order.orderItems.map(i => i.productName).join(', ') }}
                </span>
                <span v-else class="td-empty">Keine Artikel</span>
              </td>
              <td>{{ getItemCount(order) }}</td>
              <td class="admin-td-amount">{{ formatCurrency(order.totalPrice || 0) }}</td>
              <td>
                <span class="admin-badge-status" :class="'admin-badge-status--' + (order.orderStatus || '').toLowerCase()">
                  {{ order.orderStatus === 'CLOSED' ? 'Abgeschlossen' : 'Offen' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="admin-empty">
          <p>Keine Bestellungen gefunden</p>
        </div>
      </div>

      <Transition name="detail-fade">
        <div v-if="expandedOrder" class="admin-modal-overlay" @click.self="expandedOrderId = null">
          <div class="admin-modal admin-modal--lg">
            <div class="admin-modal-header">
              <h3 class="admin-modal-title">Bestellung #{{ expandedOrder.orderId }}</h3>
              <button class="admin-modal-close" @click="expandedOrderId = null">X</button>
            </div>
            <div class="admin-modal-body">
              <div class="ord-detail-meta">
                <div class="ord-detail-meta-item">
                  <span class="ord-detail-meta-label">Datum</span>
                  <span>{{ formatDate(expandedOrder.creationDate) }}</span>
                </div>
                <div class="ord-detail-meta-item">
                  <span class="ord-detail-meta-label">Status</span>
                  <span class="admin-badge-status" :class="'admin-badge-status--' + (expandedOrder.orderStatus || '').toLowerCase()">
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
                <table class="admin-table">
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
                      <td>{{ Math.round(item.taxRate * 100) }}%</td>
                      <td class="admin-td-amount">{{ formatCurrency(item.totalPriceGross) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="ord-detail-no-items">
                Keine Artikel in dieser Bestellung.
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <div class="admin-pagination" v-if="totalPages > 1">
        <button class="admin-page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          ← Zurück
        </button>
        <span class="admin-page-info">Seite {{ currentPage }} von {{ totalPages }}</span>
        <button class="admin-page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
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

<style>
@import '@/assets/admin-shared.css';
</style>

<style scoped>
/* Orders-specific styles only */
.ord-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.ord-row {
  cursor: pointer;
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

/* Detail overlay specifics */
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

.ord-detail-no-items {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .admin-kpi-row {
    flex-direction: column;
  }
}
</style>