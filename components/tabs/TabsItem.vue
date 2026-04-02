<script setup lang="ts">
defineProps<{
  active?: boolean
  title: string | number
}>()
</script>

<template>
<div
  class="w-full py-3 text-center text-sm rounded-lg transition cursor-pointer"
  :class="{ 'bg-accent/20': !active, 'text-white !bg-accent': active }"
>
  {{ title }}
</div>
</template>