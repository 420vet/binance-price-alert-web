<script setup>
import { useStore } from '../composables/useStore.js'
import AlertItem from './AlertItem.vue'

const store = useStore()
const alerts = store.alerts
</script>

<template>
  <div
    class="rounded-lg border flex flex-col h-full"
    :class="store.theme.value === 'dark'
      ? 'bg-[var(--color-surface-card)] border-[var(--color-surface-border)]'
      : 'bg-[var(--color-light-card)] border-[var(--color-light-border)]'"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-3 py-2 border-b"
      :class="store.theme.value === 'dark'
        ? 'border-[var(--color-surface-border)]'
        : 'border-[var(--color-light-border)]'"
    >
      <span class="font-bold text-xs uppercase tracking-wide text-[var(--color-spike)]">
        🚨 {{ store.t.value.alerts }}
        <span
          v-if="alerts.alerts.value.length"
          class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-spike)]/20"
        >
          {{ alerts.alerts.value.length }}
        </span>
      </span>

      <div class="flex items-center gap-2">
        <!-- Audio toggle -->
        <button
          class="text-xs px-1.5 py-0.5 rounded transition-colors"
          :class="alerts.audioEnabled.value
            ? 'text-[var(--color-green)]'
            : 'text-[var(--color-text-muted)]'"
          :title="store.t.value.enableAudio"
          @click="alerts.toggleAudio()"
        >
          {{ alerts.audioEnabled.value ? '🔊' : '🔇' }}
        </button>

        <!-- Clear -->
        <button
          v-if="alerts.alerts.value.length"
          class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-spike)] transition-colors"
          :title="store.t.value.clearAlerts"
          @click="alerts.clearAlerts()"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Alert list -->
    <div class="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
      <TransitionGroup
        name="slide-up"
        tag="div"
      >
        <AlertItem
          v-for="alert in alerts.alerts.value"
          :key="alert.id"
          :alert="alert"
        />
      </TransitionGroup>

      <div
        v-if="!alerts.alerts.value.length"
        class="flex items-center justify-center h-24 text-[var(--color-text-muted)] text-xs"
      >
        {{ store.t.value.noAlerts }}
      </div>
    </div>
  </div>
</template>
