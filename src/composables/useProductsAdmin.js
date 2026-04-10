import { computed, ref } from 'vue'
import {
  createProduct,
  deleteProduct,
  fetchAllProducts,
  fetchProductByBarcode,
  updateProduct,
} from '@/services/api'
import { getProductBarcode } from '@/composables/useProductFormatters'

export const productActionCards = [
  { id: 'add', title: 'Produkt hinzufügen', description: 'Neues Produkt zum Katalog hinzufügen' },
  { id: 'edit', title: 'Produkt bearbeiten', description: 'Bestehende Produkte und Preise ändern' },
  { id: 'remove', title: 'Produkt entfernen', description: 'Produkte aus dem Katalog löschen' },
  { id: 'db', title: 'Produktdatenbank', description: 'Komplette Produktliste anzeigen und durchsuchen' },
]

export const productCategories = [
  { value: '', label: 'Kategorie wählen...' },
  { value: 'FRUITS_VEGETABLES', label: 'Obst/Gemüse' },
  { value: 'BAKERY', label: 'Backwaren' },
  { value: 'OTHERS', label: 'Others' },
]

export const productCategoryLabels = {
  FRUITS_VEGETABLES: 'Obst/Gemüse',
  BAKERY: 'Backwaren',
  OTHERS: 'Others',
}

export const productDatabaseCategories = [
  { value: 'ALL', label: 'Alle' },
  { value: 'FRUITS_VEGETABLES', label: 'Obst/Gemüse' },
  { value: 'BAKERY', label: 'Backwaren' },
  { value: 'OTHERS', label: 'Others' },
]

function getEmptyForm() {
  return { name: '', priceNet: '', taxRate: '0.19', category: '', ean: '' }
}

function toTaxRateSelect(taxRate) {
  const numericRate = Number(taxRate)
  if ([1.19, 19, 0.19].includes(numericRate)) return '0.19'
  if ([1.07, 7, 0.07].includes(numericRate)) return '0.07'
  if ([1, 0].includes(numericRate)) return '0.00'
  return '0.19'
}

export function useProductsAdmin() {
  const activeModal = ref(null)
  const searchQuery = ref('')
  const searchLoading = ref(false)
  const searchError = ref('')
  const foundProduct = ref(null)
  const form = ref(getEmptyForm())
  const actionState = ref({ loading: false, error: '', success: false })
  const showDatabase = ref(false)
  const allProducts = ref([])
  const dbLoading = ref(false)
  const dbError = ref('')
  const dbSearchQuery = ref('')
  const dbCategoryFilter = ref('ALL')

  const filteredProducts = computed(() => {
    let list = allProducts.value
    if (dbCategoryFilter.value !== 'ALL') {
      list = list.filter((product) => product.category === dbCategoryFilter.value)
    }

    const query = dbSearchQuery.value.trim().toLowerCase()
    if (!query) return list

    return list.filter((product) =>
      [product.name, product.code, product.ean, product.barcode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    )
  })

  const modalTitle = computed(() => {
    const titles = {
      add: 'Produkt hinzufügen',
      edit: 'Produkt bearbeiten',
      remove: 'Produkt entfernen',
    }
    return titles[activeModal.value] || ''
  })

  const priceLabel = computed(() =>
    form.value.category === 'FRUITS_VEGETABLES' ? 'Nettopreis pro Kilo (EUR)' : 'Nettopreis (EUR)',
  )

  const pricePlaceholder = computed(() =>
    form.value.category === 'FRUITS_VEGETABLES' ? '0.00 EUR/kg' : '0.00',
  )

  function resetAll() {
    form.value = getEmptyForm()
    searchQuery.value = ''
    searchLoading.value = false
    searchError.value = ''
    foundProduct.value = null
    actionState.value = { loading: false, error: '', success: false }
  }

  function openModal(type) {
    activeModal.value = type
    resetAll()
  }

  function closeModal() {
    activeModal.value = null
    resetAll()
  }

  async function loadAllProducts() {
    showDatabase.value = true
    dbLoading.value = true
    dbError.value = ''
    try {
      const data = await fetchAllProducts()
      allProducts.value = Array.isArray(data) ? data : data.products || data.content || []
    } catch {
      dbError.value = 'Fehler beim Laden der Produkte. Bitte versuche es erneut.'
    } finally {
      dbLoading.value = false
    }
  }

  function handleCardClick(cardId) {
    if (cardId === 'db') {
      loadAllProducts()
      return
    }
    openModal(cardId)
  }

  async function searchByBarcode() {
    const barcode = searchQuery.value.trim()
    if (!barcode) {
      searchError.value = 'Bitte eine EAN / Barcode eingeben.'
      return
    }

    searchLoading.value = true
    searchError.value = ''
    foundProduct.value = null
    form.value = getEmptyForm()

    try {
      const product = await fetchProductByBarcode(barcode)
      foundProduct.value = product
      form.value = {
        name: product.name || '',
        priceNet: product.priceNet ?? product.price ?? '',
        taxRate: toTaxRateSelect(product.taxRate ?? 19),
        category: product.category || '',
        ean: product.ean || product.barcode || barcode,
      }
    } catch (error) {
      searchError.value =
        error.response?.status === 404
          ? 'Kein Produkt mit dieser EAN gefunden.'
          : 'Fehler bei der Suche. Bitte versuche es erneut.'
    } finally {
      searchLoading.value = false
    }
  }

  function isFormValid() {
    return form.value.name && form.value.category && form.value.priceNet && form.value.ean
  }

  async function executeAction(apiCall, errorMessage) {
    actionState.value = { loading: true, error: '', success: false }
    try {
      await apiCall()
      actionState.value.success = true
      window.setTimeout(() => closeModal(), 1200)
    } catch {
      actionState.value.error = errorMessage
    } finally {
      actionState.value.loading = false
    }
  }

  function addProduct() {
    if (!isFormValid()) {
      actionState.value.error = 'Bitte alle Felder ausfüllen.'
      return
    }

    executeAction(
      () =>
        createProduct({
          name: form.value.name,
          category: form.value.category,
          price: Number(form.value.priceNet),
          taxRate: Number(form.value.taxRate),
          code: form.value.ean,
        }),
      'Fehler beim Hinzufügen des Produkts. Bitte versuche es erneut.',
    )
  }

  function editProduct() {
    if (!isFormValid()) {
      actionState.value.error = 'Bitte alle Felder ausfüllen.'
      return
    }

    const barcode = getProductBarcode(foundProduct.value, searchQuery.value)
    if (!barcode) {
      actionState.value.error = 'Kein Barcode vorhanden.'
      return
    }

    executeAction(
      () =>
        updateProduct(barcode, {
          name: form.value.name,
          code: form.value.ean,
          price: Number(form.value.priceNet),
          taxRate: Number(form.value.taxRate),
          productCategory: form.value.category,
        }),
      'Fehler beim Aktualisieren des Produkts. Bitte versuche es erneut.',
    )
  }

  function removeProduct() {
    const barcode = getProductBarcode(foundProduct.value, searchQuery.value)
    if (!barcode) {
      actionState.value.error = 'Kein Produkt ausgewählt.'
      return
    }

    executeAction(
      () => deleteProduct(barcode),
      'Fehler beim Entfernen des Produkts. Bitte versuche es erneut.',
    )
  }

  return {
    activeModal,
    searchQuery,
    searchLoading,
    searchError,
    foundProduct,
    form,
    actionState,
    showDatabase,
    dbLoading,
    dbError,
    dbSearchQuery,
    dbCategoryFilter,
    actionCards: productActionCards,
    categories: productCategories,
    categoryLabelMap: productCategoryLabels,
    dbCategories: productDatabaseCategories,
    filteredProducts,
    modalTitle,
    priceLabel,
    pricePlaceholder,
    handleCardClick,
    closeModal,
    loadAllProducts,
    searchByBarcode,
    addProduct,
    editProduct,
    removeProduct,
  }
}
