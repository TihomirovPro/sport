<script setup lang="ts">
import { Chart as _Chart } from 'vue-chartjs'
import type { Component } from 'vue'
const Chart = _Chart as Component
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
  LineController,
} from 'chart.js'

definePageMeta({
  backTo: '/measure'
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

const appStore = useAppStore()
const measureStore = useMeasureStore()
const { activeType, activeEntries } = storeToRefs(measureStore)
const router = useRouter()
const { notifyError, notifySuccess } = useNotifications()
const { t, getIntlLocale } = useI18n()

const entryValue = ref<string | number>('')
const selectedDate = ref('')
const isSaving = ref(false)
const deletingId = ref<string | null>(null)
const chartColor = ref('#3b82f6')
const activePeriod = ref<'all' | 'year' | 'month' | 'week'>('all')

appStore.headerTitle = activeType.value?.name ?? t('measure.title')
useHead({ title: activeType.value?.name ?? t('measure.title') })

onMounted(() => {
  if (!activeType.value) {
    void router.push('/measure')
    return
  }

  subscribeMeasureEntries(activeType.value.id)

  const savedColor = idbStorage.getItem(IDB_KEYS.BASE_COLOR)
  if (savedColor) chartColor.value = savedColor
  selectedDate.value = getTodayDate()
})

onUnmounted(() => {
  if (activeType.value) {
    stopMeasureEntriesSubscription(activeType.value.id)
  }
})

const filteredEntries = computed(() => {
  if (activePeriod.value === 'all') return activeEntries.value

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const periodDays: Record<'year' | 'month' | 'week', number> = {
    year: 365,
    month: 30,
    week: 7,
  }
  const threshold = now - periodDays[activePeriod.value] * dayMs
  return activeEntries.value.filter(e => e.createdAt >= threshold)
})

const unit = computed(() => activeType.value?.unit ?? '')

const stats = computed(() => {
  const list = filteredEntries.value
  if (!list.length) return null

  const latest = list[0]!
  const prev = list[1] ?? null
  const sum = list.reduce((acc, e) => acc + e.value, 0)
  const average = sum / list.length
  const min = Math.min(...list.map(e => e.value))
  const max = Math.max(...list.map(e => e.value))

  return {
    latest,
    prev,
    average,
    min,
    max,
    change: prev ? latest.value - prev.value : null,
  }
})

function formatValue(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} ${unit.value}`
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat(getIntlLocale(), { dateStyle: 'short' }).format(timestamp)
}

function formatShortDate(timestamp: number): string {
  return new Intl.DateTimeFormat(getIntlLocale(), { day: '2-digit', month: '2-digit' }).format(timestamp)
}

const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { title: () => '' } },
  },
  scales: {
    x: { ticks: { display: false } },
  },
})

const chartData = computed(() => {
  const ordered = [...filteredEntries.value].reverse()
  return {
    labels: ordered.map(e => formatShortDate(e.createdAt)),
    datasets: [
      {
        label: activeType.value?.name ?? '',
        data: ordered.map(e => e.value),
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
  return new Date(`${safeDate}T12:00:00`).getTime()
}

async function submitEntry() {
  if (isSaving.value || !activeType.value) return

  const rawValue = entryValue.value
  const value = typeof rawValue === 'number'
    ? rawValue
    : Number(String(rawValue).replace(',', '.'))

  if (!Number.isFinite(value) || value <= 0) {
    notifyError(t('measure.errorInvalidValue'))
    return
  }

  const createdAt = getTimestampFromDate(selectedDate.value)
  if (!Number.isFinite(createdAt)) {
    notifyError(t('measure.errorInvalidDate'))
    return
  }

  isSaving.value = true
  try {
    await addMeasureEntry(activeType.value.id, value, createdAt)
    notifySuccess(t('measure.saved'))
    entryValue.value = ''
    selectedDate.value = getTodayDate()
  } catch (error) {
    console.error('[measure-item:submitEntry]', error)
    notifyError(t('measure.errorSaveFailed'))
  } finally {
    isSaving.value = false
  }
}

async function onRemoveEntry(id: string) {
  if (!id || deletingId.value || !activeType.value) return

  const typeId = activeType.value.id
  const prev = [...activeEntries.value]
  measureStore.setEntries(typeId, prev.filter(e => e.id !== id))

  deletingId.value = id
  try {
    await removeMeasureEntry(typeId, id)
  } catch (error) {
    console.error('[measure-item:removeEntry]', error)
    measureStore.setEntries(typeId, prev)
    notifyError(t('measure.errorDeleteFailed'))
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
<div class="grid gap-4">

  <!-- Add entry form -->
  <div class="border border-faint rounded-xl p-4 grid gap-3">
    <p class="font-semibold text-sm uppercase tracking-wide text-gray-500">{{ t('measure.addRecord') }}</p>
    <div class="grid grid-cols-2 gap-2">
      <div class="grid gap-1">
        <label class="text-xs text-gray-500" for="entry-date">{{ t('measure.date') }}</label>
        <UiInput
          id="entry-date"
          v-model="selectedDate"
          type="date"
        />
      </div>
      <div class="grid gap-1">
        <label class="text-xs text-gray-500" for="entry-value">{{ t('measure.value', { unit }) }}</label>
        <UiInput
          id="entry-value"
          v-model="entryValue"
          type="number"
          inputmode="decimal"
          step="0.1"
          min="0.1"
          placeholder="38.5"
          @keyup.enter="submitEntry"
        />
      </div>
    </div>
    <UiButton :text="t('common.save')" :disabled="isSaving" @click="submitEntry" />
  </div>

  <!-- Period tabs -->
  <UiPeriodTabs v-if="activeEntries.length" v-model="activePeriod" />

  <!-- Stats -->
  <template v-if="stats">
    <div class="grid grid-cols-2 gap-2">
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">{{ t('measure.statsLast') }}</p>
        <p class="text-xl font-bold tracking-tight">{{ formatValue(stats.latest.value) }}</p>
        <p class="text-xs text-gray-500">{{ formatDate(stats.latest.createdAt) }}</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">{{ t('measure.statsChange') }}</p>
        <p
          class="text-xl font-bold tracking-tight"
          :class="stats.change === null ? '' : stats.change > 0 ? 'text-green-500' : stats.change < 0 ? 'text-error' : ''"
        >{{ stats.change === null ? '—' : `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1).replace('.', ',')} ${unit}` }}</p>
        <p class="text-xs text-gray-500">{{ t('measure.statsFromPrevious') }}</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">{{ t('measure.statsAverage') }}</p>
        <p class="text-xl font-bold tracking-tight">{{ formatValue(stats.average) }}</p>
        <p class="text-xs text-gray-500">{{ t('measure.statsForPeriod') }}</p>
      </div>
      <div class="border border-faint rounded-xl p-3 grid gap-0.5">
        <p class="text-xs text-gray-500">{{ t('measure.statsRange') }}</p>
        <p class="text-base font-bold tracking-tight">{{ formatValue(stats.min) }}</p>
        <p class="text-xs text-gray-500">— {{ formatValue(stats.max) }}</p>
      </div>
    </div>
  </template>

  <div class="border border-faint rounded-xl p-4" v-else-if="activeEntries.length">
    <p class="text-sm text-gray-500 text-center">{{ t('measure.noDataPeriod') }}</p>
  </div>

  <!-- Chart -->
  <div class="border border-faint rounded-xl p-4 grid gap-3" v-if="filteredEntries.length">
    <p class="font-semibold text-sm">{{ t('measure.chart') }}</p>
    <div class="h-48">
      <Chart type="line" :data="chartData" :options="chartOptions" />
    </div>
  </div>

  <!-- History -->
  <div class="border border-faint rounded-xl p-4 grid gap-3" v-if="activeEntries.length">
    <p class="font-semibold text-sm">{{ t('measure.history') }}</p>
    <div class="grid gap-0">
      <div
        v-for="(entry, index) in activeEntries"
        :key="entry.id"
        class="flex items-center justify-between py-2.5"
        :class="index < activeEntries.length - 1 ? 'border-b border-faint' : ''"
      >
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-accent shrink-0"></div>
          <div class="grid gap-0">
            <p class="font-semibold text-sm">{{ formatValue(entry.value) }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(entry.createdAt) }}</p>
          </div>
        </div>
        <button
          type="button"
          class="text-xs text-error cursor-pointer py-1 px-2 rounded-lg border border-transparent transition-all hover:border-error/30"
          :disabled="deletingId === entry.id"
          :class="{ 'opacity-50 pointer-events-none': deletingId === entry.id }"
          @click="onRemoveEntry(entry.id)"
        >{{ deletingId === entry.id ? t('measure.deleting') : t('common.delete') }}</button>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <UiEmptyState v-else icon="📐" :title="t('measure.noRecords')" :hint="t('measure.noRecordsHint')" />
</div>
</template>
