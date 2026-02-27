<script setup lang="ts">
import { storeToRefs } from 'pinia'

const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { filteredWorkouts } = storeToRefs(workoutStore)
const { activeExercise } = storeToRefs(exerciseStore)
const router = useRouter()
const { notifyError } = useNotifications()
const { restoreActiveExerciseFromStorage } = useActiveExercise()

restoreActiveExerciseFromStorage(activeExercise)

if (activeExercise.value?.id) {
  getWorkouts(activeExercise.value.id)
} else {
  notifyError('Нет данных упражнения в оффлайн-кэше. Откройте упражнение из списка.')
  void router.push('/')
}

watch(
  () => activeExercise.value?.id,
  (id) => {
    getWorkouts(id || '')
    appStore.headerTitle = String(activeExercise.value?.name || '')
  }
)

onUnmounted(() => {
  stopWorkoutsSubscription()
})

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
        :isComplex="Boolean(activeExercise?.isComplex)"
        :ease="item.ease"
        :rubber="item.rubber"
        :complexExercises="item.complexExercises"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
        :resWeigth="item.resWeigth"
      )
</template>
