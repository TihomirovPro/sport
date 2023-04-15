<script setup>
const allWorkouts = useWorkouts()
const isActiveFilters = useActiveFilters()
const selectUpdateWorkout = useSelectUpdateWorkout()
const isShowModal = useShowModal()
const key = ref('add')

const showModal = () => {
  isShowModal.value = !isShowModal.value
  selectUpdateWorkout.value = ''
  key.value = 'add'
}

const updateModal = (id) => {
  isShowModal.value = !isShowModal.value
  key.value = id
}
</script>

<template lang="pug">
.detail
  ModalWorkout(:key="key")
  .detail__content(v-if="allWorkouts")
    template(v-for="item in allWorkouts")
      Workout(
        v-if="!isActiveFilters"
        :key="item.id"
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :ease="item.ease"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
        @update="updateModal(item.id)"
      )
      Workout(
        v-else-if="item.filter"
        :key="item.id"
        :id="item.id"
        :date="item.date"
        :interval="`В ${item.interval} мин`"
        :ease="item.ease"
        :approach="item.approach"
        :weight="item.weight"
        :desc="item.desc"
        :res="item.res"
        @update="updateModal(item.id)"
      )
  button.detail__actions(
    @click="showModal"
    :class="{ close: isShowModal }"
  )
</template>

<style lang="stylus" scoped>
.detail
  height 100%

  &__content
    display grid
    gap 24px
    max-height 100%
    padding 15px 15px 120px
    overflow auto

  &__actions
    z-index 101
    position fixed
    width 50px
    height 50px
    display flex
    align-items center
    justify-content center
    font-size 50px
    border-radius 50%
    background #5182dc
    bottom 10px
    right 10px
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
    