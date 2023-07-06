// Exercise
export interface TypeExercise {
  id: string
  name: string
  ease: EnumEase[]
  color?: string
  icon?: string
}

export type TypeExerciseCreate = Omit<TypeExercise, 'id'>

// Ease
export const enum EnumEase {
  noWeight = 'Свой вес',
  weight = 'С весом',
  rubber = 'В резине'
}

// Workout
export interface TypeWorkout {
  id: string
  exercisesId: string
  date: string
  interval: string
  ease: EnumEase
  rubber?: string
  desc: string
  approach: number[]
  weight: number[]
  res: number,
  filter?: boolean
}

export type TypeWorkoutCreate = Omit<TypeWorkout, 'id'>
export type TypeWorkoutPage = Omit<TypeWorkout, 'exercisesId'>
