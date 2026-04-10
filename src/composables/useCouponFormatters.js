export function formatCouponDiscount(coupon) {
  const type = (coupon.type || '').toLowerCase()
  return type === 'percentage' ? `${coupon.value}%` : `${Number(coupon.value).toFixed(2)} EUR`
}

export function formatCouponType(coupon) {
  const type = (coupon.type || '').toLowerCase()
  return type === 'percentage' ? 'Prozent' : 'Fixbetrag'
}

export function formatAdminDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}
