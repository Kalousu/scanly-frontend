<template>
  <Transition name="db-fade">
    <div v-if="visible" class="prod-db-section admin-card">
      <div class="prod-db-header">
        <h2 class="prod-db-title">
          {{ t('adminProductDatabase') }}
          <span class="prod-db-count">{{ tFn('adminProductCount', products.length) }}</span>
        </h2>
        <button type="button" class="admin-btn admin-btn--secondary" @click="$emit('close')">{{ t('adminClose') }}</button>
      </div>

      <AdminToolbar
        class="prod-db-filters"
        :search-query="searchQuery"
        :search-placeholder="t('adminProductSearchPlaceholder')"
        :filters="categories"
        :active-filter="categoryFilter"
        @update:search-query="$emit('update:searchQuery', $event)"
        @update:active-filter="$emit('update:categoryFilter', $event)"
      />

      <div v-if="loading" class="admin-loading">
        <div class="admin-spinner"></div>
        <p>{{ t('adminProductsLoading') }}</p>
      </div>

      <div v-else-if="error" class="admin-alert admin-alert--error">
        <p>{{ error }}</p>
      </div>

      <AdminDataTable v-else :columns="columns" :rows="products" :empty-message="t('adminNoProductsFound')">
        <template #rows="{ rows }">
          <tr v-for="(product, idx) in rows" :key="product.id || product.ean || idx">
            <td class="td-num">{{ idx + 1 }}</td>
            <td class="td-name">{{ product.name }}</td>
            <td class="td-ean">{{ product.code || product.ean || product.barcode }}</td>
            <td>{{ categoryLabels[product.category] || product.category }}</td>
            <td class="td-price">{{ formatPrice(product) }}</td>
            <td class="td-tax">{{ formatTaxRate(product.taxRate) }}</td>
          </tr>
        </template>
      </AdminDataTable>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/components/Uselanguage'
import AdminDataTable from '@/components/admin/AdminDataTable.vue'
import AdminToolbar from '@/components/admin/AdminToolbar.vue'

const { t, tFn } = useLanguage()

defineProps({
  visible: { type: Boolean, default: false },
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
  categoryFilter: { type: String, default: 'ALL' },
  categories: { type: Array, default: () => [] },
  categoryLabels: { type: Object, default: () => ({}) },
  formatPrice: { type: Function, required: true },
  formatTaxRate: { type: Function, required: true },
})

defineEmits(['close', 'update:searchQuery', 'update:categoryFilter'])

const columns = computed(() => [
  { key: 'index', label: t('adminColIndex') },
  { key: 'name', label: t('adminColProductName') },
  { key: 'barcode', label: t('adminColEanBarcode') },
  { key: 'category', label: t('adminColCategory') },
  { key: 'priceNet', label: t('adminColNetPrice') },
  { key: 'taxRate', label: t('adminColTaxRate') },
])
</script>
