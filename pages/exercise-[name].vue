<script setup>
const allWorkouts = useWorkouts()
const isActiveFilters = useActiveFilters()
</script>

<template lang="pug">
.detail
  ModalWorkout
  Filters
  .detail__content(v-if="allWorkouts")
    template(v-for="item in allWorkouts")
      Workout(
        v-if="!isActiveFilters"
        :key="item.id"
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :ease="item.ease"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
      )
      Workout(
        v-else-if="item.filter"
        :key="item.id"
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :ease="item.ease"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
      )
</template>

<style lang="stylus" scoped>
.detail
  &__content
    display grid
    gap 24px
    padding 16px 12px 24px
    overflow auto
</style>
    