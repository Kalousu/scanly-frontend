<template>
  <div class="scanner-view">
    <h2 :id="titleId" class="modal-title">{{ t('paybackScanTitle') }}</h2>
    <p class="modal-subtitle">{{ t('paybackScanSubtitle') }}</p>
    <p class="demo-note">{{ t('paybackDemoHint') }}</p>

    <div class="camera-container">
      <div v-if="!cameraActive" class="camera-placeholder">
        <div class="camera-icon-wrap"></div>
        <p>{{ t('paybackCameraActivating') }}</p>
      </div>
      <video :ref="setVideoRef" class="camera-video" autoplay playsinline></video>

      <div class="scan-overlay">
        <div class="scan-frame" :class="{ success: scanSuccess, error: scanError }">
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>
          <div v-if="cameraActive && !scanSuccess" class="scan-line"></div>
          <div v-if="scanSuccess" class="success-icon"></div>
        </div>
      </div>
    </div>

    <div class="manual-entry">
      <p v-if="scanError" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
      <button class="link-btn" type="button" @click="$emit('manual')">
        {{ t('paybackManualSwitch') }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  t: { type: Function, required: true },
  titleId: { type: String, required: true },
  cameraActive: { type: Boolean, default: false },
  scanSuccess: { type: Boolean, default: false },
  scanError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['manual', 'video-ready'])

function setVideoRef(element) {
  emit('video-ready', element)
}
</script>
