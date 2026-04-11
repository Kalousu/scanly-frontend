import { useLanguage } from '@/components/Uselanguage'
import { useFormatters } from '@/composables/useFormatters'

export function formatCouponDiscount(coupon) {
  const { formatCurrency } = useFormatters()
  const type = (coupon.type || '').toLowerCase()
  return type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value || 0)
}

export function formatCouponType(coupon) {
  const { t } = useLanguage()
  const type = (coupon.type || '').toLowerCase()
  return type === 'percentage' ? t('adminCouponTypePercentage') : t('adminCouponTypeFixed')
}

export function formatAdminDate(date) {
  const { formatDate } = useFormatters()
  return formatDate(date)
}
