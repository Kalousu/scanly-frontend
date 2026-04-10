<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import { fetchAllCoupons, createCoupon, activateCoupon, deactivateCoupon } from '../services/api'

const coupons = ref([])
const loading = ref(false)
const activeModal = ref(false)
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
      [coupon.code, coupon.label, coupon.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))

    return matchesStatus && matchesQuery
  })
})

const couponKpis = computed(() => {
  const activeCount = coupons.value.filter((c) => c.active).length
  const percentageCount = coupons.value.filter((c) => c.type === 'percentage' || c.type === 'PERCENTAGE').length

  return [
    { label: 'Coupons gesamt', value: coupons.value.length },
    { label: 'Aktiv', value: activeCount },
    { label: 'Prozentual', value: percentageCount },
  ]
})

function getEmptyForm() {
  return {
    code: '',
    label: '',
    type: 'percentage',
    value: 10,
    minOrderValue: 0,
  }
}

function resetForm() {
  form.value = getEmptyForm()
  formError.value = ''
}

function openCreateModal() {
  resetForm()
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
  const type = (coupon.type || '').toLowerCase()
  return type === 'percentage'
    ? `${coupon.value}%`
    : `${Number(coupon.value).toFixed(2)} EUR`
}

function formatType(coupon) {
  const type = (coupon.type || '').toLowerCase()
  return type === 'percentage' ? 'Prozent' : 'Fixbetrag'
}

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

function validateForm() {
  const code = (form.value.code || '').trim().toUpperCase()

  if (!code || !form.value.label.trim()) {
    formError.value = 'Bitte Code und Bezeichnung ausfüllen.'
    return false
  }

  if (!Number.isFinite(Number(form.value.value)) || Number(form.value.value) <= 0) {
    formError.value = 'Der Rabattwert muss größer als 0 sein.'
    return false
  }

  formError.value = ''
  return true
}

async function saveCoupon() {
  if (!validateForm()) return

  const payload = {
    code: form.value.code.trim().toUpperCase(),
    label: form.value.label.trim(),
    type: form.value.type.toUpperCase(),
    value: Number(form.value.value),
    minOrderValue: Number(form.value.minOrderValue || 0),
  }

  try {
    await createCoupon(payload)
    showSavedMessage(`Coupon ${payload.code} angelegt.`)
    closeModal()
    await loadCoupons()
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Fehler beim Anlegen des Coupons.'
    formError.value = msg
  }
}

async function loadCoupons() {
  loading.value = true
  try {
    const data = await fetchAllCoupons()
    coupons.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Fehler beim Laden der Coupons:', error)
    coupons.value = []
  } finally {
    loading.value = false
  }
}

async function toggleCouponStatus(coupon) {
  try {
    if (coupon.active) {
      await deactivateCoupon(coupon.id)
      showSavedMessage(`Coupon ${coupon.code} deaktiviert.`)
    } else {
      await activateCoupon(coupon.id)
      showSavedMessage(`Coupon ${coupon.code} aktiviert.`)
    }
    await loadCoupons()
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Fehler beim Ändern des Coupon-Status.'
    showSavedMessage(msg)
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<template>
  <AdminLayout breadcrumb="Gutscheine" :max-width="1180">
    <div class="admin-page-header admin-page-header--center">
      <h1 class="admin-page-title">Gutscheine & Coupons</h1>
      <p class="admin-page-subtitle">Verwaltung für Gutschein- und Rabatt-Codes</p>
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
          <button class="admin-btn admin-btn--secondary" @click="loadCoupons" :disabled="loading">
            {{ loading ? 'Laden…' : 'Aktualisieren' }}
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

      <div v-if="loading" class="admin-empty coupons-empty">
        <p class="coupons-empty-desc">Coupons werden geladen…</p>
      </div>

      <div v-else-if="filteredCoupons.length > 0" class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Bezeichnung</th>
              <th>Typ</th>
              <th>Rabatt</th>
              <th>Mindestwert</th>
              <th>Status</th>
              <th>Erstellt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in filteredCoupons" :key="coupon.id || coupon.code">
              <td class="admin-td-id">{{ coupon.code }}</td>
              <td>
                <div class="coupon-label">{{ coupon.label || '—' }}</div>
              </td>
              <td>{{ formatType(coupon) }}</td>
              <td class="admin-td-amount">{{ formatDiscount(coupon) }}</td>
              <td>{{ Number(coupon.minOrderValue || 0).toFixed(2) }} EUR</td>
              <td>
                <button
                  class="coupon-toggle-btn"
                  :class="coupon.active ? 'coupon-toggle-btn--active' : 'coupon-toggle-btn--inactive'"
                  @click="toggleCouponStatus(coupon)"
                >
                  {{ coupon.active ? 'Aktiv' : 'Inaktiv' }}
                </button>
              </td>
              <td>{{ formatDate(coupon.createdAt || coupon.creationDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="admin-empty coupons-empty">
        <h2 class="coupons-empty-title">Keine Coupons gefunden</h2>
        <p class="coupons-empty-desc">
          Passe die Filter an oder lege direkt einen neuen Coupon an.
        </p>
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="activeModal" class="admin-modal-overlay" @click.self="closeModal">
        <div class="admin-modal admin-modal--lg">
          <div class="admin-modal-header">
            <h2 class="admin-modal-title">Coupon anlegen</h2>
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
                  placeholder="z.B. 20% Frühlingsrabatt"
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

            </div>

            <div class="coupon-preview">
              <div class="coupon-preview-label">Vorschau</div>
              <div class="coupon-preview-code">{{ (form.code || 'CODE').toUpperCase() }}</div>
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
                Coupon anlegen
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

.coupon-toggle-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.13s;
}

.coupon-toggle-btn:hover {
  transform: translateY(-1px);
}

.coupon-toggle-btn:active {
  transform: scale(0.97);
}

.coupon-toggle-btn--active {
  color: #6ef0b4;
  background: rgba(110, 240, 180, 0.08);
  border-color: rgba(110, 240, 180, 0.25);
}

.coupon-toggle-btn--active:hover {
  background: rgba(110, 240, 180, 0.14);
  border-color: rgba(110, 240, 180, 0.4);
}

.coupon-toggle-btn--inactive {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.coupon-toggle-btn--inactive:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
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