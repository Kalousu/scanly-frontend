import { useLanguage } from '../components/Uselanguage'

/**
 * Composable for shared formatting utilities.
 *
 * - formatCurrency: Always German locale (admin views)
 * - formatPrice: Locale-aware based on current language (customer views)
 * - formatDate: German locale date + time
 * - formatTaxRate: Tax rate label from numeric value
 */
export function useFormatters() {
  const { currentLang } = useLanguage()

  /**
   * Format a value as EUR currency in German locale.
   * Used in admin views (Orders, Revenue).
   */
  function formatCurrency(val) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(val)
  }

  /**
   * Format a value as EUR currency using the customer's selected language.
   * Used in customer-facing views (Checkout, Payment).
   */
  function formatPrice(n) {
    const localeMap = { de: 'de-DE', it: 'it-IT', ru: 'ru-RU' }
    const locale = localeMap[currentLang.value] || 'en-US'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(n)
  }

  /**
   * Format an ISO date string as German locale date + time.
   */
  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Map a numeric tax rate to a display label.
   */
  function formatTaxRate(rate) {
    const map = {
      1.19: '19 %',
      1.07: '7 %',
      1.0: '0 %',
      1: '0 %',
    }
    return map[rate] ?? `${Math.round((rate - 1) * 100)} %`
  }

  return { formatCurrency, formatPrice, formatDate, formatTaxRate }
}