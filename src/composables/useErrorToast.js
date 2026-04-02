import { ref } from 'vue'

// shows an error message that auto disappears after a few seconds
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