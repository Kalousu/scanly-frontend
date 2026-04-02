<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card modal-card--sm">
      <h3 class="modal-title">{{ t('langTitle') }}</h3>
      <div class="lang-grid">
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="lang-btn"
          :class="{ 'lang-btn--active': currentLang === lang.code }"
          @click="$emit('select', lang.code)"
        >
          <img :src="lang.flag" :alt="lang.label" class="lang-flag" />
          <span class="lang-label">{{ lang.label }}</span>
          <span class="lang-code">{{ lang.code.toUpperCase() }}</span>
        </button>
      </div>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--back" @click="$emit('close')">
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  currentLang: { type: String, required: true },
  languages: { type: Array, required: true },
  t: { type: Function, required: true },
})

defineEmits(['close', 'select'])
</script>

<style scoped>
.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-card {
  width: min(900px, 95%);
  max-height: 82vh;
  background: rgba(10, 28, 44, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 26px;
  padding: 28px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-card--sm {
  width: min(480px, 95%);
}

.modal-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: -0.02em;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}

.modal-btn--back {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.17);
}

.modal-btn--back:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.modal-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.lang-btn {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.96);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.15s, transform 0.13s, background 0.15s, box-shadow 0.15s;
  letter-spacing: 0.01em;
}

.lang-btn:hover {
  border-color: rgba(24, 231, 242, 0.35);
  background: rgba(24, 231, 242, 0.07);
  transform: translateY(-1px);
}

.lang-btn--active {
  border-color: rgba(24, 231, 242, 0.52);
  background: rgba(24, 231, 242, 0.09);
  color: #18e7f2;
  box-shadow: 0 0 16px rgba(24, 231, 242, 0.2);
}

.lang-flag {
  width: 32px;
  height: 22px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.lang-label {
  flex: 1;
  text-align: left;
}

.lang-code {
  font-size: 11px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.42);
  letter-spacing: 0.08em;
}

.lang-btn--active .lang-code {
  color: #18e7f2;
}
</style>