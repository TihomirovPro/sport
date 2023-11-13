<script setup lang="ts">
import type { TypeWorkoutPage } from '~/composables/types'

const props = defineProps<TypeWorkoutPage>()

const router = useRouter()
const allWorkouts = useWorkouts()
const selectUpdateWorkout = useSelectUpdateWorkout()

const formatDate = computed(() => {
  return Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(props.date)).slice(0, -3)
})

function selectUpdate() {
  selectUpdateWorkout.value = allWorkouts.value.find(item => item.id === props.id)
  router.push('/workout')
}
</script>

<template lang="pug">
.exercise.grid.w-full.gap-3.py-4.px-3.text-xs
  .exercise__top
    p {{ formatDate }}
    p {{ approach.length }} x {{ interval }}
    p {{ ease === EnumEase.rubber ? rubber : ease }}

  //- .exercise__approach
  //-   span(v-for="i in approach.length") {{ i }}
  //-   span
  .exercise__approach
    span(
      v-for="item in approach"
    ) {{ item }}
    span.exercise__all {{ res }}

  .exercise__weight(v-if="weight")
    span(
      v-for="item in weight"
    ) {{ item }}
    span.exercise__all 

  .exercise__desc(v-if="desc") {{ desc }}

  .exercise__bottom
    div(@click="selectUpdate")
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 511" width="20" height="20"><path fill="#5182dc" d="M405 256c-11 0-21 10-21 22v170c0 12-10 22-21 22H64c-12 0-21-10-21-22V150c0-12 9-22 21-22h171a21 21 0 1 0 0-42H64c-35 0-64 29-64 64v298c0 36 29 64 64 64h299c35 0 64-28 64-64V278c0-12-10-22-22-22zm0 0"/><path fill="#5182dc" d="M200 237a11 11 0 0 0-3 5l-15 76c-1 3 0 7 3 10a11 11 0 0 0 7 3l3-1 75-15c2 0 4-1 5-3l169-168-75-76zM496 16a53 53 0 0 0-75 0l-30 30 76 75 29-29a53 53 0 0 0 0-76zm0 0"/></svg>
</template>

<style lang="stylus" scoped>
.exercise
  border-radius 12px
  background #fafafa
  border 1px solid rgba(#dcdcdc,.5)
  box-shadow 0 0 5px rgba(#5182dc, .2)

  &__top
    display grid
    grid-template-columns repeat(auto-fit, minmax(0, 1fr))
    text-align center
    align-items center
    color darken(rgba(#5182dc, 1), 30%)

  &__approach
  &__weight
    display grid
    grid-template-columns repeat(auto-fit, minmax(0, 1fr))
    padding 12px 0 0
    text-align center
    border-top 1px solid rgba(#dcdcdc,.6)
    
    span:not(:first-child)
      border-left 1px solid rgba(#dcdcdc,.6)

  &__desc
    padding 12px
    color rgba(#262626, .8)
    border-top 1px solid rgba(#dcdcdc,.6)

  &__bottom
    display flex
    justify-content flex-end
    padding 12px 0 0
    border-top 1px solid rgba(#dcdcdc,.6)

  &__all
    font-size 14px
    font-weight 700
    color red
    text-align right
</style>