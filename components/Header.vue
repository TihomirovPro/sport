<script setup lang="ts">
const route = useRoute()
const pagesWithoutBackBtn = ['index']
const isShowBackBtn = computed(() => !pagesWithoutBackBtn.includes(route.name))
const headerTitle = useHeaderTitle()

// function back() {
//   headerTitle.value = 'Упражнения'
//   return '/'
// }
</script>

<template lang="pug">
header.header.px-3.sticky.top-0
  .max-w-2xl.mx-auto.flex.flex-wrap.items-center.justify-between.h-14
    .header__title {{ headerTitle }}
    div(@click="headerTitle = 'Упражнения'")
      NuxtLink.header__back(
        v-if="isShowBackBtn"
        to="/"
      ) Назад
</template>

<style lang="stylus">
.header
  background #5182dc
  box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)

  &__title
    color rgba(#fff,.8)
    font-size 20px

  &__back
    color rgba(#fff,.8)
</style>
