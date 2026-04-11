<template>
  <div class="camera-wrap">
    <div
      class="camera-window"
      :class="{
        'camera-window--error': cameraError && !cameraNoDevice,
        'camera-window--nodevice': cameraNoDevice,
      }"
    >
      <video
        v-show="cameraActive && !cameraError"
        ref="videoRef"
        autoplay
        playsinline
        muted
      ></video>

      <div v-if="cameraLoading" class="cam-overlay cam-overlay--loading">
        <div class="spinner-ring"></div>
        <span>{{ t('cameraLoading') }}</span>
      </div>

      <div v-else-if="cameraNoDevice" class="cam-overlay cam-overlay--neutral">
        <div class="cam-nodevice-icon">⚠️</div>
        <span class="cam-nodevice-title">{{ t('cameraNotAvailable') }}</span>
        <span class="cam-subhint">{{ t('barcodeNotSupported') }}</span>
      </div>

      <div v-else-if="cameraError" class="cam-overlay cam-overlay--error">
        <span class="cam-error-icon">⚠️</span>
        <span>{{ cameraError }}</span>
        <button type="button" class="retry-btn" @click="startCamera">{{ t('retry') }}</button>
      </div>

      <div v-else-if="!cameraActive" class="cam-overlay cam-overlay--inactive">
        <span>{{ t('cameraOff') }}</span>
      </div>

      <button
        type="button"
        class="cam-toggle"
        :class="{ 'cam-toggle--active': cameraActive }"
        :disabled="cameraNoDevice"
        @click="toggleCamera"
      >
        {{ cameraNoDevice ? t('noCamera') : cameraActive ? t('cameraOn') : t('cameraOff') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCameraBarcodeScanner } from '@/composables/useCameraBarcodeScanner'

const props = defineProps({
  autoStart: { type: Boolean, default: true },
  cooldown: { type: Number, default: 1500 },
  t: { type: Function, required: true },
})

const emit = defineEmits(['scan'])

const {
  cameraActive,
  cameraLoading,
  cameraError,
  cameraNoDevice,
  barcodeSupported,
  videoRef,
  startCamera,
  stopCamera,
  toggleCamera,
} = useCameraBarcodeScanner({
  t: props.t,
  cooldown: props.cooldown,
  onScan: (code) => emit('scan', code),
})

const isNativeScanning = computed(() => cameraActive.value && barcodeSupported.value === true)

onMounted(() => {
  if (props.autoStart) {
    startCamera()
  }
})

defineExpose({
  stopCamera,
  isNativeScanning,
})
</script>
