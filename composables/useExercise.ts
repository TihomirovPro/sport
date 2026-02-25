import type { TypeExercise, TypeExerciseCreate } from "./types"
import { updateData, onData } from './firebaseInit'

let exercisesUnsubscribe: (() => void) | null = null
type TypeExerciseDb = Omit<TypeExercise, 'id'>

export const stopAllExercisesSubscription = () => {
  if (!exercisesUnsubscribe) return
  exercisesUnsubscribe()
  exercisesUnsubscribe = null
}

export const getAllExercises = () => {
  const exerciseStore = useExerciseStore()

  stopAllExercisesSubscription()

  exercisesUnsubscribe = onData('exercises', (snapshot) => {
    const data = snapshot.val() as Record<string, TypeExerciseDb> | null

    if (data) {
      exerciseStore.allExercises = []
      Object.keys(data).forEach((key) => {
        const exercise = data[key]
        if (!exercise) return

        exerciseStore.allExercises.push({
          name: exercise.name,
          color: exercise.color,
          icon: exercise.icon,
          ease: exercise.ease,
          isComplex: exercise.isComplex,
          complexDesc: exercise.complexDesc,
          order: exercise.order,
          id: key,
        })
      })
    } else {
      exerciseStore.allExercises = []
    }

    exerciseStore.allExercises.sort((a, b) => {
      if (a.order < b.order) return -1
      if (a.order > b.order) return 1
      return 0
    })
  })

  return exercisesUnsubscribe
}

export const sortExercises = (exercises:TypeExercise[]) => {
  const newExercises:{ [key:string]:TypeExerciseCreate } = {}

  exercises.forEach((el, i) => {
    const payload: TypeExerciseCreate = {
      name: el.name,
      ease: el.ease,
      order: i
    }

    if (el.color !== undefined) payload.color = el.color
    if (el.icon !== undefined) payload.icon = el.icon
    if (el.isComplex !== undefined) payload.isComplex = el.isComplex
    if (el.complexDesc !== undefined) payload.complexDesc = el.complexDesc

    newExercises[`${el.id}`] = payload
  })

  void updateData('exercises', newExercises).catch((error) => {
    console.error('[firebase:sortExercises]', error)
  })
}
