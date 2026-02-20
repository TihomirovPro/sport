<script setup lang="ts">
import { storeToRefs } from 'pinia'

const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { filteredWorkouts } = storeToRefs(workoutStore)
const { activeExercise } = storeToRefs(exerciseStore)

if (!activeExercise.value && localStorage.getItem('activeExercise')) {
  activeExercise.value = JSON.parse(localStorage.getItem('activeExercise')!)
  await getWorkouts(activeExercise.value!.id)
}

appStore.headerTitle = String(activeExercise.value?.name)

useHead({
  title: activeExercise.value?.name
})
</script>

<template lang="pug">
div
  Filters
  .grid.gap-6.pt-4
    template(v-for="item in filteredWorkouts" :key="item.id")
      Workout(
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :ease="item.ease"
        :rubber="item.rubber"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
        :resWeigth="item.resWeigth"
      )
</template>
