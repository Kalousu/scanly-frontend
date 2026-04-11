import { onBeforeUnmount, onMounted, ref } from 'vue'
import { KEYBOARD_SCANNER_BUFFER_TIMEOUT_MS } from '@/constants/timing'

export function useKeyboardBarcodeScanner({
  onScan,
  timeout = KEYBOARD_SCANNER_BUFFER_TIMEOUT_MS,
  isEnabled = () => true,
  allowInput = false,
}) {
  const scanBuffer = ref('')
  let scanTimer = null

  function clearBuffer() {
    scanBuffer.value = ''
    if (scanTimer) {
      window.clearTimeout(scanTimer)
      scanTimer = null
    }
  }

  function handleKeydown(event) {
    const tag = (event.target?.tagName || '').toLowerCase()

    if (!isEnabled(event)) return
    if (!allowInput && (tag === 'input' || tag === 'textarea')) return

    if (scanTimer) window.clearTimeout(scanTimer)

    if (event.key === 'Enter') {
      const code = scanBuffer.value.trim()
      clearBuffer()
      if (code) onScan(code)
      return
    }

    if (event.key.length === 1) {
      scanBuffer.value += event.key
      scanTimer = window.setTimeout(clearBuffer, timeout)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    clearBuffer()
  })

  return { scanBuffer, clearBuffer }
}
