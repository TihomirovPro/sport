<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  activeColor?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template lang="pug">
.relative.w-11.h-6.rounded-full.transition-colors.duration-200.shrink-0(
  :style="props.modelValue && props.activeColor ? `background: ${props.activeColor}` : ''"
  :class="!props.modelValue ? 'bg-faint' : (!props.activeColor ? 'bg-accent' : '')"
  @click.stop="$emit('update:modelValue', !props.modelValue)"
)
  .absolute.size-5.rounded-full.bg-white.shadow.transition-transform.duration-200(
    class="top-0.5"
    :class="props.modelValue ? 'translate-x-5.5' : 'translate-x-0.5'"
  )
</template>
