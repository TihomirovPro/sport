<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { updateData, removeData, createData } from '~/composables/firebaseInit'
import type { TypeExerciseCreate } from '~/composables/types'
import { EnumEase } from '~/composables/types';

useHead({
  title: 'Добавить упражнение'
})

const appStore = useAppStore()
appStore.headerTitle = 'Добавить упражнение'

const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const { workouts } = storeToRefs(workoutStore)
const { allExercises, selectUpdateExercise } = storeToRefs(exerciseStore)
const router = useRouter()

const showModalColor = ref<boolean>(false)
const showModalIcon = ref<boolean>(false)

const error = ref<boolean>(false)
const removeConfirm = ref<boolean>(false)
const text = ref<string>('')
const { notifyError } = useNotifications()

const constEases = [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]

const exercise = ref<TypeExerciseCreate>({
  name: '',
  color: '',
  icon: '',
  ease: constEases,
  isComplex: false,
  complexDesc: '',
  order: allExercises.value.length
})

function reset() {
  selectUpdateExercise.value = null
  error.value = false
  exercise.value = {
    name: '',
    color: '',
    icon: '',
    ease: constEases,
    isComplex: false,
    complexDesc: '',
    order: 0
  }
}

watchEffect(() => {
  if (selectUpdateExercise.value) {
    getWorkouts(selectUpdateExercise.value.id)
    appStore.headerTitle = 'Изменить упражнение'

    if (selectUpdateExercise.value.isComplex) {
      appStore.headerTitle = 'Изменить комплекс'
    }

    const { id, ...exerciseUpdate } = selectUpdateExercise.value
    exercise.value = {...exerciseUpdate }
    
    if (!selectUpdateExercise.value.ease) exercise.value.ease = constEases
    else exercise.value.ease = selectUpdateExercise.value.ease

  } else {
    appStore.headerTitle = 'Добавить упражнение'
    reset()
  }
})

async function newExercise() {
  if (!validateExercise()) return

  try {
    exercise.value.order = allExercises.value.length
    await createData('exercises', exercise.value)
    reset()
    await router.push('/')
  } catch (error) {
    console.error('[firebase:newExercise]', error)
    notifyError('Не удалось добавить упражнение. Попробуйте снова.')
  }
}

async function update() {
  if (!validateExercise()) return

  try {
    const selectedExerciseId = selectUpdateExercise.value?.id
    if (!selectedExerciseId) {
      notifyError('Не выбрано упражнение для изменения')
      return
    }

    if (exercise.value.order === undefined) exercise.value.order = allExercises.value.length
    if (exercise.value.isComplex === undefined) exercise.value.isComplex = false
    if (exercise.value.complexDesc === undefined) exercise.value.complexDesc = ''
    await updateData(`exercises/${selectedExerciseId}`, exercise.value)
    reset()
    await router.push('/')
  } catch (error) {
    console.error('[firebase:updateExercise]', error)
    notifyError('Не удалось сохранить упражнение. Попробуйте снова.')
  }
}

async function remove() {
  try {
    const selectedExerciseId = selectUpdateExercise.value?.id
    if (!selectedExerciseId) {
      notifyError('Не выбрано упражнение для удаления')
      return
    }

    await removeData(`workout/${selectedExerciseId}`)
    await removeData(`exercises/${selectedExerciseId}`)
    removeConfirm.value = false
    await router.push('/')
    reset()
  } catch (error) {
    console.error('[firebase:removeExercise]', error)
    notifyError('Не удалось удалить упражнение. Попробуйте снова.')
  }
}

function deleted() {
  if (workouts.value.length) {
    text.value = 'Ты уверен, что хочешь удалить? Все добавленные записи будут удалены'
  } else {
    text.value = 'Ты уверен, что хочешь удалить?)'
  }
  removeConfirm.value = true
}

function selectColor(color:string) {
  exercise.value.color = color
  showModalColor.value = false
}

function selectIcon(icon:string) {
  exercise.value.icon = icon
  showModalIcon.value = false
}

function selectEase(ease:EnumEase) {
  if (exercise.value.ease.includes(ease)) exercise.value.ease = [...exercise.value.ease.filter(el => el !== ease)]
  else exercise.value.ease.push(ease)
}

function validateExercise(): boolean {
  const name = exercise.value.name.trim()

  if (!name) {
    error.value = true
    notifyError('Введите название упражнения')
    return false
  }

  exercise.value.name = name
  error.value = false

  return true
}

watch(
  () => exercise.value.name,
  (name) => {
    if (name.trim()) error.value = false
  }
)
</script>

<template lang="pug">
.flex.flex-col.gap-3.h-full
  .flex.items-center.gap-3.pb-4
    .size-14.rounded-lg.flex-center.p-1(
      class="bg-accent min-w-[56px]"
      :style="`background: ${exercise.color}`"
    )
      Icon(
        v-if="exercise.icon"
        :icon="exercise.icon"
        color="#fff"
      )
      .text-white.text-2xl(v-else) {{ exercise.name[0] }}
    BaseInput(
      v-model="exercise.name"
      type="text"
      :error="error"
      placeholder="Название упражения"
    )

  TabsWrap
    TabsItem(
      title="Цвет"
      @click="showModalColor = true"
    )
    TabsItem(
      title="Иконка"
      @click="showModalIcon = true"
    )      
  p Сложность

  TabsEases(
    :eases="constEases"
    :selected="exercise.ease"
    @selectEase="(ease) => selectEase(ease)"
  )

  //- TabsItem(
  //-   title="Комплекс"
  //-   :active="exercise.isComplex"
  //-   @click="exercise.isComplex = !exercise.isComplex"
  //- )

  //- .grid.gap-5(v-if="exercise.isComplex")
  //-   BaseInput(
  //-     v-model="exercise.complexDesc"
  //-     type="textarea"
  //-     placeholder="Описание комплекса"
  //-     class="min-h-[120px]"
  //-   )

  .grid.grid-flow-col.place-items-center.gap-5.mt-auto
    BaseButton(
      v-if="!selectUpdateExercise"
      text="Добавить"
      @click="newExercise"
    ).mt-auto

    template(v-else)
      BaseButton(
        red
        text="Удалить"
        @click="deleted"
      )
      BaseButton(
        text="Сохранить"
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
    :activeIcon='exercise.icon'
    @hiden="showModalIcon = false"
    @selectIcon="(icon) => selectIcon(icon)"
  )
</template>
