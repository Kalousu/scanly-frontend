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
    <header class="admin-page-header admin-page-header--center">
      <h1 class="admin-page-title">Dashboard</h1>
      <p class="admin-page-subtitle">Verwaltung & Übersicht</p>
    </header>

    <div class="grid">
      <div
        v-for="item in DASHBOARD_ITEMS"
        :key="item.id"
        :class="['admin-card admin-card--interactive card--centered', `card--${item.id}`]"
        @click="navigateTo(item.route)"
      >
        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-desc">{{ item.description }}</p>
      </div>
    </div>
  </AdminLayout>
</template>

<style>
@import '@/assets/admin-shared.css';
</style>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
}

.grid .admin-card:last-child {
  grid-column: 1 / -1;
}

.card--centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 2rem 1.5rem;
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
}
</style>