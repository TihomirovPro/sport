<script setup lang="ts">
type Period = 'all' | 'year' | 'month' | 'week'

const props = defineProps<{
  modelValue: Period
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Period]
}>()

const { t } = useI18n()

const tabs = computed(() => [
  { value: 'all' as Period, label: t('periods.all') },
  { value: 'year' as Period, label: t('periods.year') },
  { value: 'month' as Period, label: t('periods.month') },
  { value: 'week' as Period, label: t('periods.week') },
])
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
