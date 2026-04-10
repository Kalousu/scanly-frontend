<template>
  <Transition :name="transitionName">
    <div v-if="visible" class="admin-modal-overlay" @click.self="$emit('close')">
      <div class="admin-modal" :class="modalClass">
        <div class="admin-modal-header">
          <slot name="header">
            <h2 class="admin-modal-title">{{ title }}</h2>
            <button class="admin-modal-close" @click="$emit('close')">X</button>
          </slot>
        </div>
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  modalClass: { type: String, default: '' },
  transitionName: { type: String, default: 'modal-fade' },
})

defineEmits(['close'])
</script>
