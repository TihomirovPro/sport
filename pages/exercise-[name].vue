<script setup lang="ts">
const filteredWorkouts = useFilteredWorkouts()
const activeExercise = useActiveExercise()
const headerTitle = useHeaderTitle()

headerTitle.value = String(activeExercise.value?.name)

useHead({
  title: activeExercise.value?.name
})
</script>

<template lang="pug">
.py-4
  ModalWorkout
  Filters
  .grid.gap-6.pt-4
    template(v-for="item in filteredWorkouts" :key="item.id")
      Workout(
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
