<template>
  <div class="page">
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="main-glow" aria-hidden="true"></div>

    <div v-if="!showScanner" class="container">
      <div class="wrapper">
        <div class="payback">

          <div class="brand-badge">
            <img src="../assets/logo-removebg-preview.png" />
          </div>

          <h1 class="title">
            {{ t('paybackTitle') }}<br>
            <span class="accent">{{ t('paybackAccent') }}</span>
          </h1>
          <p class="subtitle">{{ t('paybackSubtitle') }}</p>

          <img
            src="https://www.payback.de/resource/blob/327670/bb5914260838b67b1e398db1622a0d92/image-center-data.png"
            class="payback-logo"
          />

          <div class="payback-actions">
            <button class="payback-btn primary" @click="openScanner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {{ t('paybackScan') }}
            </button>
            <button class="payback-btn ghost" @click="skipPayback">
              {{ t('paybackSkip') }}
            </button>
          </div>

          <div class="payback-hint">{{ t('paybackHint') }}</div>

        </div>
      </div>
    </div>

    <div v-else class="modal-overlay" @click.self="close">
      <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        <div class="modal-header">
          <div class="modal-logo">
            <img src="../assets/logo-removebg-preview.png">
          </div>
          <button class="close-btn" @click="close" :aria-label="t('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <transition name="fade" mode="out-in">

          <div v-if="mode === 'scanner'" key="scanner" class="scanner-view">
            <h2 id="modal-title" class="modal-title">{{ t('paybackScanTitle') }}</h2>
            <p class="modal-subtitle">{{ t('paybackScanSubtitle') }}</p>

            <div class="camera-container">
              <div v-if="!cameraActive" class="camera-placeholder">
                <div class="camera-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <p>{{ t('paybackCameraActivating') }}</p>
              </div>
              <video ref="videoRef" class="camera-video" autoplay playsinline></video>

              <div class="scan-overlay">
                <div class="scan-frame" :class="{ success: scanSuccess, error: scanError }">
                  <div class="corner tl"></div>
                  <div class="corner tr"></div>
                  <div class="corner bl"></div>
                  <div class="corner br"></div>
                  <div class="scan-line" v-if="cameraActive && !scanSuccess"></div>
                  <div v-if="scanSuccess" class="success-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1fd6d6" stroke-width="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="manual-entry">
              <button class="link-btn" @click="switchToManual" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
                </svg>
                {{ t('paybackManualSwitch') }}
              </button>
            </div>
          </div>

          <div v-else key="manual" class="manual-view">
            <h2 id="modal-title" class="modal-title">{{ t('paybackManualTitle') }}</h2>
            <p class="modal-subtitle">{{ t('paybackManualSubtitle') }}</p>

            <div class="input-container">
              <div class="input-wrap" :class="{ focused: inputFocused, error: inputError }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                </svg>
                <input
                  ref="inputRef"
                  v-model="cardNumber"
                  type="tel"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  :placeholder="t('paybackInputPlaceholder')"
                  class="card-input"
                  @input="validateInput"
                  @keydown.enter="confirm"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                  :aria-label="t('paybackManualTitle')"
                  :aria-invalid="inputError"
                  maxlength="16"
                />
              </div>
              <p v-if="inputError" class="error-message" role="alert">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
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
              >{{ key }}</button>
              <button class="key-btn key-backspace" @click="backspace" type="button" :aria-label="t('back')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M18 9l-6 6M12 9l6 6"/>
                </svg>
              </button>
            </div>

            <div class="actions">
              <button class="btn primary" @click="confirm" type="button" :disabled="!isValid">
                {{ t('paybackConfirm') }}
              </button>
              <button class="btn secondary" @click="switchToScanner" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                {{ t('paybackBackToScanner') }}
              </button>
            </div>
          </div>

        </transition>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../components/Uselanguage'

const router = useRouter()

const { currentLang, languages, t, setLanguage } = useLanguage()

const showScanner = ref(false)
const mode = ref('scanner')
const cameraActive = ref(false)
const scanSuccess = ref(false)
const scanError = ref(false)
const cardNumber = ref('')
const inputError = ref(false)
const inputFocused = ref(false)
const errorMessage = ref('')
const isValid = ref(false)

const videoRef = ref(null)
const inputRef = ref(null)
const showKeyboard = ref(false)
const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

let stream = null


function openScanner() {
  showScanner.value = true
  nextTick(() => { startCamera() })
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
  nextTick(() => { inputRef.value?.focus() })
}

function switchToScanner() {
  cardNumber.value = ''
  inputError.value = false
  errorMessage.value = ''
  mode.value = 'scanner'
  showKeyboard.value = false
  nextTick(() => { startCamera() })
}

function validateInput() {
  cardNumber.value = cardNumber.value.replace(/\D/g, '')
  if (cardNumber.value.length === 0) { inputError.value = false; isValid.value = false; return }
  if (cardNumber.value.length < 10 || cardNumber.value.length > 16) {
    inputError.value = true
    errorMessage.value = t('paybackInputError')
    isValid.value = false
  } else {
    inputError.value = false
    isValid.value = true
  }
}

function appendDigit(digit) {
  if (cardNumber.value.length < 16) { cardNumber.value += digit; validateInput() }
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
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if (videoRef.value) { videoRef.value.srcObject = stream; cameraActive.value = true }
    setTimeout(() => { simulateScan() }, 2000)
  } catch {
    cameraActive.value = false
  }
}

function stopCamera() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
  cameraActive.value = false
}

function simulateScan() {
  scanSuccess.value = true
  setTimeout(() => { router.push('/payment') }, 1500)
}

onUnmounted(() => { stopCamera() })
</script>

<style>
:root {
  --bg-0: #071A2A;
  --bg-1: #0B2C44;
  --bg-2: #092538;
  --stroke: rgba(255,255,255,0.10);
  --stroke-soft: rgba(255,255,255,0.07);
  --text: rgba(255,255,255,0.92);
  --muted: rgba(255,255,255,0.42);
  --accent: #00D4E8;
  --accent-2: #1fd6d6;
  --btn-grad: linear-gradient(90deg, #1fd6d6 0%, #1ec3ff 100%);
  --shadow-accent: 0 8px 36px rgba(30,195,255,0.32), 0 2px 8px rgba(31,214,214,0.18);
  --r-xl: 28px;
  --r-lg: 22px;
  --r-pill: 999px;
}

html, body, #app {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}
</style>

<style scoped>
.page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--text);
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

.main-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  width: 860px;
  height: 480px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 210, 235, 0.10) 0%,
    rgba(0, 185, 215, 0.055) 35%,
    transparent 65%
  );
  pointer-events: none;
  z-index: 1;
}

.container {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 48px;
  box-sizing: border-box;
  z-index: 2;
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70vh;
  width: min(860px, 92vw);
  padding: 56px 80px 44px;
  background: linear-gradient(180deg, rgba(10,35,55,0.93) 0%, rgba(7,26,42,0.93) 100%);
  border-radius: 32px;
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow:
    0 30px 80px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(255,255,255,0.05),
    inset 0 0 140px rgba(0, 212, 232, 0.055);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.wrapper::after {
  content: "";
  position: absolute;
  inset: -30%;
  background: radial-gradient(ellipse at 50% 40%, rgba(0,212,232,0.10) 0%, transparent 60%);
  pointer-events: none;
}

.payback {
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 16px;
  border-radius: var(--r-pill);
  border: 1px solid rgba(0,212,232,0.22);
  background: rgba(0,212,232,0.06);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 22px;
}

.brand-badge img {
  margin-right: 5%;
  width: 80px;
}

.title {
  margin: 0;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--text);
}

.accent {
  background: linear-gradient(90deg, #00D4E8 0%, #6EF0F9 100%);
  text-shadow: 0 0 18px rgba(0, 212, 232, 0.25);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 14px auto 0;
  max-width: 520px;
  color: var(--muted);
  font-size: 0.88rem;
  letter-spacing: 0.03em;
  line-height: 1.6;
}

.payback-logo {
  width: 200px;
  margin: 20px auto 4px;
  display: block;
  opacity: 0.92;
  filter: saturate(0.95) brightness(1.05);
}

.payback-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: nowrap;
}

.payback-btn {
  flex: 1;
  max-width: 280px;
  min-height: 60px;
  padding: 0 28px;
  border-radius: var(--r-pill);
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  transition: transform 0.18s ease, box-shadow 0.22s ease, background 0.2s;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.payback-btn:active { transform: scale(0.98); }
.payback-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.payback-btn.primary {
  color: #071A2A;
  background: var(--btn-grad);
  box-shadow: 0 14px 40px rgba(30,195,255,0.35), 0 0 30px rgba(0,212,232,0.15);
}

.payback-btn.primary:hover {
  background: linear-gradient(90deg, #3de0e0 0%, #3dd1ff 100%);
  transform: translateY(-2px) scale(1.01);
}

.payback-btn.ghost {
  background: rgba(255,255,255,0.035);
  border: 1px solid var(--stroke);
  color: rgba(255,255,255,0.82);
}

.payback-btn.ghost:hover {
  background: rgba(0,212,232,0.07);
  border-color: rgba(0,212,232,0.30);
  box-shadow: 0 0 14px rgba(0,212,232,0.12);
  transform: translateY(-2px);
}

.payback-hint {
  margin-top: 16px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.48);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.03em;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.60);
  display: grid;
  place-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-container {
  position: relative;
  width: min(480px, 92vw);
  background: linear-gradient(180deg, rgba(10,35,55,0.96) 0%, rgba(7,26,42,0.96) 100%);
  border: 1px solid var(--stroke);
  border-radius: var(--r-xl);
  box-shadow: 0 28px 70px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.06);
  padding: 28px 24px 32px;
  backdrop-filter: blur(12px);
  animation: slideUp 0.32s cubic-bezier(0.22,1,0.36,1);
  overflow: hidden;
}

.modal-container::after {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(ellipse at center, rgba(0,212,232,0.08) 0%, transparent 60%);
  pointer-events: none;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
}

.modal-logo {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.modal-logo img { width: 80px; margin-left: 10%; }

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--r-pill);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s, transform 0.2s, border-color 0.2s;
  color: rgba(255,255,255,0.70);
}

.close-btn:hover {
  background: rgba(0,212,232,0.08);
  border-color: rgba(0,212,232,0.30);
  transform: scale(1.07) rotate(90deg);
}

.close-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.modal-title {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text);
  text-align: center;
  position: relative;
  z-index: 1;
}

.modal-subtitle {
  margin: 0 0 20px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.38);
  text-align: center;
  letter-spacing: 0.03em;
  position: relative;
  z-index: 1;
}

.scanner-view,
.manual-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.camera-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 300px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  box-shadow: inset 0 0 60px rgba(0,212,232,0.05);
  border: 1px solid var(--stroke);
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.camera-placeholder svg { filter: drop-shadow(0 0 12px rgba(0,212,232,0.35)); }

.camera-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(0,212,232,0.08);
  border: 1px solid rgba(0,212,232,0.18);
  display: grid;
  place-items: center;
  color: var(--accent);
}

.camera-placeholder p { color: var(--muted); font-size: 13px; margin: 0; letter-spacing: 0.03em; }

.camera-video { width: 100%; height: 100%; object-fit: cover; }

.scan-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.scan-frame {
  width: 68%;
  aspect-ratio: 1;
  position: relative;
  border: 1.5px solid rgba(255,255,255,0.20);
  border-radius: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.corner { position: absolute; width: 18px; height: 18px; border-color: var(--accent); border-style: solid; opacity: 0.95; }
.corner.tl { top: -2px; left: -2px; border-width: 2.5px 0 0 2.5px; border-radius: 8px 0 0 0; }
.corner.tr { top: -2px; right: -2px; border-width: 2.5px 2.5px 0 0; border-radius: 0 8px 0 0; }
.corner.bl { bottom: -2px; left: -2px; border-width: 0 0 2.5px 2.5px; border-radius: 0 0 0 8px; }
.corner.br { bottom: -2px; right: -2px; border-width: 0 2.5px 2.5px 0; border-radius: 0 0 8px 0; }

.scan-line {
  position: absolute;
  left: 8%; right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  border-radius: 2px;
  animation: scanMove 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(0,212,232,0.5);
}

@keyframes scanMove {
  0%   { top: 10%; opacity: 1; }
  50%  { top: 85%; opacity: 0.85; }
  100% { top: 10%; opacity: 1; }
}

.scan-frame.success { border-color: rgba(31,214,214,0.7); box-shadow: 0 0 30px rgba(31,214,214,0.22); }
.scan-frame.error   { border-color: rgba(255,77,77,0.7); box-shadow: 0 0 24px rgba(255,77,77,0.16); }

.success-icon {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(7,26,42,0.45);
  animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes scaleIn {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.manual-entry { margin-top: 20px; }

.link-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--stroke);
  color: rgba(255,255,255,0.82);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: var(--r-pill);
  transition: background 0.18s, transform 0.13s, border-color 0.18s;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.link-btn:hover {
  background: rgba(0,212,232,0.07);
  border-color: rgba(0,212,232,0.28);
  box-shadow: 0 0 12px rgba(0,212,232,0.10);
  transform: translateY(-1px);
}

.link-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.input-container { width: 100%; max-width: 360px; margin-bottom: 16px; }

.input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border: 1px solid var(--stroke);
  border-radius: 16px;
  background: rgba(255,255,255,0.03);
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  color: var(--muted);
}

.input-wrap.focused { border-color: rgba(0,212,232,0.35); box-shadow: 0 0 0 4px rgba(0,212,232,0.08); background: rgba(255,255,255,0.04); color: var(--accent); }
.input-wrap.error { border-color: rgba(255,77,77,0.50); box-shadow: 0 0 0 4px rgba(255,77,77,0.10); }

.card-input {
  flex: 1;
  padding: 18px 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 3px;
  text-align: center;
  background: transparent;
  border: none;
  color: var(--text);
  transition: color 0.2s;
}

.card-input::placeholder { color: rgba(255,255,255,0.25); letter-spacing: 2px; font-weight: 400; }
.card-input:focus { outline: none; }

.error-message {
  margin: 9px 0 0;
  font-size: 12.5px;
  color: rgba(255,140,140,0.90);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  letter-spacing: 0.02em;
}

.numeric-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 18px;
  width: 100%;
  max-width: 360px;
}

.key-btn {
  padding: 16px;
  font-size: 20px;
  font-weight: 700;
  border: 1px solid var(--stroke);
  border-radius: 14px;
  background: rgba(255,255,255,0.03);
  color: var(--text);
  cursor: pointer;
  transition: transform 0.12s, background 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-btn:hover { border-color: rgba(0,212,232,0.22); background: rgba(0,212,232,0.04); }
.key-btn:active { transform: scale(0.95); }
.key-backspace { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.65); }

.actions { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; width: 100%; }

.btn {
  width: 100%;
  min-height: 58px;
  padding: 0 22px;
  border-radius: var(--r-pill);
  font-size: 0.97rem;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  transition: transform 0.18s ease, box-shadow 0.22s ease, background 0.2s, opacity 0.18s;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:active { transform: scale(0.98); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.btn.primary { color: #071A2A; background: var(--btn-grad); box-shadow: 0 18px 45px rgba(30,195,255,0.35), 0 0 40px rgba(0,212,232,0.15); }
.btn.primary:hover:not(:disabled) { background: linear-gradient(90deg, #3de0e0 0%, #3dd1ff 100%); transform: translateY(-2px); }
.btn.primary:disabled { opacity: 0.45; box-shadow: none; }

.btn.secondary { background: rgba(255,255,255,0.03); border: 1px solid var(--stroke); color: rgba(255,255,255,0.82); }
.btn.secondary:hover { background: rgba(0,212,232,0.07); border-color: rgba(0,212,232,0.28); box-shadow: 0 0 12px rgba(0,212,232,0.10); transform: translateY(-2px); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.fade-enter-from { opacity: 0; transform: translateX(12px); }
.fade-leave-to   { opacity: 0; transform: translateX(-12px); }

@media (max-width: 900px) {
  .wrapper { padding: 40px 24px 32px; }
  .title { font-size: 38px; }
}
</style>