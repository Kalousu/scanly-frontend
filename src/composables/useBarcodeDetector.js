import { onBeforeUnmount, ref } from 'vue'

const defaultFormats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e']

export function useBarcodeDetector({
  formats = defaultFormats,
  intervalMs = 250,
  cooldown = 1500,
  onDetect,
  unsupportedMessage = 'Barcode-Scanning wird in diesem Browser nicht unterstützt.',
} = {}) {
  const barcodeSupported = ref(null)
  const barcodeError = ref('')

  let barcodeDetector = null
  let scanInterval = null
  let cooldownTimer = null
  let scanCooldown = false
  let activeVideoRef = null
  let activePredicate = null
  let visibilityListenerAttached = false

  function isDocumentHidden() {
    return typeof document !== 'undefined' && document.visibilityState === 'hidden'
  }

  function clearCooldown() {
    if (cooldownTimer) {
      window.clearTimeout(cooldownTimer)
      cooldownTimer = null
    }
    scanCooldown = false
  }

  function initBarcodeDetector() {
    if (!('BarcodeDetector' in window)) {
      barcodeSupported.value = false
      barcodeError.value = unsupportedMessage
      barcodeDetector = null
      return false
    }

    try {
      barcodeDetector = new BarcodeDetector({ formats })
      barcodeSupported.value = true
      barcodeError.value = ''
      return true
    } catch (error) {
      barcodeSupported.value = false
      barcodeError.value = error?.message || unsupportedMessage
      barcodeDetector = null
      return false
    }
  }

  function pauseDetection() {
    if (scanInterval) {
      window.clearInterval(scanInterval)
      scanInterval = null
    }
    clearCooldown()
  }

  function resumeDetection() {
    if (!activeVideoRef || !activePredicate || isDocumentHidden()) return
    startDetection(activeVideoRef, activePredicate)
  }

  function handleVisibilityChange() {
    if (isDocumentHidden()) {
      pauseDetection()
      return
    }
    resumeDetection()
  }

  function attachVisibilityListener() {
    if (visibilityListenerAttached || typeof document === 'undefined') return
    document.addEventListener('visibilitychange', handleVisibilityChange)
    visibilityListenerAttached = true
  }

  function detachVisibilityListener() {
    if (!visibilityListenerAttached || typeof document === 'undefined') return
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    visibilityListenerAttached = false
  }

  function startDetection(videoRef, isActive) {
    activeVideoRef = videoRef
    activePredicate = isActive
    if (scanInterval) return
    if (barcodeSupported.value === null) {
      initBarcodeDetector()
    }
    if (!barcodeDetector) return
    if (isDocumentHidden()) return

    attachVisibilityListener()

    scanInterval = window.setInterval(async () => {
      if (isDocumentHidden() || !isActive() || !videoRef.value || scanCooldown) return
      try {
        const video = videoRef.value
        if (video.readyState !== video.HAVE_ENOUGH_DATA) return
        const barcodes = await barcodeDetector.detect(video)
        if (barcodes.length > 0) {
          scanCooldown = true
          onDetect?.(barcodes[0].rawValue)
          cooldownTimer = window.setTimeout(() => {
            scanCooldown = false
            cooldownTimer = null
          }, cooldown)
        }
      } catch {
        // Individual frames can fail; keep scanning subsequent frames.
      }
    }, intervalMs)
  }

  function stopDetection() {
    pauseDetection()
    detachVisibilityListener()
    activeVideoRef = null
    activePredicate = null
  }

  onBeforeUnmount(stopDetection)

  return {
    barcodeSupported,
    barcodeError,
    initBarcodeDetector,
    startDetection,
    stopDetection,
  }
}
