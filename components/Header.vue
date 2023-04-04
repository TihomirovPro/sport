<script setup>
const props = defineProps({
  title: String,
  backBtn: Boolean
});

const activeExercise = useActiveExercise()

const removeActive = async () => {
  activeExercise.value = ''
}

</script>

<template lang="pug">
header.header
  .header__title {{ title }}
  NuxtLink.header__back(
    v-if="backBtn"
    to="/"
    @click="removeActive"
    ) Назад
  //- NuxtLink.detail__back(to="/settings" @click="removeActive") Настройки

</template>

<style lang="stylus">
.header
  z-index 10
  position relative
  width 100%
  display flex
  justify-content space-between
  padding 15px
  background #5182dc
  box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)

  &__title
    color rgba(#fff,.8)
    font-size 20px

  &__back
    color rgba(#fff,.8)
</style>