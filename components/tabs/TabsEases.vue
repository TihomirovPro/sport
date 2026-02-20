<script setup lang="ts">
import { EnumEase } from '~/composables/types'

const props = defineProps<{
  eases: EnumEase[]
  selected: EnumEase | EnumEase[]
}>()

const emit = defineEmits<{
  selectEase: [ease: EnumEase]
}>()

function isActive(ease: EnumEase) {
  if (Array.isArray(props.selected)) return props.selected.includes(ease)
  return props.selected === ease
}
</script>

<template lang="pug">
div
  TabsWrap
    TabsItem(
      v-for="ease in eases"
      :key="ease"
      :active="isActive(ease)"
      @click="emit('selectEase', ease)"
      :title="ease"
    )
</template>
