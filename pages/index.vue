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

<template>
  <draggable
    v-if="allExercises.length"
    class="grid gap-3"
    v-model="allExercises"
    @end="sortExercises(allExercises)"
    item-key="id"
    handle=".hangle"
    :delay="100"
  >
    <template #item="{ element }">
      <Exercise
        :key="element.id"
        :name="element.name"
        :color="element.color"
        :icon="element.icon"
        :id="element.id"
        :isComplex="element.isComplex"
        :complexDesc="element.complexDesc"
        :ease="element.ease"
        :order="element.order"
      />
    </template>
  </draggable>

  <div
    v-else-if="allExercisesLoaded"
    class="grid gap-3 p-4 rounded-xl border border-faint text-center bg-faint/20"
  >
    <p class="text-sm opacity-75">У вас пока нет упражнений</p>
    <p class="text-xs opacity-60">Нажмите на плюс в правом верхнем углу или добавьте первое упражнение кнопкой ниже</p>
    <UiButton text="Добавить упражнение" @click="toCreateExercise" />
  </div>
</template>
