<script setup lang="ts">
const props = withDefaults(defineProps<{
    modelValue: string | number
    min?: string
    max?: string
    step?: string
    view?: string
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

const title = computed(() => {
  if (props.view === 'interval') return `Интервал: В ${props.modelValue} мин`
  if (props.view === 'rpe') return `RPE: ${props.modelValue}`
  return `Подходы: ${props.modelValue}`
})

const fillPercent = computed(() => {
  const val = +props.modelValue
  const min = +props.min
  const max = +props.max
  return ((val - min) / (max - min)) * 100
})
</script>

<template>
<div class="relative z-10">
  <div class="ml-[13px] w-[calc(100%-26px)] -z-[1] h-[22px] bottom-0 absolute flex justify-between">
    <div
      v-for="i in steps"
      :key="i"
      class="h-full bg-faint w-[1px]"
    />
  </div>
  <span>{{ title }}</span>

  <input
    type="range"
    name="range"
    :min='min'
    :max='max'
    :step="step"
    :value="modelValue"
    :style="{ '--fill': `${fillPercent}%` }"
    @input="updateValue"
    class="bg-transparent mt-4 w-full appearance-none"
  />
</div>
</template>

<style scoped lang="stylus">
input
  &:focus
    outline none

  &::-webkit-slider-runnable-track
    height 10px
    background linear-gradient(
      to right,
      unquote('rgb(var(--colorAccent))') var(--fill),
      unquote('rgb(var(--colorFaint))') var(--fill)
    )
    border-radius 12px

  &::-webkit-slider-thumb
    height 26px
    width 26px
    background-color unquote('rgb(var(--colorAccent))')
    border-radius 50%
    transform translateY(-8px)
    box-shadow 0 2px 10px rgba(0, 0, 0, 0.25)
    -webkit-appearance none
    transition transform 0.15s ease, box-shadow 0.15s ease

  &:active::-webkit-slider-thumb
    transform translateY(-8px) scale(1.2)
    box-shadow 0 4px 16px rgba(0, 0, 0, 0.35)
</style>
