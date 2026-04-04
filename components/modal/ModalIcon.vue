<script setup lang="ts">
import { storeToRefs } from 'pinia'

defineProps<{
  isShow: boolean
  activeIcon: string | undefined
}>()

const emit = defineEmits<{
  hiden: []
  selectIcon: [icon: string]
}>()

const catalogStore = useCatalogStore()
const { icons } = storeToRefs(catalogStore)
</script>

<template>
<UiModal :isShow="isShow" @hiden="emit('hiden')">
  <template #content>
    <div class="grid gap-2 grid-cols-4 place-items-center text-5xl">
      <div
        class="w-full p-2 rounded-lg"
        :key="icon"
        v-for="icon in icons"
        :class="{ 'border bg-accent/20 border-accent' : activeIcon === icon }"
        @click="emit('selectIcon', icon)"
      >
        <UiIcon
          :icon="icon"
          color="rgb(var(--colorIcon))"
        />
      </div>
    </div>
  </template>
</UiModal>
</template>
