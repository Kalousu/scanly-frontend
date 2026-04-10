import { computed, ref } from 'vue'
import { fetchOrders } from '@/services/api'
import { useLanguage } from '@/components/Uselanguage'
import { getClosedOrders, normalizeOrdersResponse, sortOrdersNewestFirst, sumOrderRevenue } from '@/composables/useOrdersAdmin'

const chartColors = ['#00D4E8', '#6EF0B4', '#FFC83C', '#B4A0FF', '#FF6B8A', '#FF9F43']

function getLast30Days() {
  const days = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(day.getDate() - i)
    days.push(day.toISOString().slice(0, 10))
  }
  return days
}

function shortDateLabel(date) {
  const parts = date.split('-')
  return `${parts[2]}.${parts[1]}`
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100
}

function getRevenueErrorMessage(error) {
  return error.message || 'Unbekannter Fehler'
}

export function useRevenueAnalytics() {
  const { t } = useLanguage()

  const allOrders = ref([])
  const loading = ref(true)
  const error = ref(null)

  const closedOrders = computed(() => getClosedOrders(allOrders.value))
  const totalRevenue = computed(() => sumOrderRevenue(closedOrders.value))
  const avgOrderValue = computed(() =>
    closedOrders.value.length > 0 ? totalRevenue.value / closedOrders.value.length : 0,
  )

  const todayRevenue = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return sumOrderRevenue(closedOrders.value.filter((order) => (order.creationDate || '').startsWith(today)))
  })

  const recentOrders = computed(() => sortOrdersNewestFirst(closedOrders.value).slice(0, 10))

  const revenueKpis = computed(() => [
    { label: t('adminTotalRevenue'), value: totalRevenue.value, type: 'currency' },
    { label: t('adminClosedOrders'), value: closedOrders.value.length },
    { label: t('adminAvgOrderValue'), value: avgOrderValue.value, type: 'currency' },
    { label: t('adminRevenueToday'), value: todayRevenue.value, type: 'currency' },
  ])

  const dailyChartData = computed(() => {
    const days = getLast30Days()
    const revenueByDay = Object.fromEntries(days.map((day) => [day, 0]))

    closedOrders.value.forEach((order) => {
      const day = (order.creationDate || '').slice(0, 10)
      if (revenueByDay[day] !== undefined) {
        revenueByDay[day] += order.totalPrice || 0
      }
    })

    return {
      labels: days.map(shortDateLabel),
      datasets: [
        {
          label: t('adminRevenueEur'),
          data: days.map((day) => roundCurrency(revenueByDay[day])),
          backgroundColor: 'rgba(0, 212, 232, 0.35)',
          borderColor: '#00D4E8',
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(0, 212, 232, 0.55)',
        },
      ],
    }
  })

  const productChartData = computed(() => {
    const revenueByProduct = {}
    closedOrders.value.forEach((order) => {
      ;(order.orderItems || []).forEach((item) => {
        const name = item.productName || 'Unbekannt'
        revenueByProduct[name] = (revenueByProduct[name] || 0) + (item.totalPriceGross || 0)
      })
    })

    const sorted = Object.entries(revenueByProduct).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const labels = sorted.map(([name]) => name)

    return {
      labels,
      datasets: [
        {
          data: sorted.map(([, value]) => roundCurrency(value)),
          backgroundColor: chartColors.slice(0, labels.length),
          borderColor: 'rgba(7, 26, 42, 0.8)',
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    }
  })

  const ordersTrendData = computed(() => {
    const days = getLast30Days()
    const ordersByDay = Object.fromEntries(days.map((day) => [day, 0]))

    closedOrders.value.forEach((order) => {
      const day = (order.creationDate || '').slice(0, 10)
      if (ordersByDay[day] !== undefined) {
        ordersByDay[day] += 1
      }
    })

    return {
      labels: days.map(shortDateLabel),
      datasets: [
        {
          label: t('adminChartOrders'),
          data: days.map((day) => ordersByDay[day]),
          borderColor: '#6EF0B4',
          backgroundColor: 'rgba(110, 240, 180, 0.08)',
          pointBackgroundColor: '#6EF0B4',
          pointBorderColor: '#071A2A',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
        },
      ],
    }
  })

  async function loadOrders() {
    loading.value = true
    error.value = null
    try {
      allOrders.value = normalizeOrdersResponse(await fetchOrders())
    } catch (loadError) {
      error.value = getRevenueErrorMessage(loadError)
    } finally {
      loading.value = false
    }
  }

  return {
    allOrders,
    loading,
    error,
    closedOrders,
    totalRevenue,
    avgOrderValue,
    todayRevenue,
    recentOrders,
    revenueKpis,
    dailyChartData,
    productChartData,
    ordersTrendData,
    loadOrders,
  }
}
