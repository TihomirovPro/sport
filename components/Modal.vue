
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
.modal
  z-index 100
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