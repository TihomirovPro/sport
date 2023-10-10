<script setup lang="ts">
const props = defineProps<{
  text: string
  red?: boolean
}>()

const classes = computed(() => {
  const cls = [
    `cursor-pointer transition
    block py-2.5 px-4 w-full rounded
    text-white text-center text-lg`
  ]

  if (props.red) cls.push('bg-red-400 hover_bg-red-500')
  else cls.push('bg-blue-500 hover_bg-blue-600')

  return cls
})
</script>

<template lang="pug">
button(
  :class="classes"
) {{ text }}
</template>
