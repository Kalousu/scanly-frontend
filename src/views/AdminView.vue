<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()


const DASHBOARD_ITEMS = [
  {
    id: 'orders',
    route: '/admin/orders',
    title: 'Bestellungen',
    description: 'Aktuelle Bestellungen einsehen und verwalten',
    icon: 'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z',
  },
  {
    id: 'products',
    route: '/admin/products',
    title: 'Produkte',
    description: 'Produktkatalog und Preise verwalten',
    icon: 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
  },
  {
    id: 'revenue',
    route: '/admin/revenue',
    title: 'Umsatz',
    description: 'Umsatzstatistiken und Berichte',
    icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
  },
  {
    id: 'coupons',
    route: '/admin/coupons',
    title: 'Gutscheine',
    description: 'Gutscheincodes und Rabatt-Coupons verwalten',
    icon: 'M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z',
  },
  {
    id: 'settings',
    route: '/admin/settings',
    title: 'Einstellungen',
    description: 'Systemkonfiguration und Präferenzen',
    icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  },
]

/** Navigiert zur angegebenen Route */
function navigateTo(route) {
  router.push(route)
}

/** Zurück zur Startseite */
function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="logo" alt="Scanly Logo" />
        <span class="badge">Admin</span>
      </div>

      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="currentColor" class="back-icon">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Zurück zum Start
      </button>
    </nav>

    <!-- Hauptinhalt -->
    <main class="main">
      <header class="header">
        <h1 class="title">Dashboard</h1>
        <p class="subtitle">Verwaltung & Übersicht</p>
      </header>

      <!-- Dashboard Cards -->
      <div class="grid">
        <div
          v-for="item in DASHBOARD_ITEMS"
          :key="item.id"
          :class="['card', `card--${item.id}`]"
          @click="navigateTo(item.route)"
        >
          <div :class="['card-icon', `card-icon--${item.id}`]">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path :d="item.icon" />
            </svg>
          </div>

          <div class="card-text">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ===== Seiten-Layout ===== */
.page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #091E30;
}

/* ===== Navbar ===== */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 26, 42, 0.95);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  width: 80px;
}

.badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #071A2A;
  background: #00D4E8;
  border-radius: 999px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  cursor: pointer;
}

.back-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.back-icon {
  width: 18px;
  height: 18px;
}

/* ===== Hauptbereich ===== */
.main {
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

.header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 0.35rem;
}

.subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* ===== Dashboard Grid ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
}

/* Letzte Karte (Einstellungen) geht über volle Breite */
.grid .card:last-child {
  grid-column: 1 / -1;
}

/* ===== Card ===== */
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  cursor: pointer;
}

.card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.15);
}

/* ===== Card Icon ===== */
.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.card-icon svg {
  width: 28px;
  height: 28px;
}

/* Farben pro Bereich */
.card-icon--orders   { background: rgba(0, 212, 232, 0.12);   color: #00D4E8; }
.card-icon--products { background: rgba(110, 240, 180, 0.12); color: #6EF0B4; }
.card-icon--revenue  { background: rgba(255, 200, 60, 0.12);  color: #FFC83C; }
.card-icon--coupons  { background: rgba(255, 140, 90, 0.12);  color: #FF8C5A; }
.card-icon--settings { background: rgba(180, 160, 255, 0.12); color: #B4A0FF; }

/* ===== Card Text ===== */
.card-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}

.card-desc {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.35;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem 1.25rem;
  }

  .main {
    padding: 1.5rem 1.25rem 3rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 1.7rem;
  }
}
</style>