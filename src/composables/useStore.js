import { inject, provide, watch } from 'vue'
import { useSettings } from './useSettings.js'
import { useTheme } from './useTheme.js'
import { useI18n } from './useI18n.js'
import { usePriceTracker } from './usePriceTracker.js'
import { useAlerts } from './useAlerts.js'
import { useBinanceWS } from './useBinanceWS.js'

const STORE_KEY = Symbol('bpa-store')

export function createStore() {
  const { settings, updateSetting, resetToDefaults } = useSettings()
  const { theme, toggleTheme, initTheme } = useTheme()
  const { t } = useI18n(settings)
  const { trackPrice, resetAll: resetTracker } = usePriceTracker()
  const alerts = useAlerts()
  const ws = useBinanceWS()

  // Wire callbacks: ticker updates → price tracker → alerts
  ws.setCallbacks(
    (sym, price) => {
      const spike = trackPrice(sym, price, Date.now(), settings)
      if (spike) {
        alerts.addAlert({ ...spike, windowMin: settings.windowMin })
      }
    },
    null // kline callback handled in CandlestickChart directly
  )

  // Initialize WebSocket with current symbols
  async function init() {
    initTheme()
    await ws.bootstrap()
    ws.updateSymbols(settings.symbols)
  }

  // Re-connect when symbols change
  watch(
    () => [...settings.symbols],
    (syms) => {
      ws.updateSymbols(syms)
    }
  )

  return {
    settings,
    updateSetting,
    resetToDefaults,
    theme,
    toggleTheme,
    t,
    alerts,
    ws,
    resetTracker,
    init,
  }
}

export function provideStore(store) {
  provide(STORE_KEY, store)
}

export function useStore() {
  return inject(STORE_KEY)
}
