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

  if (props.red) cls.push('bg-error hover_bg-erorr/80')
  else cls.push('bg-accent hover_bg-accent/80')

  return cls
})
</script>

<template lang="pug">
button(
  :class="classes"
) {{ text }}
</template>
