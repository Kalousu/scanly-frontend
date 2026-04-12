import { ref } from 'vue'
import { ERROR_TOAST_DURATION_MS } from '../constants/timing.js'

export function useErrorToast(duration = ERROR_TOAST_DURATION_MS) {
  const errorMessage = ref('')
  let errorTimeout = null

  function showError(msg) {
    if (errorTimeout) clearTimeout(errorTimeout)
    errorMessage.value = msg
    errorTimeout = setTimeout(() => {
      errorMessage.value = ''
    }, duration)
  }

  function clearError() {
    if (errorTimeout) clearTimeout(errorTimeout)
    errorMessage.value = ''
  }

  return { errorMessage, showError, clearError }
}
