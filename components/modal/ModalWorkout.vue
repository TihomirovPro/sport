
<script setup>
const activeExercise = useActiveExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const isShowModalWorkout = useShowModalWorkout()
const easeus = useEaseus()
const rubbers = useRubbers()
const rubbersColor = useRubbersColor()

const nowDate = new Date()
const error = ref(false)

const workout = ref({
  date: `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`,
  interval: '2.5',
  approaches: '5',
  ease: easeus.value[0],
  rubber: rubbers.value[0],
  approach: [],
  weight: [],
  desc: ''
})

const convertDate = computed(()=> {
  return new Date(workout.value.date).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).slice(0, -2)
})

function reset () {
  isShowModalWorkout.value = false
  selectUpdateWorkout.value = ''
  workout.value.date = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`
  workout.value.interval = '2.5'
  workout.value.ease = easeus.value[0]
  workout.value.approaches = '5'
  workout.value.approach = []
  workout.value.weight = []
  workout.value.desc = ''
  error.value = false
}

watchEffect(() => {
  if (selectUpdateWorkout.value) {
    workout.value.date = selectUpdateWorkout.value.date
    workout.value.interval = selectUpdateWorkout.value.interval
    workout.value.approach = selectUpdateWorkout.value.approach
    workout.value.approaches = selectUpdateWorkout.value.approach.length

    if (selectUpdateWorkout.value.ease !== 'Свой вес' && selectUpdateWorkout.value.ease !== 'С весом' ) {
      workout.value.ease = 'В резине'
      workout.value.rubber = selectUpdateWorkout.value.ease
    } else {
      workout.value.ease = selectUpdateWorkout.value.ease
    }

    if (selectUpdateWorkout.value.weight) {
      workout.value.weight = selectUpdateWorkout.value.weight
    }

    workout.value.des = selectUpdateWorkout.value.desc
  } else {
    reset()
  }
})

function easeRubber() {
  if (workout.value.ease === 'В резине')
    return workout.value.rubber
  else
    return workout.value.ease
}

async function add() {
  if (workout.value.approach) {
    await createWorkout(activeExercise.value, workout.value.date, workout.value.interval, easeRubber(), workout.value.approach, workout.value.weight, workout.value.desc)
    reset()
  } else {
    error.value = true
  }
}

async function updateSelectWorkout() {
  if (workout.value.approach) {
    await updateWorkout(selectUpdateWorkout.value.id, workout.value.date, workout.value.interval, easeRubber(), workout.value.approach, weight.value, workout.value.desc)
    reset()
  } else {
    error.value = true
  }
}

async function removeSelectWorkout() {
  await removeWorkout(selectUpdateWorkout.value.id)
  reset()
}
</script>

<template lang="pug">
Modal(
  :isShow="isShowModalWorkout"
  @hiden="reset"
)
  label.date-label
    span {{ convertDate }}
    BaseInput(
      v-model="date"
      type="date"
    )
  BaseInputRange(v-model="workout.interval")
  BaseInputRange(v-model="workout.approaches" max="20" step="1" view="approaches")

  .ease-buttons
    button.ease(
      :class="{ _active : workout.ease === 'Свой вес' }"
      @click="workout.ease = 'Свой вес'"
    ) Свой вес
    button.ease(
      :class="{ _active : workout.ease === 'С весом' }"
      @click="workout.ease = 'С весом'"
    ) С Весом
    button.ease(
      @click="workout.ease = 'В резине'"
      :class="{ _active : workout.ease !== 'Свой вес' && workout.ease !== 'С весом' }"
    ) В резине

  .rubbers(v-if="workout.ease === 'В резине'")
    div(
      v-for="item in rubbersColor"
      :style="`background: ${item.color}`"
      :class="{_active : rubber === item.name}"
      @click="workout.rubber = item.name"
    )

  BaseSelect(
    v-if="workout.ease === 'В резине'"
    v-model="workout.rubber"
    placeholder="Выбрать резину"
    :options="rubbers"
  )
  .approaches
    .approach(v-for="index in +workout.approaches")
      BaseInput(
        v-model="workout.approach[index-1]"
        type="text"
        :error="error"
        inputmode="numeric"
        :placeholder="`Подход ${index}`"
      )
      BaseInput(
        v-if="workout.ease === 'С весом'"
        v-model="workout.weight[index-1]"
        type="text"
        inputmode="numeric"
        :placeholder="`Вес ${index}`"
      )

  BaseInput(
    v-model="workout.desc"
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