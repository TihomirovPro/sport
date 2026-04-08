export default defineNuxtPlugin(() => {
  const exerciseStore = useExerciseStore()
  const workoutStore = useWorkoutStore()
  const weightStore = useWeightStore()

  initUser({
    onLogin() {
      getAllExercises()
    },
    onLogout() {
      stopAllExercisesSubscription()
      stopWorkoutsSubscription()
      exerciseStore.allExercises = []
      exerciseStore.allExercisesLoaded = false
      workoutStore.workouts = []
      workoutStore.filteredWorkouts = []
      workoutStore.workoutsLoaded = false
      workoutStore.selectUpdateWorkout = null
      weightStore.setWeightEntries([])
    },
  })
})
