<script setup>
import { version } from '../../package.json'
import { useStore } from '../composables/useStore.js'

const store = useStore()
</script>

<template>
  <footer
    class="border-t px-4 py-2 flex items-center justify-between text-xs"
    :class="
      store.theme.value === 'dark'
        ? 'border-[var(--color-surface-border)] text-[var(--color-text-muted)]'
        : 'border-[var(--color-light-border)] text-[var(--color-light-text-secondary)]'
    "
  >
    <span>
      Made with
      <span class="text-[var(--color-spike)]">♥</span>
      by
      <a
        href="https://420.vet.ms"
        target="_blank"
        rel="noopener"
        class="text-[var(--color-neon)] hover:underline"
        >420.vet</a
      >
    </span>
    <span class="font-mono text-[var(--color-text-muted)]">v{{ version }}</span>
  </footer>
</template>
