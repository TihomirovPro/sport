<script setup>
const props = defineProps({
    modelValue: String,
    min: { type: String, default: '1' },
    max: { type: String, default: '7' },
    step: { type: Number, default: '0.5' },
    view: { type: String, default: 'interval' },
});
</script>

<template lang="pug">
.input-range
  span(v-if="view === 'interval' && modelValue !== '0.5'") Интервал: В {{ modelValue }} мин
  span(v-else-if="view === 'interval'") Интервал: Все
  span(v-else-if="view === 'approaches'") Подходы: {{ modelValue }}

  input(
    type="range"
    :min='min'
    :max='max'
    :step="step"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  )
</template>

<style lang="stylus">
.input-range
  position relative
  font-size 18px

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