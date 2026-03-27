<template>
  <div class="coupons-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <nav class="cp-navbar">
      <div class="cp-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="cp-logo" alt="Scanly" />
        <span class="cp-badge">Admin</span>
        <span class="cp-breadcrumb">/ Gutscheine & Coupons</span>
      </div>
      <button type="button" class="cp-back-btn" @click="$router.push('/admin')">
        <svg viewBox="0 0 24 24" class="cp-back-icon" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Zurück zum Dashboard
      </button>
    </nav>

    <main class="cp-main">
      <div class="cp-header">
        <h1 class="cp-title">Gutscheine & Coupons</h1>
        <p class="cp-subtitle">Gutscheincodes und Rabatt-Coupons erstellen und verwalten</p>
      </div>

      <!-- Tab Navigation -->
      <div class="cp-tabs">
        <button
          class="cp-tab"
          :class="{ 'cp-tab--active': activeTab === 'vouchers' }"
          @click="activeTab = 'vouchers'"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
          </svg>
          Gutscheine
        </button>
        <button
          class="cp-tab"
          :class="{ 'cp-tab--active': activeTab === 'coupons' }"
          @click="activeTab = 'coupons'"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
          </svg>
          Coupons
        </button>
      </div>

      <!-- ==================== GUTSCHEINE TAB ==================== -->
      <div v-if="activeTab === 'vouchers'" class="cp-section">

        <!-- Add Voucher Form -->
        <div class="cp-card">
          <div class="cp-card-header">
            <div class="cp-card-icon cp-card-icon--voucher">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div>
              <h2 class="cp-card-title">Neuen Gutschein erstellen</h2>
              <p class="cp-card-desc">Gutscheincode mit festem Wert anlegen</p>
            </div>
          </div>
          <div class="cp-card-body">
            <div class="cp-form-row">
              <div class="cp-form-group cp-form-group--flex">
                <label class="cp-form-label">Gutscheincode / Barcode</label>
                <input
                  v-model="newVoucher.code"
                  type="text"
                  class="cp-form-input"
                  placeholder="z.B. GIFT-2026-ABCD oder Barcode-Nummer"
                />
              </div>
              <div class="cp-form-group cp-form-group--small">
                <label class="cp-form-label">Wert (€)</label>
                <div class="cp-input-wrap">
                  <input
                    v-model.number="newVoucher.value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="cp-form-input cp-form-input--number"
                    placeholder="0.00"
                  />
                  <span class="cp-input-unit">€</span>
                </div>
              </div>
            </div>
            <div class="cp-form-row">
              <div class="cp-form-group cp-form-group--flex">
                <label class="cp-form-label">Beschreibung (optional)</label>
                <input
                  v-model="newVoucher.description"
                  type="text"
                  class="cp-form-input"
                  placeholder="z.B. Geburtstagsgutschein, Aktionsgutschein..."
                />
              </div>
              <div class="cp-form-group cp-form-group--small">
                <label class="cp-form-label">Gültig bis</label>
                <input
                  v-model="newVoucher.expiresAt"
                  type="date"
                  class="cp-form-input"
                />
              </div>
            </div>
            <button class="cp-btn cp-btn--add" @click="addVoucher" :disabled="!newVoucher.code || !newVoucher.value">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Gutschein hinzufügen
            </button>
          </div>
        </div>

        <!-- Voucher List -->
        <div class="cp-card">
          <div class="cp-card-header">
            <div class="cp-card-icon cp-card-icon--list">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </div>
            <div>
              <h2 class="cp-card-title">Aktive Gutscheine</h2>
              <p class="cp-card-desc">{{ vouchers.length }} Gutschein{{ vouchers.length !== 1 ? 'e' : '' }} angelegt</p>
            </div>
          </div>
          <div class="cp-card-body">
            <div v-if="vouchers.length === 0" class="cp-empty">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
              </svg>
              <span>Noch keine Gutscheine angelegt.</span>
            </div>
            <div v-else class="cp-list">
              <div v-for="(voucher, index) in vouchers" :key="index" class="cp-list-item">
                <div class="cp-list-item-icon cp-list-item-icon--voucher">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                  </svg>
                </div>
                <div class="cp-list-item-info">
                  <div class="cp-list-item-top">
                    <span class="cp-list-item-code">{{ voucher.code }}</span>
                    <span class="cp-list-item-badge cp-list-item-badge--voucher">{{ formatCurrency(voucher.value) }}</span>
                  </div>
                  <div class="cp-list-item-meta">
                    <span v-if="voucher.description">{{ voucher.description }}</span>
                    <span v-if="voucher.expiresAt" class="cp-list-item-expiry">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                      Gültig bis {{ voucher.expiresAt }}
                    </span>
                  </div>
                </div>
                <button class="cp-list-item-delete" @click="removeVoucher(index)" title="Gutschein entfernen">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== COUPONS TAB ==================== -->
      <div v-if="activeTab === 'coupons'" class="cp-section">

        <!-- Add Coupon Form -->
        <div class="cp-card">
          <div class="cp-card-header">
            <div class="cp-card-icon cp-card-icon--coupon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div>
              <h2 class="cp-card-title">Neuen Coupon erstellen</h2>
              <p class="cp-card-desc">Rabatt-Coupon mit prozentualem oder festem Rabatt anlegen</p>
            </div>
          </div>
          <div class="cp-card-body">
            <div class="cp-form-row">
              <div class="cp-form-group cp-form-group--flex">
                <label class="cp-form-label">Couponcode / Barcode</label>
                <input
                  v-model="newCoupon.code"
                  type="text"
                  class="cp-form-input"
                  placeholder="z.B. SOMMER20, WELCOME10 oder Barcode-Nummer"
                />
              </div>
              <div class="cp-form-group cp-form-group--small">
                <label class="cp-form-label">Rabatt-Typ</label>
                <div class="cp-select-wrap">
                  <select v-model="newCoupon.discountType" class="cp-form-select">
                    <option value="percent">Prozent (%)</option>
                    <option value="fixed">Fester Betrag (€)</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="cp-form-row">
              <div class="cp-form-group cp-form-group--small">
                <label class="cp-form-label">Rabatt-Wert</label>
                <div class="cp-input-wrap">
                  <input
                    v-model.number="newCoupon.discountValue"
                    type="number"
                    min="0.01"
                    :max="newCoupon.discountType === 'percent' ? 100 : undefined"
                    step="0.01"
                    class="cp-form-input cp-form-input--number"
                    placeholder="0"
                  />
                  <span class="cp-input-unit">{{ newCoupon.discountType === 'percent' ? '%' : '€' }}</span>
                </div>
              </div>
              <div class="cp-form-group cp-form-group--small">
                <label class="cp-form-label">Mindestbestellwert (€)</label>
                <div class="cp-input-wrap">
                  <input
                    v-model.number="newCoupon.minOrder"
                    type="number"
                    min="0"
                    step="0.01"
                    class="cp-form-input cp-form-input--number"
                    placeholder="0.00"
                  />
                  <span class="cp-input-unit">€</span>
                </div>
              </div>
              <div class="cp-form-group cp-form-group--small">
                <label class="cp-form-label">Gültig bis</label>
                <input
                  v-model="newCoupon.expiresAt"
                  type="date"
                  class="cp-form-input"
                />
              </div>
            </div>
            <div class="cp-form-row">
              <div class="cp-form-group cp-form-group--flex">
                <label class="cp-form-label">Beschreibung (optional)</label>
                <input
                  v-model="newCoupon.description"
                  type="text"
                  class="cp-form-input"
                  placeholder="z.B. Sommeraktion 20% Rabatt, Neukundenrabatt..."
                />
              </div>
            </div>
            <button class="cp-btn cp-btn--add-coupon" @click="addCoupon" :disabled="!newCoupon.code || !newCoupon.discountValue">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Coupon hinzufügen
            </button>
          </div>
        </div>

        <!-- Coupon List -->
        <div class="cp-card">
          <div class="cp-card-header">
            <div class="cp-card-icon cp-card-icon--list-coupon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </div>
            <div>
              <h2 class="cp-card-title">Aktive Coupons</h2>
              <p class="cp-card-desc">{{ coupons.length }} Coupon{{ coupons.length !== 1 ? 's' : '' }} angelegt</p>
            </div>
          </div>
          <div class="cp-card-body">
            <div v-if="coupons.length === 0" class="cp-empty">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
              </svg>
              <span>Noch keine Coupons angelegt.</span>
            </div>
            <div v-else class="cp-list">
              <div v-for="(coupon, index) in coupons" :key="index" class="cp-list-item">
                <div class="cp-list-item-icon cp-list-item-icon--coupon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                  </svg>
                </div>
                <div class="cp-list-item-info">
                  <div class="cp-list-item-top">
                    <span class="cp-list-item-code">{{ coupon.code }}</span>
                    <span class="cp-list-item-badge cp-list-item-badge--coupon">
                      {{ coupon.discountType === 'percent' ? coupon.discountValue + '%' : formatCurrency(coupon.discountValue) }}
                    </span>
                  </div>
                  <div class="cp-list-item-meta">
                    <span v-if="coupon.description">{{ coupon.description }}</span>
                    <span v-if="coupon.minOrder" class="cp-list-item-min">
                      Ab {{ formatCurrency(coupon.minOrder) }} Bestellwert
                    </span>
                    <span v-if="coupon.expiresAt" class="cp-list-item-expiry">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                      Gültig bis {{ coupon.expiresAt }}
                    </span>
                  </div>
                </div>
                <button class="cp-list-item-delete" @click="removeCoupon(index)" title="Coupon entfernen">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref('vouchers')

// ---- Vouchers (Gutscheine) ----
const newVoucher = reactive({
  code: '',
  value: null,
  description: '',
  expiresAt: '',
})

const vouchers = ref([])

function addVoucher() {
  if (!newVoucher.code || !newVoucher.value) return
  vouchers.value.push({
    code: newVoucher.code,
    value: newVoucher.value,
    description: newVoucher.description,
    expiresAt: newVoucher.expiresAt,
  })
  newVoucher.code = ''
  newVoucher.value = null
  newVoucher.description = ''
  newVoucher.expiresAt = ''
}

function removeVoucher(index) {
  vouchers.value.splice(index, 1)
}

// ---- Coupons ----
const newCoupon = reactive({
  code: '',
  discountType: 'percent',
  discountValue: null,
  minOrder: null,
  description: '',
  expiresAt: '',
})

const coupons = ref([])

function addCoupon() {
  if (!newCoupon.code || !newCoupon.discountValue) return
  coupons.value.push({
    code: newCoupon.code,
    discountType: newCoupon.discountType,
    discountValue: newCoupon.discountValue,
    minOrder: newCoupon.minOrder,
    description: newCoupon.description,
    expiresAt: newCoupon.expiresAt,
  })
  newCoupon.code = ''
  newCoupon.discountType = 'percent'
  newCoupon.discountValue = null
  newCoupon.minOrder = null
  newCoupon.description = ''
  newCoupon.expiresAt = ''
}

function removeCoupon(index) {
  coupons.value.splice(index, 1)
}

// ---- Helpers ----
function formatCurrency(val) {
  return Number(val).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
</script>

<style scoped>
.coupons-page {
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
.cp-navbar {
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

.cp-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cp-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.cp-badge {
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

.cp-breadcrumb {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.cp-back-btn {
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

.cp-back-btn:hover {
  color: #fff;
  background: rgba(0, 212, 232, 0.1);
  border-color: rgba(0, 212, 232, 0.3);
  transform: translateY(-1px);
}

.cp-back-icon {
  width: 18px;
  height: 18px;
}

/* Main */
.cp-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 2.5rem 3rem 3rem;
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
}

.cp-header {
  margin-bottom: 2rem;
}

.cp-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.3rem;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cp-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.38);
  margin: 0;
}

/* Tabs */
.cp-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}

.cp-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.cp-tab svg {
  width: 18px;
  height: 18px;
}

.cp-tab:hover {
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.07);
}

.cp-tab--active {
  color: #FF8C5A;
  background: rgba(255, 140, 90, 0.1);
  border-color: rgba(255, 140, 90, 0.3);
}

.cp-tab--active:hover {
  color: #FF8C5A;
  background: rgba(255, 140, 90, 0.14);
}

/* Section */
.cp-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Card */
.cp-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.cp-card:hover {
  border-color: rgba(255,255,255,0.12);
}

.cp-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.015);
}

.cp-card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.cp-card-icon svg {
  width: 22px;
  height: 22px;
}

.cp-card-icon--voucher {
  background: rgba(255, 140, 90, 0.12);
  color: #FF8C5A;
}

.cp-card-icon--coupon {
  background: rgba(160, 120, 255, 0.12);
  color: #A078FF;
}

.cp-card-icon--list {
  background: rgba(110, 240, 180, 0.12);
  color: #6EF0B4;
}

.cp-card-icon--list-coupon {
  background: rgba(0, 212, 232, 0.12);
  color: #00D4E8;
}

.cp-card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.92);
}

.cp-card-desc {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  line-height: 1.35;
}

.cp-card-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Form */
.cp-form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.cp-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cp-form-group--flex {
  flex: 1;
  min-width: 0;
}

.cp-form-group--small {
  width: 180px;
  flex-shrink: 0;
}

.cp-form-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.4);
}

.cp-form-input {
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

.cp-form-input:focus {
  border-color: rgba(255, 140, 90, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 140, 90, 0.1);
}

.cp-form-input::placeholder {
  color: rgba(255,255,255,0.2);
}

.cp-form-input--number {
  padding-right: 2.2rem;
  text-align: right;
}

.cp-input-wrap {
  position: relative;
}

.cp-input-unit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  pointer-events: none;
}

.cp-select-wrap {
  position: relative;
}

.cp-form-select {
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
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='rgba(255,255,255,0.4)'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 2rem;
}

.cp-form-select:focus {
  border-color: rgba(160, 120, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(160, 120, 255, 0.1);
}

.cp-form-select option {
  background: #0B2C44;
  color: #fff;
}

/* Buttons */
.cp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}

.cp-btn svg {
  width: 18px;
  height: 18px;
}

.cp-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cp-btn--add {
  width: 100%;
  color: #fff;
  background: rgba(255, 140, 90, 0.15);
  border: 1px solid rgba(255, 140, 90, 0.25);
}

.cp-btn--add:hover:not(:disabled) {
  background: rgba(255, 140, 90, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(255, 140, 90, 0.15);
}

.cp-btn--add-coupon {
  width: 100%;
  color: #fff;
  background: rgba(160, 120, 255, 0.15);
  border: 1px solid rgba(160, 120, 255, 0.25);
}

.cp-btn--add-coupon:hover:not(:disabled) {
  background: rgba(160, 120, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(160, 120, 255, 0.15);
}

/* Empty State */
.cp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: rgba(255,255,255,0.25);
}

.cp-empty svg {
  width: 40px;
  height: 40px;
  opacity: 0.4;
}

.cp-empty span {
  font-size: 0.88rem;
  font-weight: 500;
}

/* List */
.cp-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cp-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  transition: border-color 0.15s, background 0.15s;
}

.cp-list-item:hover {
  border-color: rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.18);
}

.cp-list-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.cp-list-item-icon svg {
  width: 20px;
  height: 20px;
}

.cp-list-item-icon--voucher {
  background: rgba(255, 140, 90, 0.1);
  color: #FF8C5A;
}

.cp-list-item-icon--coupon {
  background: rgba(160, 120, 255, 0.1);
  color: #A078FF;
}

.cp-list-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cp-list-item-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cp-list-item-code {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  letter-spacing: 0.03em;
}

.cp-list-item-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 999px;
}

.cp-list-item-badge--voucher {
  background: rgba(255, 140, 90, 0.15);
  color: #FF8C5A;
  border: 1px solid rgba(255, 140, 90, 0.25);
}

.cp-list-item-badge--coupon {
  background: rgba(160, 120, 255, 0.15);
  color: #A078FF;
  border: 1px solid rgba(160, 120, 255, 0.25);
}

.cp-list-item-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
}

.cp-list-item-expiry {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.cp-list-item-expiry svg {
  width: 13px;
  height: 13px;
}

.cp-list-item-min {
  color: rgba(255,255,255,0.35);
}

.cp-list-item-delete {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.15);
  border-radius: 10px;
  color: rgba(248, 113, 113, 0.6);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  padding: 0;
}

.cp-list-item-delete:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.3);
  color: #f87171;
  transform: scale(1.05);
}

.cp-list-item-delete svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .cp-navbar {
    padding: 1rem 1.25rem;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .cp-main {
    padding: 1.5rem 1.25rem 3rem;
  }
  .cp-title {
    font-size: 1.6rem;
  }
  .cp-tabs {
    width: 100%;
  }
  .cp-tab {
    flex: 1;
    justify-content: center;
    padding: 0.55rem 0.75rem;
    font-size: 0.82rem;
  }
  .cp-form-row {
    flex-direction: column;
  }
  .cp-form-group--small {
    width: 100%;
  }
  .cp-list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .cp-list-item-delete {
    align-self: flex-end;
  }
}
</style>