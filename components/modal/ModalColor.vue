<script setup lang="ts">
import { storeToRefs } from 'pinia'

defineProps<{ 
  isShow: boolean
  activeColor?: string
}>()

const emit = defineEmits<{
  hiden: []
  selectColor: [color: string]
}>()

const catalogStore = useCatalogStore()
const { colors } = storeToRefs(catalogStore)
</script>

<template>
<UiModal :isShow="isShow" @hiden="emit('hiden')">
  <template #content>
    <div class="grid gap-1 grid-cols-6">
      <div
        class="h-14 rounded-lg transition"
        v-for="color in colors"
        @click="emit('selectColor', color)"
        :class="{ 'border-[2px] border-accent p-1' : activeColor === color }"
      >
        <div class="size-full rounded-lg" :style="`background: ${color}`" />
      </div>
    </div>
  </template>
</UiModal>
</template>
