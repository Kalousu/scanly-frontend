import { watch, onUnmounted } from 'vue'

let lockCount = 0
let previousOverflow = ''

export function useBodyScrollLock(isLocked) {
  let lockedByInstance = false

  function lock() {
    if (lockedByInstance) return

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }

    lockCount += 1
    lockedByInstance = true
  }

  function unlock() {
    if (!lockedByInstance) return

    lockCount = Math.max(0, lockCount - 1)
    lockedByInstance = false

    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow
      previousOverflow = ''
    }
  }

  watch(isLocked, (locked) => {
    if (locked) lock()
    else unlock()
  }, { immediate: true })

  onUnmounted(() => {
    unlock()
  })
}
