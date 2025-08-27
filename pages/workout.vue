<script setup lang="ts">
import { updateData, removeData } from '~/composables/firebaseInit'
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
const timer = ref('00:00')
const startInterval = ref(false)
const approachesTimes = ref([])
let interval:any
let seconds:number = 0

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
  res: 0,
  resWeigth: 0
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
    res: 0,
    resWeigth: 0
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

    if (workout.value.weight) {
      workout.value.resWeigth = workout.value.weight.reduce((acc:number, item:number, index:number):number => acc + (+item * +workout.value.approach[index]), 0)
    }

    createData(`workout/${workout.value.exercisesId}`, workout.value)

    router.push('/exercise-item')
    reset()
    localStorage.removeItem('newWorkout')
    localStorage.removeItem('approaches')
  } else {
    error.value = true
  }
}

function updateSelectWorkout() {
  if (workout.value.approach.length > 0) {
    workout.value.res = workout.value.approach.reduce((sum:number, current:number):number => +sum + +current)
    updateData(`workout/${workout.value.exercisesId}/${selectUpdateWorkout.value!.id}`, workout.value)
    reset()
    router.push('/exercise-item')
  } else {
    error.value = true
  }
}

function removeSelectWorkout() {
  removeData(`workout/${selectUpdateWorkout.value!.exercisesId}/${selectUpdateWorkout.value!.id}`)
  removeConfirm.value = false
  reset()
  router.push('/exercise-item')
}

function timerApproach(time:number){
  if (time > 0) {
    const s = +workout.value.interval * time * 60;
    const minutes = String(Math.floor(s / 60)).length == 1 ? '0' + Math.floor(s / 60) : Math.floor(s / 60)
    const seconds = String(s % 60).length == 1 ? '0' + s % 60 : s % 60
    
    approachesTimes.value.push(`${minutes}:${seconds}`)
    return `${minutes}:${seconds}`
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
    res: 0,
    resWeigth: newWorkout.resWeidth || 0
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

function addWeight(idx, e) {
  if (e.data === ',') workout.value.weight[idx] = workout.value.weight[idx].replace(',', '.')
  saveNewWorkout()
}

function changeInterval() {
  approachesTimes.value = []
  saveNewWorkout()
}

const sound = new Audio("https://cdn.freesound.org/previews/97/97878_321967-lq.mp3");

function notification() {
  sound.play()
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

function fnTimer() {
  if (!startInterval.value) {
    startInterval.value = true
    interval = setInterval(() => {
      let mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
      let secs = (seconds % 60).toString().padStart(2, '0')
      timer.value = `${mins}:${secs}`

      if (approachesTimes.value.at(-1) === timer.value) {
        clearInterval(interval)
        startInterval.value = false
      }
      
      let notificationMins = Math.floor(((seconds+3) % 3600) / 60).toString().padStart(2, '0')
      let notificationSecs = ((seconds+3) % 60).toString().padStart(2, '0')
      let notificationTimer = `${notificationMins}:${notificationSecs}`
      if (approachesTimes.value.includes(notificationTimer)) notification()
      seconds++
      document.body.dispatchEvent(new Event('touchstart'));
    }, 1000)
  } else {
    clearInterval(interval)
    startInterval.value = false
  }
}

function resetInterval() {
  seconds = 0
  clearInterval(interval)
  startInterval.value = false
  timer.value = '00:00'
}
</script>

<template lang="pug">
.flex.flex-col.gap-3.min-h-full
  label.date-label
    span {{ formatDate(workout.date) }}
    input(
      v-model="workout.date"
      type="date"
    )
  BaseInputRange(v-model="workout.interval" @change="changeInterval")
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

  .flex-center.py-2
    .rounded-full.flex-center.size-12(
      @click="fnTimer()"
      :class="startInterval ? 'bg-error' : 'bg-green'"
    )
      <svg v-if="!startInterval" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#fff" d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#fff" d="M14 18V6h3.5v12zm-7.5 0V6H10v12z"/></svg>
    .text-4xl.w-48.text-center {{ timer }}
    .rounded-full.flex-center.size-12.bg-accent(@click="resetInterval()")
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6 13c0-1.65.67-3.15 1.76-4.24L6.34 7.34A8 8 0 0 0 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91m14 0c0-4.42-3.58-8-8-8c-.06 0-.12.01-.18.01l1.09-1.09L11.5 2.5L8 6l3.5 3.5l1.41-1.41l-1.08-1.08c.06 0 .12-.01.17-.01c3.31 0 6 2.69 6 6c0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93"/></svg>

  .approaches
    .approach(
      v-for="index in +approaches"
      :key="index"
    )
      //- template(v-if="index === 1 || workout.approach[index-2]")
      .text-sm {{ timerApproach(index-1) }}
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
        inputmode="decimal"
        :placeholder="`Вес ${index}`"
        @input="(e) => addWeight(index-1, e)"
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
