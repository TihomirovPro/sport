import { onData } from './firebaseInit'
import type { TypeWorkout } from "./types"
import { normalizeWorkoutDate } from './useWorkoutHelpers'

let workoutsUnsubscribe: (() => void) | null = null
let activeWorkoutExerciseId = ''
type TypeWorkoutDb = Omit<TypeWorkout, 'id' | 'date' | 'rpe'> & {
  date: number | string
  rpe?: number | null
}

export const stopWorkoutsSubscription = () => {
  if (workoutsUnsubscribe) {
    workoutsUnsubscribe()
    workoutsUnsubscribe = null
  }
  activeWorkoutExerciseId = ''
}

export const getWorkouts = (exercisesId:string) => {
  const workoutStore = useWorkoutStore()
  if (!exercisesId) {
    stopWorkoutsSubscription()
    workoutStore.workouts = []
    workoutStore.filteredWorkouts = []
    return () => {}
  }

  if (activeWorkoutExerciseId === exercisesId && workoutsUnsubscribe) {
    return workoutsUnsubscribe
  }

  // Prevent showing stale workouts from previously selected exercise,
  // especially when offline cache for the new exercise is empty.
  workoutStore.workouts = []
  workoutStore.filteredWorkouts = []

  stopWorkoutsSubscription()
  activeWorkoutExerciseId = exercisesId

  workoutsUnsubscribe = onData(`workout/${exercisesId}`, (snapshot) => {
    const data = snapshot.val() as Record<string, TypeWorkoutDb> | null

    if (data) {
      workoutStore.workouts = []
      Object.keys(data).forEach((key) => {
        const workout = data[key]
        if (!workout) return

        workoutStore.workouts.push({
          id: key,
          exercisesId: workout.exercisesId,
          date: normalizeWorkoutDate(workout.date),
          interval: workout.interval,
          ease: workout.ease,
          rpe: Number.isFinite(Number(workout.rpe)) ? Number(workout.rpe) : undefined,
          rubber: workout.rubber,
          complexExercises: Array.isArray(workout.complexExercises)
            ? workout.complexExercises
              .map((item) => String(item ?? '').trim())
              .filter(Boolean)
            : [],
          approach: workout.approach,
          weight: workout.weight,
          desc: workout.desc,
          res: workout.res,
          resWeigth: Array.isArray(workout.weight)
            ? workout.weight.reduce((acc:number, item:number, index:number):number => {
              const normalizedWeight = Number(item)
              const normalizedApproach = Number(workout.approach?.[index] ?? 0)

              if (!Number.isFinite(normalizedWeight) || !Number.isFinite(normalizedApproach)) {
                return acc
              }

              return acc + (normalizedWeight * normalizedApproach)
            }, 0)
            : 0
        })
      })

      workoutStore.workouts.sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) return 1
        if (new Date(a.date) > new Date(b.date)) return -1
        return 0
      })

      workoutStore.filteredWorkouts = [...workoutStore.workouts]
    } else {
      workoutStore.workouts = []
      workoutStore.filteredWorkouts = []
    }
  })

  return workoutsUnsubscribe
}
