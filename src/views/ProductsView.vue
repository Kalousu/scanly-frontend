<script setup>
import { useLanguage } from '@/components/Uselanguage'
import AdminLayout from '@/components/AdminLayout.vue'
import ProductActionGrid from '@/components/products/ProductActionGrid.vue'
import ProductDatabaseTable from '@/components/products/ProductDatabaseTable.vue'
import ProductFormModal from '@/components/products/ProductFormModal.vue'
import {
  formatProductPrice,
  formatProductTaxRate,
  getProductBarcode,
} from '@/composables/useProductFormatters'
import { useProductsAdmin } from '@/composables/useProductsAdmin'
import '@/assets/products-admin.css'

const { t } = useLanguage()

const {
  activeModal,
  searchQuery,
  searchLoading,
  searchError,
  foundProduct,
  form,
  actionState,
  showDatabase,
  dbLoading,
  dbError,
  dbSearchQuery,
  dbCategoryFilter,
  actionCards,
  categories,
  categoryLabelMap,
  dbCategories,
  filteredProducts,
  modalTitle,
  priceLabel,
  pricePlaceholder,
  handleCardClick,
  closeModal,
  searchByBarcode,
  addProduct,
  editProduct,
  removeProduct,
} = useProductsAdmin()
</script>

<template>
  <AdminLayout :breadcrumb="t('adminProducts')" :max-width="1000">
    <div class="admin-page-header">
      <h1 class="admin-page-title">{{ t('adminProductsManage') }}</h1>
      <p class="admin-page-subtitle">{{ t('adminProductsManageSub') }}</p>
    </div>

    <ProductActionGrid :cards="actionCards" @select="handleCardClick" />

    <ProductDatabaseTable
      :visible="showDatabase"
      :products="filteredProducts"
      :loading="dbLoading"
      :error="dbError"
      :search-query="dbSearchQuery"
      :category-filter="dbCategoryFilter"
      :categories="dbCategories"
      :category-labels="categoryLabelMap"
      :format-price="formatProductPrice"
      :format-tax-rate="formatProductTaxRate"
      @close="showDatabase = false"
      @update:search-query="dbSearchQuery = $event"
      @update:category-filter="dbCategoryFilter = $event"
    />

    <ProductFormModal
      :active-modal="activeModal"
      :modal-title="modalTitle"
      :form="form"
      :categories="categories"
      :price-label="priceLabel"
      :price-placeholder="pricePlaceholder"
      :action-state="actionState"
      :search-query="searchQuery"
      :search-loading="searchLoading"
      :search-error="searchError"
      :found-product="foundProduct"
      :category-labels="categoryLabelMap"
      :format-price="formatProductPrice"
      :get-barcode="getProductBarcode"
      @close="closeModal"
      @add="addProduct"
      @edit="editProduct"
      @remove="removeProduct"
      @search="searchByBarcode"
      @update:search-query="searchQuery = $event"
      @update-form-field="form[$event.field] = $event.value"
    />
  </AdminLayout>
</template>
