<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { TypeExercise } from '~/composables/types'

const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { filteredWorkouts } = storeToRefs(workoutStore)
const { activeExercise } = storeToRefs(exerciseStore)
const router = useRouter()
const { notifyError } = useNotifications()

function readStoredActiveExercise() {
  const raw = localStorage.getItem('activeExercise')
  if (!raw) return null

  try {
    return JSON.parse(raw) as { id?: string; name?: string }
  } catch {
    return null
  }
}

function normalizeStoredActiveExercise(value: unknown) {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<TypeExercise>
  if (!candidate.id) return null

  return {
    id: candidate.id,
    name: candidate.name ?? '',
    ease: Array.isArray(candidate.ease) ? candidate.ease : [],
    order: typeof candidate.order === 'number' ? candidate.order : 0,
    color: candidate.color,
    icon: candidate.icon,
    isComplex: candidate.isComplex,
    complexDesc: candidate.complexDesc,
  } satisfies TypeExercise
}

if (!activeExercise.value) {
  const storedActiveExercise = readStoredActiveExercise()
  const normalizedActiveExercise = normalizeStoredActiveExercise(storedActiveExercise)
  if (normalizedActiveExercise) {
    activeExercise.value = normalizedActiveExercise
  }
}

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
