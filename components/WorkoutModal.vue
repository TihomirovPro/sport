
<script setup>
const activeExercise = useActiveExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()

const emits = defineEmits(['hiden'])
const props = defineProps({
  show: { type: Boolean, default: false },
})

const easeus = ['Свой вес', 'С весом', 'Розовая резина', 'Желтая резина', 'Оранжевая резина', 'Черная резина', 'Филетовая резина', 'Серо-синяя резина', 'Зеленая резина', 'Синяя резина']

const nowDate = new Date()

const date = ref(`${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`)
const interval = ref('2.5')
const easeValue = ref(easeus[0])
const approach = ref('')
const weight = ref('')
const desc = ref('')
const error = ref(false)
const update = ref(false)

if (selectUpdateWorkout.value.length != 0) {
  date.value = selectUpdateWorkout.value.date
  interval.value = selectUpdateWorkout.value.interval
  easeValue.value = selectUpdateWorkout.value.ease
  approach.value = selectUpdateWorkout.value.approach
  weight.value = selectUpdateWorkout.value.weight
  desc.value = selectUpdateWorkout.value.desc
  update.value = true
}

const fixDate = () => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return new Date(date.value).toLocaleString("ru", options).slice(0, -2)
}

const add = async () => {
  if (approach.value) {
    const credentials = await createWorkout(activeExercise.value, date.value, interval.value, easeValue.value, approach.value, weight.value, desc.value)
    interval.value = '2.5'
    easeValue.value = easeus[0]
    approach.value = ''
    weight.value = ''
    desc.value = ''
    error.value = false
    emits('hiden')
  } else {
    error.value = true
  }
}

const updateSelectWorkout = async () => {
  const credentials = await updateWorkout(selectUpdateWorkout.value.id, date.value, interval.value, easeValue.value, approach.value, weight.value, desc.value)
  emits('hiden')
}

</script>
<template lang="pug">
Transition
  .detail__modal(v-if="show")
    .detail__modal-wrap
      label.date-label
        span {{ fixDate() }}
        BaseInput(
          v-model="date"
          type="date"
        )
      BaseInputRange(v-model="interval")
      BaseSelect(
        v-model="easeValue"
        placeholder="Сложность"
        :options="easeus"
      )
      BaseInput(
        v-model="approach"
        type="text"
        :error="error"
        inputmode="numeric"
        placeholder="Подходы"
      )
      BaseInput(
        v-if="easeValue === easeus[1]"
        v-model="weight"
        type="text"
        inputmode="numeric"
        placeholder="Веса"
      )
      BaseInput(
        v-model="desc"
        type="textarea"
        placeholder="Заметка"
      )
      BaseButton.detail__btn(
        v-if="!update"
        @click="add"
        text="Добавить"
      )
      BaseButton.detail__btn(
        v-else
        @click="updateSelectWorkout"
        text="Сохранить"
      )
</template>

<style lang="stylus" scoped>
.detail
  &__modal
    z-index 100
    position fixed
    top 0
    left 0
    width 100%
    height 100%
    display flex
    align-items center
    justify-content center
    background rgba(0,0,0,.7)

    &-wrap
        display grid
        gap 16px
        width 90%
        padding 24px 15px
        background #fafafa

  &__btn
    width 100%

.date-label
  padding: 12px
  text-align center
  font-size 18px
  input
    position absolute
    visibility hidden
    z-index -1
</style>