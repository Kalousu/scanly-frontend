<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push('/admin')
}
</script>

<template>
  <div class="coupons-page">
    <nav class="coupons-navbar">
      <div class="coupons-navbar-left">
        <img src="../assets/logo-removebg-preview.png" class="coupons-logo" alt="Scanly" />
        <span class="coupons-badge">Admin</span>
        <span class="coupons-breadcrumb">/ Gutscheine</span>
      </div>
      <button type="button" class="coupons-back-btn" @click="goBack">
        ← Zurück zum Dashboard
      </button>
    </nav>

    <main class="coupons-main">
      <div class="coupons-header">
        <h1 class="coupons-title">Gutscheine & Coupons</h1>
        <p class="coupons-subtitle">Gutscheincodes und Rabatt-Coupons verwalten</p>
      </div>

      <div class="coupons-empty">
        <h2 class="coupons-empty-title">Noch keine Gutscheine</h2>
        <p class="coupons-empty-desc">Diese Funktion wird in einer zukünftigen Version verfügbar sein.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.coupons-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #091E30;
}

.coupons-navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.95);
}

.coupons-navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.coupons-logo {
  width: 80px;
  display: block;
  filter: brightness(1.1);
}

.coupons-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #071A2A;
  background: #00D4E8;
  border-radius: 999px;
}

.coupons-breadcrumb {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.coupons-back-btn {
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
}

.coupons-back-btn:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
}


.coupons-main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 3rem 4rem;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

.coupons-header {
  margin-bottom: 2.5rem;
  text-align: center;
  width: 100%;
}

.coupons-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.3rem;
  color: #fff;
}

.coupons-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.38);
  margin: 0;
}

.coupons-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
}


.coupons-empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255,255,255,0.8);
}

.coupons-empty-desc {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.35);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .coupons-navbar {
    padding: 1rem 1.25rem;
  }
  .coupons-main {
    padding: 1.5rem 1.25rem 3rem;
  }
  .coupons-title {
    font-size: 1.6rem;
  }
}
</style>