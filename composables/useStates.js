export const useActiveUser = () => useState('activeUser', () => '')

export const useAllExercises = () => useState('allExercises', () => [])
export const useActiveExercise = () => useState('activeExercise', () => '')
export const useSelectUpdateExercises = () => useState('updateExercises', () => '')

export const useWorkouts = () => useState('workouts', () => [])
export const useSelectUpdateWorkout = () => useState('updateWorkout', () => '')

export const useActiveFilters = () => useState('activeFilters', () => false)
export const useShowMenu = () => useState('showMenu', () => false)
export const useShowModal = () => useState('showModal', () => false)

export const useEaseus = () => useState('easeus', () => ['Свой вес', 'С весом', 'Розовая резина', 'Желтая резина', 'Оранжевая резина', 'Черная резина', 'Филетовая резина', 'Серо-синяя резина', 'Зеленая резина', 'Синяя резина'])