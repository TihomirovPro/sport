<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  backTo: '/',
  clearActiveExercise: true
})

const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { filteredWorkouts, workoutsLoaded } = storeToRefs(workoutStore)
const { activeExercise } = storeToRefs(exerciseStore)
const router = useRouter()
const { notifyError } = useNotifications()
const { restoreActiveExerciseFromStorage } = useActiveExercise()

function toCreateWorkout() {
  void router.push('/workout')
}

onMounted(() => {
  restoreActiveExerciseFromStorage(activeExercise)

  if (activeExercise.value?.id) {
    getWorkouts(activeExercise.value.id)
  } else {
    notifyError('Нет данных упражнения в оффлайн-кэше. Откройте упражнение из списка.')
    void router.push('/')
  }
})

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

<template>
<div>
  <Filters />
  <div
    class="grid gap-4 pt-4"
    v-if="filteredWorkouts.length"
  >
    <template
      v-for="item in filteredWorkouts"
      :key="item.id"
    >
      <Workout
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
      />
    </template> 
  </div>
  <div
    class="grid gap-3 p-4 rounded-xl border border-faint text-center mt-4 bg-faint/20"
    v-else-if="workoutsLoaded"
  >
    <p class="text-sm opacity-75">У вас пока нет тренировок</p>
    <p class="text-xs opacity-60">Нажмите на плюс в правом верхнем углу или добавьте первую тренировку кнопкой ниже</p>
    <BaseButton
      text="Добавить тренировку"
      @click="toCreateWorkout"
    />
  </div>
</div>
</template>
