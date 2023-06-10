<script setup>
const activeUser = useActiveUser()
const allWorkouts = useWorkouts()
const isShowModalExercise = useShowModalExercise()
const selectUpdateExercise = useSelectUpdateExercise()
const colors = useColors()

const error = ref(false)
const selectColor = ref(false)
const selectIcon = ref(false)
const removeConfirm = ref(false)
const text = ref('')

const exercise = ref({
  name: '',
  color: '#5182dc',
  icon: '',
})

function reset() {
  selectUpdateExercise.value = ''
  isShowModalExercise.value = false
  error.value = false
  exercise.value = {
    name: '',
    color: '#5182dc',
    icon: '',
  }
}

watchEffect(() => {
  if (selectUpdateExercise.value) {
    getWorkouts(activeUser.value, selectUpdateExercise.value.id)
    exercise.value = {
      name: selectUpdateExercise.value.name,
      color: selectUpdateExercise.value.color ? selectUpdateExercise.value.color : '#5182dc',
      icon: selectUpdateExercise.value.icon,
    }
  } else {
    reset()
  }
})

async function newExercise() {
  if (exercise.value.name) {
    await createExercise(exercise.value)
    reset()
  } else {
    error.value = true
  }
}

async function updateData() {
  await updateExercise(selectUpdateExercise.value.id, exercise.value)
  reset()
}

async function remove() {
  if (allWorkouts.value.length) {
    allWorkouts.value.forEach(async item => {
      await removeWorkout(item.id)
    })
  }
  await removeExercise(selectUpdateExercise.value.id)
  removeConfirm.value = false
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
</script>

<template lang="pug">
div
  Modal(
    :isShow="isShowModalExercise"
    @hiden="reset"
  )
    BaseInput(
      v-model="exercise.name"
      type="text"
      :error="error"
      placeholder="Название упражения"
    )
    .wrap(@click="selectColor = true")
      p Цвет блока
      .selectColor(:style="`background: ${exercise.color}`")
    .wrap(@click="selectIcon = true")
      p Иконка
      .selectIcon(:class="`icon-${exercise.icon}`")
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
        text="Отменить"
        @click="removeConfirm = false"
      )
      BaseButton(
        red
        text="Удалить"
        @click="remove()"
      )

  Modal(:isShow="selectColor" @hiden="selectColor = false")
    .colors
      .colors__item(
        v-for="item in colors"
        @click="exercise.color = item; selectColor = false"
        :style="`background: ${item}`"
      )
  
  Modal(:isShow="selectIcon" @hiden="selectIcon = false")
    IconsSelect(
      @select="(el) => { exercise.icon = el; selectIcon = false }"
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