
<script setup>
const isShowMenu = useShowMenu()
</script>

<template lang="pug">
.menu(
  v-if="isShowMenu"
  @click.self="isShowMenu = false"
)
  .menu__container
    .menu__item Замеры
    .menu__item Настройки
    .menu__item._exit(@click="signOutUser") Выход
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
    display flex
    flex-direction column
    padding 12px
    width 50%
    height 100%
    background #fff

  &__item
    padding 12px

    &._exit
      margin-top auto
</style>