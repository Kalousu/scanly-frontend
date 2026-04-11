import { ref } from 'vue'
import {
  addOrderItem,
  deleteOrder,
  deleteOrderItem,
  fetchOrder as fetchOrderRequest,
  updateOrderItemQuantity,
} from '@/services/api'
import { useLanguage } from '@/components/Uselanguage'

function getApiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || error.message || fallback
}

export function useOrderSession(cartStore, showError) {
  const { t, tFn } = useLanguage()
  const orderItems = ref([])
  const orderTotalPrice = ref(0)

  async function fetchOrder() {
    if (!cartStore.orderId) return
    try {
      const order = await fetchOrderRequest(cartStore.orderId)
      orderItems.value = order.orderItems || []
      orderTotalPrice.value = order.totalPrice || 0
    } catch (error) {
      showError(tFn('orderLoadError', getApiErrorMessage(error, t('unknownError'))))
    }
  }

  async function addItemByCode(code, amount = 1) {
    if (!cartStore.orderId) {
      showError(t('orderMissing'))
      return false
    }
    try {
      await addOrderItem(cartStore.orderId, code, amount)
      await fetchOrder()
      return true
    } catch (error) {
      showError(tFn('orderActionError', getApiErrorMessage(error, t('unknownError'))))
      return false
    }
  }

  async function updateItemQuantity(item, delta) {
    if (!cartStore.orderId) return
    try {
      await updateOrderItemQuantity(cartStore.orderId, item.id, delta)
      await fetchOrder()
    } catch (error) {
      showError(tFn('orderActionError', getApiErrorMessage(error, t('unknownError'))))
    }
  }

  async function removeItem(item) {
    if (!item || !cartStore.orderId) return
    try {
      await deleteOrderItem(cartStore.orderId, item.id)
      await fetchOrder()
    } catch (error) {
      showError(tFn('orderActionError', getApiErrorMessage(error, t('unknownError'))))
    }
  }

  async function cancelOrder() {
    try {
      if (cartStore.orderId) {
        await deleteOrder(cartStore.orderId)
      }
      return true
    } catch {
      showError(t('orderCancelBackendError'))
      return false
    }
  }

  return {
    orderItems,
    orderTotalPrice,
    fetchOrder,
    addItemByCode,
    updateItemQuantity,
    removeItem,
    cancelOrder,
  }
}
