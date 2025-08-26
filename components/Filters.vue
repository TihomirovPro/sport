<script setup lang="ts">
import { Chart } from 'vue-chartjs'
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
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const allWorkouts = useWorkouts()
const chartKey = ref(0)

const forceChartUpdate = () => {
  chartKey.value++
}
const filteredWorkouts = useFilteredWorkouts()

const optionsLines = reactive({
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        display: false
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false, 
      },
    }
  }
})

const filter = ref<Filter>({
  ease: '',
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

const filterElements = computed(() => {
  const obj = { eases: new Set<EnumEase>(), intervals: new Set<number>(), approaches: new Set<number>() };

  allWorkouts.value.forEach(item => {
    obj.eases.add(item.ease);
    obj.intervals.add(+item.interval);
    obj.approaches.add(item.approach.length);
  });

  return {
    eases: [...obj.eases],
    intervals: [...obj.intervals].sort((a, b) => a - b),
    approaches: [...obj.approaches].sort((a, b) => a - b)
  };
});

const data = computed(() => {
  const approaches:number[] = [0];
  const dates:string[] = [];
  const weights:number[] = [];

  const options = {
    labels: dates,
    datasets: [
      {
        label: 'Повторений',
        borderColor: 'blue',
        backgroundColor: 'blue',
        data: approaches,
        yAxisID: 'y',
        pointRadius: 6,
        order: 1,
        type: 'line',
      }
    ]
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

    const weight = item.weight?.reduce((acc, currentValue, index) => acc + +currentValue, 0) ?? 0

    if (weight > 0) {
      weights.unshift(weight)
    }
  })
  
  if (weights.length > 0) {
    options.datasets.push({
      label: 'Вес',
      borderColor: 'red',
      backgroundColor: 'red',
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
  filteredWorkouts.value = allWorkouts.value.filter(item =>
    filterWorkouts(item.ease, +item.interval, item.approach.length)
  );
}
</script>

<template lang="pug">
.filters
  template(v-if="filterElements.intervals.length > 1")
    .pb-2.text-sm Интервал
    TabsWrap.pb-2
      TabsItem(
        v-for="interval in filterElements.intervals"
        :key="interval"
        :active="filter.interval === interval"
        @click="filter.changeInterval(interval)"
        :title="interval"
      ).text-xs
  
  template(v-if="filterElements.approaches.length > 1")
    .pb-2.text-sm Пoдходы
    TabsWrap.pb-2
      TabsItem(
        v-for="approach in filterElements.approaches"
        :key="approach"
        :active="filter.approach === approach"
        @click="filter.changeApproach(approach)"
        :title="approach"
      ).text-xs
  
  template(v-if="filterElements.eases.length > 1")
    .pb-2.text-sm Сложность
    TabsWrap(v-if="allWorkouts")
      TabsItem(
        v-for="ease in filterElements.eases"
        :key="ease"
        :active="filter.ease === ease"
        @click="filter.changeEase(ease)"
        :title="ease"
      ).text-xs
  Chart(
    v-if="[filter.interval, filter.approach, filter.ease].filter(Boolean).length >= 2"
    :data="data"
    :options="optionsLines"
    :key="chartKey"
  )
</template>