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
    .grid.gap-2.grid-cols-4.place-items-center.text-5xl.-mx-3.-my-5
      .w-full.p-2.rounded-lg(
        :key="icon"
        v-for="icon in icons"
        :class="{ 'border bg-accent/20 border-accent' : activeIcon === icon }"
        @click="emit('selectIcon', icon)"
      )
        Icon(
          :icon="icon"
          color="rgb(var(--colorIcon))"
        )
</template>