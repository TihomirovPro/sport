import type { Ref } from 'vue'
import type { EnumEase, TypeExercise } from '~/composables/types'
import { ACTIVE_EXERCISE_STORAGE_KEY } from '~/composables/storageKeys'

type RestoreActiveExerciseOptions = {
  fallbackEase?: EnumEase[]
}

function normalizeStoredActiveExercise(
  value: unknown,
  options: RestoreActiveExerciseOptions = {}
): TypeExercise | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<TypeExercise>
  if (!candidate.id) return null

  return {
    id: candidate.id,
    name: candidate.name ?? '',
    ease: Array.isArray(candidate.ease) ? candidate.ease : (options.fallbackEase ?? []),
    order: typeof candidate.order === 'number' ? candidate.order : 0,
    color: candidate.color,
    icon: candidate.icon,
    isComplex: candidate.isComplex,
    complexDesc: candidate.complexDesc,
  }
}

export function useActiveExercise() {
  function readStoredActiveExercise(options: RestoreActiveExerciseOptions = {}): TypeExercise | null {
    if (!import.meta.client) return null

    const raw = localStorage.getItem(ACTIVE_EXERCISE_STORAGE_KEY)
    if (!raw) return null

    try {
      return normalizeStoredActiveExercise(JSON.parse(raw), options)
    } catch {
      return null
    }
  }

  function restoreActiveExerciseFromStorage(
    activeExercise: Ref<TypeExercise | null | undefined>,
    options: RestoreActiveExerciseOptions = {}
  ) {
    if (activeExercise.value) return

    const storedActiveExercise = readStoredActiveExercise(options)
    if (storedActiveExercise) {
      activeExercise.value = storedActiveExercise
    }
  }

  return {
    readStoredActiveExercise,
    restoreActiveExerciseFromStorage,
  }
}
