import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fetchProductByBarcode = async (barcode) => {
  const response = await api.get(`/products/barcode/${barcode}`)
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
