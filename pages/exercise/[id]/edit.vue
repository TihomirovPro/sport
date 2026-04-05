<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { updateData, removeData } from '~/shared/api/firebaseInit'
import type { TypeExerciseCreate } from '~/composables/types'
import { EnumEase } from '~/composables/types'

definePageMeta({
  backToExercise: true
})

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const exerciseStore = useExerciseStore()
const workoutStore = useWorkoutStore()
const userStore = useUserStore()
const { allExercises } = storeToRefs(exerciseStore)
const { workouts } = storeToRefs(workoutStore)
const { activeUser } = storeToRefs(userStore)
const { notifyError } = useNotifications()

const exerciseId = computed(() => String(route.params.id))
const sourceExercise = computed(() => allExercises.value.find(e => e.id === exerciseId.value) || null)

const showModalColor = ref<boolean>(false)
const showModalIcon = ref<boolean>(false)
const error = ref<boolean>(false)
const removeConfirm = ref<boolean>(false)
const isSaving = ref<boolean>(false)
const text = ref<string>('')

const constEases = [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]
const canManageComplexes = computed(() => String(activeUser.value.status || '').trim().toLowerCase() === 'admin')

const exercise = ref<TypeExerciseCreate>({
  name: '',
  color: '',
  icon: '',
  ease: constEases,
  isComplex: false,
  complexDesc: '',
  order: 0
})

watchEffect(() => {
  if (sourceExercise.value) {
    const { id: _id, ...data } = sourceExercise.value
    exercise.value = { ...data }
    if (!exercise.value.ease) exercise.value.ease = constEases
    appStore.headerTitle = exercise.value.isComplex ? 'Изменить комплекс' : 'Изменить упражнение'
  }
})

useHead(() => ({ title: appStore.headerTitle }))

onMounted(() => {
  if (!exerciseId.value) {
    void router.push('/')
    return
  }
  getWorkouts(exerciseId.value)
})

onUnmounted(() => {
  stopWorkoutsSubscription()
})

async function update() {
  if (isSaving.value) return
  if (!validateExercise()) return

  isSaving.value = true
  try {
    if (exercise.value.order === undefined) exercise.value.order = allExercises.value.length
    if (exercise.value.isComplex === undefined) exercise.value.isComplex = false
    if (exercise.value.complexDesc === undefined) exercise.value.complexDesc = ''
    await updateData(`exercises/${exerciseId.value}`, exercise.value)
    await router.push('/')
  } catch (e) {
    console.error('[firebase:updateExercise]', e)
    notifyError('Не удалось сохранить упражнение. Попробуйте снова.')
  } finally {
    isSaving.value = false
  }
}

async function remove() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    await removeData(`workout/${exerciseId.value}`)
    await removeData(`exercises/${exerciseId.value}`)
    removeConfirm.value = false
    await router.push('/')
  } catch (e) {
    console.error('[firebase:removeExercise]', e)
    notifyError('Не удалось удалить упражнение. Попробуйте снова.')
  } finally {
    isSaving.value = false
  }
}

function deleted() {
  if (isSaving.value) return
  text.value = workouts.value.length
    ? 'Ты уверен, что хочешь удалить? Все добавленные записи будут удалены'
    : 'Ты уверен, что хочешь удалить?)'
  removeConfirm.value = true
}

function selectColor(color: string) {
  exercise.value.color = color
  showModalColor.value = false
}

function selectIcon(icon: string) {
  exercise.value.icon = icon
  showModalIcon.value = false
}

function selectEase(ease: EnumEase) {
  if (exercise.value.ease.includes(ease)) exercise.value.ease = [...exercise.value.ease.filter(el => el !== ease)]
  else exercise.value.ease.push(ease)
}

function toggleComplex() {
  if (!canManageComplexes.value) {
    notifyError('Только пользователь со статусом admin может создавать комплексы')
    return
  }
  exercise.value.isComplex = !exercise.value.isComplex
  if (!exercise.value.isComplex) exercise.value.complexDesc = ''
}

function validateExercise(): boolean {
  const name = exercise.value.name.trim()
  if (!name) {
    error.value = true
    notifyError('Введите название упражнения')
    return false
  }
  exercise.value.name = name
  if (!Array.isArray(exercise.value.ease) || exercise.value.ease.length === 0) {
    notifyError('Выберите хотя бы один тип сложности')
    return false
  }
  if (exercise.value.isComplex && !canManageComplexes.value) {
    notifyError('Только пользователь со статусом admin может создавать комплексы')
    return false
  }
  exercise.value.complexDesc = exercise.value.isComplex ? (exercise.value.complexDesc?.trim() || '') : ''
  error.value = false
  return true
}

watch(() => exercise.value.name, (name) => {
  if (name.trim()) error.value = false
})
</script>

<template lang="pug">
.flex.flex-col.gap-3.h-full
  .flex.items-center.gap-3.pb-4
    .size-14.rounded-lg.flex-center.p-1(
      class="bg-accent min-w-[56px]"
      :style="`background: ${exercise.color}`"
    )
      Icon(v-if="exercise.icon" :icon="exercise.icon" color="#fff")
      .text-white.text-2xl(v-else) {{ exercise.name[0] }}
    UiInput(
      v-model="exercise.name"
      type="text"
      :error="error"
      placeholder="Название упражнения"
    )

  UiTabsWrap
    UiTabsItem(title="Цвет" @click="showModalColor = true")
    UiTabsItem(title="Иконка" @click="showModalIcon = true")

  p Сложность

  TabsEases(
    :eases="constEases"
    :selected="exercise.ease"
    @selectEase="selectEase"
  )

  TabsItem(
    v-if="canManageComplexes"
    title="Комплекс"
    :active="exercise.isComplex"
    @click="toggleComplex"
  )

  .grid.gap-5(v-if="exercise.isComplex && canManageComplexes")
    UiInput(
      v-model="exercise.complexDesc"
      type="textarea"
      placeholder="Описание комплекса"
      class="min-h-[120px]"
    )

  .grid.grid-flow-col.place-items-center.gap-5.mt-auto
    UiButton(
      red
      :disabled="isSaving"
      text="Удалить"
      @click="deleted"
    )
    UiButton(
      :text="isSaving ? 'Сохранение...' : 'Сохранить'"
      :disabled="isSaving"
      @click="update"
    )

  ModalRemoveConfirm(
    :text="text"
    :isShow="removeConfirm"
    @hiden="removeConfirm = false"
    @cancelRemove="removeConfirm = false"
    @remove="remove"
  )

  ModalColor(
    :isShow="showModalColor"
    :activeColor="exercise.color"
    @hiden="showModalColor = false"
    @selectColor="(color) => selectColor(color)"
  )

  ModalIcon(
    :isShow="showModalIcon"
    :activeIcon="exercise.icon"
    @hiden="showModalIcon = false"
    @selectIcon="(icon) => selectIcon(icon)"
  )
</template>
