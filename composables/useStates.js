export const useActiveUser = () => useState('activeUser', () => '')

export const useAllExercises = () => useState('allExercises', () => [])
export const useActiveExercise = () => useState('activeExercise', () => '')
export const useSelectUpdateExercise = () => useState('updateExercise', () => '')

export const useWorkouts = () => useState('workouts', () => [])
export const useSelectUpdateWorkout = () => useState('updateWorkout', () => '')

export const useActiveFilters = () => useState('activeFilters', () => false)
export const useShowMenu = () => useState('showMenu', () => false)
export const useShowModal = () => useState('showModal', () => false)
export const useShowModalExercise = () => useState('showModalExercise', () => false)
export const useShowModalWorkout = () => useState('showModalWorkout', () => false)

export const useEaseus = () => useState('easeus', () => ['Свой вес', 'С весом', 'В резине'])

export const useRubbers = () => useState('rubbers', () => ['Розовая резина', 'Желтая резина', 'Оранжевая резина', 'Черная резина', 'Филетовая резина', 'Серо-синяя резина', 'Зеленая резина', 'Синяя резина'])

export const useRubbersColor = () => useState('rubbersColor', () => [
  {name: 'Розовая резина', color: 'rgb(236, 72, 153)'},
  {name: 'Желтая резина', color: 'rgb(250, 204, 21)'},
  {name: 'Оранжевая резина', color: 'rgb(249, 115, 22)'},
  {name: 'Черная резина', color: 'rgb(64, 64, 64)'},
  {name: 'Филетовая резина', color: 'rgb(126, 34, 206)'},
  {name: 'Серо-синяя резина', color: 'rgb(163, 163, 163)'},
  {name: 'Зеленая резина', color: 'rgb(22, 163, 74)'},
  {name: 'Синяя резина', color: 'rgb(29, 78, 216)'}
])

export const useIcons = () => useState('icons', () => ['push-up', 'pull-up', 'bars', 'bars-2', 'rings'])

export const useColors = () => useState('colors', () => [
  '#f87171', '#fb7185', '#f43f5e', '#ef4444', '#dc2626', '#b91c1c',
  '#e879f9', '#f472b6', '#ec4899', '#d946ef', '#c026d3', '#a21caf',
  
  '#c084fc', '#a78bfa', '#8b5cf6', '#a855f7', '#9333ea', '#7e22ce',
  '#60a5fa', '#818cf8', '#3b82f6', '#6366f1', '#7c3aed', '#6d28d9',

  '#0284c7', '#0369a1', '#2563eb', '#1d4ed8', '#4f46e5', '#4338ca',
  '#38bdf8', '#0ea5e9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490',

  '#2dd4bf', '#14b8a6', '#059669', '#047857', '#34d399', '#10b981',
  '#0d9488', '#0f766e', '#16a34a', '#15803d', '#4ade80', '#22c55e',

  '#a3e635', '#84cc16', '#fbbf24', '#f59e0b', '#ca8a04', '#a16207',
  '#65a30d', '#4d7c0f', '#facc15', '#eab308', '#d97706', '#b45309',

  '#fb923c', '#f97316', '#a3a3a3', '#737373', '#94a3b8', '#64748b',
  '#ea580c', '#c2410c', '#525252', '#404040', '#475569', '#334155'
])