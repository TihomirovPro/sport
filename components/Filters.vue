<script setup lang="ts">
import type { TypeWorkout } from '../composables/types'
import { EnumEase } from '../composables/types'

const allWorkouts = useWorkouts()

interface IFilter {
  ease: 'Все' | EnumEase,
  intervals: number[],
  interval: number,
  changeEase: (name:'Все' | EnumEase) => void,
  changeInterval: (interval:number) => void
}

const filter = ref<IFilter>({
  ease: 'Все',
  intervals: [],
  interval: 0,

  changeEase: (name:'Все' | EnumEase) => {
    filter.value.ease = name
    useFilter()
  },

  changeInterval: (interval:number) => {
    filter.value.interval = interval
    useFilter()
  },
})

watchEffect(() => {
  if (allWorkouts.value) {
    filter.value.intervals = allWorkouts.value
      .reduce((acc:number[], item:TypeWorkout):number[] => {
        if (acc.includes(+item.interval)) return acc
        return [...acc, +item.interval]
      }, [])
      .sort((a, b) => a - b)
  }
})

function filterEase(itemEase:EnumEase):boolean {  
  if (filter.value.ease === 'Все') return true
  else if (itemEase === filter.value.ease) return true
  else if (filter.value.ease === EnumEase.rubber && itemEase !== EnumEase.noWeight && itemEase !== EnumEase.weight) return true
  return false
}

function filterEaseInterval(itemEase:EnumEase, itemInterval:number):boolean {
  if (itemInterval === filter.value.interval) return filterEase(itemEase)
  else if (filter.value.interval === 0) return filterEase(itemEase)
  return false
}

function useFilter() {
  allWorkouts.value.forEach(element => {
    element.filter = filterEaseInterval(element.ease, +element.interval)
  })
}
</script>

<template lang="pug">
.filters
  .pb-2(v-if="allWorkouts && filter.intervals.length > 1") Интервал
  TabsWrap.pb-2(v-if="allWorkouts && filter.intervals.length > 1")
    TabsItem(
      :active="filter.interval === 0"
      @click="filter.changeInterval(0)"
      title="Все"
    )
    TabsItem(
      v-for="interval in filter.intervals"
      :key="interval"
      :active="filter.interval === interval"
      @click="filter.changeInterval(interval)"
      :title="interval"
    )
  
  .pb-2(v-if="allWorkouts && filter.intervals.length > 1") Сложность
  TabsWrap(v-if="allWorkouts")
    TabsItem(
      :active="filter.ease === 'Все'"
      @click="filter.changeEase('Все')"
      title="Все"
    )
    TabsItem(
      v-for="ease in EnumEase"
      :key="ease"
      :active="filter.ease === ease"
      @click="filter.changeEase(ease)"
      :title="ease"
    )
</template>