<template>
  <div class="category-row">
    <button type="button" class="category-btn" @click="$emit('produce')">
      <span class="category-label">{{ t('produce') }}</span>
      <span class="category-hint">PLU · {{ t('weightLabel') }}</span>
    </button>
    <button type="button" class="category-btn" @click="$emit('bakery')">
      <span class="category-label">{{ t('bakery') }}</span>
      <span class="category-hint">{{ t('bakerySubtitle') }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  t: { type: Function, required: true },
})

defineEmits(['produce', 'bakery'])
</script>
