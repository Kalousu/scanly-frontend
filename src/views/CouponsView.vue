<script setup>
import AdminLayout from '../components/AdminLayout.vue'
</script>

<template>
  <AdminLayout breadcrumb="Gutscheine" :max-width="800">
    <div class="coupons-header">
      <h1 class="coupons-title">Gutscheine & Coupons</h1>
      <p class="coupons-subtitle">Gutscheincodes und Rabatt-Coupons verwalten</p>
    </div>

    <div class="coupons-empty">
      <h2 class="coupons-empty-title">Noch keine Gutscheine</h2>
      <p class="coupons-empty-desc">Diese Funktion wird in einer zukünftigen Version verfügbar sein.</p>
    </div>
  </AdminLayout>
</template>

<style scoped>
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
  color: rgba(255, 255, 255, 0.38);
  margin: 0;
}

.coupons-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.coupons-empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

.coupons-empty-desc {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .coupons-title {
    font-size: 1.6rem;
  }
}
</style>