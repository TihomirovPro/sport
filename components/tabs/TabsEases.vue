<script setup lang="ts">
import { EnumEase } from '~/composables/types'

const props = defineProps<{
  eases: EnumEase[]
  selected: EnumEase | EnumEase[]
}>()

function isActive(ease: EnumEase) {
  if (props.selected === ease || props.selected.includes(ease)) return true
  return false
}
</script>

<template lang="pug">
div
  TabsWrap
    TabsItem(
      v-for="ease in eases"
      :key="ease"
      :active="isActive(ease)"
      @click="$emit('selectEase', ease)"
      :title="ease"
    )
</template>