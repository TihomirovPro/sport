<script setup lang="ts">
import type { Filter } from '~/composables/types'
import { EnumEase } from '~/composables/types'

const allWorkouts = useWorkouts()
const filteredWorkouts = useFilteredWorkouts()

const filter = ref<Filter>({
  ease: '',
  interval: 0,

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
})

const filterElements = computed(() => {
  const obj:{ eases: EnumEase[], intervals: number[] } = {
    eases: [],
    intervals: []
  }
  allWorkouts.value.forEach(item => {  
    if (!obj.eases.includes(item.ease)) obj.eases.push(item.ease)
    if (!obj.intervals.includes(+item.interval)) obj.intervals.push(+item.interval)
  })

  obj.intervals.sort((a, b) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })

  return obj
})

function filterEase(itemEase:EnumEase):boolean {  
  if (!filter.value.ease || filter.value.ease === itemEase) return true
  return false
}

function filterEaseInterval(itemEase:EnumEase, itemInterval:number):boolean {
  if (!filter.value.interval || filter.value.interval === itemInterval) return filterEase(itemEase)
  return false
}

function useFilter() {
  filteredWorkouts.value = allWorkouts.value.filter(item => filterEaseInterval(item.ease, +item.interval))
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
</template>