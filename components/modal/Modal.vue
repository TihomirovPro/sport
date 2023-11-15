<script setup lang="ts">
defineProps<{ isShow: boolean }>()

const emit = defineEmits<{ hiden: [] }>()

const slots = useSlots()
</script>

<template lang="pug">
Transition
  .size-full.top-0.left-0.fixed.flex(
    v-if="isShow"
    class="bg-[rgba(0,0,0,.7)] z-[100]"
    @click.self="emit('hiden')"
  )
    .grid.gap-4.py-5.px-2.rounded-t-lg(
      class="w-full h-[50%] bg-[rgb(var(--colorBg))] mt-auto"
    )
      .overflow-auto.rounded-lg.py-5.px-3
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