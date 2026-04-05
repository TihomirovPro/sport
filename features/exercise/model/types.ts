import type { EnumEase } from '~/shared/config/enums'

export interface TypeExercise {
  id: string
  name: string
  ease: EnumEase[]
  order: number
  color?: string
  icon?: string
  isComplex?: boolean
  complexDesc?: string
  complexItems?: string[]
}

export type TypeExerciseCreate = Omit<TypeExercise, 'id'>
