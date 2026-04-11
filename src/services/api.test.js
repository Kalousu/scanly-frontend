import test from 'node:test'
import assert from 'node:assert/strict'
import api, {
  API_BASE_URL,
  API_TIMEOUT_MS,
  activateCoupon,
  addOrderItem,
  checkoutOrder,
  createCoupon,
  createOrder,
  createProduct,
  deactivateCoupon,
  deleteOrder,
  deleteOrderItem,
  deleteProduct,
  fetchAllCoupons,
  fetchAllProducts,
  fetchBakeryProducts,
  fetchFruitsAndVegetables,
  fetchOrder,
  fetchOrderById,
  fetchOrders,
  fetchProductByBarcode,
  fetchReceiptForOrder,
  updateOrderItemQuantity,
  updateProduct,
  validateCoupon,
} from './api.js'

function requestSnapshot(config) {
  const snapshot = {
    method: config.method,
    url: config.url,
  }

  if (config.params !== undefined) {
    snapshot.params = config.params
  }

  if (config.data !== undefined) {
    snapshot.body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
  }

  return snapshot
}

function createMockAdapter() {
  return async (config) => ({
    data: requestSnapshot(config),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
}

test('api uses release-safe defaults', () => {
  assert.equal(API_BASE_URL, '/api')
  assert.equal(API_TIMEOUT_MS, 10000)
  assert.equal(api.defaults.baseURL, '/api')
  assert.equal(api.defaults.timeout, 10000)
})

test('api sends json requests by default', () => {
  assert.equal(api.defaults.headers.common.Accept, 'application/json, text/plain, */*')
  assert.equal(api.defaults.headers['Content-Type'], 'application/json')
})

test('product service functions call the expected endpoints', async () => {
  const previousAdapter = api.defaults.adapter
  api.defaults.adapter = createMockAdapter()

  try {
    assert.deepEqual(await fetchAllProducts(), { method: 'get', url: '/products' })
    assert.deepEqual(await fetchProductByBarcode('123'), { method: 'get', url: '/products/barcode/123' })
    assert.deepEqual(await createProduct({ code: '123' }), {
      method: 'post',
      url: '/products',
      body: { code: '123' },
    })
    assert.deepEqual(await updateProduct('123', { name: 'Milk' }), {
      method: 'patch',
      url: '/products/barcode/123',
      body: { name: 'Milk' },
    })
    assert.deepEqual(await deleteProduct('123'), { method: 'delete', url: '/products/barcode/123' })
    assert.deepEqual(await fetchBakeryProducts(), { method: 'get', url: '/products/category/BAKERY' })
    assert.deepEqual(await fetchFruitsAndVegetables(), {
      method: 'get',
      url: '/products/category/FRUITS_VEGETABLES',
    })
  } finally {
    api.defaults.adapter = previousAdapter
  }
})

test('order service functions call the expected endpoints', async () => {
  const previousAdapter = api.defaults.adapter
  api.defaults.adapter = createMockAdapter()

  try {
    assert.deepEqual(await fetchReceiptForOrder('o1'), { method: 'get', url: '/orders/o1/receipt' })
    assert.deepEqual(await createOrder(), { method: 'post', url: '/orders' })
    assert.deepEqual(await fetchOrders(), { method: 'get', url: '/orders' })
    assert.deepEqual(await fetchOrder('o1'), { method: 'get', url: '/orders/o1' })
    assert.equal(fetchOrderById, fetchOrder)
    assert.deepEqual(await addOrderItem('o1', '400', 2), {
      method: 'post',
      url: '/orders/o1/items',
      body: { code: '400', amount: 2 },
    })
    assert.deepEqual(await updateOrderItemQuantity('o1', 'i1', -1), {
      method: 'patch',
      url: '/orders/o1/items/i1',
      body: { delta: -1 },
    })
    assert.deepEqual(await deleteOrderItem('o1', 'i1'), { method: 'delete', url: '/orders/o1/items/i1' })
    assert.deepEqual(await deleteOrder('o1'), { method: 'delete', url: '/orders/o1' })
    assert.deepEqual(await checkoutOrder('o1', 'Card'), {
      method: 'post',
      url: '/orders/o1/checkout',
      body: { paymentMethod: 'Card' },
    })
  } finally {
    api.defaults.adapter = previousAdapter
  }
})

test('coupon service functions call the expected endpoints', async () => {
  const previousAdapter = api.defaults.adapter
  api.defaults.adapter = createMockAdapter()

  try {
    assert.deepEqual(await fetchAllCoupons(), { method: 'get', url: '/coupons' })
    assert.deepEqual(await validateCoupon('SAVE 10', 12.5), {
      method: 'get',
      url: '/coupons/validate/SAVE%2010',
      params: { subtotal: 12.5 },
    })
    assert.deepEqual(await createCoupon({ code: 'SAVE10' }), {
      method: 'post',
      url: '/coupons',
      body: { code: 'SAVE10' },
    })
    assert.deepEqual(await activateCoupon('c1'), { method: 'patch', url: '/coupons/c1/activate' })
    assert.deepEqual(await deactivateCoupon('c1'), { method: 'patch', url: '/coupons/c1/deactivate' })
  } finally {
    api.defaults.adapter = previousAdapter
  }
})
