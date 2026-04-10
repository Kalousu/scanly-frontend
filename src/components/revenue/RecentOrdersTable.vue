<template>
  <div class="rev-section">
    <h2 class="rev-section-title">Letzte abgeschlossene Bestellungen</h2>
    <AdminDataTable
      :columns="columns"
      :rows="orders"
      empty-message="Keine abgeschlossenen Bestellungen vorhanden."
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
import AdminDataTable from '@/components/admin/AdminDataTable.vue'

defineProps({
  orders: { type: Array, default: () => [] },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  getItemCount: { type: Function, required: true },
})

const columns = [
  { key: 'id', label: 'Bestell-ID' },
  { key: 'date', label: 'Datum' },
  { key: 'items', label: 'Artikel' },
  { key: 'amount', label: 'Betrag' },
  { key: 'status', label: 'Status' },
]
</script>
