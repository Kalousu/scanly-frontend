import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const ORDER_ID_KEY = 'scanly-order-id'

function loadOrderId() {
  try {
    return sessionStorage.getItem(ORDER_ID_KEY)
  } catch {
    return null
  }
}

function saveOrderId(value) {
  try {
    if (value) {
      sessionStorage.setItem(ORDER_ID_KEY, String(value))
    } else {
      sessionStorage.removeItem(ORDER_ID_KEY)
    }
  } catch {
    /* ignore storage issues */
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const orderId = ref(loadOrderId())
  const vatEnabled = ref(false)
  const vatRate = ref(19)
  const language = ref('de')
  const appliedCoupon = ref(null)
  const paymentSummary = ref({
    subtotal: 0,
    discount: 0,
    total: 0,
  })

  const subtotal = computed(() => items.value.reduce((sum, line) => sum + line.price * line.qty, 0))

  const vatAmount = computed(() => {
    if (!vatEnabled.value) return 0
    return subtotal.value * (vatRate.value / 100)
  })

  const total = computed(() => subtotal.value + vatAmount.value)

  const itemCount = computed(() => items.value.reduce((sum, line) => sum + line.qty, 0))

  function addItem(item) {
    const existing = items.value.find((l) => l.sku === item.sku && l.unit !== 'kg')

    if (existing) {
      existing.qty += 1
      return
    }

    items.value.push({
      lineId: uid(),
      sku: item.sku,
      name: item.name,
      category: item.category,
      qty: 1,
      price: item.price,
      unit: item.unit || 'each',
    })
  }

  function addWeighted(item, kg) {
    items.value.push({
      lineId: uid(),
      sku: item.sku,
      name: item.name,
      category: item.category,
      qty: 1,
      price: item.price,
      unit: 'kg',
      meta: { kg },
    })
  }

  function removeLine(lineId) {
    const idx = items.value.findIndex((l) => l.lineId === lineId)
    if (idx >= 0) items.value.splice(idx, 1)
  }

  function inc(line) {
    line.qty += 1
  }

  function dec(line) {
    line.qty -= 1
    if (line.qty <= 0) removeLine(line.lineId)
  }

  function clearCart(options = {}) {
    items.value.splice(0, items.value.length)
    appliedCoupon.value = null
    paymentSummary.value = {
      subtotal: 0,
      discount: 0,
      total: 0,
    }

    if (options.clearOrder) {
      setOrderId(null)
    }
  }

  function setOrderId(id) {
    orderId.value = id ? String(id) : null
    saveOrderId(orderId.value)
  }

  function resetOrderSession() {
    clearCart({ clearOrder: true })
  }

  function applyCoupon(coupon) {
    appliedCoupon.value = coupon
  }

  function clearCoupon() {
    appliedCoupon.value = null
  }

  function setPaymentSummary(summary) {
    paymentSummary.value = {
      subtotal: Number(summary?.subtotal || 0),
      discount: Number(summary?.discount || 0),
      total: Number(summary?.total || 0),
    }
  }

  function uid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return Math.random().toString(16).slice(2) + '-' + Date.now().toString(16)
  }

  return {
    items,
    orderId,
    vatEnabled,
    vatRate,
    language,
    appliedCoupon,
    paymentSummary,
    subtotal,
    vatAmount,
    total,
    itemCount,
    addItem,
    addWeighted,
    removeLine,
    inc,
    dec,
    clearCart,
    setOrderId,
    resetOrderSession,
    applyCoupon,
    clearCoupon,
    setPaymentSummary,
  }
})
