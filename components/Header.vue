<script setup lang="ts">
const activeExercise = useActiveExercise()
const route = useRoute()

const pagesWithoutBackBtn = ['index']
const isShowBackBtn = computed(() => !pagesWithoutBackBtn.includes(route.name))
</script>

<template lang="pug">
.header.px-3
  .max-w-2xl.mx-auto.flex.flex-wrap.items-center.justify-between.h-14
    .header__title {{ route.meta.title || route.params.name }}
    NuxtLink.header__back(
      v-if="isShowBackBtn"
      to="/"
      @click="activeExercise = ''"
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

  &__wrap
    display flex
    align-items center
    gap 10px
</style>
