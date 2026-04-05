import type { TypeExercise } from '~/features/exercise/model/types'

export const useExerciseStore = defineStore('exercise', () => {
  const allExercises = ref<TypeExercise[]>([])
  const allExercisesLoaded = ref(false)

  return {
    allExercises,
    allExercisesLoaded,
  }
})
