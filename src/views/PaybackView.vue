<template>
  <div v-if="!showScanner" class="container">
    <div class="wrapper">
      <div class="payback">
        <h1 class="title">Zahlen Sie mit Payback?</h1>
        <p class="subtitle">Scannen Sie jetzt Ihre Payback-Karte oder fahren Sie ohne fort.</p>

        <img
          src="https://www.payback.de/resource/blob/327670/bb5914260838b67b1e398db1622a0d92/image-center-data.png"
          class="payback-logo"
        />

        <div class="payback-actions">
          <button class="payback-btn primary" @click="openScanner">Payback scannen</button>
          <button class="payback-btn ghost" @click="skipPayback">Ohne Payback</button>
        </div>

        <div class="payback-hint">Tipp: Alternativ Kartennummer eingeben.</div>
      </div>
    </div>
  </div>

  <div v-else class="modal-overlay" @click.self="close">
    <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="close-btn" @click="close" aria-label="Schließen">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <transition name="fade" mode="out-in">
        <div v-if="mode === 'scanner'" key="scanner" class="scanner-view">
          <h2 id="modal-title" class="modal-title">Payback-Karte scannen</h2>

          <div class="camera-container">
            <div v-if="!cameraActive" class="camera-placeholder">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a855f7"
                stroke-width="1.5"
              >
                <path
                  d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p>Kamera wird aktiviert...</p>
            </div>
            <video ref="videoRef" class="camera-video" autoplay playsinline></video>

            <div class="scan-overlay">
              <div class="scan-frame" :class="{ success: scanSuccess, error: scanError }">
                <div class="corner tl"></div>
                <div class="corner tr"></div>
                <div class="corner bl"></div>
                <div class="corner br"></div>
                <div v-if="scanSuccess" class="success-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    stroke-width="3"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <p class="hint-text">Bitte scannen Sie den QR-Code Ihrer Payback-Karte.</p>

          <div class="manual-entry">
            <button class="link-btn" @click="switchToManual" type="button">
              Kartennummer manuell eingeben
            </button>
          </div>
        </div>

        <div v-else key="manual" class="manual-view">
          <h2 id="modal-title" class="modal-title">Kartennummer eingeben</h2>

          <div class="input-container">
            <input
              ref="inputRef"
              v-model="cardNumber"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="Kartennummer eingeben"
              class="card-input"
              :class="{ error: inputError }"
              @input="validateInput"
              @keydown.enter="confirm"
              aria-label="Payback-Kartennummer"
              :aria-invalid="inputError"
              :aria-describedby="inputError ? 'error-message' : undefined"
              maxlength="16"
            />
            <p v-if="inputError" id="error-message" class="error-message" role="alert">
              {{ errorMessage }}
            </p>
          </div>

          <div v-if="showKeyboard" class="numeric-keyboard">
            <button
              v-for="key in numericKeys"
              :key="key"
              class="key-btn"
              @click="appendDigit(key)"
              type="button"
              :aria-label="'Ziffer ' + key"
            >
              {{ key }}
            </button>
            <button
              class="key-btn key-backspace"
              @click="backspace"
              type="button"
              aria-label="Löschen"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M17 6l-6 6 6 6M7 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div class="actions">
            <button class="btn primary" @click="confirm" type="button" :disabled="!isValid">
              Bestätigen
            </button>
            <button class="btn secondary" @click="switchToScanner" type="button">
              Zurück zum Scanner
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showScanner = ref(false)
const mode = ref('scanner')
const cameraActive = ref(false)
const scanSuccess = ref(false)
const scanError = ref(false)
const cardNumber = ref('')
const inputError = ref(false)
const errorMessage = ref('')
const isValid = ref(false)

const videoRef = ref(null)
const inputRef = ref(null)
const showKeyboard = ref(false)
const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

let stream = null

function openScanner() {
  showScanner.value = true
  nextTick(() => {
    startCamera()
  })
}

function close() {
  stopCamera()
  showScanner.value = false
}

function skipPayback() {
  router.push('/payment')
}

function switchToManual() {
  stopCamera()
  mode.value = 'manual'
  inputError.value = false
  showKeyboard.value = window.innerWidth <= 768
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function switchToScanner() {
  cardNumber.value = ''
  inputError.value = false
  errorMessage.value = ''
  mode.value = 'scanner'
  showKeyboard.value = false
  nextTick(() => {
    startCamera()
  })
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
    errorMessage.value = 'Kartennummer muss zwischen 10 und 16 Ziffern liegen.'
    isValid.value = false
  } else {
    inputError.value = false
    isValid.value = true
  }
}

function appendDigit(digit) {
  if (cardNumber.value.length < 16) {
    cardNumber.value += digit
    validateInput()
  }
}

function backspace() {
  cardNumber.value = cardNumber.value.slice(0, -1)
  validateInput()
}

function confirm() {
  if (!isValid.value) {
    inputError.value = true
    errorMessage.value = 'Bitte geben Sie eine gültige Kartennummer ein.'
    return
  }

  console.log('Payback-Karte bestätigt:', cardNumber.value)
  router.push('/payment')
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      cameraActive.value = true
    }

    setTimeout(() => {
      simulateScan()
    }, 2000)
  } catch (err) {
    console.error('Kamerafehler:', err)
    cameraActive.value = false
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
  cameraActive.value = false
}

function simulateScan() {
  scanSuccess.value = true
  setTimeout(() => {
    router.push('/payment')
  }, 1500)
}

onUnmounted(() => {
  stopCamera()
})
</script>

<style>
html,
body {
  margin: 0;
  overflow: hidden;
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
}

body {
  background: linear-gradient(to bottom, #7a5cc2, #6e4fb3);
}
</style>

<style scoped>
.container {
  height: 100vh;
  width: 100vw;
  display: grid;
  place-items: center;
  padding: 48px;
  box-sizing: border-box;
}

.wrapper {
  width: 40vw;
  height: 60vh;
  background: #f4f4f6;
  border-radius: 28px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.25);
  display: grid;
  place-items: center;
  padding: 56px;
  box-sizing: border-box;
}

.payback {
  width: min(760px, 100%);
  text-align: center;
}

.title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  color: #3f3f46;
  letter-spacing: 0.2px;
}

.subtitle {
  margin: 14px auto 0;
  max-width: 620px;
  font-size: 16px;
  color: #71717a;
  line-height: 1.5;
}

.payback-logo {
  width: 20vw;
}

.payback-actions {
  margin-top: 26px;
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: nowrap;
}

.payback-btn {
  flex: 1;
  max-width: 280px;
  padding: 18px 22px;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.payback-btn:active {
  transform: scale(0.98);
}

.payback-btn.primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.35);
}

.payback-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 42px rgba(124, 58, 237, 0.5);
}

.payback-btn.ghost {
  background: transparent;
  border: 2px solid #7c3aed;
  color: #7c3aed;
}

.payback-btn.ghost:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
}

.payback-hint {
  margin-top: 16px;
  font-size: 13px;
  color: #7a7a85;
  text-align: center;
}

.btn {
  min-width: 260px;
  padding: 18px 28px;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn.primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.35);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 42px rgba(124, 58, 237, 0.5);
}

.btn.ghost {
  background: transparent;
  border: 2px solid #7c3aed;
  color: #7c3aed;
}

.btn.ghost:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  width: 90vw;
  max-width: 420px;
  background: #f4f4f6;
  border-radius: 28px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35);
  padding: 32px 24px;
  animation: slideUp 0.35s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition:
    background 0.2s,
    transform 0.2s;
  color: #3f3f46;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.close-btn:focus {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}

.modal-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 800;
  color: #3f3f46;
  text-align: center;
}

.scanner-view,
.manual-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camera-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 280px;
  border-radius: 20px;
  overflow: hidden;
  background: #1a1a2e;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #a855f7;
}

.camera-placeholder p {
  color: #fff;
  font-size: 14px;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.scan-frame {
  width: 70%;
  aspect-ratio: 1;
  position: relative;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.scan-frame.success {
  border-color: #22c55e;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
}

.scan-frame.error {
  border-color: #ef4444;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #a855f7;
  border-style: solid;
}

.corner.tl {
  top: -3px;
  left: -3px;
  border-width: 4px 0 0 4px;
  border-radius: 8px 0 0 0;
}

.corner.tr {
  top: -3px;
  right: -3px;
  border-width: 4px 4px 0 0;
  border-radius: 0 8px 0 0;
}

.corner.bl {
  bottom: -3px;
  left: -3px;
  border-width: 0 0 4px 4px;
  border-radius: 0 0 0 8px;
}

.corner.br {
  bottom: -3px;
  right: -3px;
  border-width: 0 4px 4px 0;
  border-radius: 0 0 8px 0;
}

.success-icon {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.hint-text {
  margin: 20px 0 0;
  font-size: 15px;
  color: #71717a;
  text-align: center;
}

.manual-entry {
  margin-top: 20px;
}

.link-btn {
  background: none;
  border: none;
  color: #a855f7;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.link-btn:hover {
  background: rgba(168, 85, 247, 0.1);
}

.link-btn:focus {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}

.input-container {
  width: 100%;
  max-width: 320px;
  margin-bottom: 24px;
}

.card-input {
  width: 100%;
  padding: 18px 20px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  text-align: center;
  border: 2px solid #e4e4e7;
  border-radius: 16px;
  background: #fff;
  color: #3f3f46;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

.card-input::placeholder {
  color: #a1a1aa;
  letter-spacing: 0;
  font-weight: 400;
}

.card-input:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);
}

.card-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
}

.error-message {
  margin: 8px 0 0;
  font-size: 13px;
  color: #ef4444;
  text-align: center;
}

.numeric-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 320px;
}

.key-btn {
  padding: 18px;
  font-size: 22px;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  background: #fff;
  color: #3f3f46;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-btn:active {
  transform: scale(0.95);
  background: #f4f4f5;
}

.key-backspace {
  background: #f4f4f5;
  color: #52525b;
}

.actions {
  margin-top: 34px;
  display: flex;
  justify-content: center;
  gap: 22px;
  flex-wrap: wrap;
}

.hint {
  margin-top: 18px;
  font-size: 13px;
  color: #7a7a85;
  text-align: center;
}

.btn {
  width: 100%;
  padding: 18px 28px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition:
    transform 0.18s,
    box-shadow 0.18s,
    background 0.18s,
    opacity 0.18s;
}

.btn:active {
  transform: scale(0.98);
}

.btn:focus {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}

.btn.primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.35);
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 42px rgba(124, 58, 237, 0.5);
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.secondary {
  background: transparent;
  border: 2px solid #a855f7;
  color: #a855f7;
}

.btn.secondary:hover {
  background: rgba(168, 85, 247, 0.1);
  transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
