<script setup lang="ts">
import type { TypeWorkoutCreate } from '~/composables/types'
import { EnumEase } from '~/composables/types'

const router = useRouter()
const activeExercise = useActiveExercise()
const selectUpdateWorkout = useSelectUpdateWorkout()
const rubbersColor = useRubbersColor()
const headerTitle = useHeaderTitle()
headerTitle.value = 'Добавить тренировку'

useHead({
  title: headerTitle.value
})

if (!activeExercise.value && localStorage.getItem('activeExercise')) {
  activeExercise.value = JSON.parse(localStorage.getItem('activeExercise')!)    
  getWorkouts(activeExercise.value!.id)
}

function formatDate(date:number | string):string {
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
    headerTitle.value = 'Изменить тренировку'
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
    router.push('/exercise-item')
    localStorage.removeItem('newWorkout')
    localStorage.removeItem('approaches')
  } else {
    error.value = true
  }
}

async function updateSelectWorkout() {
  if (workout.value.approach.length > 0) {
    workout.value.res = workout.value.approach.reduce((sum:number, current:number):number => +sum + +current)
    await updateWorkout(selectUpdateWorkout.value!.id, workout.value)
    reset()
    router.push('/exercise-item')
  } else {
    error.value = true
  }
}

async function removeSelectWorkout() {
  removeWorkout(selectUpdateWorkout.value!.id, selectUpdateWorkout.value!.exercisesId)
  removeConfirm.value = false
  reset()
  router.push('/exercise-item')
}

function timer(time:number){
  if (time > 0) {
    const s = +workout.value.interval * time * 60;
    const minutes = String(Math.floor(s / 60)).length == 1 ? '0' + Math.floor(s / 60) : Math.floor(s / 60)
    const seconds = String(s % 60).length == 1 ? '0' + s % 60 : s % 60
    return minutes + ':' + seconds
  }

  return '00:00'
}

if (!selectUpdateWorkout.value && localStorage.getItem('newWorkout')) {
  const newWorkout = JSON.parse(localStorage.getItem('newWorkout')!)
  approaches.value = +JSON.parse(localStorage.getItem('approaches')!)

  workout.value = {
    exercisesId: activeExercise.value?.id,
    date: newWorkout.date,
    interval: newWorkout.interval,
    approach: newWorkout.approach,
    ease: newWorkout.ease,
    rubber: newWorkout.rubber || '',
    weight: newWorkout.weight || [],
    desc: newWorkout.desc || '',
    res: 0
  }
}

function saveNewWorkout() {
  if (!selectUpdateWorkout.value) {    
    localStorage.setItem('newWorkout', JSON.stringify(workout.value))
    localStorage.setItem('approaches', JSON.stringify(approaches.value))
  }
}

function selectEase(ease:EnumEase) {
  workout.value.ease = ease
  saveNewWorkout()
}

function selectRubber(name:string) {
  workout.value.rubber = name
  saveNewWorkout()
}
</script>

<template lang="pug">
.flex.flex-col.gap-3.min-h-full
  label.date-label
    span {{ formatDate(workout.date) }}
    BaseInput(
      v-model="workout.date"
      type="date"
    )
  BaseInputRange(v-model="workout.interval" @change="saveNewWorkout")
  BaseInputRange(v-model="approaches" max="10" step="1" view="approaches" @change="saveNewWorkout")

  TabsEases(
    v-if="eases.length > 1"
    :eases="eases"
    :selected="workout.ease"
    @selectEase="(ease) => selectEase(ease)"
  )

  .rubbers(v-if="workout.ease === EnumEase.rubber")
    .text-white.text-xs.text-center.flex-center.cursor-pointer(
      v-for="item in rubbersColor"
      :style="`background: ${item.color}`"
      :class="{_active : workout.rubber === item.name}"
      @click="selectRubber(item.name)"
    ) {{ item.name.replace(' резина', '') }}

  .approaches
    .approach(
      v-for="index in +approaches"
      :key="index"
    )
      //- template(v-if="index === 1 || workout.approach[index-2]")
      .text-sm {{ timer(index-1) }}
      BaseInput(
        v-model="workout.approach[index-1]"
        type="text"
        :error="error"
        inputmode="numeric"
        :placeholder="`Подход ${index}`"
        @input="saveNewWorkout"
      )

      BaseInput(
        v-if="workout.ease === EnumEase.weight"
        v-model="workout.weight[index-1]"
        type="text"
        inputmode="numeric"
        :placeholder="`Вес ${index}`"
        @input="saveNewWorkout"
      )  

  BaseInput(
    v-model="workout.desc"
    type="textarea"
    placeholder="Заметка"
    @input="saveNewWorkout"
  )

  .grid.grid-flow-col.place-items-center.gap-5.mt-auto
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
  overflow hidden
  position relative
  padding: 12px 0
  text-align center
  min-height: 52px
  border-radius 12px
  background-color theme('colors.accent/.3')
  border solid 2px theme('colors.accent')

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