<script setup lang="ts">
import { Chart as _Chart } from 'vue-chartjs'
const Chart = _Chart as any
import { storeToRefs } from 'pinia'
import { addWeight, removeWeight, stopWeightSubscription, subscribeWeights } from '~/composables/useWeight'
import { IDB_KEYS } from '~/shared/config/storageKeys'
import { idbStorage } from '~/shared/api/storage/idb'
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

definePageMeta({
  backTo: '/settings'
})

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
)

useHead({
  title: 'Вес',
})

const appStore = useAppStore()
const weightStore = useWeightStore()
const { entries } = storeToRefs(weightStore)
const { notifyError } = useNotifications()

const weightValue = ref<string | number>('')
const selectedDate = ref('')
const isSaving = ref(false)
const deletingId = ref<string | null>(null)
const chartColor = ref('#3b82f6')
const activePeriod = ref<'all' | 'year' | 'month' | 'week'>('all')

appStore.headerTitle = 'Мой вес'

onMounted(() => {
  subscribeWeights()

  const savedColor = idbStorage.getItem(IDB_KEYS.BASE_COLOR)
  if (savedColor) chartColor.value = savedColor
  selectedDate.value = getTodayDate()
})

onUnmounted(() => {
  stopWeightSubscription()
})

const filteredEntries = computed(() => {
  if (activePeriod.value === 'all') return entries.value

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const periodDays: Record<'year' | 'month' | 'week', number> = {
    year: 365,
    month: 30,
    week: 7,
  }
  const threshold = now - (periodDays[activePeriod.value] * dayMs)

  return entries.value.filter((item) => item.createdAt >= threshold)
})

const stats = computed(() => {
  const list = filteredEntries.value
  if (!list.length) return null

  const latest = list[0]!
  const prev = list[1] ?? null
  const sum = list.reduce((acc, item) => acc + item.value, 0)
  const average = sum / list.length
  const min = Math.min(...list.map((item) => item.value))
  const max = Math.max(...list.map((item) => item.value))

  return {
    latest,
    prev,
    average,
    min,
    max,
    change: prev ? latest.value - prev.value : null,
  }
})

function formatWeight(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} кг`
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
  }).format(timestamp)
}

function formatShortDate(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  }).format(timestamp)
}

const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: () => '',
      },
    },
  },
  scales: {
    x: {
      ticks: {
        display: false,
      },
    },
  },
})

const chartData = computed(() => {
  const ordered = [...filteredEntries.value].reverse()

  return {
    labels: ordered.map((entry) => formatShortDate(entry.createdAt)),
    datasets: [
      {
        label: 'Вес',
        data: ordered.map((entry) => entry.value),
        borderColor: chartColor.value,
        backgroundColor: chartColor.value,
        tension: 0.25,
        pointRadius: 4,
      },
    ],
  }
})

function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTimestampFromDate(dateValue: string): number {
  const safeDate = dateValue || getTodayDate()
  const parsed = new Date(`${safeDate}T12:00:00`)
  return parsed.getTime()
}

async function submitWeight() {
  if (isSaving.value) return

  const rawValue = weightValue.value
  const value = typeof rawValue === 'number'
    ? rawValue
    : Number(String(rawValue).replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) {
    notifyError('Введите корректный вес, например 82.5')
    return
  }

  const createdAt = getTimestampFromDate(selectedDate.value)
  if (!Number.isFinite(createdAt)) {
    notifyError('Выберите корректную дату')
    return
  }

  isSaving.value = true
  try {
    await addWeight(value, createdAt)
    weightValue.value = ''
    selectedDate.value = getTodayDate()
  } catch (error) {
    console.error('[weight:submitWeight]', error)
    notifyError('Не удалось сохранить вес. Попробуйте снова.')
  } finally {
    isSaving.value = false
  }
}

async function onRemoveWeight(id: string) {
  if (!id || deletingId.value) return

  const prevEntries = [...entries.value]
  weightStore.setWeightEntries(prevEntries.filter((entry) => entry.id !== id))

  deletingId.value = id
  try {
    await removeWeight(id)
  } catch (error) {
    console.error('[weight:removeWeight]', error)
    weightStore.setWeightEntries(prevEntries)
    notifyError('Не удалось удалить запись. Попробуйте снова.')
  } finally {
    deletingId.value = null
  }
}
</script>

<template lang="pug">
.grid.gap-4

  //- Add weight form
  .border.border-faint.rounded-xl.p-4.grid.gap-3
    p.font-semibold.text-sm.uppercase.tracking-wide.text-gray-500 Добавить запись
    .grid.grid-cols-2.gap-2
      .grid.gap-1
        label.text-xs.text-gray-500(for="weight-date") Дата
        input#weight-date.border.border-faint.p-2.rounded-lg.w-full.bg-transparent.text-sm(
          v-model="selectedDate"
          type="date"
        )
      .grid.gap-1
        label.text-xs.text-gray-500(for="weight-value") Вес, кг
        input#weight-value.border.border-faint.p-2.rounded-lg.w-full.bg-transparent.text-sm(
          v-model="weightValue"
          type="number"
          inputmode="decimal"
          step="0.1"
          min="1"
          placeholder="82.5"
          @keyup.enter="submitWeight"
        )
    UiButton(
      text="Сохранить"
      :disabled="isSaving"
      @click="submitWeight"
    )

  //- Period tabs
  UiPeriodTabs(v-if="entries.length" v-model="activePeriod")

  //- Stats
  template(v-if="stats")
    .grid.grid-cols-2.gap-2
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Последний
        p.text-xl.font-bold.tracking-tight {{ formatWeight(stats.latest.value) }}
        p.text-xs.text-gray-500 {{ formatDate(stats.latest.createdAt) }}
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Изменение
        p.text-xl.font-bold.tracking-tight(
          :class="stats.change === null ? '' : stats.change > 0 ? 'text-error' : stats.change < 0 ? 'text-green-500' : ''"
        ) {{ stats.change === null ? '—' : `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1).replace('.', ',')} кг` }}
        p.text-xs.text-gray-500 от предыдущего
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Среднее
        p.text-xl.font-bold.tracking-tight {{ formatWeight(stats.average) }}
        p.text-xs.text-gray-500 за период
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Диапазон
        p.text-base.font-bold.tracking-tight {{ formatWeight(stats.min) }}
        p.text-xs.text-gray-500 — {{ formatWeight(stats.max) }}

  .border.border-faint.rounded-xl.p-4(v-else-if="entries.length")
    p.text-sm.text-gray-500.text-center За выбранный период нет данных

  //- Chart
  .border.border-faint.rounded-xl.p-4.grid.gap-3(v-if="filteredEntries.length")
    p.font-semibold.text-sm График
    .h-48
      Chart(
        type="line"
        :data="chartData"
        :options="chartOptions"
      )

  //- History
  .border.border-faint.rounded-xl.p-4.grid.gap-3(v-if="entries.length")
    p.font-semibold.text-sm История
    .grid.gap-0
      .flex.items-center.justify-between(
        v-for="(entry, index) in entries"
        :key="entry.id"
        class="py-2.5"
        :class="index < entries.length - 1 ? 'border-b border-faint' : ''"
      )
        .flex.items-center.gap-3
          .w-2.h-2.rounded-full.bg-accent.shrink-0
          .grid.gap-0
            p.font-semibold.text-sm {{ formatWeight(entry.value) }}
            p.text-xs.text-gray-500 {{ formatDate(entry.createdAt) }}
        button.text-xs.text-error.cursor-pointer.py-1.px-2.rounded-lg.border.border-transparent.transition-all(
          type="button"
          :disabled="deletingId === entry.id"
          class="hover:border-error/30"
          :class="{ 'opacity-50 pointer-events-none': deletingId === entry.id }"
          @click="onRemoveWeight(entry.id)"
        ) {{ deletingId === entry.id ? '...' : 'Удалить' }}

  //- Empty state
  UiEmptyState(v-else icon="⚖️" title="Пока нет данных о весе" hint="Добавьте первую запись выше")
</template>
