<template>
  <AdminModal :visible="Boolean(order)" modal-class="admin-modal--lg" transition-name="detail-fade" @close="$emit('close')">
    <template #header>
      <template v-if="order">
          <h3 class="admin-modal-title">Bestellung #{{ order.orderId }}</h3>
          <button class="admin-modal-close" @click="$emit('close')">X</button>
      </template>
    </template>
    <div v-if="order" class="admin-modal-body">
          <div class="ord-detail-meta">
            <div class="ord-detail-meta-item">
              <span class="ord-detail-meta-label">Datum</span>
              <span>{{ formatDate(order.creationDate) }}</span>
            </div>
            <div class="ord-detail-meta-item">
              <span class="ord-detail-meta-label">Status</span>
              <span
                class="admin-badge-status"
                :class="'admin-badge-status--' + (order.orderStatus || '').toLowerCase()"
              >
                {{ order.orderStatus === 'CLOSED' ? 'Abgeschlossen' : 'Offen' }}
              </span>
            </div>
            <div class="ord-detail-meta-item">
              <span class="ord-detail-meta-label">Gesamtbetrag</span>
              <span class="ord-detail-total">{{ formatCurrency(order.totalPrice || 0) }}</span>
            </div>
          </div>
          <div v-if="order.orderItems && order.orderItems.length > 0" class="ord-detail-items">
            <h4>Positionen</h4>
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Menge</th>
                  <th>Netto/Stk</th>
                  <th>MwSt</th>
                  <th>Brutto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in order.orderItems" :key="item.id">
                  <td>{{ item.productName }}</td>
                  <td>{{ item.amount }}</td>
                  <td>{{ formatCurrency(item.unitPriceNet) }}</td>
                  <td>{{ Math.round(item.taxRate * 100) }}%</td>
                  <td class="admin-td-amount">{{ formatCurrency(item.totalPriceGross) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="ord-detail-no-items">Keine Artikel in dieser Bestellung.</div>
    </div>
  </AdminModal>
</template>

<script setup>
import AdminModal from '@/components/admin/AdminModal.vue'

defineProps({
  order: { type: Object, default: null },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true },
})

defineEmits(['close'])
</script>
