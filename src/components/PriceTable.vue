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
  // A symbol is "spiking" if its current window % meets the threshold
  const result = new Set()
  for (const sym of store.settings.symbols) {
    const p = store.pctMap[sym]
    if (p && Math.abs(p.pct) >= store.settings.threshold) result.add(sym)
  }
  return result
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
      case 'spikePct':
        va = store.pctMap[a]?.pct ?? -Infinity
        vb = store.pctMap[b]?.pct ?? -Infinity
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
          class="border-b text-xs uppercase tracking-wide select-none"
          :class="store.theme.value === 'dark'
            ? 'border-[var(--color-surface-border)] text-[var(--color-text-muted)]'
            : 'border-[var(--color-light-border)] text-[var(--color-light-text-secondary)]'"
        >
          <SortTh
            col="symbol"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            align="left"
            @sort="toggleSort"
          >
            {{ store.t.value.symbol }}
          </SortTh>
          <SortTh
            col="priceUSDT"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            @sort="toggleSort"
          >
            {{ store.t.value.priceUSDT }}
          </SortTh>
          <th class="px-3 py-2 text-right">
            {{ store.t.value.priceEUR }}
          </th>
          <SortTh
            col="change24h"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            @sort="toggleSort"
          >
            24h
          </SortTh>
          <SortTh
            col="spikePct"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            @sort="toggleSort"
          >
            {{ store.t.value.spike }} %
          </SortTh>
          <th class="px-3 py-2 text-right hidden md:table-cell">
            High
          </th>
          <th class="px-3 py-2 text-right hidden md:table-cell">
            Low
          </th>
          <SortTh
            col="vol24h"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            class="hidden lg:table-cell"
            @sort="toggleSort"
          >
            Vol
          </SortTh>
          <th class="px-3 py-2 w-8" />
        </tr>
      </thead>
      <tbody>
        <PriceRow
          v-for="sym in sortedSymbols"
          :key="sym"
          :symbol="sym"
          :ticker="store.ws.tickerMap[sym] ?? null"
          :spike-pct="store.pctMap[sym] ?? null"
          :is-selected="sym === selectedSymbol"
          :is-spike="spikeSymbols.has(sym)"
          @select="emit('select', sym)"
          @remove="removeSymbol"
        />
        <tr v-if="sortedSymbols.length === 0">
          <td
            colspan="9"
            class="text-center py-8 text-[var(--color-text-muted)]"
          >
            No symbols. Click "+ {{ store.t.value.addToken }}" to add one.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<!-- Inline sort-header sub-component to avoid repetition -->
<script>
import { h } from 'vue'
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-vue-next'

export const SortTh = {
  props: {
    col: String,
    sortKey: String,
    sortDir: String,
    align: { type: String, default: 'right' },
  },
  emits: ['sort'],
  setup(props, { emit, slots }) {
    return () => {
      const isActive = props.sortKey === props.col
      const iconEl = h(
        isActive
          ? props.sortDir === 'asc'
            ? ChevronUp
            : ChevronDown
          : ChevronsUpDown,
        { class: 'w-3 h-3 inline-block', strokeWidth: 2 }
      )
      return h(
        'th',
        {
          class: [
            'px-3 py-2 cursor-pointer hover:text-[var(--color-neon)] transition-colors whitespace-nowrap',
            props.align === 'left' ? 'text-left' : 'text-right',
          ],
          onClick: () => emit('sort', props.col),
        },
        [
          h('span', { class: 'inline-flex items-center gap-1' }, [
            slots.default?.(),
            iconEl,
          ]),
        ]
      )
    }
  },
}
</script>
