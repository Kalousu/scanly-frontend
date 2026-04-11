import { computed, ref } from 'vue'
import { validateCoupon } from '@/services/api'
import { useLanguage } from '@/components/Uselanguage'

function getCouponErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallback
  )
}

export function useCouponRedemption(cartStore, orderTotalPrice) {
  const { t, tFn } = useLanguage()
  const couponCode = ref('')
  const couponScanning = ref(false)
  const couponMessage = ref('')
  const couponMessageType = ref('')

  const appliedCoupon = computed(() => cartStore.appliedCoupon)
  const couponDiscount = computed(() => Number(appliedCoupon.value?.discount || 0))
  const payableTotal = computed(() =>
    Math.max(Number(orderTotalPrice.value || 0) - couponDiscount.value, 0),
  )

  function syncPaymentSummary() {
    cartStore.setPaymentSummary({
      subtotal: Number(orderTotalPrice.value || 0),
      discount: couponDiscount.value,
      total: payableTotal.value,
    })
  }

  function openCouponModal(modal) {
    couponCode.value = cartStore.appliedCoupon?.code || ''
    couponScanning.value = false
    couponMessage.value = cartStore.appliedCoupon
      ? tFn('couponAlreadyActive', cartStore.appliedCoupon.label)
      : ''
    couponMessageType.value = cartStore.appliedCoupon ? 'success' : ''
    modal.value = 'coupon'
  }

  function startCouponScan() {
    couponScanning.value = !couponScanning.value
    if (couponScanning.value) {
      couponCode.value = ''
      couponMessage.value = ''
    }
  }

  function stopCouponScan() {
    couponScanning.value = false
  }

  async function redeemCoupon() {
    const code = couponCode.value.trim().toUpperCase()
    if (!code) {
      couponMessage.value = t('couponCodeRequired')
      couponMessageType.value = 'error'
      return false
    }

    couponScanning.value = false

    try {
      const result = await validateCoupon(code, orderTotalPrice.value)
      couponCode.value = code
      couponMessage.value = result.message || tFn('couponActivated', code)
      couponMessageType.value = 'success'
      cartStore.applyCoupon({
        code,
        label: result.label || result.message || code,
        discount: result.discount ?? 0,
        ...result,
      })
      syncPaymentSummary()
      return true
    } catch (error) {
      couponCode.value = code
      couponMessage.value = getCouponErrorMessage(error, t('couponInvalid'))
      couponMessageType.value = 'error'
      cartStore.clearCoupon()
      syncPaymentSummary()
      return false
    }
  }

  async function refreshCouponAgainstCurrentOrderTotal() {
    if (!cartStore.appliedCoupon) {
      syncPaymentSummary()
      return
    }

    try {
      const result = await validateCoupon(cartStore.appliedCoupon.code, orderTotalPrice.value)
      cartStore.applyCoupon({
        code: cartStore.appliedCoupon.code,
        label: result.label || result.message || cartStore.appliedCoupon.code,
        discount: result.discount ?? 0,
        ...result,
      })
      syncPaymentSummary()
    } catch {
      cartStore.clearCoupon()
      couponMessage.value = t('couponRemovedConditions')
      couponMessageType.value = 'error'
      syncPaymentSummary()
    }
  }

  return {
    couponCode,
    couponScanning,
    couponMessage,
    couponMessageType,
    appliedCoupon,
    couponDiscount,
    payableTotal,
    openCouponModal,
    startCouponScan,
    stopCouponScan,
    redeemCoupon,
    refreshCouponAgainstCurrentOrderTotal,
    syncPaymentSummary,
  }
}
