import axios from 'axios'

const env = import.meta.env || {}
export const API_BASE_URL = env.VITE_API_BASE_URL || '/api'
export const API_TIMEOUT_MS = Number(env.VITE_API_TIMEOUT_MS || 10000)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
})

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 500

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  if (!config) return Promise.reject(error)

  config.__retryCount = config.__retryCount || 0
  const status = error.response?.status
  const isRetryable = !status || status === 502 || status === 503 || status === 504 || error.code === 'ECONNABORTED'

  if (config.__retryCount >= MAX_RETRIES || !isRetryable) {
    return Promise.reject(error)
  }

  config.__retryCount++
  const delay = RETRY_DELAY_MS * Math.pow(2, config.__retryCount - 1)
  await new Promise((resolve) => setTimeout(resolve, delay))
  return api(config)
})

export const fetchAllProducts = async () => {
  const response = await api.get('/products')
  return response.data
}

export const fetchProductByBarcode = async (barcode) => {
  const response = await api.get(`/products/barcode/${barcode}`)
  return response.data
}

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData)
  return response.data
}

export const updateProduct = async (barcode, productData) => {
  const response = await api.patch(`/products/barcode/${barcode}`, productData)
  return response.data
}

export const deleteProduct = async (barcode) => {
  const response = await api.delete(`/products/barcode/${barcode}`)
  return response.data
}

export const fetchBakeryProducts = async () => {
  const response = await api.get('/products/category/BAKERY')
  return response.data
}

export const fetchFruitsAndVegetables = async () => {
  const response = await api.get('/products/category/FRUITS_VEGETABLES')
  return response.data
}

export const fetchReceiptForOrder = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/receipt`)
  return response.data
}

export const createOrder = async () => {
  const response = await api.post('/orders')
  return response.data
}

export const fetchOrders = async () => {
  const response = await api.get('/orders')
  return response.data
}

export const fetchOrder = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`)
  return response.data
}

export const fetchOrderById = fetchOrder

export const addOrderItem = async (orderId, code, amount = 1) => {
  const response = await api.post(`/orders/${orderId}/items`, { code, amount })
  return response.data
}

export const updateOrderItemQuantity = async (orderId, itemId, delta) => {
  const response = await api.patch(`/orders/${orderId}/items/${itemId}`, { delta })
  return response.data
}

export const deleteOrderItem = async (orderId, itemId) => {
  const response = await api.delete(`/orders/${orderId}/items/${itemId}`)
  return response.data
}

export const deleteOrder = async (orderId) => {
  const response = await api.delete(`/orders/${orderId}`)
  return response.data
}

export const checkoutOrder = async (orderId, paymentMethod = 'Card') => {
  const response = await api.post(`/orders/${orderId}/checkout`, { paymentMethod })
  return response.data
}

export const fetchAllCoupons = async () => {
  const response = await api.get('/coupons')
  return response.data
}

export const validateCoupon = async (code, subtotal) => {
  const response = await api.get(`/coupons/validate/${encodeURIComponent(code)}`, {
    params: { subtotal },
  })
  return response.data
}

export const createCoupon = async (couponData) => {
  const response = await api.post('/coupons', couponData)
  return response.data
}

export const activateCoupon = async (couponId) => {
  const response = await api.patch(`/coupons/${couponId}/activate`)
  return response.data
}

export const deactivateCoupon = async (couponId) => {
  const response = await api.patch(`/coupons/${couponId}/deactivate`)
  return response.data
}

export default api
