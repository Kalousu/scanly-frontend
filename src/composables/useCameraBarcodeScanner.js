import { onBeforeUnmount } from 'vue'
import { useBarcodeDetector } from '@/composables/useBarcodeDetector'
import { useCameraStream } from '@/composables/useCameraStream'
import { BARCODE_SCAN_COOLDOWN_MS } from '@/constants/timing'

export function useCameraBarcodeScanner({ t, onScan, cooldown = BARCODE_SCAN_COOLDOWN_MS }) {
  const {
    cameraActive,
    cameraLoading,
    cameraError,
    cameraNoDevice,
    videoRef,
    startStream,
    stopStream,
  } = useCameraStream({ t })

  const { barcodeSupported, initBarcodeDetector, startDetection, stopDetection } = useBarcodeDetector({
    cooldown,
    onDetect: onScan,
    unsupportedMessage: t('barcodeNotSupported'),
  })

  async function startCamera() {
    try {
      await startStream({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (barcodeSupported.value === null) {
        initBarcodeDetector()
      }

      if (barcodeSupported.value === true) {
        startDetection(videoRef, () => cameraActive.value)
      }
    } catch {
      stopDetection()
      stopStream()
    }
  }

  function stopCamera() {
    stopDetection()
    stopStream()
  }

  function toggleCamera() {
    if (cameraNoDevice.value) return
    if (cameraActive.value) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  onBeforeUnmount(stopCamera)

  return {
    cameraActive,
    cameraLoading,
    cameraError,
    cameraNoDevice,
    barcodeSupported,
    videoRef,
    startCamera,
    stopCamera,
    toggleCamera,
  }
}
