<script setup>
import { onMounted } from 'vue'
import { useLanguage } from '@/components/Uselanguage'
import AdminLayout from '@/components/AdminLayout.vue'
import AdminKpiRow from '@/components/admin/AdminKpiRow.vue'
import AdminToolbar from '@/components/admin/AdminToolbar.vue'
import CouponFormModal from '@/components/coupons/CouponFormModal.vue'
import CouponTable from '@/components/coupons/CouponTable.vue'
import {
  formatAdminDate,
  formatCouponDiscount,
  formatCouponType,
} from '@/composables/useCouponFormatters'
import {
  useCouponsAdmin,
} from '@/composables/useCouponsAdmin'

const { t, tFn } = useLanguage()

const {
  loading,
  activeModal,
  searchQuery,
  statusFilter,
  saveMessage,
  formError,
  form,
  statusOptions,
  filteredCoupons,
  couponKpis,
  openCreateModal,
  closeModal,
  loadCoupons,
  saveCoupon,
  toggleCouponStatus,
} = useCouponsAdmin()

onMounted(() => {
  loadCoupons()
})
</script>

<template>
  <AdminLayout :breadcrumb="t('adminCoupons')" :max-width="1180">
    <div class="admin-page-header admin-page-header--center">
      <h1 class="admin-page-title">{{ t('adminCouponsManage') }}</h1>
      <p class="admin-page-subtitle">{{ t('adminCouponsManageSub') }}</p>
    </div>

    <AdminKpiRow :items="couponKpis" />

    <div class="admin-card">
      <AdminToolbar
        v-model:search-query="searchQuery"
        v-model:active-filter="statusFilter"
        :search-placeholder="t('adminCouponSearchPlaceholder')"
        :filters="statusOptions"
      >
        <template #actions>
          <div class="coupons-toolbar-actions">
            <button type="button" class="admin-btn admin-btn--secondary" :disabled="loading" @click="loadCoupons">
              {{ loading ? t('adminLoading') : t('adminRefresh') }}
            </button>
            <button type="button" class="admin-btn admin-btn--primary" @click="openCreateModal">{{ t('adminCouponNew') }}</button>
          </div>
        </template>
      </AdminToolbar>

      <div class="coupons-toolbar-meta">
        <span class="coupons-count">{{ tFn('adminCouponsVisible', filteredCoupons.length) }}</span>
        <span v-if="saveMessage" class="admin-saved-msg">{{ saveMessage }}</span>
      </div>

      <CouponTable
        :coupons="filteredCoupons"
        :loading="loading"
        :format-type="formatCouponType"
        :format-discount="formatCouponDiscount"
        :format-date="formatAdminDate"
        @toggle-status="toggleCouponStatus"
      />
    </div>

    <CouponFormModal
      :visible="activeModal"
      :form="form"
      :form-error="formError"
      @close="closeModal"
      @save="saveCoupon"
      @update-field="form[$event.field] = $event.value"
    />
  </AdminLayout>
</template>
