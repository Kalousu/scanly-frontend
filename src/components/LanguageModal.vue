<template>
  <div
    v-if="visible"
    ref="overlayRef"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    tabindex="-1"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div class="modal-card modal-card--sm">
      <h3 :id="titleId" class="modal-title">{{ t('langTitle') }}</h3>
      <div class="lang-grid">
        <button
          type="button"
          v-for="lang in languages"
          :key="lang.code"
          class="lang-btn"
          :class="{ 'lang-btn--active': currentLang === lang.code }"
          @click="$emit('select', lang.code)"
        >
          <img class="lang-flag" :src="lang.flag" :alt="lang.label" aria-hidden="true" />
          <span class="lang-label">{{ lang.label }}</span>
          <span class="lang-code">{{ lang.code.toUpperCase() }}</span>
        </button>
      </div>
      <div class="modal-actions">
        <button ref="initialFocusRef" type="button" class="modal-btn modal-btn--back" @click="$emit('close')">
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'
import { useModalA11y } from '@/composables/useModalA11y'
import '@/assets/kiosk-modal.css'

const props = defineProps({
  visible: { type: Boolean, required: true },
  currentLang: { type: String, required: true },
  languages: { type: Array, required: true },
  t: { type: Function, required: true },
})

defineEmits(['close', 'select'])

const { overlayRef, initialFocusRef, titleId } = useModalA11y(toRef(props, 'visible'))
</script>

<style scoped>
.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.lang-btn {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.96);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.15s, transform 0.13s, background 0.15s, box-shadow 0.15s;
  letter-spacing: 0.01em;
}

.lang-btn:hover {
  border-color: rgba(24, 231, 242, 0.35);
  background: rgba(24, 231, 242, 0.07);
  transform: translateY(-1px);
}

.lang-btn--active {
  border-color: rgba(24, 231, 242, 0.52);
  background: rgba(24, 231, 242, 0.09);
  color: #18e7f2;
  box-shadow: 0 0 16px rgba(24, 231, 242, 0.2);
}

.lang-flag {
  width: 32px;
  height: 22px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
  display: block;
}

.lang-label {
  flex: 1;
  text-align: left;
}

.lang-code {
  font-size: 11px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.42);
  letter-spacing: 0.08em;
}

.lang-btn--active .lang-code {
  color: #18e7f2;
}
</style>
