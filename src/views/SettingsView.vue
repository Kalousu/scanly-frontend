<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import AdminLayout from '../components/AdminLayout.vue'

const settings = useSettingsStore()

const showSaved = ref(false)

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

const numericSettings = [
  { label: 'Kamera Cooldown (ms)', key: 'cameraCooldown', min: 100, max: 5000, step: 100 },
  { label: 'Scanner Buffer (ms)', key: 'scannerBuffer', min: 50, max: 2000, step: 50 },
]

const credentialFields = [
  { label: 'Admin Benutzername', key: 'adminUsername', type: 'text', placeholder: 'Benutzername' },
  { label: 'Admin Passwort', key: 'adminPassword', type: 'password', placeholder: 'Passwort' },
]

function saveSettings() {
  settings.saveAll()
  showSaved.value = true
  setTimeout(() => { showSaved.value = false }, 2000)
}

</script>

<template>
  <AdminLayout breadcrumb="Einstellungen" :max-width="700">
      <div class="admin-page-header">
        <h1 class="admin-page-title">Einstellungen</h1>
        <p class="admin-page-subtitle">Systemkonfiguration und Präferenzen</p>
      </div>

      <div class="admin-card">
        <!-- Toggle sections -->
        <div v-for="group in toggleSettings" :key="group.section" class="settings-section">
          <h2 class="admin-section-title">{{ group.section }}</h2>
          <div v-for="item in group.items" :key="item.key" class="admin-settings-row">
            <span class="admin-settings-label">{{ item.label }}</span>
            <label class="admin-toggle">
              <input type="checkbox" v-model="settings[item.key]" />
              <span class="admin-toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Numeric settings -->
        <div class="settings-section">
          <h2 class="admin-section-title">Scanner</h2>
          <div v-for="item in numericSettings" :key="item.key" class="admin-settings-row">
            <span class="admin-settings-label">{{ item.label }}</span>
            <input
              type="number"
              class="admin-input admin-input--number"
              v-model.number="settings[item.key]"
              :min="item.min"
              :max="item.max"
              :step="item.step"
            />
          </div>
        </div>

        <!-- Admin credentials -->
        <div class="settings-section">
          <h2 class="admin-section-title">Admin-Zugangsdaten</h2>
          <div v-for="field in credentialFields" :key="field.key" class="admin-settings-row admin-settings-row--vertical">
            <span class="admin-settings-label">{{ field.label }}</span>
            <input
              :type="field.type"
              class="admin-input"
              v-model="settings[field.key]"
              :placeholder="field.placeholder"
            />
          </div>
        </div>

        <!-- Save button -->
        <div class="settings-footer">
            <span v-if="showSaved" class="admin-saved-msg">
              Gespeichert!
            </span>
          <button class="admin-btn admin-btn--primary" @click="saveSettings">Speichern</button>
        </div>
      </div>
  </AdminLayout>
</template>

<style>
@import '@/assets/admin-shared.css';
</style>

<style scoped>
.settings-section {
  margin-bottom: 2rem;
}

.settings-section:last-of-type {
  margin-bottom: 1.5rem;
}

.settings-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}
</style>
