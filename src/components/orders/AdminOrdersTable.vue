<template>
  <AdminDataTable :columns="columns" :rows="orders" empty-message="Keine Bestellungen gefunden">
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
          <span v-else class="td-empty">Keine Artikel</span>
        </td>
        <td>{{ getItemCount(order) }}</td>
        <td class="admin-td-amount">{{ formatCurrency(order.totalPrice || 0) }}</td>
        <td>
          <span
            class="admin-badge-status"
            :class="'admin-badge-status--' + (order.orderStatus || '').toLowerCase()"
          >
            {{ order.orderStatus === 'CLOSED' ? 'Abgeschlossen' : 'Offen' }}
          </span>
        </td>
      </tr>
    </template>
  </AdminDataTable>
</template>

<script setup>
import AdminDataTable from '@/components/admin/AdminDataTable.vue'

defineProps({
  orders: { type: Array, default: () => [] },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  getItemCount: { type: Function, required: true },
})

defineEmits(['toggle-expand'])

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Datum' },
  { key: 'products', label: 'Produkte' },
  { key: 'items', label: 'Artikel' },
  { key: 'amount', label: 'Betrag' },
  { key: 'status', label: 'Status' },
]
</script>
