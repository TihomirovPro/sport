<script setup lang="ts">
import type { TypeExercise } from "../composables/types"

const props = withDefaults(defineProps<TypeExercise>(), {
  color: '#5182dc'
})

const allExercises = useAllExercises()
const isShowModalExercise = useShowModalExercise()
const updateExercise = useSelectUpdateExercise()
const activeExercise = useActiveExercise()
const activeUser = useActiveUser()

function updateModal() {
  updateExercise.value = allExercises.value.find(item => item.id === props.id)
  isShowModalExercise.value = true
}

async function active() {
  activeExercise.value = props.id
  getWorkouts(props.id)
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
