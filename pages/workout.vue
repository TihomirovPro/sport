<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { createData, updateData, removeData } from '~/composables/firebaseInit'
import type { TypeWorkoutCreate } from '~/composables/types'
import type { TypeExercise } from '~/composables/types'
import { EnumEase } from '~/composables/types'

const router = useRouter()
const exerciseStore = useExerciseStore()
const workoutStore = useWorkoutStore()
const catalogStore = useCatalogStore()
const appStore = useAppStore()
const { activeExercise } = storeToRefs(exerciseStore)
const { selectUpdateWorkout } = storeToRefs(workoutStore)
const { rubbersColor } = storeToRefs(catalogStore)
const { headerTitle } = storeToRefs(appStore)
const { notifyError } = useNotifications()
headerTitle.value = 'Добавить тренировку'

useHead({
  title: headerTitle.value
})

function readStoredActiveExercise() {
  const raw = localStorage.getItem('activeExercise')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<TypeExercise> | null
    if (!parsed?.id) return null
    return parsed
  } catch {
    return null
  }
}

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

if (!activeExercise.value) {
  const storedActiveExercise = readStoredActiveExercise()
  if (storedActiveExercise?.id) {
    activeExercise.value = {
      id: storedActiveExercise.id,
      name: storedActiveExercise.name ?? '',
      ease: Array.isArray(storedActiveExercise.ease)
        ? storedActiveExercise.ease
        : [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber],
      order: typeof storedActiveExercise.order === 'number' ? storedActiveExercise.order : 0,
      color: storedActiveExercise.color,
      icon: storedActiveExercise.icon,
      isComplex: storedActiveExercise.isComplex,
      complexDesc: storedActiveExercise.complexDesc,
    }
  }
}

if (activeExercise.value?.id) {
  getWorkouts(activeExercise.value.id)
} else {
  notifyError('Нет данных упражнения в оффлайн-кэше. Сначала откройте его онлайн.')
  void router.push('/')
}

function formatDate(date:number | string):string {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date)).slice(0, -3)
}

function toDateInputValue(value: unknown): string {
  const timestamp = normalizeWorkoutDate(value)
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const nowDate = new Date().getTime()
const error = ref(false)
const approaches = ref(5)
const removeConfirm = ref(false)
const complexTime = ref('')

const isComplex = computed(() => Boolean(activeExercise.value?.isComplex))
const eases = computed(() => activeExercise.value?.ease || [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber])
const workoutDateInputRef = ref<HTMLInputElement | null>(null)
const workoutDateModel = computed<string>({
  get() {
    return toDateInputValue(workout.value.date)
  },
  set(value) {
    workout.value.date = value
    saveNewWorkout()
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

const workout = ref<TypeWorkoutCreate>({
  date: nowDate,
  interval: '2.5',
  ease: activeExercise.value?.ease?.[0] ?? EnumEase.noWeight,
  rubber: '',
  approach: [],
  weight: [],
  complexExercises: [],
  desc: '',
  exercisesId: activeExercise.value?.id ?? '',
  res: 0,
  resWeigth: 0
})

type WorkoutStoreItem = {
  id: string
  exercisesId: string
  date: number
  interval: string
  ease: EnumEase
  rubber?: string
  complexExercises?: string[]
  approach: number[]
  weight?: number[]
  desc?: string
  res: number
  resWeigth: number
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
  selectUpdateWorkout.value = null
  error.value = false
  complexTime.value = ''
  workout.value = {
    exercisesId: activeExercise.value?.id ?? '',
    date: nowDate,
    interval: '2.5',
    ease: activeExercise.value?.ease?.[0] ?? EnumEase.noWeight,
    rubber: '',
    approach: [],
    weight: [],
    complexExercises: [],
    desc: '',
    res: 0,
    resWeigth: 0
  }
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
  if (!validateWorkout()) return

  try {
    const createdId = await createData(`workout/${workout.value.exercisesId}`, workout.value)

    upsertWorkoutInStore({
      id: createdId,
      exercisesId: workout.value.exercisesId,
      date: workout.value.date as number,
      interval: workout.value.interval,
      ease: workout.value.ease,
      rubber: workout.value.rubber,
      complexExercises: Array.isArray(workout.value.complexExercises) ? [...workout.value.complexExercises] : [],
      approach: [...workout.value.approach],
      weight: Array.isArray(workout.value.weight) ? [...workout.value.weight] : [],
      desc: workout.value.desc,
      res: workout.value.res,
      resWeigth: workout.value.resWeigth
    })

    await router.push('/exercise-item')
    reset()
    localStorage.removeItem('newWorkout')
    localStorage.removeItem('approaches')
  } catch (error) {
    console.error('[firebase:addWorkout]', error)
    notifyError('Не удалось добавить тренировку. Попробуйте снова.')
  }
}

async function updateSelectWorkout() {
  if (!validateWorkout()) return

  try {
    const selectedWorkoutId = selectUpdateWorkout.value?.id
    if (!selectedWorkoutId) {
      notifyError('Не выбрана тренировка для изменения')
      return
    }

    await updateData(`workout/${workout.value.exercisesId}/${selectedWorkoutId}`, workout.value)

    upsertWorkoutInStore({
      id: selectedWorkoutId,
      exercisesId: workout.value.exercisesId,
      date: workout.value.date as number,
      interval: workout.value.interval,
      ease: workout.value.ease,
      rubber: workout.value.rubber,
      complexExercises: Array.isArray(workout.value.complexExercises) ? [...workout.value.complexExercises] : [],
      approach: [...workout.value.approach],
      weight: Array.isArray(workout.value.weight) ? [...workout.value.weight] : [],
      desc: workout.value.desc,
      res: workout.value.res,
      resWeigth: workout.value.resWeigth
    })

    reset()
    await router.push('/exercise-item')
  } catch (error) {
    console.error('[firebase:updateWorkout]', error)
    notifyError('Не удалось сохранить тренировку. Попробуйте снова.')
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

function parseDurationToSeconds(value: string): number {
  const raw = value.trim()
  if (!raw) return 0

  if (raw.includes(':')) {
    const [minsRaw, secsRaw] = raw.split(':')
    const mins = Number(minsRaw)
    const secs = Number(secsRaw)

    if (!Number.isFinite(mins) || !Number.isFinite(secs) || mins < 0 || secs < 0 || secs > 59) {
      return NaN
    }

    return mins * 60 + secs
  }

  const onlySeconds = Number(raw.replace(',', '.'))
  if (!Number.isFinite(onlySeconds) || onlySeconds < 0) return NaN
  return Math.floor(onlySeconds)
}

if (!selectUpdateWorkout.value) {
  const newWorkoutRaw = localStorage.getItem('newWorkout')
  const approachesRaw = localStorage.getItem('approaches')

  if (newWorkoutRaw) {
    const newWorkout = safeParseJson<Partial<TypeWorkoutCreate> & { resWeidth?: number }>(newWorkoutRaw, {})
    const parsedApproachesRaw = approachesRaw ? safeParseJson<unknown>(approachesRaw, 5) : 5
    const parsedApproaches = Number(parsedApproachesRaw)
    approaches.value = Number.isFinite(parsedApproaches) ? parsedApproaches : 5

    workout.value = {
      exercisesId: activeExercise.value?.id ?? '',
      date: newWorkout.date ?? nowDate,
      interval: newWorkout.interval ?? '2.5',
      approach: Array.isArray(newWorkout.approach) ? newWorkout.approach : [],
      ease: newWorkout.ease ?? EnumEase.noWeight,
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

function saveNewWorkout() {
  if (!selectUpdateWorkout.value) {
    if (isComplex.value) {
      const parsed = parseDurationToSeconds(complexTime.value)
      workout.value.res = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
    }

    localStorage.setItem('newWorkout', JSON.stringify(workout.value))
    localStorage.setItem('approaches', JSON.stringify(approaches.value))
  }
}

function selectEase(ease:EnumEase) {
  workout.value.ease = ease
  saveNewWorkout()
}

function selectRubber(name:string) {
  workout.value.rubber = name
  saveNewWorkout()
}

function updateWeight(idx: number, value: string | number | undefined) {
  if (!Array.isArray(workout.value.weight)) workout.value.weight = []

  const normalized = String(value ?? '').replace(',', '.').trim()
  workout.value.weight[idx] = normalized === '' ? NaN : Number(normalized)

  saveNewWorkout()
}

function changeInterval() {
  saveNewWorkout()
}

function addComplexExercise() {
  if (!Array.isArray(workout.value.complexExercises)) workout.value.complexExercises = []
  workout.value.complexExercises.push('')
  saveNewWorkout()
}

function removeComplexExercise(index:number) {
  if (!Array.isArray(workout.value.complexExercises)) return
  workout.value.complexExercises.splice(index, 1)
  saveNewWorkout()
}

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []

  return value.map((item) => {
    const normalized = String(item ?? '').replace(',', '.').trim()
    return normalized === '' ? NaN : Number(normalized)
  })
}

function normalizeWorkoutDate(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return Date.now()
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
</script>

<template lang="pug">
.flex.flex-col.gap-3.min-h-full
  label.date-label(@click="openDatePicker")
    input.date-input(
      ref="workoutDateInputRef"
      v-model="workoutDateModel"
      type="date"
    )
    span {{ formatDate(workout.date) }}
  template(v-if="!isComplex")
    BaseInputRange(v-model="workout.interval" @change="changeInterval")
    BaseInputRange(v-model="approaches" max="10" step="1" view="approaches" @change="saveNewWorkout")
  template(v-else)
    BaseInput(
      v-model="complexTime"
      type="text"
      :error="error"
      placeholder="Время выполнения"
      @input="saveNewWorkout"
    )
    .grid.gap-2
      .text-sm.opacity-70 Упражнения в этой тренировке
      .flex.items-center.gap-2(
        v-for="(item, idx) in workout.complexExercises"
        :key="`complex-exercise-${idx}`"
      )
        BaseInput(
          v-model="workout.complexExercises[idx]"
          type="text"
          placeholder="Упражнение"
          @input="saveNewWorkout"
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
    @selectEase="selectEase"
  )

  .rubbers(v-if="!isComplex && workout.ease === EnumEase.rubber")
    .text-white.text-xs.text-center.flex-center.cursor-pointer(
      v-for="item in rubbersColor"
      :style="`background: ${item.color}`"
      :class="{ active: workout.rubber === item.name }"
      @click="selectRubber(item.name)"
    ) {{ item.name.replace(' резина', '') }}

  .approaches(v-if="!isComplex")
    .approach(
      v-for="index in +approaches"
      :key="index"
    )
      //- template(v-if="index === 1 || workout.approach[index-2]")
      .text-sm {{ timerApproach(index-1) }}
      BaseInput(
        v-model="workout.approach[index-1]"
        type="text"
        :error="error"
        inputmode="numeric"
        :placeholder="`Подход ${index}`"
        @input="saveNewWorkout"
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
    v-model="workout.desc"
    type="textarea"
    placeholder="Заметка"
    @input="saveNewWorkout"
  )

  .grid.grid-flow-col.place-items-center.gap-5.mt-auto
    BaseButton(
      v-if="!selectUpdateWorkout"
      @click="add"
      text="Добавить"
    )
    template(v-else)
      BaseButton(
        red
        @click="removeConfirm = true"
        text="Удалить"
      )
      BaseButton(
        @click="updateSelectWorkout"
        text="Сохранить"
      )
  
  ModalRemoveConfirm(
    text="Точно хочешь удалить данную запись?"
    :isShow="removeConfirm"
    @hiden="removeConfirm = false"
    @cancelRemove="removeConfirm = false"
    @remove="removeSelectWorkout"
  )
</template>

<style lang="stylus" scoped>
.date-label
  display grid
  gap 6px
  padding: 12px 0
  text-align center
  min-height: 52px
  border-radius 12px
  background-color unquote('rgba(var(--colorAccent), 0.3)')
  border solid 2px unquote('rgb(var(--colorAccent))')

  .date-input
    width 1px
    height 1px
    position absolute
    z-index -1

.approach
  display flex
  align-items center
  gap 12px
  margin-bottom 12px

.rubbers
  gap 12px
  display grid
  grid-template-columns 1fr 1fr 1fr 1fr

  div
    border-radius 4px
    height 40px

    &.active
      border 2px solid #fff
      outline 2px solid #5182dc
</style>
