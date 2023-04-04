
<script setup>
const activeExercise = useActiveExercise()

const emits = defineEmits(['hiden'])
const props = defineProps({
  id: String,
  date: { type: String, default: '' },
  interval: { type: String, default: '' },
  ease: { type: String, default: '' },
  desc: { type: String, default: '' },
  approach: { type: String, default: '' },
  weight: { type: String, default: '' },
  show: { type: Boolean, default: false }
})

const easeus = ['Свой вес', 'С весом', 'Розовая резина', 'Желтая резина', 'Оранжевая резина', 'Черная резина', 'Филетовая резина', 'Серо-синяя резина', 'Зеленая резина', 'Синяя резина']

const nowDate = new Date()

const dateValue = ref(`${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`)
const intervalValue = ref('2.5')
const easeValue = ref(easeus[0])
const approachValue = ref('')
const weightValue = ref('')
const descValue = ref('')
const error = ref(false)

const fixDate = () => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return new Date(dateValue.value).toLocaleString("ru", options).slice(0, -2)
}

const add = async () => {
  if (approachValue.value) {
    const credentials = await createWorkout(activeExercise.value, dateValue.value, intervalValue.value, easeValue.value, approachValue.value, weightValue.value, descValue.value)
    intervalValue.value = '2.5'
    easeValue.value = easeus[0]
    approachValue.value = ''
    weightValue.value = ''
    descValue.value = ''
    error.value = false
    emits('hiden')
  } else {
    error.value = true
  }
}

</script>
<template lang="pug">
Transition
  .detail__modal(v-if="show")
    .detail__modal-wrap
      label.date-label
        span {{ fixDate() }}
        BaseInput(
          v-model="dateValue"
          type="date"
        )
      BaseInputRange(v-model="intervalValue")
      BaseSelect(
        v-model="easeValue"
        placeholder="Сложность"
        :options="easeus"
      )
      BaseInput(
        v-model="approachValue"
        type="text"
        :error="error"
        inputmode="numeric"
        placeholder="Подходы"
      )
      BaseInput(
        v-if="easeValue === easeus[1]"
        v-model="weightValue"
        type="text"
        inputmode="numeric"
        placeholder="Веса"
      )
      BaseInput(
        v-model="descValue"
        type="textarea"
        placeholder="Заметка"
      )
      BaseButton.detail__btn(
        @click="add"
        text="Добавить"
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