<script setup>
import { reactive } from 'vue'
import { useStore } from '../composables/useStore.js'
import { LANGUAGES } from '../composables/useI18n.js'

const store = useStore()
const emit = defineEmits(['close'])

// Local copy for editing
const local = reactive({ ...store.settings })

function save() {
  for (const key of Object.keys(local)) {
    store.updateSetting(key, local[key])
  }
  emit('close')
}

function reset() {
  store.resetToDefaults()
  Object.assign(local, store.settings)
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background: rgba(0,0,0,0.7)"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-md rounded-xl border shadow-2xl max-h-[90vh] overflow-y-auto"
      :class="store.theme.value === 'dark'
        ? 'bg-[var(--color-surface-card)] border-[var(--color-surface-border)]'
        : 'bg-[var(--color-light-card)] border-[var(--color-light-border)]'"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-5 py-4 border-b"
        :class="store.theme.value === 'dark'
          ? 'border-[var(--color-surface-border)]'
          : 'border-[var(--color-light-border)]'"
      >
        <span class="font-bold">⚙️ {{ store.t.value.settings }}</span>
        <button
          class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="px-5 py-4 space-y-5">
        <!-- Threshold -->
        <label class="block">
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {{ store.t.value.threshold }}
          </span>
          <div class="flex items-center gap-3 mt-1.5">
            <input
              v-model.number="local.threshold"
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              class="flex-1 accent-[var(--color-neon)]"
            >
            <span class="text-[var(--color-neon)] font-mono w-14 text-right">
              {{ local.threshold.toFixed(1) }}%
            </span>
          </div>
        </label>

        <!-- Window -->
        <label class="block">
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {{ store.t.value.windowMin }}
          </span>
          <div class="flex items-center gap-3 mt-1.5">
            <input
              v-model.number="local.windowMin"
              type="range"
              min="1"
              max="60"
              step="1"
              class="flex-1 accent-[var(--color-neon)]"
            >
            <span class="text-[var(--color-neon)] font-mono w-14 text-right">
              {{ local.windowMin }}m
            </span>
          </div>
        </label>

        <!-- Reset Hour -->
        <label class="block">
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {{ store.t.value.resetHour }}
          </span>
          <div class="flex items-center gap-3 mt-1.5">
            <input
              v-model.number="local.resetHour"
              type="range"
              min="0"
              max="23"
              step="1"
              class="flex-1 accent-[var(--color-neon)]"
            >
            <span class="text-[var(--color-neon)] font-mono w-14 text-right">
              {{ String(local.resetHour).padStart(2, '0') }}:00
            </span>
          </div>
        </label>

        <!-- Font Size -->
        <label class="block">
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {{ store.t.value.fontSize }}
          </span>
          <div class="flex items-center gap-3 mt-1.5">
            <input
              v-model.number="local.fontSize"
              type="range"
              min="11"
              max="18"
              step="1"
              class="flex-1 accent-[var(--color-neon)]"
            >
            <span class="text-[var(--color-neon)] font-mono w-14 text-right">
              {{ local.fontSize }}px
            </span>
          </div>
        </label>

        <!-- Language -->
        <label class="block">
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {{ store.t.value.language }}
          </span>
          <select
            v-model="local.language"
            class="mt-1.5 w-full px-3 py-2 rounded border font-mono text-sm bg-transparent"
            :class="store.theme.value === 'dark'
              ? 'border-[var(--color-surface-border)] text-[var(--color-text-primary)]'
              : 'border-[var(--color-light-border)] text-[var(--color-light-text-primary)]'"
          >
            <option
              v-for="lang in LANGUAGES"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.label }}
            </option>
          </select>
        </label>

        <!-- Notifications -->
        <div>
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {{ store.t.value.enableNotif }}
          </span>
          <div class="mt-1.5 flex items-center gap-3">
            <span
              class="text-xs"
              :class="store.alerts.notifEnabled.value ? 'text-[var(--color-green)]' : 'text-[var(--color-text-muted)]'"
            >
              {{ store.alerts.notifEnabled.value ? '✓ Granted' : '✗ Not granted' }}
            </span>
            <button
              v-if="!store.alerts.notifEnabled.value"
              class="text-xs px-3 py-1.5 rounded border border-[var(--color-neon)]/40 text-[var(--color-neon)] hover:bg-[var(--color-neon)]/10 transition-colors"
              @click="store.alerts.requestNotifPermission()"
            >
              {{ store.t.value.requestNotif }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-between px-5 py-4 border-t gap-3"
        :class="store.theme.value === 'dark'
          ? 'border-[var(--color-surface-border)]'
          : 'border-[var(--color-light-border)]'"
      >
        <button
          class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-spike)] transition-colors"
          @click="reset"
        >
          {{ store.t.value.reset }}
        </button>
        <div class="flex gap-3">
          <button
            class="px-4 py-2 rounded text-sm border transition-colors"
            :class="store.theme.value === 'dark'
              ? 'border-[var(--color-surface-border)] hover:bg-[var(--color-surface-elevated)]'
              : 'border-[var(--color-light-border)] hover:bg-[var(--color-light-elevated)]'"
            @click="emit('close')"
          >
            {{ store.t.value.cancel }}
          </button>
          <button
            class="px-4 py-2 rounded text-sm font-medium bg-[var(--color-neon)] text-black hover:bg-[var(--color-neon)]/80 transition-colors"
            @click="save"
          >
            {{ store.t.value.save }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
