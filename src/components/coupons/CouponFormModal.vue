<template>
  <AdminModal :visible="visible" :title="t('adminCouponCreate')" modal-class="admin-modal--lg" @close="$emit('close')">
        <div class="admin-modal-body">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">{{ t('adminCouponCodeLabel') }}</label>
              <input
                :value="form.code"
                type="text"
                class="admin-input"
                maxlength="32"
                :placeholder="t('adminCouponCodePlaceholder')"
                @input="updateField('code', $event.target.value)"
              />
            </div>

            <div class="admin-form-group">
              <label class="admin-label">{{ t('adminCouponLabelLabel') }}</label>
              <input
                :value="form.label"
                type="text"
                class="admin-input"
                :placeholder="t('adminCouponLabelPlaceholder')"
                @input="updateField('label', $event.target.value)"
              />
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">{{ t('adminCouponTypeLabel') }}</label>
              <select
                :value="form.type"
                class="admin-input"
                @change="updateField('type', $event.target.value)"
              >
                <option value="percentage">{{ t('adminCouponTypePercentage') }}</option>
                <option value="fixed">{{ t('adminCouponTypeFixed') }}</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label class="admin-label">
                {{ form.type === 'percentage' ? t('adminCouponDiscountPercent') : t('adminCouponDiscountFixed') }}
              </label>
              <input
                :value="form.value"
                type="number"
                min="0"
                step="0.01"
                class="admin-input"
                @input="updateField('value', Number($event.target.value))"
              />
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">{{ t('adminCouponMinOrderLabel') }}</label>
              <input
                :value="form.minOrderValue"
                type="number"
                min="0"
                step="0.01"
                class="admin-input"
                @input="updateField('minOrderValue', Number($event.target.value))"
              />
            </div>
          </div>

          <div class="coupon-preview">
            <div class="coupon-preview-label">{{ t('adminCouponPreview') }}</div>
            <div class="coupon-preview-code">{{ (form.code || 'CODE').toUpperCase() }}</div>
            <div class="coupon-preview-text">{{ form.label || t('adminCouponDefaultLabel') }}</div>
            <div class="coupon-preview-meta">
              {{ discountPreview }} · {{ t('adminCouponMinValue') }} {{ formatCurrency(form.minOrderValue || 0) }}
            </div>
          </div>

          <div v-if="formError" class="admin-alert admin-alert--error">
            <p>{{ formError }}</p>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="admin-btn admin-btn--secondary" @click="$emit('close')">{{ t('adminCancel') }}</button>
            <button type="button" class="admin-btn admin-btn--primary" @click="$emit('save')">{{ t('adminCouponCreate') }}</button>
          </div>
        </div>
  </AdminModal>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/components/Uselanguage'
import { useFormatters } from '@/composables/useFormatters'
import AdminModal from '@/components/admin/AdminModal.vue'

const { t } = useLanguage()
const { formatCurrency } = useFormatters()

const props = defineProps({
  visible: { type: Boolean, default: false },
  form: { type: Object, required: true },
  formError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save', 'update-field'])

function updateField(field, value) {
  emit('update-field', { field, value })
}

const discountPreview = computed(() =>
  props.form.type === 'percentage'
    ? `${Number(props.form.value || 0)}% ${t('adminCouponDiscount')}`
    : `${formatCurrency(props.form.value || 0)} ${t('adminCouponDiscount')}`,
)
</script>
