# Scanly-Frontend

Frontend für das Scanly SB-Kassen-System. Die Anwendung bildet den Kunden-Checkout,
Payback-Schritt, Zahlungsabschluss und den Admin-Bereich für Produkte, Bestellungen,
Umsatz, Coupons und Einstellungen ab.

## Tech Stack

- Vue 3
- Vite
- Pinia
- Vue Router
- Axios
- Chart.js

## Project Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Backend

Der Vite-Dev-Server leitet `/api` an `http://localhost:8080` weiter. Das Backend
muss für vollständige Checkout-, Produkt-, Coupon- und Admin-Funktionen laufen.

## Demo-Hinweise

- Der Payback-Scan nutzt im Frontend einen bewusst simulierten erfolgreichen Scan,
  damit der Demo-Checkout ohne echte Payback-Schnittstelle vorgeführt werden kann.
- Die Admin-Zugangsdaten werden aktuell lokal im Browser gespeichert. Für den
  produktiven Einsatz muss die Authentifizierung an das Backend angebunden werden.
