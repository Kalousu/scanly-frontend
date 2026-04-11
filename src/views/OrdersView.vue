<template>
  <AdminLayout :breadcrumb="t('adminOrders')" :max-width="1280">
    <div v-if="loading" class="admin-loading">
      <div class="admin-spinner"></div>
      <p>{{ t('adminOrdersLoading') }}</p>
    </div>

    <div v-else-if="error" class="admin-error">
      <p>{{ t('adminOrdersLoadError') }}</p>
      <p class="admin-error-detail">{{ error }}</p>
      <button type="button" class="admin-retry-btn" @click="loadOrders">{{ t('adminRetry') }}</button>
    </div>

    <template v-else>
      <div class="ord-header">
        <div class="ord-header-left">
          <h1 class="admin-page-title">{{ t('adminOrders') }}</h1>
          <p class="admin-page-subtitle">
            {{ filteredOrders.length }} / {{ allOrders.length }}
          </p>
        </div>
        <button type="button" class="admin-btn--ghost" :disabled="loading" @click="loadOrders">{{ t('adminRefresh') }}</button>
      </div>

      <AdminKpiRow :items="formattedOrderKpis" />

      <AdminToolbar
        v-model:search-query="searchQuery"
        v-model:active-filter="activeFilter"
        :search-placeholder="t('adminSearchOrdersPlaceholder')"
        :filters="filters"
      />

      <AdminOrdersTable
        :orders="paginatedOrders"
        :format-currency="formatCurrency"
        :format-date="formatDate"
        :get-item-count="getItemCount"
        @toggle-expand="toggleExpand"
      />

      <OrderDetailModal
        :order="expandedOrder"
        :format-currency="formatCurrency"
        :format-date="formatDate"
        @close="expandedOrderId = null"
      />

      <div v-if="totalPages > 1" class="admin-pagination">
        <button type="button" class="admin-page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          {{ t('adminBack') }}
        </button>
        <span class="admin-page-info">{{ tFn('adminPageInfo', currentPage, totalPages) }}</span>
        <button type="button" class="admin-page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          {{ t('adminNext') }}
        </button>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useLanguage } from '@/components/Uselanguage'
import AdminLayout from '@/components/AdminLayout.vue'
import AdminKpiRow from '@/components/admin/AdminKpiRow.vue'
import AdminToolbar from '@/components/admin/AdminToolbar.vue'
import AdminOrdersTable from '@/components/orders/AdminOrdersTable.vue'
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue'
import { useFormatters } from '@/composables/useFormatters'
import { useOrdersAdmin } from '@/composables/useOrdersAdmin'
import { useOrderUtils } from '@/composables/useOrderUtils'
import '@/assets/orders-admin.css'

const { t, tFn } = useLanguage()
const { formatCurrency, formatDate } = useFormatters()
const { getItemCount } = useOrderUtils()

const {
  allOrders,
  loading,
  error,
  searchQuery,
  activeFilter,
  currentPage,
  expandedOrderId,
  filters,
  orderKpis,
  filteredOrders,
  totalPages,
  paginatedOrders,
  expandedOrder,
  toggleExpand,
  loadOrders,
} = useOrdersAdmin()

const formattedOrderKpis = computed(() =>
  orderKpis.value.map((kpi) => ({
    ...kpi,
    value: kpi.label === t('adminRevenuKpi') ? formatCurrency(kpi.value) : kpi.value,
  })),
)

onMounted(() => {
  loadOrders()
})
</script>
