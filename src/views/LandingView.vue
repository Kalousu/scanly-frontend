<template>
  <div class="checkout">
    <div class="checkout__overlay" aria-hidden="true"></div>

    <div class="bg-grid" aria-hidden="true"></div>

    <nav class="navbar">
      <div class="navbar-logo-wrap">
        <img src="../assets/logo-removebg-preview.png" class="logo" alt="Scanly" />
      </div>

      <div class="navbar-actions">
        <button
          type="button"
          class="navbar-btn navbar-pill"
          @click="onVolume"
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
          <span class="navbar-text" @onClick="onOwnBag">{{ t('ownBag') }}</span>
        </button>

        <button
          type="button"
          class="navbar-btn navbar-pill"
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
      </div>
    </nav>

    <main class="main">
      <div class="main-glow" aria-hidden="true"></div>
      <div class="main-inner">
        <h1 class="main-title">
          <span class="title-line title-line--light">Bereit zum</span>
          <span class="title-line title-line--accent">{{ t('welcomeAccent') }}</span>
        </h1>

        <p class="main-sub">{{ t('instruction') }}</p>

        <button type="button" class="start" @click="onStart">
          <span class="start-text">{{ t('start') }}</span>
        </button>
      </div>
    </main>

    <footer class="language-bar" aria-label="Sprache auswählen">
      <div class="language-bar-inner">
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
          <span class="language-bar-code">{{ lang.code.toUpperCase() }}</span>
        </button>
      </div>
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
    welcome: 'Bereit zum Scannen?',
    welcomeAccent: 'Scannen?',
    instruction: 'Einfach Scannen. Das ist Scanly.',
    start: 'Start',
  },
  en: {
    help: 'Help',
    volume: 'Volume',
    ownBag: 'Own Bag',
    welcome: 'Ready to Scan?',
    welcomeAccent: 'Scan?',
    instruction: 'Scan your items, print receipt, done.',
    start: 'Start',
  },
  it: {
    help: 'Assistenza',
    volume: 'Volume',
    ownBag: 'Borsa personale',
    welcome: 'Pronto a scansionare?',
    welcomeAccent: 'Scansionare?',
    instruction: 'Scansioni il Suo articolo, poi prema "Inizia".',
    start: 'Inizia',
  },
  ru: {
    help: 'Помощь',
    volume: 'Громкость',
    ownBag: 'Собственный пакет',
    welcome: 'Готовы к сканированию?',
    welcomeAccent: 'Сканировать?',
    instruction: 'Отсканируйте товар и нажмите «Старт».',
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
:root {
  --cyan: #00D4E8;
  --cyan-glow: rgba(0, 212, 232, 0.35);
  --navy-deep: #071A2A;
  --navy-mid: #0B2C44;
  --navy-surface: rgba(255,255,255,0.05);
  --navy-border: rgba(255,255,255,0.08);
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255,255,255,0.55);
}

.checkout {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(160deg, #071A2A 0%, #0B2C44 60%, #092538 100%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  z-index: 0;
}

.checkout__overlay {
  display: none;
}

.navbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 3rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(7, 26, 42, 0.9);
  backdrop-filter: blur(8px);
}

.navbar-logo-wrap {
  display: flex;
  align-items: center;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.navbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.87);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  transition: background 0.18s, transform 0.13s, color 0.18s, border-color 0.18s;
  letter-spacing: 0.01em;
}

.navbar-pill {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.10);
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
}

.navbar-btn:hover {
  color: rgba(255, 255, 255, 1);
  background: rgba(0, 212, 232, 0.08);
  border-color: rgba(0, 212, 232, 0.3);
  box-shadow: 0 0 12px rgba(0, 212, 232, 0.12);
  transform: translateY(-1px);
}

.navbar-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  flex-shrink: 0;
  opacity: 0.72;
  transition: opacity 0.18s;
}

.navbar-btn:hover .navbar-icon {
  opacity: 1;
}

.icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.navbar-text {
  line-height: 1;
  white-space: nowrap;
  font-size: 0.95rem;
}

.logo {
  width: 88px;
  display: block;
  filter: brightness(1.1);
}

.main-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  width: 760px;
  height: 440px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 210, 235, 0.10) 0%,
    rgba(0, 185, 215, 0.055) 35%,
    transparent 65%
  );
  pointer-events: none;
  z-index: 1;
}

.main {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 10vh;
  text-align: center;
}

.main-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-top: 4vh;
}

.main-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0 0.85rem;
  line-height: 1.05;
}

.title-line {
  display: block;
  font-size: clamp(3.5rem, 7.5vw, 6.5rem);
  font-weight: 800;
}

.title-line--light {
  color: rgba(255, 255, 255, 0.88);
  font-size: clamp(2.8rem, 6vw, 5.2rem);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.title-line--accent {
  background: linear-gradient(90deg, #00D4E8 0%, #6EF0F9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: clamp(4rem, 8.5vw, 7.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  padding-bottom: 0.12em;
}

.main-sub {
  margin: 0.55rem 0 2.5rem;
  font-size: clamp(0.73rem, 1.3vw, 0.87rem);
  color: rgba(255, 255, 255, 0.42);
  font-weight: 400;
  letter-spacing: 0.03em;
}

.start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 68px;
  width: 22vw;
  min-width: 280px;
  padding: 0 2.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #ffffff;
  border: 0;
  border-radius: 40px;
  background: linear-gradient(90deg, #1fd6d6 0%, #1ec3ff 100%);
  cursor: pointer;
  box-shadow:
    0 6px 28px rgba(30, 195, 255, 0.28),
    0 2px 8px rgba(31, 214, 214, 0.18);
  transition: transform 0.18s ease, box-shadow 0.22s ease, background 0.2s ease;
}

.start-text {
  line-height: 1;
}

.start:hover {
  background: linear-gradient(90deg, #3de0e0 0%, #3dd1ff 100%);
  transform: translateY(-2px) scale(1.015);
  box-shadow:
    0 8px 36px rgba(30, 195, 255, 0.38),
    0 3px 10px rgba(31, 214, 214, 0.22);
}

.start:active {
  transform: translateY(0);
  box-shadow:
    0 3px 12px rgba(30, 195, 255, 0.25);
}

.language-bar {
  position: absolute;
  bottom: 2.5rem;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
}

.language-bar-inner {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: rgba(7, 26, 42, 0.75);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.language-bar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 5px 8px;
  cursor: pointer;
  transition: border-color 0.18s, transform 0.13s, background 0.18s;
}

.language-bar-btn:hover {
  background: rgba(255,255,255,0.06);
  transform: translateY(-1px);
}

.language-bar-btn-active {
  border-color: #00D4E8;
  background: rgba(0, 212, 232, 0.08);
}

.language-bar-flag {
  display: block;
  width: 36px;
  height: 24px;
  object-fit: cover;
  border-radius: 3px;
}

.language-bar-code {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.45);
  line-height: 1;
}

.language-bar-btn-active .language-bar-code {
  color: #00D4E8;
}
</style>
