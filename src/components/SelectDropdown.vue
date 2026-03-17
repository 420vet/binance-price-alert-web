<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'
import { useStore } from '../composables/useStore.js'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: {
    type: Array,
    required: true,
    // Expected shape: [{ value, label, flag? }]
  },
})

const emit = defineEmits(['update:modelValue'])
const store = useStore()

const open = ref(false)
const triggerEl = ref(null)
const menuEl = ref(null)

const selected = computed(() => props.options.find((o) => o.value === props.modelValue))

function select(val) {
  emit('update:modelValue', val)
  open.value = false
}

function onOutsideClick(e) {
  if (!triggerEl.value?.contains(e.target) && !menuEl.value?.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick))
</script>

<template>
  <div class="relative">
    <!-- Trigger -->
    <button
      ref="triggerEl"
      type="button"
      class="flex items-center gap-2 w-full px-3 py-2 rounded border text-sm font-mono transition-colors"
      :class="store.theme.value === 'dark'
        ? 'bg-[var(--color-surface-elevated)] border-[var(--color-surface-border)] text-[var(--color-text-primary)] hover:border-[var(--color-neon)]/50'
        : 'bg-[var(--color-light-elevated)] border-[var(--color-light-border)] text-[var(--color-light-text-primary)] hover:border-[var(--color-neon)]/50'"
      @click="open = !open"
    >
      <span
        v-if="selected?.flag"
        class="text-base leading-none"
      >{{ selected.flag }}</span>
      <span class="flex-1 text-left">{{ selected?.label ?? modelValue }}</span>
      <ChevronDown
        class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        :stroke-width="2"
      />
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-[-4px]"
      leave-active-class="transition-all duration-100 ease-in"
      leave-to-class="opacity-0 translate-y-[-4px]"
    >
      <div
        v-if="open"
        ref="menuEl"
        class="absolute z-50 mt-1 w-full rounded-lg border shadow-xl overflow-hidden"
        :class="store.theme.value === 'dark'
          ? 'bg-[var(--color-surface-elevated)] border-[var(--color-surface-border)]'
          : 'bg-[var(--color-light-card)] border-[var(--color-light-border)] shadow-black/10'"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-mono transition-colors text-left"
          :class="[
            opt.value === modelValue
              ? store.theme.value === 'dark'
                ? 'bg-[var(--color-neon)]/10 text-[var(--color-neon)]'
                : 'bg-[var(--color-neon)]/10 text-[var(--color-neon)]'
              : store.theme.value === 'dark'
                ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)]'
                : 'text-[var(--color-light-text-primary)] hover:bg-[var(--color-light-elevated)]',
          ]"
          @click="select(opt.value)"
        >
          <span
            v-if="opt.flag"
            class="text-base leading-none w-5"
          >{{ opt.flag }}</span>
          <span class="flex-1">{{ opt.label }}</span>
          <Check
            v-if="opt.value === modelValue"
            class="w-3 h-3 shrink-0"
            :stroke-width="2.5"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>
