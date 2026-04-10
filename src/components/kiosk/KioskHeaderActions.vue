<template>
  <div class="top-actions">
    <button type="button" class="action-pill" @click="$emit('language')">{{ t('language') }}</button>
    <button type="button" class="action-pill" @click="$emit('help')">{{ t('help') }}</button>
    <button
      type="button"
      class="action-pill"
      :class="{ 'action-pill--active': vatEnabled }"
      @click="$emit('toggle-vat')"
    >
      MwSt
    </button>
  </div>
</template>

<script setup>
defineProps({
  vatEnabled: { type: Boolean, default: false },
  t: { type: Function, required: true },
})

defineEmits(['language', 'help', 'toggle-vat'])
</script>
