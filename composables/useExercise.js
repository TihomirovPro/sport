import { getDatabase, ref, onValue, set, child, push, remove, update } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export const getAllExercises = async (userId) => {
  const db = getDatabase()
  let allExercises = useAllExercises()

  const exercises = ref(db, `users/${userId}/exercises`)

  onValue(exercises, (snapshot) => {
    const data = snapshot.val()

    if (data) {
      allExercises.value = []
      Object.keys(data).forEach((key) => {
        const exercise = data[key]
        allExercises.value.push({
          name: exercise.name,
          color: exercise.color,
          icon: exercise.icon,
          id: key
        })
      })
    }
  })
}

// Create
export const createExercise = async (exercise) => {
  const auth = getAuth()
  const db = getDatabase()
  
  const newExercise = exercise
  const newExerciseKey = push(child(ref(db), 'exercises')).key

  await set(ref(db, `users/${auth.currentUser.uid}/exercises/${newExerciseKey}`), newExercise)
}

// Remove
export const removeExercise = async (id) => {
  const auth = getAuth()
  const db = getDatabase()

  remove(ref(db, `users/${auth.currentUser.uid}/exercises/${id}`))
}

// Update
export const updateExercise = async (id, exercise) => {
  const auth = getAuth()
  const db = getDatabase()

  const newExercise = exercise

  update(ref(db,  `users/${auth.currentUser.uid}/exercises/${id}`), newExercise);
}