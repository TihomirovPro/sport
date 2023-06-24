<script setup lang="ts">
import type { TypeExercise } from "../../composables/types"

const allWorkouts = useWorkouts()
const isShowModalExercise = useShowModalExercise()
const selectUpdateExercise = useSelectUpdateExercise()

const showModalColor = ref<boolean>(false)
const showModalIcon = ref<boolean>(false)

const error = ref<boolean>(false)
const removeConfirm = ref<boolean>(false)
const text = ref<string>('')

const exercise = ref<TypeExercise>({
  id: '',
  name: '',
  color: '',
  icon: '',
})

function reset() {
  selectUpdateExercise.value = null
  isShowModalExercise.value = false
  error.value = false
  exercise.value = {
    id: '',
    name: '',
    color: '',
    icon: '',
  }
}

watchEffect(() => {
  if (selectUpdateExercise.value) {
    getWorkouts(selectUpdateExercise.value.id)
    exercise.value = { ...selectUpdateExercise.value }
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
  await updateExercise(exercise.value)
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

function selectColor(color:string) {
  exercise.value.color = color
  showModalColor.value = false
}

function selectIcon(icon:string) {
  exercise.value.icon = icon
  showModalIcon.value = false
}
</script>

<template lang="pug">
div
  Modal(
    :isShow="isShowModalExercise"
    @hiden="reset"
  )
    template(#content)
      BaseInput(
        v-model="exercise.name"
        type="text"
        :error="error"
        placeholder="Название упражения"
      )
      .wrap(@click="showModalColor = true")
        p Цвет блока
        .size-10.rounded-lg(
          class="bg-[#5182dc]"
          :style="`background: ${exercise.color}`"
        )
      .wrap(@click="showModalIcon = true")
        p Иконка
        .text-4xl(:class="`icon-${exercise.icon}`")

    template(#bottom)
      BaseButton(
        v-if="!selectUpdateExercise"
        text="Добавить"
        @click="newExercise"
      )
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
  
  Modal(:isShow="removeConfirm" @hiden="removeConfirm = false")
    template(#content)
      .modal__text {{ text }}
    template(#buttom)
      BaseButton(
        text="Отменить"
        @click="removeConfirm = false"
      )
      BaseButton(
        red
        text="Удалить"
        @click="remove()"
      )
  
  ModalColor(
    :isShow="showModalColor"
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
  height 40px

  + .wrap:before
    position absolute
    left 0
    top -8px
    content ''
    width 100%
    border-top 1px solid rgba(#dcdcdc,1)
</style>