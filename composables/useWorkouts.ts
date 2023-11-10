import { getDatabase, ref, onValue, set, child, push, remove, update } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import type { TypeWorkout, TypeWorkoutCreate } from "./types"

export const getWorkouts = async (exercisesId:string) => {
  const db = getDatabase()
  const auth = getAuth()

  const filteredWorkouts = useFilteredWorkouts()
  const allworkouts = useWorkouts()
  
  const workouts = ref(db, `users/${auth.currentUser?.uid}/workout`)

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
            // date: workout.date.includes('-') ? new Intl.DateTimeFormat('ru-RU', {
            //   year: 'numeric',
            //   month: 'long',
            //   day: 'numeric'
            // }).format(new Date(workout.date)).slice(0, -3) : workout.date,
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
    }
  })
}

// Create
export const createWorkout = async (workout:TypeWorkoutCreate) => {
  const db = getDatabase()
  const auth = getAuth()
  const newWorkoutKey = push(child(ref(db), 'workout')).key
  await set(ref(db, `users/${auth.currentUser?.uid}/workout/${newWorkoutKey}`), workout)
}

// Remove
export const removeWorkout = async (id:string) => {
  const db = getDatabase()
  const auth = getAuth()
  remove(ref(db, `users/${auth.currentUser?.uid}/workout/${id}`))
}

// Update
export const updateWorkout = async (id:string, workout:TypeWorkoutCreate) => {
  const db = getDatabase()
  const auth = getAuth()
  update(ref(db,  `users/${auth.currentUser?.uid}/workout/${id}`), workout);
}
