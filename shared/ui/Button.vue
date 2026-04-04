<script setup lang="ts">
const props = defineProps<{
  text: string
  red?: boolean
  disabled?: boolean
}>()

const classes = [
  `cursor-pointer transition
  block py-2.5 px-4 w-full rounded-xl
  text-white text-center text-lg`
]

props.red ? classes.push('bg-error hover:bg-error/80') : classes.push('bg-accent hover:bg-accent/80')

if (props.disabled) classes.push('opacity-60 cursor-not-allowed pointer-events-none')
</script>

<template>
<button
  :class="classes"
  :disabled="props.disabled"
>
  {{ text }}
</button>
</template>
