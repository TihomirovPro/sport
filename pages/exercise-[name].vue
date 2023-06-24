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
  .grid.gap-6.pt-4.pb-7.overflow-auto(v-if="allWorkouts")
    template(v-for="item in allWorkouts")
      Workout(
        v-if="item.filter"
        :key="item.id"
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :ease="item.ease"
        :rubber="item.rubber"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
      )
</template>
