import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// settings get saved to localstorage whenever something changes
const STORAGE_KEY = 'scanly-settings'
const ADMIN_AUTH_KEY = 'scanly-admin-authenticated'

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

function loadAdminAuthState() {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
  } catch {
    return false
  }
}

function saveAdminAuthState(value) {
  try {
    if (value) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true')
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY)
    }
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

  // Demo admin credentials are stored locally until backend auth is connected.
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
  const adminAuthenticated = ref(loadAdminAuthState())

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

  function loginAdmin(username, password) {
    const authenticated = checkCredentials(username, password)
    adminAuthenticated.value = authenticated
    saveAdminAuthState(authenticated)
    return authenticated
  }

  function logoutAdmin() {
    adminAuthenticated.value = false
    saveAdminAuthState(false)
  }

  // watch everything and save on change
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
    adminAuthenticated,
    saveAll,
    checkCredentials,
    loginAdmin,
    logoutAdmin,
  }
})
