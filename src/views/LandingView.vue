<template>
  <div class="checkout">
    <div class="checkout__overlay" aria-hidden="true"></div>

    <nav class="navbar">
      <button
        type="button"
        class="navbar-btn navbar-btn-left"
        @click="onHelp"
        :aria-label="t('help')"
      >
        <span class="navbar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="icon" focusable="false">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                 10-4.48 10-10S17.52 2 12 2Zm0 17a1.25 1.25 0 1 1 0-2.5
                 1.25 1.25 0 0 1 0 2.5Zm1.2-5.7c-.7.46-.95.72-.95 1.45v.25h-1.9v-.4
                 c0-1.23.55-1.87 1.45-2.45.73-.48 1.2-.78 1.2-1.5
                 0-.78-.62-1.3-1.5-1.3-.82 0-1.42.44-1.75 1.1l-1.62-.95
                 C8.68 7.42 10.05 6.6 11.7 6.6c2 0 3.5 1.18 3.5 3
                 0 1.6-1 2.25-2 2.95Z"
            />
          </svg>
        </span>
        <span class="navbar-text">{{ t('help') }}</span>
      </button>

      <button
        type="button"
        class="navbar-btn navbar-btn-center"
        @click="onVolume"
        :aria-label="t('volume')"
      >
        <span class="navbar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="icon">
            <path
              d="M3 10v4h4l5 4V6L7 10H3Zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05
                 c1.48-.73 2.5-2.25 2.5-4.02ZM14 3.23v2.06c2.89 1 5 3.77 5 6.71
                 s-2.11 5.71-5 6.71v2.06c4.01-1.07 7-4.73 7-8.77s-2.99-7.7-7-8.77Z"
            />
          </svg>
        </span>
        <span class="navbar-text">{{ t('volume') }}</span>
      </button>

      <button
        type="button"
        class="navbar-btn navbar-btn-right"
        @click="onOwnBag"
        :aria-label="t('ownBag')"
      >
        <span class="navbar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="icon">
            <path
              d="M6 7V6a6 6 0 0 1 12 0v1h2v15H4V7h2Zm2 0h8V6a4 4 0 0 0-8 0v1Zm-1 5
                 a1 1 0 0 0 2 0v-1H7v1Zm8 0a1 1 0 0 0 2 0v-1h-2v1Z"
            />
          </svg>
        </span>
        <span class="navbar-text">{{ t('ownBag') }}</span>
      </button>
    </nav>

    <main class="main">
      <h1 class="main-title">{{ t('welcome') }}</h1>
      <p class="main-subtitle">{{ t('instruction') }}</p>

      <button type="button" class="start" @click="onStart">
        {{ t('start') }}
      </button>
    </main>

    <footer class="language-bar" aria-label="Sprache auswählen">
      <button
        v-for="lang in languages"
        :key="lang.code"
        type="button"
        class="language-bar-btn"
        :class="{ 'language-bar-btn-active': currentLang === lang.code }"
        :aria-label="lang.label"
        @click="setLanguage(lang.code)"
      >
        <img :src="lang.flag" :alt="lang.label" class="language-bar-flag" />
      </button>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const translations = {
  de: {
    help: 'Hilfe',
    volume: 'Lautstärke',
    ownBag: 'eigene Tasche',
    welcome: 'Willkommen!',
    instruction: 'Bitte scannen Sie Ihren Artikel\noder drücken Sie auf "Start"',
    start: 'Start',
  },
  en: {
    help: 'Help',
    volume: 'Volume',
    ownBag: 'Own Bag',
    welcome: 'Welcome!',
    instruction: 'Please scan your item\nor press "Start"',
    start: 'Start',
  },
  it: {
    help: 'Assistenza',
    volume: 'Volume',
    ownBag: 'Borsa personale',
    welcome: 'Benvenuto!',
    instruction: 'Scansioni il Suo articolo\noppure prema "Inizia"',
    start: 'Inizia',
  },
  ru: {
    help: 'Помощь',
    volume: 'Громкость',
    ownBag: 'Собственный пакет',
    welcome: 'Добро пожаловать!',
    instruction: 'Пожалуйста отсканируйте товар\nили нажмите "Старт"',
    start: 'Старт',
  },
}

const languages = [
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

const LANG_KEY = 'checkout_lang'
const currentLang = ref(localStorage.getItem(LANG_KEY) ?? 'de')

const t = (key) => translations[currentLang.value]?.[key] ?? key

function setLanguage(code) {
  currentLang.value = code
  localStorage.setItem(LANG_KEY, code)
}

function onHelp() {
  console.log('[checkout] help clicked')
}

function onVolume() {
  console.log('[checkout] volume clicked')
}

function onOwnBag() {
  console.log('[checkout] own bag clicked')
}

function onStart() {
  router.push('/checkout')
}
</script>

<style>
html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>

<style scoped>
.checkout {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
  background-image: url('https://www.edeka.de/static/media/eh/edeka-resp/minden-hannover/edeka-fromm-m%C3%BCllerstr.-12a-c/16x9-titel-startbild-edk-fromm-12a-c.jpg');
  background-size: cover;
  background-position: center;
}

.checkout__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.91) 0%,
    rgba(0, 0, 0, 0.73) 55%,
    rgba(0, 0, 0, 0.5) 100%
  );
}

.navbar {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 1.5rem 4rem;
  background: rgba(90, 50, 180, 0.85);
  backdrop-filter: blur(4px);
}

.navbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.45rem 0.9rem;
  border-radius: 12px;
  transition:
    background 0.2s,
    transform 0.15s;
}

.navbar-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.navbar-btn-left {
  justify-self: start;
}

.navbar-btn-center {
  justify-self: center;
}

.navbar-btn-right {
  justify-self: end;
}

.navbar-icon {
  width: 26px;
  height: 26px;
  display: inline-flex;
}

.icon {
  width: 26px;
  height: 26px;
  fill: currentColor;
  opacity: 0.95;
}

.navbar-text {
  line-height: 1;
  white-space: nowrap;
}

.main {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem 8vh;
}

.main-title {
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
}

.main-subtitle {
  margin-top: 1rem;
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  line-height: 1.6;
  white-space: pre-line;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.7);
}

.start {
  margin-top: 2rem;
  padding: 1.6rem 5rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  border: 0;
  border-radius: 2rem;
  background: rgba(90, 50, 180, 0.9);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(90, 50, 180, 0.5);
  transition:
    transform 0.15s,
    background 0.2s,
    box-shadow 0.2s;
}

.start:hover {
  background: rgba(110, 70, 210, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 50, 180, 0.65);
}

.start:active {
  transform: translateY(0);
}

.language-bar {
  position: absolute;
  left: 2rem;
  bottom: 1.75rem;
  z-index: 2;
  display: flex;
  gap: 1rem;
}

.language-bar-btn {
  background: transparent;
  border: 3px solid transparent;
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    transform 0.15s;
}

.language-bar-btn:hover {
  transform: scale(1.08);
}

.language-bar-btn-active {
  border-color: #fff;
}

.language-bar-flag {
  display: block;
  width: 110px;
  height: 84px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
