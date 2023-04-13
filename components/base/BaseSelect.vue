<script setup>
const props = defineProps({
  options: null,
  placeholder: String,
  modelValue: String
})
</script>

<template lang="pug">
select.input(
  :value="modelValue"
  @change="$emit('update:modelValue', $event.target.value)"
)
  option(
    selected
    disabled
    value="placeholder"
  ) {{ placeholder }}
  option(
    v-for="(option,i) in options"
    :key="i"
    :value="option"
  ) {{ option }}
</template>
