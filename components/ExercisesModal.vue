<script setup>
const isShowModal = useShowModal()
const selectUpdateExercises = useSelectUpdateExercises()
const emits = defineEmits(['hiden'])

const exercise = ref('')
const error = ref(false)
const update = ref(false)

if (selectUpdateExercises.value) {
  exercise.value = selectUpdateExercises.value.name
  update.value = true
}

const newExercise = async () => {
  if (exercise.value) {
    const credentials = await createExercise(exercise.value)
    exercise.value = ''
    error.value = false
  } else {
    error.value = true
  }
}

const updateData = async () => {
  const credentials = await updateExercise(selectUpdateExercises.value.id, exercise.value)
  isShowModal.value = false
}

const remove = async () => {
  const credentials = await removeExercise(selectUpdateExercises.value.id)
  isShowModal.value = false
}
</script>

<template lang="pug">
Modal(@hiden="selectUpdateExercises = ''")
  BaseInput(
    v-model="exercise"
    type="text"
    :error="error"
    placeholder="Название упражения"
  )
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