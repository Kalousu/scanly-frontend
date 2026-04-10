import { computed, ref } from 'vue'
import { activateCoupon, createCoupon, deactivateCoupon, fetchAllCoupons } from '@/services/api'

export const couponStatusOptions = [
  { value: 'ALL', label: 'Alle' },
  { value: 'ACTIVE', label: 'Aktiv' },
  { value: 'INACTIVE', label: 'Inaktiv' },
]

function getEmptyForm() {
  return {
    code: '',
    label: '',
    type: 'percentage',
    value: 10,
    minOrderValue: 0,
  }
}

function getApiErrorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback
}

export function useCouponsAdmin() {
  const coupons = ref([])
  const loading = ref(false)
  const activeModal = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('ALL')
  const saveMessage = ref('')
  const formError = ref('')
  const form = ref(getEmptyForm())

  const filteredCoupons = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return coupons.value.filter((coupon) => {
      const matchesStatus =
        statusFilter.value === 'ALL' ||
        (statusFilter.value === 'ACTIVE' ? coupon.active : !coupon.active)

      const matchesQuery =
        !query ||
        [coupon.code, coupon.label, coupon.type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))

      return matchesStatus && matchesQuery
    })
  })

  const couponKpis = computed(() => {
    const activeCount = coupons.value.filter((coupon) => coupon.active).length
    const percentageCount = coupons.value.filter((coupon) =>
      ['percentage', 'PERCENTAGE'].includes(coupon.type),
    ).length

    return [
      { label: 'Coupons gesamt', value: coupons.value.length },
      { label: 'Aktiv', value: activeCount },
      { label: 'Prozentual', value: percentageCount },
    ]
  })

  function resetForm() {
    form.value = getEmptyForm()
    formError.value = ''
  }

  function openCreateModal() {
    resetForm()
    activeModal.value = true
  }

  function closeModal() {
    activeModal.value = false
    resetForm()
  }

  function showSavedMessage(text) {
    saveMessage.value = text
    window.setTimeout(() => {
      if (saveMessage.value === text) {
        saveMessage.value = ''
      }
    }, 2200)
  }

  function validateForm() {
    const code = (form.value.code || '').trim().toUpperCase()

    if (!code || !form.value.label.trim()) {
      formError.value = 'Bitte Code und Bezeichnung ausfüllen.'
      return false
    }

    if (!Number.isFinite(Number(form.value.value)) || Number(form.value.value) <= 0) {
      formError.value = 'Der Rabattwert muss größer als 0 sein.'
      return false
    }

    formError.value = ''
    return true
  }

  async function loadCoupons() {
    loading.value = true
    try {
      const data = await fetchAllCoupons()
      coupons.value = Array.isArray(data) ? data : []
    } catch {
      coupons.value = []
      showSavedMessage('Coupons konnten nicht geladen werden.')
    } finally {
      loading.value = false
    }
  }

  async function saveCoupon() {
    if (!validateForm()) return

    const payload = {
      code: form.value.code.trim().toUpperCase(),
      label: form.value.label.trim(),
      type: form.value.type.toUpperCase(),
      value: Number(form.value.value),
      minOrderValue: Number(form.value.minOrderValue || 0),
    }

    try {
      await createCoupon(payload)
      showSavedMessage(`Coupon ${payload.code} angelegt.`)
      closeModal()
      await loadCoupons()
    } catch (error) {
      formError.value = getApiErrorMessage(error, 'Fehler beim Anlegen des Coupons.')
    }
  }

  async function toggleCouponStatus(coupon) {
    try {
      if (coupon.active) {
        await deactivateCoupon(coupon.id)
        showSavedMessage(`Coupon ${coupon.code} deaktiviert.`)
      } else {
        await activateCoupon(coupon.id)
        showSavedMessage(`Coupon ${coupon.code} aktiviert.`)
      }
      await loadCoupons()
    } catch (error) {
      showSavedMessage(getApiErrorMessage(error, 'Fehler beim Ändern des Coupon-Status.'))
    }
  }

  return {
    coupons,
    loading,
    activeModal,
    searchQuery,
    statusFilter,
    saveMessage,
    formError,
    form,
    statusOptions: couponStatusOptions,
    filteredCoupons,
    couponKpis,
    openCreateModal,
    closeModal,
    loadCoupons,
    saveCoupon,
    toggleCouponStatus,
  }
}
