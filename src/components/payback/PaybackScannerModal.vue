<template>
  <div
    :ref="setOverlayRef"
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    tabindex="-1"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-logo">
          <img :src="scanlyLogo" alt="Scanly" />
        </div>
        <button
          :ref="setInitialFocusRef"
          type="button"
          class="close-btn"
          :aria-label="t('close')"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <PaybackScannerView
          v-if="mode === 'scanner'"
          key="scanner"
          :t="t"
          :title-id="titleId"
          :camera-active="cameraActive"
          :scan-success="scanSuccess"
          :scan-error="scanError"
          :error-message="errorMessage"
          @manual="$emit('manual')"
          @video-ready="$emit('video-ready', $event)"
        />

        <PaybackManualEntry
          v-else
          key="manual"
          :t="t"
          :title-id="titleId"
          :card-number="cardNumber"
          :input-focused="inputFocused"
          :input-error="inputError"
          :error-message="errorMessage"
          :is-valid="isValid"
          :show-keyboard="showKeyboard"
          :numeric-keys="numericKeys"
          @update:card-number="$emit('update:cardNumber', $event)"
          @focus-change="$emit('focus-change', $event)"
          @append-digit="$emit('append-digit', $event)"
          @backspace="$emit('backspace')"
          @confirm="$emit('confirm')"
          @scanner="$emit('scanner')"
          @input-ready="$emit('input-ready', $event)"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import scanlyLogo from '@/assets/logo-removebg-preview.png'
import PaybackManualEntry from '@/components/payback/PaybackManualEntry.vue'
import PaybackScannerView from '@/components/payback/PaybackScannerView.vue'

defineProps({
  t: { type: Function, required: true },
  mode: { type: String, required: true },
  titleId: { type: String, required: true },
  cameraActive: { type: Boolean, default: false },
  scanSuccess: { type: Boolean, default: false },
  scanError: { type: Boolean, default: false },
  cardNumber: { type: String, default: '' },
  inputFocused: { type: Boolean, default: false },
  inputError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  isValid: { type: Boolean, default: false },
  showKeyboard: { type: Boolean, default: false },
  numericKeys: { type: Array, required: true },
})

const emit = defineEmits([
  'close',
  'manual',
  'scanner',
  'overlay-ready',
  'initial-focus-ready',
  'video-ready',
  'input-ready',
  'update:cardNumber',
  'focus-change',
  'append-digit',
  'backspace',
  'confirm',
])

function setOverlayRef(element) {
  emit('overlay-ready', element)
}

function setInitialFocusRef(element) {
  emit('initial-focus-ready', element)
}
</script>
