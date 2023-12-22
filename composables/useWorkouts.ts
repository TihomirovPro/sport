import { ref, onValue, child, push } from 'firebase/database'
import { db, dbPath, createData } from './firebaseInit'
import type { TypeWorkout, TypeWorkoutCreate } from "./types"

export const getWorkouts = async (exercisesId:string) => {
  const filteredWorkouts = useFilteredWorkouts()
  const allworkouts = useWorkouts()
  
  const workouts = ref(db, dbPath(`workout/${exercisesId}`))

  onValue(workouts, (snapshot) => {
    const data = snapshot.val()

    if (data) {
      allworkouts.value = []
      Object.keys(data).forEach((key) => {
        const workout:TypeWorkout = data[key]
        if (exercisesId === workout.exercisesId) {
          allworkouts.value.push({
            id: key,
            exercisesId: workout.exercisesId,
            date: workout.date,
            interval: workout.interval,
            ease: workout.ease,
            rubber: workout.rubber,
            approach: workout.approach,
            weight: workout.weight,
            desc: workout.desc,
            res: workout.res,
          })
        }
      })

      allworkouts.value.sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) return 1
        if (new Date(a.date) > new Date(b.date)) return -1
        return 0
      })

      filteredWorkouts.value = [...allworkouts.value]
    } else {
      allworkouts.value = []
      filteredWorkouts.value = []
    }
  })
}

// Create
export const createWorkout = (workout:TypeWorkoutCreate) => {
  const newWorkoutKey = push(child(ref(db), 'workout')).key
  createData(`workout/${workout.exercisesId}/${newWorkoutKey}`, workout)
}
