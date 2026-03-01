import { EnumEase, type TypeWorkout, type WorkoutActiveFilters, type WorkoutFormDefaults } from '~/composables/types'

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<TypeWorkout[]>([])
  const filteredWorkouts = ref<TypeWorkout[]>([])
  const workoutsLoaded = ref(false)
  const selectUpdateWorkout = ref<TypeWorkout | null>(null)
  const activeFilters = ref<WorkoutActiveFilters>({
    ease: '',
    interval: 0,
    approach: 0
  })
  const formDefaults = ref<WorkoutFormDefaults>({
    interval: '2.5',
    approaches: 5,
    ease: EnumEase.noWeight,
  })

  function resolveFormDefaults(availableEases: EnumEase[] = [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]): WorkoutFormDefaults {
    const normalizedEases = availableEases.length
      ? availableEases
      : [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]

    const fallbackEase = normalizedEases.includes(formDefaults.value.ease)
      ? formDefaults.value.ease
      : (normalizedEases[0] ?? EnumEase.noWeight)

    const ease = activeFilters.value.ease && normalizedEases.includes(activeFilters.value.ease)
      ? activeFilters.value.ease
      : fallbackEase

    return {
      interval: activeFilters.value.interval > 0 ? String(activeFilters.value.interval) : formDefaults.value.interval,
      approaches: activeFilters.value.approach > 0 ? activeFilters.value.approach : formDefaults.value.approaches,
      ease
    }
  }

  return {
    workouts,
    filteredWorkouts,
    workoutsLoaded,
    selectUpdateWorkout,
    activeFilters,
    formDefaults,
    resolveFormDefaults
  }
})
