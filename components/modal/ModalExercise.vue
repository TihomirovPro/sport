<script setup>
const activeUser = useActiveUser()
const allWorkouts = useWorkouts()
const isShowModalExercise = useShowModalExercise()
const selectUpdateExercise = useSelectUpdateExercise()
const colors = useColors()

const exercise = ref('')
const color = ref('#5182dc')
const icon = ref('')
const error = ref(false)
const selectColor = ref(false)
const selectIcon = ref(false)
const workouts = ref('')
const removeConfirm = ref(false)
const text = ref('')

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
    getWorkouts(activeUser.value, selectUpdateExercise.value.id)
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
  await updateExercise(selectUpdateExercise.value.id, exercise.value, color.value, icon.value)
  reset()
}

const remove = async () => {
  if (allWorkouts.value.length) {
    allWorkouts.value.forEach(async item => {
      await removeWorkout(item.id)
    })
  }
  await removeExercise(selectUpdateExercise.value.id)
  removeConfirm.value = false
  reset()
}

const deleted = () => {
  if (allWorkouts.value.length) {
    text.value = 'Ты уверен, что хочешь удалить? Все добавленные записи будут удалены'
  } else {
    text.value = 'Ты уверен, что хочешь удалить?)'
  }
  removeConfirm.value = true
}
</script>

<template lang="pug">
div
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
    .wrap(@click="selectColor = true")
      p Цвет блока
      .selectColor(:style="`background: ${color}`")
    .wrap(@click="selectIcon = true")
      p Иконка
      .selectIcon(:class="`icon-${icon}`")
    BaseButton(
      v-if="!selectUpdateExercise"
      text="Добавить"
      @click="newExercise"
    )
    .modal__buttons(v-else)
      BaseButton(
        red
        text="Удалить"
        @click="deleted()"
      )
      BaseButton(
        text="Сохранить"
        @click="updateData()"
      )
  Modal(:isShow="removeConfirm" @hiden="removeConfirm = false")
    .modal__text {{ text }}
    .modal__buttons
      BaseButton(
        red
        text="Удалить"
        @click="remove()"
      )
      BaseButton(
        text="Отменить"
        @click="removeConfirm = false"
      )

  Modal(:isShow="selectColor" @hiden="selectColor = false")
    .colors
      .colors__item(
        v-for="item in colors"
        @click="color = item; selectColor = false"
        :style="`background: ${item}`"
      )
  
  Modal(:isShow="selectIcon" @hiden="selectIcon = false")
    IconsSelect(
      @select="(el) => { icon = el; selectIcon = false }"
    )
</template>

<style lang="stylus" scoped>
.modal__buttons
  display grid
  grid-template-columns 1fr 1fr
  place-items center
  gap 20px

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
  height 40px
  + .wrap:before
    position absolute
    left 0
    top -8px
    content ''
    width 100%
    border-top 1px solid rgba(#dcdcdc,1)

.selectColor
  width 40px
  height 40px
  border-radius 10px
  background #5182dc

.selectIcon
  font-size 35px

.colors
  display grid
  grid-template-columns repeat(6, 1fr)
  margin -24px -15px
  &__item
    width 100%
    height 50px
    border 2px solid #fff
    border-radius 10px
</style>