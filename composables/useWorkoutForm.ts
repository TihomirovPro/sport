import type { ComputedRef, Ref } from 'vue'
import { EnumEase, type TypeExercise, type TypeWorkout, type TypeWorkoutCreate, type WorkoutFormDefaults } from '~/composables/types'
import {
  normalizeNumberArray,
  normalizeRpe,
  normalizeWorkoutDate,
  parseDurationToSeconds,
  safeParseJson
} from '~/composables/useWorkoutHelpers'
import { IDB_KEYS } from '~/composables/storage/keys'
import { idbStorage } from '~/composables/storage/idb'

interface UseWorkoutFormParams {
  activeExercise: Ref<TypeExercise | null | undefined>
  selectUpdateWorkout: Ref<TypeWorkout | null>
  isComplex: ComputedRef<boolean>
  resolveFormDefaults: (availableEases?: EnumEase[]) => WorkoutFormDefaults
  notifyError: (message: string) => void
}

export function useWorkoutForm({
  activeExercise,
  selectUpdateWorkout,
  isComplex,
  resolveFormDefaults,
  notifyError
}: UseWorkoutFormParams) {
  const nowDate = new Date().getTime()
  const error = ref(false)
  const complexTime = ref('')

  function formatTimer(totalSeconds: number): string {
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  function getNewWorkoutDefaults() {
    const defaults = resolveFormDefaults(activeExercise.value?.ease ?? [])

    return {
      approaches: defaults.approaches,
      workout: {
        exercisesId: activeExercise.value?.id ?? '',
        date: nowDate,
        interval: defaults.interval,
        ease: defaults.ease,
        rubber: '',
        approach: [],
        weight: [],
        complexExercises: [],
        desc: '',
        res: 0,
        resWeigth: 0
      } satisfies TypeWorkoutCreate
    }
  }

  const defaultNewWorkout = getNewWorkoutDefaults()
  const approaches = ref(defaultNewWorkout.approaches)
  const workout = ref<TypeWorkoutCreate>(defaultNewWorkout.workout)

  function reset() {
    const defaults = getNewWorkoutDefaults()
    selectUpdateWorkout.value = null
    error.value = false
    complexTime.value = ''
    approaches.value = defaults.approaches
    workout.value = defaults.workout
  }

  watchEffect(() => {
    if (selectUpdateWorkout.value) {
      approaches.value = selectUpdateWorkout.value.approach.length || 5
      workout.value = {
        exercisesId: selectUpdateWorkout.value.exercisesId,
        date: selectUpdateWorkout.value.date,
        interval: selectUpdateWorkout.value.interval,
        approach: selectUpdateWorkout.value.approach,
        ease: selectUpdateWorkout.value.ease,
        rpe: selectUpdateWorkout.value.rpe,
        rubber: selectUpdateWorkout.value.rubber || '',
        weight: selectUpdateWorkout.value.weight || [],
        complexExercises: Array.isArray(selectUpdateWorkout.value.complexExercises)
          ? [...selectUpdateWorkout.value.complexExercises]
          : [],
        desc: selectUpdateWorkout.value.desc || '',
        res: selectUpdateWorkout.value.res,
        resWeigth: selectUpdateWorkout.value.resWeigth
      }

      if (isComplex.value) {
        complexTime.value = formatTimer(Number(selectUpdateWorkout.value.res) || 0)
      }
    } else {
      reset()
    }
  })

  if (import.meta.client && !selectUpdateWorkout.value) {
    const newWorkoutRaw = idbStorage.getItem(IDB_KEYS.NEW_WORKOUT)
    const approachesRaw = idbStorage.getItem(IDB_KEYS.APPROACHES)

    if (newWorkoutRaw) {
      const fallbackDefaults = resolveFormDefaults(activeExercise.value?.ease ?? [])
      const newWorkout = safeParseJson<Partial<TypeWorkoutCreate> & { resWeidth?: number }>(newWorkoutRaw, {})
      const parsedApproachesRaw = approachesRaw
        ? safeParseJson<unknown>(approachesRaw, fallbackDefaults.approaches)
        : fallbackDefaults.approaches
      const parsedApproaches = Number(parsedApproachesRaw)
      approaches.value = Number.isFinite(parsedApproaches) ? parsedApproaches : fallbackDefaults.approaches

      workout.value = {
        exercisesId: activeExercise.value?.id ?? '',
        date: newWorkout.date ?? nowDate,
        interval: newWorkout.interval ?? fallbackDefaults.interval,
        approach: Array.isArray(newWorkout.approach) ? newWorkout.approach : [],
        ease: newWorkout.ease ?? fallbackDefaults.ease,
        rpe: normalizeRpe(newWorkout.rpe),
        rubber: newWorkout.rubber || '',
        weight: Array.isArray(newWorkout.weight) ? newWorkout.weight : [],
        complexExercises: Array.isArray(newWorkout.complexExercises) ? newWorkout.complexExercises : [],
        desc: newWorkout.desc || '',
        res: 0,
        resWeigth: newWorkout.resWeigth ?? newWorkout.resWeidth ?? 0
      }

      if (isComplex.value && Number.isFinite(Number(newWorkout.res))) {
        complexTime.value = formatTimer(Number(newWorkout.res))
      }
    }
  }

  function clearDraftStorage() {
    if (!import.meta.client) return
    idbStorage.removeItem(IDB_KEYS.NEW_WORKOUT)
    idbStorage.removeItem(IDB_KEYS.APPROACHES)
  }

  function updateWeight(idx: number, value: string | number | undefined) {
    if (!Array.isArray(workout.value.weight)) workout.value.weight = []

    const normalized = String(value ?? '').replace(',', '.').trim()
    workout.value.weight[idx] = normalized === '' ? NaN : Number(normalized)
  }

  function updateRpe(value: string | number | undefined) {
    const normalized = normalizeRpe(value)
    if (normalized === undefined) {
      workout.value.rpe = undefined
    } else {
      workout.value.rpe = Math.min(Math.max(normalized, 1), 10)
    }
  }

  function addComplexExercise() {
    if (!Array.isArray(workout.value.complexExercises)) workout.value.complexExercises = []
    workout.value.complexExercises.push('')
  }

  function removeComplexExercise(index: number) {
    if (!Array.isArray(workout.value.complexExercises)) return
    workout.value.complexExercises.splice(index, 1)
  }

  function validateWorkout(): boolean {
    if (!workout.value.exercisesId) {
      notifyError('Не выбрано упражнение. Вернитесь назад и откройте упражнение заново.')
      return false
    }

    if (isComplex.value) {
      const durationSeconds = parseDurationToSeconds(complexTime.value)
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        error.value = true
        notifyError('Укажите время выполнения комплекса, например 12:30')
        return false
      }

      const exercises = Array.isArray(workout.value.complexExercises)
        ? workout.value.complexExercises
          .map((item) => String(item ?? '').trim())
          .filter(Boolean)
        : []

      if (!exercises.length) {
        notifyError('Добавьте хотя бы одно упражнение в тренировку комплекса')
        return false
      }

      workout.value.complexExercises = exercises
      workout.value.approach = [durationSeconds]
      workout.value.weight = []
      workout.value.ease = EnumEase.noWeight
      workout.value.interval = '0'
      workout.value.rubber = ''
      workout.value.res = durationSeconds
      workout.value.resWeigth = 0
      workout.value.rpe = undefined
      workout.value.date = normalizeWorkoutDate(workout.value.date)
      error.value = false
      return true
    }

    const approachValues = normalizeNumberArray(workout.value.approach)

    if (!approachValues.length || approachValues.some((item) => !Number.isFinite(item) || item <= 0)) {
      error.value = true
      notifyError('Заполните подходы числами больше нуля')
      return false
    }

    if (workout.value.ease === EnumEase.rubber && !workout.value.rubber) {
      notifyError('Выберите резину для режима "В резине"')
      return false
    }

    let weightValues: number[] = []

    if (workout.value.ease === EnumEase.weight) {
      weightValues = normalizeNumberArray(workout.value.weight)

      if (weightValues.length !== approachValues.length || weightValues.some((item) => !Number.isFinite(item) || item < 0)) {
        notifyError('Заполните вес для каждого подхода')
        return false
      }
    } else {
      weightValues = []
    }

    workout.value.approach = approachValues
    workout.value.weight = weightValues
    workout.value.complexExercises = []
    workout.value.res = approachValues.reduce((sum: number, current: number): number => +sum + +current, 0)
    workout.value.resWeigth = weightValues.reduce((acc: number, item: number, index: number): number => acc + (+item * +(approachValues[index] ?? 0)), 0)

    const normalizedRpe = normalizeRpe(workout.value.rpe)
    if (normalizedRpe !== undefined && (normalizedRpe < 1 || normalizedRpe > 10)) {
      notifyError('RPE должен быть в диапазоне от 1 до 10')
      return false
    }

    workout.value.rpe = normalizedRpe
    workout.value.date = normalizeWorkoutDate(workout.value.date)
    error.value = false

    return true
  }

  watch(
    () => workout.value.approach,
    (approach) => {
      if (!Array.isArray(approach) || !approach.length) return
      const hasInvalidValues = normalizeNumberArray(approach).some((item) => !Number.isFinite(item) || item <= 0)
      if (!hasInvalidValues) error.value = false
    },
    { deep: true }
  )

  watch(complexTime, (value) => {
    const parsed = parseDurationToSeconds(value)
    workout.value.res = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  })

  watch(
    [workout, approaches],
    () => {
      if (!import.meta.client) return
      if (!selectUpdateWorkout.value) {
        idbStorage.setItem(IDB_KEYS.NEW_WORKOUT, JSON.stringify(workout.value))
        idbStorage.setItem(IDB_KEYS.APPROACHES, JSON.stringify(approaches.value))
      }
    },
    { deep: true }
  )

  return {
    error,
    complexTime,
    approaches,
    workout,
    reset,
    updateWeight,
    updateRpe,
    addComplexExercise,
    removeComplexExercise,
    validateWorkout,
    clearDraftStorage
  }
}
