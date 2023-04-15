export const useActiveUser = () => useState('activeUser', () => '')

export const useAllExercises = () => useState('allExercises', () => [])
export const useActiveExercise = () => useState('activeExercise', () => '')
export const useSelectUpdateExercise = () => useState('updateExercise', () => '')

export const useWorkouts = () => useState('workouts', () => [])
export const useSelectUpdateWorkout = () => useState('updateWorkout', () => '')

export const useActiveFilters = () => useState('activeFilters', () => false)
export const useShowMenu = () => useState('showMenu', () => false)
export const useShowModal = () => useState('showModal', () => false)
export const useShowModalUpdateExercise = () => useState('shoShowModalUpdateExercise', () => false)

export const useEaseus = () => useState('easeus', () => ['Свой вес', 'С весом', 'Розовая резина', 'Желтая резина', 'Оранжевая резина', 'Черная резина', 'Филетовая резина', 'Серо-синяя резина', 'Зеленая резина', 'Синяя резина'])
export const useIcons = () => useState('icons', () => ['push-up', 'pull-up', 'bars', 'bars-2', 'rings'])