<script setup lang="ts">
const slots = useSlots()

defineProps<{ isShow: boolean }>()

const emits = defineEmits<{ hiden: [] }>()
</script>

<template lang="pug">
Transition
  .size-full.flex-center.top-0.left-0.fixed.z-50(
    v-if="isShow"
    class="bg-[rgba(0,0,0,.7)]"
    @click.self="emits('hiden')"
  )
    .grid.gap-4.max-w-2xl.py-6.px-4.max-h-full.overflow-auto.rounded-lg(
      class="w-11/12 bg-[#fafafa]"
    )
      slot(name="content")

      .grid.grid-flow-col.place-items-center.gap-5.mt-4(v-if="slots.bottom")
        slot(name="bottom")
</template>

<style lang="stylus" scoped>
.v-enter-active
.v-leave-active
  transition opacity 0.15s ease

.v-enter-from
.v-leave-to
  opacity: 0
</style>