<template>
  <div class="admin-toolbar">
    <div v-if="searchPlaceholder" class="admin-search-wrap">
      <input
        :value="searchQuery"
        type="text"
        class="admin-search-input"
        :aria-label="searchLabel || searchPlaceholder"
        :placeholder="searchPlaceholder"
        @input="$emit('update:searchQuery', $event.target.value)"
      />
    </div>

    <div v-if="filters.length > 0" class="admin-filter-group">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        class="admin-filter-btn"
        :class="{ 'admin-filter-btn--active': activeFilter === filter.value }"
        @click="$emit('update:activeFilter', filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <slot name="actions"></slot>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  searchPlaceholder: { type: String, default: '' },
  searchLabel: { type: String, default: '' },
  filters: { type: Array, default: () => [] },
  activeFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:activeFilter'])
</script>
