import { checkoutOrder } from '@/services/api'

function getApiErrorMessage(error) {
  return error.response?.data?.message || error.response?.data?.error || error.message
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
  async function pay(onSuccess) {
    if (orderItems.value.length === 0) return false
    if (status.value === 'paying') return false
    if (!cartStore.orderId) {
      showError('Keine Order vorhanden')
      onMissingOrder?.()
      return false
    }

    status.value = 'paying'
    closeModal()
    syncPaymentSummary()

    try {
      await checkoutOrder(cartStore.orderId, 'Card')
      await printReceipt(cartStore.orderId)
      status.value = 'paid'
      await new Promise((resolve) => setTimeout(resolve, 900))
      onSuccess?.()
      return true
    } catch (error) {
      showError(`Checkout fehlgeschlagen: ${getApiErrorMessage(error)}`)
      status.value = 'idle'
      return false
    }
  }

  return { pay }
}
