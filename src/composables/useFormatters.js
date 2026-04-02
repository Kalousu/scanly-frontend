import { useLanguage } from '../components/Uselanguage'

// helpers for formatting prices, dates, tax rates etc
export function useFormatters() {
  const { currentLang } = useLanguage()

  // always german locale, used in admin views
  function formatCurrency(val) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(val)
  }

  // uses the customers selected language
  function formatPrice(n) {
    const localeMap = { de: 'de-DE', it: 'it-IT', ru: 'ru-RU' }
    const locale = localeMap[currentLang.value] || 'en-US'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(n)
  }

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