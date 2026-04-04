<script setup lang="ts">
defineProps<{
  modelValue?: string | number
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

const classes = 'border border-faint p-2 rounded w-full max-width-full bg-transparent'
</script>

<template>
<textarea
  v-if="type === 'textarea'"
  name="textarea"
  class="min-h-[52px]"
  :class="classes"
  :value="modelValue ?? ''"
  :placeholder="placeholder"
  autocomplete="off"
  @input="updateValue"
/>

<input
  v-else
  name="input"
  :type="type"
  :value="modelValue ?? ''"
  :placeholder="placeholder"
  :class="[classes, { 'border-error': error }]"
  autocomplete="off"
  @input="updateValue"
/>
</template>
