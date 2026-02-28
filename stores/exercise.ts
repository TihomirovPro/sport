import type { TypeExercise } from '~/composables/types'
import { ACTIVE_EXERCISE_STORAGE_KEY } from '~/composables/storageKeys'

export const useExerciseStore = defineStore('exercise', () => {
  const allExercises = ref<TypeExercise[]>([])
  const activeExercise = ref<TypeExercise | null>(null)
  const selectUpdateExercise = ref<TypeExercise | null>(null)

  function setActiveExercise(exercise: TypeExercise | null) {
    activeExercise.value = exercise
    if (!import.meta.client) return

    if (exercise) {
      localStorage.setItem(ACTIVE_EXERCISE_STORAGE_KEY, JSON.stringify(exercise))
      return
    }

    localStorage.removeItem(ACTIVE_EXERCISE_STORAGE_KEY)
  }

  function patchActiveExercise(patch: Partial<TypeExercise>) {
    if (!activeExercise.value) return

    setActiveExercise({
      ...activeExercise.value,
      ...patch,
    })
  }

  return {
    allExercises,
    activeExercise,
    selectUpdateExercise,
    setActiveExercise,
    patchActiveExercise,
  }
})
