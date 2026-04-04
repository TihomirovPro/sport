<script setup lang="ts">
import { Chart } from 'vue-chartjs'
import { storeToRefs } from 'pinia'
import {
  subscribeMeasureEntries,
  stopMeasureEntriesSubscription,
  addMeasureEntry,
  removeMeasureEntry,
} from '~/composables/useMeasure'
import { IDB_KEYS } from '~/composables/storage/keys'
import { idbStorage } from '~/composables/storage/idb'
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
const { notifyError } = useNotifications()

const entryValue = ref<string | number>('')
const selectedDate = ref('')
const isSaving = ref(false)
const deletingId = ref<string | null>(null)
const chartColor = ref('#3b82f6')
const activePeriod = ref<'all' | 'year' | 'month' | 'week'>('all')

appStore.headerTitle = activeType.value?.name ?? 'Замер'

useHead({
  title: activeType.value?.name ?? 'Замер',
})

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

  const latest = list[0]
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
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short' }).format(timestamp)
}

function formatShortDate(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(timestamp)
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
    notifyError('Введите корректное значение, например 38.5')
    return
  }

  const createdAt = getTimestampFromDate(selectedDate.value)
  if (!Number.isFinite(createdAt)) {
    notifyError('Выберите корректную дату')
    return
  }

  isSaving.value = true
  try {
    await addMeasureEntry(activeType.value.id, value, createdAt)
    entryValue.value = ''
    selectedDate.value = getTodayDate()
  } catch (error) {
    console.error('[measure-item:submitEntry]', error)
    notifyError('Не удалось сохранить. Попробуйте снова.')
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
    notifyError('Не удалось удалить. Попробуйте снова.')
  } finally {
    deletingId.value = null
  }
}
</script>

<template lang="pug">
.grid.gap-4

  //- Add entry form
  .border.border-faint.rounded-xl.p-4.grid.gap-3
    p.font-semibold.text-sm.uppercase.tracking-wide.text-gray-500 Добавить запись
    .grid.grid-cols-2.gap-2
      .grid.gap-1
        label.text-xs.text-gray-500(for="entry-date") Дата
        input#entry-date.border.border-faint.p-2.rounded-lg.w-full.bg-transparent.text-sm(
          v-model="selectedDate"
          type="date"
        )
      .grid.gap-1
        label.text-xs.text-gray-500(for="entry-value") Значение, {{ unit }}
        input#entry-value.border.border-faint.p-2.rounded-lg.w-full.bg-transparent.text-sm(
          v-model="entryValue"
          type="number"
          inputmode="decimal"
          step="0.1"
          min="0.1"
          placeholder="38.5"
          @keyup.enter="submitEntry"
        )
    UiButton(
      text="Сохранить"
      :disabled="isSaving"
      @click="submitEntry"
    )

  //- Period tabs
  UiPeriodTabs(v-if="activeEntries.length" v-model="activePeriod")

  //- Stats
  template(v-if="stats")
    .grid.grid-cols-2.gap-2
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Последний
        p.text-xl.font-bold.tracking-tight {{ formatValue(stats.latest.value) }}
        p.text-xs.text-gray-500 {{ formatDate(stats.latest.createdAt) }}
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Изменение
        p.text-xl.font-bold.tracking-tight(
          :class="stats.change === null ? '' : stats.change > 0 ? 'text-green-500' : stats.change < 0 ? 'text-error' : ''"
        ) {{ stats.change === null ? '—' : `${stats.change > 0 ? '+' : ''}${stats.change.toFixed(1).replace('.', ',')} ${unit}` }}
        p.text-xs.text-gray-500 от предыдущего
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Среднее
        p.text-xl.font-bold.tracking-tight {{ formatValue(stats.average) }}
        p.text-xs.text-gray-500 за период
      .border.border-faint.rounded-xl.p-3.grid(class="gap-0.5")
        p.text-xs.text-gray-500 Диапазон
        p.text-base.font-bold.tracking-tight {{ formatValue(stats.min) }}
        p.text-xs.text-gray-500 — {{ formatValue(stats.max) }}

  .border.border-faint.rounded-xl.p-4(v-else-if="activeEntries.length")
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
  .border.border-faint.rounded-xl.p-4.grid.gap-3(v-if="activeEntries.length")
    p.font-semibold.text-sm История
    .grid.gap-0
      .flex.items-center.justify-between(
        v-for="(entry, index) in activeEntries"
        :key="entry.id"
        class="py-2.5"
        :class="index < activeEntries.length - 1 ? 'border-b border-faint' : ''"
      )
        .flex.items-center.gap-3
          .w-2.h-2.rounded-full.bg-accent.shrink-0
          .grid.gap-0
            p.font-semibold.text-sm {{ formatValue(entry.value) }}
            p.text-xs.text-gray-500 {{ formatDate(entry.createdAt) }}
        button.text-xs.text-error.cursor-pointer.py-1.px-2.rounded-lg.border.border-transparent.transition-all(
          type="button"
          :disabled="deletingId === entry.id"
          class="hover:border-error/30"
          :class="{ 'opacity-50 pointer-events-none': deletingId === entry.id }"
          @click="onRemoveEntry(entry.id)"
        ) {{ deletingId === entry.id ? '...' : 'Удалить' }}

  //- Empty state
  UiEmptyState(v-else icon="📐" title="Пока нет записей" hint="Добавьте первую запись выше")
</template>
