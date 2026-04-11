<template>
  <div class="payback-page">
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="main-glow" aria-hidden="true"></div>

    <PaybackLanding v-if="!showScanner" :t="t" @scan="openScanner" @skip="skipPayback" />

    <PaybackScannerModal
      v-else
      :t="t"
      :mode="mode"
      :title-id="titleId"
      :camera-active="cameraActive"
      :scan-success="scanSuccess"
      :scan-error="scanError"
      :card-number="cardNumber"
      :input-focused="inputFocused"
      :input-error="inputError"
      :error-message="errorMessage"
      :is-valid="isValid"
      :show-keyboard="showKeyboard"
      :numeric-keys="numericKeys"
      @close="close"
      @manual="switchToManual"
      @scanner="switchToScanner"
      @overlay-ready="setOverlayElement"
      @initial-focus-ready="setInitialFocusElement"
      @video-ready="setVideoElement"
      @input-ready="setInputElement"
      @update:card-number="updateCardNumber"
      @focus-change="inputFocused = $event"
      @append-digit="appendDigit"
      @backspace="backspace"
      @confirm="confirm"
    />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/components/Uselanguage'
import PaybackLanding from '@/components/payback/PaybackLanding.vue'
import PaybackScannerModal from '@/components/payback/PaybackScannerModal.vue'
import { useCameraStream } from '@/composables/useCameraStream'
import { useModalA11y } from '@/composables/useModalA11y'
import { PAYBACK_DEMO_SCAN_DELAY_MS, PAYBACK_SUCCESS_REDIRECT_DELAY_MS } from '@/constants/timing'
import { useSettingsStore } from '@/stores/settings'
import '@/assets/payback.css'

const router = useRouter()
const settingsStore = useSettingsStore()
const { t } = useLanguage()

const showScanner = ref(false)
const { overlayRef, initialFocusRef, titleId } = useModalA11y(showScanner)
const mode = ref('scanner')
const scanSuccess = ref(false)
const scanError = ref(false)
const cardNumber = ref('')
const inputError = ref(false)
const inputFocused = ref(false)
const errorMessage = ref('')
const isValid = ref(false)

const { cameraActive, cameraError, videoRef, startStream, stopStream } = useCameraStream({ t })
const inputRef = ref(null)
const showKeyboard = ref(false)
const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

let demoScanTimer = null

onMounted(() => {
  if (!settingsStore.paybackEnabled) {
    router.replace('/payment')
  }

  updateKeyboardVisibility()
  window.addEventListener('resize', updateKeyboardVisibility)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateKeyboardVisibility)
  stopCamera()
})

function setOverlayElement(element) {
  overlayRef.value = element
}

function setInitialFocusElement(element) {
  initialFocusRef.value = element
}

function setVideoElement(element) {
  videoRef.value = element
}

function setInputElement(element) {
  inputRef.value = element
}

function openScanner() {
  showScanner.value = true
  nextTick(() => {
    startCamera()
  })
}

function close() {
  stopCamera()
  scanSuccess.value = false
  showScanner.value = false
}

function skipPayback() {
  router.push('/payment')
}

function switchToManual() {
  stopCamera()
  mode.value = 'manual'
  inputError.value = false
  updateKeyboardVisibility()
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function switchToScanner() {
  cardNumber.value = ''
  inputError.value = false
  errorMessage.value = ''
  scanSuccess.value = false
  scanError.value = false
  mode.value = 'scanner'
  showKeyboard.value = false
  nextTick(() => {
    startCamera()
  })
}

function updateKeyboardVisibility() {
  showKeyboard.value = window.innerWidth <= 768
}

function updateCardNumber(value) {
  cardNumber.value = value
  validateInput()
}

function validateInput() {
  cardNumber.value = cardNumber.value.replace(/\D/g, '')

  if (cardNumber.value.length === 0) {
    inputError.value = false
    isValid.value = false
    return
  }

  if (cardNumber.value.length < 10 || cardNumber.value.length > 16) {
    inputError.value = true
    errorMessage.value = t('paybackInputError')
    isValid.value = false
    return
  }

  inputError.value = false
  isValid.value = true
}

function appendDigit(digit) {
  if (cardNumber.value.length >= 16) {
    return
  }

  cardNumber.value += digit
  validateInput()
}

function backspace() {
  cardNumber.value = cardNumber.value.slice(0, -1)
  validateInput()
}

function confirm() {
  if (!isValid.value) {
    inputError.value = true
    errorMessage.value = t('paybackInputInvalid')
    return
  }

  router.push('/payment')
}

async function startCamera() {
  stopCamera()
  errorMessage.value = ''
  scanError.value = false

  try {
    await startStream({ video: { facingMode: 'environment' }, audio: false })
    demoScanTimer = window.setTimeout(completeDemoScan, PAYBACK_DEMO_SCAN_DELAY_MS)
  } catch {
    scanError.value = true
    errorMessage.value = cameraError.value || t('cameraNotAvailable')
  }
}

function stopCamera() {
  if (demoScanTimer) {
    window.clearTimeout(demoScanTimer)
    demoScanTimer = null
  }

  stopStream()
}

function completeDemoScan() {
  demoScanTimer = null
  scanSuccess.value = true
  demoScanTimer = window.setTimeout(() => {
    router.push('/payment')
  }, PAYBACK_SUCCESS_REDIRECT_DELAY_MS)
}
</script>
