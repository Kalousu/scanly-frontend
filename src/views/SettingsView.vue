<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useLanguage } from '@/components/Uselanguage'
import AdminLayout from '@/components/AdminLayout.vue'

const settings = useSettingsStore()
const { t } = useLanguage()

const showSaved = ref(false)
const newPassword = ref('')

const toggleSettings = computed(() => [
  {
    section: t('adminPayback'),
    items: [
      { label: t('adminPaybackEnabled'), key: 'paybackEnabled' },
      { label: t('adminPaybackQr'), key: 'paybackQrEnabled' },
      { label: t('adminPaybackManual'), key: 'paybackManualEnabled' },
    ],
  },
  {
    section: t('adminCamera'),
    items: [
      { label: t('adminCameraAutoStart'), key: 'cameraAutoStart' },
    ],
  },
])

const numericSettings = computed(() => [
  { label: t('adminCameraCooldown'), key: 'cameraCooldown', min: 100, max: 5000, step: 100 },
  { label: t('adminScannerBuffer'), key: 'scannerBuffer', min: 50, max: 2000, step: 50 },
])

async function saveSettings() {
  if (newPassword.value.trim()) {
    await settings.updateAdminPassword(newPassword.value.trim())
    newPassword.value = ''
  }
  settings.saveAll()
  showSaved.value = true
  setTimeout(() => { showSaved.value = false }, 2000)
}

</script>

<template>
  <AdminLayout :breadcrumb="t('adminSettings')" :max-width="700">
      <div class="admin-page-header">
        <h1 class="admin-page-title">{{ t('adminSettings') }}</h1>
        <p class="admin-page-subtitle">{{ t('adminSettingsDesc') }}</p>
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
          <h2 class="admin-section-title">{{ t('adminScanner') }}</h2>
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
          <h2 class="admin-section-title">{{ t('adminCredentials') }}</h2>
          <div class="admin-settings-row admin-settings-row--vertical">
            <span class="admin-settings-label">{{ t('adminUsername') }}</span>
            <input
              type="text"
              class="admin-input"
              v-model="settings.adminUsername"
              :placeholder="t('adminUsernamePlaceholder')"
            />
          </div>
          <div class="admin-settings-row admin-settings-row--vertical">
            <span class="admin-settings-label">{{ t('adminPassword') }}</span>
            <input
              type="password"
              class="admin-input"
              v-model="newPassword"
              :placeholder="t('adminPasswordPlaceholder')"
            />
          </div>
        </div>

        <!-- Save button -->
        <div class="settings-footer">
            <span v-if="showSaved" class="admin-saved-msg">
              {{ t('adminSaved') }}
            </span>
          <button type="button" class="admin-btn admin-btn--primary" @click="saveSettings">{{ t('adminSave') }}</button>
        </div>
      </div>
  </AdminLayout>
</template>

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
