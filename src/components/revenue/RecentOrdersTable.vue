<template>
  <div class="rev-section">
    <h2 class="rev-section-title">{{ t('adminRecentOrders') }}</h2>
    <AdminDataTable
      :columns="columns"
      :rows="orders"
      :empty-message="t('adminNoClosedOrders')"
    >
      <template #rows="{ rows }">
        <tr v-for="order in rows" :key="order.orderId">
          <td class="admin-td-id">#{{ order.orderId }}</td>
          <td>{{ formatDate(order.creationDate) }}</td>
          <td>{{ getItemCount(order) }}</td>
          <td class="admin-td-amount">{{ formatCurrency(order.totalPrice || 0) }}</td>
          <td>
            <span
              class="admin-badge-status"
              :class="'admin-badge-status--' + (order.orderStatus || '').toLowerCase()"
            >
              {{ order.orderStatus }}
            </span>
          </td>
        </tr>
      </template>
    </AdminDataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/components/Uselanguage'
import AdminDataTable from '@/components/admin/AdminDataTable.vue'

const { t } = useLanguage()

defineProps({
  orders: { type: Array, default: () => [] },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  getItemCount: { type: Function, required: true },
})

const columns = computed(() => [
  { key: 'id', label: t('adminColOrderId') },
  { key: 'date', label: t('adminColDate') },
  { key: 'items', label: t('adminColItems') },
  { key: 'amount', label: t('adminColAmount') },
  { key: 'status', label: t('adminColStatus') },
])
</script>
