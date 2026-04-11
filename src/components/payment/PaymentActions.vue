<template>
  <div class="action-row">
    <button
      type="button"
      class="btn btn--pay btn--pay--primary"
      :disabled="itemCount === 0 || status === 'paying' || status === 'paid'"
      @click="$emit('pay')"
    >
      <span v-if="status === 'paying'" class="spinner"></span>
      <span v-else>{{ t('pay') }}</span>
    </button>

    <button type="button" class="btn btn--coupon-main" @click="$emit('coupon')">{{ t('couponRedeem') }}</button>

    <button
      type="button"
      class="btn btn--cancel btn--cancel--secondary"
      :disabled="status === 'paying'"
      @click="$emit('cancel')"
    >
      {{ t('cancel') }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  itemCount: { type: Number, required: true },
  status: { type: String, required: true },
  t: { type: Function, required: true },
})

defineEmits(['pay', 'coupon', 'cancel'])
</script>
