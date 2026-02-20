<script setup lang="ts">
import { Chart } from 'vue-chartjs'
import { storeToRefs } from 'pinia'
import type { Filter } from '~/composables/types'
import { EnumEase } from '~/composables/types'

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
const { workouts, filteredWorkouts } = storeToRefs(workoutStore)
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

const filterElements = computed(() => {
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

const filter = ref<Filter>({
  ease: filterElements.value.eases.length === 1 ? (filterElements.value.eases[0] ?? '') : '',
  interval: 0,
  approach: 0,

  changeEase: (ease: '' | EnumEase) => {
    if (ease === filter.value.ease) filter.value.ease = ''
    else filter.value.ease = ease

    if (ease === EnumEase.weight) optionsLines.scales.y1.display = true
    else optionsLines.scales.y1.display = false
    
    forceChartUpdate()
    useFilter()
  },

  changeInterval: (interval: number) => {
    if (interval === filter.value.interval) filter.value.interval = 0
    else filter.value.interval = interval
    useFilter()
  },

  changeApproach: (approach: number) => {
    if (approach === filter.value.approach) filter.value.approach = 0
    else filter.value.approach = approach
    useFilter()
  },
})

const color = localStorage.getItem('baseColor') || '#3b82f6'
const r = parseInt(color.slice(1, 3), 16)
const g = parseInt(color.slice(3, 5), 16)
const b = parseInt(color.slice(5, 7), 16)

const baseColor = color
const secondColor = `rgba(${r},${g},${b},0.2)`

type ChartDataset = {
  label: string
  borderColor: string
  backgroundColor: string
  data: number[]
  yAxisID: 'y' | 'y1'
  pointRadius: number
  order: number
  type: 'line' | 'bar'
}

const data = computed(() => {
  const approaches:number[] = [0];
  const dates:string[] = [];
  const weights:number[] = [];
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

    if (!item.weight && approaches[0] === 0) {
      approaches.shift()
    } 

    dates.unshift(formatDate)
    approaches.unshift(item.approach.reduce((acc, currentValue) => acc + +currentValue, 0))

    const weight = item.weight?.reduce((acc, currentValue) => acc + +currentValue, 0) ?? 0

    if (weight > 0) {
      weights.unshift(weight)
    }
  })
  
  if (weights.length > 0) {
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

function filterWorkouts(
  itemEase: EnumEase,
  itemInterval: number,
  itemApproach: number
): boolean {
  return (
    (!filter.value.interval || filter.value.interval === itemInterval) &&
    (!filter.value.ease || filter.value.ease === itemEase) &&
    (!filter.value.approach || filter.value.approach === itemApproach)
  );
}

function useFilter() {
  filteredWorkouts.value = workouts.value.filter(item =>
    filterWorkouts(item.ease, +item.interval, item.approach.length)
  );
}

function showChart() {
  if (filter.value.ease && (filter.value.interval || filter.value.approach)) return true
  return false
}
</script>

<template lang="pug">
.filters
  template(v-if="filterElements.intervals.length > 1")
    .pb-1.text-xs(v-if="!hideFilterTitles") Интервал
    TabsWrap.pb-1
      TabsItem(
        v-for="interval in filterElements.intervals"
        :key="interval"
        :active="filter.interval === interval"
        @click="filter.changeInterval(interval)"
        :title="interval"
      ).text-xs
  
  template(v-if="filterElements.approaches.length > 1")
    .pb-1.text-xs(v-if="!hideFilterTitles") Пoдходы
    TabsWrap.pb-1
      TabsItem(
        v-for="approach in filterElements.approaches"
        :key="approach"
        :active="filter.approach === approach"
        @click="filter.changeApproach(approach)"
        :title="approach"
      ).text-xs
  
  template(v-if="filterElements.eases.length > 1")
    .pb-1.text-xs(v-if="!hideFilterTitles") Сложность
    TabsWrap(v-if="workouts")
      TabsItem(
        v-for="ease in filterElements.eases"
        :key="ease"
        :active="filter.ease === ease"
        @click="filter.changeEase(ease)"
        :title="ease"
      ).text-xs
  Chart(
    v-if="showChart()"
    type="line"
    :data="data"
    :options="optionsLines"
    :key="chartKey"
    class="mt-2"
  )
</template>
