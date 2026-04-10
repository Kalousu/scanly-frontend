<template>
  <div class="action-row">
    <button class="btn btn--cancel" @click="$emit('cancel')" :disabled="status === 'paying'">
      {{ t('cancel') }}
    </button>
    <button
      class="btn btn--pay"
      :disabled="itemCount === 0 || status === 'paying'"
      @click="$emit('pay')"
    >
      <span v-if="status === 'paying'" class="spinner"></span>
      <span v-else>{{ t('pay') }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  itemCount: { type: Number, default: 0 },
  status: { type: String, required: true },
  t: { type: Function, required: true },
})

defineEmits(['cancel', 'pay'])
</script>
