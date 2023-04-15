<script setup>
const allExercises = useAllExercises()
const selectUpdateExercise = useSelectUpdateExercise()
const isShowModal = useShowModal()
const isShowMenu = useShowMenu()
const key = ref('add')

const showModal = () => {
  if (!isShowMenu.value) {
    key.value = 'add'
    isShowModal.value = !isShowModal.value
    selectUpdateExercise.value = ''
  } else {
    isShowMenu.value = false
  }
}

const updateModal = (id) => {
  key.value = id
  isShowModal.value = true
}
</script>

<template lang="pug">
.exercisesList
  ModalExercise(:key="key")
  .exercisesList__items
    Exercise(
      v-for="item in allExercises"
      :key="item.name"
      :name="item.name"
      :color="item.color"
      :icon="item.icon"
      :id="item.id"
      @update="updateModal(item.id)"
    )
  button.exercisesList__btn(
    :class="{ close: isShowModal || isShowMenu }"
    @click="showModal"
  )
</template>
    
<style lang="stylus" scoped>
.exercisesList
  height 100%

  &__items
    height 100vh
    padding 0 0 120px
    overflow auto

  &__btn
    z-index 120
    position fixed
    right 10px
    bottom 10px
    width 50px
    height 50px
    background #5182dc
    display flex
    align-items center
    justify-content center
    border-radius 50%
    box-shadow 0 0 10px rgba(darken(#5182dc, 30%), .6)
    transition: .3s

    &.close
      transform: rotate(-45deg)

    &:before
    &:after
      position absolute
      content: ''
      display block
      background #fafafa

    &:before
      width 20px
      height 2px
    &:after
      height 20px
      width 2px
</style>
