import { ref, readonly } from 'vue'
import { playAlertBeep } from '../utils/audioAlert.js'
import { MAX_ALERTS } from '../utils/constants.js'

export function useAlerts() {
  const alerts = ref([])
  const audioEnabled = ref(true)
  const notifEnabled = ref(Notification.permission === 'granted')

  function addAlert(spikeEvent) {
    const alert = {
      id: Date.now() + Math.random(),
      ...spikeEvent,
      addedAt: Date.now(),
    }

    // Prepend, limit to MAX_ALERTS
    alerts.value = [alert, ...alerts.value].slice(0, MAX_ALERTS)

    if (audioEnabled.value) {
      playAlertBeep()
    }

    if (notifEnabled.value && Notification.permission === 'granted') {
      const dir = spikeEvent.direction === 'up' ? '🚀' : '📉'
      const pct = spikeEvent.changePct.toFixed(2)
      try {
        new Notification(`${dir} ${spikeEvent.symbol} SPIKE`, {
          body: `${pct}% in ${spikeEvent.windowMin ?? ''}min | $${spikeEvent.price.toFixed(4)}`,
          icon: `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${spikeEvent.symbol.toLowerCase()}.png`,
          tag: spikeEvent.symbol,
        })
      } catch {
        // notification failed
      }
    }
  }

  function clearAlerts() {
    alerts.value = []
  }

  function toggleAudio() {
    audioEnabled.value = !audioEnabled.value
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    notifEnabled.value = result === 'granted'
    return notifEnabled.value
  }

  return {
    alerts: readonly(alerts),
    addAlert,
    clearAlerts,
    audioEnabled,
    notifEnabled,
    toggleAudio,
    requestNotifPermission,
  }
}
