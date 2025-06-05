// Exercise
export interface TypeExercise {
  id: string
  name: string
  ease: EnumEase[]
  order: number
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
  date: number
  interval: string
  ease: EnumEase
  rubber?: string
  desc?: string
  approach: number[]
  weight?: number[]
  res: number
  resWeigth: number
}

export type TypeWorkoutCreate = Omit<TypeWorkout, 'id'>
export type TypeWorkoutPage = Omit<TypeWorkout, 'exercisesId'>

// Filter
export interface Filter {
  ease: '' | EnumEase
  interval: number
  approach: number
  changeEase: (ease:'' | EnumEase) => void
  changeInterval: (interval:number) => void
  changeApproach: (approach:number) => void
}
