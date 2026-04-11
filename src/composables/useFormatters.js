import { useLanguage } from '@/components/Uselanguage'

// helpers for formatting prices, dates, tax rates etc
export function useFormatters() {
  const { currentLang } = useLanguage()

  // always german locale, used in admin views
  function formatCurrency(val) {
    const value = Number(val || 0)
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  // uses the customers selected language
  function formatPrice(n) {
    const value = Number(n || 0)
    const localeMap = { de: 'de-DE', it: 'it-IT', ru: 'ru-RU' }
    const locale = localeMap[currentLang.value] || 'en-US'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(value)
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-'
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
    const numericRate = Number(rate)

    if ([1.19, 19, 0.19].includes(numericRate)) return '19 %'
    if ([1.07, 7, 0.07].includes(numericRate)) return '7 %'
    if ([1, 0].includes(numericRate)) return '0 %'
    if (!Number.isFinite(numericRate)) return '-'

    const percent = numericRate > 1 ? numericRate - 1 : numericRate
    return `${Math.round(percent * 100)} %`
  }

  return { formatCurrency, formatPrice, formatDate, formatTaxRate }
}
