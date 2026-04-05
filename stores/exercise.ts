import type { TypeExercise } from '~/composables/types'

export const useExerciseStore = defineStore('exercise', () => {
  const allExercises = ref<TypeExercise[]>([])
  const allExercisesLoaded = ref(false)

  return {
    allExercises,
    allExercisesLoaded,
  }
})
