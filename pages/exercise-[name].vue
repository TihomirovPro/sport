<script setup lang="ts">
const allWorkouts = useWorkouts()
const route = useRoute()

useHead({
  title: route.params.name,
})
</script>

<template lang="pug">
.p-4
  ModalWorkout
  Filters
  .detail__content(v-if="allWorkouts")
    template(v-for="item in allWorkouts")
      Workout(
        v-if="item.filter"
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
    padding 16px 0 24px
    overflow auto
</style>
    