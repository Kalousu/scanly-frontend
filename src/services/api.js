import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

export default api
