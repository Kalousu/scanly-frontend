import { checkoutOrder } from '@/services/api'
import { useLanguage } from '@/components/Uselanguage'
import { PAYMENT_SUCCESS_REDIRECT_DELAY_MS } from '@/constants/timing'

function getApiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || error.message || fallback
}

export function usePaymentFlow({
  cartStore,
  orderItems,
  status,
  showError,
  closeModal,
  syncPaymentSummary,
  printReceipt,
  onMissingOrder,
}) {
  const { t, tFn } = useLanguage()

  async function pay(onSuccess) {
    if (orderItems.value.length === 0) return false
    if (status.value === 'paying') return false
    if (!cartStore.orderId) {
      showError(t('orderMissing'))
      onMissingOrder?.()
      return false
    }

    status.value = 'paying'
    closeModal()
    syncPaymentSummary()

    try {
      await checkoutOrder(cartStore.orderId, 'Card')
      const printed = await printReceipt(cartStore.orderId)
      if (!printed) {
        status.value = 'idle'
        return false
      }
      status.value = 'paid'
      await new Promise((resolve) => setTimeout(resolve, PAYMENT_SUCCESS_REDIRECT_DELAY_MS))
      onSuccess?.()
      return true
    } catch (error) {
      showError(tFn('checkoutFailed', getApiErrorMessage(error, t('unknownError'))))
      status.value = 'idle'
      return false
    }
  }

  return { pay }
}
