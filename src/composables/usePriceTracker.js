/**
 * Replica of tracker.py in JavaScript.
 * Tracks price history per symbol with a sliding window and detects spikes.
 */
import { reactive } from 'vue'

// Module-level singletons — one instance shared across the app
const priceHistory = new Map()
let lastResetDate = null
const pctMap = reactive({}) // sym → { pct, direction }

export function usePriceTracker() {
  function checkDailyReset(resetHour) {
    const now = new Date()
    const utcHour = now.getUTCHours()
    const today = now.toISOString().slice(0, 10)

    if (utcHour === resetHour && lastResetDate !== today) {
      lastResetDate = today
      priceHistory.clear()
      for (const key of Object.keys(pctMap)) delete pctMap[key]
    }
  }

  function trackPrice(sym, price, ts, settings) {
    const { windowMin, threshold, resetHour } = settings

    checkDailyReset(resetHour)

    if (!priceHistory.has(sym)) {
      priceHistory.set(sym, [])
    }
    const history = priceHistory.get(sym)

    history.push({ price, ts })

    const cutoff = ts - windowMin * 60 * 1000
    while (history.length > 1 && history[0].ts < cutoff) {
      history.shift()
    }

    if (history.length < 2) return null

    const oldest = history[0]
    const changePct = ((price - oldest.price) / oldest.price) * 100

    // Always expose current window % — used by the spike column
    pctMap[sym] = { pct: changePct, direction: changePct >= 0 ? 'up' : 'down' }

    if (Math.abs(changePct) >= threshold) {
      return {
        symbol: sym,
        price,
        oldPrice: oldest.price,
        changePct,
        direction: changePct > 0 ? 'up' : 'down',
        ts,
      }
    }

    return null
  }

  function resetAll() {
    priceHistory.clear()
    lastResetDate = null
    for (const key of Object.keys(pctMap)) delete pctMap[key]
  }

  return { trackPrice, resetAll, pctMap }
}
