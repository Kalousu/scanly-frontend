import { ref } from 'vue'
import { fetchBakeryProducts, fetchFruitsAndVegetables } from '@/services/api'

export function useProductCatalogPicker({ modal, showError }) {
  const produceCatalog = ref([])
  const produceLoading = ref(false)
  const selectedProduce = ref(null)
  const weightKg = ref(0.25)

  const bakeryCatalog = ref([])
  const bakeryLoading = ref(false)
  const selectedBakery = ref(null)
  const bakeryAmount = ref(1)

  function getLocalizedName(item, currentLang) {
    if (typeof item.name === 'object') {
      return item.name[currentLang] || item.name.de || Object.values(item.name)[0]
    }
    return item.name
  }

  function addWeighted(product) {
    selectedProduce.value = product
    weightKg.value = 0.25
  }

  function selectBakeryItem(item) {
    selectedBakery.value = item
    bakeryAmount.value = 1
  }

  async function openProduce() {
    modal.value = 'vegetables'
    selectedProduce.value = null
    weightKg.value = 0.25
    if (produceCatalog.value.length > 0) return

    produceLoading.value = true
    try {
      const products = await fetchFruitsAndVegetables()
      produceCatalog.value = products.map((product) => ({
        sku: product.code,
        name: product.name,
        pricePerKg: product.price,
        category: product.category,
      }))
    } catch {
      showError('Produkte konnten nicht geladen werden.')
    } finally {
      produceLoading.value = false
    }
  }

  async function openBakery() {
    modal.value = 'bakery'
    selectedBakery.value = null
    bakeryAmount.value = 1
    if (bakeryCatalog.value.length > 0) return

    bakeryLoading.value = true
    try {
      const products = await fetchBakeryProducts()
      bakeryCatalog.value = products.map((product) => ({
        sku: product.code,
        name: product.name,
        price: product.price,
        category: product.category,
      }))
    } catch {
      showError('Backwaren konnten nicht geladen werden.')
    } finally {
      bakeryLoading.value = false
    }
  }

  return {
    produceCatalog,
    produceLoading,
    selectedProduce,
    weightKg,
    bakeryCatalog,
    bakeryLoading,
    selectedBakery,
    bakeryAmount,
    getLocalizedName,
    addWeighted,
    selectBakeryItem,
    openProduce,
    openBakery,
  }
}
