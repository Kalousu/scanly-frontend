<template>
  <div
    v-if="visible"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    :aria-label="t('helpTitle')"
    tabindex="-1"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div class="modal-card modal-card--sm">
      <h3 class="modal-title">{{ t('helpTitle') }}</h3>
      <ul class="help-list">
        <li v-for="(item, i) in safeItems" :key="i">
          <template v-for="(segment, index) in item" :key="index">
            <strong v-if="segment.strong">{{ segment.text }}</strong>
            <span v-else>{{ segment.text }}</span>
          </template>
        </li>
      </ul>
      <div class="modal-actions">
        <button type="button" class="modal-btn modal-btn--done" @click="$emit('close')">
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { toSafeRichTextSegments } from '@/utils/safeRichText'

const props = defineProps({
  visible: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  t: { type: Function, required: true },
})

defineEmits(['close'])

const safeItems = computed(() => props.items.map((item) => toSafeRichTextSegments(item)))
</script>

<style scoped>
.help-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 2;
  font-size: 14px;
}

.help-list :deep(b) {
  color: rgba(255, 255, 255, 0.96);
  font-weight: 700;
}
</style>
