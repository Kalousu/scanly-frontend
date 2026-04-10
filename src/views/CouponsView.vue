<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import { MOCK_COUPON_DEFINITIONS, normalizeCouponCode } from '../services/coupons'

const STORAGE_KEY = 'scanly-admin-coupons-mock'

const coupons = ref([])
const activeModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const saveMessage = ref('')
const formError = ref('')

const form = ref(getEmptyForm())

const statusOptions = [
  { value: 'ALL', label: 'Alle' },
  { value: 'ACTIVE', label: 'Aktiv' },
  { value: 'INACTIVE', label: 'Inaktiv' },
]

const filteredCoupons = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return coupons.value.filter((coupon) => {
    const matchesStatus =
      statusFilter.value === 'ALL' ||
      (statusFilter.value === 'ACTIVE' ? coupon.active : !coupon.active)

    const matchesQuery =
      !query ||
      [coupon.code, coupon.label, coupon.typeLabel]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))

    return matchesStatus && matchesQuery
  })
})

const couponKpis = computed(() => {
  const activeCount = coupons.value.filter((coupon) => coupon.active).length
  const percentageCount = coupons.value.filter((coupon) => coupon.type === 'percentage').length

  return [
    { label: 'Coupons gesamt', value: coupons.value.length },
    { label: 'Aktiv', value: activeCount },
    { label: 'Prozentual', value: percentageCount },
  ]
})

const modalTitle = computed(() => (editingId.value ? 'Coupon bearbeiten' : 'Coupon anlegen'))

function getEmptyForm() {
  return {
    code: '',
    label: '',
    type: 'percentage',
    value: 10,
    minOrderValue: 0,
    active: true,
  }
}

function createCouponRecord(seed, index) {
  const value = Number(seed.value || 0)
  const minOrderValue = Number(seed.minOrderValue || 0)
  return {
    id: seed.id || `${normalizeCouponCode(seed.code)}-${index + 1}`,
    code: normalizeCouponCode(seed.code),
    label: seed.label,
    type: seed.type,
    typeLabel: seed.type === 'percentage' ? 'Prozent' : 'Fixbetrag',
    value,
    minOrderValue,
    active: seed.active ?? true,
    usageCount: seed.usageCount ?? 0,
    createdAt: seed.createdAt || new Date().toISOString(),
    summary:
      seed.type === 'percentage'
        ? `${value}% Rabatt`
        : `${value.toFixed(2)} EUR Rabatt`,
  }
}

function getSeedCoupons() {
  return MOCK_COUPON_DEFINITIONS.map((coupon, index) =>
    createCouponRecord(
      {
        ...coupon,
        active: index !== 2,
        usageCount: [18, 7, 2][index] ?? 0,
      },
      index,
    ),
  )
}

function loadCoupons() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    coupons.value = getSeedCoupons()
    persistCoupons()
    return
  }

  try {
    const parsed = JSON.parse(raw)
    coupons.value = Array.isArray(parsed)
      ? parsed.map((coupon, index) => createCouponRecord(coupon, index))
      : getSeedCoupons()
  } catch {
    coupons.value = getSeedCoupons()
    persistCoupons()
  }
}

function persistCoupons() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons.value))
}

function resetForm() {
  form.value = getEmptyForm()
  editingId.value = null
  formError.value = ''
}

function openCreateModal() {
  resetForm()
  activeModal.value = true
}

function openEditModal(coupon) {
  editingId.value = coupon.id
  formError.value = ''
  form.value = {
    code: coupon.code,
    label: coupon.label,
    type: coupon.type,
    value: coupon.value,
    minOrderValue: coupon.minOrderValue,
    active: coupon.active,
  }
  activeModal.value = true
}

function closeModal() {
  activeModal.value = false
  resetForm()
}

function showSavedMessage(text) {
  saveMessage.value = text
  window.setTimeout(() => {
    if (saveMessage.value === text) {
      saveMessage.value = ''
    }
  }, 2200)
}

function formatDiscount(coupon) {
  return coupon.type === 'percentage'
    ? `${coupon.value}%`
    : `${coupon.value.toFixed(2)} EUR`
}

function formatDate(date) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

function validateForm() {
  const normalizedCode = normalizeCouponCode(form.value.code)

  if (!normalizedCode || !form.value.label.trim()) {
    formError.value = 'Bitte Code und Bezeichnung ausfuellen.'
    return false
  }

  if (!Number.isFinite(Number(form.value.value)) || Number(form.value.value) <= 0) {
    formError.value = 'Der Rabattwert muss groesser als 0 sein.'
    return false
  }

  const duplicate = coupons.value.find(
    (coupon) => coupon.code === normalizedCode && coupon.id !== editingId.value,
  )

  if (duplicate) {
    formError.value = 'Dieser Coupon-Code existiert bereits.'
    return false
  }

  formError.value = ''
  return true
}

function saveCoupon() {
  if (!validateForm()) return

  const payload = createCouponRecord(
    {
      id: editingId.value || undefined,
      code: form.value.code,
      label: form.value.label.trim(),
      type: form.value.type,
      value: Number(form.value.value),
      minOrderValue: Number(form.value.minOrderValue || 0),
      active: form.value.active,
      usageCount:
        coupons.value.find((coupon) => coupon.id === editingId.value)?.usageCount ?? 0,
      createdAt:
        coupons.value.find((coupon) => coupon.id === editingId.value)?.createdAt ||
        new Date().toISOString(),
    },
    coupons.value.length,
  )

  if (editingId.value) {
    coupons.value = coupons.value.map((coupon) => (coupon.id === editingId.value ? payload : coupon))
    showSavedMessage(`Coupon ${payload.code} aktualisiert.`)
  } else {
    coupons.value = [payload, ...coupons.value]
    showSavedMessage(`Coupon ${payload.code} angelegt.`)
  }

  persistCoupons()
  closeModal()
}

function toggleCoupon(coupon) {
  coupon.active = !coupon.active
  persistCoupons()
  showSavedMessage(
    coupon.active ? `Coupon ${coupon.code} aktiviert.` : `Coupon ${coupon.code} deaktiviert.`,
  )
}

function duplicateCoupon(coupon) {
  const draft = createCouponRecord(
    {
      ...coupon,
      id: `${coupon.id}-copy-${Date.now()}`,
      code: `${coupon.code}COPY`,
      label: `${coupon.label} (Kopie)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    },
    coupons.value.length,
  )

  coupons.value = [draft, ...coupons.value]
  persistCoupons()
  showSavedMessage(`Coupon ${draft.code} dupliziert.`)
}

function resetMockCoupons() {
  coupons.value = getSeedCoupons()
  persistCoupons()
  showSavedMessage('Mock-Coupons wurden zurueckgesetzt.')
}

onMounted(() => {
  loadCoupons()
})
</script>

<template>
  <AdminLayout breadcrumb="Gutscheine" :max-width="1180">
    <div class="admin-page-header admin-page-header--center">
      <h1 class="admin-page-title">Gutscheine & Coupons</h1>
      <p class="admin-page-subtitle">Mock-Verwaltung fuer Gutschein- und Rabatt-Codes</p>
    </div>

    <div class="admin-kpi-row">
      <div v-for="kpi in couponKpis" :key="kpi.label" class="admin-kpi">
        <div class="admin-kpi-num">{{ kpi.value }}</div>
        <div class="admin-kpi-label">{{ kpi.label }}</div>
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-toolbar">
        <div class="admin-search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            class="admin-search-input"
            placeholder="Nach Code oder Couponname suchen..."
          />
        </div>

        <div class="admin-filter-group">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            class="admin-filter-btn"
            :class="{ 'admin-filter-btn--active': statusFilter === option.value }"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="coupons-toolbar-actions">
          <button class="admin-btn admin-btn--secondary" @click="resetMockCoupons">
            Mock-Daten resetten
          </button>
          <button class="admin-btn admin-btn--primary" @click="openCreateModal">
            Neuer Coupon
          </button>
        </div>
      </div>

      <div class="coupons-toolbar-meta">
        <span class="coupons-count">{{ filteredCoupons.length }} Coupons sichtbar</span>
        <span v-if="saveMessage" class="admin-saved-msg">{{ saveMessage }}</span>
      </div>

      <div v-if="filteredCoupons.length > 0" class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Bezeichnung</th>
              <th>Typ</th>
              <th>Rabatt</th>
              <th>Mindestwert</th>
              <th>Status</th>
              <th>Nutzung</th>
              <th>Erstellt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in filteredCoupons" :key="coupon.id">
              <td class="admin-td-id">{{ coupon.code }}</td>
              <td>
                <div class="coupon-label">{{ coupon.label }}</div>
                <div class="coupon-summary">{{ coupon.summary }}</div>
              </td>
              <td>{{ coupon.typeLabel }}</td>
              <td class="admin-td-amount">{{ formatDiscount(coupon) }}</td>
              <td>{{ coupon.minOrderValue.toFixed(2) }} EUR</td>
              <td>
                <span
                  class="coupon-status"
                  :class="coupon.active ? 'coupon-status--active' : 'coupon-status--inactive'"
                >
                  {{ coupon.active ? 'Aktiv' : 'Inaktiv' }}
                </span>
              </td>
              <td>{{ coupon.usageCount }}</td>
              <td>{{ formatDate(coupon.createdAt) }}</td>
              <td>
                <div class="coupon-actions">
                  <button class="admin-btn admin-btn--ghost" @click="openEditModal(coupon)">
                    Bearbeiten
                  </button>
                  <button class="admin-btn admin-btn--ghost" @click="duplicateCoupon(coupon)">
                    Duplizieren
                  </button>
                  <button
                    class="admin-btn"
                    :class="coupon.active ? 'admin-btn--secondary' : 'admin-btn--success'"
                    @click="toggleCoupon(coupon)"
                  >
                    {{ coupon.active ? 'Deaktivieren' : 'Aktivieren' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="admin-empty coupons-empty">
        <h2 class="coupons-empty-title">Keine Coupons gefunden</h2>
        <p class="coupons-empty-desc">
          Passe die Filter an oder lege direkt einen neuen Mock-Coupon an.
        </p>
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="activeModal" class="admin-modal-overlay" @click.self="closeModal">
        <div class="admin-modal admin-modal--lg">
          <div class="admin-modal-header">
            <h2 class="admin-modal-title">{{ modalTitle }}</h2>
            <button class="admin-modal-close" @click="closeModal">×</button>
          </div>

          <div class="admin-modal-body">
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label class="admin-label">Coupon-Code</label>
                <input
                  v-model="form.code"
                  type="text"
                  class="admin-input"
                  maxlength="32"
                  placeholder="z.B. SPRING20"
                />
              </div>

              <div class="admin-form-group">
                <label class="admin-label">Bezeichnung</label>
                <input
                  v-model="form.label"
                  type="text"
                  class="admin-input"
                  placeholder="z.B. 20% Fruehlingsrabatt"
                />
              </div>
            </div>

            <div class="admin-form-row">
              <div class="admin-form-group">
                <label class="admin-label">Rabatt-Typ</label>
                <select v-model="form.type" class="admin-input">
                  <option value="percentage">Prozent</option>
                  <option value="fixed">Fixbetrag</option>
                </select>
              </div>

              <div class="admin-form-group">
                <label class="admin-label">
                  {{ form.type === 'percentage' ? 'Rabatt in %' : 'Rabatt in EUR' }}
                </label>
                <input
                  v-model.number="form.value"
                  type="number"
                  min="0"
                  step="0.01"
                  class="admin-input"
                />
              </div>
            </div>

            <div class="admin-form-row">
              <div class="admin-form-group">
                <label class="admin-label">Mindestbestellwert in EUR</label>
                <input
                  v-model.number="form.minOrderValue"
                  type="number"
                  min="0"
                  step="0.01"
                  class="admin-input"
                />
              </div>

              <div class="admin-form-group">
                <label class="admin-label">Status</label>
                <div class="coupon-toggle-row">
                  <span class="admin-settings-label">
                    {{ form.active ? 'Coupon ist aktiv' : 'Coupon ist inaktiv' }}
                  </span>
                  <label class="admin-toggle">
                    <input v-model="form.active" type="checkbox" />
                    <span class="admin-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="coupon-preview">
              <div class="coupon-preview-label">Vorschau</div>
              <div class="coupon-preview-code">{{ normalizeCouponCode(form.code) || 'CODE' }}</div>
              <div class="coupon-preview-text">
                {{ form.label || 'Bezeichnung des Coupons' }}
              </div>
              <div class="coupon-preview-meta">
                {{ form.type === 'percentage' ? `${Number(form.value || 0)}% Rabatt` : `${Number(form.value || 0).toFixed(2)} EUR Rabatt` }}
                · Mindestwert {{ Number(form.minOrderValue || 0).toFixed(2) }} EUR
              </div>
            </div>

            <div v-if="formError" class="admin-alert admin-alert--error">
              <p>{{ formError }}</p>
            </div>

            <div class="admin-modal-footer">
              <button class="admin-btn admin-btn--secondary" @click="closeModal">
                Abbrechen
              </button>
              <button class="admin-btn admin-btn--primary" @click="saveCoupon">
                {{ editingId ? 'Aenderungen speichern' : 'Coupon anlegen' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </AdminLayout>
</template>

<style>
@import '@/assets/admin-shared.css';
</style>

<style scoped>
.coupons-toolbar-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.coupons-toolbar-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.coupons-count {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.42);
}

.coupon-label {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.86);
}

.coupon-summary {
  margin-top: 0.2rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.38);
}

.coupon-status {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border-radius: 0;
  font-size: 0.8rem;
  font-weight: 700;
}

.coupon-status--active {
  color: #6ef0b4;
  background: transparent;
}

.coupon-status--inactive {
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
}

.coupon-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.coupon-actions :deep(.admin-btn) {
  min-width: 112px;
  justify-content: center;
  padding: 0.52rem 0.95rem;
  border-radius: 999px;
}

.coupon-actions :deep(.admin-btn--ghost) {
  color: rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.035);
  border-color: rgba(255, 255, 255, 0.08);
}

.coupon-actions :deep(.admin-btn--ghost:hover) {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
}

.coupon-actions :deep(.admin-btn--secondary) {
  color: rgba(255, 255, 255, 0.58);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.coupon-actions :deep(.admin-btn--secondary:hover) {
  color: rgba(255, 255, 255, 0.82);
  background: rgba(255, 255, 255, 0.075);
  border-color: rgba(255, 255, 255, 0.14);
}

.coupon-actions :deep(.admin-btn--success) {
  color: #071a2a;
  background: rgba(110, 240, 180, 0.92);
  border-color: transparent;
}

.coupon-actions :deep(.admin-btn--success:hover:not(:disabled)) {
  background: #7af2be;
}

.coupons-empty {
  min-height: 220px;
  justify-content: center;
  text-align: center;
}

.coupons-empty-title {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.82);
}

.coupons-empty-desc {
  margin: 0;
  max-width: 420px;
  font-size: 0.86rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.38);
}

.coupon-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 42px;
}

.coupon-preview {
  margin-top: 0.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(0, 212, 232, 0.1), rgba(110, 240, 180, 0.05)),
    rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 212, 232, 0.14);
}

.coupon-preview-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
}

.coupon-preview-code {
  margin-top: 0.45rem;
  font-size: 1.5rem;
  font-weight: 900;
  color: #00d4e8;
  letter-spacing: 0.06em;
}

.coupon-preview-text {
  margin-top: 0.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
}

.coupon-preview-meta {
  margin-top: 0.4rem;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.46);
}

@media (max-width: 900px) {
  .coupons-toolbar-actions {
    width: 100%;
    margin-left: 0;
  }

  .coupons-toolbar-actions .admin-btn {
    flex: 1;
    justify-content: center;
  }

  .coupons-toolbar-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
