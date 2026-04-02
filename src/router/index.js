import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import AboutView from '../views/AboutView.vue'
import PaybackView from '../views/PaybackView.vue'
import PaymentView from '../views/PaymentView.vue'
import SummaryView from '../views/SummaryView.vue'
import AdminView from '../views/AdminView.vue'
import RevenueView from '../views/RevenueView.vue'
import OrdersView from '../views/OrdersView.vue'
import ProductsView from '../views/ProductsView.vue'
import SettingsView from '../views/SettingsView.vue'
import CouponsView from '../views/CouponsView.vue'

// customer goes landing, checkout, payback, payment, summary
// admin stuff lives under /admin
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/payback',
      name: 'payback',
      component: PaybackView,
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
    },
    {
      path: '/summary',
      name: 'SummaryView', 
      component: SummaryView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/admin/revenue',
      name: 'admin-revenue',
      component: RevenueView,
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: OrdersView,
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: ProductsView,
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: SettingsView,
    },
    {
      path: '/admin/coupons',
      name: 'admin-coupons',
      component: CouponsView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
  ],
})

export default router
