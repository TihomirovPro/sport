<script setup lang="ts">
const props = defineProps<{
  text: string
  red?: boolean
  disabled?: boolean
}>()

const classes = computed(() => {
  const cls = [
    `cursor-pointer transition
    block py-2.5 px-4 w-full rounded
    text-white text-center text-lg`
  ]

  if (props.red) cls.push('bg-error hover:bg-error/80')
  else cls.push('bg-accent hover:bg-accent/80')
  if (props.disabled) cls.push('opacity-60 cursor-not-allowed pointer-events-none')

  return cls
})
</script>

<template lang="pug">
button(
  :class="classes"
  :disabled="props.disabled"
) {{ text }}
</template>
