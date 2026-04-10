<template>
  <AdminModal :visible="visible" title="Coupon anlegen" modal-class="admin-modal--lg" @close="$emit('close')">
        <div class="admin-modal-body">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Coupon-Code</label>
              <input
                :value="form.code"
                type="text"
                class="admin-input"
                maxlength="32"
                placeholder="z.B. SPRING20"
                @input="updateField('code', $event.target.value)"
              />
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Bezeichnung</label>
              <input
                :value="form.label"
                type="text"
                class="admin-input"
                placeholder="z.B. 20% Frühlingsrabatt"
                @input="updateField('label', $event.target.value)"
              />
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Rabatt-Typ</label>
              <select
                :value="form.type"
                class="admin-input"
                @change="updateField('type', $event.target.value)"
              >
                <option value="percentage">Prozent</option>
                <option value="fixed">Fixbetrag</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label class="admin-label">
                {{ form.type === 'percentage' ? 'Rabatt in %' : 'Rabatt in EUR' }}
              </label>
              <input
                :value="form.value"
                type="number"
                min="0"
                step="0.01"
                class="admin-input"
                @input="updateField('value', Number($event.target.value))"
              />
            </div>
          </div>

          <div class="admin-form-row">
            <div class="admin-form-group">
              <label class="admin-label">Mindestbestellwert in EUR</label>
              <input
                :value="form.minOrderValue"
                type="number"
                min="0"
                step="0.01"
                class="admin-input"
                @input="updateField('minOrderValue', Number($event.target.value))"
              />
            </div>
          </div>

          <div class="coupon-preview">
            <div class="coupon-preview-label">Vorschau</div>
            <div class="coupon-preview-code">{{ (form.code || 'CODE').toUpperCase() }}</div>
            <div class="coupon-preview-text">{{ form.label || 'Bezeichnung des Coupons' }}</div>
            <div class="coupon-preview-meta">
              {{ discountPreview }} · Mindestwert {{ Number(form.minOrderValue || 0).toFixed(2) }} EUR
            </div>
          </div>

          <div v-if="formError" class="admin-alert admin-alert--error">
            <p>{{ formError }}</p>
          </div>

          <div class="admin-modal-footer">
            <button class="admin-btn admin-btn--secondary" @click="$emit('close')">Abbrechen</button>
            <button class="admin-btn admin-btn--primary" @click="$emit('save')">Coupon anlegen</button>
          </div>
        </div>
  </AdminModal>
</template>

<script setup>
import { computed } from 'vue'
import AdminModal from '@/components/admin/AdminModal.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  form: { type: Object, required: true },
  formError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save', 'update-field'])

function updateField(field, value) {
  emit('update-field', { field, value })
}

const discountPreview = computed(() =>
  props.form.type === 'percentage'
    ? `${Number(props.form.value || 0)}% Rabatt`
    : `${Number(props.form.value || 0).toFixed(2)} EUR Rabatt`,
)
</script>
