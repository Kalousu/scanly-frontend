<template>
  <AdminModal :visible="Boolean(activeModal)" :title="modalTitle" @close="$emit('close')">

        <div v-if="activeModal === 'add'" class="admin-modal-body">
          <ProductFormFields
            :form="form"
            :categories="categories"
            :price-label="priceLabel"
            :price-placeholder="pricePlaceholder"
            @update-field="$emit('update-form-field', $event)"
          />
          <ProductActionFeedback :action-state="actionState" :success-text="t('adminProductAddSuccess')" />
          <ProductModalFooter
            :confirm-label="t('adminProductAdd')"
            :loading-label="t('adminProductAdding')"
            button-class="admin-btn--success"
            :loading="actionState.loading"
            @close="$emit('close')"
            @confirm="$emit('add')"
          />
        </div>

        <div v-if="activeModal === 'edit'" class="admin-modal-body">
          <ProductLookupPanel
            mode="edit"
            :search-query="searchQuery"
            :loading="searchLoading"
            :error="searchError"
            :product="foundProduct"
            :category-labels="categoryLabels"
            :format-price="formatPrice"
            :get-barcode="getBarcode"
            @update:search-query="$emit('update:searchQuery', $event)"
            @search="$emit('search')"
          />
          <p v-if="!foundProduct" class="prod-hint">{{ t('adminProductSearchHint') }}</p>
          <ProductFormFields
            :form="form"
            :categories="categories"
            :price-label="priceLabel"
            :price-placeholder="pricePlaceholder"
            :disabled="!foundProduct"
            :name-placeholder="t('adminProductName')"
            @update-field="$emit('update-form-field', $event)"
          />
          <ProductActionFeedback :action-state="actionState" :success-text="t('adminProductEditSuccess')" />
          <ProductModalFooter
            :confirm-label="t('adminProductSaveChanges')"
            :loading-label="t('adminProductSaving')"
            button-class="admin-btn--primary"
            :disabled="!foundProduct"
            :loading="actionState.loading"
            @close="$emit('close')"
            @confirm="$emit('edit')"
          />
        </div>

        <div v-if="activeModal === 'remove'" class="admin-modal-body">
          <ProductLookupPanel
            mode="remove"
            :search-query="searchQuery"
            :loading="searchLoading"
            :error="searchError"
            :product="foundProduct"
            :category-labels="categoryLabels"
            :format-price="formatPrice"
            :get-barcode="getBarcode"
            @update:search-query="$emit('update:searchQuery', $event)"
            @search="$emit('search')"
          />
          <div class="admin-alert admin-alert--warning">
            <div>
              <p class="prod-warning-title">{{ t('adminWarning') }}</p>
              <p class="prod-warning-text">{{ t('adminProductWarning') }}</p>
            </div>
          </div>
          <ProductActionFeedback :action-state="actionState" :success-text="t('adminProductRemoveSuccess')" />
          <ProductModalFooter
            :confirm-label="t('adminProductRemove')"
            :loading-label="t('adminProductRemoving')"
            button-class="admin-btn--danger"
            :disabled="!foundProduct"
            :loading="actionState.loading"
            @close="$emit('close')"
            @confirm="$emit('remove')"
          />
        </div>
  </AdminModal>
</template>

<script setup>
import { useLanguage as useComponentLanguage } from '@/components/Uselanguage'
import AdminModal from '@/components/admin/AdminModal.vue'
import ProductFormFields from '@/components/products/ProductFormFields.vue'
import ProductLookupPanel from '@/components/products/ProductLookupPanel.vue'

const { t } = useLanguage()

defineProps({
  activeModal: { type: String, default: null },
  modalTitle: { type: String, default: '' },
  form: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  priceLabel: { type: String, required: true },
  pricePlaceholder: { type: String, required: true },
  actionState: { type: Object, required: true },
  searchQuery: { type: String, default: '' },
  searchLoading: { type: Boolean, default: false },
  searchError: { type: String, default: '' },
  foundProduct: { type: Object, default: null },
  categoryLabels: { type: Object, default: () => ({}) },
  formatPrice: { type: Function, required: true },
  getBarcode: { type: Function, required: true },
})

defineEmits(['close', 'add', 'edit', 'remove', 'search', 'update:searchQuery', 'update-form-field'])
</script>

<script>
import { useLanguage } from '@/components/Uselanguage'

const ProductActionFeedback = {
  props: {
    actionState: { type: Object, required: true },
    successText: { type: String, required: true },
  },
  template: `
    <div>
      <div v-if="actionState.error" class="admin-alert admin-alert--error">
        <p>{{ actionState.error }}</p>
      </div>
      <div v-if="actionState.success" class="prod-success-msg">
        {{ successText }}
      </div>
    </div>
  `,
}

const ProductModalFooter = {
  props: {
    confirmLabel: { type: String, required: true },
    loadingLabel: { type: String, required: true },
    buttonClass: { type: String, required: true },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['close', 'confirm'],
  setup() {
    const { t } = useComponentLanguage()
    return { t }
  },
  template: `
    <div class="admin-modal-footer">
      <button type="button" class="admin-btn admin-btn--secondary" @click="$emit('close')">{{ t('adminCancel') }}</button>
      <button type="button" class="admin-btn" :class="buttonClass" :disabled="disabled || loading" @click="$emit('confirm')">
        <span v-if="loading" class="admin-spinner admin-spinner--sm"></span>
        {{ loading ? loadingLabel : confirmLabel }}
      </button>
    </div>
  `,
}

export default {
  components: {
    ProductActionFeedback,
    ProductModalFooter,
  },
}
</script>
