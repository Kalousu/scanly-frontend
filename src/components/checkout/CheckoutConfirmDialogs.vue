<template>
  <ConfirmDialog
    :visible="showCancelConfirm"
    :title="t('cancelOrderTitle')"
    :message="t('cancelOrderMessage')"
    :cancel-label="t('back')"
    :confirm-label="t('cancelOrderConfirm')"
    @cancel="$emit('cancel-order-dismiss')"
    @confirm="$emit('cancel-order-confirm')"
  />

  <ConfirmDialog
    :visible="!!deleteItem"
    :title="t('deleteProductTitle')"
    :message="tFn('deleteProductMessage', deleteItem?.productName ?? '')"
    :cancel-label="t('cancel')"
    :confirm-label="t('deleteProductConfirm')"
    @cancel="$emit('delete-item-dismiss')"
    @confirm="$emit('delete-item-confirm')"
  />
</template>

<script setup>
import ConfirmDialog from '@/components/ConfirmDialog.vue'

defineProps({
  showCancelConfirm: { type: Boolean, default: false },
  deleteItem: { type: Object, default: null },
  t: { type: Function, required: true },
  tFn: { type: Function, required: true },
})

defineEmits([
  'cancel-order-dismiss',
  'cancel-order-confirm',
  'delete-item-dismiss',
  'delete-item-confirm',
])
</script>
