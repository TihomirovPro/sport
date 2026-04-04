<script setup lang="ts">
import { Chart } from 'vue-chartjs'
import { storeToRefs } from 'pinia'
import type { Filter } from '~/composables/types'
import { EnumEase } from '~/composables/types'
import { IDB_KEYS } from '~/shared/config/storageKeys'
import { idbStorage } from '~/shared/api/storage/idb'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
)

const appStore = useAppStore()
const workoutStore = useWorkoutStore()
const { hideFilterTitles } = storeToRefs(appStore)
const { workouts, filteredWorkouts, activeFilters } = storeToRefs(workoutStore)
const chartKey = ref(0)

const forceChartUpdate = () => {
  chartKey.value++
}

const optionsLines = reactive({
  plugins: {
    legend: {
      display: !hideFilterTitles.value,
    },
  },
  scales: {
    x: {
      ticks: {
        display: false
      }
    },
    y: {
      display: true,
      position: 'left',
    },
    y1: {
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false, 
      },
    }
  }
})

const allFilterElements = computed(() => {
  const easeOrder: Record<EnumEase, number> = {
    [EnumEase.noWeight]: 0,
    [EnumEase.weight]: 1,
    [EnumEase.rubber]: 2,
  }

  const obj = { eases: new Set<EnumEase>(), intervals: new Set<number>(), approaches: new Set<number>() };

  workouts.value.forEach(item => {
    obj.eases.add(item.ease);
    obj.intervals.add(+item.interval);
    obj.approaches.add(item.approach.length);
  });

  return {
    eases: [...obj.eases].sort((a, b) => easeOrder[a] - easeOrder[b]),
    intervals: [...obj.intervals].sort((a, b) => a - b),
    approaches: [...obj.approaches].sort((a, b) => a - b)
  };
});

function isWorkoutMatchedByFilters(
  itemEase: EnumEase,
  itemInterval: number,
  itemApproach: number,
  options: { useEase?: boolean; useInterval?: boolean; useApproach?: boolean } = {}
): boolean {
  const useEase = options.useEase ?? true
  const useInterval = options.useInterval ?? true
  const useApproach = options.useApproach ?? true

  return (
    (!useInterval || !filter.value.interval || filter.value.interval === itemInterval) &&
    (!useEase || !filter.value.ease || filter.value.ease === itemEase) &&
    (!useApproach || !filter.value.approach || filter.value.approach === itemApproach)
  )
}

const availableFilterElements = computed(() => {
  const easeOrder: Record<EnumEase, number> = {
    [EnumEase.noWeight]: 0,
    [EnumEase.weight]: 1,
    [EnumEase.rubber]: 2,
  }

  const result = {
    eases: new Set<EnumEase>(),
    intervals: new Set<number>(),
    approaches: new Set<number>()
  }

  workouts.value.forEach((item) => {
    const itemInterval = +item.interval
    const itemApproach = item.approach.length

    if (isWorkoutMatchedByFilters(item.ease, itemInterval, itemApproach, { useInterval: false })) {
      result.intervals.add(itemInterval)
    }

    if (isWorkoutMatchedByFilters(item.ease, itemInterval, itemApproach, { useApproach: false })) {
      result.approaches.add(itemApproach)
    }

    if (isWorkoutMatchedByFilters(item.ease, itemInterval, itemApproach, { useEase: false })) {
      result.eases.add(item.ease)
    }
  })

  return {
    eases: allFilterElements.value.eases,
    intervals: [...result.intervals].sort((a, b) => a - b),
    approaches: [...result.approaches].sort((a, b) => a - b)
  }
})

function getInitialEase(): '' | EnumEase {
  if (activeFilters.value.ease && allFilterElements.value.eases.includes(activeFilters.value.ease)) {
    return activeFilters.value.ease
  }

  return allFilterElements.value.eases[0] ?? ''
}

function getInitialInterval(): number {
  if (activeFilters.value.interval && allFilterElements.value.intervals.includes(activeFilters.value.interval)) {
    return activeFilters.value.interval
  }

  return 0
}

function getInitialApproach(): number {
  if (activeFilters.value.approach && allFilterElements.value.approaches.includes(activeFilters.value.approach)) {
    return activeFilters.value.approach
  }

  return 0
}

function syncActiveFilters() {
  activeFilters.value = {
    ease: filter.value.ease,
    interval: filter.value.interval,
    approach: filter.value.approach
  }
}

function filterWorkouts(
  itemEase: EnumEase,
  itemInterval: number,
  itemApproach: number
): boolean {
  return isWorkoutMatchedByFilters(itemEase, itemInterval, itemApproach)
}

function useFilter() {
  filteredWorkouts.value = workouts.value.filter(item =>
    filterWorkouts(item.ease, +item.interval, item.approach.length)
  );
}

const useFilterDebounced = useDebounceFn(useFilter, 140)

const filter = ref<Filter>({
  ease: getInitialEase(),
  interval: getInitialInterval(),
  approach: getInitialApproach(),

  changeEase: (ease: '' | EnumEase) => {
    if (ease === filter.value.ease) return
    filter.value.ease = ease

    if (ease === EnumEase.weight) optionsLines.scales.y1.display = true
    else optionsLines.scales.y1.display = false
    
    forceChartUpdate()
    syncActiveFilters()
    useFilterDebounced()
  },

  changeInterval: (interval: number) => {
    if (interval === filter.value.interval) filter.value.interval = 0
    else filter.value.interval = interval
    syncActiveFilters()
    useFilterDebounced()
  },

  changeApproach: (approach: number) => {
    if (approach === filter.value.approach) filter.value.approach = 0
    else filter.value.approach = approach
    syncActiveFilters()
    useFilterDebounced()
  },
})

const color = idbStorage.getItem(IDB_KEYS.BASE_COLOR) || '#3b82f6'
const r = parseInt(color.slice(1, 3), 16)
const g = parseInt(color.slice(3, 5), 16)
const b = parseInt(color.slice(5, 7), 16)

const baseColor = color
const secondColor = `rgba(${r},${g},${b},0.2)`

type ChartDataset = {
  label: string
  borderColor: string
  backgroundColor: string
  data: Array<number | null>
  yAxisID: 'y' | 'y1'
  pointRadius: number
  order: number
  type: 'line' | 'bar'
}

const data = computed(() => {
  const approaches: Array<number | null> = []
  const dates:string[] = []
  const weights: Array<number | null> = []
  const datasets: ChartDataset[] = [
    {
      label: 'Повторений',
      borderColor: baseColor,
      backgroundColor: baseColor,
      data: approaches,
      yAxisID: 'y',
      pointRadius: 6,
      order: 1,
      type: 'line',
    }
  ]

  const options: { labels: string[]; datasets: ChartDataset[] } = {
    labels: dates,
    datasets
  }

  filteredWorkouts.value.forEach(item => {
    const formatDate = new Intl.DateTimeFormat('ru-RU', {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric'
    }).format(new Date(item.date))

    dates.unshift(formatDate)
    approaches.unshift(item.approach.reduce((acc, currentValue) => acc + +currentValue, 0))

    const weight = item.weight?.reduce((acc, currentValue) => acc + +currentValue, 0) ?? 0

    weights.unshift(weight > 0 ? weight : null)
  })
  
  if (weights.some((item) => item !== null)) {
    options.datasets.push({
      label: 'Вес',
      borderColor: secondColor,
      backgroundColor: secondColor,
      data: weights,
      yAxisID: 'y1',
      pointRadius: 6,
      order: 2,
      type: 'bar',
    })
  }

  return options
})

watch(
  availableFilterElements,
  () => {
    if (filter.value.ease && !allFilterElements.value.eases.includes(filter.value.ease)) filter.value.ease = ''
    if (!filter.value.ease && allFilterElements.value.eases.length > 0) filter.value.ease = allFilterElements.value.eases[0]!
    if (filter.value.interval && !availableFilterElements.value.intervals.includes(filter.value.interval)) filter.value.interval = 0
    if (filter.value.approach && !availableFilterElements.value.approaches.includes(filter.value.approach)) filter.value.approach = 0

    syncActiveFilters()
    useFilter()
  },
  { immediate: true }
)

function showChart() {
  if (filter.value.ease && (filter.value.interval || filter.value.approach)) return true
  return false
}
</script>

<template lang="pug">
.filters
  template(v-if="allFilterElements.eases.length > 1")
    .flex.border-b.border-faint.mb-2
      .flex-1.pb-2.text-center.text-sm.cursor-pointer.border-b-2.transition(
        v-for="ease in allFilterElements.eases"
        :key="ease"
        :class="filter.ease === ease ? 'border-accent text-accent font-medium' : 'border-transparent opacity-40'"
        @click="filter.changeEase(ease)"
      ) {{ ease }}

  template(v-if="allFilterElements.intervals.length > 1 && availableFilterElements.intervals.length > 0")
    .pb-1.text-xs(v-if="!hideFilterTitles") Интервал
    .flex.rounded-xl.p-1.overflow-x-auto.mb-2(class="bg-accent/10 scrollbar-none gap-0.5")
      .flex-1.shrink-0.text-center.py-1.rounded-lg.text-sm.cursor-pointer.transition(
        v-for="interval in availableFilterElements.intervals"
        :key="interval"
        :class="filter.interval === interval ? 'bg-white text-accent font-semibold shadow-sm' : 'text-accent/50'"
        @click="filter.changeInterval(interval)"
      ) {{ interval }}

  template(v-if="allFilterElements.approaches.length > 1 && availableFilterElements.approaches.length > 0")
    .pb-1.text-xs(v-if="!hideFilterTitles") Подходы
    .flex.rounded-xl.p-1.overflow-x-auto.mb-2(class="bg-accent/10 scrollbar-none gap-0.5")
      .flex-1.shrink-0.text-center.py-1.rounded-lg.text-sm.cursor-pointer.transition(
        v-for="approach in availableFilterElements.approaches"
        :key="approach"
        :class="filter.approach === approach ? 'bg-white text-accent font-semibold shadow-sm' : 'text-accent/50'"
        @click="filter.changeApproach(approach)"
      ) {{ approach }}
  Chart(
    v-if="showChart()"
    type="line"
    :data="data"
    :options="optionsLines"
    :key="chartKey"
    class="mt-2"
  )
</template>
