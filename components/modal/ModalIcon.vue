<script setup lang="ts">
defineProps<{
  isShow: boolean
  activeIcon: string | undefined
}>()

const emit = defineEmits<{
  hiden: []
  selectIcon: [icon: string]
}>()

const icons = useIcons()
</script>

<template lang="pug">
Modal(:isShow="isShow" @hiden="emit('hiden')")
  template(#content)
    .grid.gap-2.grid-cols-5.place-items-center.text-5xl.-mx-3.-my-5
      .w-full.p-2.rounded-lg(
        :key="icon"
        v-for="icon in icons"
        :class="{ 'border bg-[#5182dc]/20 border-[#5182dc]' : activeIcon === icon }"
        @click="emit('selectIcon', icon)"
      )
        Icon(
          :icon="icon"
          color="#000"
        )
</template>