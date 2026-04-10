<template>
  <AdminLayout breadcrumb="Umsatz" :max-width="1280">
    <div v-if="loading" class="admin-loading">
      <div class="admin-spinner"></div>
      <p>Daten werden geladen...</p>
    </div>

    <div v-else-if="error" class="admin-error">
      <p>Fehler beim Laden der Daten</p>
      <p class="admin-error-detail">{{ error }}</p>
      <button class="admin-retry-btn" @click="loadOrders">Erneut versuchen</button>
    </div>

    <template v-else>
      <div class="admin-page-header">
        <h1 class="admin-page-title">Umsatzübersicht</h1>
        <p class="admin-page-subtitle">Nur abgeschlossene Bestellungen (Status: CLOSED)</p>
      </div>

      <AdminKpiGrid :items="formattedRevenueKpis" />

      <RevenueCharts
        :daily-chart-data="dailyChartData"
        :product-chart-data="productChartData"
        :orders-trend-data="ordersTrendData"
      />

      <RecentOrdersTable
        :orders="recentOrders"
        :format-currency="formatCurrency"
        :format-date="formatDate"
        :get-item-count="getItemCount"
      />
    </template>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import AdminKpiGrid from '@/components/admin/AdminKpiGrid.vue'
import RecentOrdersTable from '@/components/revenue/RecentOrdersTable.vue'
import RevenueCharts from '@/components/revenue/RevenueCharts.vue'
import { useFormatters } from '@/composables/useFormatters'
import { useOrderUtils } from '@/composables/useOrderUtils'
import { useRevenueAnalytics } from '@/composables/useRevenueAnalytics'

const { formatCurrency, formatDate } = useFormatters()
const { getItemCount } = useOrderUtils()

const {
  loading,
  error,
  recentOrders,
  revenueKpis,
  dailyChartData,
  productChartData,
  ordersTrendData,
  loadOrders,
} = useRevenueAnalytics()

const formattedRevenueKpis = computed(() =>
  revenueKpis.value.map((kpi) => ({
    ...kpi,
    value: kpi.type === 'currency' ? formatCurrency(kpi.value) : kpi.value,
  })),
)

onMounted(() => {
  loadOrders()
})
</script>

<style>
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

.rev-section {
  margin-top: 1rem;
}

.rev-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: rgba(255,255,255,0.8);
}

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
