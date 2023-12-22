import type { TypeExercise, TypeExerciseCreate } from "./types"
import { updateData, onData } from './firebaseInit'

export const getAllExercises = () => {
  const allExercises = useAllExercises()

  onData('exercises', (snapshot:any) => {
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

export const sortExercises = (exercises:TypeExercise[]) => {
  const newExercises:{ [key:string]:TypeExerciseCreate } = {}

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