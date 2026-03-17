import { ref, reactive } from 'vue'
import { BINANCE_WS_BASE } from '../utils/constants.js'
import { fetchEurRate } from './useBinanceREST.js'

const BACKOFF = [1000, 2000, 4000, 8000, 16000, 32000, 60000]

export function useBinanceWS() {
  const tickerMap = reactive({}) // sym → { price, priceEUR, change24h, high24h, low24h, vol24h }
  const connectionStatus = ref('disconnected') // 'connected' | 'reconnecting' | 'disconnected'
  const eurUsdtRate = ref(1)
  const klineData = ref([]) // latest kline candles for active chart symbol

  let ws = null
  let backoffIndex = 0
  let reconnectTimer = null
  let symbols = []
  let activeKlineSymbol = null
  let activeKlineInterval = '5m'
  let onKlineUpdate = null // callback(candle)
  let onTickerUpdate = null // callback(sym, price)

  async function bootstrap() {
    try {
      eurUsdtRate.value = await fetchEurRate()
    } catch {
      // will be updated from WS stream
    }
  }

  function buildStreamUrl(syms, klineSym, klineInterval) {
    const streams = syms.map((s) => `${s.toLowerCase()}usdt@ticker`)
    streams.push('eurusdt@ticker')
    if (klineSym) {
      streams.push(`${klineSym.toLowerCase()}usdt@kline_${klineInterval}`)
    }
    return `${BINANCE_WS_BASE}?streams=${streams.join('/')}`
  }

  function connect() {
    if (ws) {
      ws.onclose = null
      ws.close()
    }

    const url = buildStreamUrl(symbols, activeKlineSymbol, activeKlineInterval)
    connectionStatus.value = backoffIndex === 0 ? 'disconnected' : 'reconnecting'

    ws = new WebSocket(url)

    ws.onopen = () => {
      connectionStatus.value = 'connected'
      backoffIndex = 0
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const stream = msg.stream || ''
        const data = msg.data || msg

        if (stream.endsWith('@ticker') || data.e === '24hrTicker') {
          handleTicker(data)
        } else if (stream.includes('@kline_') || data.e === 'kline') {
          handleKline(data)
        }
      } catch {
        // malformed message
      }
    }

    ws.onerror = () => {
      connectionStatus.value = 'reconnecting'
    }

    ws.onclose = () => {
      connectionStatus.value = 'reconnecting'
      scheduleReconnect()
    }
  }

  function handleTicker(data) {
    const rawSym = (data.s || '').replace('USDT', '').toUpperCase()

    if (rawSym === 'EUR') {
      eurUsdtRate.value = parseFloat(data.c) || eurUsdtRate.value
      // Update EUR prices for all tracked symbols
      for (const sym of Object.keys(tickerMap)) {
        if (tickerMap[sym].priceUSDT) {
          tickerMap[sym].priceEUR = tickerMap[sym].priceUSDT / eurUsdtRate.value
        }
      }
      return
    }

    if (!rawSym || !symbols.includes(rawSym)) return

    const priceUSDT = parseFloat(data.c) || 0

    tickerMap[rawSym] = {
      symbol: rawSym,
      priceUSDT,
      priceEUR: priceUSDT / eurUsdtRate.value,
      change24h: parseFloat(data.P) || 0,
      high24h: parseFloat(data.h) || 0,
      low24h: parseFloat(data.l) || 0,
      vol24h: parseFloat(data.q) || 0,
      ts: data.T || Date.now(),
    }

    onTickerUpdate?.(rawSym, priceUSDT)
  }

  function handleKline(data) {
    const k = data.k || data
    if (!k) return

    const candle = {
      openTime: k.t,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      volume: parseFloat(k.v),
      closeTime: k.T,
      isClosed: k.x,
    }

    onKlineUpdate?.(candle)
  }

  function scheduleReconnect() {
    clearTimeout(reconnectTimer)
    const delay = BACKOFF[Math.min(backoffIndex, BACKOFF.length - 1)]
    const jitter = Math.random() * 500
    backoffIndex = Math.min(backoffIndex + 1, BACKOFF.length - 1)
    reconnectTimer = setTimeout(connect, delay + jitter)
  }

  function updateSymbols(syms) {
    symbols = [...syms]
    // Ensure EUR is tracked internally
    backoffIndex = 0
    connect()
  }

  function selectKline(sym, interval) {
    activeKlineSymbol = sym
    activeKlineInterval = interval
    backoffIndex = 0
    connect()
  }

  function setCallbacks(tickerCb, klineCb) {
    if (tickerCb !== null) onTickerUpdate = tickerCb
    if (klineCb !== null) onKlineUpdate = klineCb
  }

  // Set only the kline callback without touching the ticker callback
  function setKlineCallback(cb) {
    onKlineUpdate = cb
  }

  function disconnect() {
    clearTimeout(reconnectTimer)
    if (ws) {
      ws.onclose = null
      ws.close()
      ws = null
    }
    connectionStatus.value = 'disconnected'
  }

  return {
    tickerMap,
    connectionStatus,
    eurUsdtRate,
    klineData,
    bootstrap,
    updateSymbols,
    selectKline,
    setCallbacks,
    setKlineCallback,
    disconnect,
  }
}
