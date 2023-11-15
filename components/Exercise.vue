<script setup lang="ts">
import type { TypeExercise } from '~/composables/types'

const props = defineProps<TypeExercise>()

const updateExercise = useSelectUpdateExercise()
const activeExercise = useActiveExercise()
const router = useRouter()

function update() {
  updateExercise.value = props
  router.push('/exercise')
}

async function active() {
  activeExercise.value = props
  localStorage.setItem('activeExercise', JSON.stringify(props))
  await getWorkouts(props.id)
  router.push('/exercise-item')
}
</script>

<template lang="pug">
.grid.gap-5.items-center(
  class="grid-cols-[56px_1fr]"
)
  .flex-center.size-14.text-4xl.p-1.rounded-xl.uppercase.text-white.bg-accent(
    :style="`background: ${color}`"
    @click="update"
  )
    .text-2xl.text-white(v-if="!icon") {{ name[0] }}
    Icon(v-else :icon="icon" color="#fff")

  .cursor-pointer.py-6.text-xl.border-b.border-faint(
    @click="active"
  ) {{ name }}
</template>
