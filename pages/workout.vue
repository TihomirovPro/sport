<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { createData, updateData, removeData } from '~/composables/firebaseInit'
import { buildProfileKey, computeBodyweightRepsSuggestion, computeProgressionSuggestion, type ProgressionSession } from '~/composables/useProgressionTest'
import type { TypeWorkoutCreate } from '~/composables/types'
import { EnumEase } from '~/composables/types'
import {
  safeParseJson,
  formatWorkoutDate,
  toDateInputValue,
  parseDurationToSeconds,
  parseIntervalMinutes,
  normalizeRpe,
  normalizeNumberArray,
  normalizeWorkoutDate
} from '~/composables/useWorkoutHelpers'

const router = useRouter()
const exerciseStore = useExerciseStore()
const workoutStore = useWorkoutStore()
const catalogStore = useCatalogStore()
const appStore = useAppStore()
const userStore = useUserStore()
const { activeExercise } = storeToRefs(exerciseStore)
const { selectUpdateWorkout } = storeToRefs(workoutStore)
const { rubbersColor } = storeToRefs(catalogStore)
const { headerTitle } = storeToRefs(appStore)
const { activeUser } = storeToRefs(userStore)
const { notifyError } = useNotifications()
const { restoreActiveExerciseFromStorage } = useActiveExercise()
headerTitle.value = 'Добавить тренировку'

useHead({
  title: headerTitle.value
})

restoreActiveExerciseFromStorage(activeExercise, {
  fallbackEase: [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]
})

if (activeExercise.value?.id) {
  getWorkouts(activeExercise.value.id)
} else {
  notifyError('Нет данных упражнения в оффлайн-кэше. Сначала откройте его онлайн.')
  void router.push('/')
}

onUnmounted(() => {
  stopWorkoutsSubscription()
})

const formatDate = formatWorkoutDate

const nowDate = new Date().getTime()
const error = ref(false)
const removeConfirm = ref(false)
const isSaving = ref(false)
const complexTime = ref('')
const canManageProgression = computed(() => String(activeUser.value.status || '').trim().toLowerCase() === 'admin')

const isComplex = computed(() => Boolean(activeExercise.value?.isComplex))
const eases = computed(() => activeExercise.value?.ease || [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber])
const complexExercises = computed({
  get: () => workout.value.complexExercises || [],
  set: (value) => { workout.value.complexExercises = value }
})
const workoutDateInputRef = ref<HTMLInputElement | null>(null)
const workoutDateModel = computed<string>({
  get() {
    return toDateInputValue(workout.value.date)
  },
  set(value) {
    workout.value.date = normalizeWorkoutDate(value)
  }
})

function openDatePicker(event?: MouseEvent) {
  const input = workoutDateInputRef.value
  if (!input) return

  // showPicker поддерживается не везде и может требовать жест пользователя.
  if (event?.isTrusted && typeof input.showPicker === 'function') {
    try {
      input.showPicker()
      return
    } catch {
      // fallback ниже
    }
  }

  input.focus()
  input.click()
}

function getNewWorkoutDefaults() {
  const defaults = workoutStore.resolveFormDefaults(activeExercise.value?.ease ?? [])

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

type WorkoutStoreItem = {
  id: string
  exercisesId: string
  date: number
  interval: string
  ease: EnumEase
  rpe?: number
  rubber?: string
  complexExercises?: string[]
  approach: number[]
  weight?: number[]
  desc?: string
  res: number
  resWeigth: number
}

type WorkoutWritePayload = Omit<TypeWorkoutCreate, 'rpe'> & { rpe?: number }

function buildWorkoutWritePayload(source: TypeWorkoutCreate): WorkoutWritePayload {
  const normalizedRpe = normalizeRpe(source.rpe)
  const boundedRpe = normalizedRpe !== undefined && normalizedRpe >= 1 && normalizedRpe <= 10
    ? normalizedRpe
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

function sortByDateDesc(list: WorkoutStoreItem[]): WorkoutStoreItem[] {
  return [...list].sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) return 1
    if (new Date(a.date) > new Date(b.date)) return -1
    return 0
  })
}

function upsertWorkoutInStore(item: WorkoutStoreItem) {
  const withoutCurrent = workoutStore.workouts.filter((workoutItem) => workoutItem.id !== item.id)
  workoutStore.workouts = sortByDateDesc([item, ...withoutCurrent])
  workoutStore.filteredWorkouts = [...workoutStore.workouts]
}

function removeWorkoutFromStore(id: string) {
  workoutStore.workouts = workoutStore.workouts.filter((workoutItem) => workoutItem.id !== id)
  workoutStore.filteredWorkouts = workoutStore.filteredWorkouts.filter((workoutItem) => workoutItem.id !== id)
}

function reset () {
  const defaults = getNewWorkoutDefaults()
  selectUpdateWorkout.value = null
  error.value = false
  complexTime.value = ''
  approaches.value = defaults.approaches
  workout.value = defaults.workout
}

watchEffect(() => {
  if (selectUpdateWorkout.value) {
    headerTitle.value = 'Изменить тренировку'
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
      resWeigth: selectUpdateWorkout.value.resWeigth,
    }

    if (isComplex.value) {
      complexTime.value = formatTimer(Number(selectUpdateWorkout.value.res) || 0)
    }
  } else {
    reset()
  }
})

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

    await router.push('/exercise-item')
    reset()
    localStorage.removeItem('newWorkout')
    localStorage.removeItem('approaches')
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
    await router.push('/exercise-item')
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
    removeConfirm.value = false
    reset()
    await router.push('/exercise-item')
  } catch (error) {
    console.error('[firebase:removeWorkout]', error)
    notifyError('Не удалось удалить тренировку. Попробуйте снова.')
  }
}

function timerApproach(time:number){
  if (time > 0) {
    const s = +workout.value.interval * time * 60;
    const minutes = String(Math.floor(s / 60)).length == 1 ? '0' + Math.floor(s / 60) : Math.floor(s / 60)
    const seconds = String(s % 60).length == 1 ? '0' + s % 60 : s % 60

    return `${minutes}:${seconds}`
  }

  return '00:00'
}

function formatTimer(totalSeconds:number): string {
  const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
  const secs = (totalSeconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

const progressionProfile = computed(() => {
  return {
    sets: Math.max(1, Math.round(approaches.value || 1)),
    intervalMinutes: parseIntervalMinutes(workout.value.interval)
  }
})

const progressionProfileKey = computed(() => buildProfileKey(progressionProfile.value))
const isWeightMode = computed(() => workout.value.ease === EnumEase.weight)
const isBodyweightMode = computed(() => workout.value.ease === EnumEase.noWeight)

const progressionWeightSessions = computed<ProgressionSession[]>(() => {
  const exerciseId = activeExercise.value?.id ?? ''

  return workoutStore.workouts
    .filter((item) => item.exercisesId === exerciseId)
    .filter((item) => item.ease === EnumEase.weight)
    .filter((item) => Array.isArray(item.weight) && item.weight.length === item.approach.length && item.approach.length > 0)
    .map((item) => ({
      id: item.id,
      exerciseId: item.exercisesId,
      date: item.date,
      profileKey: buildProfileKey({
        sets: item.approach.length,
        intervalMinutes: parseIntervalMinutes(item.interval)
      }),
      reps: [...item.approach],
      weights: [...(item.weight || [])],
      rpe: Number.isFinite(Number(item.rpe)) ? Number(item.rpe) : 8
    }))
})

const progressionBodyweightSessions = computed<ProgressionSession[]>(() => {
  const exerciseId = activeExercise.value?.id ?? ''

  return workoutStore.workouts
    .filter((item) => item.exercisesId === exerciseId)
    .filter((item) => item.ease === EnumEase.noWeight)
    .filter((item) => Array.isArray(item.approach) && item.approach.length > 0)
    .map((item) => ({
      id: item.id,
      exerciseId: item.exercisesId,
      date: item.date,
      profileKey: buildProfileKey({
        sets: item.approach.length,
        intervalMinutes: parseIntervalMinutes(item.interval)
      }),
      reps: [...item.approach],
      weights: new Array(item.approach.length).fill(0),
      rpe: Number.isFinite(Number(item.rpe)) ? Number(item.rpe) : 8
    }))
})

const progressionSuggestion = computed(() => {
  return computeProgressionSuggestion(
    progressionWeightSessions.value,
    activeExercise.value?.id ?? '',
    progressionProfile.value
  )
})

const bodyweightSuggestion = computed(() => {
  return computeBodyweightRepsSuggestion(
    progressionBodyweightSessions.value,
    activeExercise.value?.id ?? '',
    progressionProfile.value
  )
})
const canShowProgression = computed(() => canManageProgression.value && !isComplex.value && (isWeightMode.value || isBodyweightMode.value))

function suggestionActionText(mode: string): string {
  if (mode === 'increase') return 'Повышаем рабочий вес'
  if (mode === 'decrease') return 'Снижаем рабочий вес'
  if (mode === 'hold') return 'Оставляем текущий вес'
  return 'Собираем базовую историю'
}

function suggestionSummaryText(mode: string, reason: string): string {
  const action = suggestionActionText(mode)
  const normalizedReason = String(reason || '').trim()
  if (!normalizedReason) return action
  return `${action}. ${normalizedReason}`
}

const activeSuggestionMode = computed(() => {
  if (isWeightMode.value) return progressionSuggestion.value.mode
  return bodyweightSuggestion.value.mode
})

const activeSuggestionReason = computed(() => {
  if (isWeightMode.value) return progressionSuggestion.value.reason
  return bodyweightSuggestion.value.reason
})

const recommendationWeightsLine = computed(() => progressionSuggestion.value.nextWeights.join(' / '))

const recommendationRepsLine = computed(() => {
  if (isWeightMode.value) {
    const sets = Math.max(1, Math.round(approaches.value || 1))
    return new Array(sets).fill(progressionSuggestion.value.targetReps).join(' / ')
  }

  return bodyweightSuggestion.value.nextReps.join(' / ')
})

function applyProgressionSuggestion() {
  if (!canShowProgression.value) {
    notifyError('Автопрогрессия доступна только пользователю со статусом admin')
    return
  }

  if (isWeightMode.value) {
    const suggestedWeights = progressionSuggestion.value.nextWeights
    if (!suggestedWeights.length) return

    workout.value.weight = [...suggestedWeights]

    const currentApproach = normalizeNumberArray(workout.value.approach)
    const hasValidApproach = currentApproach.length === approaches.value
      && currentApproach.every((item) => Number.isFinite(item) && item > 0)

    if (!hasValidApproach) {
      workout.value.approach = new Array(approaches.value).fill(progressionSuggestion.value.targetReps)
    }
  } else {
    const suggestedReps = bodyweightSuggestion.value.nextReps
    if (!suggestedReps.length) return
    workout.value.approach = [...suggestedReps]
  }

  const exerciseId = String(activeExercise.value?.id || '').trim()
  if (!exerciseId) return

  const payload = {
    exerciseId,
    profileKey: isWeightMode.value ? progressionSuggestion.value.profileKey : bodyweightSuggestion.value.profileKey,
    mode: activeSuggestionMode.value,
    adaptiveState: isWeightMode.value ? progressionSuggestion.value.adaptiveState : null,
    adaptiveIncrementKg: isWeightMode.value ? progressionSuggestion.value.adaptiveIncrementKg : null,
    targetReps: isWeightMode.value ? progressionSuggestion.value.targetReps : null,
    nextWeights: isWeightMode.value ? progressionSuggestion.value.nextWeights : null,
    nextReps: isBodyweightMode.value ? bodyweightSuggestion.value.nextReps : null,
    basedOnSessions: isWeightMode.value ? progressionSuggestion.value.basedOnSessions : bodyweightSuggestion.value.basedOnSessions,
    lastWorkoutRpe: Number.isFinite(Number(workout.value.rpe)) ? Number(workout.value.rpe) : null,
    appliedAt: Date.now()
  }

  void createData('progression/appliedSuggestions', payload).catch((error) => {
    console.error('[firebase:progressionAppliedSuggestion]', error)
  })
}

if (!selectUpdateWorkout.value) {
  const newWorkoutRaw = localStorage.getItem('newWorkout')
  const approachesRaw = localStorage.getItem('approaches')

  if (newWorkoutRaw) {
    const fallbackDefaults = workoutStore.resolveFormDefaults(activeExercise.value?.ease ?? [])
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

function removeComplexExercise(index:number) {
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

  let weightValues:number[] = []

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
  workout.value.res = approachValues.reduce((sum:number, current:number):number => +sum + +current, 0)
  workout.value.resWeigth = weightValues.reduce((acc:number, item:number, index:number):number => acc + (+item * +(approachValues[index] ?? 0)), 0)
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
    if (!selectUpdateWorkout.value) {
      localStorage.setItem('newWorkout', JSON.stringify(workout.value))
      localStorage.setItem('approaches', JSON.stringify(approaches.value))
    }
  },
  { deep: true }
)
</script>

<template lang="pug">
.flex.flex-col.gap-3.min-h-full
  label.grid.gap-1.py-3.text-center.rounded-xl.border-2.cursor-pointer(
    class="min-h-[52px] bg-[rgba(var(--colorAccent),0.3)] border-[rgb(var(--colorAccent))]"
    @click="openDatePicker"
  )
    input.w-px.h-px.absolute.-z-10(
      ref="workoutDateInputRef"
      v-model="workoutDateModel"
      type="date"
    )
    span {{ formatDate(workout.date) }}
  template(v-if="!isComplex")
    BaseInputRange(v-model="workout.interval")
    BaseInputRange(v-model="approaches" max="10" step="1" view="approaches")
  template(v-else)
    BaseInput(
      v-model="complexTime"
      type="text"
      :error="error"
      placeholder="Время выполнения"
    )
    .grid.gap-2
      .text-sm.opacity-70 Упражнения в этой тренировке
      .flex.items-center.gap-2(
        v-for="(item, idx) in complexExercises"
        :key="`complex-exercise-${idx}`"
      )
        BaseInput(
          v-model="complexExercises[idx]"
          type="text"
          placeholder="Упражнение"
        )
        button.text-sm.text-error.px-2(
          type="button"
          @click="removeComplexExercise(idx)"
        ) удалить
      BaseButton(
        text="Добавить упражнение"
        @click="addComplexExercise"
      )

  TabsEases(
    v-if="!isComplex && eases.length > 1"
    :eases="eases"
    :selected="workout.ease"
    @selectEase="e => workout.ease = e"
  )

  .grid.grid-cols-4.gap-3(v-if="!isComplex && workout.ease === EnumEase.rubber")
    .text-white.text-xs.text-center.flex-center.cursor-pointer.rounded.h-10(
      v-for="item in rubbersColor"
      :style="`background: ${item.color}`"
      :class="{ 'border-2 border-white outline outline-2 outline-[#5182dc]': workout.rubber === item.name }"
      @click="workout.rubber = item.name"
    ) {{ item.name.replace(' резина', '') }}

  .grid.gap-3.border.border-faint.rounded-xl.p-3(v-if="canShowProgression")
    p.text-sm.leading-relaxed.font-medium.opacity-95 {{ suggestionSummaryText(activeSuggestionMode, activeSuggestionReason) }}

    .grid.grid-cols-2.gap-3
      .border.border-faint.rounded-lg.px-3.py-2.grid.gap-1(
        class="border-[rgba(var(--colorIcon),0.16)] bg-[rgba(var(--colorIcon),0.06)]"
      )
        span.opacity-70(class="text-[11px]") Рекомендуемые повторы
        span.font-semibold(class="text-[13px]") {{ recommendationRepsLine }}
  
      .border.border-faint.rounded-lg.px-3.py-2.grid.gap-1(
        v-if="isWeightMode"
        class="border-[rgba(var(--colorIcon),0.16)] bg-[rgba(var(--colorIcon),0.06)]"
      )
        span.opacity-70(class="text-[11px]") Рекомендуемые веса
        span.font-semibold(class="text-[13px]") {{ recommendationWeightsLine }}

    BaseButton(
      text="Применить рекомендацию"
      @click="applyProgressionSuggestion"
    )

  .approaches(v-if="!isComplex")
    .flex.items-center.gap-3.mb-3(
      v-for="index in +approaches"
      :key="index"
    )
      .text-sm {{ timerApproach(index-1) }}
      BaseInput(
        v-model="workout.approach[index-1]"
        type="text"
        :error="error"
        inputmode="numeric"
        :placeholder="`Подход ${index}`"
      )

      BaseInput(
        v-if="workout.ease === EnumEase.weight"
        :model-value="Array.isArray(workout.weight) ? workout.weight[index-1] : ''"
        @update:model-value="(value) => updateWeight(index - 1, value)"
        type="text"
        inputmode="decimal"
        :placeholder="`Вес ${index}`"
      )  

  BaseInput(
    v-if="!isComplex"
    :model-value="workout.rpe ?? ''"
    @update:model-value="updateRpe"
    type="text"
    inputmode="decimal"
    placeholder="RPE (1-10)"
  )
  p.text-xs.opacity-70(v-if="!isComplex") RPE оценивается по последнему рабочему подходу.

  BaseInput(
    v-model="workout.desc"
    type="textarea"
    placeholder="Заметка"
  )

  .grid.grid-flow-col.place-items-center.gap-5.mt-auto
    BaseButton(
      v-if="!selectUpdateWorkout"
      :disabled="isSaving"
      @click="add"
      :text="isSaving ? 'Сохранение...' : 'Добавить'"
    )
    template(v-else)
      BaseButton(
        red
        :disabled="isSaving"
        @click="removeConfirm = true"
        text="Удалить"
      )
      BaseButton(
        :disabled="isSaving"
        @click="updateSelectWorkout"
        :text="isSaving ? 'Сохранение...' : 'Сохранить'"
      )
  
  ModalRemoveConfirm(
    text="Точно хочешь удалить данную запись?"
    :isShow="removeConfirm"
    @hiden="removeConfirm = false"
    @cancelRemove="removeConfirm = false"
    @remove="removeSelectWorkout"
  )
</template>
