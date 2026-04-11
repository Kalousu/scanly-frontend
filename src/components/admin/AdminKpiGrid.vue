<template>
  <div class="kpi-grid">
    <div v-for="kpi in items" :key="kpi.label" class="admin-kpi">
      <div class="kpi-content">
        <span class="admin-kpi-label">{{ kpi.label }}</span>
        <span class="kpi-value">{{ kpi.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})
</script>
