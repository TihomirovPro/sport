import { getDatabase, ref, onValue, set, child, push, remove, update } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export const getWorkouts = async (userId, exercisesId) => {
  const db = getDatabase()
  const allworkouts = useWorkouts()
  let sortingWorkouts = []
  const workouts = ref(db, `users/${userId}/workout`)

  onValue(workouts, (snapshot) => {
    const data = snapshot.val()

    if (data) {
      allworkouts.value = []
      sortingWorkouts = []
      Object.keys(data).forEach((key) => {
        const workout = data[key]
        if (exercisesId === workout.exercisesId) {
          sortingWorkouts.push({
            exercisesId: workout.exercisesId,
            date: workout.date,
            interval: workout.interval,
            ease: workout.ease,
            rubber: workout.rubber,
            approach: workout.approach,
            weight: workout.weight,
            desc: workout.desc,
            res: workout.res,
            id: key,
            filter: true
          })
        }
      })

      sortingWorkouts.sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) return 1
        if (new Date(a.date) > new Date(b.date)) return -1
        return 0
      })

      allworkouts.value = sortingWorkouts
    }
  })
}

// Create
export const createWorkout = async (exercisesId, workout) => {
  const auth = getAuth()
  const db = getDatabase()

  const approachRes = workout.approach.reduce((sum, current) => { return +sum + +current })
  const newWorkout = {
    ...workout,
    exercisesId: exercisesId,
    res: approachRes
  }

  const newWorkoutKey = push(child(ref(db), 'workout')).key
  await set(ref(db, `users/${auth.currentUser.uid}/workout/${newWorkoutKey}`), newWorkout)
}

// Remove
export const removeWorkout = async (id) => {
  const auth = getAuth()
  const db = getDatabase()

  remove(ref(db, `users/${auth.currentUser.uid}/workout/${id}`))
}

// Update
export const updateWorkout = async (id, workout) => {
  const auth = getAuth()
  const db = getDatabase()

  const approachRes = workout.approach.reduce((sum, current) => { return +sum + +current })

  const newWorkout = {
    ...workout,
    res: approachRes
  }

  update(ref(db,  `users/${auth.currentUser.uid}/workout/${id}`), newWorkout);
}