import { useLanguage } from '../components/Uselanguage'

const DEFAULT_CURRENCY = 'EUR'
const LOCALE_MAP = {
  de: 'de-DE',
  en: 'en-US',
  it: 'it-IT',
  ru: 'ru-RU',
}

export function useFormatters() {
  const { currentLang } = useLanguage()

  function currentLocale() {
    return LOCALE_MAP[currentLang.value] || LOCALE_MAP.en
  }

  function formatCurrency(val, currency = DEFAULT_CURRENCY) {
    return new Intl.NumberFormat(currentLocale(), {
      style: 'currency',
      currency,
    }).format(Number(val || 0))
  }

  function formatPrice(n, currency = DEFAULT_CURRENCY) {
    return formatCurrency(n, currency)
  }

  function formatReceiptAmount(n) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(Number(n || 0))
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString(currentLocale(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatTaxRate(rate) {
    const numericRate = Number(rate)
    const percentage = numericRate <= 1 ? numericRate * 100 : (numericRate - 1) * 100
    const map = {
      1.19: '19 %',
      1.07: '7 %',
      1.0: '0 %',
      0.19: '19 %',
      0.07: '7 %',
      0.0: '0 %',
    }
    return map[numericRate] ?? `${Math.round(percentage)} %`
  }

  return { formatCurrency, formatPrice, formatReceiptAmount, formatDate, formatTaxRate }
}
