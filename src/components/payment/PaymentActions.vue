<template>
  <div class="payment-action-row">
    <button
      type="button"
      class="payment-btn payment-btn--pay payment-btn--pay--primary"
      :disabled="itemCount === 0 || status === 'paying' || status === 'paid'"
      @click="$emit('pay')"
    >
      <span v-if="status === 'paying'" class="spinner"></span>
      <span v-else>{{ t('pay') }}</span>
    </button>

    <button type="button" class="payment-btn payment-btn--coupon-main" @click="$emit('coupon')">
      {{ t('couponRedeem') }}
    </button>

    <button
      type="button"
      class="payment-btn payment-btn--cancel payment-btn--cancel--secondary"
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
