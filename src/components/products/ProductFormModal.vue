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
          <ProductActionFeedback :action-state="actionState" success-text="Produkt erfolgreich hinzugefügt!" />
          <ProductModalFooter
            confirm-label="Produkt hinzufügen"
            loading-label="Wird hinzugefügt..."
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
          <p v-if="!foundProduct" class="prod-hint">Gib eine EAN ein und klicke auf "Suchen", um das Produkt zu laden.</p>
          <ProductFormFields
            :form="form"
            :categories="categories"
            :price-label="priceLabel"
            :price-placeholder="pricePlaceholder"
            :disabled="!foundProduct"
            name-placeholder="Produktname"
            @update-field="$emit('update-form-field', $event)"
          />
          <ProductActionFeedback :action-state="actionState" success-text="Produkt erfolgreich aktualisiert!" />
          <ProductModalFooter
            confirm-label="Änderungen speichern"
            loading-label="Wird gespeichert..."
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
              <p class="prod-warning-title">Achtung</p>
              <p class="prod-warning-text">Das Entfernen eines Produkts kann nicht rückgängig gemacht werden.</p>
            </div>
          </div>
          <ProductActionFeedback :action-state="actionState" success-text="Produkt erfolgreich entfernt!" />
          <ProductModalFooter
            confirm-label="Produkt entfernen"
            loading-label="Wird entfernt..."
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
import AdminModal from '@/components/admin/AdminModal.vue'
import ProductFormFields from '@/components/products/ProductFormFields.vue'
import ProductLookupPanel from '@/components/products/ProductLookupPanel.vue'

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
  template: `
    <div class="admin-modal-footer">
      <button class="admin-btn admin-btn--secondary" @click="$emit('close')">Abbrechen</button>
      <button class="admin-btn" :class="buttonClass" :disabled="disabled || loading" @click="$emit('confirm')">
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
