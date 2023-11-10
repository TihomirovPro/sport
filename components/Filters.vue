<script setup lang="ts">
import type { TypeWorkout, Filter } from '~/composables/types'
import { EnumEase } from '~/composables/types'

const allWorkouts = useWorkouts()
const filteredWorkouts = useFilteredWorkouts()
const activeExercise = useActiveExercise()

const filter = ref<Filter>({
  ease: 'Все',
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

const eases = computed(() => activeExercise.value?.ease || [EnumEase.noWeight, EnumEase.weight, EnumEase.rubber])
const intervals = computed(() => {
  return allWorkouts.value
    .reduce((acc:number[], item:TypeWorkout):number[] => {
      if (acc.includes(+item.interval)) return acc
        return [...acc, +item.interval]
    }, [])
    .sort((a, b) => a - b)
})

function filterEase(itemEase:EnumEase):boolean {  
  if (filter.value.ease === 'Все' || filter.value.ease === itemEase) return true
  return false
}

function filterEaseInterval(itemEase:EnumEase, itemInterval:number):boolean {
  if (filter.value.interval === 0 || filter.value.interval === itemInterval) return filterEase(itemEase)
  return false
}

function useFilter() {
  filteredWorkouts.value = allWorkouts.value.filter(item => filterEaseInterval(item.ease, +item.interval))
}
</script>

<template lang="pug">
.filters
  template(v-if="allWorkouts && intervals.length > 1")
    .pb-2.text-sm Интервал
    TabsWrap.pb-2
      //- TabsItem(
      //-   :active="filter.interval === 0"
      //-   @click="filter.changeInterval(0)"
      //-   title="Все"
      //- ).text-xs
      TabsItem(
        v-for="interval in intervals"
        :key="interval"
        :active="filter.interval === interval"
        @click="filter.changeInterval(interval)"
        :title="interval"
      ).text-xs
  
  template(v-if="eases.length > 1")
    .pb-2.text-sm Сложность
    TabsWrap(v-if="allWorkouts")
      //- TabsItem(
      //-   :active="filter.ease === 'Все'"
      //-   @click="filter.changeEase('Все')"
      //-   title="Все"
      //- )
      TabsItem(
        v-for="ease in eases"
        :key="ease"
        :active="filter.ease === ease"
        @click="filter.changeEase(ease)"
        :title="ease"
      ).text-xs
</template>