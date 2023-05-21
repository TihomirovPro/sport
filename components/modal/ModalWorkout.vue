
<script setup>
const activeExercise = useActiveExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const isShowModalWorkout = useShowModalWorkout()
const easeus = useEaseus()

const nowDate = new Date()

const date = ref(`${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`)
const interval = ref('2.5')
const ease = ref(easeus.value[0])
const approach = ref('')
const weight = ref('')
const desc = ref('')
const error = ref(false)

function reset () {
  isShowModalWorkout.value = false
  selectUpdateWorkout.value = ''
  date.value = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`
  interval.value = '2.5'
  ease.value = easeus.value[0]
  approach.value = ''
  weight.value = ''
  desc.value = ''
  error.value = false
}

watchEffect(() => {
  if (selectUpdateWorkout.value) {
    date.value = selectUpdateWorkout.value.date
    interval.value = selectUpdateWorkout.value.interval
    ease.value = selectUpdateWorkout.value.ease
    approach.value = selectUpdateWorkout.value.approach.join('-')
    if (selectUpdateWorkout.value.weight) {
      weight.value = selectUpdateWorkout.value.weight.join('-')
    }
    desc.value = selectUpdateWorkout.value.desc
  } else {
    reset()
  }
})

const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const add = async () => {
  if (approach.value) {
    const credentials = await createWorkout(activeExercise.value, date.value, interval.value, ease.value, approach.value, weight.value, desc.value)
    reset()
  } else {
    error.value = true
  }
}

const updateSelectWorkout = async () => {
  if (approach.value) {
    const credentials = await updateWorkout(selectUpdateWorkout.value.id, date.value, interval.value, ease.value, approach.value, weight.value, desc.value)
    reset()
  } else {
    error.value = true
  }
}

const removeSelectWorkout = async () => {
  const credentials = await removeWorkout(selectUpdateWorkout.value.id)
  reset()
}

</script>
<template lang="pug">
Modal(
  :isShow="isShowModalWorkout"
  @hiden="reset"
)
  label.date-label
    span {{ new Date(date).toLocaleString("ru", options).slice(0, -2) }}
    BaseInput(
      v-model="date"
      type="date"
    )
  BaseInputRange(v-model="interval")
  BaseSelect(
    v-model="ease"
    placeholder="Сложность"
    :options="easeus"
  )
  BaseInput(
    v-model="approach"
    type="text"
    :error="error"
    @input=""
    inputmode="numeric"
    placeholder="Подходы"
  )
  BaseInput(
    v-if="ease === easeus[1]"
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
  BaseButton(
    v-if="!selectUpdateWorkout"
    @click="add"
    text="Добавить"
  )
  template(v-else)
    BaseButton(
      red
      @click="removeSelectWorkout"
      text="Удалить"
    )
    BaseButton(
      @click="updateSelectWorkout"
      text="Сохранить"
    )
</template>

<style lang="stylus" scoped>
.date-label
  padding: 16px 0
  width calc(100% + 30px)
  margin: -24px -15px 0
  text-align center
  font-size 18px
  background #5182dc
  color: #fafafa
  border-bottom 1px solid rgba(0,0,0,.4)
  input
    position absolute
    visibility hidden
    z-index -1
</style>