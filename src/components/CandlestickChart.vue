<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from '../composables/useStore.js'
import { fetchKlines } from '../composables/useBinanceREST.js'
import { TIMEFRAMES } from '../utils/constants.js'
import { formatVolume } from '../utils/formatters.js'

const props = defineProps({
  symbol: { type: String, default: null },
})

const store = useStore()
const canvas = ref(null)
const candles = ref([])
const interval = ref('5m')
const loading = ref(false)
const tooltip = ref(null) // { x, y, candle }
const zoomLevel = ref(1) // 1 = default, >1 = zoomed in

let animFrame = null
let resizeObserver = null

// --- Data loading ---
async function loadKlines() {
  if (!props.symbol) return
  loading.value = true
  try {
    candles.value = await fetchKlines(props.symbol, interval.value, 200)
    // Subscribe to live kline updates
    store.ws.selectKline(props.symbol, interval.value)
    store.ws.setCallbacks(
      // Keep existing ticker callback
      (_sym, _price) => {
        // ticker updates handled in useStore
      },
      (candle) => {
        if (!candles.value.length) return
        const last = candles.value[candles.value.length - 1]
        if (candle.openTime === last.openTime) {
          // Update last candle
          candles.value[candles.value.length - 1] = { ...last, ...candle }
        } else if (candle.openTime > last.openTime) {
          candles.value.push(candle)
          if (candles.value.length > 300) candles.value.shift()
        }
        draw()
      }
    )
  } catch (e) {
    console.error('Failed to load klines:', e)
  } finally {
    loading.value = false
  }
  draw()
}

// --- Drawing ---
function draw() {
  const cvs = canvas.value
  if (!cvs || !candles.value.length) return

  const dpr = window.devicePixelRatio || 1
  const W = cvs.clientWidth
  const H = cvs.clientHeight
  cvs.width = W * dpr
  cvs.height = H * dpr

  const ctx = cvs.getContext('2d')
  ctx.scale(dpr, dpr)

  const isDark = store.theme.value === 'dark'
  const colorBg = isDark ? '#14141a' : '#ffffff'
  const colorGrid = isDark ? '#2a2a3a' : '#e8e8f0'
  const colorText = isDark ? '#8888a0' : '#555577'
  const colorUp = '#3ddc84'
  const colorDown = '#ff2d55'

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = colorBg
  ctx.fillRect(0, 0, W, H)

  const PADDING = { top: 20, right: 60, bottom: 40, vol: 60 }
  const chartH = H - PADDING.top - PADDING.bottom - PADDING.vol
  const chartW = W - PADDING.right

  // Visible candle window
  const total = candles.value.length
  const visible = Math.min(total, Math.floor(60 / zoomLevel.value) + 20)
  const start = Math.max(0, total - visible)
  const slice = candles.value.slice(start)
  if (!slice.length) return

  // Price range
  const highs = slice.map((c) => c.high)
  const lows = slice.map((c) => c.low)
  const maxP = Math.max(...highs)
  const minP = Math.min(...lows)
  const priceRange = maxP - minP || maxP * 0.01

  // Volume range
  const vols = slice.map((c) => c.volume)
  const maxV = Math.max(...vols) || 1

  // Candle width
  const candleW = Math.max(2, (chartW / slice.length) * 0.8)
  const gap = chartW / slice.length

  // Grid lines (5 horizontal)
  ctx.strokeStyle = colorGrid
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const y = PADDING.top + (chartH * i) / 5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(chartW, y)
    ctx.stroke()

    // Price label
    const price = maxP - (priceRange * i) / 5
    ctx.fillStyle = colorText
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(price.toFixed(price > 100 ? 2 : 4), chartW + 2, y + 3)
  }

  // Draw candles
  slice.forEach((candle, i) => {
    const x = i * gap + gap / 2
    const isUp = candle.close >= candle.open
    const color = isUp ? colorUp : colorDown

    // Price body
    const bodyTop = PADDING.top + ((maxP - Math.max(candle.open, candle.close)) / priceRange) * chartH
    const bodyBot = PADDING.top + ((maxP - Math.min(candle.open, candle.close)) / priceRange) * chartH
    const bodyH = Math.max(1, bodyBot - bodyTop)

    // Wick
    const wickTop = PADDING.top + ((maxP - candle.high) / priceRange) * chartH
    const wickBot = PADDING.top + ((maxP - candle.low) / priceRange) * chartH

    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, wickTop)
    ctx.lineTo(x, wickBot)
    ctx.stroke()

    ctx.fillStyle = color
    ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH)

    // Volume bar
    const volH = (candle.volume / maxV) * PADDING.vol * 0.85
    const volY = H - PADDING.bottom - volH
    ctx.fillStyle = color + '66'
    ctx.fillRect(x - candleW / 2, volY, candleW, volH)
  })

  // Time axis (every ~10 candles)
  ctx.fillStyle = colorText
  ctx.font = '10px monospace'
  ctx.textAlign = 'center'
  const step = Math.max(1, Math.floor(slice.length / 8))
  for (let i = 0; i < slice.length; i += step) {
    const x = i * gap + gap / 2
    const ts = slice[i].openTime
    const d = new Date(ts)
    const label =
      interval.value === '1d'
        ? `${d.getMonth() + 1}/${d.getDate()}`
        : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    ctx.fillText(label, x, H - PADDING.bottom + 14)
  }

  // Tooltip
  if (tooltip.value) {
    const c = tooltip.value.candle
    const tipX = Math.min(tooltip.value.x + 10, W - 130)
    const tipY = Math.max(tooltip.value.y - 80, PADDING.top)

    ctx.fillStyle = isDark ? '#1c1c26ee' : '#ffffffee'
    ctx.strokeStyle = '#00ccdd'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(tipX, tipY, 130, 90, 4)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = isDark ? '#e8e8f0' : '#1a1a2e'
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    const lines = [
      `O: ${c.open?.toFixed(4)}`,
      `H: ${c.high?.toFixed(4)}`,
      `L: ${c.low?.toFixed(4)}`,
      `C: ${c.close?.toFixed(4)}`,
      `V: ${formatVolume(c.volume)}`,
    ]
    lines.forEach((line, idx) => {
      ctx.fillText(line, tipX + 8, tipY + 16 + idx * 15)
    })
  }
}

// --- Mouse events ---
function onMouseMove(e) {
  const cvs = canvas.value
  if (!cvs || !candles.value.length) return
  const rect = cvs.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const PADDING_RIGHT = 60
  const W = cvs.clientWidth
  const chartW = W - PADDING_RIGHT
  const total = candles.value.length
  const visible = Math.min(total, Math.floor(60 / zoomLevel.value) + 20)
  const start = Math.max(0, total - visible)
  const slice = candles.value.slice(start)
  const gap = chartW / slice.length
  const idx = Math.floor(x / gap)

  if (idx >= 0 && idx < slice.length) {
    tooltip.value = { x, y, candle: slice[idx] }
  } else {
    tooltip.value = null
  }
  draw()
}

function onMouseLeave() {
  tooltip.value = null
  draw()
}

function onWheel(e) {
  e.preventDefault()
  const delta = Math.sign(e.deltaY) * 0.1
  zoomLevel.value = Math.max(0.5, Math.min(5, zoomLevel.value + delta))
  draw()
}

// --- Lifecycle ---
watch(() => props.symbol, loadKlines)
watch(interval, loadKlines)
watch(() => store.theme.value, draw)

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (animFrame) cancelAnimationFrame(animFrame)
    animFrame = requestAnimationFrame(draw)
  })
  if (canvas.value?.parentElement) {
    resizeObserver.observe(canvas.value.parentElement)
  }
  if (props.symbol) loadKlines()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div
    class="rounded-lg border flex flex-col"
    :class="store.theme.value === 'dark'
      ? 'bg-[var(--color-surface-card)] border-[var(--color-surface-border)]'
      : 'bg-[var(--color-light-card)] border-[var(--color-light-border)]'"
  >
    <!-- Chart header -->
    <div
      class="flex items-center gap-3 px-3 py-2 border-b flex-wrap"
      :class="store.theme.value === 'dark'
        ? 'border-[var(--color-surface-border)]'
        : 'border-[var(--color-light-border)]'"
    >
      <span class="font-bold text-[var(--color-neon)] text-sm">
        {{ symbol ?? '—' }}/USDT
      </span>
      <span class="text-xs text-[var(--color-text-muted)]">
        {{ store.t.value.chart }}
      </span>

      <!-- Timeframe buttons -->
      <div class="flex gap-1 ml-auto flex-wrap">
        <button
          v-for="tf in TIMEFRAMES"
          :key="tf"
          class="px-2 py-0.5 rounded text-xs font-mono transition-colors"
          :class="interval === tf
            ? 'bg-[var(--color-neon)] text-black'
            : store.theme.value === 'dark'
              ? 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
              : 'text-[var(--color-light-text-secondary)] hover:bg-[var(--color-light-elevated)]'"
          @click="interval = tf"
        >
          {{ tf }}
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="relative flex-1">
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm z-10"
      >
        <span class="animate-spin mr-2">⟳</span> {{ store.t.value.loading }}
      </div>
      <div
        v-if="!symbol"
        class="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm"
      >
        Select a symbol to view chart
      </div>
      <canvas
        ref="canvas"
        class="w-full"
        style="height: 320px; display: block; cursor: crosshair"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        @wheel.prevent="onWheel"
      />
    </div>
  </div>
</template>
