<template>
  <div class="orders-page">
    <nav class="ord-navbar">
      <div class="ord-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="ord-logo" alt="Scanly" />
        <span class="ord-badge">Admin</span>
        <span class="ord-breadcrumb">/ Bestellungen</span>
      </div>
      <button type="button" class="ord-back-btn" @click="$router.push('/admin')">
        <svg viewBox="0 0 24 24" class="ord-back-icon" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Zurück zum Dashboard
      </button>
    </nav>

    <main class="ord-main">
      <!-- Loading -->
      <div v-if="loading" class="ord-loading">
        <div class="ord-spinner"></div>
        <p>Bestellungen werden geladen…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="ord-error">
        <p>⚠ Fehler beim Laden der Bestellungen</p>
        <p class="ord-error-detail">{{ error }}</p>
        <button class="ord-retry-btn" @click="loadOrders">Erneut versuchen</button>
      </div>

      <!-- Content -->
      <template v-else>
        <div class="ord-header">
          <div class="ord-header-left">
            <h1 class="ord-title">Bestellungen</h1>
            <p class="ord-subtitle">{{ filteredOrders.length }} von {{ allOrders.length }} Bestellungen</p>
          </div>
          <button class="ord-refresh-btn" @click="loadOrders" :disabled="loading">
            <svg viewBox="0 0 24 24" fill="currentColor" class="ord-refresh-icon" :class="{ 'ord-refresh-spinning': loading }">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Aktualisieren
          </button>
        </div>

        <!-- KPI Row -->
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

        <!-- Filter & Search -->
        <div class="ord-toolbar">
          <div class="ord-search-wrap">
            <svg viewBox="0 0 24 24" fill="currentColor" class="ord-search-icon">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
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

        <!-- Orders Table -->
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
            <svg viewBox="0 0 24 24" fill="currentColor" class="ord-empty-icon">
              <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
            </svg>
            <p>Keine Bestellungen gefunden</p>
          </div>
        </div>

        <!-- Expanded Detail -->
        <Transition name="detail-fade">
          <div v-if="expandedOrder" class="ord-detail-overlay" @click.self="expandedOrderId = null">
            <div class="ord-detail-card">
              <div class="ord-detail-header">
                <h3>Bestellung #{{ expandedOrder.orderId }}</h3>
                <button class="ord-detail-close" @click="expandedOrderId = null">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
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

        <!-- Pagination -->
        <div class="ord-pagination" v-if="totalPages > 1">
          <button
            class="ord-page-btn"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            ← Zurück
          </button>
          <span class="ord-page-info">Seite {{ currentPage }} von {{ totalPages }}</span>
          <button
            class="ord-page-btn"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            Weiter →
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'

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

  // Filter by status
  if (activeFilter.value !== 'all') {
    result = result.filter((o) => (o.orderStatus || '').toUpperCase() === activeFilter.value)
  }

  // Search
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

  // Sort newest first
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

// Reset page when filter/search changes
watch([activeFilter, searchQuery], () => {
  currentPage.value = 1
})

function toggleExpand(orderId) {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
}

function getItemCount(order) {
  if (Array.isArray(order.orderItems)) {
    return order.orderItems.reduce((sum, item) => sum + (item.amount || 1), 0)
  }
  return 0
}

function formatCurrency(val) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(val)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
.orders-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #091E30;
}

/* Navbar */
.ord-navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.95);
}

.ord-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ord-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.ord-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #071A2A;
  background: #00D4E8;
  border-radius: 999px;
}

.ord-breadcrumb {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.ord-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  cursor: pointer;
}

.ord-back-btn:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
}

.ord-back-icon {
  width: 18px;
  height: 18px;
}

/* Main */
.ord-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 2rem 3rem 4rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

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

.ord-refresh-icon {
  width: 16px;
  height: 16px;
}

.ord-refresh-spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Loading */
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

/* Error */
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

/* KPI Row */
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

.ord-kpi--open .ord-kpi-num { color: #FFC83C; }
.ord-kpi--closed .ord-kpi-num { color: #6EF0B4; }
.ord-kpi--revenue .ord-kpi-num { color: #00D4E8; }

/* Toolbar */
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

.ord-search-icon {
  width: 18px;
  height: 18px;
  color: rgba(255,255,255,0.35);
  flex-shrink: 0;
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

/* Table */
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

.ord-empty-icon {
  width: 36px;
  height: 36px;
  opacity: 0.4;
}

/* Detail Overlay */
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

.ord-detail-close svg {
  width: 18px;
  height: 18px;
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

/* Pagination */
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

/* Responsive */
@media (max-width: 768px) {
  .ord-navbar {
    padding: 1rem 1.25rem;
  }
  .ord-main {
    padding: 1.5rem 1.25rem 3rem;
  }
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