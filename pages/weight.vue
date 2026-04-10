<script setup lang="ts">
import { Chart as _Chart } from 'vue-chartjs'
const Chart = _Chart as any
import { storeToRefs } from 'pinia'
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

<template>
<div class="grid gap-4">

  <!-- Add weight form -->
  <div class="border border-faint rounded-xl p-4 grid gap-3">
    <p class="font-semibold text-sm uppercase tracking-wide text-gray-500">Добавить запись</p>
    <div class="grid grid-cols-2 gap-2">
      <div class="grid gap-1">
        <label class="text-xs text-gray-500" for="weight-date">Дата</label>
        <input
          id="weight-date"
          v-model="selectedDate"
          type="date"
          class="border border-faint p-2 rounded-lg w-full bg-transparent text-sm"
        />
      </div>
      <div class="grid gap-1">
        <label class="text-xs text-gray-500" for="weight-value">Вес, кг</label>
        <input
          id="weight-value"
          v-model="weightValue"
          type="number"
          inputmode="decimal"
          step="0.1"
          min="1"
          placeholder="82.5"
          class="border border-faint p-2 rounded-lg w-full bg-transparent text-sm"
          @keyup.enter="submitWeight"
        />
      </div>
    </div>
    <UiButton text="Сохранить" :disabled="isSaving" @click="submitWeight" />
  </div>

  <!-- Period tabs -->
  <UiPeriodTabs v-if="entries.length" v-model="activePeriod" />

  <!-- Stats -->
  <template v-if="stats">
    <div class="grid grid-cols-2 gap-2">
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">Последний</p>
        <p class="text-xl font-bold tracking-tight">{{ formatWeight(stats.latest.value) }}</p>
        <p class="text-xs text-gray-500">{{ formatDate(stats.latest.createdAt) }}</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">Изменение</p>
        <p
          class="text-xl font-bold tracking-tight"
          :class="stats.change === null ? '' : stats.change > 0 ? 'text-error' : stats.change < 0 ? 'text-green-500' : ''"
        >{{ stats.change === null ? '—' : `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1).replace('.', ',')} кг` }}</p>
        <p class="text-xs text-gray-500">от предыдущего</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">Среднее</p>
        <p class="text-xl font-bold tracking-tight">{{ formatWeight(stats.average) }}</p>
        <p class="text-xs text-gray-500">за период</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">Диапазон</p>
        <p class="text-base font-bold tracking-tight">{{ formatWeight(stats.min) }}</p>
        <p class="text-xs text-gray-500">— {{ formatWeight(stats.max) }}</p>
      </div>
    </div>
  </template>

  <div class="border border-faint rounded-xl p-4" v-else-if="entries.length">
    <p class="text-sm text-gray-500 text-center">За выбранный период нет данных</p>
  </div>

  <!-- Chart -->
  <div class="border border-faint rounded-xl p-4 grid gap-3" v-if="filteredEntries.length">
    <p class="font-semibold text-sm">График</p>
    <div class="h-48">
      <Chart type="line" :data="chartData" :options="chartOptions" />
    </div>
  </div>

  <!-- History -->
  <div class="border border-faint rounded-xl p-4 grid gap-3" v-if="entries.length">
    <p class="font-semibold text-sm">История</p>
    <div class="grid gap-0">
      <div
        v-for="(entry, index) in entries"
        :key="entry.id"
        class="flex items-center justify-between py-2.5"
        :class="index < entries.length - 1 ? 'border-b border-faint' : ''"
      >
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-accent shrink-0"></div>
          <div class="grid gap-0">
            <p class="font-semibold text-sm">{{ formatWeight(entry.value) }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(entry.createdAt) }}</p>
          </div>
        </div>
        <button
          type="button"
          class="text-xs text-error cursor-pointer py-1 px-2 rounded-lg border border-transparent transition-all hover:border-error/30"
          :disabled="deletingId === entry.id"
          :class="{ 'opacity-50 pointer-events-none': deletingId === entry.id }"
          @click="onRemoveWeight(entry.id)"
        >{{ deletingId === entry.id ? '...' : 'Удалить' }}</button>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <UiEmptyState v-else icon="⚖️" title="Пока нет данных о весе" hint="Добавьте первую запись выше" />
</div>
</template>
