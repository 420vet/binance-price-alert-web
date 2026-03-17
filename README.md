# binance-price-alert-web

Real-time Binance price spike alerts — pure frontend, no backend, no API key required.

Connects directly to Binance public WebSockets from the browser and alerts you when a coin moves beyond a configurable threshold within a sliding time window.

```bash
npx binance-price-alert-web
```

Then open **http://localhost:4173**

---

## Features

- **Live prices** — BTC, ETH, BNB, VET, VTHO and any USDT pair via Binance WebSocket streams
- **EUR prices** — live EUR/USDT rate, no manual configuration
- **Spike detection** — sliding window alert when price moves ≥ threshold% in N minutes
- **Browser notifications + audio beep** — no Telegram, no email, no backend
- **Candlestick chart** — Canvas-based OHLCV chart with volume, tooltip, zoom and 6 timeframes (1m 5m 15m 1h 4h 1d)
- **Sortable table** — sort by symbol, price, 24h change, spike %, volume
- **Settings** — threshold (0.01–20%), window (1–60 min), daily reset hour, font size, language
- **5 languages** — English, Español, Français, Italiano, 中文
- **Dark / light theme** — persisted in localStorage
- **Zero backend** — pure static SPA, publishable anywhere

---

## Usage

### Run with npx (no install)

```bash
npx binance-price-alert-web
```

### Install globally

```bash
npm install -g binance-price-alert-web
binance-price-alert-web
```

### Custom port

```bash
PORT=8080 npx binance-price-alert-web
```

---

## Development

```bash
git clone https://github.com/420vet/binance-price-alert-web.git
cd binance-price-alert-web
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # Build to dist/
npm run lint       # ESLint 9
npm run format     # Prettier 3
```

---

## Stack

- **Vue 3** (`<script setup>`) + **Vite 5**
- **Tailwind CSS 4** (`@tailwindcss/vite`, no config file)
- **lucide-vue-next** icons
- **Share Tech Mono** font
- Native **Canvas 2D** chart (no chart library)
- Native **WebSocket** + exponential backoff reconnect
- Native **Web Audio API** for alert beep

---

## How spike detection works

For each tracked symbol, the app keeps a sliding price history for the last N minutes (`windowMin` setting). On every tick it compares the current price to the oldest price in the window:

```
change% = ((currentPrice - oldestPrice) / oldestPrice) × 100
```

If `|change%| ≥ threshold`, a spike alert fires (browser notification + beep). The window resets daily at the configured UTC hour.

---

## License

MIT © [420.vet](https://420.vet)
