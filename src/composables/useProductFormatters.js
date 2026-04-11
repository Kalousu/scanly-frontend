import { useFormatters } from '@/composables/useFormatters'

export function formatProductTaxRate(rate) {
  const { formatTaxRate } = useFormatters()
  return formatTaxRate(rate)
}

export function getProductBarcode(product, fallback = '') {
  return product?.ean || product?.barcode || product?.code || fallback.trim()
}

export function formatProductPrice(product) {
  const { formatCurrency } = useFormatters()
  const price = formatCurrency(product.price ?? product.priceNet ?? 0)
  const suffix = product.category === 'FRUITS_VEGETABLES' ? '/kg' : ''
  return `${price}${suffix}`
}
