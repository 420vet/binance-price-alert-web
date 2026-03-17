import { reactive } from 'vue'

const STORAGE_KEY = 'bpa-settings'

const DEFAULTS = {
  symbols: ['BNB', 'BTC', 'VET', 'VTHO', 'ETH'],
  threshold: 1,
  windowMin: 5,
  pollInterval: 10,
  resetHour: 0,
  fontSize: 14,
  language: 'en',
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function useSettings() {
  const settings = reactive(loadFromStorage())

  function updateSetting(key, val) {
    settings[key] = val
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings }))
    } catch {
      // ignore storage errors
    }
  }

  function resetToDefaults() {
    Object.assign(settings, DEFAULTS)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return { settings, updateSetting, resetToDefaults }
}
