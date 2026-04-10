<template>
  <Transition name="db-fade">
    <div v-if="visible" class="prod-db-section admin-card">
      <div class="prod-db-header">
        <h2 class="prod-db-title">
          Produktdatenbank
          <span class="prod-db-count">{{ products.length }} Produkte</span>
        </h2>
        <button class="admin-btn admin-btn--secondary" @click="$emit('close')">Schließen</button>
      </div>

      <AdminToolbar
        class="prod-db-filters"
        :search-query="searchQuery"
        search-placeholder="Nach Produktname oder EAN suchen..."
        :filters="categories"
        :active-filter="categoryFilter"
        @update:search-query="$emit('update:searchQuery', $event)"
        @update:active-filter="$emit('update:categoryFilter', $event)"
      />

      <div v-if="loading" class="admin-loading">
        <div class="admin-spinner"></div>
        <p>Produkte werden geladen...</p>
      </div>

      <div v-else-if="error" class="admin-alert admin-alert--error">
        <p>{{ error }}</p>
      </div>

      <AdminDataTable v-else :columns="columns" :rows="products" empty-message="Keine Produkte gefunden.">
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
import AdminDataTable from '@/components/admin/AdminDataTable.vue'
import AdminToolbar from '@/components/admin/AdminToolbar.vue'

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

const columns = [
  { key: 'index', label: '#' },
  { key: 'name', label: 'Produktname' },
  { key: 'barcode', label: 'EAN / Barcode' },
  { key: 'category', label: 'Kategorie' },
  { key: 'priceNet', label: 'Nettopreis' },
  { key: 'taxRate', label: 'Steuersatz' },
]
</script>
