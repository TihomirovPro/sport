<script setup lang="ts">
defineProps<{
  active: boolean
  title: string | number
}>()
</script>

<template lang="pug">
.w-full.py-3.text-center.text-sm.rounded-lg.transition.cursor-pointer(
  class="bg-[#5182dc]/20"
  :class="{ 'text-white !bg-[#5182dc]' : active }"
) {{ title }}
</template>