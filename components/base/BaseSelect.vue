<script setup lang="ts">
defineProps<{
  options: []
  placeholder: string
  modelValue: string
}>()

const emits = defineEmits<{
  'update:modelValue': [value:string]
}>()

function updateValue(e:Event) {
  emits('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template lang="pug">
select.input(
  :value="modelValue"
  @change="updateValue"
)
  option(
    selected
    disabled
    :value="placeholder"
  ) {{ placeholder }}

  option(
    v-for="option in options"
    :key="option"
    :value="option"
  ) {{ option }}
</template>
