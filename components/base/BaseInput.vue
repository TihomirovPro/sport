<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  type: string
  error?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value:string]
}>()

function updateValue(e:Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template lang="pug">
textarea.input(
  v-if="type === 'textarea'"
  :value="modelValue"
  :placeholder="placeholder"
  autocomplete="off"
  @input="updateValue"
)
input.input(
  v-else
  :type="type"
  :value="modelValue"
  :placeholder="placeholder"
  autocomplete="off"
  @input="updateValue"
  :class="{ '_error': error }"
)
</template>

<style lang="stylus">
.input
  padding 10px 8px
  font-size 18px
  border 1px solid rgba(#dcdcdc,1)
  border-radius 4px
  width 100%
  max-width 100%
  min-height 42px

  &._error
    border 1px solid rgba(red,.6)
</style>
