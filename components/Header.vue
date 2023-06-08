<script setup>
const route = useRoute()

const pagesWithoutBackBtn = ['index']

const pagesTitles = {
  index: 'Упражнения',
  settings: 'Настройки',
  measure: 'Замеры',
  profile: 'Профиль',
  default: route.params.name
}

const isShowBackBtn = computed(() => !pagesWithoutBackBtn.includes(route.name))
const title = computed(() => pagesTitles[route.name] || pagesTitles.default)

const activeExercise = useActiveExercise()
const isActiveFilters = useActiveFilters()

const removeActive = async () => {
  activeExercise.value = ''
  isActiveFilters.value = false
}
</script>

<template lang="pug">
header.header
  .header__title {{ title }}
  NuxtLink.header__back(
    v-if="isShowBackBtn"
    to="/"
    @click="removeActive"
    ) Назад
</template>

<style lang="stylus">
.header
  z-index 100
  position relative
  width 100%
  display flex
  flex-wrap wrap
  align-items center
  justify-content space-between
  padding 0 12px
  height 50px
  background #5182dc
  box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)

  &__title
    color rgba(#fff,.8)
    font-size 20px

  &__back
    color rgba(#fff,.8)

  &__wrap
    display flex
    align-items center
    gap 10px
</style>
