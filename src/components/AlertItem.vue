<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import { formatPrice, formatPercent, formatTime } from '../utils/formatters.js'
import { useStore } from '../composables/useStore.js'
import { CRYPTO_ICON_BASE } from '../utils/constants.js'

const props = defineProps({
  alert: { type: Object, required: true },
})
const store = useStore()

const pctClass = computed(() =>
  props.alert.direction === 'up' ? 'text-[var(--color-green)]' : 'text-[var(--color-spike)]'
)
const iconUrl = computed(
  () => `${CRYPTO_ICON_BASE}/${props.alert.symbol.toLowerCase()}.png`
)
</script>

<template>
  <div
    class="flex items-start gap-2 px-3 py-2.5 border-b last:border-0"
    :class="store.theme.value === 'dark'
      ? 'border-[var(--color-surface-border)]'
      : 'border-[var(--color-light-border)]'"
  >
    <!-- Icon -->
    <div class="flex items-center gap-1 pt-0.5 shrink-0">
      <img
        :src="iconUrl"
        :alt="alert.symbol"
        class="w-5 h-5 rounded-full"
        @error="$event.target.style.display = 'none'"
      >
      <TrendingUp
        v-if="alert.direction === 'up'"
        class="w-3.5 h-3.5 text-[var(--color-green)]"
        :stroke-width="2.5"
      />
      <TrendingDown
        v-else
        class="w-3.5 h-3.5 text-[var(--color-spike)]"
        :stroke-width="2.5"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="font-bold text-[var(--color-neon)] text-xs">{{ alert.symbol }}</span>
        <span
          class="font-bold text-xs"
          :class="pctClass"
        >
          {{ formatPercent(alert.changePct) }}
        </span>
        <span class="text-xs font-mono">{{ formatPrice(alert.price) }}</span>
      </div>
      <div class="text-[10px] text-[var(--color-text-muted)] mt-0.5">
        {{ formatTime(alert.ts) }}
        · from {{ formatPrice(alert.oldPrice) }}
      </div>
    </div>
  </div>
</template>
