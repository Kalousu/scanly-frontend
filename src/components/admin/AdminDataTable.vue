<template>
  <div class="admin-table-wrap">
    <table v-if="rows.length > 0" class="admin-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
        </tr>
      </thead>
      <tbody>
        <slot name="rows" :rows="rows"></slot>
      </tbody>
    </table>
    <slot v-else name="empty">
      <AdminEmptyState :message="emptyMessage" />
    </slot>
  </div>
</template>

<script setup>
import AdminEmptyState from '@/components/admin/AdminEmptyState.vue'

defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: 'Keine Einträge gefunden.' },
})
</script>
