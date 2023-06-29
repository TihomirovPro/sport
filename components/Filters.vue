<script setup lang="ts">
import type { TypeWorkout } from '../composables/types'
import { EnumEase } from '../composables/types'

const allWorkouts = useWorkouts()
const activeExercise = useActiveExercise()

const eases = computed(() => activeExercise.value.ease ? activeExercise.value.ease : [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber])

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
  if (filter.value.ease === 'Все' || itemEase === filter.value.ease) return true
  return false
}

function filterEaseInterval(itemEase:EnumEase, itemInterval:number):boolean {
  if (filter.value.interval === 0 || itemInterval === filter.value.interval) return filterEase(itemEase)
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
  template(v-if="allWorkouts && filter.intervals.length > 1")
    .pb-2.text-sm Интервал
    TabsWrap.pb-2
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
    .pb-2.text-sm Сложность
  template(v-if="eases.length > 1")
    TabsWrap(v-if="allWorkouts")
      TabsItem(
        :active="filter.ease === 'Все'"
        @click="filter.changeEase('Все')"
        title="Все"
      )
      TabsItem(
        v-for="ease in eases"
        :key="ease"
        :active="filter.ease === ease"
        @click="filter.changeEase(ease)"
        :title="ease"
      )
</template>