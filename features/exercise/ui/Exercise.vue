<script setup lang="ts">
import type { TypeExercise } from '~/features/exercise/model/types'
import { useRgbColor } from '~/shared/lib/useRgbColor'

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

const rgbColor = useRgbColor(props.color)
</script>

<template>
<div
  :class="`
    group flex items-center
    gap-3.5 px-3 py-2.5
    rounded-2xl border
    backdrop-blur-md
  `"
  :style="`border-color: rgba(${rgbColor}, 0.1); background-color: rgba(${rgbColor}, 0.1)`"
  @click="active"
>
  <!-- Avatar -->
  <div
    class="shrink-0 flex-center size-12 p-1.5 rounded-[14px] text-white shadow-sm transition-transform duration-200 group-active:scale-90"
    :style="`background: ${color}`"
    @click.stop="update"
  >
    <div class="text-xl font-semibold" v-if="!icon">{{ name[0] }}</div>
    <UiIcon v-else :icon="icon" color="#fff" />
  </div>

  <!-- Name -->
  <div class="flex-1 min-w-0 text-text text-base font-medium leading-snug truncate">
    {{ name }}
  </div>

  <!-- Drag handle — 6-dot iOS style -->
  <div class="hangle shrink-0 flex flex-col gap-[3px] opacity-25 transition-opacity duration-200 group-hover:opacity-50 px-1 cursor-grab active:cursor-grabbing" @click.stop>
    <div class="flex gap-[3px]">
      <div class="size-[3.5px] rounded-full bg-current" />
      <div class="size-[3.5px] rounded-full bg-current" />
    </div>
    <div class="flex gap-[3px]">
      <div class="size-[3.5px] rounded-full bg-current" />
      <div class="size-[3.5px] rounded-full bg-current" />
    </div>
    <div class="flex gap-[3px]">
      <div class="size-[3.5px] rounded-full bg-current" />
      <div class="size-[3.5px] rounded-full bg-current" />
    </div>
  </div>
</div>
</template>
