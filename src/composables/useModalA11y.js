import { nextTick, ref, watch } from 'vue'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

export function useModalA11y(visibleRef, { initialFocusRef: providedInitialFocusRef } = {}) {
  const overlayRef = ref(null)
  const initialFocusRef = providedInitialFocusRef || ref(null)
  const titleId = `modal-title-${Math.random().toString(36).slice(2)}`
  let previouslyFocusedElement = null

  useBodyScrollLock(visibleRef)

  watch(
    visibleRef,
    async (visible) => {
      if (visible) {
        previouslyFocusedElement = typeof document === 'undefined' ? null : document.activeElement
        await nextTick()
        ;(initialFocusRef.value || overlayRef.value)?.focus()
        return
      }

      await nextTick()
      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus()
      }
      previouslyFocusedElement = null
    },
    { flush: 'post' },
  )

  return {
    overlayRef,
    initialFocusRef,
    titleId,
  }
}
