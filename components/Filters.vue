<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { Filter } from '~/composables/types'
import { EnumEase } from '~/composables/types'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const allWorkouts = useWorkouts()
const filteredWorkouts = useFilteredWorkouts()

const filter = ref<Filter>({
  ease: '',
  interval: 0,
  approach: 0,

  changeEase: (ease: '' | EnumEase) => {
    if (ease === filter.value.ease) filter.value.ease = ''
    else filter.value.ease = ease
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
  let approaches:number[] = [];
  const dates:string[] = [];
  const weights:number[] = [];

  const options = {
    labels: dates,
    datasets: [
      {
        label: 'Повторений',
        borderColor: 'rgb(248 113 113)',
        backgroundColor: 'rgb(59 130 246)',
        data: approaches
      }
    ]
  }

  filteredWorkouts.value.forEach(item => {
    const formatDate = new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(new Date(item.date))

    dates.unshift(formatDate)
    approaches.unshift(item.approach.reduce((acc, currentValue) => acc + +currentValue, 0))

    const weight = item.weight?.reduce((acc, currentValue, index) => acc + (currentValue*item.approach[index]), 0) ?? 0

    if (weight > 0) {
      weights.unshift(weight)
    }
  })
  
  if (weights.length > 0) {
    options.datasets.push({
      label: 'Вес',
      borderColor: 'rgb(59 130 246)',
      backgroundColor: 'rgb(248 113 113)',
      data: weights,
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
  Line(
    v-if="[filter.interval, filter.approach, filter.ease].filter(Boolean).length >= 2"
    :data="data"
  )
</template>