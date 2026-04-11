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

Benötigte Node-Version laut `package.json`:

```bash
^20.19.0 || >=22.12.0
```

```bash
npm install
```

## Development

```bash
npm run dev
```

## Environment

Kopiere `.env.example` bei Bedarf nach `.env.local`.

```bash
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT_MS=10000
VITE_API_PROXY_TARGET=http://localhost:8080
```

`VITE_API_BASE_URL` steuert die API-Basis im Browser. Im lokalen Dev-Setup leitet
der Vite-Proxy `/api` an `VITE_API_PROXY_TARGET` weiter.

## Production Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Tests & Verify

```bash
npm run test
npm run coverage
npm run verify
```

`verify` führt Lint, Locale-Check, Unit-Smoke-Tests und Production-Build nacheinander aus.

Für die Abgabe sollte `npm run verify` grün sein.

## Backend

Der Vite-Dev-Server leitet `/api` standardmäßig an `http://localhost:8080` weiter.
Das Backend muss für vollständige Checkout-, Produkt-, Coupon- und Admin-Funktionen
laufen.

Für andere Umgebungen kann die Backend-URL über `.env.local` angepasst werden:

```bash
VITE_API_BASE_URL=https://example.local/api
```

## Abgabe-Checkliste

```bash
npm install
npm run verify
npm run preview
```

- Backend erreichbar machen und `VITE_API_BASE_URL` beziehungsweise
  `VITE_API_PROXY_TARGET` passend setzen.
- Kundenflow einmal vollständig testen: Start, Checkout, Payback, Payment, Summary.
- Adminflow einmal vollständig testen: Login, Produkte, Coupons, Bestellungen, Umsatz.
- Browser mit Kamera- und Druck-Hardware nur in sicheren Kontexten testen:
  `https://` oder `localhost`.

## Browser- und Hardware-Matrix

| Bereich | Support | Hinweis |
| --- | --- | --- |
| Normaler Checkout | Chrome, Edge, Firefox, Safari | Tastatur-Scanner funktioniert wie Tastatureingabe. |
| Kamera-Barcode-Scan | Browser mit `BarcodeDetector` und Kamera-Freigabe | Bei fehlender Unterstützung zeigt die UI einen Fallback-Hinweis. |
| Kamera-Zugriff | HTTPS oder localhost | Unsichere HTTP-Kontexte blockieren Kamera-APIs. |
| WebUSB-Bondruck | Chrome oder Edge | Firefox und Safari unterstützen WebUSB nicht. |
| Payback | Demo-Scan plus manuelle Eingabe | Keine echte Payback-Schnittstelle angebunden. |
| Admin | Demo-Login im Frontend | Keine produktive serverseitige Authentifizierung. |

## Demo-Hinweise

- Der Payback-Scan nutzt im Frontend einen bewusst simulierten erfolgreichen Scan,
  damit der Demo-Checkout ohne echte Payback-Schnittstelle vorgeführt werden kann.
  Die manuelle Payback-Eingabe bleibt als sichtbarer Fallback verfügbar.
- Die Admin-Zugangsdaten werden aktuell lokal im Browser gespeichert. Für den
  produktiven Einsatz muss die Authentifizierung an das Backend angebunden werden.
  Admin-Routen sind im Frontend durch eine Demo-Session geschützt, ersetzen aber
  keine echte serverseitige Autorisierung.
- Der Bondruck ist für die Demo auf EUR und ESC/POS-kompatible WebUSB-Drucker
  ausgelegt. Die sichtbaren Druckstatus- und Fehlertexte sind lokalisiert; die
  Steuerdaten des Bons bleiben technisch auf dieses Druckerprofil begrenzt.
- Der Admin-Bereich ist vollständig für Deutsch und Englisch gepflegt. Italienisch
  und Russisch decken den Kundenflow ab; fehlende Admin-Texte fallen bewusst auf
  Englisch zurück.
