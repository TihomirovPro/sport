
<script setup>
const isShowModal = useShowModal()
const emits = defineEmits(['hiden'])

const closeModal = () => {
  isShowModal.value = false
  emits('hiden')
}
</script>

<template lang="pug">
Transition
  .modal(
    v-if="isShowModal"
    @click.self="closeModal"
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
    display grid
    gap 16px
    width 90%
    padding 24px 15px
    background #fafafa
</style>