<template>
  <div class="container">
    <div class="wrapper">
      <div class="payback">
        <h1 class="title">Zahlen Sie mit Payback?</h1>
        <p class="subtitle">Scannen Sie jetzt Ihre Payback-Karte oder fahren Sie ohne fort.</p>

        <img
          src="https://www.payback.de/resource/blob/327670/bb5914260838b67b1e398db1622a0d92/image-center-data.png"
          class="payback-logo"
        />

        <div class="actions">
          <button class="btn primary">Payback scannen</button>
          <button class="btn ghost" @click="payment">Ohne Payback</button>
        </div>

        <div class="hint">Tipp: Alternativ Kartennummer eingeben.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function payment() {
  router.push('/payment')
}
</script>

<style>
html,
body {
  margin: 0;
  overflow: hidden;
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
}

body {
  background: linear-gradient(to bottom, #7a5cc2, #6e4fb3);
}
</style>

<style scoped>
.container {
  height: 100vh;
  width: 100vw;
  display: grid;
  place-items: center;
  padding: 48px;
  box-sizing: border-box;
}

.wrapper {
  width: 40vw;
  height: 60vh;
  background: #f4f4f6;
  border-radius: 28px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.25);
  display: grid;
  place-items: center;
  padding: 56px;
  box-sizing: border-box;
}

.payback {
  width: min(760px, 100%);
  text-align: center;
}

.title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  color: #3f3f46;
  letter-spacing: 0.2px;
}

.subtitle {
  margin: 14px auto 0;
  max-width: 620px;
  font-size: 16px;
  color: #71717a;
  line-height: 1.5;
}

.payback-logo {
  width: 20vw;
}

.actions {
  margin-top: 34px;
  display: flex;
  justify-content: center;
  gap: 22px;
  flex-wrap: wrap;
}

.btn {
  min-width: 260px;
  padding: 18px 28px;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn.primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff;
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.35);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 42px rgba(124, 58, 237, 0.5);
}

.btn.ghost {
  background: transparent;
  border: 2px solid #7c3aed;
  color: #7c3aed;
}

.btn.ghost:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
}

.hint {
  margin-top: 18px;
  font-size: 13px;
  color: #7a7a85;
}
</style>
