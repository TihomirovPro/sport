
<script setup>
const activeExercise = useActiveExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const isShowModalWorkout = useShowModalWorkout()
const easeus = useEaseus()
const rubbersColor = useRubbersColor()

const nowDate = new Date()
const error = ref(false)
const approaches = ref(5)

const workout = ref({
  date: `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`,
  interval: '2.5',
  ease: easeus.value[0],
  rubber: '',
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
  error.value = false
  workout.value = {
    date: `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`,
    interval: '2.5',
    ease: easeus.value[0],
    rubber: '',
    approach: [],
    weight: [],
    desc: ''
  }
}

watchEffect(() => {
  if (selectUpdateWorkout.value) {
    approaches.value = selectUpdateWorkout.value.approach.length
    workout.value = {
      date: selectUpdateWorkout.value.date,
      interval: selectUpdateWorkout.value.interval,
      approach: selectUpdateWorkout.value.approach,
      ease: selectUpdateWorkout.value.ease,
      rubber: selectUpdateWorkout.value.rubber ? selectUpdateWorkout.value.rubber : '',
      weight: selectUpdateWorkout.value.weight ? selectUpdateWorkout.value.weight : [],
      desc: selectUpdateWorkout.value.desc ? selectUpdateWorkout.value.desc : '',
    }

  } else {
    reset()
  }
})

async function add() {
  if (workout.value.approach) {
    await createWorkout(activeExercise.value, workout.value)
    reset()
  } else {
    error.value = true
  }
}

async function updateSelectWorkout() {
  if (workout.value.approach) {
    await updateWorkout(selectUpdateWorkout.value.id, workout.value)
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
  BaseInputRange(v-model="approaches" max="20" step="1" view="approaches")

  TabsWrap
    TabsItem(
      v-for="ease in easeus"
      :key="ease"
      :active="workout.ease === ease"
      @click="workout.ease = ease"
      :title="ease"
    )

  .rubbers(v-if="workout.ease === 'В резине'")
    .text-white.text-xs.text-center.flex-center(
      v-for="item in rubbersColor"
      :style="`background: ${item.color}`"
      :class="{_active : workout.rubber === item.name}"
      @click="workout.rubber = item.name"
    ) {{ item.name.replace(' резина', '') }}

  .approaches
    .approach(v-for="index in +approaches")
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