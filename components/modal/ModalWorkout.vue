<script setup lang="ts">
import type { TypeWorkoutCreate } from '~/composables/types'

const activeExercise = useActiveExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const isShowModalWorkout = useShowModalWorkout()
const rubbersColor = useRubbersColor()

function formatDate(date:number | string) {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date)).slice(0, -3)
}

const nowDate = new Date().getTime()
const error = ref(false)
const approaches = ref(5)
const removeConfirm = ref(false)

const eases = computed(() => activeExercise.value?.ease || [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber])

const workout = ref<TypeWorkoutCreate>({
  date: nowDate,
  interval: '2.5',
  ease: activeExercise.value?.ease ? activeExercise.value.ease[0] : EnumEase.noWeight,
  rubber: '',
  approach: [],
  weight: [],
  desc: '',
  exercisesId: activeExercise.value?.id,
  res: 0
})

function reset () {
  isShowModalWorkout.value = false
  selectUpdateWorkout.value = null
  error.value = false
  workout.value = {
    exercisesId: activeExercise.value?.id,
    date: nowDate,
    interval: '2.5',
    ease: activeExercise.value?.ease ? activeExercise.value.ease[0] : EnumEase.noWeight,
    rubber: '',
    approach: [],
    weight: [],
    desc: '',
    res: 0
  }
}

watchEffect(() => {
  if (selectUpdateWorkout.value) {
    approaches.value = selectUpdateWorkout.value.approach.length
    workout.value = {
      exercisesId: selectUpdateWorkout.value.exercisesId,
      date: selectUpdateWorkout.value.date,
      interval: selectUpdateWorkout.value.interval,
      approach: selectUpdateWorkout.value.approach,
      ease: selectUpdateWorkout.value.ease,
      rubber: selectUpdateWorkout.value.rubber || '',
      weight: selectUpdateWorkout.value.weight || [],
      desc: selectUpdateWorkout.value.desc || '',
      res: selectUpdateWorkout.value.res,
    }
  } else {
    reset()
  }
})

async function add() {
  if (workout.value.approach) {
    workout.value.res = workout.value.approach.reduce((sum:number, current:number):number => +sum + +current)
    await createWorkout(workout.value)
    reset()
  } else {
    error.value = true
  }
}

async function updateSelectWorkout() {
  if (workout.value.approach.length > 0) {
    console.log(workout.value.approach);
    
    workout.value.res = workout.value.approach.reduce((sum:number, current:number):number => +sum + +current)
    await updateWorkout(selectUpdateWorkout.value!.id, workout.value)
    reset()
  } else {
    error.value = true
  }
}

async function removeSelectWorkout() {
  removeWorkout(selectUpdateWorkout.value!.id)
  removeConfirm.value = false
  reset()
}
</script>

<template lang="pug">
div
  Modal(
    :isShow="isShowModalWorkout"
    @hiden="reset"
  )
    template(#content)
      label.date-label.-mx-4.-mt-6
        span {{ formatDate(workout.date) }}
        BaseInput(
          v-model="workout.date"
          type="date"
        )
      BaseInputRange(v-model="workout.interval")
      BaseInputRange(v-model="approaches" max="10" step="1" view="approaches")

      TabsWrap
        TabsItem(
          v-for="ease in eases"
          :key="ease"
          :active="workout.ease === ease"
          @click="workout.ease = ease"
          :title="ease"
        )

      .rubbers(v-if="workout.ease === EnumEase.rubber")
        .text-white.text-xs.text-center.flex-center.cursor-pointer(
          v-for="item in rubbersColor"
          :style="`background: ${item.color}`"
          :class="{_active : workout.rubber === item.name}"
          @click="workout.rubber = item.name"
        ) {{ item.name.replace(' резина', '') }}

      .approaches
        .approach(
          v-for="index in +approaches"
          :key="index"
        )
          BaseInput(
            v-model="workout.approach[index-1]"
            type="text"
            :error="error"
            inputmode="numeric"
            :placeholder="`Подход ${index}`"
          )

          BaseInput(
            v-if="workout.ease === EnumEase.weight"
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
    template(#bottom)
      BaseButton(
        v-if="!selectUpdateWorkout"
        @click="add"
        text="Добавить"
      )
      template(v-else)
        BaseButton(
          red
          @click="removeConfirm = true"
          text="Удалить"
        )
        BaseButton(
          @click="updateSelectWorkout"
          text="Сохранить"
        )
  
  ModalRemoveConfirm(
    text="Точно хочешь удалить данную запись?"
    :isShow="removeConfirm"
    @hiden="removeConfirm = false"
    @cancelRemove="removeConfirm = false"
    @remove="removeSelectWorkout"
  )
</template>

<style lang="stylus" scoped>
.date-label
  padding: 16px 0
  text-align center
  font-size 18px
  background #5182dc
  color: #fafafa
  border-bottom 1px solid rgba(0,0,0,.4)

  input
    position absolute
    visibility hidden
    z-index -1

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