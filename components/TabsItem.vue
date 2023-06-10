<script setup lang="ts">
defineProps<{
  active: boolean
  title: string
}>()
</script>

<template lang="pug">
.w-full.py-3.text-center.rounded-lg.transition.cursor-pointer(
  class="bg-[#5182dc]/20"
  :class="{ 'text-white !bg-[#5182dc]' : active }"
  @click="$emit('click')"
) {{ title }}
</template>