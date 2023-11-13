<script setup type="ts">
const allExercises = useAllExercises()
const headerTitle = useHeaderTitle()

useHead({
  title: 'Упражнения',
})

headerTitle.value = 'Упражнения'
</script>

<template lang="pug">
div
  Exercise(
    v-for="(item, i) in allExercises"
    :style="`order: ${item.order ? item.order : i}`"
    :key="item.name"
    :name="item.name"
    :color="item.color"
    :icon="item.icon"
    :id="item.id"
    :ease="item.ease"
  )
</template>
