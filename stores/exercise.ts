import type { TypeExercise } from '~/composables/types'

export const useExerciseStore = defineStore('exercise', () => {
  const allExercises = ref<TypeExercise[]>([])
  const activeExercise = ref<TypeExercise | null>(null)
  const selectUpdateExercise = ref<TypeExercise | null>(null)

  return {
    allExercises,
    activeExercise,
    selectUpdateExercise,
  }
})
