<template>
  <div class="admin-empty" :class="className">
    <h2 v-if="title" :class="titleClass">{{ title }}</h2>
    <p :class="descriptionClass">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  message: { type: String, required: true },
  className: { type: String, default: '' },
  titleClass: { type: String, default: '' },
  descriptionClass: { type: String, default: '' },
})
</script>
