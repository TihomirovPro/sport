<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { EnumEase } from '~/composables/types'
import { formatWorkoutDate, normalizeWorkoutDate, toDateInputValue } from '~/composables/useWorkoutHelpers'

definePageMeta({
  backTo: '/exercise-item',
  clearSelectUpdateWorkout: true,
  removeStorageKeys: ['pp-new-workout-v1', 'pp-approaches-v1']
})

const router = useRouter()
const exerciseStore = useExerciseStore()
const workoutStore = useWorkoutStore()
const catalogStore = useCatalogStore()
const appStore = useAppStore()
const userStore = useUserStore()
const { activeExercise } = storeToRefs(exerciseStore)
const { workouts, filteredWorkouts, selectUpdateWorkout } = storeToRefs(workoutStore)
const { rubbersColor } = storeToRefs(catalogStore)
const { headerTitle } = storeToRefs(appStore)
const { activeUser } = storeToRefs(userStore)
const { notifyError } = useNotifications()
const { restoreActiveExerciseFromStorage } = useActiveExercise()
const removeConfirm = ref(false)
const isSaving = ref(false)

const isComplex = computed(() => Boolean(activeExercise.value?.isComplex))
const eases = computed(() => activeExercise.value?.ease || [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber])

const {
  error,
  complexTime,
  approaches,
  workout,
  reset,
  updateWeight,
  updateRpe,
  addComplexExercise,
  removeComplexExercise,
  validateWorkout,
  clearDraftStorage
} = useWorkoutForm({
  activeExercise,
  selectUpdateWorkout,
  isComplex,
  resolveFormDefaults: workoutStore.resolveFormDefaults,
  notifyError
})

const complexExercises = computed({
  get: () => workout.value.complexExercises || [],
  set: (value) => { workout.value.complexExercises = value }
})

const {
  canShowProgression,
  isWeightMode,
  activeSuggestionSummaryText,
  activeSuggestionConfidenceLine,
  recommendationWeightsLine,
  recommendationRepsLine,
  applyProgressionSuggestion
} = useWorkoutProgressionUI({
  activeUser,
  activeExercise,
  selectUpdateWorkout,
  workouts,
  workout,
  approaches,
  isComplex,
  notifyError
})

const { add, updateSelectWorkout, removeSelectWorkout } = useWorkoutPersistence({
  workout,
  selectUpdateWorkout,
  workouts,
  filteredWorkouts,
  isSaving,
  validateWorkout,
  reset,
  notifyError,
  router,
  removeConfirm,
  clearDraftStorage
})

const formatDate = formatWorkoutDate
const workoutDateInputRef = ref<HTMLInputElement | null>(null)
const workoutDateModel = computed<string>({
  get() {
    return toDateInputValue(workout.value.date)
  },
  set(value) {
    workout.value.date = normalizeWorkoutDate(value)
  }
})

function openDatePicker(event?: MouseEvent) {
  const input = workoutDateInputRef.value
  if (!input) return

  // showPicker поддерживается не везде и может требовать жест пользователя.
  if (event?.isTrusted && typeof input.showPicker === 'function') {
    try {
      input.showPicker()
      return
    } catch {
      // fallback ниже
    }
  }

  input.focus()
  input.click()
}

function timerApproach(time: number) {
  if (time > 0) {
    const s = +workout.value.interval * time * 60
    const minutes = String(Math.floor(s / 60)).length === 1 ? `0${Math.floor(s / 60)}` : Math.floor(s / 60)
    const seconds = String(s % 60).length === 1 ? `0${s % 60}` : s % 60

    return `${minutes}:${seconds}`
  }

  return '00:00'
}

watchEffect(() => {
  headerTitle.value = selectUpdateWorkout.value ? 'Изменить тренировку' : 'Добавить тренировку'
})

useHead(() => ({
  title: headerTitle.value
}))

onMounted(() => {
  restoreActiveExerciseFromStorage(activeExercise, {
    fallbackEase: [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber]
  })

  if (activeExercise.value?.id) {
    getWorkouts(activeExercise.value.id)
    workout.value.exercisesId = activeExercise.value.id
  } else {
    notifyError('Нет данных упражнения в оффлайн-кэше. Сначала откройте его онлайн.')
    void router.push('/')
  }
})

onUnmounted(() => {
  stopWorkoutsSubscription()
})
</script>

<template lang="pug">
.flex.flex-col.gap-3.min-h-full
  label.grid.gap-1.py-3.text-center.rounded-xl.border-2.cursor-pointer(
    class="min-h-[52px] bg-[rgba(var(--colorAccent),0.3)] border-[rgb(var(--colorAccent))]"
    @click="openDatePicker"
  )
    input.w-px.h-px.absolute.-z-10(
      ref="workoutDateInputRef"
      v-model="workoutDateModel"
      type="date"
    )
    span {{ formatDate(workout.date) }}
  template(v-if="!isComplex")
    BaseInputRange(v-model="workout.interval")
    BaseInputRange(v-model="approaches" max="10" step="1" view="approaches")
  template(v-else)
    BaseInput(
      v-model="complexTime"
      type="text"
      :error="error"
      placeholder="Время выполнения"
    )
    .grid.gap-2
      .text-sm.opacity-70 Упражнения в этой тренировке
      .flex.items-center.gap-2(
        v-for="(item, idx) in complexExercises"
        :key="`complex-exercise-${idx}`"
      )
        BaseInput(
          v-model="complexExercises[idx]"
          type="text"
          placeholder="Упражнение"
        )
        button.text-sm.text-error.px-2(
          type="button"
          @click="removeComplexExercise(idx)"
        ) удалить
      BaseButton(
        text="Добавить упражнение"
        @click="addComplexExercise"
      )

  TabsEases(
    v-if="!isComplex && eases.length > 1"
    :eases="eases"
    :selected="workout.ease"
    @selectEase="e => workout.ease = e"
  )

  .grid.grid-cols-4.gap-3(v-if="!isComplex && workout.ease === EnumEase.rubber")
    .text-white.text-xs.text-center.flex-center.cursor-pointer.rounded.h-10(
      v-for="item in rubbersColor"
      :style="`background: ${item.color}`"
      :class="{ 'border-2 border-white outline outline-2 outline-[#5182dc]': workout.rubber === item.name }"
      @click="workout.rubber = item.name"
    ) {{ item.name.replace(' резина', '') }}

  .grid.gap-3.border.border-faint.rounded-xl.p-3(v-if="canShowProgression")
    p.text-sm.leading-relaxed.font-medium.opacity-95 {{ activeSuggestionSummaryText }}
    p.text-xs.opacity-70 {{ activeSuggestionConfidenceLine }}

    .grid.grid-cols-2.gap-3
      .border.border-faint.rounded-lg.px-3.py-2.grid.gap-1(
        class="border-[rgba(var(--colorIcon),0.16)] bg-[rgba(var(--colorIcon),0.06)]"
      )
        span.opacity-70(class="text-[11px]") Рекомендуемые повторы
        span.font-semibold(class="text-[13px]") {{ recommendationRepsLine }}
  
      .border.border-faint.rounded-lg.px-3.py-2.grid.gap-1(
        v-if="isWeightMode"
        class="border-[rgba(var(--colorIcon),0.16)] bg-[rgba(var(--colorIcon),0.06)]"
      )
        span.opacity-70(class="text-[11px]") Рекомендуемые веса
        span.font-semibold(class="text-[13px]") {{ recommendationWeightsLine }}

    BaseButton(
      text="Применить рекомендацию"
      @click="applyProgressionSuggestion"
    )

  .approaches(v-if="!isComplex")
    .flex.items-center.gap-3.mb-3(
      v-for="index in +approaches"
      :key="index"
    )
      .text-sm {{ timerApproach(index-1) }}
      BaseInput(
        v-model="workout.approach[index-1]"
        type="text"
        :error="error"
        inputmode="numeric"
        :placeholder="`Подход ${index}`"
      )

      BaseInput(
        v-if="workout.ease === EnumEase.weight"
        :model-value="Array.isArray(workout.weight) ? workout.weight[index-1] : ''"
        @update:model-value="(value) => updateWeight(index - 1, value)"
        type="text"
        inputmode="decimal"
        :placeholder="`Вес ${index}`"
      )  

  BaseInput(
    v-if="!isComplex"
    :model-value="workout.rpe ?? ''"
    @update:model-value="updateRpe"
    type="text"
    inputmode="decimal"
    placeholder="RPE (1-10)"
  )
  p.text-xs.opacity-70(v-if="!isComplex") RPE оценивается по последнему рабочему подходу.

  BaseInput(
    v-model="workout.desc"
    type="textarea"
    placeholder="Заметка"
  )

  .grid.grid-flow-col.place-items-center.gap-5.mt-auto
    BaseButton(
      v-if="!selectUpdateWorkout"
      :disabled="isSaving"
      @click="add"
      :text="isSaving ? 'Сохранение...' : 'Добавить'"
    )
    template(v-else)
      BaseButton(
        red
        :disabled="isSaving"
        @click="removeConfirm = true"
        text="Удалить"
      )
      BaseButton(
        :disabled="isSaving"
        @click="updateSelectWorkout"
        :text="isSaving ? 'Сохранение...' : 'Сохранить'"
      )
  
  ModalRemoveConfirm(
    text="Точно хочешь удалить данную запись?"
    :isShow="removeConfirm"
    @hiden="removeConfirm = false"
    @cancelRemove="removeConfirm = false"
    @remove="removeSelectWorkout"
  )
</template>
