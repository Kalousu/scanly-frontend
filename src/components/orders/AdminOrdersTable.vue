<template>
  <AdminDataTable :columns="columns" :rows="orders" :empty-message="t('adminNoOrders')">
    <template #rows="{ rows }">
      <tr
        v-for="order in rows"
        :key="order.orderId"
        class="ord-row"
        :class="{ 'ord-row--open': order.orderStatus === 'OPEN' }"
        @click="$emit('toggle-expand', order.orderId)"
      >
        <td class="admin-td-id">#{{ order.orderId }}</td>
        <td>{{ formatDate(order.creationDate) }}</td>
        <td class="td-products">
          <span v-if="order.orderItems && order.orderItems.length > 0">
            {{ order.orderItems.map((item) => item.productName).join(', ') }}
          </span>
          <span v-else class="td-empty">{{ t('adminNoItems') }}</span>
        </td>
        <td>{{ getItemCount(order) }}</td>
        <td class="admin-td-amount">{{ formatCurrency(order.totalPrice || 0) }}</td>
        <td>
          <span
            class="admin-badge-status"
            :class="'admin-badge-status--' + (order.orderStatus || '').toLowerCase()"
          >
            {{ order.orderStatus === 'CLOSED' ? t('adminClosed') : t('adminOpen') }}
          </span>
        </td>
      </tr>
    </template>
  </AdminDataTable>
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

defineEmits(['toggle-expand'])

const columns = computed(() => [
  { key: 'id', label: t('adminColId') },
  { key: 'date', label: t('adminColDate') },
  { key: 'products', label: t('adminColProducts') },
  { key: 'items', label: t('adminColItems') },
  { key: 'amount', label: t('adminColAmount') },
  { key: 'status', label: t('adminColStatus') },
])
</script>
