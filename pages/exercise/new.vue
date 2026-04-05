<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { createData } from '~/shared/api/firebaseInit'
import type { TypeExerciseCreate } from '~/composables/types'
import { EnumEase } from '~/composables/types'

definePageMeta({
  backTo: '/'
})

useHead({ title: 'Добавить упражнение' })

const appStore = useAppStore()
appStore.headerTitle = 'Добавить упражнение'

const exerciseStore = useExerciseStore()
const userStore = useUserStore()
const { allExercises } = storeToRefs(exerciseStore)
const { activeUser } = storeToRefs(userStore)
const router = useRouter()

const showModalColor = ref<boolean>(false)
const showModalIcon = ref<boolean>(false)
const error = ref<boolean>(false)
const isSaving = ref<boolean>(false)
const { notifyError } = useNotifications()

const constEases = [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]
const canManageComplexes = computed(() => String(activeUser.value.status || '').trim().toLowerCase() === 'admin')

const exercise = ref<TypeExerciseCreate>({
  name: '',
  color: '',
  icon: '',
  ease: constEases,
  isComplex: false,
  complexDesc: '',
  order: allExercises.value.length
})

async function newExercise() {
  if (isSaving.value) return
  if (!validateExercise()) return

  isSaving.value = true
  try {
    exercise.value.order = allExercises.value.length
    await createData('exercises', exercise.value)
    await router.push('/')
  } catch (e) {
    console.error('[firebase:newExercise]', e)
    notifyError('Не удалось добавить упражнение. Попробуйте снова.')
  } finally {
    isSaving.value = false
  }
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
      :text="isSaving ? 'Сохранение...' : 'Добавить'"
      :disabled="isSaving"
      @click="newExercise"
    ).mt-auto

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
