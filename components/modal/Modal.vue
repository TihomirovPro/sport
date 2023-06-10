<script setup lang="ts">
defineProps<{
  isShow: boolean
}>()

const emits = defineEmits(['hiden'])
</script>

<template lang="pug">
Transition
  .modal.size-full.flex-center(
    v-if="isShow"
    @click.self="emits('hiden')"
  )
    .modal__container.max-w-2xl
      slot
</template>

<style lang="stylus" scoped>
.v-enter-active
.v-leave-active
  transition opacity 0.15s ease

.v-enter-from
.v-leave-to
  opacity: 0
.modal
  z-index 110
  position fixed
  top 0
  left 0
  background rgba(0,0,0,.7)

  &__container
    max-height 100%
    overflow auto
    display grid
    gap 16px
    width 90%
    padding 24px 15px
    background #fafafa
    border-radius 10px
</style>