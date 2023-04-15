<script setup>
const props = defineProps({
  name: String,
  color: { type: String, default: '#5182dc' },
  icon: { type: String, default: '' },
  id: String,
})

const allExercises = useAllExercises()
const isShowModal = useShowModal()
const updateExercise = useSelectUpdateExercise()
const activeExercise = useActiveExercise()
const activeUser = useActiveUser()

const updateModal = () => {
  updateExercise.value = allExercises.value.find(item => item.id === props.id)
  isShowModal.value = true
}

const active = async () => {
  activeExercise.value = props.id
  getWorkouts(activeUser.value, props.id)
}
</script>

<template lang="pug">
.exercise
  .exercise__block(
    :style="`background: ${color}`"
    @click="updateModal"
  )
    .exercise__text(v-if="!icon") {{ name[0] }}
    .exercise__icon(v-else :class="`icon-${icon}`")

  NuxtLink(
    class="exercise__link"
    @click="active"
    :to="`/exercise-${name}`"
  ) {{ name }}
</template>
    
<style lang="stylus" scoped>
.exercise
  display grid
  grid-template-columns 50px 1fr
  gap 20px
  align-items center
  padding 0 12px

  &__block
    display flex
    align-items center
    justify-content center
    color: #fff
    font-size 40px
    padding 4px
    width 50px
    height 50px
    background #5182dc
    border-radius 10px
    text-transform uppercase

  &__text
    font-size 24px

  &__link
    padding 24px 0
    color #5182dc
    font-size 20px
    cursor pointer
    border-bottom: 1px solid rgba(#dcdcdc,.5)
</style>
