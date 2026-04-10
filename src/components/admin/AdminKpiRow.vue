<template>
  <div class="admin-kpi-row">
    <div v-for="kpi in items" :key="kpi.label" class="admin-kpi">
      <div class="admin-kpi-num">{{ kpi.value }}</div>
      <div class="admin-kpi-label">{{ kpi.label }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})
</script>
