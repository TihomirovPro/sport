<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Chart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController
} from 'chart.js'
import { IDB_KEYS } from '~/shared/config/storageKeys'
import { idbStorage } from '~/shared/api/storage/idb'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Title, Tooltip, Legend)

definePageMeta({
  backTo: '/'
})

const route = useRoute()
const router = useRouter()
const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { filteredWorkouts, workouts, workoutsLoaded } = storeToRefs(workoutStore)
const { allExercises } = storeToRefs(exerciseStore)
const { notifyError } = useNotifications()

const exerciseId = computed(() => String(route.params.id))
const exercise = computed(() => allExercises.value.find(e => e.id === exerciseId.value) || null)
const isComplex = computed(() => Boolean(exercise.value?.isComplex))

watch(exercise, (ex) => {
  if (ex) appStore.headerTitle = ex.name
}, { immediate: true })

useHead(() => ({ title: exercise.value?.name }))

const chartColor = ref('#3b82f6')

onMounted(() => {
  if (!exerciseId.value) {
    notifyError('Упражнение не найдено')
    void router.push('/')
    return
  }
  getWorkouts(exerciseId.value)
  const savedColor = idbStorage.getItem(IDB_KEYS.BASE_COLOR)
  if (savedColor) chartColor.value = savedColor
})

onUnmounted(() => {
  stopWorkoutsSubscription()
})

// Complex chart & stats
const complexWorkoutsChronological = computed(() =>
  [...workouts.value].filter(w => w.res > 0).sort((a, b) => a.date - b.date)
)

function formatComplexTime(seconds: number): string {
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

function formatShortDate(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(timestamp)
}

const complexStats = computed(() => {
  const list = workouts.value.filter(w => w.res > 0)
  if (!list.length) return null
  const sorted = [...list].sort((a, b) => a.date - b.date)
  const last = sorted[sorted.length - 1]
  if (!last) return null
  let best = list[0]
  if (!best) return null
  for (const w of list) {
    if (w.res < best.res) best = w
  }
  return {
    lastTime: formatComplexTime(last.res),
    bestTime: formatComplexTime(best.res),
    isBestLast: best.id === last.id,
    count: list.length
  }
})

const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: () => '',
        label: (ctx: { parsed: { y: number } }) => formatComplexTime(ctx.parsed.y)
      }
    }
  },
  scales: {
    x: { ticks: { display: false } },
    y: {
      ticks: {
        callback: (value: number | string) => formatComplexTime(Number(value))
      }
    }
  }
})

const chartData = computed(() => ({
  labels: complexWorkoutsChronological.value.map(w => formatShortDate(w.date)),
  datasets: [{
    label: 'Время',
    data: complexWorkoutsChronological.value.map(w => w.res),
    borderColor: chartColor.value,
    backgroundColor: chartColor.value,
    tension: 0.25,
    pointRadius: 4
  }]
}))
</script>

<template>
<div>
  <p v-if="isComplex && exercise?.complexDesc" class="text-sm opacity-60 px-1 pb-3">{{ exercise.complexDesc }}</p>

  <Filters v-if="!isComplex" />

  <template v-if="isComplex && complexStats">
    <div class="grid grid-cols-3 gap-2 pb-4">
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs opacity-50">Лучшее</p>
        <p class="text-base font-bold tracking-tight">{{ complexStats.bestTime }}</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs opacity-50">Последнее</p>
        <p class="text-base font-bold tracking-tight" :class="complexStats.isBestLast ? 'text-green-500' : ''">{{ complexStats.lastTime }}</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs opacity-50">Сессий</p>
        <p class="text-base font-bold tracking-tight">{{ complexStats.count }}</p>
      </div>
    </div>
    <div v-if="complexWorkoutsChronological.length >= 2" class="border border-faint rounded-xl p-4 grid gap-3 mb-4">
      <p class="font-semibold text-sm">График</p>
      <div class="h-40">
        <Chart type="line" :data="chartData" :options="(chartOptions as any)" />
      </div>
    </div>
  </template>

  <div class="grid gap-4" v-if="filteredWorkouts.length">
    <template v-for="item in filteredWorkouts" :key="item.id">
      <Workout
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :isComplex="isComplex"
        :ease="item.ease"
        :rpe="item.rpe"
        :rubber="item.rubber"
        :complexExercises="item.complexExercises"
        :rounds="item.rounds"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
        :resWeigth="item.resWeigth"
      />
    </template>
  </div>
  <div
    class="grid gap-3 p-4 rounded-xl border border-faint text-center mt-4 bg-faint/20"
    v-else-if="workoutsLoaded"
  >
    <p class="text-sm opacity-75">У вас пока нет тренировок</p>
    <p class="text-xs opacity-60">Нажмите на плюс в правом верхнем углу или добавьте первую тренировку кнопкой ниже</p>
    <UiButton
      text="Добавить тренировку"
      @click="router.push(`/exercise/${exerciseId}/workout`)"
    />
  </div>
</div>
</template>
