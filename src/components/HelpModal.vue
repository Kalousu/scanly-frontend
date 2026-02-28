<template>
  <Teleport to="body">
    <Transition name="help-modal">
      <div
        v-if="modelValue"
        class="help-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="t('helpModalTitle')"
        @click.self="$emit('update:modelValue', false)"
        @keydown.esc="$emit('update:modelValue', false)"
      >
        <div class="help-modal" ref="modalEl">
          <div class="help-modal__header">
            <div class="help-modal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                     10-4.48 10-10S17.52 2 12 2Zm0 17a1.25 1.25 0 1 1 0-2.5
                     1.25 1.25 0 0 1 0 2.5Zm1.2-5.7c-.7.46-.95.72-.95 1.45v.25h-1.9v-.4
                     c0-1.23.55-1.87 1.45-2.45.73-.48 1.2-.78 1.2-1.5
                     0-.78-.62-1.3-1.5-1.3-.82 0-1.42.44-1.75 1.1l-1.62-.95
                     C8.68 7.42 10.05 6.6 11.7 6.6c2 0 3.5 1.18 3.5 3
                     0 1.6-1 2.25-2 2.95Z"
                />
              </svg>
            </div>
            <h2 class="help-modal__title">{{ t('helpModalTitle') }}</h2>
            <button
              ref="closeBtnEl"
              type="button"
              class="help-modal__close"
              :aria-label="t('close')"
              @click="$emit('update:modelValue', false)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="help-modal__divider" aria-hidden="true"></div>

          <div class="help-modal__body">
            <p class="help-modal__text">{{ t('helpModalBody') }}</p>
          </div>

          <ul class="help-modal__steps" aria-label="Steps">
            <li v-for="(step, i) in helpSteps" :key="i" class="help-modal__step">
              <span class="help-modal__step-num" aria-hidden="true">{{ i + 1 }}</span>
              <span class="help-modal__step-text">{{ step }}</span>
            </li>
          </ul>

          <div class="help-modal__footer">
            <button
              type="button"
              class="help-modal__cta"
              @click="$emit('update:modelValue', false)"
            >
              {{ t('helpModalCta') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  currentLang: {
    type: String,
    default: 'de',
  },
  translations: {
    type: Object,
    required: true,
  },
})

// const emit = defineEmits(['update:modelValue'])

const modalEl = ref(null)
const closeBtnEl = ref(null)

const t = (key) => props.translations[props.currentLang]?.[key] ?? key

const helpSteps = computed(() => props.translations[props.currentLang]?.helpSteps ?? [])

watch(
  () => props.modelValue,
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
.help-backdrop {
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

.help-modal {
  position: relative;
  width: 100%;
  max-width: 520px;
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

.help-modal::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, #00D4E8 0%, #6EF0F9 50%, transparent 100%);
  flex-shrink: 0;
}

.help-modal__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.35rem 1.5rem 1rem;
}

.help-modal__icon {
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

.help-modal__icon svg {
  width: 20px;
  height: 20px;
}

.help-modal__title {
  flex: 1;
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;
}

.help-modal__close {
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

.help-modal__close:hover {
  background: rgba(0, 212, 232, 0.12);
  border-color: rgba(0, 212, 232, 0.35);
  color: #fff;
  transform: rotate(90deg);
}

.help-modal__close svg {
  width: 16px;
  height: 16px;
}

.help-modal__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0 1.5rem;
}

.help-modal__body {
  padding: 1.25rem 1.5rem 0.75rem;
}

.help-modal__text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.62);
  font-weight: 400;
}

.help-modal__steps {
  list-style: none;
  margin: 0;
  padding: 0.25rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.help-modal__step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.help-modal__step-num {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 212, 232, 0.1);
  border: 1px solid rgba(0, 212, 232, 0.25);
  color: #00D4E8;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
}

.help-modal__step-text {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.4;
}

.help-modal__footer {
  padding: 0 1.5rem 1.5rem;
}

.help-modal__cta {
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

.help-modal__cta:hover {
  background: linear-gradient(90deg, #3de0e0 0%, #3dd1ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(30, 195, 255, 0.32);
}

.help-modal__cta:active {
  transform: translateY(0);
}

.help-modal-enter-active,
.help-modal-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.help-modal-enter-active .help-modal,
.help-modal-leave-active .help-modal {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.help-modal-enter-from {
  opacity: 0;
}

.help-modal-enter-from .help-modal {
  opacity: 0;
  transform: scale(0.93) translateY(12px);
}

.help-modal-leave-to {
  opacity: 0;
}

.help-modal-leave-to .help-modal {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}
</style>