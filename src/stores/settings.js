import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'scanly-settings'
const ADMIN_AUTH_KEY = 'scanly-admin-authenticated'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

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

  // Demo admin credentials — password is stored as SHA-256 hash.
  // Default: admin / admin (hash of 'admin')
  adminUsername: 'admin',
  adminPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
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
  const adminPasswordHash = ref(stored?.adminPasswordHash ?? defaults.adminPasswordHash)
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
      adminPasswordHash: adminPasswordHash.value,
    }
  }

  const saveAll = debounce(() => saveToStorage(getState()), 300)

  async function checkCredentials(username, password) {
    const passwordHash = await hashPassword(password)
    return username === adminUsername.value && passwordHash === adminPasswordHash.value
  }

  async function loginAdmin(username, password) {
    const authenticated = await checkCredentials(username, password)
    adminAuthenticated.value = authenticated
    saveAdminAuthState(authenticated)
    return authenticated
  }

  function logoutAdmin() {
    adminAuthenticated.value = false
    saveAdminAuthState(false)
  }

  async function updateAdminPassword(newPassword) {
    adminPasswordHash.value = await hashPassword(newPassword)
  }

  // watch everything and save on change
  const allRefs = [
    paybackEnabled, paybackQrEnabled, paybackManualEnabled,
    cameraCooldown, scannerBuffer, cameraAutoStart,
    adminUsername, adminPasswordHash,
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
    adminPasswordHash,
    adminAuthenticated,
    saveAll,
    checkCredentials,
    loginAdmin,
    logoutAdmin,
    updateAdminPassword,
  }
})
