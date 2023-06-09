<script setup lang="ts">
defineProps<{
  options: []
  placeholder: string
  modelValue: string
}>()
</script>

<template lang="pug">
select.input(
  :value="modelValue"
  @change="$emit('update:modelValue', $event.target.value)"
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
