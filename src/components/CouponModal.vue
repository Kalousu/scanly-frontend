<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card modal-card--sm">
      <h3 class="modal-title">{{ t('couponRedeem') }}</h3>
      <p class="coupon-subtitle">{{ t('couponRedeemSubtitle') }}</p>

      <div class="coupon-input-wrapper">
        <input
          ref="inputRef"
          :value="code"
          type="text"
          class="coupon-input"
          :placeholder="t('couponInputPlaceholder')"
          maxlength="32"
          @input="$emit('update:code', $event.target.value)"
          @keydown.enter="$emit('redeem')"
        />
        <button
          type="button"
          class="coupon-scan-btn"
          :title="scanning ? t('couponScanActiveTitle') : t('couponScanTitle')"
          @click="$emit('toggle-scan')"
        >
          <span v-if="!scanning">{{ t('couponScanBtn') }}</span>
          <span v-else class="scan-pulse-icon">
            <span class="scan-pulse-dot"></span>
          </span>
        </button>
      </div>

      <div v-if="scanning" class="coupon-scan-hint">
        <span class="scan-pulse-dot-sm"></span>
        {{ t('couponScanHint') }}
      </div>

      <div
        v-if="message"
        class="coupon-message"
        :class="messageType === 'error' ? 'coupon-message--error' : 'coupon-message--success'"
      >
        {{ message }}
      </div>

      <div class="modal-actions">
        <button type="button" class="modal-btn modal-btn--back" @click="$emit('close')">
          {{ t('cancel') }}
        </button>
        <button
          type="button"
          class="modal-btn modal-btn--done"
          :disabled="!code.trim()"
          @click="$emit('redeem')"
        >
          {{ t('couponRedeemBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useLanguage } from '@/components/Uselanguage'

const { t } = useLanguage()

const props = defineProps({
  visible: { type: Boolean, required: true },
  code: { type: String, default: '' },
  scanning: { type: Boolean, default: false },
  message: { type: String, default: '' },
  messageType: { type: String, default: '' },
})

defineEmits(['close', 'update:code', 'redeem', 'toggle-scan'])

const inputRef = ref(null)

watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  }
})
</script>

<style scoped>
.coupon-subtitle {
  margin: 8px 0 18px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
}

.coupon-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.coupon-input {
  flex: 1;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.96);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.04em;
  outline: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.coupon-input::placeholder {
  color: rgba(255, 255, 255, 0.42);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.coupon-input:focus {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.04);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.12);
}

.coupon-scan-btn {
  width: 52px;
  min-height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.13s, box-shadow 0.2s;
}

.coupon-scan-btn:hover {
  border-color: rgba(24, 231, 242, 0.45);
  background: rgba(24, 231, 242, 0.08);
  color: #18e7f2;
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(24, 231, 242, 0.15);
}

.scan-pulse-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #18e7f2;
  box-shadow: 0 0 10px #18e7f2;
  animation: coupon-scan-pulse 1.2s ease-in-out infinite;
}

.scan-pulse-dot-sm {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #18e7f2;
  box-shadow: 0 0 8px #18e7f2;
  animation: coupon-scan-pulse 1.2s ease-in-out infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes coupon-scan-pulse {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #18e7f2; }
  50% { opacity: 0.5; transform: scale(0.7); box-shadow: 0 0 20px #18e7f2; }
}

.coupon-scan-hint {
  margin-top: 12px;
  font-size: 13px;
  color: #18e7f2;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(24, 231, 242, 0.06);
  border: 1px solid rgba(24, 231, 242, 0.2);
  border-radius: 12px;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.coupon-message {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  animation: fadeIn 0.25s ease;
}

.coupon-message--success {
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.25);
  color: #4ade80;
}

.coupon-message--error {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: #f87171;
}

.modal-btn--done {
  background: linear-gradient(90deg, #18e7f2 0%, #1bc7ff 100%);
  color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 18px 45px rgba(24, 231, 242, 0.26);
}

.modal-btn--done:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 50px rgba(24, 231, 242, 0.3);
}

.modal-btn--done:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

</style>
