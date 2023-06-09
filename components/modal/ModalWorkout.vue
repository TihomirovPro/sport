
<script setup>
const activeExercise = useActiveExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const isShowModalWorkout = useShowModalWorkout()
const easeus = useEaseus()
const rubbers = useRubbers()
const rubbersColor = useRubbersColor()

const nowDate = new Date()
const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const date = ref(`${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`)
const interval = ref('2.5')
const approaches = ref('5')
const ease = ref(easeus.value[0])
const rubber = ref(rubbers.value[0])
const approach = ref([])
const weight = ref([])
const desc = ref('')
const error = ref(false)

function reset () {
  isShowModalWorkout.value = false
  selectUpdateWorkout.value = ''
  date.value = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`
  interval.value = '2.5'
  ease.value = easeus.value[0]
  approaches.value = '5'
  approach.value = []
  weight.value = []
  desc.value = ''
  error.value = false
}

watchEffect(() => {
  if (selectUpdateWorkout.value) {
    date.value = selectUpdateWorkout.value.date
    interval.value = selectUpdateWorkout.value.interval
    approach.value = selectUpdateWorkout.value.approach
    approaches.value = selectUpdateWorkout.value.approach.length

    if (selectUpdateWorkout.value.ease !== 'Свой вес' && selectUpdateWorkout.value.ease !== 'С весом' ) {
      ease.value = 'В резине'
      rubber.value = selectUpdateWorkout.value.ease
    } else {
      ease.value = selectUpdateWorkout.value.ease
    }

    if (selectUpdateWorkout.value.weight) {
      weight.value = selectUpdateWorkout.value.weight
    }

    desc.value = selectUpdateWorkout.value.desc
  } else {
    reset()
  }
})

function easeRubber() {
  if (ease.value === 'В резине')
    return rubber.value
  else
    return ease.value
}

async function add() {
  if (approach.value) {
    await createWorkout(activeExercise.value, date.value, interval.value, easeRubber(), approach.value, weight.value, desc.value)
    reset()
  } else {
    error.value = true
  }
}

async function updateSelectWorkout() {
  if (approach.value) {
    await updateWorkout(selectUpdateWorkout.value.id, date.value, interval.value, easeRubber(), approach.value, weight.value, desc.value)
    reset()
  } else {
    error.value = true
  }
}

async function removeSelectWorkout() {
  await removeWorkout(selectUpdateWorkout.value.id)
  reset()
}

function selectRubber(name) {
  rubber.value = name
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
  BaseInputRange(v-model="approaches" max="20" step="1" view="approaches")

  .ease-buttons
    button.ease(
      :class="{ _active : ease === 'Свой вес' }"
      @click="ease = 'Свой вес'"
    ) Свой вес
    button.ease(
      :class="{ _active : ease === 'С весом' }"
      @click="ease = 'С весом'"
    ) С Весом
    button.ease(
      @click="ease = 'В резине'"
      :class="{ _active : ease !== 'Свой вес' && ease !== 'С весом' }"
    ) В резине

  .rubbers(v-if="ease === 'В резине'")
    div(
      v-for="item in rubbersColor"
      :style="`background: ${item.color}`"
      :class="{_active : rubber === item.name}"
      @click="selectRubber(item.name)"
    )

  BaseSelect(
    v-if="ease === 'В резине'"
    v-model="rubber"
    placeholder="Выбрать резину"
    :options="rubbers"
  )
  .approaches
    .approach(v-for="index in +approaches")
      BaseInput(
        v-model="approach[index-1]"
        type="text"
        :error="error"
        inputmode="numeric"
        :placeholder="`Подход ${index}`"
      )
      BaseInput(
        v-if="ease === 'С весом'"
        v-model="weight[index-1]"
        type="text"
        inputmode="numeric"
        :placeholder="`Вес ${index}`"
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
  .modal__buttons(v-else)
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

.modal__buttons
  display grid
  grid-template-columns 1fr 1fr
  place-items center
  gap 20px

.ease-buttons
  display flex
  gap: 12px
  justify-content space-between

.ease
  width 100%
  padding 12px 0
  text-align center
  background rgba(#5182dc, .2)
  border-radius 10px

  &._active
    color: #fff
    background #5182dc
    transition: .25s

.approach
  display flex
  align-items center
  gap 12px
  margin-bottom 12px

.rubbers
  gap 12px
  display grid
  grid-template-columns 1fr 1fr 1fr 1fr

  div
    border-radius 4px
    height 40px

    &._active
      border 2px solid #fff
      outline 2px solid #5182dc
</style>