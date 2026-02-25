import { ref, computed } from 'vue'

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

export const translations = {
  de: {
    help: 'Hilfe',
    welcomePrefix: 'Bereit zum',
    welcomeAccent: 'Scannen?',
    instruction: 'Einfach Scannen. Das ist Scanly.',
    start: 'Start',
    helpModalTitle: 'Über Scanly',
    helpModalBody:
      'Scanly ist Ihr persönlicher Self-Checkout-Assistent. Scannen Sie Ihre Artikel einfach selbst, legen Sie sie in Ihre Tasche und bezahlen Sie – ganz ohne Kassenschlange.',
    helpSteps: [
      'Artikel mit dem Scanner erfassen',
      'Artikel in die Tasche legen',
      'Kassenbon drucken & bezahlen',
    ],
    helpModalCta: 'Verstanden',
    close: 'Schließen',

    emptyTitle: 'Noch keine Artikel gescannt',
    emptyHint: 'Scanne ein Produkt, um es hier anzuzeigen.',
    cartTitle: 'Warenkorb',
    scanActive: 'Scan aktiv',
    subtotal: 'Zwischensumme',
    vat: (rate) => `MwSt (${rate}%)`,
    total: 'Gesamt',

    scanPrompt: 'Bitte scannen Sie Ihre Artikel ein',
    scanning: 'Scanne...',
    paying: 'Zahlung wird verarbeitet...',
    paid: 'Bezahlt',
    cancelled: 'Vorgang abgebrochen.',
    language: 'Sprache',
    produce: 'Gemüse / Obst',
    bakery: 'Backwaren',
    cancel: 'Abbrechen',
    pay: 'Zahlen',
    weightLabel: 'Gewicht (kg)',
    helpTitle: 'Hilfe',
    langTitle: 'Sprache wählen',
    error: 'Artikel nicht gefunden!',
    heroSub: 'Artikel scannen oder Kategorie wählen',
    produceSubtitle: 'Produkt wählen, dann Gewicht eingeben',
    bakerySubtitle: 'Tippen zum sofortigen Hinzufügen',
    back: 'Zurück',
    add: 'Hinzufügen',
    done: 'Fertig',
    helpScanner: (key) => key === 'scanner'
      ? 'Scanner: einfach scannen'
      : key === 'produce'
        ? 'Gemüse/Obst: auswählen, Gewicht eingeben, hinzufügen.'
        : key === 'bakery'
          ? 'Backwaren: antippen zum Hinzufügen.'
          : 'Abbrechen: Warenkorb wird geleert.',
    helpItems: [
      'Scanner: einfach scannen',
      'Gemüse/Obst: auswählen, Gewicht eingeben, hinzufügen.',
      'Backwaren: antippen zum Hinzufügen.',
      'Abbrechen: Warenkorb wird geleert.',
    ],

    cameraLoading: 'Kamera startet...',
    cameraOff: 'Kamera aus',
    cameraOn: 'Kamera an',
    retry: 'Erneut versuchen',
    cameraPermissionDenied: 'Kamera-Zugriff verweigert',
    cameraNotAvailable: 'Keine Kamera erkannt',
    barcodeNotSupported:
      'Barcode-Scanning im Browser nicht unterstützt – bitte Hardware-Scanner verwenden.',
    noCamera: 'Keine Kamera',
    produceCategory: 'Gemüse/Obst',
  },

  en: {
    help: 'Help',
    welcomePrefix: 'Ready to',
    welcomeAccent: 'Scan?',
    instruction: "Just scan. That's Scanly.",
    start: 'Start',
    helpModalTitle: 'About Scanly',
    helpModalBody:
      'Scanly is your personal self-checkout assistant. Simply scan your items, place them in your bag, and pay – no queuing at the checkout required.',
    helpSteps: [
      'Scan items with the scanner',
      'Place items in your bag',
      'Print receipt & pay',
    ],
    helpModalCta: 'Got it',
    close: 'Close',

    emptyTitle: 'No items scanned yet',
    emptyHint: 'Scan a product to display it here.',
    cartTitle: 'Shopping Cart',
    scanActive: 'Scan active',
    subtotal: 'Subtotal',
    vat: (rate) => `VAT (${rate}%)`,
    total: 'Total',

    scanPrompt: 'Please scan your items',
    scanning: 'Scanning...',
    paying: 'Payment processing...',
    paid: 'Paid',
    cancelled: 'Transaction cancelled.',
    language: 'Language',
    produce: 'Produce',
    bakery: 'Bakery',
    cancel: 'Cancel',
    pay: 'Pay',
    weightLabel: 'Weight (kg)',
    helpTitle: 'Help',
    langTitle: 'Select Language',
    error: 'Item not found!',
    heroSub: 'Scan items or choose a category',
    produceSubtitle: 'Select product, then enter weight',
    bakerySubtitle: 'Tap to add immediately',
    back: 'Back',
    add: 'Add',
    done: 'Done',
    helpItems: [
      'Scanner: just scan',
      'Produce: select, enter weight, add.',
      'Bakery: tap to add.',
      'Cancel: empties the cart.',
    ],

    cameraLoading: 'Starting camera...',
    cameraOff: 'Camera off',
    cameraOn: 'Camera on',
    retry: 'Retry',
    cameraPermissionDenied: 'Camera access denied',
    cameraNotAvailable: 'No camera detected',
    barcodeNotSupported:
      'Barcode scanning not supported in browser – please use hardware scanner.',
    noCamera: 'No camera',
    produceCategory: 'Produce',
  },

  it: {
    help: 'Assistenza',
    welcomePrefix: 'Pronto a',
    welcomeAccent: 'Scansionare?',
    instruction: 'Scansiona e basta. Questo è Scanly.',
    start: 'Inizia',
    helpModalTitle: 'Informazioni su Scanly',
    helpModalBody:
      'Scanly è il Suo assistente personale per il self-checkout. Scansioni i Suoi articoli, li metta nella borsa e paghi – senza fare la fila alla cassa.',
    helpSteps: [
      'Scansionare gli articoli con lo scanner',
      'Inserire gli articoli nella borsa',
      'Stampare lo scontrino e pagare',
    ],
    helpModalCta: 'Ho capito',
    close: 'Chiudi',

    emptyTitle: 'Nessun articolo scansionato',
    emptyHint: 'Scansioni un prodotto per visualizzarlo qui.',
    cartTitle: 'Carrello',
    scanActive: 'Scansione attiva',
    subtotal: 'Subtotale',
    vat: (rate) => `IVA (${rate}%)`,
    total: 'Totale',

    scanPrompt: 'Si prega di scansionare gli articoli',
    scanning: 'Scansione...',
    paying: 'Elaborazione pagamento...',
    paid: 'Pagato',
    cancelled: 'Transazione annullata.',
    language: 'Lingua',
    produce: 'Frutta e Verdura',
    bakery: 'Panetteria',
    cancel: 'Annulla',
    pay: 'Paga',
    weightLabel: 'Peso (kg)',
    helpTitle: 'Assistenza',
    langTitle: 'Seleziona lingua',
    error: 'Articolo non trovato!',
    heroSub: 'Scansioni articoli o scelga una categoria',
    produceSubtitle: 'Scelga il prodotto, poi inserisca il peso',
    bakerySubtitle: 'Tocca per aggiungere subito',
    back: 'Indietro',
    add: 'Aggiungi',
    done: 'Fatto',
    helpItems: [
      'Scanner: scansioni semplicemente, <b>Invio</b> termina il codice a barre.',
      'Frutta/Verdura: selezionare, inserire il peso, aggiungere.',
      'Panetteria: toccare per aggiungere.',
      'Annulla: svuota il carrello.',
    ],

    cameraLoading: 'Avvio fotocamera...',
    cameraOff: 'Fotocamera spenta',
    cameraOn: 'Fotocamera accesa',
    retry: 'Riprova',
    cameraPermissionDenied: 'Accesso fotocamera negato',
    cameraNotAvailable: 'Nessuna fotocamera rilevata',
    barcodeNotSupported:
      'Scansione codice a barre non supportata nel browser – utilizzare lo scanner hardware.',
    noCamera: 'Nessuna fotocamera',
    produceCategory: 'Frutta/Verdura',
  },

  ru: {
    help: 'Помощь',
    welcomePrefix: 'Готовы к',
    welcomeAccent: 'Сканированию?',
    instruction: 'Просто сканируйте. Это Scanly.',
    start: 'Старт',
    helpModalTitle: 'О приложении Scanly',
    helpModalBody:
      'Scanly — ваш персональный помощник для самостоятельной оплаты. Просто отсканируйте товары, положите их в пакет и оплатите покупку — без очереди на кассе.',
    helpSteps: [
      'Отсканируйте товары сканером',
      'Положите товары в пакет',
      'Распечатайте чек и оплатите',
    ],
    helpModalCta: 'Понятно',
    close: 'Закрыть',

    emptyTitle: 'Товары ещё не отсканированы',
    emptyHint: 'Отсканируйте товар, чтобы он появился здесь.',
    cartTitle: 'Корзина',
    scanActive: 'Сканирование активно',
    subtotal: 'Промежуточный итог',
    vat: (rate) => `НДС (${rate}%)`,
    total: 'Итого',

    scanPrompt: 'Пожалуйста, отсканируйте товары',
    scanning: 'Сканирование...',
    paying: 'Обработка платежа...',
    paid: 'Оплачено',
    cancelled: 'Операция отменена.',
    language: 'Язык',
    produce: 'Овощи и фрукты',
    bakery: 'Выпечка',
    cancel: 'Отмена',
    pay: 'Оплатить',
    weightLabel: 'Вес (кг)',
    helpTitle: 'Помощь',
    langTitle: 'Выбор языка',
    error: 'Товар не найден!',
    heroSub: 'Сканируйте товары или выберите категорию',
    produceSubtitle: 'Выберите товар, затем введите вес',
    bakerySubtitle: 'Нажмите для немедленного добавления',
    back: 'Назад',
    add: 'Добавить',
    done: 'Готово',
    helpItems: [
      'Сканер: просто сканируйте',
      'Овощи/фрукты: выберите, введите вес, добавьте.',
      'Выпечка: нажмите для добавления.',
      'Отмена: очищает корзину.',
    ],

    cameraLoading: 'Запуск камеры...',
    cameraOff: 'Камера выкл.',
    cameraOn: 'Камера вкл.',
    retry: 'Повторить',
    cameraPermissionDenied: 'Доступ к камере запрещён',
    cameraNotAvailable: 'Камера не обнаружена',
    barcodeNotSupported:
      'Сканирование штрих-кодов в браузере не поддерживается – используйте аппаратный сканер.',
    noCamera: 'Нет камеры',
    produceCategory: 'Овощи/фрукты',
  },
}

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

  const currentLanguage = computed(() =>
    languages.find((l) => l.code === currentLang.value) ?? languages[0]
  )

  return { currentLang, languages, t, tFn, setLanguage, currentLanguage }
}
