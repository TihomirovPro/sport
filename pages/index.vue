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
      :key="element.name"
      :name="element.name"
      :color="element.color"
      :icon="element.icon"
      :id="element.id"
      :isComplex="element.isComplex"
      :complexDesc="element.complexDesc"
      :ease="element.ease"
      :order="element.order"
    )
</template>
