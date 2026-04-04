<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  hint?: string
}>()
</script>

<template>
<div class="border border-faint rounded-xl p-8 grid place-items-center gap-2">
  <p class="text-2xl">{{ icon }}</p>
  <p class="text-sm text-gray-500 text-center">{{ title }}</p>
  <p v-if="hint" class="text-xs text-gray-500 text-center">{{ hint }}</p>
</div>
</template>
