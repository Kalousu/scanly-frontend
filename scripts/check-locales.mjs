import { readFileSync } from 'node:fs'

const files = {
  de: 'src/locales/de.js',
  en: 'src/locales/en.js',
  it: 'src/locales/it.js',
  ru: 'src/locales/ru.js',
}

function readKeys(file) {
  const source = readFileSync(file, 'utf8')
  return [...source.matchAll(/^\s*([A-Za-z0-9_]+):/gm)].map((match) => match[1])
}

const keysByLang = Object.fromEntries(
  Object.entries(files).map(([lang, file]) => [lang, new Set(readKeys(file))]),
)

const deKeys = keysByLang.de
const enKeys = keysByLang.en
const baseKeys = [...deKeys].filter((key) => !key.startsWith('admin'))

const enMissing = [...deKeys].filter((key) => !enKeys.has(key))
if (enMissing.length > 0) {
  throw new Error(`English locale is missing keys:\n${enMissing.join('\n')}`)
}

for (const lang of ['it', 'ru']) {
  const missingBaseKeys = baseKeys.filter((key) => !keysByLang[lang].has(key))

  if (missingBaseKeys.length > 0) {
    throw new Error(`${lang} locale is missing customer-facing keys:\n${missingBaseKeys.join('\n')}`)
  }
}

console.log('Locale check passed: DE/EN complete, IT/RU customer flows complete, admin fallback is EN.')
