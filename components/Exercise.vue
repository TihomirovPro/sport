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

function active() {
  activeExercise.value = props
  localStorage.setItem('activeExercise', JSON.stringify(props))
  getWorkouts(props.id)

  if (!props.isComplex) router.push('/exercise-item')
  else router.push('/exercise-item?complex=true')
}
</script>

<template lang="pug">
.grid.gap-5.items-center.border-b.border-faint(
  class="grid-cols-[56px_1fr_40px]"
)
  .flex-center.size-14.text-4xl.p-1.rounded-xl.uppercase.text-white.bg-accent(
    :style="`background: ${color}`"
    @click="update"
  )
    .text-2xl.text-white(v-if="!icon") {{ name[0] }}
    Icon(v-else :icon="icon" color="#fff")

  .cursor-pointer.py-6.text-lg(
    class="text-[rgb(var(--colorIcon))]"
    @click="active"
  ) {{ name }}
  .hangle.flex-center.flex-col.gap-1.h-full.cursor-pointer.hover_opacity-90.opacity-50.transition
    .w-6.bg-accent.rounded(class="h-0.5")
    .w-6.bg-accent.rounded(class="h-0.5")
</template>
