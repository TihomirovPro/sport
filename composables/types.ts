// Exercise
type TypeExercise = {
  id: string
  name: string
  color: string
  icon: string
}

type TypeExerciseCreate = Omit<TypeExercise, 'id'>
type TypeExerciseActive = Pick<TypeExercise, 'id'>


// Workout
type TypeWorkout = {
  id: string
  exercisesId: string
  date: string
  interval: string
  ease: string
  rubber: string
  desc: string
  approach: []
  weight: []
  res: number,
  filter?: boolean
}

type TypeWorkoutCreate = Omit<TypeWorkout, 'id'>
type TypeWorkoutPage = Omit<TypeWorkout, 'exercisesId' | 'filter'>

// Ease
type TypeEase = ['Свой вес', 'С весом', 'В резине']