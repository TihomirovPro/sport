<script setup lang="ts">
defineProps<{
  text: string
  red: boolean
}>()
</script>

<template lang="pug">
button.button(
  :class="{ _red: red }"
) {{text}}
</template>

<style lang="stylus" scoped>
.button
  cursor pointer
  display block
  width 100%
  padding 10px 16px
  background #3b6ec9
  color #fff
  font-size 18px
  text-align center
  border-radius 4px
  transition .24s


  &._red
    background darken(red, 10%)

    &:hover
      background darken(red, 20%)

  &:hover
    background #5682d0

</style>