<script setup>
import { reactive } from 'vue'
import { Settings, X, Check } from 'lucide-vue-next'
import { useStore } from '../composables/useStore.js'
import { LANGUAGES } from '../composables/useI18n.js'
import SelectDropdown from './SelectDropdown.vue'

const store = useStore()
const emit = defineEmits(['close'])

// Local copy for editing
const local = reactive({ ...store.settings })

const langOptions = LANGUAGES.map((l) => ({ value: l.code, label: l.label, flag: l.flag }))

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

// Clamp number inputs to their allowed ranges on blur
function clamp(key, min, max) {
  const v = Number(local[key])
  if (isNaN(v)) { local[key] = min; return }
  local[key] = Math.min(max, Math.max(min, v))
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
        <span class="flex items-center gap-2 font-bold">
          <Settings class="w-4 h-4 text-[var(--color-neon)]" />
          {{ store.t.value.settings }}
        </span>
        <button
          class="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-5 py-4 space-y-5">
        <!-- Threshold -->
        <div>
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
            <input
              v-model.number="local.threshold"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              class="underline-input w-14"
              @blur="clamp('threshold', 0.1, 10)"
            >
            <span class="text-[var(--color-text-secondary)] text-xs w-3">%</span>
          </div>
        </div>

        <!-- Window -->
        <div>
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
            <input
              v-model.number="local.windowMin"
              type="number"
              min="1"
              max="60"
              step="1"
              class="underline-input w-14"
              @blur="clamp('windowMin', 1, 60)"
            >
            <span class="text-[var(--color-text-secondary)] text-xs w-3">m</span>
          </div>
        </div>

        <!-- Reset Hour -->
        <div>
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
            <input
              v-model.number="local.resetHour"
              type="number"
              min="0"
              max="23"
              step="1"
              class="underline-input w-14"
              @blur="clamp('resetHour', 0, 23)"
            >
            <span class="text-[var(--color-text-secondary)] text-xs w-3">h</span>
          </div>
        </div>

        <!-- Font Size -->
        <div>
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
            <input
              v-model.number="local.fontSize"
              type="number"
              min="11"
              max="18"
              step="1"
              class="underline-input w-14"
              @blur="clamp('fontSize', 11, 18)"
            >
            <span class="text-[var(--color-text-secondary)] text-xs w-3">px</span>
          </div>
        </div>

        <!-- Language -->
        <div>
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
            {{ store.t.value.language }}
          </span>
          <SelectDropdown
            v-model="local.language"
            :options="langOptions"
          />
        </div>

        <!-- Notifications -->
        <div>
          <span class="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
            {{ store.t.value.enableNotif }}
          </span>
          <div class="mt-1.5 flex items-center gap-3">
            <span
              class="flex items-center gap-1.5 text-xs"
              :class="store.alerts.notifEnabled.value ? 'text-[var(--color-green)]' : 'text-[var(--color-text-muted)]'"
            >
              <Check
                v-if="store.alerts.notifEnabled.value"
                class="w-3 h-3"
                :stroke-width="2.5"
              />
              {{ store.alerts.notifEnabled.value ? 'Granted' : 'Not granted' }}
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
