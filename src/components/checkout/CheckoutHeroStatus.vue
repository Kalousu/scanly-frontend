<template>
  <div class="hero-block">
    <div class="hero-eyebrow"><img src="@/assets/logo-removebg-preview.png" alt="Scanly" /></div>
    <div class="status-text">
      <span v-if="status === 'idle'">{{ t('scanPrompt') }}</span>
      <span v-else-if="status === 'scanning'" class="status--scanning">
        {{ t('scanning') }}
      </span>
      <span v-else-if="status === 'cancelled'" class="status--cancelled">
        {{ t('cancelled') }}
      </span>
    </div>
    <div class="hero-sub" v-if="status === 'idle'">{{ t('heroSub') }}</div>
  </div>
</template>

<script setup>
defineProps({
  status: { type: String, required: true },
  t: { type: Function, required: true },
})
</script>
