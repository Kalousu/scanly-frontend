<template>
  <KioskHelpModal :visible="visible" :items="items" :t="t" @close="$emit('close')" />
</template>

<script setup>
import KioskHelpModal from '@/components/kiosk/KioskHelpModal.vue'

defineProps({
  visible: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  t: { type: Function, required: true },
})

defineEmits(['close'])
</script>
