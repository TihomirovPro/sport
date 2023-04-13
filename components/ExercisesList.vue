<script setup>
const selectUpdateExercises = useSelectUpdateExercises()
const allExercises = useAllExercises()
const isShowModal = useShowModal()
const key = ref('add')

const showModal = () => {
  key.value = 'add'
  isShowModal.value = !isShowModal.value
  selectUpdateExercises.value = ''
}

const updateModal = (id) => {
  key.value = id
  selectUpdateExercises.value = allExercises.value.find(item => item.id === id)
  isShowModal.value = true
}

const active = async (id) => {
  const activeExercise = useActiveExercise()
  const activeUser = useActiveUser()
  activeExercise.value = id
  getWorkouts(activeUser.value, id)
}
</script>

<template lang="pug">
.exercisesList
  ExercisesModal(:key="key")
  .exercisesList__items
    .exercisesList__item(v-for="item in allExercises" :key="item.name")
      .exercisesList__icon {{ item.name[0] }}
      NuxtLink(
        class="exercisesList__link"
        @click="active(item.id)"
        :to="`/exercise-${item.name}`"
      ) {{item.name}}
      svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" @click="updateModal(item.id)")
        path(fill="#5182dc" d="m497 312-47-37a185 185 0 0 0 0-38l47-37c8-7 11-19 5-30l-49-84c-5-10-16-15-28-10l-56 22c-10-8-21-14-33-19l-8-59c-2-12-11-20-23-20h-98c-12 0-21 8-23 19l-8 60c-11 5-22 11-33 19L87 76c-10-4-23 0-28 10l-49 84c-6 10-4 23 5 30l47 37a186 186 0 0 0 0 38l-47 37c-8 7-11 19-5 30l49 84c5 10 16 15 28 10l56-22c10 8 21 14 33 19l8 59c2 12 11 20 23 20h98c12 0 21-8 23-19l8-60c11-5 22-11 33-19l56 22a23 23 0 0 0 8 2c9 0 16-5 20-12l49-85c6-10 3-22-5-29zm-241 29a85 85 0 1 1 0-171 85 85 0 0 1 0 171z")
  //- .exercisesList__actions
  button.exercisesList__btn(
    :class="{ close: isShowModal }"
    @click="showModal"
  )
</template>
    
<style lang="stylus" scoped>
.exercisesList
  height 100%

  &__items
    height calc(100vh - 75px - 50px)
    overflow auto

  &__item
    display grid
    grid-template-columns 50px 1fr 24px
    gap 20px
    align-items center
    padding 0 12px
    border-bottom: 1px solid rgba(#dcdcdc,.5)

  &__icon
    display flex
    align-items center
    justify-content center
    color: #fff
    font-size 24px
    width 50px
    height 50px
    background #5182dc
    border-radius 50%

  &__link
    padding 24px 0
    color #5182dc
    font-size 20px
    cursor pointer

  // &__actions
  //   position fixed
  //   left 0
  //   bottom 0
  //   padding 15px
  //   display grid
  //   grid-template-columns 1fr 42px
  //   gap 10px
  //   width 100%
  //   background #fafafa
  //   border-top: 1px solid rgba(#dcdcdc,1)

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