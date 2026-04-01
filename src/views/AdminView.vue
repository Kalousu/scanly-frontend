<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const DASHBOARD_ITEMS = [
  {
    id: 'orders',
    route: '/admin/orders',
    title: 'Bestellungen',
    description: 'Aktuelle Bestellungen einsehen und verwalten',
  },
  {
    id: 'products',
    route: '/admin/products',
    title: 'Produkte',
    description: 'Produktkatalog und Preise verwalten',
  },
  {
    id: 'revenue',
    route: '/admin/revenue',
    title: 'Umsatz',
    description: 'Umsatzstatistiken und Berichte',
  },
  {
    id: 'coupons',
    route: '/admin/coupons',
    title: 'Gutscheine',
    description: 'Gutscheincodes und Rabatt-Coupons verwalten',
  },
  {
    id: 'settings',
    route: '/admin/settings',
    title: 'Einstellungen',
    description: 'Systemkonfiguration und Präferenzen',
  },
]

function navigateTo(route) {
  router.push(route)
}

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
        ← Zurück zum Start
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
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.description }}</p>
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
  gap: 0.5rem;
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

/* ===== Card Text ===== */
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