// Exercise
export type TypeExercise = {
  id: string
  name: string
  color: string
  icon: string
}

export type TypeExerciseCreate = Omit<TypeExercise, 'id'>
export type TypeExerciseActive = Pick<TypeExercise, 'id'>

// Workout
export type TypeWorkout = {
  id: string
  exercisesId: string
  date: string
  interval: string
  ease: TypeEase
  rubber: string
  desc: string
  approach: []
  weight: []
  res: number,
  filter?: boolean
}

export type TypeWorkoutCreate = Omit<TypeWorkout, 'id'>
export type TypeWorkoutPage = Omit<TypeWorkout, 'exercisesId'>

// Ease
export const enum EnumEase {
  noWeight = 'Свой вес',
  weight = 'С весом',
  rubber = 'В резине'
}

export type TypeEase = EnumEase.noWeight | EnumEase.weight | EnumEase.rubber
