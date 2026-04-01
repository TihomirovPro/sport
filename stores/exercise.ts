import type { TypeExercise } from '~/composables/types'
import { ACTIVE_EXERCISE_STORAGE_KEY } from '~/composables/storageKeys'
import { idbStorage } from '~/composables/storage/idb'

export const useExerciseStore = defineStore('exercise', () => {
  const allExercises = ref<TypeExercise[]>([])
  const allExercisesLoaded = ref(false)
  const activeExercise = ref<TypeExercise | null>(null)
  const selectUpdateExercise = ref<TypeExercise | null>(null)

  function setActiveExercise(exercise: TypeExercise | null) {
    activeExercise.value = exercise
    if (!import.meta.client) return

    if (exercise) {
      idbStorage.setItem(ACTIVE_EXERCISE_STORAGE_KEY, JSON.stringify(exercise))
      return
    }

    idbStorage.removeItem(ACTIVE_EXERCISE_STORAGE_KEY)
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
    allExercisesLoaded,
    activeExercise,
    selectUpdateExercise,
    setActiveExercise,
    patchActiveExercise,
  }
})
