import type { TypeExercise } from '~/composables/types'
import { IDB_KEYS } from '~/composables/storage/keys'
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
      idbStorage.setItem(IDB_KEYS.ACTIVE_EXERCISE, JSON.stringify(exercise))
      return
    }

    idbStorage.removeItem(IDB_KEYS.ACTIVE_EXERCISE)
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
