import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useModalA11y(visibleRef, { initialFocusRef: providedInitialFocusRef } = {}) {
  const overlayRef = ref(null)
  const initialFocusRef = providedInitialFocusRef || ref(null)
  const titleId = `modal-title-${Math.random().toString(36).slice(2)}`
  let previouslyFocusedElement = null

  useBodyScrollLock(visibleRef)

  function getFocusableElements() {
    return [...(overlayRef.value?.querySelectorAll(FOCUSABLE_SELECTOR) || [])].filter(
      (element) => element.offsetParent !== null,
    )
  }

  function trapFocus(event) {
    if (event.key !== 'Tab' || !visibleRef.value) return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) {
      event.preventDefault()
      overlayRef.value?.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
      return
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  function removeTrapFocusListener() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', trapFocus)
    }
  }

  watch(
    visibleRef,
    async (visible) => {
      if (visible) {
        previouslyFocusedElement = typeof document === 'undefined' ? null : document.activeElement
        await nextTick()
        ;(initialFocusRef.value || overlayRef.value)?.focus()
        if (typeof document !== 'undefined') {
          document.addEventListener('keydown', trapFocus)
        }
        return
      }

      removeTrapFocusListener()
      await nextTick()
      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus()
      }
      previouslyFocusedElement = null
    },
    { flush: 'post' },
  )

  onBeforeUnmount(removeTrapFocusListener)

  return {
    overlayRef,
    initialFocusRef,
    titleId,
  }
}
