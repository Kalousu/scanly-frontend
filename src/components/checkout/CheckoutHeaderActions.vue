<template>
  <KioskHeaderActions
    :vat-enabled="vatEnabled"
    :t="t"
    @language="$emit('language')"
    @help="$emit('help')"
    @toggle-vat="$emit('toggle-vat')"
  />
</template>

<script setup>
import KioskHeaderActions from '@/components/kiosk/KioskHeaderActions.vue'

defineProps({
  vatEnabled: { type: Boolean, default: false },
  t: { type: Function, required: true },
})

defineEmits(['language', 'help', 'toggle-vat'])
</script>
