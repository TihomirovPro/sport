<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const pagesWithoutBackBtn = ['index']
const isShowBackBtn = computed(() => !pagesWithoutBackBtn.includes(route.name))
const headerTitle = useHeaderTitle()
const selectUpdateExercise = useSelectUpdateExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const activeExercise = useActiveExercise()

const name = computed(() => cyrToLat(activeExercise.value?.name))

function back() {
  if (route.name === 'workout') {
    selectUpdateWorkout.value = null
    localStorage.removeItem('newWorkout')
    localStorage.removeItem('approaches')
    router.push('/exercise-item')
    return
  }

  if (activeExercise.value && route.name === 'exercise-item') {
    activeExercise.value = null
    localStorage.removeItem('activeExercise')
  }

  if (selectUpdateExercise.value) selectUpdateExercise.value = null
  router.push('/')
}
</script>

<template lang="pug">
header.header.px-3.sticky.top-0.bg-blue-500
  .max-w-2xl.mx-auto.flex.flex-wrap.items-center.justify-between.h-14
    .header__title {{ headerTitle }}
    .header__back(
      v-if="isShowBackBtn"
      @click="back"
    ) Назад
</template>

<style lang="stylus">
.header
  z-index 100
  box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)

  &__title
    color rgba(#fff,.8)
    font-size 20px

  &__back
    color rgba(#fff,.8)
</style>
