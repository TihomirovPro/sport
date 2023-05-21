<script setup>
const emits = defineEmits(['hiden'])

const props = defineProps({
  isShow: false
})

const closeModal = () => {
  emits('hiden')
}
</script>

<template lang="pug">
Transition
  .modal(
    v-if="isShow"
    @click.self="emits('hiden')"
  )
    .modal__container
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
  width 100%
  height 100%
  display flex
  align-items center
  justify-content center
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