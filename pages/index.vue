<script setup type="ts">
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'

const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { allExercises } = storeToRefs(exerciseStore)

useHead({
  title: 'Упражнения',
})

appStore.headerTitle = 'Упражнения'
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
