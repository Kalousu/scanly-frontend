<template>
  <AdminLayout breadcrumb="Bestellungen" :max-width="1280">
    <div v-if="loading" class="admin-loading">
      <div class="admin-spinner"></div>
      <p>Bestellungen werden geladen...</p>
    </div>

    <div v-else-if="error" class="admin-error">
      <p>Fehler beim Laden der Bestellungen</p>
      <p class="admin-error-detail">{{ error }}</p>
      <button class="admin-retry-btn" @click="loadOrders">Erneut versuchen</button>
    </div>

    <template v-else>
      <div class="ord-header">
        <div class="ord-header-left">
          <h1 class="admin-page-title">Bestellungen</h1>
          <p class="admin-page-subtitle">
            {{ filteredOrders.length }} von {{ allOrders.length }} Bestellungen
          </p>
        </div>
        <button class="admin-btn--ghost" :disabled="loading" @click="loadOrders">Aktualisieren</button>
      </div>

      <AdminKpiRow :items="formattedOrderKpis" />

      <AdminToolbar
        v-model:search-query="searchQuery"
        v-model:active-filter="activeFilter"
        search-placeholder="Suche nach ID, Produkt..."
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
        <button class="admin-page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          Zurück
        </button>
        <span class="admin-page-info">Seite {{ currentPage }} von {{ totalPages }}</span>
        <button class="admin-page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          Weiter
        </button>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import AdminKpiRow from '@/components/admin/AdminKpiRow.vue'
import AdminToolbar from '@/components/admin/AdminToolbar.vue'
import AdminOrdersTable from '@/components/orders/AdminOrdersTable.vue'
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue'
import { useFormatters } from '@/composables/useFormatters'
import { useOrdersAdmin } from '@/composables/useOrdersAdmin'
import { useOrderUtils } from '@/composables/useOrderUtils'

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
    value: kpi.label === 'Umsatz' ? formatCurrency(kpi.value) : kpi.value,
  })),
)

onMounted(() => {
  loadOrders()
})
</script>

<style>
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
