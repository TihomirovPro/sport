<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  backTo: '/'
})

const route = useRoute()
const router = useRouter()
const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { filteredWorkouts, workoutsLoaded } = storeToRefs(workoutStore)
const { allExercises } = storeToRefs(exerciseStore)
const { notifyError } = useNotifications()

const exerciseId = computed(() => String(route.params.id))
const exercise = computed(() => allExercises.value.find(e => e.id === exerciseId.value) || null)

watch(exercise, (ex) => {
  if (ex) appStore.headerTitle = ex.name
}, { immediate: true })

useHead(() => ({ title: exercise.value?.name }))

onMounted(() => {
  if (!exerciseId.value) {
    notifyError('Упражнение не найдено')
    void router.push('/')
    return
  }
  getWorkouts(exerciseId.value)
})

onUnmounted(() => {
  stopWorkoutsSubscription()
})
</script>

<template>
<div>
  <Filters />
  <div class="grid gap-4 pt-4" v-if="filteredWorkouts.length">
    <template v-for="item in filteredWorkouts" :key="item.id">
      <Workout
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :isComplex="Boolean(exercise?.isComplex)"
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
    <UiButton
      text="Добавить тренировку"
      @click="router.push(`/exercise/${exerciseId}/workout`)"
    />
  </div>
</div>
</template>
