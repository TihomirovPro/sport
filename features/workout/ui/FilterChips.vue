<script setup lang="ts">
import { storeToRefs } from 'pinia'

defineProps<{
  title: string
  items: number[]
  modelValue: number
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()

const appStore = useAppStore()
const { hideFilterTitles } = storeToRefs(appStore)
</script>

<template>
  <div>
    <div v-if="!hideFilterTitles" class="pb-1 text-xs">{{ title }}</div>
    <div class="flex rounded-full p-1 overflow-x-auto mb-2 glass scrollbar-none gap-0.5">
      <div
        v-for="item in items"
        :key="item"
        class="flex-1 shrink-0 text-center py-1 rounded-full text-md cursor-pointer transition"
        :class="modelValue === item ? 'bg-faint/20 text-accent font-semibold' : 'text-accent/50'"
        @click="$emit('update:modelValue', item)"
      >{{ item }}</div>
    </div>
  </div>
</template>
