<script setup>
const allExercises = useAllExercises()

useHead({
  title: 'Упражнения',
})
</script>

<template lang="pug">
.exercisesList
  ModalExercise
  .exercisesList__items
    Exercise(
      v-for="(item, i) in allExercises"
      :style="`order: ${item.order ? item.order : i}`"
      :key="item.name"
      :name="item.name"
      :color="item.color"
      :icon="item.icon"
      :id="item.id"
    )
</template>

<style lang="stylus" scoped>
.exercisesList__items
  display grid
</style>
