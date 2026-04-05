import type { EnumEase } from '~/shared/config/enums'

export interface TypeWorkout {
  id: string
  exercisesId: string
  date: number
  interval: string
  ease: EnumEase
  rpe?: number
  rubber?: string
  desc?: string
  complexExercises?: string[]
  rounds?: number
  approach: number[]
  weight?: number[]
  res: number
  resWeigth: number
}

export type TypeWorkoutCreate = Omit<TypeWorkout, 'id'>
export type TypeWorkoutPage = Omit<TypeWorkout, 'exercisesId'>

export interface Filter {
  ease: '' | EnumEase
  interval: number
  approach: number
  changeEase: (ease: '' | EnumEase) => void
  changeInterval: (interval: number) => void
  changeApproach: (approach: number) => void
}

export interface WorkoutActiveFilters {
  ease: '' | EnumEase
  interval: number
  approach: number
}

export interface WorkoutFormDefaults {
  interval: string
  approaches: number
  ease: EnumEase
}
