<template>
  <Teleport to="body">
      <div
        v-if="visible"
        class="admin-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="t('adminLogin')"
        @click.self="close"
        @keydown.esc="close"
      >
        <div class="admin-popup">
          <div class="admin-popup__header">
            <h2 class="admin-popup__title">{{ t('adminLogin') }}</h2>
            <button
              ref="closeBtnEl"
              type="button"
              class="admin-popup__close"
              :aria-label="t('adminLoginClose')"
              @click="close"
            >
              X
            </button>
          </div>

          <div class="admin-popup__divider" aria-hidden="true"></div>

          <form @submit.prevent="handleLogin" class="admin-popup__body">
            <p class="admin-popup__notice">{{ t('adminLoginDemoNotice') }}</p>

            <div class="admin-popup__field">
              <label for="admin-username" class="admin-popup__label">{{ t('adminLoginUserLabel') }}</label>
              <input
                id="admin-username"
                v-model="username"
                type="text"
                class="admin-popup__input"
                :placeholder="t('adminLoginUserPlaceholder')"
                autocomplete="username"
              />
            </div>
            <div class="admin-popup__field">
              <label for="admin-password" class="admin-popup__label">{{ t('adminLoginPassLabel') }}</label>
              <input
                id="admin-password"
                v-model="password"
                type="password"
                class="admin-popup__input"
                :placeholder="t('adminLoginPassPlaceholder')"
                autocomplete="current-password"
              />
            </div>

            <div v-if="errorMsg" class="admin-popup__error" role="alert">
              {{ errorMsg }}
            </div>

            <div class="admin-popup__footer">
              <button type="submit" class="admin-popup__cta">
                {{ t('adminLoginSubmit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, toRef } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import { useLanguage } from '@/components/Uselanguage'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()
const settingsStore = useSettingsStore()
const { t } = useLanguage()
const closeBtnEl = ref(null)
const username = ref('')
const password = ref('')
const errorMsg = ref('')

useBodyScrollLock(toRef(props, 'visible'))

function close() {
  username.value = ''
  password.value = ''
  errorMsg.value = ''
  emit('close')
}

function handleLogin() {
  errorMsg.value = ''
  if (settingsStore.checkCredentials(username.value, password.value)) {
    router.push('/admin')
    close()
  } else {
    errorMsg.value = t('adminLoginError')
  }
}

watch(
  () => props.visible,
  async (opened) => {
    if (opened) {
      await nextTick()
      closeBtnEl.value?.focus()
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
  border-radius: 8px;
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

.admin-popup__notice {
  margin: 0 0 0.35rem;
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 200, 60, 0.24);
  background: rgba(255, 200, 60, 0.07);
  color: rgba(255, 230, 170, 0.86);
  font-size: 0.78rem;
  line-height: 1.45;
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
  flex-shrink: 0;
}

.admin-popup__close:hover {
  background: rgba(0, 212, 232, 0.12);
  border-color: rgba(0, 212, 232, 0.35);
  color: #fff;
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

.admin-popup__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fca5a5;
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
  box-shadow: 0 4px 18px rgba(30, 195, 255, 0.22);
}

.admin-popup__cta:hover {
  background: linear-gradient(90deg, #3de0e0 0%, #3dd1ff 100%);
  box-shadow: 0 6px 22px rgba(30, 195, 255, 0.32);
}

</style>
