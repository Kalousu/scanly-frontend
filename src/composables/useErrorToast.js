import { ref } from 'vue'

/**
 * Composable for showing temporary error toast messages.
 * Provides reactive `errorMessage` ref and `showError(msg, duration?)` function.
 */
export function useErrorToast(duration = 3000) {
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