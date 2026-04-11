<template>
  <div class="checkout-page">
    <div class="bg-grid" aria-hidden="true"></div>

    <div class="layout">
      <CartPanel
        :items="orderItems"
        :total-price="orderTotalPrice"
        :editable="true"
        :show-scan-badge="true"
        @update-quantity="updateItemQuantity"
        @delete-item="(item) => confirmDeleteItem = item"
      />

      <main class="panel scan-panel">
        <CheckoutHeaderActions
          :vat-enabled="vatEnabled"
          :t="t"
          @language="modal = 'lang'"
          @help="modal = 'help'"
          @toggle-vat="vatEnabled = !vatEnabled"
        />

        <CheckoutHeroStatus :status="status" :t="t" />

        <div class="flow-block">
          <CheckoutScannerPanel
            ref="scannerPanelRef"
            :auto-start="settingsStore.cameraAutoStart"
            :cooldown="settingsStore.cameraCooldown"
            :t="t"
            @scan="onBarcodeScanned"
          />

          <CheckoutCategoryActions :t="t" @produce="openProduce" @bakery="openBakery" />

          <CheckoutFlowActions
            :item-count="orderItems.length"
            :status="status"
            :t="t"
            @cancel="showCancelConfirm = true"
            @pay="pay"
          />
        </div>

        <div v-if="errorMessage" class="error-toast" role="alert">{{ errorMessage }}</div>

        <ProductPickerModal
          :visible="modal === 'vegetables'"
          mode="vegetables"
          :catalog="produceCatalog"
          :loading="produceLoading"
          :selected="selectedProduce"
          :weight-kg="weightKg"
          :t="t"
          :get-item-name="getItemName"
          @select="addWeighted"
          @deselect="selectedProduce = null"
          @confirm="confirmWeighted"
          @update:weight-kg="weightKg = $event"
          @close="closeModal"
        />

        <ProductPickerModal
          :visible="modal === 'bakery'"
          mode="bakery"
          :catalog="bakeryCatalog"
          :loading="bakeryLoading"
          :selected="selectedBakery"
          :amount="bakeryAmount"
          :t="t"
          :get-item-name="getItemName"
          @select="selectBakeryItem"
          @deselect="selectedBakery = null"
          @confirm="confirmBakeryItem"
          @update:amount="bakeryAmount = $event"
          @close="closeModal"
        />

        <CheckoutHelpModal
          :visible="modal === 'help'"
          :items="helpItems"
          :t="t"
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

    <CheckoutConfirmDialogs
      :show-cancel-confirm="showCancelConfirm"
      :delete-item="confirmDeleteItem"
      :t="t"
      :t-fn="tFn"
      @cancel-order-dismiss="showCancelConfirm = false"
      @cancel-order-confirm="confirmCancel"
      @delete-item-dismiss="confirmDeleteItem = null"
      @delete-item-confirm="deleteItem"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'
import { useLanguage, translations as allTranslations } from '@/components/Uselanguage'
import CartPanel from '@/components/CartPanel.vue'
import LanguageModal from '@/components/LanguageModal.vue'
import ProductPickerModal from '@/components/ProductPickerModal.vue'
import CheckoutCategoryActions from '@/components/checkout/CheckoutCategoryActions.vue'
import CheckoutConfirmDialogs from '@/components/checkout/CheckoutConfirmDialogs.vue'
import CheckoutFlowActions from '@/components/checkout/CheckoutFlowActions.vue'
import CheckoutHeaderActions from '@/components/checkout/CheckoutHeaderActions.vue'
import CheckoutHelpModal from '@/components/checkout/CheckoutHelpModal.vue'
import CheckoutHeroStatus from '@/components/checkout/CheckoutHeroStatus.vue'
import CheckoutScannerPanel from '@/components/checkout/CheckoutScannerPanel.vue'
import { useErrorToast } from '@/composables/useErrorToast'
import { useKeyboardBarcodeScanner } from '@/composables/useKeyboardBarcodeScanner'
import { useOrderSession } from '@/composables/useOrderSession'
import { useProductCatalogPicker } from '@/composables/useProductCatalogPicker'
import '@/assets/checkout-flow.css'

const router = useRouter()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()
const { currentLang, languages, t, tFn, setLanguage } = useLanguage()

const { errorMessage, showError } = useErrorToast()

const translations_local = allTranslations

const helpItems = computed(() => {
  const items = translations_local[currentLang.value]?.helpItems
  return items ?? translations_local.de.helpItems
})

const status = ref('idle')
const modal = ref(null)
const vatEnabled = ref(false)
const confirmDeleteItem = ref(null)
const showCancelConfirm = ref(false)
const scannerPanelRef = ref(null)

const {
  orderItems,
  orderTotalPrice,
  fetchOrder,
  addItemByCode,
  updateItemQuantity,
  removeItem,
  cancelOrder,
} = useOrderSession(cartStore, showError)

const {
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
} = useProductCatalogPicker({ modal, showError })

function getItemName(item) {
  return getLocalizedName(item, currentLang.value)
}

async function confirmBakeryItem() {
  if (!selectedBakery.value) return
  const added = await addItemByCode(selectedBakery.value.sku, bakeryAmount.value)
  if (added) {
    selectedBakery.value = null
    bakeryAmount.value = 1
    closeModal()
  }
}

async function confirmWeighted() {
  if (!selectedProduce.value) return
  const kg = Number(weightKg.value)
  if (!Number.isFinite(kg) || kg <= 0) return
  const added = await addItemByCode(selectedProduce.value.sku, kg)
  if (added) {
    selectedProduce.value = null
    weightKg.value = 0.25
    closeModal()
  }
}

async function deleteItem() {
  await removeItem(confirmDeleteItem.value)
  confirmDeleteItem.value = null
}

async function onBarcodeScanned(code) {
  status.value = 'scanning'

  await addItemByCode(code, 1)
  status.value = 'idle'
}

function selectLanguage(code) {
  setLanguage(code)
  closeModal()
}
function closeModal() {
  modal.value = null
}

async function confirmCancel() {
  showCancelConfirm.value = false
  const cancelled = await cancelOrder()
  if (!cancelled) return
  cartStore.clearCart({ clearOrder: true })
  clearBuffer()
  scannerPanelRef.value?.stopCamera()
  closeModal()
  router.push('/')
}

async function pay() {
  if (orderItems.value.length === 0) return
  status.value = 'paying'
  closeModal()
  scannerPanelRef.value?.stopCamera()

  await new Promise((r) => setTimeout(r, 400))
  status.value = 'paid'
  await new Promise((r) => setTimeout(r, 400))

  status.value = 'idle'
  router.push(settingsStore.paybackEnabled ? '/payback' : '/payment')
}

function isCameraScannerActive() {
  const nativeScanning = scannerPanelRef.value?.isNativeScanning
  return nativeScanning?.value ?? Boolean(nativeScanning)
}

const { clearBuffer } = useKeyboardBarcodeScanner({
  timeout: settingsStore.scannerBuffer,
  onScan: onBarcodeScanned,
  isEnabled: (event) => {
    if (event.key === 'Escape' && modal.value) {
      closeModal()
      return false
    }
    return !modal.value && !isCameraScannerActive()
  },
})

onMounted(() => {
  fetchOrder()
})
</script>


