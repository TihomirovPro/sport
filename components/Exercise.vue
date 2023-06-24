<script setup lang="ts">
import type { TypeExercise } from "../composables/types"

const props = withDefaults(defineProps<TypeExercise>(), {
  color: '#5182dc'
})

const allExercises = useAllExercises()
const isShowModalExercise = useShowModalExercise()
const updateExercise = useSelectUpdateExercise()
const activeExercise = useActiveExercise()

function updateModal() {
  updateExercise.value = allExercises.value.find(item => item.id === props.id)
  isShowModalExercise.value = true
}

async function active() {
  activeExercise.value = props.id
  getWorkouts(props.id)
}
</script>

<template lang="pug">
.grid.gap-5.items-center.px-3(
  class="grid-cols-[56px_1fr]"
)
  .flex-center.size-14.text-4xl.p-1.rounded-xl.uppercase(
    class="text-[#fff] bg-[#5182dc]"
    :style="`background: ${color}`"
    @click="updateModal"
  )
    .text-2xl(v-if="!icon") {{ name[0] }}
    div(v-else :class="`icon-${icon}`")

  NuxtLink.cursor-pointer.py-6.text-xl.border-b(
    class="text-[#5182dc] border-[rgba(#dcdcdc,.5)]"
    @click="active"
    :to="`/exercise-${name}`"
  ) {{ name }}
</template>
