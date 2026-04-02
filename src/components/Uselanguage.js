import { ref, computed } from 'vue'
import de from '../locales/de'
import en from '../locales/en'
import it from '../locales/it'
import ru from '../locales/ru'

const LANG_KEY = 'checkout_lang'

const currentLang = ref(localStorage.getItem(LANG_KEY) ?? 'de')

export const languages = [
  {
    code: 'de',
    label: 'Deutsch',
    flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/1280px-Flag_of_Germany.svg.png',
  },
  {
    code: 'en',
    label: 'English',
    flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg/1280px-Flag_of_the_United_Kingdom_%281-2%29.svg.png',
  },
  {
    code: 'it',
    label: 'Italiano',
    flag: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg',
  },
  {
    code: 'ru',
    label: 'Русский',
    flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/3840px-Flag_of_Russia.svg.png',
  },
]

export const translations = { de, en, it, ru }

export function useLanguage() {
  function setLanguage(code) {
    currentLang.value = code
    localStorage.setItem(LANG_KEY, code)
  }

  function t(key) {
    return translations[currentLang.value]?.[key] ?? translations['de']?.[key] ?? key
  }

  function tFn(key, ...args) {
    const val = translations[currentLang.value]?.[key] ?? translations['de']?.[key]
    if (typeof val === 'function') return val(...args)
    return val ?? key
  }

  const currentLanguage = computed(
    () => languages.find((l) => l.code === currentLang.value) ?? languages[0],
  )

  return { currentLang, languages, t, tFn, setLanguage, currentLanguage }
}