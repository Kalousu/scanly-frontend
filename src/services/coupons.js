export const MOCK_COUPON_DEFINITIONS = [
  {
    code: 'SCANLY10',
    label: '10% Rabatt',
    type: 'percentage',
    value: 10,
    minOrderValue: 0,
  },
  {
    code: 'SAVE5',
    label: '5 EUR Rabatt ab 20 EUR',
    type: 'fixed',
    value: 5,
    minOrderValue: 20,
  },
  {
    code: 'WELCOME15',
    label: '15% Rabatt ab 30 EUR',
    type: 'percentage',
    value: 15,
    minOrderValue: 30,
  },
]

function roundToCents(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function normalizeCouponCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

function getCouponDefinition(code) {
  const normalizedCode = normalizeCouponCode(code)
  return MOCK_COUPON_DEFINITIONS.find((coupon) => coupon.code === normalizedCode) || null
}

export function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0

  const safeSubtotal = roundToCents(Math.max(Number(subtotal) || 0, 0))
  if (safeSubtotal <= 0) return 0

  if (coupon.type === 'percentage') {
    return roundToCents((safeSubtotal * coupon.value) / 100)
  }

  if (coupon.type === 'fixed') {
    return roundToCents(Math.min(coupon.value, safeSubtotal))
  }

  return 0
}

export function validateCouponForSubtotal(code, subtotal) {
  const normalizedCode = normalizeCouponCode(code)
  if (!normalizedCode) {
    return {
      ok: false,
      code: '',
      message: 'Bitte einen Coupon-Code eingeben.',
    }
  }

  const coupon = getCouponDefinition(normalizedCode)
  if (!coupon) {
    return {
      ok: false,
      code: normalizedCode,
      message: 'Coupon nicht gefunden oder nicht mehr gueltig.',
    }
  }

  const safeSubtotal = roundToCents(Math.max(Number(subtotal) || 0, 0))
  if (safeSubtotal < coupon.minOrderValue) {
    return {
      ok: false,
      code: normalizedCode,
      message: `Mindestbestellwert fuer diesen Coupon: ${coupon.minOrderValue.toFixed(2)} EUR.`,
    }
  }

  const discount = calculateCouponDiscount(coupon, safeSubtotal)

  return {
    ok: true,
    code: normalizedCode,
    coupon: {
      ...coupon,
      discount,
    },
    discount,
    totalAfterDiscount: roundToCents(Math.max(safeSubtotal - discount, 0)),
    message: `${coupon.label} aktiviert.`,
  }
}

export { normalizeCouponCode }
