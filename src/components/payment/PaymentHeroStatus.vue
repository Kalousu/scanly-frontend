<template>
  <div class="hero-block">
    <div class="hero-eyebrow">
      <img src="@/assets/logo-removebg-preview.png" alt="Scanly" />
    </div>

    <div class="status-text">
      <template v-if="status === 'idle'">
        {{ t('payText') }}
      </template>
      <template v-else-if="status === 'scanning'">
        <span class="status--scanning">{{ t('scanning') }}</span>
      </template>
      <template v-else-if="status === 'paying'">
        <span class="status--paying">{{ t('paying') }}</span>
      </template>
      <template v-else-if="status === 'paid'">
        <span class="status--paid">{{ t('paid') }}</span>
      </template>
      <template v-else-if="status === 'cancelled'">
        <span class="status--cancelled">{{ t('cancelled') }}</span>
      </template>
    </div>

    <div class="hero-sub">
      <span v-if="status === 'idle'">{{ t('paySub') }}</span>
      <span v-else>{{ t('heroSubSmall') }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  status: { type: String, required: true },
  t: { type: Function, required: true },
})
</script>
