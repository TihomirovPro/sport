<script setup lang="ts">
const headerTitle = useHeaderTitle()
headerTitle.value = 'Добавить комплекс'

const activeExercise = useActiveExercise()

interface TypeComplex {
  exerciseId: string
  exercises: string[]
}

const complex = ref<TypeComplex>({
  exerciseId: activeExercise.value!.id,
  exercises: []
})

function addExercise() {
  complex.value.exercises.push('')
}

function removeExercise(idx:number) {
  complex.value.exercises.splice(idx, 1)
}
</script>

<template lang="pug">
.flex.flex-col.gap-3.min-h-full
  .flex.gap-3.items-center(v-for="item, idx in complex.exercises")
    BaseInput(
      v-model="complex.exercises[idx]"
      type="text"
      placeholder="Название упражения"
    )
    div(@click="removeExercise(idx)") удалить

  BaseButton(
    text="Добавить Упражнение"
    @click="addExercise"
  ).mt-auto
</template>

<style lang="stylus" scoped>
</style>
