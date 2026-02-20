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
</script>

<template lang="pug">
textarea.input.border.border-faint.p-2.rounded.w-full.max-width-full.bg-transparent(
  v-if="type === 'textarea'"
  class="min-h-[52px]"
  :value="modelValue ?? ''"
  :placeholder="placeholder"
  autocomplete="off"
  @input="updateValue"
)
input.input.border.border-faint.p-2.rounded.w-full.max-width-full.bg-transparent(
  v-else
  :type="type"
  :value="modelValue ?? ''"
  :placeholder="placeholder"
  :class="{ 'border-error': error }"
  autocomplete="off"
  @input="updateValue"
)
</template>
