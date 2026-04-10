<template>
  <AdminEmptyState
    v-if="loading"
    class-name="coupons-empty"
    description-class="coupons-empty-desc"
    message="Coupons werden geladen..."
  />

  <AdminDataTable v-else :columns="columns" :rows="coupons">
    <template #rows="{ rows }">
      <tr v-for="coupon in rows" :key="coupon.id || coupon.code">
        <td class="admin-td-id">{{ coupon.code }}</td>
        <td>
          <div class="coupon-label">{{ coupon.label || '-' }}</div>
        </td>
        <td>{{ formatType(coupon) }}</td>
        <td class="admin-td-amount">{{ formatDiscount(coupon) }}</td>
        <td>{{ Number(coupon.minOrderValue || 0).toFixed(2) }} EUR</td>
        <td>
          <button
            class="coupon-toggle-btn"
            :class="coupon.active ? 'coupon-toggle-btn--active' : 'coupon-toggle-btn--inactive'"
            @click="$emit('toggle-status', coupon)"
          >
            {{ coupon.active ? 'Aktiv' : 'Inaktiv' }}
          </button>
        </td>
        <td>{{ formatDate(coupon.createdAt || coupon.creationDate) }}</td>
      </tr>
    </template>

    <template #empty>
      <AdminEmptyState
        class-name="coupons-empty"
        title-class="coupons-empty-title"
        description-class="coupons-empty-desc"
        title="Keine Coupons gefunden"
        message="Passe die Filter an oder lege direkt einen neuen Coupon an."
      />
    </template>
  </AdminDataTable>
</template>

<script setup>
import AdminDataTable from '@/components/admin/AdminDataTable.vue'
import AdminEmptyState from '@/components/admin/AdminEmptyState.vue'

defineProps({
  coupons: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  formatType: { type: Function, required: true },
  formatDiscount: { type: Function, required: true },
  formatDate: { type: Function, required: true },
})

defineEmits(['toggle-status'])

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'label', label: 'Bezeichnung' },
  { key: 'type', label: 'Typ' },
  { key: 'discount', label: 'Rabatt' },
  { key: 'minOrderValue', label: 'Mindestwert' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Erstellt' },
]
</script>
