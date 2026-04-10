export function formatProductTaxRate(rate) {
  const numericRate = Number(rate)
  if ([1.19, 19, 0.19].includes(numericRate)) return '19 %'
  if ([1.07, 7, 0.07].includes(numericRate)) return '7 %'
  if ([1, 0].includes(numericRate)) return '0 %'
  return String(rate ?? '-')
}

export function getProductBarcode(product, fallback = '') {
  return product?.ean || product?.barcode || product?.code || fallback.trim()
}

export function formatProductPrice(product) {
  const price = Number(product.price ?? product.priceNet ?? 0).toFixed(2)
  const suffix = product.category === 'FRUITS_VEGETABLES' ? '/kg' : ''
  return `${price} EUR${suffix}`
}
