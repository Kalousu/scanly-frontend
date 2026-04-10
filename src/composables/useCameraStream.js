import { onBeforeUnmount, ref } from 'vue'

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
      if (!navigator.mediaDevices?.getUserMedia) {
        cameraNoDevice.value = true
        throw new Error(t('cameraNotAvailable'))
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
        cameraError.value = t('cameraPermissionDenied')
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        cameraNoDevice.value = true
        cameraError.value = t('cameraNotAvailable')
      } else {
        cameraError.value = error?.message || t('cameraNotAvailable')
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
