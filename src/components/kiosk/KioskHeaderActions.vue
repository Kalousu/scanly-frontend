<template>
  <div class="top-actions">
    <button type="button" class="action-pill" @click="$emit('language')">{{ t('language') }}</button>
    <button type="button" class="action-pill" @click="$emit('help')">{{ t('help') }}</button>
  </div>
</template>

<script setup>
defineProps({
  t: { type: Function, required: true },
})

defineEmits(['language', 'help'])
</script>
