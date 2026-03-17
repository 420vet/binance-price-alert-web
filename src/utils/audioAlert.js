/**
 * Play an alert beep using Web Audio API.
 * Creates a new AudioContext per beep to avoid suspended-context issues.
 */
export function playAlertBeep() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)

    oscillator.onended = () => {
      ctx.close()
    }
  } catch {
    // Web Audio not available — silent fail
  }
}
