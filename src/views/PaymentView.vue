<template>
  <div class="checkout-page payment-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <div class="layout">
      <CartPanel
        :items="orderItems"
        :total-price="payableTotal"
        :coupon-discount="couponDiscount"
        :applied-coupon="appliedCoupon"
        :editable="false"
        :show-scan-badge="false"
      />

      <main class="panel scan-panel">
        <KioskHeaderActions
          :t="t"
          @language="modal = 'lang'"
          @help="modal = 'help'"
        />

        <PaymentHeroStatus :status="status" :print-status="printStatus" :t="t" />

        <div class="flow-block">
          <PaymentActions
            :item-count="orderItems.length"
            :status="status"
            :t="t"
            @pay="pay"
            @coupon="onOpenCoupon"
            @cancel="showCancelConfirm = true"
          />
        </div>

        <div v-if="errorMessage" class="error-toast" role="alert">{{ errorMessage }}</div>

        <KioskHelpModal
          :visible="modal === 'help'"
          :items="helpPayment"
          :t="t"
          @close="closeModal"
        />

        <CouponModal
          :visible="modal === 'coupon'"
          :code="couponCode"
          :scanning="couponScanning"
          :message="couponMessage"
          :message-type="couponMessageType"
          @update:code="couponCode = $event"
          @redeem="redeemCoupon"
          @toggle-scan="startCouponScan"
          @close="closeModal"
        />

        <LanguageModal
          :visible="modal === 'lang'"
          :current-lang="currentLang"
          :languages="languages"
          :t="t"
          @select="selectLanguage"
          @close="closeModal"
        />
      </main>
    </div>

    <ConfirmDialog
      :visible="showCancelConfirm"
      :title="t('cancelOrderTitle')"
      :message="t('cancelOrderMessage')"
      :cancel-label="t('back')"
      :confirm-label="t('cancelOrderConfirm')"
      @cancel="showCancelConfirm = false"
      @confirm="confirmCancel"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useLanguage, translations as allTranslations } from '@/components/Uselanguage'
import CartPanel from '@/components/CartPanel.vue'
import LanguageModal from '@/components/LanguageModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import CouponModal from '@/components/CouponModal.vue'
import KioskHeaderActions from '@/components/kiosk/KioskHeaderActions.vue'
import KioskHelpModal from '@/components/kiosk/KioskHelpModal.vue'
import PaymentActions from '@/components/payment/PaymentActions.vue'
import PaymentHeroStatus from '@/components/payment/PaymentHeroStatus.vue'
import { useCouponRedemption } from '@/composables/useCouponRedemption'
import { useErrorToast } from '@/composables/useErrorToast'
import { useKeyboardBarcodeScanner } from '@/composables/useKeyboardBarcodeScanner'
import { useOrderSession } from '@/composables/useOrderSession'
import { usePaymentFlow } from '@/composables/usePaymentFlow'
import { useReceiptPrinter } from '@/composables/useReceiptPrinter'
import '@/assets/payment-flow.css'

const router = useRouter()
const cartStore = useCartStore()
const { currentLang, languages, t, setLanguage } = useLanguage()
const { errorMessage, showError } = useErrorToast()

const translationsLocal = allTranslations

const helpPayment = computed(() => {
  const items = translationsLocal[currentLang.value]?.helpPayment
  return items ?? translationsLocal.de.helpPayment
})

const status = ref('idle')
const modal = ref(null)
const showCancelConfirm = ref(false)

const { orderItems, orderTotalPrice, fetchOrder } = useOrderSession(cartStore, showError)

const {
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
} = useCouponRedemption(cartStore, orderTotalPrice)

const { printReceipt, printStatus } = useReceiptPrinter(showError)

function onOpenCoupon() {
  openCouponModal(modal)
}

function selectLanguage(code) {
  setLanguage(code)
  closeModal()
}

function onBarcodeScanned(code) {
  if (modal.value === 'coupon' && couponScanning.value) {
    couponCode.value = code
    couponScanning.value = false
    redeemCoupon()
  }
  status.value = 'idle'
}

function closeModal() {
  modal.value = null
  stopCouponScan()
}

function cancel() {
  if (status.value === 'paying') return
  closeModal()
  router.push('/checkout')
}

function confirmCancel() {
  showCancelConfirm.value = false
  cancel()
}

const { pay: payFlow } = usePaymentFlow({
  cartStore,
  orderItems,
  status,
  showError,
  closeModal,
  syncPaymentSummary,
  printReceipt,
  onMissingOrder: () => router.push('/'),
})

async function pay() {
  await payFlow(() => {
    router.push('/summary')
  })
}

useKeyboardBarcodeScanner({
  onScan: onBarcodeScanned,
  allowInput: true,
  isEnabled: (event) => {
    if (event.key === 'Escape' && modal.value) {
      closeModal()
      return false
    }
    return modal.value === 'coupon' && couponScanning.value
  },
})

onMounted(async () => {
  await fetchOrder()
  await refreshCouponAgainstCurrentOrderTotal()
})
</script>
