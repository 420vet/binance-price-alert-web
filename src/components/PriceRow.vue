<script setup>
import { computed } from 'vue'
import { X, TriangleAlert } from 'lucide-vue-next'
import { useStore } from '../composables/useStore.js'
import { formatPrice, formatPercent, formatVolume } from '../utils/formatters.js'
import { CRYPTO_ICON_BASE } from '../utils/constants.js'

const props = defineProps({
  symbol: { type: String, required: true },
  ticker: { type: Object, default: null },
  spikePct: { type: Object, default: null }, // { pct, direction } from pctMap
  isSelected: { type: Boolean, default: false },
  isSpike: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'remove'])
const store = useStore()

const iconUrl = computed(
  () => `${CRYPTO_ICON_BASE}/${props.symbol.toLowerCase()}.png`
)

const changeClass = computed(() => {
  if (!props.ticker) return ''
  return props.ticker.change24h >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-spike)]'
})

const spikePctClass = computed(() => {
  if (!props.spikePct) return 'text-[var(--color-text-muted)]'
  if (props.isSpike) return props.spikePct.direction === 'up' ? 'text-[var(--color-green)] font-bold' : 'text-[var(--color-spike)] font-bold'
  return props.spikePct.direction === 'up' ? 'text-[var(--color-green)]' : 'text-[var(--color-spike)]'
})
</script>

<template>
  <tr
    class="cursor-pointer transition-all border-b"
    :class="[
      isSelected
        ? 'bg-[var(--color-neon)]/5 border-[var(--color-neon)]/30'
        : store.theme.value === 'dark'
          ? 'border-[var(--color-surface-border)] hover:bg-[var(--color-surface-elevated)]'
          : 'border-[var(--color-light-border)] hover:bg-[var(--color-light-elevated)]',
      isSpike ? 'ring-2 ring-[var(--color-spike)] ring-inset bg-[var(--color-spike)]/5' : '',
    ]"
    @click="emit('select', symbol)"
  >
    <!-- Symbol -->
    <td class="px-3 py-2.5">
      <div class="flex items-center gap-2">
        <img
          :src="iconUrl"
          :alt="symbol"
          class="w-5 h-5 rounded-full shrink-0"
          @error="$event.target.style.display = 'none'"
        >
        <span class="font-bold text-[var(--color-neon)]">{{ symbol }}</span>
        <TriangleAlert
          v-if="isSpike"
          class="w-3 h-3 text-[var(--color-spike)] shrink-0"
          :stroke-width="2.5"
          :title="store.t.value.spike"
        />
      </div>
    </td>

    <!-- Price USDT -->
    <td class="px-3 py-2.5 text-right font-mono">
      <span v-if="ticker">{{ formatPrice(ticker.priceUSDT) }}</span>
      <span
        v-else
        class="text-[var(--color-text-muted)]"
      >—</span>
    </td>

    <!-- Price EUR -->
    <td class="px-3 py-2.5 text-right font-mono text-[var(--color-text-secondary)]">
      <span v-if="ticker">{{ formatPrice(ticker.priceEUR, 'EUR') }}</span>
      <span
        v-else
        class="text-[var(--color-text-muted)]"
      >—</span>
    </td>

    <!-- 24h change -->
    <td
      class="px-3 py-2.5 text-right font-mono"
      :class="changeClass"
    >
      <span v-if="ticker">{{ formatPercent(ticker.change24h) }}</span>
      <span
        v-else
        class="text-[var(--color-text-muted)]"
      >—</span>
    </td>

    <!-- Spike % (window) -->
    <td
      class="px-3 py-2.5 text-right font-mono"
      :class="spikePctClass"
    >
      <span v-if="spikePct">{{ formatPercent(spikePct.pct) }}</span>
      <span
        v-else
        class="text-[var(--color-text-muted)]"
      >—</span>
    </td>

    <!-- 24h high -->
    <td class="px-3 py-2.5 text-right font-mono text-[var(--color-text-secondary)] hidden md:table-cell">
      <span v-if="ticker">{{ formatPrice(ticker.high24h) }}</span>
      <span v-else>—</span>
    </td>

    <!-- 24h low -->
    <td class="px-3 py-2.5 text-right font-mono text-[var(--color-text-secondary)] hidden md:table-cell">
      <span v-if="ticker">{{ formatPrice(ticker.low24h) }}</span>
      <span v-else>—</span>
    </td>

    <!-- Volume -->
    <td class="px-3 py-2.5 text-right font-mono text-[var(--color-text-muted)] hidden lg:table-cell">
      <span v-if="ticker">{{ formatVolume(ticker.vol24h) }}</span>
      <span v-else>—</span>
    </td>

    <!-- Remove -->
    <td class="px-3 py-2.5 text-right">
      <button
        class="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-spike)] transition-colors"
        :title="store.t.value.removeToken"
        @click.stop="emit('remove', symbol)"
      >
        <X
          class="w-3 h-3"
          :stroke-width="2.5"
        />
      </button>
    </td>
  </tr>
</template>
