<template>
  <div
    v-if="visible"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    :aria-label="t(modeConfig.titleKey)"
    @click.self="$emit('close')"
  >
    <div class="modal-card">
      <div class="modal-head">
        <div class="modal-icon">{{ modeConfig.icon }}</div>
        <div>
          <h3 class="modal-title">{{ t(modeConfig.titleKey) }}</h3>
          <p class="modal-subtitle">{{ t(modeConfig.subtitleKey) }}</p>
        </div>
      </div>

      <div v-if="loading" class="product-grid product-grid--loading">
        <div class="spinner-ring"></div>
      </div>
      <div v-else class="product-grid">
        <button
          type="button"
          v-for="item in catalog"
          :key="item.sku"
          class="product-card"
          :class="{ 'product-card--selected': selected?.sku === item.sku }"
          @click="$emit('select', item)"
        >
          <div class="product-name">{{ getItemName(item) }}</div>
          <div class="product-price">
            <template v-if="mode === 'vegetables'">
              {{ formatPrice(item.pricePerKg) }}<span class="price-unit">/kg</span>
            </template>
            <template v-else>
              {{ formatPrice(item.price) }}
            </template>
          </div>
        </button>
      </div>

      <!-- Bakery: quantity picker -->
      <div v-if="selected && mode === 'bakery'" class="weight-row">
        <label class="weight-label">{{ t('amount') }}</label>
        <div class="qty-picker">
          <button type="button" class="qty-btn" @click="amount > 1 && $emit('update:amount', amount - 1)">−</button>
          <span class="qty-val">{{ amount }}</span>
          <button type="button" class="qty-btn" @click="$emit('update:amount', amount + 1)">+</button>
        </div>
        <span class="weight-preview">= {{ formatPrice(selected.price * amount) }}</span>
      </div>

      <!-- Vegetables: weight input -->
      <div v-if="selected && mode === 'vegetables'" class="weight-row">
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
        <button type="button" class="modal-btn modal-btn--back" @click="selected ? $emit('deselect') : $emit('close')">
          {{ t('back') }}
        </button>
        <button type="button" class="modal-btn modal-btn--done" :disabled="!selected" @click="$emit('confirm')">
          {{ t('add') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

const { formatPrice } = useFormatters()

const MODE_CONFIG = {
  bakery: { icon: '🥐', titleKey: 'bakery', subtitleKey: 'bakerySubtitle' },
  vegetables: { icon: '🥦', titleKey: 'produce', subtitleKey: 'produceSubtitle' },
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'bakery', validator: (v) => ['bakery', 'vegetables'].includes(v) },
  catalog: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selected: { type: Object, default: null },
  amount: { type: Number, default: 1 },
  weightKg: { type: Number, default: 0.25 },
  t: { type: Function, required: true },
  getItemName: { type: Function, required: true },
})

defineEmits(['close', 'select', 'deselect', 'confirm', 'update:amount', 'update:weightKg'])

const modeConfig = computed(() => MODE_CONFIG[props.mode] || MODE_CONFIG.bakery)
</script>

<style scoped>
.modal-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.modal-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.17);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-subtitle {
  margin: 3px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  overflow-y: auto;
  max-height: 45vh;
  padding: 4px 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
}

.product-grid--loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.spinner-ring {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: #18e7f2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.product-card {
  aspect-ratio: 1;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  transition:
    border-color 0.15s,
    transform 0.13s,
    background 0.15s,
    box-shadow 0.15s;
  font-family: inherit;
}

.product-card:hover {
  border-color: rgba(24, 231, 242, 0.35);
  transform: translateY(-2px);
  background: rgba(24, 231, 242, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.32);
}

.product-card--selected {
  border-color: #18e7f2;
  background: rgba(24, 231, 242, 0.09);
  box-shadow:
    0 0 0 1px rgba(24, 231, 242, 0.35),
    0 0 16px rgba(24, 231, 242, 0.2);
}

.product-card:active {
  transform: scale(0.96);
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.96);
  text-align: center;
  line-height: 1.2;
}

.product-price {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 650;
}

.price-unit {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.42);
}

.weight-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  background: rgba(24, 231, 242, 0.05);
  border: 1px solid rgba(24, 231, 242, 0.18);
  border-radius: 14px;
  margin-top: 14px;
}

.weight-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
}

.weight-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  outline: none;
  font-family: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.weight-input:focus {
  border-color: rgba(24, 231, 242, 0.5);
  box-shadow: 0 0 0 3px rgba(24, 231, 242, 0.1);
}

.weight-preview {
  font-size: 14px;
  font-weight: 750;
  color: #18e7f2;
  white-space: nowrap;
  min-width: 70px;
  text-align: right;
}

.qty-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 6px 10px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  font-size: 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition:
    color 0.13s,
    background 0.13s,
    border-color 0.13s;
}

.qty-btn:hover {
  color: #18e7f2;
  background: rgba(24, 231, 242, 0.12);
  border-color: rgba(24, 231, 242, 0.3);
}

.qty-val {
  min-width: 32px;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.96);
}

.modal-btn--done {
  background: linear-gradient(90deg, #18e7f2 0%, #1bc7ff 100%);
  color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 18px 45px rgba(24, 231, 242, 0.26);
}

.modal-btn--done:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 50px rgba(24, 231, 242, 0.3);
}

.modal-btn--done:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

</style>
