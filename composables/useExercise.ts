import { getDatabase, ref, onValue, set, child, push, remove, update, query, orderByChild } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import type { TypeExercise, TypeExerciseCreate } from "./types"

export const getAllExercises = async (userId:string) => {
  const db = getDatabase()
  const allExercises = useAllExercises()

  const exercises = query(ref(db, `users/${userId}/exercises`), orderByChild('order'))  

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
          ease: exercise.ease,
          order: exercise.order,
          id: key,
        })
      })
    }

    allExercises.value.sort((a, b) => {
      if (a.order < b.order) return -1
      if (a.order > b.order) return 1
      return 0
    })
  })
}

// Create
export const createExercise = async (exercise:TypeExerciseCreate) => {
  const auth = getAuth()
  const db = getDatabase()
  
  const newExerciseKey = push(child(ref(db), 'exercises')).key
  await set(ref(db, `users/${auth.currentUser?.uid}/exercises/${newExerciseKey}`), exercise)
}

// Remove
export const removeExercise = async (id:string) => {
  const auth = getAuth()
  const db = getDatabase()

  remove(ref(db, `users/${auth.currentUser?.uid}/exercises/${id}`))
  remove(ref(db, `users/${auth.currentUser?.uid}/workout/${id}`))
}

// Update
export const updateExercise = async (id:string, exercise:TypeExerciseCreate) => {
  const auth = getAuth()
  const db = getDatabase()

  update(ref(db, `users/${auth.currentUser?.uid}/exercises/${id}`), exercise)
}

export const sortExercises = async (exercises) => {
  const auth = getAuth()
  const db = getDatabase()

  const newExercises = {}

  exercises.forEach((el, i) => {

    newExercises[`${el.id}`] = {
      color: el.color,
      ease: el.ease,
      icon: el.icon,
      name: el.name,
      order: i
    }
  })

  update(ref(db, `users/${auth.currentUser?.uid}/exercises`), newExercises)
}