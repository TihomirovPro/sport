<script setup type="ts">
import draggable from 'vuedraggable'

const allExercises = useAllExercises()
const headerTitle = useHeaderTitle()

useHead({
  title: 'Упражнения',
})

headerTitle.value = 'Упражнения'
</script>

<template lang="pug">
draggable(
  v-model="allExercises"
  @end="sortExercises(allExercises)"
  item-key="id"
  handle=".hangle"
  delay="100"
)
  template(#item="{element}")
    Exercise(
      :style="`order: ${element.order}`"
      :key="element.name"
      :name="element.name"
      :color="element.color"
      :icon="element.icon"
      :id="element.id"
      :ease="element.ease"
    )
</template>
