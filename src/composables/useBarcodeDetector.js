import { ref } from 'vue'

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
  let scanCooldown = false

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

  function startDetection(videoRef, isActive) {
    if (scanInterval) return
    if (barcodeSupported.value === null) {
      initBarcodeDetector()
    }
    if (!barcodeDetector) return

    scanInterval = window.setInterval(async () => {
      if (!isActive() || !videoRef.value || scanCooldown) return
      try {
        const video = videoRef.value
        if (video.readyState !== video.HAVE_ENOUGH_DATA) return
        const barcodes = await barcodeDetector.detect(video)
        if (barcodes.length > 0) {
          scanCooldown = true
          onDetect?.(barcodes[0].rawValue)
          window.setTimeout(() => {
            scanCooldown = false
          }, cooldown)
        }
      } catch {
        // Individual frames can fail; keep scanning subsequent frames.
      }
    }, intervalMs)
  }

  function stopDetection() {
    if (scanInterval) {
      window.clearInterval(scanInterval)
      scanInterval = null
    }
  }

  return {
    barcodeSupported,
    barcodeError,
    initBarcodeDetector,
    startDetection,
    stopDetection,
  }
}
