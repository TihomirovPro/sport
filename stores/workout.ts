import type { TypeWorkout } from '~/composables/types'

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<TypeWorkout[]>([])
  const filteredWorkouts = ref<TypeWorkout[]>([])
  const selectUpdateWorkout = ref<TypeWorkout | null>(null)

  return {
    workouts,
    filteredWorkouts,
    selectUpdateWorkout,
  }
})
