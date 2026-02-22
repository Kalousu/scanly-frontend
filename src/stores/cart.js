import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const vatEnabled = ref(false)
  const vatRate = ref(19)
  const language = ref('de')

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

  function clearCart() {
    items.value.splice(0, items.value.length)
  }

  function uid() {
    return Math.random().toString(16).slice(2) + '-' + Date.now().toString(16)
  }

  return {
    items,
    vatEnabled,
    vatRate,
    language,
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
  }
})
