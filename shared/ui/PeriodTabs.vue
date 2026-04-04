<script setup lang="ts">
type Period = 'all' | 'year' | 'month' | 'week'

const props = defineProps<{
  modelValue: Period
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Period]
}>()

const tabs: { value: Period; label: string }[] = [
  { value: 'all', label: 'Всё' },
  { value: 'year', label: 'Год' },
  { value: 'month', label: 'Месяц' },
  { value: 'week', label: 'Неделя' },
]
</script>

<template>
<div class="flex gap-1 p-1 border border-faint rounded-xl bg-transparent">
  <button
    v-for="tab in tabs"
    :key="tab.value"
    type="button"
    class="flex-1 text-xs rounded-lg cursor-pointer transition-all font-medium py-1.5"
    :class="modelValue === tab.value ? 'bg-accent text-white shadow-sm' : 'text-gray-500 hover:text-current'"
    @click="emit('update:modelValue', tab.value)"
  >
    {{ tab.label }}
  </button>
</div>
</template>
