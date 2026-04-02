<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-head">
        <div class="modal-icon">🥦</div>
        <div>
          <h3 class="modal-title">{{ t('produce') }}</h3>
          <p class="modal-subtitle">{{ t('produceSubtitle') }}</p>
        </div>
      </div>

      <div v-if="loading" class="product-grid product-grid--loading">
        <div class="spinner-ring"></div>
      </div>
      <div v-else class="product-grid">
        <button
          v-for="p in catalog"
          :key="p.sku"
          class="product-card"
          :class="{ 'product-card--selected': selected?.sku === p.sku }"
          @click="$emit('select', p)"
        >
          <div class="product-name">{{ getItemName(p) }}</div>
          <div class="product-price">
            {{ formatPrice(p.pricePerKg) }}<span class="price-unit">/kg</span>
          </div>
        </button>
      </div>

      <div v-if="selected" class="weight-row">
        <label class="weight-label">{{ t('weightLabel') }}</label>
        <input
          :value="weightKg"
          @input="$emit('update:weightKg', Number($event.target.value))"
          type="number"
          min="0.01"
          step="0.01"
          class="weight-input"
        />
        <span class="weight-preview">= {{ formatPrice(selected.pricePerKg * weightKg) }}</span>
      </div>

      <div class="modal-actions">
        <button class="modal-btn modal-btn--back" @click="selected ? $emit('deselect') : $emit('close')">
          {{ t('back') }}
        </button>
        <button class="modal-btn modal-btn--done" :disabled="!selected" @click="$emit('confirm')">
          {{ t('add') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFormatters } from '../composables/useFormatters'

const { formatPrice } = useFormatters()

const props = defineProps({
  visible: { type: Boolean, default: false },
  catalog: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selected: { type: Object, default: null },
  weightKg: { type: Number, default: 0.25 },
  t: { type: Function, required: true },
  getItemName: { type: Function, required: true },
})

defineEmits(['close', 'select', 'deselect', 'confirm', 'update:weightKg'])
</script>