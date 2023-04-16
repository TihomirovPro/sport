<script setup>

const isShowModalExercise = useShowModalExercise()
const selectUpdateExercise = useSelectUpdateExercise()

const exercise = ref('')
const color = ref('#5182dc')
const icon = ref('')
const error = ref(false)

function reset () {
  selectUpdateExercise.value = ''
  exercise.value = ''
  color.value = '#5182dc'
  icon.value = ''
  error.value = false
  isShowModalExercise.value = false
}

watchEffect(() => {
  if (selectUpdateExercise.value) {
    exercise.value = selectUpdateExercise.value.name
    color.value = selectUpdateExercise.value.color ? selectUpdateExercise.value.color : '#5182dc'
    icon.value = selectUpdateExercise.value.icon
  } else {
    reset()
  }
})

const newExercise = async () => {
  if (exercise.value) {
    const credentials = await createExercise(exercise.value, color.value, icon.value)
    reset()
  } else {
    error.value = true
  }
}

const updateData = async () => {
  const credentials = await updateExercise(selectUpdateExercise.value.id, exercise.value, color.value, icon.value)
  reset()
}

const remove = async () => {
  const credentials = await removeExercise(selectUpdateExercise.value.id)
  reset()
}
</script>

<template lang="pug">
Modal(
  :isShow="isShowModalExercise"
  @hiden="reset"
)
  BaseInput(
    v-model="exercise"
    type="text"
    :error="error"
    placeholder="Название упражения"
  )
  BaseInput(
    v-model="color"
    type="color"
    :error="error"
  )
  IconsSelect(
    @select="(el) => icon = el"
  )
  BaseButton(
    v-if="!selectUpdateExercise"
    text="Добавить"
    @click="newExercise"
  )
  .modal__buttons(v-else)
    BaseButton(
      text="Сохранить"
      @click="updateData()"
    )
    BaseButton(
      red
      text="Удалить"
      @click="remove()"
    )
</template>

<style lang="stylus" scoped>
.modal__buttons
  display grid
  grid-template-columns 1fr 1fr
  place-items center
  gap 20px
</style>