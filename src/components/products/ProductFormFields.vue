<template>
  <div>
    <div class="admin-form-group">
      <label class="admin-label" :for="fieldId('name')">{{ t('adminProductName') }}</label>
      <input
        :id="fieldId('name')"
        :value="form.name"
        type="text"
        class="admin-input"
        :placeholder="namePlaceholder || t('adminProductNamePlaceholder')"
        :disabled="disabled"
        @input="updateField('name', $event.target.value)"
      />
    </div>
    <div class="admin-form-group">
      <label class="admin-label" :for="fieldId('category')">{{ t('adminCategory') }}</label>
      <select
        :id="fieldId('category')"
        :value="form.category"
        class="admin-input"
        :disabled="disabled"
        @change="updateField('category', $event.target.value)"
      >
        <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
      </select>
    </div>
    <div class="admin-form-row">
      <div class="admin-form-group">
        <label class="admin-label" :for="fieldId('price')">{{ priceLabel }}</label>
        <input
          :id="fieldId('price')"
          :value="form.priceNet"
          type="number"
          step="0.01"
          class="admin-input"
          :placeholder="pricePlaceholder"
          :disabled="disabled"
          @input="updateField('priceNet', $event.target.value)"
        />
      </div>
      <div class="admin-form-group">
        <label class="admin-label" :for="fieldId('tax-rate')">{{ t('adminTaxRate') }}</label>
        <select
          :id="fieldId('tax-rate')"
          :value="form.taxRate"
          class="admin-input"
          :disabled="disabled"
          @change="updateField('taxRate', $event.target.value)"
        >
          <option value="0.19">19%</option>
          <option value="0.07">7%</option>
          <option value="0.00">0%</option>
        </select>
      </div>
    </div>
    <div class="admin-form-group">
      <label class="admin-label" :for="fieldId('ean')">{{ t('adminEanBarcode') }}</label>
      <input
        :id="fieldId('ean')"
        :value="form.ean"
        type="text"
        class="admin-input"
        :placeholder="t('adminEanPlaceholder')"
        :disabled="disabled"
        @input="updateField('ean', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
import { useLanguage } from '@/components/Uselanguage'

const { t } = useLanguage()

defineProps({
  form: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  priceLabel: { type: String, required: true },
  pricePlaceholder: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  namePlaceholder: { type: String, default: '' },
})

const emit = defineEmits(['update-field'])

function updateField(field, value) {
  emit('update-field', { field, value })
}

function fieldId(name) {
  return `product-form-${name}`
}
</script>
