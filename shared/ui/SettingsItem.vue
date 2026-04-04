<script setup lang="ts">
defineProps<{
  label: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
<div class="flex items-center justify-between px-4 py-3 cursor-pointer" @click="emit('click')">
  <div class="flex items-center gap-3">
    <div class="size-8 rounded-lg flex-center bg-faint opacity-80">
      <slot name="icon" />
    </div>
    <span class="text-sm">{{ label }}</span>
  </div>
  <slot />
</div>
</template>
