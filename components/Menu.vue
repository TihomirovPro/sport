
<script setup>
const isShowMenu = useShowMenu()
</script>

<template lang="pug">
.menu(@click.self="isShowMenu = false")
  .menu__container
    p Замеры
    p Настройки
    p Выход
</template>

<style lang="stylus" scoped>
.menu
  z-index 110
  position fixed
  left 0
  top 0
  height 100%
  width 100%
  background rgba(0, 0, 0, .5)

  &__container
    padding 12px
    width 50%
    height 100%
    background #fff
</style>