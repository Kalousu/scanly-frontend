import { computed, ref, watch } from 'vue'
import { fetchOrders } from '@/services/api'
import { useLanguage } from '@/components/Uselanguage'

export function normalizeOrdersResponse(data) {
  return Array.isArray(data) ? data : data.orders || data.content || []
}

export function isClosedOrder(order) {
  return (order.orderStatus || '').toUpperCase() === 'CLOSED'
}

export function isOpenOrder(order) {
  return (order.orderStatus || '').toUpperCase() === 'OPEN'
}

export function getClosedOrders(orders) {
  return orders.filter(isClosedOrder)
}

export function sumOrderRevenue(orders) {
  return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
}

export function sortOrdersNewestFirst(orders) {
  return [...orders].sort((a, b) => new Date(b.creationDate || 0) - new Date(a.creationDate || 0))
}

function getOrderErrorMessage(error, fallback) {
  return error.message || fallback
}

export function useOrdersAdmin({ pageSize = 15 } = {}) {
  const { t } = useLanguage()

  const allOrders = ref([])
  const loading = ref(true)
  const error = ref(null)
  const searchQuery = ref('')
  const activeFilter = ref('all')
  const currentPage = ref(1)
  const expandedOrderId = ref(null)

  const filters = computed(() => [
    { label: t('adminAll'), value: 'all' },
    { label: t('adminOpen'), value: 'OPEN' },
    { label: t('adminClosed'), value: 'CLOSED' },
  ])

  const openOrders = computed(() => allOrders.value.filter(isOpenOrder))
  const closedOrders = computed(() => getClosedOrders(allOrders.value))
  const closedRevenue = computed(() => sumOrderRevenue(closedOrders.value))

  const orderKpis = computed(() => [
    { label: t('adminTotal'), value: allOrders.value.length },
    { label: t('adminOpen'), value: openOrders.value.length },
    { label: t('adminClosed'), value: closedOrders.value.length },
    { label: t('adminRevenuKpi'), value: closedRevenue.value },
  ])

  const filteredOrders = computed(() => {
    let result = [...allOrders.value]

    if (activeFilter.value !== 'all') {
      result = result.filter((order) => (order.orderStatus || '').toUpperCase() === activeFilter.value)
    }

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      result = result.filter((order) => {
        const idMatch = String(order.orderId).includes(query)
        const productMatch = (order.orderItems || []).some((item) =>
          (item.productName || '').toLowerCase().includes(query),
        )
        return idMatch || productMatch
      })
    }

    return sortOrdersNewestFirst(result)
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / pageSize)))

  const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredOrders.value.slice(start, start + pageSize)
  })

  const expandedOrder = computed(() => {
    if (!expandedOrderId.value) return null
    return allOrders.value.find((order) => order.orderId === expandedOrderId.value) || null
  })

  watch([activeFilter, searchQuery], () => {
    currentPage.value = 1
  })

  function toggleExpand(orderId) {
    expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
  }

  async function loadOrders() {
    loading.value = true
    error.value = null
    try {
      allOrders.value = normalizeOrdersResponse(await fetchOrders())
    } catch (loadError) {
      error.value = getOrderErrorMessage(loadError, t('unknownError'))
    } finally {
      loading.value = false
    }
  }

  return {
    allOrders,
    loading,
    error,
    searchQuery,
    activeFilter,
    currentPage,
    expandedOrderId,
    filters,
    openOrders,
    closedOrders,
    closedRevenue,
    orderKpis,
    filteredOrders,
    totalPages,
    paginatedOrders,
    expandedOrder,
    toggleExpand,
    loadOrders,
  }
}
