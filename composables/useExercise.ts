import { ref, onValue, child, push, query, orderByChild, once } from 'firebase/database'
import type { TypeExercise, TypeExerciseCreate } from "./types"
import { db, dbPath, createData, updateData } from './firebaseInit'

export const getAllExercises = async () => {
  const allExercises = useAllExercises()

  const exercises = ref(db, dbPath('exercises'))

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
export const createExercise = (exercise:TypeExerciseCreate) => {
  const newExerciseKey = push(child(ref(db), 'exercises')).key
  createData(`exercises/${newExerciseKey}`, exercise)
}


export const sortExercises = async (exercises) => {
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

  updateData('exercises', newExercises)
}