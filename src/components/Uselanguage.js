import { ref, computed } from 'vue'
import de from '@/locales/de'
import en from '@/locales/en'
import it from '@/locales/it'
import ru from '@/locales/ru'
import flagDe from '@/assets/flags/de.svg'
import flagGb from '@/assets/flags/gb.svg'
import flagIt from '@/assets/flags/it.svg'
import flagRu from '@/assets/flags/ru.svg'

const LANG_KEY = 'checkout_lang'

function readStoredLanguage() {
  try {
    return localStorage.getItem(LANG_KEY)
  } catch {
    return null
  }
}

function writeStoredLanguage(code) {
  try {
    localStorage.setItem(LANG_KEY, code)
  } catch {
    void 0
  }
}

function resolveTranslation(key) {
  const active = translations[currentLang.value]
  const adminFallback = key.startsWith('admin') ? translations.en?.[key] : undefined
  return active?.[key] ?? adminFallback ?? translations.de?.[key] ?? key
}

const currentLang = ref(readStoredLanguage() ?? 'de')

export const languages = [
  {
    code: 'de',
    label: 'Deutsch',
    flag: flagDe,
  },
  {
    code: 'en',
    label: 'English',
    flag: flagGb,
  },
  {
    code: 'it',
    label: 'Italiano',
    flag: flagIt,
  },
  {
    code: 'ru',
    label: 'Русский',
    flag: flagRu,
  },
]

export const translations = { de, en, it, ru }

export function useLanguage() {
  function setLanguage(code) {
    currentLang.value = code
    writeStoredLanguage(code)
  }

  function t(key) {
    return resolveTranslation(key)
  }

  function tFn(key, ...args) {
    const val = resolveTranslation(key)
    if (typeof val === 'function') return val(...args)
    return val ?? key
  }

  const currentLanguage = computed(
    () => languages.find((l) => l.code === currentLang.value) ?? languages[0],
  )

  return { currentLang, languages, t, tFn, setLanguage, currentLanguage }
}
