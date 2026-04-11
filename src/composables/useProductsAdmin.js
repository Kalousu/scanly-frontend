import { computed, ref } from 'vue'
import {
  createProduct,
  deleteProduct,
  fetchAllProducts,
  fetchProductByBarcode,
  updateProduct,
} from '@/services/api'
import { useLanguage } from '@/components/Uselanguage'
import { getProductBarcode } from '@/composables/useProductFormatters'
import { ADMIN_SUCCESS_MODAL_CLOSE_DELAY_MS } from '@/constants/timing'

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
  const { t } = useLanguage()

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

  const actionCards = computed(() => [
    { id: 'add', title: t('adminProductAdd'), description: t('adminProductAddDesc') },
    { id: 'edit', title: t('adminProductEdit'), description: t('adminProductEditDesc') },
    { id: 'remove', title: t('adminProductRemove'), description: t('adminProductRemoveDesc') },
    { id: 'db', title: t('adminProductDatabase'), description: t('adminProductDatabaseDesc') },
  ])

  const categories = computed(() => [
    { value: '', label: t('adminCategorySelect') },
    { value: 'FRUITS_VEGETABLES', label: t('adminCategoryFruits') },
    { value: 'BAKERY', label: t('adminCategoryBakery') },
    { value: 'OTHERS', label: t('adminCategoryOthers') },
  ])

  const categoryLabelMap = computed(() => ({
    FRUITS_VEGETABLES: t('adminCategoryFruits'),
    BAKERY: t('adminCategoryBakery'),
    OTHERS: t('adminCategoryOthers'),
  }))

  const dbCategories = computed(() => [
    { value: 'ALL', label: t('adminAll') },
    { value: 'FRUITS_VEGETABLES', label: t('adminCategoryFruits') },
    { value: 'BAKERY', label: t('adminCategoryBakery') },
    { value: 'OTHERS', label: t('adminCategoryOthers') },
  ])

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
      add: t('adminProductAdd'),
      edit: t('adminProductEdit'),
      remove: t('adminProductRemove'),
    }
    return titles[activeModal.value] || ''
  })

  const priceLabel = computed(() =>
    form.value.category === 'FRUITS_VEGETABLES' ? t('adminNetPriceKg') : t('adminNetPrice'),
  )

  const pricePlaceholder = computed(() =>
    form.value.category === 'FRUITS_VEGETABLES' ? t('adminPricePlaceholderKg') : t('adminPricePlaceholder'),
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
      dbError.value = t('adminProductLoadError')
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
      searchError.value = t('adminProductEanRequired')
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
          ? t('adminProductNotFound')
          : t('adminProductSearchError')
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
      window.setTimeout(() => closeModal(), ADMIN_SUCCESS_MODAL_CLOSE_DELAY_MS)
    } catch {
      actionState.value.error = errorMessage
    } finally {
      actionState.value.loading = false
    }
  }

  function addProduct() {
    if (!isFormValid()) {
      actionState.value.error = t('adminFillAllFields')
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
      t('adminProductAddError'),
    )
  }

  function editProduct() {
    if (!isFormValid()) {
      actionState.value.error = t('adminFillAllFields')
      return
    }

    const barcode = getProductBarcode(foundProduct.value, searchQuery.value)
    if (!barcode) {
      actionState.value.error = t('adminNoBarcode')
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
      t('adminProductUpdateError'),
    )
  }

  function removeProduct() {
    const barcode = getProductBarcode(foundProduct.value, searchQuery.value)
    if (!barcode) {
      actionState.value.error = t('adminNoProductSelected')
      return
    }

    executeAction(
      () => deleteProduct(barcode),
      t('adminProductDeleteError'),
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
    actionCards,
    categories,
    categoryLabelMap,
    dbCategories,
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
