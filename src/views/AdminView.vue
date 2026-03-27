<template>
  <div class="admin-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <nav class="admin-navbar">
      <div class="admin-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="admin-logo" alt="Scanly" />
        <span class="admin-badge">Admin</span>
      </div>
      <button type="button" class="admin-back-btn" @click="$router.push('/')">
        <svg viewBox="0 0 24 24" class="admin-back-icon" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Zurück zum Start
      </button>
    </nav>

    <main class="admin-main">
      <div class="admin-header">
        <h1 class="admin-title">Dashboard</h1>
        <p class="admin-subtitle">Verwaltung & Übersicht</p>
      </div>

      <div class="admin-grid">
        <!-- Bestellungen -->
        <div class="admin-card" @click="$router.push('/admin/orders')">
          <div class="admin-card-icon admin-card-icon--orders">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Bestellungen</h3>
            <p class="admin-card-desc">Aktuelle Bestellungen einsehen und verwalten</p>
          </div>
          <div class="admin-card-stat">
            <span class="admin-card-number">—</span>
            <span class="admin-card-label">Heute</span>
          </div>
        </div>

        <!-- Produkte -->
        <div class="admin-card" @click="$router.push('/admin/products')">
          <div class="admin-card-icon admin-card-icon--products">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Produkte</h3>
            <p class="admin-card-desc">Produktkatalog und Preise verwalten</p>
          </div>
          <div class="admin-card-stat">
            <span class="admin-card-number">—</span>
            <span class="admin-card-label">Gesamt</span>
          </div>
        </div>

        <!-- Umsatz -->
        <div class="admin-card" @click="$router.push('/admin/revenue')">
          <div class="admin-card-icon admin-card-icon--revenue">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Umsatz</h3>
            <p class="admin-card-desc">Umsatzstatistiken und Berichte</p>
          </div>
          <div class="admin-card-stat">
            <span class="admin-card-number">—</span>
            <span class="admin-card-label">Heute</span>
          </div>
        </div>

        <!-- Gutscheine & Coupons -->
        <div class="admin-card" @click="$router.push('/admin/coupons')">
          <div class="admin-card-icon admin-card-icon--coupons">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Gutscheine & Coupons</h3>
            <p class="admin-card-desc">Gutscheincodes und Rabatt-Coupons verwalten</p>
          </div>
          <div class="admin-card-stat">
            <span class="admin-card-number">—</span>
            <span class="admin-card-label">Aktiv</span>
          </div>
        </div>

        <!-- Einstellungen -->
        <div class="admin-card" @click="$router.push('/admin/settings')">
          <div class="admin-card-icon admin-card-icon--settings">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </div>
          <div class="admin-card-content">
            <h3 class="admin-card-title">Einstellungen</h3>
            <p class="admin-card-desc">Systemkonfiguration und Präferenzen</p>
          </div>
          <div class="admin-card-stat">
            <span class="admin-card-number">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="opacity: 0.5;">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </span>
            <span class="admin-card-label"></span>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
// Admin page — frontend only, no functionality yet
</script>

<style scoped>
.admin-page {
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
.admin-navbar {
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

.admin-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.admin-badge {
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

.admin-back-btn {
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

.admin-back-btn:hover {
  color: #fff;
  background: rgba(0, 212, 232, 0.1);
  border-color: rgba(0, 212, 232, 0.3);
  transform: translateY(-1px);
}

.admin-back-icon {
  width: 18px;
  height: 18px;
}

/* Main */
.admin-main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 3rem;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.admin-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 0.35rem;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.admin-subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.4);
  margin: 0;
  font-weight: 400;
}

/* Card Grid */
.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
}

.admin-grid .admin-card:last-child {
  grid-column: 1 / -1;
}

.admin-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.admin-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(0, 212, 232, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.admin-card-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.admin-card-icon svg {
  width: 28px;
  height: 28px;
}

.admin-card-icon--orders {
  background: rgba(0, 212, 232, 0.12);
  color: #00D4E8;
}

.admin-card-icon--products {
  background: rgba(110, 240, 180, 0.12);
  color: #6EF0B4;
}

.admin-card-icon--revenue {
  background: rgba(255, 200, 60, 0.12);
  color: #FFC83C;
}

.admin-card-icon--coupons {
  background: rgba(255, 140, 90, 0.12);
  color: #FF8C5A;
}

.admin-card-icon--settings {
  background: rgba(180, 160, 255, 0.12);
  color: #B4A0FF;
}

.admin-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.admin-card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: rgba(255,255,255,0.92);
}

.admin-card-desc {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.38);
  line-height: 1.35;
}

.admin-card-stat {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-navbar {
    padding: 1rem 1.25rem;
  }
  .admin-main {
    padding: 1.5rem 1.25rem 3rem;
  }
  .admin-grid {
    grid-template-columns: 1fr;
    max-height: none;
  }
  .admin-title {
    font-size: 1.7rem;
  }
}
</style>