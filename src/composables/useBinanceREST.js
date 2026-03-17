import { BINANCE_REST_BASE } from '../utils/constants.js'

/**
 * Fetch kline (candlestick) data from Binance REST API.
 * Returns array of Candle objects: { openTime, open, high, low, close, volume, closeTime }
 */
export async function fetchKlines(symbol, interval = '5m', limit = 200) {
  const url = `${BINANCE_REST_BASE}/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Klines fetch failed: ${res.status}`)
  const data = await res.json()
  return data.map((k) => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    closeTime: k[6],
  }))
}

/**
 * Fetch current EUR/USDT rate for currency conversion.
 */
export async function fetchEurRate() {
  const url = `${BINANCE_REST_BASE}/ticker/price?symbol=EURUSDT`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`EUR rate fetch failed: ${res.status}`)
  const data = await res.json()
  return parseFloat(data.price)
}

/**
 * Validate that a symbol exists on Binance (as {SYM}USDT pair).
 */
export async function validateSymbol(symbol) {
  try {
    const url = `${BINANCE_REST_BASE}/ticker/price?symbol=${symbol.toUpperCase()}USDT`
    const res = await fetch(url)
    if (!res.ok) return false
    const data = await res.json()
    return !!data.price
  } catch {
    return false
  }
}
