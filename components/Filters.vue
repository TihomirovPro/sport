<script setup>
const isActiveFilters = useActiveFilters()

const allWorkouts = useWorkouts()
const easeus = useEaseus()
const interval = ref('1') 

const easeusFilter = ['Все', 'Только в резине', ...easeus.value]
const ease = ref(easeusFilter[0])

const filter = () => {
  if (ease.value === easeusFilter[0]) {
    allWorkouts.value.forEach(element => {
      if (element.interval === interval.value) {
        element.filter = true
      } else {
        element.filter = false
      }
    })
  }
  else if (ease.value === easeusFilter[1]) {
    allWorkouts.value.forEach(element => {
      if (element.interval === interval.value && element.ease !== 'Свой вес' && element.ease !== 'С весом') {
        element.filter = true
      } else {
        element.filter = false
      }
    })
  }
  else {
    allWorkouts.value.forEach(element => {
      if (element.interval === interval.value && element.ease === ease.value) {
        element.filter = true
      } else {
        element.filter = false
      }
    })
  }
}
</script>

<template lang="pug">
.filters(v-if="isActiveFilters")
  BaseInputRange(v-model="interval" @input="filter")
  BaseSelect(
    v-model="ease"
    placeholder="Сложность"
    :options="easeusFilter"
    @change="filter"
  )
</template>

<style lang="stylus" scoped>
.filters
  top 0
  position sticky
  display grid
  gap 12px
  background #fafafa
  padding 12px 16px
  box-shadow 0 0 10px rgba(darken(#fafafa, 30%), .6)
</style>