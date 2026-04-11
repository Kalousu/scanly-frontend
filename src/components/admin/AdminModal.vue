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
            <button ref="closeButtonRef" type="button" class="admin-modal-close" @click="$emit('close')">X</button>
          </slot>
        </div>
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, ref, toRef, watch } from 'vue'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  modalClass: { type: String, default: '' },
  transitionName: { type: String, default: 'modal-fade' },
})

defineEmits(['close'])

const overlayRef = ref(null)
const closeButtonRef = ref(null)
const titleId = `admin-modal-title-${Math.random().toString(36).slice(2)}`

useBodyScrollLock(toRef(props, 'visible'))

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      await nextTick()
      closeButtonRef.value?.focus()
      if (!closeButtonRef.value) overlayRef.value?.focus()
    }
  },
)
</script>
