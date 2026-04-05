import type { Ref } from 'vue'
import { createData, removeData, updateData } from '~/shared/api/firebaseInit'
import { normalizeRpe } from '~/features/workout/lib/helpers'
import type { TypeWorkout, TypeWorkoutCreate } from '~/features/workout/model/types'

type WorkoutWritePayload = Omit<TypeWorkoutCreate, 'rpe'> & { rpe?: number }

interface UseWorkoutPersistenceParams {
  workout: Ref<TypeWorkoutCreate>
  selectUpdateWorkout: Ref<TypeWorkout | null>
  workouts: Ref<TypeWorkout[]>
  filteredWorkouts: Ref<TypeWorkout[]>
  isSaving: Ref<boolean>
  validateWorkout: () => boolean
  reset: () => void
  notifyError: (message: string) => void
  router: ReturnType<typeof useRouter>
  removeConfirm?: Ref<boolean>
  clearDraftStorage: () => void
}

function buildWorkoutWritePayload(source: TypeWorkoutCreate): WorkoutWritePayload {
  const normalized = normalizeRpe(source.rpe)
  const boundedRpe = normalized !== undefined && normalized >= 1 && normalized <= 10
    ? normalized
    : undefined

  const payload: WorkoutWritePayload = {
    exercisesId: source.exercisesId,
    date: source.date,
    interval: source.interval,
    ease: source.ease,
    approach: Array.isArray(source.approach) ? [...source.approach] : [],
    weight: Array.isArray(source.weight) ? [...source.weight] : [],
    complexExercises: Array.isArray(source.complexExercises) ? [...source.complexExercises] : [],
    rubber: source.rubber,
    desc: source.desc,
    res: source.res,
    resWeigth: source.resWeigth,
    rpe: boundedRpe
  }

  if (boundedRpe === undefined) {
    delete payload.rpe
  }

  return payload
}

function sortByDateDesc(list: TypeWorkout[]): TypeWorkout[] {
  return [...list].sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) return 1
    if (new Date(a.date) > new Date(b.date)) return -1
    return 0
  })
}

export function useWorkoutPersistence({
  workout,
  selectUpdateWorkout,
  workouts,
  filteredWorkouts,
  isSaving,
  validateWorkout,
  reset,
  notifyError,
  router,
  removeConfirm,
  clearDraftStorage
}: UseWorkoutPersistenceParams) {
  function upsertWorkoutInStore(item: TypeWorkout) {
    const withoutCurrent = workouts.value.filter((workoutItem) => workoutItem.id !== item.id)
    workouts.value = sortByDateDesc([item, ...withoutCurrent])
    filteredWorkouts.value = [...workouts.value]
  }

  function removeWorkoutFromStore(id: string) {
    workouts.value = workouts.value.filter((workoutItem) => workoutItem.id !== id)
    filteredWorkouts.value = filteredWorkouts.value.filter((workoutItem) => workoutItem.id !== id)
  }

  async function add() {
    if (isSaving.value) return
    if (!validateWorkout()) return

    isSaving.value = true
    try {
      const workoutPayload = buildWorkoutWritePayload(workout.value)
      const createdId = await createData(`workout/${workoutPayload.exercisesId}`, workoutPayload)

      upsertWorkoutInStore({
        id: createdId,
        exercisesId: workoutPayload.exercisesId,
        date: workoutPayload.date as number,
        interval: workoutPayload.interval,
        ease: workoutPayload.ease,
        rpe: workoutPayload.rpe,
        rubber: workoutPayload.rubber,
        complexExercises: Array.isArray(workoutPayload.complexExercises) ? [...workoutPayload.complexExercises] : [],
        approach: [...workoutPayload.approach],
        weight: Array.isArray(workoutPayload.weight) ? [...workoutPayload.weight] : [],
        desc: workoutPayload.desc,
        res: workoutPayload.res,
        resWeigth: workoutPayload.resWeigth
      })

      await router.push(`/exercise/${workoutPayload.exercisesId}`)
      reset()
      clearDraftStorage()
    } catch (error) {
      console.error('[firebase:addWorkout]', error)
      notifyError('Не удалось добавить тренировку. Попробуйте снова.')
    } finally {
      isSaving.value = false
    }
  }

  async function updateSelectWorkout() {
    if (isSaving.value) return
    if (!validateWorkout()) return

    isSaving.value = true
    try {
      const selectedWorkoutId = selectUpdateWorkout.value?.id
      if (!selectedWorkoutId) {
        notifyError('Не выбрана тренировка для изменения')
        return
      }

      const workoutPayload = buildWorkoutWritePayload(workout.value)
      await updateData(`workout/${workoutPayload.exercisesId}/${selectedWorkoutId}`, workoutPayload)

      upsertWorkoutInStore({
        id: selectedWorkoutId,
        exercisesId: workoutPayload.exercisesId,
        date: workoutPayload.date as number,
        interval: workoutPayload.interval,
        ease: workoutPayload.ease,
        rpe: workoutPayload.rpe,
        rubber: workoutPayload.rubber,
        complexExercises: Array.isArray(workoutPayload.complexExercises) ? [...workoutPayload.complexExercises] : [],
        approach: [...workoutPayload.approach],
        weight: Array.isArray(workoutPayload.weight) ? [...workoutPayload.weight] : [],
        desc: workoutPayload.desc,
        res: workoutPayload.res,
        resWeigth: workoutPayload.resWeigth
      })

      reset()
      await router.push(`/exercise/${workoutPayload.exercisesId}`)
    } catch (error) {
      console.error('[firebase:updateWorkout]', error)
      notifyError('Не удалось сохранить тренировку. Попробуйте снова.')
    } finally {
      isSaving.value = false
    }
  }

  async function removeSelectWorkout() {
    try {
      const selectedWorkoutId = selectUpdateWorkout.value?.id
      const selectedExerciseId = selectUpdateWorkout.value?.exercisesId
      if (!selectedWorkoutId || !selectedExerciseId) {
        notifyError('Не выбрана тренировка для удаления')
        return
      }

      await removeData(`workout/${selectedExerciseId}/${selectedWorkoutId}`)
      removeWorkoutFromStore(selectedWorkoutId)

      if (removeConfirm) {
        removeConfirm.value = false
      }

      reset()
      await router.push(`/exercise/${selectedExerciseId}`)
    } catch (error) {
      console.error('[firebase:removeWorkout]', error)
      notifyError('Не удалось удалить тренировку. Попробуйте снова.')
    }
  }

  return {
    add,
    updateSelectWorkout,
    removeSelectWorkout
  }
}
