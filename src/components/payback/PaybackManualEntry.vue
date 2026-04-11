<template>
  <div class="manual-view">
    <h2 :id="titleId" class="modal-title">{{ t('paybackManualTitle') }}</h2>
    <p class="modal-subtitle">{{ t('paybackManualSubtitle') }}</p>

    <div class="input-container">
      <div class="input-wrap" :class="{ focused: inputFocused, error: inputError }">
        <input
          :ref="setInputRef"
          :value="cardNumber"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          :placeholder="t('paybackInputPlaceholder')"
          class="card-input"
          :aria-label="t('paybackManualTitle')"
          :aria-invalid="inputError"
          maxlength="16"
          @input="$emit('update:cardNumber', $event.target.value)"
          @keydown.enter="$emit('confirm')"
          @focus="$emit('focus-change', true)"
          @blur="$emit('focus-change', false)"
        />
      </div>
      <p v-if="inputError" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
    </div>

    <div v-if="showKeyboard" class="numeric-keyboard">
      <button
        v-for="key in numericKeys"
        :key="key"
        class="key-btn"
        type="button"
        @click="$emit('append-digit', key)"
      >
        {{ key }}
      </button>
      <button class="key-btn key-backspace" type="button" :aria-label="t('back')" @click="$emit('backspace')">
        ←
      </button>
    </div>

    <div class="actions">
      <button class="btn primary" type="button" :disabled="!isValid" @click="$emit('confirm')">
        {{ t('paybackConfirm') }}
      </button>
      <button class="btn secondary" type="button" @click="$emit('scanner')">
        {{ t('paybackBackToScanner') }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  t: { type: Function, required: true },
  titleId: { type: String, required: true },
  cardNumber: { type: String, default: '' },
  inputFocused: { type: Boolean, default: false },
  inputError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  isValid: { type: Boolean, default: false },
  showKeyboard: { type: Boolean, default: false },
  numericKeys: { type: Array, required: true },
})

const emit = defineEmits([
  'update:cardNumber',
  'focus-change',
  'append-digit',
  'backspace',
  'confirm',
  'scanner',
  'input-ready',
])

function setInputRef(element) {
  emit('input-ready', element)
}
</script>
