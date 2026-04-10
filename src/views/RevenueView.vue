<template>
  <AdminLayout :breadcrumb="t('adminRevenue')" :max-width="1280">
    <div v-if="loading" class="admin-loading">
      <div class="admin-spinner"></div>
      <p>{{ t('adminRevenueLoading') }}</p>
    </div>

    <div v-else-if="error" class="admin-error">
      <p>{{ t('adminErrorLoadingData') }}</p>
      <p class="admin-error-detail">{{ error }}</p>
      <button type="button" class="admin-retry-btn" @click="loadOrders">{{ t('adminRetry') }}</button>
    </div>

    <template v-else>
      <div class="admin-page-header">
        <h1 class="admin-page-title">{{ t('adminRevenueOverview') }}</h1>
        <p class="admin-page-subtitle">{{ t('adminRevenueOnlyClosed') }}</p>
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
import { useLanguage } from '@/components/Uselanguage'
import AdminLayout from '@/components/AdminLayout.vue'
import AdminKpiGrid from '@/components/admin/AdminKpiGrid.vue'
import RecentOrdersTable from '@/components/revenue/RecentOrdersTable.vue'
import RevenueCharts from '@/components/revenue/RevenueCharts.vue'
import { useFormatters } from '@/composables/useFormatters'
import { useOrderUtils } from '@/composables/useOrderUtils'
import { useRevenueAnalytics } from '@/composables/useRevenueAnalytics'

const { t } = useLanguage()
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
