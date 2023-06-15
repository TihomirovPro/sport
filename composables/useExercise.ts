import { getDatabase, ref, onValue, set, child, push, remove, update } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import type { TypeExercise, TypeExerciseCreate } from "./types"

export const getAllExercises = async (userId:string) => {
  const db = getDatabase()
  let allExercises = useAllExercises()

  const exercises = ref(db, `users/${userId}/exercises`)

  onValue(exercises, (snapshot) => {
    const data = snapshot.val()

    if (data) {
      allExercises.value = []
      Object.keys(data).forEach((key) => {
        const exercise:TypeExercise = data[key]
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
export const createExercise = async (exercise:TypeExerciseCreate) => {
  const auth = getAuth()
  const db = getDatabase()
  
  const newExerciseKey = push(child(ref(db), 'exercises')).key
  await set(ref(db, `users/${auth.currentUser.uid}/exercises/${newExerciseKey}`), exercise)
}

// Remove
export const removeExercise = async (id:string) => {
  const auth = getAuth()
  const db = getDatabase()

  remove(ref(db, `users/${auth.currentUser.uid}/exercises/${id}`))
}

// Update
export const updateExercise = async (exercise:TypeExercise) => {
  const auth = getAuth()
  const db = getDatabase()

  update(ref(db,  `users/${auth.currentUser.uid}/exercises/${exercise.id}`), exercise);
}