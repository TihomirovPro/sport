<script setup>
const allExercises = useAllExercises()
</script>

<template lang="pug">
.exercisesList
  ModalExercise
  .exercisesList__items
    Exercise(
      v-for="item in allExercises"
      :key="item.name"
      :name="item.name"
      :color="item.color"
      :icon="item.icon"
      :id="item.id"
    )
</template>
