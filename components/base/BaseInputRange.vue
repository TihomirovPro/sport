<script setup lang="ts">
withDefaults(defineProps<{
    modelValue: string | number
    min: string
    max: string
    step: string
    view: string
}>(), {
  min: '1',
  max: '7',
  step: '0.5',
  view: 'interval'
})

const emit = defineEmits<{
  'update:modelValue': [value:string]
}>()

function updateValue(e:Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template lang="pug">
.input-range.relative.text-lg
  span(v-if="view === 'interval'") Интервал: В {{ modelValue }} мин
  span(v-else) Подходы: {{ modelValue }}

  input(
    type="range"
    :min='min'
    :max='max'
    :step="step"
    :value="modelValue"
    @input="updateValue"
  )
</template>

<style lang="stylus">
.input-range
  input
    margin-top 16px
    width 100%
    appearance none

    &::-webkit-slider-runnable-track
      height 10px
      background #dcdcdc
      border-radius 10px

    &::-webkit-slider-thumb
      height 30px
      width 30px
      background #5182dc
      border-radius 50%
      transform translateY(-10px)
      -webkit-appearance none
      box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .2)
</style>