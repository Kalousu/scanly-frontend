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
          <div v-if="actionState.error" class="admin-alert admin-alert--error">
            <p>{{ actionState.error }}</p>
          </div>
          <div v-if="actionState.success" class="prod-success-msg">
            {{ t('adminProductAddSuccess') }}
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn admin-btn--secondary" @click="$emit('close')">{{ t('adminCancel') }}</button>
            <button type="button" class="admin-btn admin-btn--success" :disabled="actionState.loading" @click="$emit('add')">
              <span v-if="actionState.loading" class="admin-spinner admin-spinner--sm"></span>
              {{ actionState.loading ? t('adminProductAdding') : t('adminProductAdd') }}
            </button>
          </div>
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
          <div v-if="actionState.error" class="admin-alert admin-alert--error">
            <p>{{ actionState.error }}</p>
          </div>
          <div v-if="actionState.success" class="prod-success-msg">
            {{ t('adminProductEditSuccess') }}
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn admin-btn--secondary" @click="$emit('close')">{{ t('adminCancel') }}</button>
            <button type="button" class="admin-btn admin-btn--primary" :disabled="!foundProduct || actionState.loading" @click="$emit('edit')">
              <span v-if="actionState.loading" class="admin-spinner admin-spinner--sm"></span>
              {{ actionState.loading ? t('adminProductSaving') : t('adminProductSaveChanges') }}
            </button>
          </div>
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
          <div v-if="actionState.error" class="admin-alert admin-alert--error">
            <p>{{ actionState.error }}</p>
          </div>
          <div v-if="actionState.success" class="prod-success-msg">
            {{ t('adminProductRemoveSuccess') }}
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn admin-btn--secondary" @click="$emit('close')">{{ t('adminCancel') }}</button>
            <button type="button" class="admin-btn admin-btn--danger" :disabled="!foundProduct || actionState.loading" @click="$emit('remove')">
              <span v-if="actionState.loading" class="admin-spinner admin-spinner--sm"></span>
              {{ actionState.loading ? t('adminProductRemoving') : t('adminProductRemove') }}
            </button>
          </div>
        </div>
  </AdminModal>
</template>

<script setup>
import { useLanguage } from '@/components/Uselanguage'
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
