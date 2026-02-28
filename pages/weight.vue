<script setup lang="ts">
import { Chart } from 'vue-chartjs'
import { storeToRefs } from 'pinia'
import { addWeight, removeWeight, stopWeightSubscription, subscribeWeights } from '~/composables/useWeight'
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

  const savedColor = localStorage.getItem('baseColor')
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

  const latest = list[0]
  const prev = list[1] || null
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
  .grid.gap-2.border.border-faint.rounded.p-3
    p.font-semibold Добавить вес
    input.border.border-faint.p-2.rounded.w-full.bg-transparent(
      v-model="selectedDate"
      type="date"
    )
    .flex.items-center.gap-2
      input.border.border-faint.p-2.rounded.w-full.bg-transparent(
        v-model="weightValue"
        type="number"
        inputmode="decimal"
        step="0.1"
        min="1"
        placeholder="Например, 82.5"
        @keyup.enter="submitWeight"
      )
      BaseButton(
        text="Сохранить"
        class="!w-auto whitespace-nowrap"
        :disabled="isSaving"
        @click="submitWeight"
      )

  .grid.gap-3.border.border-faint.rounded.p-3(v-if="entries.length")
    p.font-semibold Период статистики
    .grid.grid-cols-2.gap-2
      button.border.border-faint.rounded.p-2.text-xs.cursor-pointer(
        type="button"
        :class="{ 'bg-accent text-white border-transparent': activePeriod === 'all' }"
        @click="activePeriod = 'all'"
      ) За все время
      button.border.border-faint.rounded.p-2.text-xs.cursor-pointer(
        type="button"
        :class="{ 'bg-accent text-white border-transparent': activePeriod === 'year' }"
        @click="activePeriod = 'year'"
      ) За год
      button.border.border-faint.rounded.p-2.text-xs.cursor-pointer(
        type="button"
        :class="{ 'bg-accent text-white border-transparent': activePeriod === 'month' }"
        @click="activePeriod = 'month'"
      ) За месяц
      button.border.border-faint.rounded.p-2.text-xs.cursor-pointer(
        type="button"
        :class="{ 'bg-accent text-white border-transparent': activePeriod === 'week' }"
        @click="activePeriod = 'week'"
      ) За неделю

  .grid.gap-3.border.border-faint.rounded.p-3(v-if="stats")
    p.font-semibold Статистика
    .grid.grid-cols-2.gap-2.text-sm
      .border.border-faint.rounded.p-2
        p.text-xs.text-gray-500 Последний
        p.font-semibold {{ formatWeight(stats.latest.value) }}
      .border.border-faint.rounded.p-2
        p.text-xs.text-gray-500 Изменение
        p.font-semibold {{ stats.change === null ? '—' : `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1).replace('.', ',')} кг` }}
      .border.border-faint.rounded.p-2
        p.text-xs.text-gray-500 Средний
        p.font-semibold {{ formatWeight(stats.average) }}
      .border.border-faint.rounded.p-2
        p.text-xs.text-gray-500 Диапазон
        p.font-semibold {{ `${formatWeight(stats.min)} - ${formatWeight(stats.max)}` }}

  .border.border-faint.rounded.p-3(v-else-if="entries.length")
    p.text-sm.text-gray-500 За выбранный период нет данных

  .grid.gap-2.border.border-faint.rounded.p-3(v-if="filteredEntries.length")
    p.font-semibold График изменения веса
    .h-52
      Chart(
        type="line"
        :data="chartData"
        :options="chartOptions"
      )

  .grid.gap-2.border.border-faint.rounded.p-3(v-if="entries.length")
    p.font-semibold История
    .flex.items-center.justify-between.border-b.border-faint.py-2(
      v-for="entry in entries"
      :key="entry.id"
    )
      .grid.gap-1
        p {{ formatWeight(entry.value) }}
        p.text-xs.text-gray-500 {{ formatDate(entry.createdAt) }}
      button.text-xs.text-error.cursor-pointer(
        type="button"
        :disabled="deletingId === entry.id"
        @click="onRemoveWeight(entry.id)"
      ) {{ deletingId === entry.id ? 'Удаление...' : 'Удалить' }}

  .border.border-faint.rounded.p-3(v-else)
    p.text-sm.text-gray-500 Пока нет данных о весе
</template>
