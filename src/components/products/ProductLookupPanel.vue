<template>
  <div>
    <div class="admin-form-group">
      <label class="admin-label">Produkt per EAN suchen</label>
      <div class="prod-search-row">
        <input
          :value="searchQuery"
          type="text"
          class="admin-input"
          placeholder="EAN / Barcode eingeben..."
          @input="$emit('update:searchQuery', $event.target.value)"
          @keyup.enter="$emit('search')"
        />
        <button class="prod-btn-search" :disabled="loading" @click="$emit('search')">
          <span v-if="loading" class="admin-spinner admin-spinner--sm"></span>
          {{ loading ? 'Suche...' : 'Suchen' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="admin-alert admin-alert--error">
      <p>{{ error }}</p>
    </div>

    <div v-if="product" class="prod-found-card" :class="{ 'prod-found-card--remove': mode === 'remove' }">
      <div class="prod-found-header">
        <span>Produkt gefunden</span>
      </div>
      <div class="prod-found-details">
        <div class="prod-found-row">
          <span class="prod-found-label">Name</span>
          <span class="prod-found-value">{{ product.name }}</span>
        </div>
        <div class="prod-found-row">
          <span class="prod-found-label">EAN</span>
          <span class="prod-found-value prod-found-ean">{{ getBarcode(product, searchQuery) }}</span>
        </div>
        <div class="prod-found-row">
          <span class="prod-found-label">Kategorie</span>
          <span class="prod-found-value">{{ categoryLabels[product.category] || product.category }}</span>
        </div>
        <div class="prod-found-row">
          <span class="prod-found-label">Nettopreis</span>
          <span class="prod-found-value">{{ formatPrice(product) }}</span>
        </div>
        <div v-if="mode !== 'remove'" class="prod-found-row">
          <span class="prod-found-label">MwSt-Satz</span>
          <span class="prod-found-value">{{ product.taxRate !== undefined ? product.taxRate : '-' }}</span>
        </div>
      </div>
    </div>

    <div class="admin-divider"></div>
  </div>
</template>

<script setup>
defineProps({
  mode: { type: String, default: 'edit' },
  searchQuery: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  product: { type: Object, default: null },
  categoryLabels: { type: Object, default: () => ({}) },
  formatPrice: { type: Function, required: true },
  getBarcode: { type: Function, required: true },
})

defineEmits(['update:searchQuery', 'search'])
</script>
