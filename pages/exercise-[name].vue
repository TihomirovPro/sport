<script setup>
const allWorkouts = useWorkouts()
const showAddModal = ref(false)
const key = ref('add')

const showModal = () => {
  showAddModal.value = !showAddModal.value
  key.value = 'add'
}

const updateModal = () => {
  showAddModal.value = !showAddModal.value
  key.value = 'update'
}
</script>

<template lang="pug">
.detail
  WorkoutModal(
    :key="key"
    :show="showAddModal"
    @hiden="showModal()"
  )
  .detail__content
    Exercise(
      v-if="allWorkouts"
      v-for="(item, i) in allWorkouts"
      :key="i"
      :id="item.id"
      :date="item.date"
      :interval="`В ${item.interval} мин`"
      :ease="item.ease"
      :approach="item.approach"
      :weight="item.weight"
      :desc="item.desc"
      :res="item.res"
      @update="updateModal()"
    )
  button.detail__actions(
    @click="showModal()"
    :class="{ close: showAddModal }"
  )
</template>

<style lang="stylus" scoped>
.v-enter-active
.v-leave-active
  transition opacity 0.15s ease

.v-enter-from
.v-leave-to
  opacity: 0

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
    