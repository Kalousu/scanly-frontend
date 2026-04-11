<template>
  <div class="prod-actions">
    <div
      v-for="card in cards"
      :key="card.id"
      :class="['admin-card admin-card--interactive prod-action-card', `prod-action-card--${card.id}`]"
      @click="$emit('select', card.id)"
    >
      <h3 class="prod-action-title">{{ card.title }}</h3>
      <p class="prod-action-desc">{{ card.description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cards: { type: Array, default: () => [] },
})

defineEmits(['select'])
</script>
