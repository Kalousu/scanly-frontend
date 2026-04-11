<template>
  <div class="container">
    <div class="wrapper">
      <div class="payback">
        <div class="brand-badge">
          <img :src="scanlyLogo" alt="Scanly" />
        </div>

        <h1 class="title">
          {{ t('paybackTitle') }}<br />
          <span class="accent">{{ t('paybackAccent') }}</span>
        </h1>
        <p class="subtitle">{{ t('paybackSubtitle') }}</p>

        <img
          class="payback-logo"
          src="https://amts-apotheke.de/wp-content/uploads/2019/01/PAYBACK_2016_1699_POINTEE.png"
          alt="Payback"
        />

        <div class="payback-actions">
          <button type="button" class="payback-btn primary" @click="$emit('scan')">
            {{ t('paybackScan') }}
          </button>
          <button type="button" class="payback-btn ghost" @click="$emit('skip')">
            {{ t('paybackSkip') }}
          </button>
        </div>

        <div class="payback-hint">{{ t('paybackHint') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import scanlyLogo from '@/assets/logo-removebg-preview.png'

defineProps({
  t: { type: Function, required: true },
})

defineEmits(['scan', 'skip'])
</script>
