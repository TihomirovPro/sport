<script setup lang="ts">
defineProps<{ ariaLabel?: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
<button
  class="
    glass relative
    size-12 flex-center rounded-full shrink-0 cursor-pointer
  "
  :aria-label="ariaLabel"
  @click="$emit('click')"
>
  <slot />
</button>
</template>
