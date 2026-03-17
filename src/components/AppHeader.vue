<script setup>
import { Zap, Sun, Moon, Settings, Plus } from 'lucide-vue-next'
import { useStore } from '../composables/useStore.js'
import ConnectionDot from './ConnectionDot.vue'

const store = useStore()
const emit = defineEmits(['settings', 'add-token'])
</script>

<template>
  <header
    class="flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-40 backdrop-blur-sm"
    :class="store.theme.value === 'dark'
      ? 'bg-[var(--color-surface-card)]/90 border-[var(--color-surface-border)]'
      : 'bg-[var(--color-light-card)]/90 border-[var(--color-light-border)]'"
  >
    <!-- Logo + Title -->
    <div class="flex items-center gap-2 min-w-0">
      <Zap
        class="w-4 h-4 text-[var(--color-neon)] shrink-0"
        :stroke-width="2.5"
      />
      <span class="font-bold tracking-tight text-[var(--color-neon)] truncate">
        {{ store.t.value.appTitle }}
      </span>
    </div>

    <!-- Connection status -->
    <ConnectionDot :status="store.ws.connectionStatus.value">
      {{ store.t.value[store.ws.connectionStatus.value] }}
    </ConnectionDot>

    <div class="flex-1" />

    <!-- Add token -->
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
      :class="store.theme.value === 'dark'
        ? 'border-[var(--color-neon)]/40 text-[var(--color-neon)] hover:bg-[var(--color-neon)]/10'
        : 'border-[var(--color-neon)] text-[var(--color-neon)] hover:bg-[var(--color-neon)]/10'"
      @click="emit('add-token')"
    >
      <Plus
        class="w-3 h-3"
        :stroke-width="2.5"
      />
      {{ store.t.value.addToken }}
    </button>

    <!-- Theme toggle -->
    <button
      class="p-1.5 rounded transition-colors"
      :class="store.theme.value === 'dark'
        ? 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
        : 'text-[var(--color-light-text-primary)] hover:bg-[var(--color-light-elevated)]'"
      :title="store.theme.value === 'dark' ? 'Switch to light' : 'Switch to dark'"
      @click="store.toggleTheme()"
    >
      <Sun
        v-if="store.theme.value === 'dark'"
        class="w-4 h-4"
      />
      <Moon
        v-else
        class="w-4 h-4"
      />
    </button>

    <!-- Settings -->
    <button
      class="p-1.5 rounded transition-colors"
      :class="store.theme.value === 'dark'
        ? 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
        : 'text-[var(--color-light-text-primary)] hover:bg-[var(--color-light-elevated)]'"
      :title="store.t.value.settings"
      @click="emit('settings')"
    >
      <Settings class="w-4 h-4" />
    </button>
  </header>
</template>
