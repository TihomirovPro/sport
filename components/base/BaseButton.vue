<script setup>
const props = defineProps({
    text: String
});
</script>

<template lang="pug">
button.button {{text}}
</template>

<style lang="stylus" scoped>
.button
  cursor pointer
  display block
  min-width 100px
  width min-content
  padding 10px 16px
  background #3b6ec9
  color #fff
  text-align center
  border-radius 4px
  transition .24s

  &._text
    background #fff
    color #040427

    &:hover
      background #e3ecfc

  &:hover
    background #5682d0
</style>