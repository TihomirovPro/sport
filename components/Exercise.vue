<script setup lang="ts">
import type { TypeExercise } from '~/composables/types'

const props = defineProps<TypeExercise>()

const router = useRouter()

function update() {
  router.push(`/exercise/${props.id}/edit`)
}

function active() {
  getWorkouts(props.id)

  if (!props.isComplex) router.push(`/exercise/${props.id}`)
  else router.push(`/exercise/${props.id}?complex=true`)
}
</script>

<template>
<div class="grid-cols-[56px_1fr_40px] grid gap-5 items-center border-b border-faint">
  <div
    class="flex-center size-14 text-4xl p-1 rounded-xl uppercase text-white bg-accent"
    :style="`background: ${color}`"
    @click="update"
  >
    <div class="text-2xl text-white" v-if="!icon">{{ name[0] }}</div>
    <UiIcon v-else :icon="icon" color="#fff" />
  </div>

  <div
    class="text-[rgb(var(--colorIcon))] cursor-pointer py-6 text-lg"
    @click="active"
  >{{ name }}</div>
  <div class="hangle flex-center flex-col gap-1 h-full cursor-pointer opacity-50 transition hover:opacity-90">
    <div class="w-6 bg-accent rounded h-0.5" />
    <div class="w-6 bg-accent rounded h-0.5" />
  </div>
</div>
</template>
