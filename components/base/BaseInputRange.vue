<script setup lang="ts">
const props = withDefaults(defineProps<{
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

const steps = computed(()=> {
  if (props.step === '0.5') return (+props.max / +props.step) - 1
  return +props.max
})

const emit = defineEmits<{
  'update:modelValue': [value:string]
}>()

function updateValue(e:Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template lang="pug">
.input-range.relative(class="z-10")
  .absolute.flex.justify-between(class="ml-[13px] w-[calc(100%-26px)] -z-[1] h-[22px] bottom-0")
    .h-full.bg-faint(
      v-for="i in steps"
      :key="i"
      class="w-[1px]"
    )
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
    background-color transparent
    margin-top 16px
    width 100%
    appearance none

    &::-webkit-slider-runnable-track
      height 10px
      background-color theme('colors.faint')
      border-radius 12px

    &::-webkit-slider-thumb
      height 26px
      width 26px
      background-color theme('colors.accent')
      border-radius 50%
      transform translateY(-8px)
      box-shadow:shadow 0 0 10px rgba(0, 0, 0, 0.2)
      -webkit-appearance none
</style>