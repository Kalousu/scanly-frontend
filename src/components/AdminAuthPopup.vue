<template>
  <Teleport to="body">
    <Transition name="admin-popup">
      <div
        v-if="visible"
        class="admin-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Admin Login"
        @click.self="close"
        @keydown.esc="close"
      >
        <div class="admin-popup">
          <div class="admin-popup__header">
            <div class="admin-popup__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                />
              </svg>
            </div>
            <h2 class="admin-popup__title">Admin Login</h2>
            <button
              ref="closeBtnEl"
              type="button"
              class="admin-popup__close"
              aria-label="Schließen"
              @click="close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="admin-popup__divider" aria-hidden="true"></div>

          <form @submit.prevent="handleLogin" class="admin-popup__body">
            <div class="admin-popup__field">
              <label for="admin-username" class="admin-popup__label">Benutzername</label>
              <input
                id="admin-username"
                v-model="username"
                type="text"
                class="admin-popup__input"
                placeholder="Benutzername eingeben"
                autocomplete="username"
              />
            </div>
            <div class="admin-popup__field">
              <label for="admin-password" class="admin-popup__label">Passwort</label>
              <input
                id="admin-password"
                v-model="password"
                type="password"
                class="admin-popup__input"
                placeholder="Passwort eingeben"
                autocomplete="current-password"
              />
            </div>

            <div class="admin-popup__footer">
              <button type="submit" class="admin-popup__cta">
                Anmelden
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()
const closeBtnEl = ref(null)
const username = ref('')
const password = ref('')

function close() {
  username.value = ''
  password.value = ''
  emit('close')
}

function handleLogin() {
  // No backend logic yet – just redirect to admin page
  router.push('/admin')
  close()
}

watch(
  () => props.visible,
  async (opened) => {
    if (opened) {
      await nextTick()
      closeBtnEl.value?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.admin-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(4, 14, 24, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.admin-popup {
  position: relative;
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  background: linear-gradient(145deg, #0d2b42 0%, #0b2336 100%);
  border: 1px solid rgba(0, 212, 232, 0.18);
  box-shadow:
    0 0 0 1px rgba(0, 212, 232, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.55),
    0 0 80px rgba(0, 212, 232, 0.07) inset;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.admin-popup::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, #00D4E8 0%, #6EF0F9 50%, transparent 100%);
  flex-shrink: 0;
}

.admin-popup__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.35rem 1.5rem 1rem;
}

.admin-popup__icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 212, 232, 0.12);
  border: 1px solid rgba(0, 212, 232, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00D4E8;
}

.admin-popup__icon svg {
  width: 20px;
  height: 20px;
}

.admin-popup__title {
  flex: 1;
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;
}

.admin-popup__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.13s;
  flex-shrink: 0;
}

.admin-popup__close:hover {
  background: rgba(0, 212, 232, 0.12);
  border-color: rgba(0, 212, 232, 0.35);
  color: #fff;
  transform: rotate(90deg);
}

.admin-popup__close svg {
  width: 16px;
  height: 16px;
}

.admin-popup__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0 1.5rem;
}

.admin-popup__body {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-popup__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.admin-popup__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.62);
  letter-spacing: 0.02em;
}

.admin-popup__input {
  width: 100%;
  height: 46px;
  padding: 0 1rem;
  font-size: 0.95rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  box-sizing: border-box;
}

.admin-popup__input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}

.admin-popup__input:focus {
  border-color: rgba(0, 212, 232, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 212, 232, 0.1);
  background: rgba(255, 255, 255, 0.07);
}

.admin-popup__footer {
  padding-top: 0.5rem;
}

.admin-popup__cta {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #1fd6d6 0%, #1ec3ff 100%);
  color: #071A2A;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.18s, background 0.18s;
  box-shadow: 0 4px 18px rgba(30, 195, 255, 0.22);
}

.admin-popup__cta:hover {
  background: linear-gradient(90deg, #3de0e0 0%, #3dd1ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(30, 195, 255, 0.32);
}

.admin-popup__cta:active {
  transform: translateY(0);
}

/* Transitions */
.admin-popup-enter-active,
.admin-popup-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.admin-popup-enter-active .admin-popup,
.admin-popup-leave-active .admin-popup {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.admin-popup-enter-from {
  opacity: 0;
}

.admin-popup-enter-from .admin-popup {
  opacity: 0;
  transform: scale(0.93) translateY(12px);
}

.admin-popup-leave-to {
  opacity: 0;
}

.admin-popup-leave-to .admin-popup {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}
</style>