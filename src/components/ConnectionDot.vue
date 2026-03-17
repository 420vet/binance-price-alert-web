<script setup>
defineProps({
  status: {
    type: String,
    default: 'disconnected', // 'connected' | 'reconnecting' | 'disconnected'
  },
})
</script>

<template>
  <span class="flex items-center gap-1.5">
    <span
      class="inline-block w-2.5 h-2.5 rounded-full"
      :class="{
        'bg-[var(--color-green)] shadow-[0_0_6px_var(--color-green)] animate-pulse': status === 'connected',
        'bg-[var(--color-warn)] animate-pulse': status === 'reconnecting',
        'bg-[var(--color-text-muted)]': status === 'disconnected',
      }"
    />
    <span
      class="text-xs"
      :class="{
        'text-[var(--color-green)]': status === 'connected',
        'text-[var(--color-warn)]': status === 'reconnecting',
        'text-[var(--color-text-muted)]': status === 'disconnected',
      }"
    >
      <slot>{{ status }}</slot>
    </span>
  </span>
</template>
