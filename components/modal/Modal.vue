<script setup lang="ts">
defineProps<{ isShow: boolean }>()

const emit = defineEmits<{ hiden: [] }>()

const slots = useSlots()
</script>

<template>
<Transition>
  <div
    v-if="isShow"
    class="size-full top-0 left-0 fixed flex bg-[rgba(0,0,0,.7)] z-[100]"
    @click.self="emit('hiden')"
  >
    <div
      class="overflow-auto grid gap-4 py-5 px-3 rounded-t-lg w-full mt-auto bg-[rgb(var(--colorBg))] max-h-[80%]"
    >
      <slot name="content" />

      <div class="grid grid-flow-col place-items-center gap-5 mt-4" v-if="slots.bottom">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.15s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>