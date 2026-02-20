<script setup lang="ts">
import { storeToRefs } from 'pinia'

defineProps<{ 
  isShow: boolean
  activeColor?: string
}>()

const emit = defineEmits<{
  hiden: []
  selectColor: [color: string]
}>()

const catalogStore = useCatalogStore()
const { colors } = storeToRefs(catalogStore)
</script>

<template lang="pug">
Modal(:isShow="isShow" @hiden="emit('hiden')")
  template(#content)
    .grid.gap-1.grid-cols-6
      .h-14.rounded-lg.transition(
        v-for="color in colors"
        @click="emit('selectColor', color)"
        :class="{ 'border-[2px] border-accent p-1' : activeColor === color }"
      )
        .size-full.rounded-lg(:style="`background: ${color}`")
</template>
