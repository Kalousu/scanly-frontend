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
      <h3 :id="titleId" class="modal-title">{{ t('helpTitle') }}</h3>
      <ul class="help-list">
        <li v-for="(item, i) in safeItems" :key="i">
          <template v-for="(segment, index) in item" :key="index">
            <strong v-if="segment.strong">{{ segment.text }}</strong>
            <span v-else>{{ segment.text }}</span>
          </template>
        </li>
      </ul>
      <div class="modal-actions">
        <button ref="initialFocusRef" type="button" class="modal-btn modal-btn--done" @click="$emit('close')">
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useModalA11y } from '@/composables/useModalA11y'
import { toSafeRichTextSegments } from '@/utils/safeRichText'
import '@/assets/kiosk-modal.css'

const props = defineProps({
  visible: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  t: { type: Function, required: true },
})

defineEmits(['close'])

const { overlayRef, initialFocusRef, titleId } = useModalA11y(toRef(props, 'visible'))
const safeItems = computed(() => props.items.map((item) => toSafeRichTextSegments(item)))
</script>

<style scoped>
.help-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 2;
  font-size: 14px;
}

.help-list :deep(b) {
  color: rgba(255, 255, 255, 0.96);
  font-weight: 700;
}
</style>
