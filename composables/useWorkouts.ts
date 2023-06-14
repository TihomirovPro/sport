import { getDatabase, ref, onValue, set, child, push, remove, update } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export const getWorkouts = async (userId:string, exercisesId:string) => {
  const db = getDatabase()
  const allworkouts = useWorkouts()

  let sortingWorkouts:TypeWorkout[] = []
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
export const createWorkout = async (workout:TypeWorkoutCreate) => {
  const db = getDatabase()
  const auth = getAuth()
  const newWorkoutKey = push(child(ref(db), 'workout')).key
  await set(ref(db, `users/${auth.currentUser.uid}/workout/${newWorkoutKey}`), workout)
}

// Remove
export const removeWorkout = async (id:string) => {
  const db = getDatabase()
  const auth = getAuth()
  remove(ref(db, `users/${auth.currentUser.uid}/workout/${id}`))
}

// Update
export const updateWorkout = async (workout:TypeWorkout) => {
  const db = getDatabase()
  const auth = getAuth()
  update(ref(db,  `users/${auth.currentUser.uid}/workout/${workout.id}`), workout);
}