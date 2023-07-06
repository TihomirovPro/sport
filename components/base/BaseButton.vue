<script setup lang="ts">
defineProps<{
  text: string
  red?: boolean
}>()
</script>

<template lang="pug">
button.button(
  class=`
    cursor-pointer transition
    block w-full py-2.5 px-4
    text-white text-centetext-lg
    bg-[#3b6ec9] hover_bg-[#5682d0] rounded
  `
  :class="{ _red: red }"
) {{ text }}
</template>

<style lang="stylus" scoped>
.button
  &._red
    background darken(red, 10%)

    &:hover
      background darken(red, 20%)
</style>
