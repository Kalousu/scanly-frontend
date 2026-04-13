export function toFiniteNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function calculateGrossUnitPrice(unitPriceNet, taxRate = 0) {
  const gross = toFiniteNumber(unitPriceNet) * (1 + toFiniteNumber(taxRate))
  return Math.round(gross * 100) / 100
}

export function calculateGrossLineTotal(item) {
  if (!item) return 0

  if (item.totalPriceGross !== null && item.totalPriceGross !== undefined) {
    return toFiniteNumber(item.totalPriceGross)
  }

  const unitPriceNet = item.unitPriceNet ?? item.priceNet ?? item.price ?? item.pricePerKg
  const amount = toFiniteNumber(item.amount ?? item.qty ?? item.meta?.kg, 1)
  const lineTotal = calculateGrossUnitPrice(unitPriceNet, item.taxRate) * amount
  return Math.round(lineTotal * 100) / 100
}

export function calculateNetLineTotal(item) {
  if (!item) return 0

  const unitPriceNet = item.unitPriceNet ?? item.priceNet ?? item.price ?? item.pricePerKg
  const amount = toFiniteNumber(item.amount ?? item.qty ?? item.meta?.kg, 1)
  return toFiniteNumber(unitPriceNet) * amount
}

export function calculateCouponAdjustedTotal(orderTotal, coupon) {
  if (coupon?.totalAfterDiscount !== null && coupon?.totalAfterDiscount !== undefined) {
    return Math.max(toFiniteNumber(coupon.totalAfterDiscount), 0)
  }

  return Math.max(toFiniteNumber(orderTotal) - toFiniteNumber(coupon?.discount), 0)
}
