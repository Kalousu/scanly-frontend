<script setup>
import { onMounted } from 'vue'
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
  <AdminLayout breadcrumb="Gutscheine" :max-width="1180">
    <div class="admin-page-header admin-page-header--center">
      <h1 class="admin-page-title">Gutscheine & Coupons</h1>
      <p class="admin-page-subtitle">Verwaltung für Gutschein- und Rabatt-Codes</p>
    </div>

    <AdminKpiRow :items="couponKpis" />

    <div class="admin-card">
      <AdminToolbar
        v-model:search-query="searchQuery"
        v-model:active-filter="statusFilter"
        search-placeholder="Nach Code oder Couponname suchen..."
        :filters="statusOptions"
      >
        <template #actions>
          <div class="coupons-toolbar-actions">
            <button class="admin-btn admin-btn--secondary" :disabled="loading" @click="loadCoupons">
              {{ loading ? 'Laden...' : 'Aktualisieren' }}
            </button>
            <button class="admin-btn admin-btn--primary" @click="openCreateModal">Neuer Coupon</button>
          </div>
        </template>
      </AdminToolbar>

      <div class="coupons-toolbar-meta">
        <span class="coupons-count">{{ filteredCoupons.length }} Coupons sichtbar</span>
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
<style>
.coupons-toolbar-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.coupons-toolbar-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.coupons-count {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.42);
}

.coupon-label {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.86);
}

.coupon-toggle-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.13s;
}

.coupon-toggle-btn:hover {
  transform: translateY(-1px);
}

.coupon-toggle-btn:active {
  transform: scale(0.97);
}

.coupon-toggle-btn--active {
  color: #6ef0b4;
  background: rgba(110, 240, 180, 0.08);
  border-color: rgba(110, 240, 180, 0.25);
}

.coupon-toggle-btn--active:hover {
  background: rgba(110, 240, 180, 0.14);
  border-color: rgba(110, 240, 180, 0.4);
}

.coupon-toggle-btn--inactive {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.coupon-toggle-btn--inactive:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.coupon-preview {
  margin-top: 0.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(0, 212, 232, 0.1), rgba(110, 240, 180, 0.05)),
    rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 212, 232, 0.14);
}

.coupon-preview-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
}

.coupon-preview-code {
  margin-top: 0.45rem;
  font-size: 1.5rem;
  font-weight: 900;
  color: #00d4e8;
  letter-spacing: 0.06em;
}

.coupon-preview-text {
  margin-top: 0.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
}

.coupon-preview-meta {
  margin-top: 0.4rem;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.46);
}

.coupons-empty {
  min-height: 220px;
  justify-content: center;
  text-align: center;
}

.coupons-empty-title {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.82);
}

.coupons-empty-desc {
  margin: 0;
  max-width: 420px;
  font-size: 0.86rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.38);
}

@media (max-width: 900px) {
  .coupons-toolbar-actions {
    width: 100%;
    margin-left: 0;
  }

  .coupons-toolbar-actions .admin-btn {
    flex: 1;
    justify-content: center;
  }

  .coupons-toolbar-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

