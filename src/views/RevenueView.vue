<template>
  <div class="revenue-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <nav class="rev-navbar">
      <div class="rev-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="rev-logo" alt="Scanly" />
        <span class="rev-badge">Admin</span>
        <span class="rev-breadcrumb">/ Umsatz</span>
      </div>
      <button type="button" class="rev-back-btn" @click="$router.push('/admin')">
        <svg viewBox="0 0 24 24" class="rev-back-icon" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Zurück zum Dashboard
      </button>
    </nav>

    <main class="rev-main">
      <!-- Loading -->
      <div v-if="loading" class="rev-loading">
        <div class="rev-spinner"></div>
        <p>Daten werden geladen…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rev-error">
        <p>⚠ Fehler beim Laden der Daten</p>
        <p class="rev-error-detail">{{ error }}</p>
        <button class="rev-retry-btn" @click="loadOrders">Erneut versuchen</button>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- KPI Cards -->
        <div class="rev-header">
          <h1 class="rev-title">Umsatzübersicht</h1>
          <p class="rev-subtitle">Nur abgeschlossene Bestellungen (Status: closed)</p>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--total">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Gesamtumsatz</span>
              <span class="kpi-value">{{ formatCurrency(totalRevenue) }}</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--orders">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Abgeschl. Bestellungen</span>
              <span class="kpi-value">{{ closedOrders.length }}</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--avg">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Ø Bestellwert</span>
              <span class="kpi-value">{{ formatCurrency(avgOrderValue) }}</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--today">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Umsatz heute</span>
              <span class="kpi-value">{{ formatCurrency(todayRevenue) }}</span>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <div class="chart-card chart-card--wide">
            <h3 class="chart-title">Tagesumsatz (letzte 30 Tage)</h3>
            <div class="chart-wrap">
              <Bar v-if="dailyChartData" :data="dailyChartData" :options="barOptions" />
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Top Produkte (nach Umsatz)</h3>
            <div class="chart-wrap chart-wrap--doughnut">
              <Doughnut v-if="productChartData" :data="productChartData" :options="doughnutOptions" />
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Bestellungen pro Tag</h3>
            <div class="chart-wrap chart-wrap--doughnut">
              <Line v-if="ordersTrendData" :data="ordersTrendData" :options="lineOptions" />
            </div>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="rev-section">
          <h2 class="rev-section-title">Letzte abgeschlossene Bestellungen</h2>
          <div class="rev-table-wrap">
            <table class="rev-table" v-if="closedOrders.length > 0">
              <thead>
                <tr>
                  <th>Bestell-ID</th>
                  <th>Datum</th>
                  <th>Artikel</th>
                  <th>Betrag</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.orderId">
                  <td class="td-id">#{{ order.orderId }}</td>
                  <td>{{ formatDate(order.creationDate) }}</td>
                  <td>{{ getItemCount(order) }}</td>
                  <td class="td-amount">{{ formatCurrency(order.totalPrice || 0) }}</td>
                  <td>
                    <span class="pay-badge" :class="'pay-badge--' + (order.orderStatus || '').toLowerCase()">
                      {{ order.orderStatus }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="rev-empty">Keine abgeschlossenen Bestellungen vorhanden.</div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const allOrders = ref([])
const loading = ref(true)
const error = ref(null)

const closedOrders = computed(() =>
  allOrders.value.filter(
    (o) => (o.orderStatus || '').toUpperCase() === 'CLOSED'
  )
)

const totalRevenue = computed(() =>
  closedOrders.value.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
)

const avgOrderValue = computed(() =>
  closedOrders.value.length > 0
    ? totalRevenue.value / closedOrders.value.length
    : 0
)

const todayRevenue = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return closedOrders.value
    .filter((o) => (o.creationDate || '').startsWith(today))
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
})

const recentOrders = computed(() =>
  [...closedOrders.value]
    .sort((a, b) => new Date(b.creationDate || 0) - new Date(a.creationDate || 0))
    .slice(0, 10)
)

// --- Chart Data ---

const dailyChartData = computed(() => {
  const days = getLast30Days()
  const map = {}
  days.forEach((d) => (map[d] = 0))

  closedOrders.value.forEach((o) => {
    const day = (o.creationDate || '').slice(0, 10)
    if (map[day] !== undefined) {
      map[day] += (o.totalPrice || 0)
    }
  })

  return {
    labels: days.map((d) => {
      const parts = d.split('-')
      return `${parts[2]}.${parts[1]}`
    }),
    datasets: [
      {
        label: 'Umsatz (€)',
        data: days.map((d) => Math.round(map[d] * 100) / 100),
        backgroundColor: 'rgba(0, 212, 232, 0.35)',
        borderColor: '#00D4E8',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(0, 212, 232, 0.55)',
      },
    ],
  }
})

const productChartData = computed(() => {
  const map = {}
  closedOrders.value.forEach((o) => {
    if (Array.isArray(o.orderItems)) {
      o.orderItems.forEach((item) => {
        const name = item.productName || 'Unbekannt'
        map[name] = (map[name] || 0) + (item.totalPriceGross || 0)
      })
    }
  })

  // Sort by revenue descending, take top 6
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const labels = sorted.map(([name]) => name)
  const data = sorted.map(([, val]) => Math.round(val * 100) / 100)
  const colors = ['#00D4E8', '#6EF0B4', '#FFC83C', '#B4A0FF', '#FF6B8A', '#FF9F43']

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: 'rgba(7, 26, 42, 0.8)',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }
})

const ordersTrendData = computed(() => {
  const days = getLast30Days()
  const map = {}
  days.forEach((d) => (map[d] = 0))

  closedOrders.value.forEach((o) => {
    const day = (o.creationDate || '').slice(0, 10)
    if (map[day] !== undefined) {
      map[day] += 1
    }
  })

  return {
    labels: days.map((d) => {
      const parts = d.split('-')
      return `${parts[2]}.${parts[1]}`
    }),
    datasets: [
      {
        label: 'Bestellungen',
        data: days.map((d) => map[d]),
        borderColor: '#6EF0B4',
        backgroundColor: 'rgba(110, 240, 180, 0.08)',
        pointBackgroundColor: '#6EF0B4',
        pointBorderColor: '#071A2A',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
    ],
  }
})

// --- Chart Options ---

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(7, 26, 42, 0.95)',
      borderColor: 'rgba(0, 212, 232, 0.3)',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => `${ctx.parsed.y.toFixed(2)} €`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.4)', maxRotation: 45 },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: {
        color: 'rgba(255,255,255,0.4)',
        callback: (v) => `${v} €`,
      },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgba(255,255,255,0.65)',
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(7, 26, 42, 0.95)',
      borderColor: 'rgba(0, 212, 232, 0.3)',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(2)} €`,
      },
    },
  },
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(7, 26, 42, 0.95)',
      borderColor: 'rgba(110, 240, 180, 0.3)',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)',
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.4)', maxRotation: 45 },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.4)', stepSize: 1 },
      grid: { color: 'rgba(255,255,255,0.06)' },
      beginAtZero: true,
    },
  },
}

// --- Helpers ---

function getItemCount(order) {
  if (Array.isArray(order.orderItems)) {
    return order.orderItems.reduce((sum, item) => sum + (item.amount || 1), 0)
  }
  return '—'
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

function getLast30Days() {
  const days = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

async function loadOrders() {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/orders')
    allOrders.value = Array.isArray(response.data) ? response.data : response.data.orders || response.data.content || []
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
.revenue-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

.bg-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

/* Navbar */
.rev-navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.92);
  backdrop-filter: blur(10px);
}

.rev-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rev-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.rev-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #071A2A;
  background: linear-gradient(90deg, #00D4E8, #6EF0F9);
  border-radius: 999px;
}

.rev-breadcrumb {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.rev-back-btn {
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
  transition: all 0.18s;
}

.rev-back-btn:hover {
  color: #fff;
  background: rgba(0, 212, 232, 0.1);
  border-color: rgba(0, 212, 232, 0.3);
  transform: translateY(-1px);
}

.rev-back-icon {
  width: 18px;
  height: 18px;
}

/* Main */
.rev-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 2.5rem 3rem 4rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.rev-header {
  margin-bottom: 2rem;
}

.rev-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.3rem;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rev-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.38);
  margin: 0;
}

/* Loading */
.rev-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  color: rgba(255,255,255,0.4);
  gap: 1rem;
}

.rev-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #00D4E8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.rev-error {
  text-align: center;
  padding: 4rem 1rem;
  color: rgba(255,255,255,0.5);
}

.rev-error-detail {
  font-size: 0.85rem;
  color: rgba(255,100,100,0.7);
}

.rev-retry-btn {
  margin-top: 1rem;
  padding: 0.6rem 1.5rem;
  background: rgba(0, 212, 232, 0.15);
  border: 1px solid rgba(0, 212, 232, 0.3);
  color: #00D4E8;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}

.rev-retry-btn:hover {
  background: rgba(0, 212, 232, 0.25);
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.4rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  transition: all 0.2s;
}

.kpi-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.14);
}

.kpi-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.kpi-icon svg {
  width: 22px;
  height: 22px;
}

.kpi-icon--total {
  background: rgba(0, 212, 232, 0.12);
  color: #00D4E8;
}

.kpi-icon--orders {
  background: rgba(110, 240, 180, 0.12);
  color: #6EF0B4;
}

.kpi-icon--avg {
  background: rgba(255, 200, 60, 0.12);
  color: #FFC83C;
}

.kpi-icon--today {
  background: rgba(180, 160, 255, 0.12);
  color: #B4A0FF;
}

.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.kpi-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: rgba(255,255,255,0.92);
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.chart-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.chart-card:hover {
  border-color: rgba(255,255,255,0.14);
}

.chart-card--wide {
  grid-column: 1 / -1;
}

.chart-title {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255,255,255,0.75);
}

.chart-wrap {
  height: 280px;
  position: relative;
}

.chart-wrap--doughnut {
  height: 260px;
}

/* Table */
.rev-section {
  margin-top: 1rem;
}

.rev-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: rgba(255,255,255,0.8);
}

.rev-table-wrap {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  overflow: hidden;
}

.rev-table {
  width: 100%;
  border-collapse: collapse;
}

.rev-table th {
  text-align: left;
  padding: 0.85rem 1.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.rev-table td {
  padding: 0.8rem 1.2rem;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.rev-table tbody tr:hover {
  background: rgba(255,255,255,0.03);
}

.rev-table tbody tr:last-child td {
  border-bottom: none;
}

.td-id {
  font-weight: 700;
  color: #00D4E8;
  font-size: 0.82rem;
}

.td-amount {
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.pay-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  color: rgba(255,255,255,0.6);
  text-transform: capitalize;
}

.pay-badge--closed {
  background: rgba(110, 240, 180, 0.1);
  border-color: rgba(110, 240, 180, 0.25);
  color: #6EF0B4;
}

.pay-badge--open {
  background: rgba(255, 200, 60, 0.1);
  border-color: rgba(255, 200, 60, 0.25);
  color: #FFC83C;
}

.rev-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.25);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .chart-card--wide {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .rev-navbar {
    padding: 1rem 1.25rem;
  }
  .rev-main {
    padding: 1.5rem 1.25rem 3rem;
  }
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }
  .rev-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>