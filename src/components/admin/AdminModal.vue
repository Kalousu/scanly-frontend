<template>
  <Transition :name="transitionName">
    <div
      v-if="visible"
      ref="overlayRef"
      class="admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      @click.self="$emit('close')"
      @keydown.esc="$emit('close')"
    >
      <div class="admin-modal" :class="modalClass">
        <div class="admin-modal-header">
          <slot name="header">
            <h2 :id="titleId" class="admin-modal-title">{{ title }}</h2>
            <button
              ref="initialFocusRef"
              type="button"
              class="admin-modal-close"
              :aria-label="closeLabel"
              @click="$emit('close')"
            >
              X
            </button>
          </slot>
        </div>
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { toRef } from 'vue'
import { useModalA11y } from '@/composables/useModalA11y'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closeLabel: { type: String, default: 'Schließen' },
  modalClass: { type: String, default: '' },
  transitionName: { type: String, default: 'modal-fade' },
})

defineEmits(['close'])

const { overlayRef, initialFocusRef, titleId } = useModalA11y(toRef(props, 'visible'))
</script>
