<template>
  <div class="admin-page">
    <nav class="admin-navbar">
      <div class="admin-navbar-left">
        <img
          src="../assets/logo-removebg-preview.png"
          class="admin-logo"
          alt="Scanly Logo"
        />
        <span class="admin-badge">Admin</span>
        <span class="admin-breadcrumb">/ {{ breadcrumb }}</span>
      </div>

      <button type="button" class="admin-back-btn" @click="goBack">
        ← {{ backLabel }}
      </button>
    </nav>

    <main class="admin-main" :style="mainStyle">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  breadcrumb: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: Number,
    default: 900,
  },
  backTo: {
    type: String,
    default: '/admin',
  },
  backLabel: {
    type: String,
    default: 'Zurück zum Dashboard',
  },
})

const router = useRouter()

function goBack() {
  router.push(props.backTo)
}

const mainStyle = computed(() => ({
  maxWidth: `${props.maxWidth}px`,
}))
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
  background: #091e30;
}

.admin-navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 26, 42, 0.95);
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
  color: #071a2a;
  background: #00d4e8;
  border-radius: 999px;
}

.admin-breadcrumb {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  font-weight: 500;
}

.admin-back-btn {
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
  transition:
    color 0.15s,
    background 0.15s,
    border-color 0.15s;
}

.admin-back-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.admin-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 2.5rem 3rem 4rem;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .admin-navbar {
    padding: 1rem 1.25rem;
  }

  .admin-main {
    padding: 1.5rem 1.25rem 3rem;
  }
}
</style>