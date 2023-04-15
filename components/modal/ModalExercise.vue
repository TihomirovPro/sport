<script setup>
const isShowModal = useShowModal()
const selectUpdateExercise = useSelectUpdateExercise()

const emits = defineEmits(['hiden'])

const exercise = ref('')
const color = ref('#5182dc')
const icon = ref('')
const error = ref(false)
const update = ref(false)

if (selectUpdateExercise.value) {
  exercise.value = selectUpdateExercise.value.name
  color.value = selectUpdateExercise.value.color ? selectUpdateExercise.value.color : '#5182dc'
  icon.value = selectUpdateExercise.value.icon
  update.value = true
}

const selectIcon = (el) => {
  icon.value = el
}

const newExercise = async () => {
  if (exercise.value) {
    const credentials = await createExercise(exercise.value, color.value, icon.value)
    exercise.value = ''
    icon.value = ''
    error.value = false
  } else {
    error.value = true
  }
}

const updateData = async () => {
  const credentials = await updateExercise(selectUpdateExercise.value.id, exercise.value, color.value, icon.value)
  isShowModal.value = false
}

const remove = async () => {
  const credentials = await removeExercise(selectUpdateExercise.value.id)
  isShowModal.value = false
}

const hideModal = () => {
  selectUpdateExercise.value = ''
}
</script>

<template lang="pug">
Modal(
  @hiden="hideModal"
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
  IconsSelect(@select="(el) => selectIcon(el)")
  BaseButton(
    v-if="!update"
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