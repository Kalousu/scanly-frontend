import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'scanly-settings'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

const defaults = {
  // Payback
  paybackEnabled: true,
  paybackQrEnabled: true,
  paybackManualEnabled: true,

  // Scanner
  cameraCooldown: 1500,
  scannerBuffer: 350,
  cameraAutoStart: true,

  // Admin credentials (frontend-only, no real auth)
  adminUsername: 'admin',
  adminPassword: 'admin',
}

export const useSettingsStore = defineStore('settings', () => {
  const stored = loadFromStorage()

  // Payback
  const paybackEnabled = ref(stored?.paybackEnabled ?? defaults.paybackEnabled)
  const paybackQrEnabled = ref(stored?.paybackQrEnabled ?? defaults.paybackQrEnabled)
  const paybackManualEnabled = ref(stored?.paybackManualEnabled ?? defaults.paybackManualEnabled)

  // Scanner
  const cameraCooldown = ref(stored?.cameraCooldown ?? defaults.cameraCooldown)
  const scannerBuffer = ref(stored?.scannerBuffer ?? defaults.scannerBuffer)
  const cameraAutoStart = ref(stored?.cameraAutoStart ?? defaults.cameraAutoStart)

  // Admin credentials
  const adminUsername = ref(stored?.adminUsername ?? defaults.adminUsername)
  const adminPassword = ref(stored?.adminPassword ?? defaults.adminPassword)

  function getState() {
    return {
      paybackEnabled: paybackEnabled.value,
      paybackQrEnabled: paybackQrEnabled.value,
      paybackManualEnabled: paybackManualEnabled.value,
      cameraCooldown: cameraCooldown.value,
      scannerBuffer: scannerBuffer.value,
      cameraAutoStart: cameraAutoStart.value,
      adminUsername: adminUsername.value,
      adminPassword: adminPassword.value,
    }
  }

  function saveAll() {
    saveToStorage(getState())
  }

  function checkCredentials(username, password) {
    return username === adminUsername.value && password === adminPassword.value
  }

  // Auto-persist on any change
  const allRefs = [
    paybackEnabled, paybackQrEnabled, paybackManualEnabled,
    cameraCooldown, scannerBuffer, cameraAutoStart,
    adminUsername, adminPassword,
  ]
  allRefs.forEach((r) => {
    watch(r, () => saveAll())
  })

  return {
    paybackEnabled,
    paybackQrEnabled,
    paybackManualEnabled,
    cameraCooldown,
    scannerBuffer,
    cameraAutoStart,
    adminUsername,
    adminPassword,
    saveAll,
    checkCredentials,
  }
})