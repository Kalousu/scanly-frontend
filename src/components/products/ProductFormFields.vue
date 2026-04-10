<template>
  <div>
    <div class="admin-form-group">
      <label class="admin-label">Produktname</label>
      <input
        :value="form.name"
        type="text"
        class="admin-input"
        :placeholder="namePlaceholder"
        :disabled="disabled"
        @input="updateField('name', $event.target.value)"
      />
    </div>
    <div class="admin-form-group">
      <label class="admin-label">Kategorie</label>
      <select
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
        <label class="admin-label">{{ priceLabel }}</label>
        <input
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
        <label class="admin-label">MwSt-Satz</label>
        <select
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
      <label class="admin-label">EAN / Barcode</label>
      <input
        :value="form.ean"
        type="text"
        class="admin-input"
        placeholder="z.B. 4006381333634"
        :disabled="disabled"
        @input="updateField('ean', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  priceLabel: { type: String, required: true },
  pricePlaceholder: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  namePlaceholder: { type: String, default: 'z.B. Monster White' },
})

const emit = defineEmits(['update-field'])

function updateField(field, value) {
  emit('update-field', { field, value })
}
</script>
