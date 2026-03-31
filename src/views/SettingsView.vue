<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const settings = useSettingsStore()

const showSaved = ref(false)

// Toggle settings grouped by section
const toggleSettings = computed(() => [
  {
    section: 'Payback',
    items: [
      { label: 'Payback aktiviert', key: 'paybackEnabled' },
      { label: 'Payback QR-Code', key: 'paybackQrEnabled' },
      { label: 'Payback manuelle Eingabe', key: 'paybackManualEnabled' },
    ],
  },
  {
    section: 'Kamera',
    items: [
      { label: 'Kamera-Autostart', key: 'cameraAutoStart' },
    ],
  },
])

// Numeric settings with min/max/step
const numericSettings = [
  { label: 'Kamera Cooldown (ms)', key: 'cameraCooldown', min: 100, max: 5000, step: 100 },
  { label: 'Scanner Buffer (ms)', key: 'scannerBuffer', min: 50, max: 2000, step: 50 },
]

// Admin credential fields
const credentialFields = [
  { label: 'Admin Benutzername', key: 'adminUsername', type: 'text', placeholder: 'Benutzername' },
  { label: 'Admin Passwort', key: 'adminPassword', type: 'password', placeholder: 'Passwort' },
]

function saveSettings() {
  settings.saveAll()
  showSaved.value = true
  setTimeout(() => { showSaved.value = false }, 2000)
}

function goBack() {
  router.push('/admin')
}
</script>

<template>
  <div class="settings-page">
    <nav class="settings-navbar">
      <div class="settings-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="settings-logo" alt="Scanly" />
        <span class="settings-badge">Admin</span>
        <span class="settings-breadcrumb">/ Einstellungen</span>
      </div>
      <button type="button" class="settings-back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" class="settings-back-icon" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Zurück zum Dashboard
      </button>
    </nav>

    <main class="settings-main">
      <div class="settings-header">
        <h1 class="settings-title">Einstellungen</h1>
        <p class="settings-subtitle">Systemkonfiguration und Präferenzen</p>
      </div>

      <div class="settings-card">
        <!-- Toggle sections -->
        <div v-for="group in toggleSettings" :key="group.section" class="settings-section">
          <h2 class="settings-section-title">{{ group.section }}</h2>
          <div v-for="item in group.items" :key="item.key" class="settings-row">
            <span class="settings-label">{{ item.label }}</span>
            <label class="settings-toggle">
              <input type="checkbox" v-model="settings[item.key]" />
              <span class="settings-toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Numeric settings -->
        <div class="settings-section">
          <h2 class="settings-section-title">Scanner</h2>
          <div v-for="item in numericSettings" :key="item.key" class="settings-row">
            <span class="settings-label">{{ item.label }}</span>
            <input
              type="number"
              class="settings-number"
              v-model.number="settings[item.key]"
              :min="item.min"
              :max="item.max"
              :step="item.step"
            />
          </div>
        </div>

        <!-- Admin credentials -->
        <div class="settings-section">
          <h2 class="settings-section-title">Admin-Zugangsdaten</h2>
          <div v-for="field in credentialFields" :key="field.key" class="settings-row settings-row--vertical">
            <span class="settings-label">{{ field.label }}</span>
            <input
              :type="field.type"
              class="settings-text-input"
              v-model="settings[field.key]"
              :placeholder="field.placeholder"
            />
          </div>
        </div>

        <!-- Save button -->
        <div class="settings-footer">
          <Transition name="fade">
            <span v-if="showSaved" class="settings-saved-msg">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Gespeichert!
            </span>
          </Transition>
          <button class="settings-save-btn" @click="saveSettings">Speichern</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.settings-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #091E30;
}

.settings-navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.95);
}

.settings-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.settings-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.settings-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #071A2A;
  background: #00D4E8;
  border-radius: 999px;
}

.settings-breadcrumb {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.settings-back-btn {
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
}

.settings-back-btn:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
}

.settings-back-icon {
  width: 18px;
  height: 18px;
}

.settings-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 2.5rem 3rem 4rem;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.3rem;
  color: #fff;
}

.settings-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.38);
  margin: 0;
}

.settings-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 2rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section:last-of-type {
  margin-bottom: 1.5rem;
}

.settings-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.35);
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
}

.settings-row + .settings-row {
  border-top: 1px solid rgba(255,255,255,0.04);
}

.settings-row--vertical {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}

.settings-label {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.75);
  font-weight: 500;
}

/* Toggle switch */
.settings-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.settings-toggle input {
  display: none;
}

.settings-toggle-slider {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.12);
  border-radius: 999px;
}

.settings-toggle-slider::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
}

.settings-toggle input:checked + .settings-toggle-slider {
  background: #00D4E8;
}

.settings-toggle input:checked + .settings-toggle-slider::after {
  transform: translateX(20px);
}

.settings-number {
  width: 100px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  outline: none;
  text-align: center;
}

.settings-number:focus {
  border-color: rgba(0, 212, 232, 0.5);
}

.settings-text-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  outline: none;
  box-sizing: border-box;
}

.settings-text-input:focus {
  border-color: rgba(0, 212, 232, 0.5);
}

.settings-text-input::placeholder {
  color: rgba(255,255,255,0.25);
}

.settings-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.settings-saved-msg {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6EF0B4;
}

.settings-saved-msg svg {
  width: 16px;
  height: 16px;
}

.settings-save-btn {
  padding: 0.65rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #071A2A;
  background: #00D4E8;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.settings-save-btn:hover {
  background: #00bfd2;
}


@media (max-width: 768px) {
  .settings-navbar {
    padding: 1rem 1.25rem;
  }
  .settings-main {
    padding: 1.5rem 1.25rem 3rem;
  }
  .settings-title {
    font-size: 1.6rem;
  }
}
</style>