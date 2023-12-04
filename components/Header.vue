<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const pagesWithoutBackBtn = ['index']
const isShowBackBtn = computed(() => !pagesWithoutBackBtn.includes(route.name))
const headerTitle = useHeaderTitle()
const selectUpdateExercise = useSelectUpdateExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const activeExercise = useActiveExercise()

function back() {
  if (route.name === 'workout') {
    selectUpdateWorkout.value = null
    localStorage.removeItem('newWorkout')
    localStorage.removeItem('approaches')
    router.push('/exercise-item')
    return
  }

  if (activeExercise.value && route.name === 'settings') {
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
.header.px-3.sticky.top-0.bg-accent.shadow-md(class="z-50")
  .max-w-2xl.mx-auto.flex.flex-wrap.items-center.justify-between.h-14
    .text-xl(class="text-white/80") {{ headerTitle }}
    div(class="text-white/80")(
      v-if="isShowBackBtn"
      @click="back"
    ) Назад
</template>
