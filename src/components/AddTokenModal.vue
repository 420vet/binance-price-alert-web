<script setup>
import { ref } from 'vue'
import { useStore } from '../composables/useStore.js'
import { validateSymbol } from '../composables/useBinanceREST.js'

const store = useStore()
const emit = defineEmits(['close'])

const input = ref('')
const error = ref('')
const loading = ref(false)

async function addSymbol() {
  const sym = input.value.trim().toUpperCase()
  if (!sym) return

  if (store.settings.symbols.includes(sym)) {
    error.value = store.t.value.symbolExists
    return
  }

  loading.value = true
  error.value = ''

  const valid = await validateSymbol(sym)
  loading.value = false

  if (!valid) {
    error.value = store.t.value.symbolInvalid
    return
  }

  store.updateSetting('symbols', [...store.settings.symbols, sym])
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Enter') addSymbol()
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background: rgba(0,0,0,0.7)"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-sm rounded-xl border shadow-2xl"
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
        <span class="font-bold">➕ {{ store.t.value.addToken }}</span>
        <button
          class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="px-5 py-5 space-y-4">
        <div>
          <input
            v-model="input"
            type="text"
            :placeholder="store.t.value.symbolPlaceholder"
            class="w-full px-3 py-2.5 rounded border font-mono text-sm bg-transparent outline-none focus:ring-2 focus:ring-[var(--color-neon)]/50 uppercase"
            :class="[
              store.theme.value === 'dark'
                ? 'border-[var(--color-surface-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]'
                : 'border-[var(--color-light-border)] text-[var(--color-light-text-primary)]',
              error ? 'border-[var(--color-spike)]' : '',
            ]"
            autofocus
            @keydown="onKeydown"
          >
          <Transition name="slide-up">
            <p
              v-if="error"
              class="text-xs text-[var(--color-spike)] mt-1.5"
            >
              {{ error }}
            </p>
          </Transition>
        </div>

        <p class="text-xs text-[var(--color-text-muted)]">
          Pair traded as {SYMBOL}USDT on Binance spot
        </p>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-end gap-3 px-5 py-4 border-t"
        :class="store.theme.value === 'dark'
          ? 'border-[var(--color-surface-border)]'
          : 'border-[var(--color-light-border)]'"
      >
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
          class="px-4 py-2 rounded text-sm font-medium bg-[var(--color-neon)] text-black hover:bg-[var(--color-neon)]/80 transition-colors disabled:opacity-50 flex items-center gap-2"
          :disabled="!input.trim() || loading"
          @click="addSymbol"
        >
          <span
            v-if="loading"
            class="animate-spin"
          >⟳</span>
          {{ store.t.value.addSymbol }}
        </button>
      </div>
    </div>
  </div>
</template>
