<template>
  <div class="settings-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <nav class="set-navbar">
      <div class="set-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="set-logo" alt="Scanly" />
        <span class="set-badge">Admin</span>
        <span class="set-breadcrumb">/ Einstellungen</span>
      </div>
      <button type="button" class="set-back-btn" @click="$router.push('/admin')">
        <svg viewBox="0 0 24 24" class="set-back-icon" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Zurück zum Dashboard
      </button>
    </nav>

    <main class="set-main">
      <div class="set-header">
        <h1 class="set-title">Einstellungen</h1>
        <p class="set-subtitle">Systemkonfiguration und Präferenzen</p>
      </div>

      <div class="set-sections">

        <!-- Payback Integration -->
        <div class="set-card">
          <div class="set-card-header">
            <div class="set-card-icon set-card-icon--payback">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>
            <div>
              <h2 class="set-card-title">Payback-Integration</h2>
              <p class="set-card-desc">Payback-Kartenabfrage beim Checkout aktivieren oder deaktivieren</p>
            </div>
          </div>
          <div class="set-card-body">
            <div class="set-option-row">
              <div class="set-option-info">
                <span class="set-option-label">Payback aktiviert</span>
                <span class="set-option-hint">Kunden werden nach ihrer Payback-Karte gefragt, bevor sie zur Zahlung gelangen.</span>
              </div>
              <button
                class="set-toggle"
                :class="{ 'set-toggle--active': paybackEnabled }"
                @click="paybackEnabled = !paybackEnabled"
                role="switch"
                :aria-checked="paybackEnabled"
              >
                <span class="set-toggle-knob"></span>
              </button>
            </div>
            <div class="set-option-row" v-if="paybackEnabled">
              <div class="set-option-info">
                <span class="set-option-label">QR-Code-Scanner</span>
                <span class="set-option-hint">Erlaubt Kunden, ihre Payback-Karte per Kamera-Scan zu erfassen.</span>
              </div>
              <button
                class="set-toggle"
                :class="{ 'set-toggle--active': paybackQrEnabled }"
                @click="paybackQrEnabled = !paybackQrEnabled"
                role="switch"
                :aria-checked="paybackQrEnabled"
              >
                <span class="set-toggle-knob"></span>
              </button>
            </div>
            <div class="set-option-row" v-if="paybackEnabled">
              <div class="set-option-info">
                <span class="set-option-label">Manuelle Eingabe</span>
                <span class="set-option-hint">Erlaubt Kunden, ihre Kartennummer manuell einzutippen.</span>
              </div>
              <button
                class="set-toggle"
                :class="{ 'set-toggle--active': paybackManualEnabled }"
                @click="paybackManualEnabled = !paybackManualEnabled"
                role="switch"
                :aria-checked="paybackManualEnabled"
              >
                <span class="set-toggle-knob"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Scan Cooldown -->
        <div class="set-card">
          <div class="set-card-header">
            <div class="set-card-icon set-card-icon--scanner">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/>
              </svg>
            </div>
            <div>
              <h2 class="set-card-title">Scan-Cooldown</h2>
              <p class="set-card-desc">Wartezeit zwischen aufeinanderfolgenden Barcode-Scans</p>
            </div>
          </div>
          <div class="set-card-body">
            <div class="set-option-row">
              <div class="set-option-info">
                <span class="set-option-label">Kamera-Scan-Cooldown</span>
                <span class="set-option-hint">Minimale Wartezeit zwischen zwei Kamera-Scans, um doppeltes Erfassen zu vermeiden.</span>
              </div>
              <div class="set-input-group">
                <input
                  v-model.number="cameraCooldown"
                  type="number"
                  min="500"
                  max="5000"
                  step="100"
                  class="set-input"
                />
                <span class="set-input-unit">ms</span>
              </div>
            </div>
            <div class="set-option-row">
              <div class="set-option-info">
                <span class="set-option-label">Hardware-Scanner-Buffer</span>
                <span class="set-option-hint">Zeitfenster für die Zeichenpuffer-Erkennung des Hardware-Scanners.</span>
              </div>
              <div class="set-input-group">
                <input
                  v-model.number="scannerBuffer"
                  type="number"
                  min="100"
                  max="1000"
                  step="50"
                  class="set-input"
                />
                <span class="set-input-unit">ms</span>
              </div>
            </div>
            <div class="set-option-row">
              <div class="set-option-info">
                <span class="set-option-label">Kamera beim Start automatisch aktivieren</span>
                <span class="set-option-hint">Die Kamera wird beim Öffnen des Checkouts sofort gestartet.</span>
              </div>
              <button
                class="set-toggle"
                :class="{ 'set-toggle--active': cameraAutoStart }"
                @click="cameraAutoStart = !cameraAutoStart"
                role="switch"
                :aria-checked="cameraAutoStart"
              >
                <span class="set-toggle-knob"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Admin-Anmeldedaten -->
        <div class="set-card">
          <div class="set-card-header">
            <div class="set-card-icon set-card-icon--auth">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <div>
              <h2 class="set-card-title">Admin-Anmeldedaten</h2>
              <p class="set-card-desc">Benutzername und Passwort für den Admin-Zugang ändern</p>
            </div>
          </div>
          <div class="set-card-body">
            <div class="set-form-group">
              <label class="set-form-label">Benutzername</label>
              <input
                v-model="adminUsername"
                type="text"
                class="set-form-input"
                placeholder="admin"
                autocomplete="username"
              />
            </div>
            <div class="set-form-group">
              <label class="set-form-label">Aktuelles Passwort</label>
              <div class="set-password-wrap">
                <input
                  v-model="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  class="set-form-input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button class="set-eye-btn" @click="showCurrentPassword = !showCurrentPassword" type="button">
                  <svg v-if="showCurrentPassword" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                </button>
              </div>
            </div>
            <div class="set-form-group">
              <label class="set-form-label">Neues Passwort</label>
              <div class="set-password-wrap">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="set-form-input"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <button class="set-eye-btn" @click="showNewPassword = !showNewPassword" type="button">
                  <svg v-if="showNewPassword" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                </button>
              </div>
            </div>
            <div class="set-form-group">
              <label class="set-form-label">Neues Passwort bestätigen</label>
              <div class="set-password-wrap">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="set-form-input"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <button class="set-eye-btn" @click="showConfirmPassword = !showConfirmPassword" type="button">
                  <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                </button>
              </div>
            </div>
            <div class="set-form-hint" v-if="newPassword && confirmPassword && newPassword !== confirmPassword">
              <svg viewBox="0 0 24 24" fill="currentColor" class="set-form-hint-icon"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              <span>Passwörter stimmen nicht überein.</span>
            </div>
            <div v-if="credentialError" class="set-form-hint">
              <svg viewBox="0 0 24 24" fill="currentColor" class="set-form-hint-icon"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              <span>{{ credentialError }}</span>
            </div>
            <div v-if="credentialSuccess" class="set-form-success">
              <svg viewBox="0 0 24 24" fill="currentColor" class="set-form-success-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span>Passwort erfolgreich geändert!</span>
            </div>
            <button class="set-btn set-btn--auth" @click="saveCredentials">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14zm-4.2-5.78v1.75l3.2-2.99L12.8 9v1.7c-3.11.43-4.35 2.56-4.8 4.7 1.11-1.5 2.58-2.18 4.8-2.18z"/></svg>
              Anmeldedaten speichern
            </button>
          </div>
        </div>

      </div>

      <!-- Save All Bar -->
      <div class="set-save-bar">
        <div class="set-save-bar-inner">
          <span class="set-save-hint">
            <span v-if="saveSuccess" class="set-save-success-text">✓ Einstellungen gespeichert!</span>
            <span v-else>Änderungen werden automatisch gespeichert.</span>
          </span>
          <button class="set-btn set-btn--save" @click="saveAllSettings">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
            Alle Einstellungen speichern
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const {
  paybackEnabled,
  paybackQrEnabled,
  paybackManualEnabled,
  cameraCooldown,
  scannerBuffer,
  cameraAutoStart,
  adminUsername,
} = storeToRefs(settingsStore)

// Admin Credentials (local form state)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Save feedback
const saveSuccess = ref(false)
const credentialError = ref('')
const credentialSuccess = ref(false)

function saveAllSettings() {
  settingsStore.saveAll()
  saveSuccess.value = true
  setTimeout(() => { saveSuccess.value = false }, 2500)
}

function saveCredentials() {
  credentialError.value = ''
  credentialSuccess.value = false

  if (!currentPassword.value) {
    credentialError.value = 'Bitte aktuelles Passwort eingeben.'
    return
  }
  if (!settingsStore.checkCredentials(adminUsername.value, currentPassword.value)) {
    credentialError.value = 'Aktuelles Passwort ist falsch.'
    return
  }
  if (!newPassword.value) {
    credentialError.value = 'Bitte neues Passwort eingeben.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    credentialError.value = 'Passwörter stimmen nicht überein.'
    return
  }

  settingsStore.adminPassword = newPassword.value
  settingsStore.saveAll()
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  credentialSuccess.value = true
  setTimeout(() => { credentialSuccess.value = false }, 2500)
}
</script>

<style scoped>
.settings-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

.bg-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

/* Navbar */
.set-navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.92);
  backdrop-filter: blur(10px);
}

.set-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.set-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.set-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #071A2A;
  background: linear-gradient(90deg, #00D4E8, #6EF0F9);
  border-radius: 999px;
}

.set-breadcrumb {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.set-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.18s;
}

.set-back-btn:hover {
  color: #fff;
  background: rgba(0, 212, 232, 0.1);
  border-color: rgba(0, 212, 232, 0.3);
  transform: translateY(-1px);
}

.set-back-icon {
  width: 18px;
  height: 18px;
}

/* Main */
.set-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 2.5rem 3rem 6rem;
  max-width: 820px;
  width: 100%;
  margin: 0 auto;
}

.set-header {
  margin-bottom: 2.5rem;
}

.set-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.3rem;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.set-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.38);
  margin: 0;
}

/* Sections */
.set-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Card */
.set-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.set-card:hover {
  border-color: rgba(255,255,255,0.12);
}

.set-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.015);
}

.set-card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.set-card-icon svg {
  width: 22px;
  height: 22px;
}

.set-card-icon--payback {
  background: rgba(0, 212, 232, 0.12);
  color: #00D4E8;
}

.set-card-icon--timeout {
  background: rgba(255, 200, 60, 0.12);
  color: #FFC83C;
}

.set-card-icon--scanner {
  background: rgba(110, 240, 180, 0.12);
  color: #6EF0B4;
}

.set-card-icon--auth {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
}

.set-card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.92);
}

.set-card-desc {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  line-height: 1.35;
}

.set-card-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Option Row */
.set-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
}

.set-option-info {
  flex: 1;
  min-width: 0;
}

.set-option-label {
  display: block;
  font-size: 0.88rem;
  font-weight: 650;
  color: rgba(255,255,255,0.88);
  margin-bottom: 0.15rem;
}

.set-option-hint {
  display: block;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.32);
  line-height: 1.4;
}

/* Toggle */
.set-toggle {
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.25s;
  padding: 0;
}

.set-toggle--active {
  background: rgba(0, 212, 232, 0.25);
  border-color: rgba(0, 212, 232, 0.5);
  box-shadow: 0 0 12px rgba(0, 212, 232, 0.2);
}

.set-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transition: all 0.25s;
}

.set-toggle--active .set-toggle-knob {
  left: 25px;
  background: #00D4E8;
  box-shadow: 0 0 8px rgba(0, 212, 232, 0.5);
}

/* Input Group */
.set-input-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.set-input {
  width: 72px;
  padding: 0.5rem 0.65rem;
  font-size: 0.9rem;
  font-weight: 650;
  color: #fff;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  outline: none;
  text-align: center;
  transition: border-color 0.2s;
  font-family: inherit;
}

.set-input:focus {
  border-color: rgba(0, 212, 232, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 212, 232, 0.1);
}

.set-input-unit {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  min-width: 28px;
}

/* Form (Admin Credentials) */
.set-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.set-form-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.4);
}

.set-form-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.set-form-input:focus {
  border-color: rgba(0, 212, 232, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 212, 232, 0.1);
}

.set-form-input::placeholder {
  color: rgba(255,255,255,0.2);
}

.set-password-wrap {
  position: relative;
}

.set-password-wrap .set-form-input {
  padding-right: 2.8rem;
}

.set-eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.35);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.set-eye-btn:hover {
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.06);
}

.set-eye-btn svg {
  width: 18px;
  height: 18px;
}

.set-form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 10px;
  font-size: 0.8rem;
  color: #fca5a5;
}

.set-form-hint-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #f87171;
}

.set-form-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 10px;
  font-size: 0.8rem;
  color: #4ade80;
}

.set-form-success-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #4ade80;
}

.set-save-success-text {
  color: #4ade80;
  font-weight: 600;
}

/* Buttons */
.set-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}

.set-btn svg {
  width: 18px;
  height: 18px;
}

.set-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.set-btn--auth {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.8rem;
  color: #fff;
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.25);
}

.set-btn--auth:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(248, 113, 113, 0.15);
}

.set-btn--save {
  color: #071A2A;
  background: linear-gradient(90deg, #00D4E8, #6EF0F9);
  font-weight: 800;
  padding: 0.85rem 2rem;
  box-shadow: 0 8px 24px rgba(0, 212, 232, 0.2);
}

.set-btn--save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(0, 212, 232, 0.3);
}

/* Save Bar */
.set-save-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(7, 26, 42, 0.95);
  border-top: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  padding: 1rem 2rem;
}

.set-save-bar-inner {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.set-save-hint {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.35);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .set-navbar {
    padding: 1rem 1.25rem;
  }
  .set-main {
    padding: 1.5rem 1.25rem 6rem;
  }
  .set-title {
    font-size: 1.6rem;
  }
  .set-option-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .set-save-bar-inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>