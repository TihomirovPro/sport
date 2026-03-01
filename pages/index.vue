<script setup lang="ts">
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'

const exerciseStore = useExerciseStore()
const appStore = useAppStore()
const { allExercises, allExercisesLoaded } = storeToRefs(exerciseStore)
const router = useRouter()

function toCreateExercise() {
  void router.push('/exercise')
}

useHead({
  title: 'Упражнения',
})

appStore.headerTitle = 'Упражнения'
</script>

<template lang="pug">
.grid.gap-4
  draggable(
    v-if="allExercises.length"
    v-model="allExercises"
    @end="sortExercises(allExercises)"
    item-key="id"
    handle=".hangle"
    delay="100"
  )
    template(#item="{element}")
      Exercise(
        :key="element.id"
        :name="element.name"
        :color="element.color"
        :icon="element.icon"
        :id="element.id"
        :isComplex="element.isComplex"
        :complexDesc="element.complexDesc"
        :ease="element.ease"
        :order="element.order"
      )

  .grid.gap-3.p-4.rounded-xl.border.border-faint.text-center(
    v-else-if="allExercisesLoaded"
    class="bg-faint/20"
  )
    p.text-sm.opacity-75 У вас пока нет упражнений
    p.text-xs.opacity-60 Нажмите на плюс в правом верхнем углу или добавьте первое упражнение кнопкой ниже
    BaseButton(
      text="Добавить упражнение"
      @click="toCreateExercise"
    )
</template>
