<template>
  <AdminEmptyState
    v-if="loading"
    class-name="coupons-empty"
    description-class="coupons-empty-desc"
    :message="t('adminCouponsLoading')"
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
        <td>{{ formatCurrency(coupon.minOrderValue || 0) }}</td>
        <td>
          <button
            type="button"
            class="coupon-toggle-btn"
            :class="coupon.active ? 'coupon-toggle-btn--active' : 'coupon-toggle-btn--inactive'"
            @click="$emit('toggle-status', coupon)"
          >
            {{ coupon.active ? t('adminActive') : t('adminInactive') }}
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
        :title="t('adminCouponsEmpty')"
        :message="t('adminCouponsEmptyHint')"
      />
    </template>
  </AdminDataTable>
</template>

<script setup>
import { computed } from 'vue'
import AdminDataTable from '@/components/admin/AdminDataTable.vue'
import AdminEmptyState from '@/components/admin/AdminEmptyState.vue'
import { useLanguage } from '@/components/Uselanguage'
import { useFormatters } from '@/composables/useFormatters'

const { t } = useLanguage()
const { formatCurrency } = useFormatters()

defineProps({
  coupons: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  formatType: { type: Function, required: true },
  formatDiscount: { type: Function, required: true },
  formatDate: { type: Function, required: true },
})

defineEmits(['toggle-status'])

const columns = computed(() => [
  { key: 'code', label: t('adminCouponCode') },
  { key: 'label', label: t('adminCouponLabel') },
  { key: 'type', label: t('adminCouponType') },
  { key: 'discount', label: t('adminCouponDiscount') },
  { key: 'minOrderValue', label: t('adminCouponMinValue') },
  { key: 'status', label: t('adminCouponStatus') },
  { key: 'createdAt', label: t('adminCouponCreatedAt') },
])
</script>
