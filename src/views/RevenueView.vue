<template>
  <AdminLayout breadcrumb="Umsatz" :max-width="1280">
      <!-- Loading -->
      <div v-if="loading" class="admin-loading">
        <div class="admin-spinner"></div>
        <p>Daten werden geladen…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="admin-error">
        <p>⚠ Fehler beim Laden der Daten</p>
        <p class="admin-error-detail">{{ error }}</p>
        <button class="admin-retry-btn" @click="loadOrders">Erneut versuchen</button>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Header -->
        <div class="admin-page-header">
          <h1 class="admin-page-title">Umsatzübersicht</h1>
          <p class="admin-page-subtitle">Nur abgeschlossene Bestellungen (Status: closed)</p>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="admin-kpi">
            <div class="kpi-content">
              <span class="admin-kpi-label">Gesamtumsatz</span>
              <span class="kpi-value">{{ formatCurrency(totalRevenue) }}</span>
            </div>
          </div>

          <div class="admin-kpi">
            <div class="kpi-content">
              <span class="admin-kpi-label">Abgeschl. Bestellungen</span>
              <span class="kpi-value">{{ closedOrders.length }}</span>
            </div>
          </div>

          <div class="admin-kpi">
            <div class="kpi-content">
              <span class="admin-kpi-label">Ø Bestellwert</span>
              <span class="kpi-value">{{ formatCurrency(avgOrderValue) }}</span>
            </div>
          </div>

          <div class="admin-kpi">
            <div class="kpi-content">
              <span class="admin-kpi-label">Umsatz heute</span>
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
          <div class="admin-table-wrap">
            <table class="admin-table" v-if="closedOrders.length > 0">
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
                  <td class="admin-td-id">#{{ order.orderId }}</td>
                  <td>{{ formatDate(order.creationDate) }}</td>
                  <td>{{ getItemCount(order) }}</td>
                  <td class="admin-td-amount">{{ formatCurrency(order.totalPrice || 0) }}</td>
                  <td>
                    <span class="admin-badge-status" :class="'admin-badge-status--' + (order.orderStatus || '').toLowerCase()">
                      {{ order.orderStatus }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="admin-empty">Keine abgeschlossenen Bestellungen vorhanden.</div>
          </div>
        </div>
      </template>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import api from '@/services/api'
import { useFormatters } from '../composables/useFormatters'
import { useOrderUtils } from '../composables/useOrderUtils'

const { formatCurrency, formatDate } = useFormatters()
const { getItemCount } = useOrderUtils()
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

<style>
@import '@/assets/admin-shared.css';
</style>

<style scoped>
/* Revenue-specific styles only */

/* KPI Grid (wider layout variant) */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.kpi-grid .admin-kpi {
  padding: 1.2rem 1.4rem;
  border-radius: 16px;
}

.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
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

/* Section */
.rev-section {
  margin-top: 1rem;
}

.rev-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: rgba(255,255,255,0.8);
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
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>