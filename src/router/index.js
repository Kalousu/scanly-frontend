import { createRouter, createWebHistory } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'

// customer goes landing, checkout, payback, payment, summary
// admin stuff lives under /admin
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresOrder: true },
    },
    {
      path: '/payback',
      name: 'payback',
      component: () => import('@/views/PaybackView.vue'),
      meta: { requiresOrder: true },
    },
    {
      path: '/payment',
      name: 'payment',
      component: () => import('@/views/PaymentView.vue'),
      meta: { requiresOrder: true },
    },
    {
      path: '/summary',
      name: 'summary',
      component: () => import('@/views/SummaryView.vue'),
      meta: { requiresOrder: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/revenue',
      name: 'admin-revenue',
      component: () => import('@/views/RevenueView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: () => import('@/views/ProductsView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/coupons',
      name: 'admin-coupons',
      component: () => import('@/views/CouponsView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin) {
    const settingsStore = useSettingsStore()
    if (!settingsStore.adminAuthenticated) return '/'
  }

  if (to.meta.requiresOrder) {
    const cartStore = useCartStore()
    if (!cartStore.orderId) return '/'
  }

  return true
})

export default router
