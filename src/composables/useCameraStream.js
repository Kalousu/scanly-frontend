import { onBeforeUnmount, ref } from 'vue'

function isLocalhost() {
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

function translate(t, key, fallback) {
  const value = t(key)
  return value === key ? fallback : value
}

export function useCameraStream({ t = (key) => key } = {}) {
  const cameraActive = ref(false)
  const cameraLoading = ref(false)
  const cameraError = ref('')
  const cameraNoDevice = ref(false)
  const videoRef = ref(null)

  let mediaStream = null

  async function startStream(constraints = { video: { facingMode: 'environment' }, audio: false }) {
    cameraLoading.value = true
    cameraError.value = ''
    cameraNoDevice.value = false

    try {
      if (!window.isSecureContext && !isLocalhost()) {
        cameraNoDevice.value = true
        throw new Error(
          translate(
            t,
            'cameraSecureContextRequired',
            'Kamera ist nur über HTTPS oder localhost verfügbar.',
          ),
        )
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        cameraNoDevice.value = true
        throw new Error(translate(t, 'cameraBrowserUnsupported', 'Dieser Browser unterstützt keine Kamerafunktion.'))
      }

      mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
        await videoRef.value.play?.()
      }

      cameraActive.value = true
      return mediaStream
    } catch (error) {
      cameraActive.value = false

      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        cameraError.value = translate(t, 'cameraPermissionDenied', 'Kamera-Zugriff verweigert.')
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        cameraNoDevice.value = true
        cameraError.value = translate(t, 'cameraNotAvailable', 'Keine Kamera erkannt.')
      } else if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
        cameraError.value = translate(
          t,
          'cameraBusy',
          'Kamera konnte nicht gestartet werden. Sie wird eventuell bereits verwendet.',
        )
      } else if (error?.name === 'OverconstrainedError') {
        cameraError.value = translate(t, 'cameraConstraintsUnsupported', 'Die Kamera unterstützt die gewünschte Einstellung nicht.')
      } else {
        cameraError.value = error?.message || translate(t, 'cameraNotAvailable', 'Keine Kamera erkannt.')
      }

      throw error
    } finally {
      cameraLoading.value = false
    }
  }

  function stopStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      mediaStream = null
    }
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    cameraActive.value = false
  }

  onBeforeUnmount(stopStream)

  return {
    cameraActive,
    cameraLoading,
    cameraError,
    cameraNoDevice,
    videoRef,
    startStream,
    stopStream,
  }
}
