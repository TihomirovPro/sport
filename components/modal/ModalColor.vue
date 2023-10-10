<script setup lang="ts">
defineProps<{ isShow: boolean }>()

const emit = defineEmits<{
  hiden: []
  selectColor: [color: string]
}>()

const colors = useColors()
</script>

<template lang="pug">
Modal(:isShow="isShow" @hiden="emit('hiden')")
  template(#content)
    .grid.gap-1.grid-cols-6.-mx-3.-my-5
      .h-14.rounded-lg(
        v-for="color in colors"
        @click="emit('selectColor', color)"
        :style="`background: ${color}`"
      )
</template>