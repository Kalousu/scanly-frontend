<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-head">
        <div class="modal-icon">🥐</div>
        <div>
          <h3 class="modal-title">{{ t('bakery') }}</h3>
          <p class="modal-subtitle">{{ t('bakerySubtitle') }}</p>
        </div>
      </div>

      <div v-if="loading" class="product-grid product-grid--loading">
        <div class="spinner-ring"></div>
      </div>
      <div v-else class="product-grid">
        <button
          v-for="b in catalog"
          :key="b.sku"
          class="product-card"
          :class="{ 'product-card--selected': selected?.sku === b.sku }"
          @click="$emit('select', b)"
        >
          <div class="product-name">{{ getItemName(b) }}</div>
          <div class="product-price">{{ formatPrice(b.price) }}</div>
        </button>
      </div>

      <div v-if="selected" class="weight-row">
        <label class="weight-label">{{ t('amount') }}</label>
        <div class="bakery-qty-picker">
          <button class="qty-btn" @click="amount > 1 && $emit('update:amount', amount - 1)">−</button>
          <span class="qty-val bakery-qty-val">{{ amount }}</span>
          <button class="qty-btn" @click="$emit('update:amount', amount + 1)">+</button>
        </div>
        <span class="weight-preview">= {{ formatPrice(selected.price * amount) }}</span>
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

defineProps({
  visible: { type: Boolean, default: false },
  catalog: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selected: { type: Object, default: null },
  amount: { type: Number, default: 1 },
  t: { type: Function, required: true },
  getItemName: { type: Function, required: true },
})

defineEmits(['close', 'select', 'deselect', 'confirm', 'update:amount'])
</script>