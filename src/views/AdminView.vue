<script setup>
import { useRouter } from 'vue-router'
import AdminLayout from '../components/AdminLayout.vue'

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
</script>

<template>
  <AdminLayout breadcrumb="Dashboard" back-to="/" back-label="Zurück zum Start">
    <header class="header">
      <h1 class="title">Dashboard</h1>
      <p class="subtitle">Verwaltung & Übersicht</p>
    </header>

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
  </AdminLayout>
</template>

<style scoped>
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

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
}

.grid .card:last-child {
  grid-column: 1 / -1;
}

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

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 1.7rem;
  }
}
</style>