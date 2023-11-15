<script setup lang="ts">
import type { TypeExerciseCreate } from '~/composables/types'
import { EnumEase } from '~/composables/types';

useHead({
  title: 'Добавить упражнение'
})

const headerTitle = useHeaderTitle()
headerTitle.value = 'Добавить упражнение'

const allWorkouts = useWorkouts()
const selectUpdateExercise = useSelectUpdateExercise()
const router = useRouter()

const showModalColor = ref<boolean>(false)
const showModalIcon = ref<boolean>(false)

const error = ref<boolean>(false)
const removeConfirm = ref<boolean>(false)
const text = ref<string>('')

const exercise = ref<TypeExerciseCreate>({
  name: '',
  color: '',
  icon: '',
  ease: [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]
})

function reset() {
  selectUpdateExercise.value = null
  error.value = false
  exercise.value = {
    name: '',
    color: '',
    icon: '',
    ease: [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]
  }
}

watchEffect(() => {
  if (selectUpdateExercise.value) {
    getWorkouts(selectUpdateExercise.value.id)
    headerTitle.value = 'Изменить упражнение'

    const { id, ...exerciseUpdate } = selectUpdateExercise.value
    exercise.value = {...exerciseUpdate }
    
    if (!selectUpdateExercise.value.ease) exercise.value.ease = [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]
    else exercise.value.ease = selectUpdateExercise.value.ease

  } else {
    headerTitle.value = 'Добавить упражнение'
    reset()
  }
})

async function newExercise() {
  if (exercise.value.name) {
    await createExercise(exercise.value)
    reset()
    router.push('/')
  } else {
    error.value = true
  }
}

async function updateData() {
  await updateExercise(selectUpdateExercise.value.id, exercise.value)
  reset()
  router.push('/')
}

async function remove() {
  if (allWorkouts.value.length) {
    allWorkouts.value.forEach(async item => {
      await removeWorkout(item.id)
    })
  }
  await removeExercise(selectUpdateExercise.value.id)
  removeConfirm.value = false
  router.push('/')
  reset()
}

function deleted() {
  if (allWorkouts.value.length) {
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
</script>

<template lang="pug">
.grid.gap-3
  .wrap.grid.gap-3.pb-4
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
  TabsWrap
    TabsItem(
      v-for="ease in EnumEase"
      :key="ease"
      :active="exercise.ease.includes(ease)"
      :title="ease"
      @click="selectEase(ease)"
    )
  .grid.grid-flow-col.place-items-center.gap-5.mt-4
    BaseButton(
      v-if="!selectUpdateExercise"
      text="Добавить"
      @click="newExercise"
    ).mt-auto

    template(v-else)
      BaseButton(
        red
        text="Удалить"
        @click="deleted()"
      )
      BaseButton(
        text="Сохранить"
        @click="updateData()"
      )

  ModalRemoveConfirm(
    :text="text"
    :isShow="removeConfirm"
    @hiden="removeConfirm = false"
    @cancelRemove="removeConfirm = false"
    @remove="remove()"
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

<style lang="stylus" scoped>
.modal__text
  text-align center
  font-size 18px
  line-height 140%
  padding 24px 0

.wrap
  position relative
  display flex
  align-items center
  justify-content space-between
  font-size 18px
</style>