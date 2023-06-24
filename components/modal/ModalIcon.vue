<script setup lang="ts">
defineProps<{
  isShow: boolean
  activeIcon: string | undefined
}>()

const emits = defineEmits<{
  hiden: []
  selectIcon: [icon: string]
}>()

const icons = useIcons()
</script>

<template lang="pug">
Modal(:isShow="isShow" @hiden="emits('hiden')")
  template(#content)
    .grid.grid-cols-5.place-items-center.text-5xl.-mx-3.-my-5
      .transition.border.border-transparent.bg-transparent.rounded(
        v-for="icon in icons"
        :class="[`icon-${icon}`, { 'border-[#5182dc] bg-[#5182dc]/30':  activeIcon === icon }]"
        @click="emits('selectIcon', icon)"
      )
</template>