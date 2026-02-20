<script setup lang="ts">
defineProps<{
  options: Array<string | number>
  placeholder: string
  modelValue?: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value:string]
}>()

function updateValue(e:Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
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
