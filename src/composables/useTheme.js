import { ref } from 'vue'

const STORAGE_KEY = 'bpa-theme'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore
  }
  return 'dark'
}

const theme = ref(getInitialTheme())

function applyTheme(t) {
  const html = document.documentElement
  html.classList.remove('dark', 'light')
  html.classList.add(t)
}

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(theme.value)
    try {
      localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      // ignore
    }
  }

  function initTheme() {
    applyTheme(theme.value)
  }

  return { theme, toggleTheme, initTheme }
}
