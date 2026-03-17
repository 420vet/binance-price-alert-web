/**
 * Replica of tracker.py in JavaScript.
 * Tracks price history per symbol with a sliding window and detects spikes.
 */

// priceHistory: Map<symbol, [{price, ts}]>
const priceHistory = new Map()
let lastResetDate = null

/**
 * @param {string} sym  e.g. "BTC"
 * @param {number} price
 * @param {number} ts   Unix ms timestamp
 * @param {object} settings  { windowMin, threshold, resetHour }
 * @returns {{ symbol, price, oldPrice, changePct, direction } | null}
 */
export function usePriceTracker() {
  function checkDailyReset(resetHour) {
    const now = new Date()
    const utcHour = now.getUTCHours()
    const today = now.toISOString().slice(0, 10)

    if (utcHour === resetHour && lastResetDate !== today) {
      lastResetDate = today
      priceHistory.clear()
    }
  }

  function trackPrice(sym, price, ts, settings) {
    const { windowMin, threshold, resetHour } = settings

    checkDailyReset(resetHour)

    if (!priceHistory.has(sym)) {
      priceHistory.set(sym, [])
    }
    const history = priceHistory.get(sym)

    // Append new entry
    history.push({ price, ts })

    // Trim entries older than windowMin
    const cutoff = ts - windowMin * 60 * 1000
    while (history.length > 1 && history[0].ts < cutoff) {
      history.shift()
    }

    // Need at least 2 points to detect spike
    if (history.length < 2) return null

    const oldest = history[0]
    const changePct = ((price - oldest.price) / oldest.price) * 100

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
  }

  return { trackPrice, resetAll }
}
