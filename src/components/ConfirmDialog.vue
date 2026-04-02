<template>
  <Teleport to="body">
    <div v-if="visible" class="confirm-overlay" @click.self="$emit('cancel')">
      <div class="confirm-card">
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-text" v-html="message"></p>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--cancel" @click="$emit('cancel')">
            {{ cancelLabel }}
          </button>
          <button class="confirm-btn confirm-btn--confirm" @click="$emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  cancelLabel: { type: String, default: 'Abbrechen' },
  confirmLabel: { type: String, required: true },
})

defineEmits(['cancel', 'confirm'])
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.confirm-card {
  width: min(420px, 90vw);
  background: rgba(10, 28, 44, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 24px;
  padding: 36px 32px 28px;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: scaleIn 0.25s ease;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.confirm-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: -0.02em;
}

.confirm-text {
  margin: 0 0 24px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

.confirm-text :deep(strong) {
  color: rgba(255, 255, 255, 0.96);
  font-weight: 700;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}

.confirm-btn:active {
  transform: scale(0.97);
}

.confirm-btn--cancel {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.17);
}

.confirm-btn--cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.confirm-btn--confirm {
  background: linear-gradient(90deg, #f87171 0%, #ef4444 100%);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 30px rgba(248, 113, 113, 0.25);
}

.confirm-btn--confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 40px rgba(248, 113, 113, 0.35);
}
</style>