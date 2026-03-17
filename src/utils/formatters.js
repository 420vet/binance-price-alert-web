/**
 * Format a USDT price with appropriate decimal places
 * High-value coins like BTC use 2 decimals; low-value coins use more
 */
export function formatPrice(price, currency = 'USDT') {
  if (price == null || isNaN(price)) return '—'
  const n = Number(price)
  let decimals = 2
  if (n < 0.001) decimals = 8
  else if (n < 0.1) decimals = 6
  else if (n < 1) decimals = 4
  else if (n < 100) decimals = 3

  const symbol = currency === 'EUR' ? '€' : '$'
  return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

/**
 * Format percentage change with sign
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—'
  const n = Number(value)
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

/**
 * Format a timestamp to HH:MM:SS
 */
export function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/**
 * Format volume with K/M/B suffixes
 */
export function formatVolume(vol) {
  if (vol == null || isNaN(vol)) return '—'
  const n = Number(vol)
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(2)
}
