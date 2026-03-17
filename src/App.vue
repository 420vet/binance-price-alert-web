<script setup>
import { onMounted, ref } from 'vue'
import { createStore, provideStore } from './composables/useStore.js'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import PriceTable from './components/PriceTable.vue'
import CandlestickChart from './components/CandlestickChart.vue'
import AlertsPanel from './components/AlertsPanel.vue'
import SettingsModal from './components/SettingsModal.vue'
import AddTokenModal from './components/AddTokenModal.vue'

const store = createStore()
provideStore(store)

const showSettings = ref(false)
const showAddToken = ref(false)
const selectedSymbol = ref(null)

function onSelectSymbol(sym) {
  selectedSymbol.value = sym
}

onMounted(() => {
  store.init()
  // Set initial selected symbol
  if (store.settings.symbols.length > 0) {
    selectedSymbol.value = store.settings.symbols[0]
  }
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col"
    :class="
      store.theme.value === 'dark'
        ? 'bg-[var(--color-surface-base)] text-[var(--color-text-primary)]'
        : 'bg-[var(--color-light-base)] text-[var(--color-light-text-primary)]'
    "
  >
    <AppHeader @settings="showSettings = true" @add-token="showAddToken = true" />

    <main class="flex-1 flex flex-col gap-4 p-4 w-full mx-auto w-full">
      <!-- Price Table -->
      <PriceTable :selected-symbol="selectedSymbol" @select="onSelectSymbol" />

      <!-- Chart + Alerts row -->
      <div class="flex gap-4 flex-col lg:flex-row">
        <div class="flex-1 min-w-0">
          <CandlestickChart :symbol="selectedSymbol" />
        </div>
        <div class="lg:w-80 w-full">
          <AlertsPanel />
        </div>
      </div>
    </main>

    <AppFooter />

    <Transition name="fade">
      <SettingsModal v-if="showSettings" @close="showSettings = false" />
    </Transition>

    <Transition name="fade">
      <AddTokenModal v-if="showAddToken" @close="showAddToken = false" />
    </Transition>
  </div>
</template>
