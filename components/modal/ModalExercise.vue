<script setup>

const isShowModalExercise = useShowModalExercise()
const selectUpdateExercise = useSelectUpdateExercise()
const colors = useColors()

const exercise = ref('')
const color = ref('#5182dc')
const icon = ref('')
const error = ref(false)
const selectColor = ref(false)
const selectIcon = ref(false)

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
  .wrap
    p Цвет блока
    .selectColor(
      @click="selectColor = true"
      :style="`background: ${color}`"
    )
    Modal(:isShow="selectColor" @hiden="selectColor = false")
      .colors
        .colors__item(
          v-for="item in colors"
          @click="color = item; selectColor = false"
          :style="`background: ${item}`"
        )
  .wrap
    p Иконка
    .selectIcon(:class="`icon-${icon}`" @click="selectIcon = true")
    Modal(:isShow="selectIcon" @hiden="selectIcon = false")
      IconsSelect(
        @select="(el) => { icon = el; selectIcon = false }"
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

.wrap
  display flex
  align-items center
  justify-content space-between

.selectColor
  width 40px
  height 40px
  border-radius 10px
  background #5182dc

.selectIcon
  font-size 30px

.colors
  display grid
  grid-template-columns repeat(9, 1fr)
  &__item
    width 100%
    height 40px
</style>