<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../composables/useStore.js'
import PriceRow from './PriceRow.vue'

defineProps({
  selectedSymbol: { type: String, default: null },
})
const emit = defineEmits(['select'])

const store = useStore()

const sortKey = ref('symbol')
const sortDir = ref('asc')

const spikeSymbols = computed(() => {
  return new Set(store.alerts.alerts.value.slice(0, 5).map((a) => a.symbol))
})

const sortedSymbols = computed(() => {
  const syms = [...store.settings.symbols]
  return syms.sort((a, b) => {
    const ta = store.ws.tickerMap[a]
    const tb = store.ws.tickerMap[b]
    let va, vb

    switch (sortKey.value) {
      case 'priceUSDT':
        va = ta?.priceUSDT ?? -Infinity
        vb = tb?.priceUSDT ?? -Infinity
        break
      case 'change24h':
        va = ta?.change24h ?? -Infinity
        vb = tb?.change24h ?? -Infinity
        break
      case 'vol24h':
        va = ta?.vol24h ?? -Infinity
        vb = tb?.vol24h ?? -Infinity
        break
      default:
        va = a
        vb = b
    }

    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
})

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function removeSymbol(sym) {
  const syms = store.settings.symbols.filter((s) => s !== sym)
  store.updateSetting('symbols', syms)
}

function sortIcon(key) {
  if (sortKey.value !== key) return '⇅'
  return sortDir.value === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div
    class="rounded-lg border overflow-x-auto"
    :class="store.theme.value === 'dark'
      ? 'bg-[var(--color-surface-card)] border-[var(--color-surface-border)]'
      : 'bg-[var(--color-light-card)] border-[var(--color-light-border)]'"
  >
    <table class="w-full text-sm">
      <thead>
        <tr
          class="border-b text-xs uppercase tracking-wide"
          :class="store.theme.value === 'dark'
            ? 'border-[var(--color-surface-border)] text-[var(--color-text-muted)]'
            : 'border-[var(--color-light-border)] text-[var(--color-light-text-secondary)]'"
        >
          <th
            class="px-3 py-2 text-left cursor-pointer hover:text-[var(--color-neon)] select-none"
            @click="toggleSort('symbol')"
          >
            {{ store.t.value.symbol }} {{ sortIcon('symbol') }}
          </th>
          <th
            class="px-3 py-2 text-right cursor-pointer hover:text-[var(--color-neon)] select-none"
            @click="toggleSort('priceUSDT')"
          >
            {{ store.t.value.priceUSDT }} {{ sortIcon('priceUSDT') }}
          </th>
          <th class="px-3 py-2 text-right select-none">
            {{ store.t.value.priceEUR }}
          </th>
          <th
            class="px-3 py-2 text-right cursor-pointer hover:text-[var(--color-neon)] select-none"
            @click="toggleSort('change24h')"
          >
            24h {{ sortIcon('change24h') }}
          </th>
          <th class="px-3 py-2 text-right hidden md:table-cell">
            High
          </th>
          <th class="px-3 py-2 text-right hidden md:table-cell">
            Low
          </th>
          <th
            class="px-3 py-2 text-right cursor-pointer hover:text-[var(--color-neon)] select-none hidden lg:table-cell"
            @click="toggleSort('vol24h')"
          >
            Vol {{ sortIcon('vol24h') }}
          </th>
          <th class="px-3 py-2 w-8" />
        </tr>
      </thead>
      <tbody>
        <PriceRow
          v-for="sym in sortedSymbols"
          :key="sym"
          :symbol="sym"
          :ticker="store.ws.tickerMap[sym] ?? null"
          :is-selected="sym === selectedSymbol"
          :is-spike="spikeSymbols.has(sym)"
          @select="emit('select', sym)"
          @remove="removeSymbol"
        />
        <tr v-if="sortedSymbols.length === 0">
          <td
            colspan="8"
            class="text-center py-8 text-[var(--color-text-muted)]"
          >
            No symbols. Click "+ {{ store.t.value.addToken }}" to add one.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
